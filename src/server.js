

// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');
var fs = require("fs");
var os = require('os');
var path = require('path');


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
  var serverStats = app_serverStats.getStats();
  serverStats.logs_overloaded = app_logger.overloaded();
  publish('serverStats', serverStats);
  app_logger.getRecordingState(function(err, recording_state) {
    if (err) {
      throw (err);
    }
    if (recording_state.recording) {
      publish('recordingState', recording_state);
    }
  });
}, 1000);

// square wave
app_gpio.on('edge', function(state, timeToChange) {
  publish('wave', {
    state: state,
    cmd_time: timeToChange,
  });
});


app_pubsub.subscribe('*', app_web.writeToSockets);
app_pubsub.subscribe('wave', app_logger.write);


