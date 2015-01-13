##API Rate Limiter
This is an npm module that will

###Installation
Place the APIRateLimiter folder into your project folder.

[Install and run redis]:http://redis.io/topics/quickstart on your server.

###Usage

####`require`
In your server or your API client, require rateLimiter.js and instantiate a rateLimiter:

```javascript
var RateLimiter = require('../path-to/rateLimiter.js');

var rateLimiter = new RateLimiter();
```

####`rateLimiter.authorizeRequest(APIname:<string>, usr:<string>)`

This function takes the name of an API being limited, and optionally, a string associated with the usr making the request.

It first checks the status of any global limits on the API and returns `false` if the limit has been reached.

It then checks the status of the user-specific limits on the API and returns `false` if the limit has been reached, or `true` if both limits are unmet.

####`rateLimiter.setPerUserLimit(APIname:<string>, limit:<integer>, timeWindow:<integer>)`

####`rateLimiter.setGlobalLimit(APIname:<string>, limit:<integer>, timeWindow:<integer>)`


###Roadmap
*Separate code into incoming and outgoing rate limiters.  Expose specialized objects.

*Add ability to handle request queueing in OutgoingRateLimiter.

*Simplify and streamline timeWindow parameter to allow for wide range of times in easier format.  Perhaps create a specialized datatype with ints of either seconds, minutes, hours, or days.