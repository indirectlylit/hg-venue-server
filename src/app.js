

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


//// INTERNAL MODULES

var app_gpio = require("./app.gpio");
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

// square wave
app_gpio.on('edge', function (state, timeToChange) {
  app_pubsub.publish('server.pulse', {
    state: state,
    cmd_time: timeToChange,
  });
});

// sensors
app_network.on('stats', function (stats) {
  app_pubsub.publish('network.stats', stats);
});

app_network.on('bike-labels', function (labels) {
  app_pubsub.publish('network.labels.bikes', labels);
});

app_network.on('ac-labels', function (labels) {
  app_pubsub.publish('network.labels.ac', labels);
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
  'network.labels.*',
  'server.stats',
  'logger.state',
  'logger.state.recording_state',
], app_web.writeToSockets);

// log file output
app_pubsub.subscribe('*', app_logger.write);


var shuttingDown = false;

// shutdown
app_gpio.on('shutdown', function () {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log("SHUTDOWN");
  app_pubsub.publish('server.shutdown', {});
  app_logger.stopLogging(function (err) {
    if (err) {
      console.log("Could not stop logging:", err);
    }
  });
  child_process.exec("sudo halt", function (err, std_out, std_err) {
    if (err) {
      console.log("Could not shut down.");
    }
  });
});
