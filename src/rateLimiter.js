module.exports.RateLimiter = RateLimiter;

RateLimiter.constructor = RateLimiter;

function RateLimiter(redisPORT, redisIP, redisOptions) {
  //Closure Properties
  var redis = require('redis');

  //--------------
  //Public Methods
  //---------------
  this.authorizeRequest = function(APIname, usr, mainCallback){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    
    redisClient.HGETALL(APIname + ' Settings', function(err, reply){
      if (err){console.log(err);}
      var APIOptions = reply;

      //Check both limits
      if (APIOptions.globalLimit && APIOptions.perUserLimit){
        checkGlobalLimit(APIOptions, function(response){
          if (response !== true){
            console.log('Global Limit Exceeded for API: ', APIname);
            mainCallback(false);
          }else{
            checkPerUserLimit(APIOptions, usr, function(response){
              if (response !== true){
                console.log('Per User Limit Exceeded for API: ', APIname, 'and user: ', usr);
                mainCallback(false);
              }else{
                mainCallback(true);
              }
            });
          }
        });

      //Check Global only
      }else if (APIOptions.globalLimit){
        checkGlobalLimit(APIOptions, function(response){
          if (response !== true){
            console.log('Global Limit Exceeded for API: ', APIname);
            mainCallback(false);
          }else{
            mainCallback(true);
          }
        });

      //Check per-user limit only
      }else if (APIOptions.perUserLimit){
        checkPerUserLimit(APIname, usr, function(response){
          if (response !== true){
            console.log('Per User Limit Exceeded for API: ', APIname, 'and user: ', usr);
            mainCallback(false);
          }else{
            mainCallback(true);
          }
        });

    //No limits set->approve
      }else{
        console.log('No limits set for API: ', APIname);
        mainCallback(true);
      }
    });
  };

  this.setPerUserLimit = function(APIname, limit, timeWindow){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    //Schema of APIOptions hash table in redis
    var APIOptions = {
      "APIOptionsHashTableName": APIname + ' Settings',
      "APIname": APIname,
      "perUserLimit" : limit,
      "perUserLimitTimeWindow" : timeWindow
    };
    //store each api's info in a hash table in redis named APIName Settings
      redisClient.HMSET(APIOptions.APIOptionsHashTableName , 'APIname', APIname, 'perUserLimit', APIOptions.perUserLimit, 'perUserLimitTimeWindow', APIOptions.perUserLimitTimeWindow);
  };

  this.setGlobalLimit = function(APIname, limit, timeWindow){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    //Schema of APIOptions hash table in redis
    var APIOptions = {
      "APIname": APIname,
      "APIOptionsHashTableName": APIname + ' Settings',
      "globalLimit" : limit,
      "globalTrackerListName" : APIname + ' global limit tracker list',
      "globalLimitTimeWindow" : timeWindow
    };
    //store each api's info in a hash table in redis named '<APIname>+ Settings'
    redisClient.HMSET(APIOptions.APIOptionsHashTableName, 'APIname', APIname,'globalLimit', APIOptions.globalLimit, 'globalLimitTimeWindow', APIOptions.globalLimitTimeWindow, 'globalTrackerListName', APIOptions.globalTrackerListName);
  };

  //--------------
  //Private Helper Functions
  //-------------
  function checkGlobalLimit(APIOptions, callback){

    checkListNotAtLimit(APIOptions.globalTrackerListName, APIOptions.globalLimit, APIOptions.globalLimitTimeWindow, callback);

  }

  function checkPerUserLimit(APIOptions, usr, callback){

    checkListNotAtLimit(APIOptions.APIname+usr, APIOptions.perUserLimit, APIOptions.perUserLimitTimeWindow, callback);
  }

  function checkListNotAtLimit (listName, limit, timeWindow, callback){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);

    //Check list length
    redisClient.LLEN(listName, function(err, response){
      if (err){console.log(err);}
      
      //if length below limit, approve
      if (response <= limit){
        callback(true);
        //Push time of new, approved call to list:
        redisClient.RPUSH(listName, new Date.getTime());

      //Otherwise, clean list of expired calls (> timeWindow old)
      //and check new length, approving or denying request accordingly
      }else{
        popDirtyItems(listName, timeWindow, function(lengthAfterPops){
          if (lengthAfterPops <= limit){
            callback(true);
            //Push time of new, approved call to list:
            redisClient.RPUSH(listName, new Date.getTime());
          }else{
            callback(false);
          }
        });
      }

      //clean list after every check
      //!!May be a better place to do this if performance becomes an issue
      popDirtyItems(listName, timeWindow);

      redisClient.quit();
    });
  }

  //Private Subroutines
  function popDirtyItems(listName, timeWindow, listCleanedCB){
    var async = require('async');
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    var lastPoppedItemTime;
    var newLength;

    //Async Loop:  pop head off list until popped item is within timeWindow old.
    //then push it back on, and return new list length
    async.doWhilst(
      function popEarliestItem(asyncCallback){
        redisClient.LPOP(listName, function(err, response){
          if (err){console.log(err);}
          lastPoppedItemTime = response;
          asyncCallback(err);
        });
      },
      function testIfWithinWindow(){
        var now = new Date().getTime();
        return (now - lastPoppedItemTime) >= timeWindow;
      },
      function doneCleaning(err){
        if (err){console.log(err);}
        redisClient.LPUSH(listName, lastPoppedItemTime);
        redisClient.quit();
        if (listCleanedCB){listCleanedCB(newLength);}
      }
    );
  }

//
//not currently used:
//
  function getAPIOptions(APIname, callback){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    redisClient.HGETALL(APIname + ' Settings', function(err, relpy){
      if (err){console.log(err);}
      callback(reply);
      redisClient.quit();
    });
  }

//apparently not needed
//--counter to documentation, redis hashes seem to come back as parsed objects, not [key, value, key, value] arrays
  function parseRedisHash(array){
    var results = {};
    for (var i = 0; i < array.length; i+=2) {
      results[arr[i]] = array[i+1];
    }
    return results;
  }
}

