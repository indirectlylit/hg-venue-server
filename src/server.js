

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
var app_sensors = require("./app.sensors");
var app_serverStats = require("./app.serverStats");
var app_web = require("./app.web");


//// MODULE LOGIC

// server stats
setInterval(function() {
  var stats = app_serverStats.getStats();
  app_web.writeToWebSockets('serverStats', stats);
  app_logger.write(stats);
}, 1000);


// square wave
app_gpio.on('edge', function(state, timeToChange) {
  console.log("EDGE", state, timeToChange);
});

