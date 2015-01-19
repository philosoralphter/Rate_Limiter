var http = require('http');
var RL = require('../../src/rateLimiter');

var rateLimiter = new RL.RateLimiter();
var serverName = 'rate_limiter test API Server';


var APIUserAccounts = {
  userA : 'asdf1234',
  userB : 'jkl;5678;'
}

//configure rateLimiter:
rateLimiter.setPerUserLimit(serverName, 20, 60000); //20 per user per minute
rateLimiter.setGlobalLimit(serverName, 100, 3600000); //100 per hour





//Make requests at interval to /testRoute1 if rateLimiter clears them
setInterval(function(){
  sendRequest(serverName, APIUserAccounts.userA);
}, 2500);

setInterval(function(){
  sendRequest(serverName, APIUserAccounts.userB);
}, 4000);


function sendRequest(serverName, user){
  var requestOptions = {
    hostname: 'localhost',
    port: 50624,
    path: '/testRoute1',
    method: 'GET'
  };

  var request = http.request(requestOptions, function(response){
    response.on('data', function (chunk) {
        console.log('Server Response: ' + chunk);
      });
  });

  request.on('error', function(err) {
  console.log('Request Error: ' + err.message);
  });

  //first, authorize request:
  rateLimiter.authorizeRequest(serverName, user, function(isAllClear){
    
    //Request is authorized, send request
    if (isAllClear){
      request.end();  
      console.log('Sending request to server for user: ', user);
    
    //Request not authorized, do not send 
    }else{
      console.log('Not sending request to API server.  Rate limited for user: ', user);
    }
  });

}
