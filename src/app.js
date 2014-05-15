

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
var app_sensors = require("./app.sensors");
var app_serverStats = require("./app.serverStats");
var app_web = require("./app.web");


//// LOCAL FUNCTIONS

var publish = function(channel, data) {
  msg = {
    chan: channel,
    data: data,
    time: (new Date()).toISOString(),
  };
  app_pubsub.publish(channel, JSON.stringify(msg));
};


//// MODULE LOGIC

// server stats
setInterval(function() {
  publish('server.stats', app_serverStats.getStats());
  app_logger.getRecordingState(function(err, recording_state) {
    if (err) {
      console.log("Error getting recording state:", err);
    }
    else if (recording_state.recording) {
      publish('logger.recording_state', recording_state);
    }
  });
}, 1000);

// square wave
app_gpio.on('edge', function(state, timeToChange) {
  publish('server.pulse', {
    state: state,
    cmd_time: timeToChange,
  });
});

// sensors
app_sensors.on('stats', function(stats) {
  publish('sensors.stats', stats);
});

app_sensors.on('data', function(data) {
  publish('sensors.data', data);
});

// web socket output
app_pubsub.subscribe([
  'sensors.stats',
  'server.stats',
  'logger.recording_state',
], app_web.writeToSockets);

// log file output
app_pubsub.subscribe('*', app_logger.write);


var shuttingDown = false;

// shutdown
app_gpio.on('shutdown', function() {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;
  console.log("SHUTDOWN");
  publish('server.shutdown', {});
  app_logger.stopLogging(function(err) {
    if (err) {
      console.log("Could not stop logging:", err);
    }
  });
  child_process.exec("sudo halt", function(err, std_out, std_err) {
    if (err) {
      console.log("Could not shut down.");
    }
  });
});

