var restify = require('restify');


function (PORT){
  var server = restify.createServer();

  server.get('/testRoute1', function (req, res, next){

  });

  server.listen(PORT)
}
