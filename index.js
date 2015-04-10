//A proof of concept.
//No code structure whatsoever applied

var redis = require('redis');
var redisClient = redis.createClient(6379, '10.129.123.83');
var NRP = require('node-redis-pubsub')
  , config = { port: 6379       // Port of your remote Redis server
             , host: '10.129.123.83' // Redis server host, defaults to 127.0.0.1
             }
  , nrp = new NRP(config);      // This is the NRP client
require('http').globalAgent.maxSockets = 100000
var request = require('request');


nrp.on('request|*', function (notifyData, channel) {

	var tServiceNotify = Date.now();

	redisClient.lpop(channel+"-queue", function(err, requestUUID){

		var tServiceQueuePop = Date.now();

		redisClient.hgetall("request-"+requestUUID, function(err, requestData){

			var tServiceHashGet = Date.now();

			var method      = requestData.method;
			var host        = requestData.host;
			var uri         = requestData.uri;

			var t3 = Date.now();

			var tServiceStartHttp = Date.now();
			request({
				method: method,
				uri: 'http://localhost'+uri
			}, function(error, response, body){
				var tServiceGotHttp = Date.now();

				var timing = {};

				timing['gatewayGotRequest'] = notifyData.timing['gatewayGotRequest'];
				timing['gatewayQueuePush'] = notifyData.timing['gatewayQueuePush'];
				timing['gatewayHashSet'] = notifyData.timing['gatewayHashSet'];
				timing['serviceNotify'] = tServiceNotify;
				timing['serviceQueuePop'] = tServiceQueuePop;
				timing['serviceHashGet'] = tServiceHashGet;
				timing['serviceStartHttp'] = tServiceStartHttp;
				timing['serviceGotHttp'] = tServiceGotHttp;
				
				nrp.emit('response|'+channel, { requestUUID: requestData.requestUUID, response: body, timing: timing });	

				redisClient.del("request-"+requestUUID, function(err, reply) {
				    //console.log(reply);
				});
			});
		});
	});
});

var http = require('http');

http.createServer(function (req, res) {
	//console.log(req.url+'3.'+Date.now());
	setTimeout(function(){
		res.writeHead(200, {'Content-Type': 'text/plain'});
	  	res.end('Hello World in '+req.url+'\n');
	  	//console.log(req.url+'4.'+Date.now());
	}, 350);
}).listen(80);
