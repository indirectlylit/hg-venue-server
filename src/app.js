

// Devon Rueckner
// The Human Grid
// All Rights Reserved


console.log("\n\nSTART VENUE SERVER: "+Date());


//// PROFILING
/*
  To profile, uncomment the line below.
  Then:
   * npm install look
   * node app.js
  and navigate to http://localhost:5959
*/
// require('look').start();


//// EXTERNAL MODULES

var _ = require('lodash');
var fs = require("fs");
var os = require('os');
var path = require('path');
var child_process = require('child_process');
var GPIO = require('inout').Gpio;


//// INTERNAL MODULES

var app_logger = require("./app.logger");
var app_pubsub = require("./app.pubsub");
var app_network = require("./app.network");
var app_serverStats = require("./app.serverStats");
var app_web = require("./app.web");


//// MODULE LOGIC

// server stats
setInterval(function () {
  app_pubsub.publish('server.stats', app_serverStats.getStats());
  app_logger.getRecordingState(function (err, recording_state) {
    if (err) {
      console.log("Error getting recording state:", err);
    }
    else if (recording_state.recording) {
      app_pubsub.publish('logger.state.recording_state', recording_state);
    }
  });
}, 1000);

// sensors
app_network.on('stats', function (stats) {
  app_pubsub.publish('network.stats', stats);
});

app_network.on('labels', function (labels) {
  app_pubsub.publish('network.labels', labels);
});

app_network.on('data', function (data) {
  app_pubsub.publish('network.data', data);
});

app_network.on('ping', function (data) {
  app_pubsub.publish('network.ping', data);
});

// web socket output
app_pubsub.subscribe([
  'network.stats',
  'network.ping',
  'network.labels',
  'server.stats',
  'logger.state',
  'logger.state.recording_state',
], app_web.writeToSockets);

// log file output
app_pubsub.subscribe('*', app_logger.write);

// set beaglebone GPIO status output on pin 9-15
var status_pin = new gpio(48, 'out');
status_pin.writeSync(1);



