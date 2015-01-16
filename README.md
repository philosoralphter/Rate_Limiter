##API Rate Limiter
This is an npm module that will allow you to instantiate a RateLimiter object in your server.  The object exposes the public methods documented below to be used for 

###Installation
Place the APIRateLimiter folder into your project folder.

[Install and run redis]:http://redis.io/topics/quickstart on your server.

###Incoming/outgoing
RateLimiter is capable of tracking both incoming or outgoing requests.  In fact, it can be used to limit the rate of anything if you're clever.

##Usage
---
###Require rateLimiter and the RateLimiter Constructor:
In your server or your API client, require rateLimiter.js and instantiate a rateLimiter:

```javascript
var RateLimiter = require('rateLimiter');
```


####RateLimiter(redisPORT:<integer>, redisIP:<string>, redisOptions:<object>)

Instantiate a new rateLimiter object.
```
var rateLimiter = new RateLimiter(6379, localhost, {});
```
#####redisOptions

The third parameter of the RateLimiter constructor takes a javascript object with the following notable property:

*`"auth_pass" : <string>` If your redis database is secured, place the password here.

Other available properties can be found [here: https://www.npmjs.com/package/redis]:https://www.npmjs.com/package/redis in the API documentation of the npm redis module.  They should mirror the options available in the redis API for server and connection options.



###rateLimiter Methods

####rateLimiter.authorizeRequest(APIname:<string>, user:<string>, callback:<function(<boolean>)>)

This function takes the name of an API being limited, a string associated with the usr making the request.  This will likely be an IP, but not necessarily.

The third parameter takes a callback function which will be called once the rate limiter has cleared or rejected a request.

The callback will be called with a single boolean argument:  `true` if the request will not exceed the set limit, or `false` if it would.


####rateLimiter.setPerUserLimit(APIname:<string>, limit:<integer>, timeWindow:<integer>)

To initiate limit tracking for an API, use this function on its own or along with rateLimiter.setGlobalLimit().  A new API tracker will be created if APIname hasn't been added before.  

`timeWindow` should be in milliseconds.  

`limit` should be an integer.  such that the system will allow: *limit* requests per user per *timeWIndow*

####rateLimiter.setGlobalLimit(APIname:<string>, limit:<integer>, timeWindow:<integer>)

To initiate limit tracking for an API, use this function on its own or along with rateLimiter.setPerUserLimit().

`timeWindow` should be in milliseconds.  

`limit` should be an integer, such that the system will allow: *limit* global requests per *timeWindow*

###Testing
For the purposes of testing, a small test server has been created at tests/testServer.js.  This server creates and uses mock API requests to test the rateLimiter.  It also serves as an example for integrating rateLimiter with your node server.

To run tests, `$ npm test`.

###Roadmap
*Separate code into incoming and outgoing rate limiters.  Expose specialized objects.  Create express middlewre for incoming limiters.

*Add ability to handle request queueing in OutgoingRateLimiter.

*Simplify and streamline timeWindow parameter to allow for wide range of times in easier format.  Perhaps create a specialized datatype with ints of either seconds, minutes, hours, or days.
