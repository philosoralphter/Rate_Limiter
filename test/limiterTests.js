var should = require('should');

describe ('RateLimiter.js', function(){
  var redis = require('redis');
  var RL = require('../src/rateLimiter.js');

  describe ('RateLimiter Constructor', function(){
    it('should work with no arguments', function(done){
      var rateLimiter = new RL.RateLimiter();
      rateLimiter.should.be.ok;
      rateLimiter.should.be.an.Object;
      rateLimiter.should.be.an.instanceOf(RL.RateLimiter);
      done();
    });

    it ('Returns a rateLimiter instance with required public methods', function(done){
      var rateLimiter = new RL.RateLimiter();
      rateLimiter.should.be.ok;
      rateLimiter.should.have.properties('authorizeRequest', 'setPerUserLimit', 'setGlobalLimit');
      done();
    });
  });

  describe('RateLimiter Public Methods:', function(){
    var rateLimiter = new RL.RateLimiter(6379, 'localhost', {});
    var redisClient = redis.createClient(6379, 'localhost', {});
    

    describe('rateLimiter.setPerUserLimit(): ', function(){
      rateLimiter.setPerUserLimit('usertestAPI', 10, 1000);
      
      it('should leave a hash/object with appropriate properties in redis database under "APIname + Settings"', function(done){
        redisClient.HGETALL('usertestAPI Settings', function(err, response){
          if (err){
            console.log(err);
            throw err;
          }
          response.should.be.ok;
          response.should.be.an.Object;
          response.should.not.be.empty;
          response.should.have.keys("APIname", "perUserLimit", "perUserLimitTimeWindow");
          response.APIname.should.eql("usertestAPI");
          response.perUserLimit.should.eql("10");
          response.perUserLimitTimeWindow.should.eql("1000");
          done();
        });
      });
    });


    describe('rateLimiter.setGlobalLimit(): ', function(){
      rateLimiter.setGlobalLimit('globaltestAPI', 500, 10000);

      it('should leave a hash/object with appropriate properties in redis database under "APIname + Settings"', function(done){
        redisClient.HGETALL('globaltestAPI Settings', function(err, response){
          if (err){
            console.log(err);
            throw err;
          }
          response.should.be.ok;
          response.should.be.an.Object;
          response.should.not.be.empty;
          response.should.have.keys("APIname", "globalTrackerListName", "globalLimitTimeWindow", "globalLimit");
          response.APIname.should.eql("globaltestAPI");
          response.globalLimit.should.eql('500');
          response.globalLimitTimeWindow.should.eql('10000');
          response.global
          done();
        });
      });
    });


    describe('rateLimiter.authorizeRequest(): ', function(){
      
      it ('should return a boolean', function (done){
        rateLimiter.authorizeRequest('usertestAPI', 'testUser', function(err, isAllClear){
          isAllClear.should.be.a.Boolean;
          isAllClear.should.be.true;
        });
        done();
      });
      
      it ('should deny requests made in excess of a per user limit without a global limit set', function (done){
        var limiterResponses = {
          total : 0,
          allow : 0,
          deny : 0
        };  

        this.timeout(2500);
        rateLimiter.setPerUserLimit('testAPI', 4, 1000);

        //Make 10 requests in two seconds--limit set above is 4/second
        var requestInterval = setInterval(function(){
          rateLimiter.authorizeRequest('testAPI', "APIkeyOrIPAddressHereforUser1", function(err, response){
            limiterResponses.total++;
            if (response === true){
              limiterResponses.allow++;
            }else if (response === false){
              limiterResponses.deny++;
            }
          });
        }, 200);

        setTimeout(function(){
          clearInterval(requestInterval);

          limiterResponses.allow.should.be.below(9);
          limiterResponses.deny.should.be.above(1);

          done();
        }, 2000);
      });


      it ('should deny requests made in excess of a global limit without a per user limit set', function (done){
        var limiterResponses = {
          total : 0,
          allow : 0,
          deny : 0
        };  

        this.timeout(2500);
        rateLimiter.setGlobalLimit('testAPI2', 7, 1000);

       //Make 20 requests in two seconds--limit set above is 7/second
       var requestInterval = setInterval(function(){
          rateLimiter.authorizeRequest('testAPI2', null, function(err, response){
            limiterResponses.total++;
            if (response === true){
              limiterResponses.allow++;
            }else if (response === false){
              limiterResponses.deny++;
            }
          });
        }, 100);

        setTimeout(function(){
          clearInterval(requestInterval);

          limiterResponses.allow.should.be.below(16);
          limiterResponses.deny.should.be.above(3);

          done();
        }, 2000);
      }); 

      it ('should deny requests made in excess of a global limit or per user limit with both limits set', function (done){
        var limiterResponsesUserA = {
          total : 0,
          allow : 0,
          deny : 0
        };  

        var limiterResponsesUserB = {
          total : 0,
          allow : 0,
          deny : 0
        };  

        this.timeout(2500);

       //Make 40 mock requests in two seconds--limit set above is 4/second per user and 7/second global
       var requestInterval = setInterval(function(){
          
          rateLimiter.authorizeRequest('testAPI2', 'userA', function(err, response){
            limiterResponsesUserA.total++;
            if (response === true){
              limiterResponsesUserA.allow++;
            }else if (response === false){
              limiterResponsesUserA.deny++;
            }
          });

          rateLimiter.authorizeRequest('testAPI2', 'userB', function(err, response){
            limiterResponsesUserB.total++;
            if (response === true){
              limiterResponsesUserB.allow++;
            }else if (response === false){
              limiterResponsesUserB.deny++;
            }
          });

        }, 100);

        setTimeout(function(){
          clearInterval(requestInterval);

          limiterResponsesUserA.allow.should.be.below(10);
          limiterResponsesUserA.deny.should.be.above(9);

          limiterResponsesUserB.allow.should.be.below(10);
          limiterResponsesUserB.deny.should.be.above(9);

          done();
        }, 2000);
      }); 



    });

    after(function(){
      redisClient.quit();
    });
  });
});
