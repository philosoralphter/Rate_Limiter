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
        rateLimiter.authorizeRequest('usertestAPI', 'testUser', function(isAllClear){
          isAllClear.should.be.a.Boolean;
        });
        done();
      });
      
    });
  });
});
