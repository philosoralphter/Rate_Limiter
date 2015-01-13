module.exports.RateLimiter = RateLimiter;

var redis = require('redis');

function RateLimiter() = {

  //Public Methods
  this.authorizeRequest = function(APIname, usr){

  }

  this.setUsrLimit = function(APIname, limit, timeWindow){

  }

  this.setGlobalLimit = function(APIname, limit, timeWindow){

  }

  //Private functions
  function checkGlobalLimit(APIname){

  }

  function checkUsrLimit(APIname, usr){

  }
}