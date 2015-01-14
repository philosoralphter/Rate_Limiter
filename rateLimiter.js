module.exports.RateLimiter = RateLimiter;


function RateLimiter(redisPORT, redisIP, redisOptions) {
  var redis = require('redis');
  var shouldAuthenticate = redisOptions.hasOwnProperty('password') ? true : false;
  var redisPassword = redisOptions.password || null;

  //--------------
  //Public Methods
  //---------------
  this.authorizeRequestAsync = function(APIname, usr, mainCallback){
    var allClear;
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    
    rediClient.HGETALL(APIname + ' Settings', function(err, reply){
      if (err){console.log(err);}
      var APIOptions = reply;

      if (APIOptions.globalLimit && APIOptions.perUserLimit){
        checkGlobalLimit(APIname, function(err, response){
          if (err){console.log(err);}
          if (response != true){
            console.log('Global Limit Exceeded for API: ', APIname);
            mainCallback(false);
          }else{
            checkPerUserLimit(APIname, usr, function(err, response){
              if (err){console.log(err);}
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
        checkGlobalLimit(APIname, function(err, response){
          if (err){console.log(err);}
          if (response != true){
            console.log('Global Limit Exceeded for API: ', APIname);
            mainCallback(false);
          }else{
            mainCallback(true);
          }
        });
      }else if (APIOptions.perUserLimit){
        checkPerUserLimit(APIname, usr, function(err, response){
          if (err){console.log(err);}
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
    var apiOptions = {
      "APIOptionsHashTable": APIname + ' Settings',
      "perUserLimit" : limit,
      "perUserLimitTimeWindow" : timeWindow
    }
    //store each api's info in a hash table in redis named APIName Settings
    authorizeRedisConnection(redisClient, function(){
      redisClient.HMSET(apiOptions.APIOptionsHashTable , 'globalLimit', apiOptions.globalLimit, 'perUserLimitTimeWindow', apiOptions.perUserLimitTimeWindow);
    });
  }

  this.setGlobalLimit = function(APIname, limit, timeWindow){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);
    var apiOptions = {
      "APIOptionsHashTable": APIname + ' Settings',
      "globalLimit" : limit,
      "globalLimitTimeWindow" : timeWindow
    }
    //store each api's info in a hash table in redis named APIname Settings
    redisClient.HMSET(apiOptions.APIOptionsHashTable, 'globalLimit', apiOptions.globalLimit, 'globalLimitTimeWindow', apiOptions.timeWindow);
  }

  //Private functions
  function checkGlobalLimit(APIname, callback){
    var redisClient = redis.createClient(redisPORT, redisIP, redisOptions);

  }

  function checkUsrLimit(APIname, usr, callback){

  }
}