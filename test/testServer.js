var restify = require('restify');


function makeServer(PORT){
  var server = restify.createServer();

  server.get('/testRoute1', function (req, res, next){

  });

  //server.listen(PORT)
}
