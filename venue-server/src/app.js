

// Devon Rueckner
// The Human Grid
// All Rights Reserved


/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var sockjs = require('sockjs');
var dgram = require("dgram");
var fs = require("fs");


/**
 * Set up web socket server.
 */


var sockjsServer = sockjs.createServer();
var httpStreamServer = http.createServer();
var webSockets = [];

sockjsServer.on('connection', function(conn) {
	webSockets.push(conn);
	console.log("sockjsServer connection: "+webSockets.length);
    conn.on('close', function(conn) {
		webSockets.pop(conn);
		console.log("sockjsServer connection close: "+webSockets.length);
    });
});

sockjsServer.installHandlers(httpStreamServer, {prefix:'/data'});
httpStreamServer.listen(8081, function(){
	console.log("Stream server listening on port 8081");
});


/**
 * Set up Express web framework.
 */

var expressApp = express();

expressApp.configure(function(){
	expressApp.set('port', process.env.PORT || 8080);
	expressApp.set('views', __dirname + '/views');
	expressApp.set('view engine', 'hjs');
	expressApp.use(express.favicon());
	expressApp.use(express.logger('dev'));
	expressApp.use(express.bodyParser());
	expressApp.use(express.methodOverride());
	expressApp.use(expressApp.router);
	expressApp.use(require('less-middleware')({
      src: path.join(__dirname, 'public', 'css'),
      dest: path.join(process.env['HOME'], 'generated_files')
    }));
  expressApp.use(express.static(path.join(__dirname, 'public')));
  expressApp.use(express.static(path.join(process.env['HOME'], 'generated_files')));
});

expressApp.configure('development', function() {
	expressApp.use(express.errorHandler());
});

expressApp.get('/graph', routes.index);
expressApp.get('/', routes.phone);

http.createServer(expressApp).listen(expressApp.get('port'), function(){
	console.log("Web server listening on port " + expressApp.get('port'));
});



/**
 * UDP Listener
 */


var udpServer = dgram.createSocket("udp4");
var fileStream = fs.createWriteStream("./data.log");

udpServer.on("message", function (msg, rinfo) {
	var data = JSON.parse(msg);
	var isodate = new Date().toISOString();
	data['timestamp'] = isodate;
	data['address'] = rinfo.address;

	var line = JSON.stringify(data);
	console.log('[' + rinfo.address + '] ' + line);
	fileStream.write(line + '\n');
});

udpServer.on("listening", function () {
	var address = udpServer.address();
	console.log("udpServer listening " + address.address + ":" + address.port);
});

udpServer.bind(7777);


