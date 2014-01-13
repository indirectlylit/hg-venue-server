

// Devon Rueckner
// The Human Grid
// All Rights Reserved


/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var sockjs = require('sockjs');
var dgram = require("dgram");
var fs = require("fs");
var serialport = require("serialport");



/**
 * Data Handling
 */

var webSockets = [];
var dataLog = fs.createWriteStream("./data.log");
var errLog = fs.createWriteStream("./errors.log");

function handleIncomingData(message, address) {
  var isodate = new Date().toISOString();
  var data = {};

  try {
    data = JSON.parse(message);
  } catch(e) {
    err = isodate + "\t" + address + "\t" + message + '\n';
    console.log("Not JSON:\t"+err);
    errLog.write(err);
    return;
  }

  data['timestamp'] = isodate;
  data['address'] = address;

  var line = JSON.stringify(data);
  dataLog.write(line + '\n');

  console.log('[' + address + ']\t' + line);

  for (var i = 0; i < webSockets.length; i++) {
    webSockets[i].write(line);
  }
}



/**
 * Set up web socket server.
 */

var sockjsServer = sockjs.createServer();
var httpStreamServer = http.createServer();

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

expressApp.get('/', function(req, res){
    res.render('index', { title: 'Celilo 2' });
  }
);

http.createServer(expressApp).listen(expressApp.get('port'), function(){
	console.log("Web server listening on port " + expressApp.get('port'));
});



/**
 * UDP Listener
 */

var udpServer = dgram.createSocket("udp4");
udpServer.on("message", function (msg, rinfo) {
  handleIncomingData(msg, rinfo.address);
});

udpServer.on("listening", function () {
	var address = udpServer.address();
	console.log("udpServer listening " + address.address + ":" + address.port);
});

udpServer.bind(7777);



/**
 * Serial Port Listener
 */

var SERIAL_PORT = "/dev/ttyUSB0";
var SERIAL_RATE = 57600;
var serial_active = false;

var serialPortObject = new serialport.SerialPort(SERIAL_PORT,
  {baudrate: SERIAL_RATE, parser: serialport.parsers.readline("\n")},
  false
);

serialPortObject.on("data", function(data) {
  handleIncomingData(data.toString(), SERIAL_PORT);
});

serialPortObject.on("close", function(data) {
  serial_active = false;
  console.log("\n----\nClosed SerialPort at "+Date.now()+"\n----\n");
});

function attemptLogging() {
  serialPortObject.open(function(error) {
    if (error) {
      serial_active = false;
      return;
    }
    serial_active = true;
    console.log("\n----\nOpened SerialPort at "+Date.now()+"\n----\n");
  });
}

setInterval(function() {
  if (!serial_active) {
    attemptLogging();
  }
}, 1000);

