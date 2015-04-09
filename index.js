//A proof of concept.
//No code structure whatsoever applied

var NRP = require('node-redis-pubsub')
  , config = { port: 6379       // Port of your remote Redis server
             , host: '10.129.123.83' // Redis server host, defaults to 127.0.0.1
             }
  , nrp = new NRP(config);      // This is the NRP client
require('http').globalAgent.maxSockets = 100000
var request = require('request');


nrp.on('request|*', function (data, channel) {
	var t2 = Date.now();
	var requestUUID = data.requestUUID;
	var method      = data.method;
	var host        = data.host;
	var uri         = data.uri;

	var t3 = Date.now();

	request({
		method: method,
		uri: 'http://localhost'+uri
	}, function(error, response, body){
		var t4 = Date.now();

		data.timing['t2'] = t2;
		data.timing['t3'] = t3;
		data.timing['t4'] = t4;

		nrp.emit('response|'+channel, { requestUUID: requestUUID, response: body, timing: data.timing });	
	});
});

var http = require('http');

http.createServer(function (req, res) {
	console.log(req.url+'3.'+Date.now());
	setTimeout(function(){
		res.writeHead(200, {'Content-Type': 'text/plain'});
	  	res.end('Hello World\n');
	  	console.log(req.url+'4.'+Date.now());
	}, 350);
}).listen(80);
