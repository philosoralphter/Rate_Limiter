##API Rate Limiter
This is an npm module that will allow you to instantiate a RateLimiter object in your server.  The object exposes the public methods documented below to be used for 

###Installation and Dependencies
Place the APIRateLimiter folder into your project folder, or use npm:

```shell
$ npm install --save rate_limiter
```

Next, install and run redis on your server.
[Quickstart Guide]http://redis.io/topics/quickstart

Once redis is installed, you can run it with:

```shell
$ redis-server
```

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
```javascript
var rateLimiter = new RateLimiter(6379, "localhost", {});
```

Any argument can be `null` to accept redis defaults.  To accept all redis defaults (Port: 6379, ip: localhost, no options), use constructor with no arguments.

#####redisOptions

The third parameter of the RateLimiter constructor takes a javascript object with the following notable property:

* `"auth_pass" : <string>` If your redis database is secured, place the password here.

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

##Testing

To run tests, be sure your redis server is running(`$ redis-server`), then in another shell: `$ npm test`.


For the purposes of testing, and example, a small test API server and a test API harvester can be found at test/examples/.  This server serves as an example for integrating a rateLimiter object into your node server for limitting incoming requests.  The harvester uses a very similar pattern to rate limit outgoing requests--the same limiter object works either way.

The server and harvester work in concert to demonstrate the rateLimiter.  To run them, run the following three commands in order, in three separate shells:

```shell
$ redis-server
```

```shell
$ node rate_limiter/test/examples/exampleAPIServer.js
```

```shell
$ node rate_limiter/test/examples/exampleAPIHarvester.js
```

##Roadmap
*Separate code into incoming and outgoing rate limiters.  Expose specialized objects.  Create express middlewre for incoming limiters.

*Add ability to handle request queueing in OutgoingRateLimiter.

*Create express/restify middleware.

*Simplify and streamline timeWindow parameter to allow for wide range of times in easier format.  Perhaps create a specialized datatype with ints of either seconds, minutes, hours, or days.

* Incorporate status reports as parameter to callback for authorizeRequest() so that reason for denial (global limit exceeded or user limit exceeded) is available to handling code.
