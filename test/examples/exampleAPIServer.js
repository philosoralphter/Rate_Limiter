var restify = require('restify');
var RL = require('../src/rateLimiter');

//
//Server which limits outgoing requests
//
var PORT = 50624; //PORT || process.env.PORT;
var serverName = 'rate_limiter test API Server';
var server = restify.createServer({"name": serverName});
var rateLimiter = new RL.RateLimiter();

//configure rateLimiter:
rateLimiter.setPerUserLimit(serverName, 20, 60000); //20 per user per minute
rateLimiter.setGlobalLimit(serverName, 100, 3600000); //100 per hour
//Respond to testRoute1
server.get('/testRoute1', function (req, res, next){
  var userIP = req.headers['x-forwarded-for'];

  //first, authorize request:
  rateLimiter.authorizeRequest(serverName, userIP, function(isAllClear){
    
    //Request is authorized, send response
    if (isAllClear){
      res.send(200, "Here is your data!!!");
      console.log('server has authorized a request from and responded to: ', userIP);
    
    //Request not authorized, send 
    }else{
      res.send(403, 'Forbidden.  Perhaps you have exceeded your limit for this API, or perhaps the global limit has been exceeded.');
      console.log('server has denied a request from: ', userIP);
    }
  });
});

server.listen(PORT);
console.log (serverName, 'started and listening on port', PORT);
