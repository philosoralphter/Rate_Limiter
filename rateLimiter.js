module.exports.RateLimiter = RateLimiter;


function RateLimiter(redisPORT, redisIP, redisOptions) = {
  var redis = require('redis');
  var shouldAuthenticate = redisOptions.hasOwnProperty('password') ? true : false;
  var redisPassword = redisOptions.password || null;

  //--------------
  //Public Methods
  //---------------
  this.authorizeRequest = function(APIname, usr, callback){
    var redisClient = redis.createClient();

  }

  this.setPerUserLimit = function(APIname, limit, timeWindow){
    var redisClient = redis.createClient();
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
    var redisClient = redis.createClient();
    var apiOptions = {
      "APIOptionsHashTable": APIname + ' Settings',
      "globalLimit" : limit,
      "globalLimitTimeWindow" : timeWindow
    }
    //store each api's info in a hash table in redis named APIName Settings
    redisClient.HMSET(apiOptions.APIOptionsHashTable, 'globalLimit', apiOptions.globalLimit, 'globalLimitTimeWindow', apiOptions.timeWindow);
  }

  //Private functions
  function checkGlobalLimit(APIname){

  }

  function checkUsrLimit(APIname, usr){

  }

  function authorizeRedisConnection(client, callback){
    if (shouldAuthenticate){
      client.auth(redisPassword, callback);
    }else{
      callback();
    }
  }
}