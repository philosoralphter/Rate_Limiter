##API Rate Limiter
This is an npm module that will allow you to instantiate a RateLimiter object in your server.  The object exposes the public methods documented below to be used for 

###Installation and Dependencies
Place the APIRateLimiter folder into your project folder, or use npm:

```console
npm install --save rate_limiter
```

Next, install and run redis on your server.
[Quickstart Guide]http://redis.io/topics/quickstart

It is fastest to use a redis instance running locally to your server.  If you do this, and do not change redis default port, the example `redisPORT` and `redisIP` arguments given below to the `RateLimiter()` constructor will be the redis defaults.

##Usage

###Incoming/outgoing

APIRateLimiter is capable of tracking both incoming or outgoing requests.  In fact, it can be used to limit the rate of anything if you're clever.

---
###Require rateLimiter and the RateLimiter Constructor:
In your server or your API client, require rateLimiter.js and instantiate a rateLimiter:

```javascript
var RateLimiter = require('rateLimiter');
```


####RateLimiter(redisPORT:\<integer\>, redisIP:\<string\>, redisOptions:\<object\>)

Instantiate a new rateLimiter object.
```
var rateLimiter = new RateLimiter(6379, "localhost", {});
```
#####redisOptions

The third parameter of the RateLimiter constructor takes a javascript object with the following notable property:

*`"auth_pass" : <string>` If your redis database is secured, place the password here.

Other available properties can be found [here: https://www.npmjs.com/package/redis]https://www.npmjs.com/package/redis in the API documentation of the npm redis module.  They should mirror the options available in the redis API for server and connection options.



###rateLimiter Methods

####rateLimiter.authorizeRequest(APIname:\<string>, user:\<string\>, callback:\<function(\<boolean\>)\>)

This function takes the name of an API being limited, a string associated with the user making the request.  (This will likely be an IP, or an API account key), and finally, a callback.

If you are only limiting global calls, passing `null` in the place of a user string for the second argument is fine.

The third parameter takes a callback function which will be called asynchronously once the rate limiter has cleared or rejected a request.  The callback will be called with a single boolean argument:  `true` if the request would not exceed the set limit, or `false` if it would.  You should pass a function that will handle either sending, queueing, or discarding the request once it is approved or denied.  

You may find it necessary to pass a closure to maintain access to the request object in question.  This will be fixed soon with express.js middleware handling, or perhaps sooner, an optional fourth argument to `authorizeRequest()` that will accept a raw request object which it will pass untouched to the callback.


####rateLimiter.setPerUserLimit(APIname:\<string\>, limit:\<integer\>, timeWindow:\<integer\>)

To initiate limit tracking for an API, use this function on its own or along with rateLimiter.setGlobalLimit().  A new API tracker will be created if APIname hasn't been added before.  

`timeWindow` should be in milliseconds.  

`limit` should be an integer.  such that the system will allow: *limit* requests per user per *timeWIndow*

####rateLimiter.setGlobalLimit(APIname:\<string\>, limit:\<integer\>, timeWindow:\<integer\>)

To initiate limit tracking for an API, use this function on its own or along with rateLimiter.setPerUserLimit().

`timeWindow` should be in milliseconds.  

`limit` should be an integer, such that the system will allow: *limit* global requests per *timeWindow*

###Testing
For the purposes of testing, a small test server has been created at tests/testServer.js.  This server serves as an example for integrating a rateLimiter object into your node server for limitting incoming requests.  You can use a very similar pattern to rate limit outgoing requests--the limiter works either way.


To run tests, `$ npm test`.

###Roadmap
*Separate code into incoming and outgoing rate limiters.  Expose specialized objects.  Create express middlewre for incoming limiters.

*Add ability to handle request queueing in OutgoingRateLimiter.

*Create express/restify middleware.

*Simplify and streamline timeWindow parameter to allow for wide range of times in easier format.  Perhaps create a specialized datatype with ints of either seconds, minutes, hours, or days.
