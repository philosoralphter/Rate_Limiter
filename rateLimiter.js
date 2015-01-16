module.exports.RateLimiter = RateLimiter;



function RateLimiter(redisPORT, redisIP, redisOptions) {
  var redis = require('redis');
  var shouldAuthenticate = redisOptions.hasOwnProperty('password') ? true : false;
  var redisPassword = redisOptions.password || null;

  //--------------
  //Public Methods
  //---------------
  this.authorizeRequest = function(APIname, usr, mainCallback){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    
    redisClient.HGETALL(APIname + ' Settings', function(err, reply){
      if (err){console.log(err);}
      var APIOptions = parseRedisHash(reply);

      if (APIOptions.globalLimit && APIOptions.perUserLimit){
        checkGlobalLimit(APIOptions, function(response){
          if (response != true){
            console.log('Global Limit Exceeded for API: ', APIname);
            mainCallback(false);
          }else{
            checkPerUserLimit(APIOptions, usr, function(response){
              if (response != true){
                console.log('Per User Limit Exceeded for API: ', APIname, 'and user: ', usr);
                mainCallback(false);
              }else{
                mainCallback(true);
              }
            });
          }
        });
      }else if (APIOptions.globalLimit){
        checkGlobalLimit(APIOptions, function(response){
          if (response != true){
            console.log('Global Limit Exceeded for API: ', APIname);
            mainCallback(false);
          }else{
            mainCallback(true);
          }
        });
      }else if (APIOptions.perUserLimit){
        checkPerUserLimit(APIname, usr, function(response){
          if (response != true){
            console.log('Per User Limit Exceeded for API: ', APIname, 'and user: ', usr);
            mainCallback(false);
          }else{
            mainCallback(true);
          }
        });
      }else{
        console.log('No limits set for API: ', APIname);
        mainCallback(true);
      }
    });
  }

  this.setPerUserLimit = function(APIname, limit, timeWindow){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    //initiate a hash of options for each API
    var APIOptions = {
      "APIOptionsHashTableName": APIname + ' Settings',
      "APIname": APIname,
      "perUserLimit" : limit,
      "perUserLimitTimeWindow" : timeWindow
      //"usrListsHash" : APIname + ' user tracker lists'
    }
    //store each api's info in a hash table in redis named APIName Settings
      redisClient.HMSET(APIOptions.APIOptionsHashTableName , 'APIname', APIname, 'perUserLimit', APIOptions.perUserLimit, 'perUserLimitTimeWindow', APIOptions.perUserLimitTimeWindow);
  }

  this.setGlobalLimit = function(APIname, limit, timeWindow){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    //Schema of APIOptions object in redis
    var APIOptions = {
      "APIname": APIname,
      "APIOptionsHashTableName": APIname + ' Settings',
      "globalLimit" : limit,
      "globalTrackerListName" : APIname + ' global limit tracker list',
      "globalLimitTimeWindow" : timeWindow
    }
    //store each api's info in a hash table in redis named APIname Settings
    redisClient.HMSET(APIOptions.APIOptionsHashTableName, 'APIname', APIname,'globalLimit', APIOptions.globalLimit, 'globalLimitTimeWindow', APIOptions.timeWindow);
  }

  //Private functions
  function checkGlobalLimit(APIOptions, callback){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);

    checkListAtLimit(redisClient, APIOptions.globalTrackerListName, APIOptions.globalLimit, APIOptions.globalLimitTimeWindow, callback);

  }

  function checkUsrLimit(APIOptions, usr, callback){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);

    checkListAtLimit(redisClient, APIOptions.APIname+'usr', APIOptions.perUserLimit, APIOptions.perUserLimitTimeWindow, callback);
  }

  function checkListAtLimit(redisClient, listName, limit, timeWindow, callback){
    redisClient.LLEN(listName, function(err, response){
      if (err){console.log(err);}
      if (response <= limit){
        callback(true);
      }else{
        popDirtyItems(redisClient, listName, timeWindow, function(lengthAfterPops){
          if (lengthAfterPops <= limit){
            callback(true);
          }else{
            callback(false);
          }
        });
      }
      popDirtyItems(redisClient, listName, timeWindow)
      redisClient.RPUSH(listName, new Date.getTime());
    });
    callback(response);
  }

  //Private Subroutines
  function popDirtyItems(redisClient, listName, timeWindow, listCleanedCB){
    var async = require('async');
    var lastPoppedItemTime;
    var newLength;

    async.dowhilst(
      function popEarliestItem(asyncCallback){
        redisClient.LPOP(listName, function(err, response){
          if (err){console.log(err);}
          lastPoppedItemTime = response;
          asyncCallback(err);
        })
      },
      function testIfWithinWindow(){
        var now = new Date().getTime();
        return now - lastPoppedItemTime >= timeWindow;
      },
      function doneCleaning(err){
        if (err){console.log(err);}
        redisClient.RPUSH(listName, lastPoppedItemTime);
        if (listCleanedCB){listCleanedCB(newLength);}
      }
    );
  }

  function getAPIOptions(APIname, callback){
    redisClient.HGETALL(APIname + ' Settings', function(err, relpy){
      if (err){console.log(err);}
      callback(parseRedisHash(reply));
    });
  }

  function parseRedisHash(array){
    var results = {};
    for (var i = 0; i < array.length; i+=2) {
      results[arr[i]] = array[i+1];
    }
    return results;
  }
}

