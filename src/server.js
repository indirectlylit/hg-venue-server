

// Devon Rueckner
// The Human Grid
// All Rights Reserved



var _ = require('lodash');
var fs = require("fs");
var os = require('os');
var path = require('path');


var app_settings = require("./settings");
var serverStats = require("./serverStats");
var app_logger = require("./logger");
var app_web = require("./web");
var gpio = require("./gpio");


var dataBuffer = {};

function handleIncomingData(message, address) {
  var isodate = new Date().toISOString();
  var data = {};

  try {
    data = JSON.parse(message);
  } catch(e) {
    err = isodate + "\t" + address + "\t" + message + '\n';
    console.log("Not JSON:\t"+err);
    return;
  }

  // console.log(message);

  if (!data['timestamp']) {
    data['timestamp'] = isodate;
  }
  if (!data['address']) {
    data['address'] = address;
  }
  else {
    address = data['address'];
  }
  if (!data['size']) {
    data['size'] = message.length;
  }

  if (!dataBuffer[address]) {
    dataBuffer[address] = [];
  }

  dataBuffer[address].push(data);

  app_logger.write(data);
}



var udpServer = require("./udpServer").udpServer;

udpServer.on("message", function (msg, rinfo) {
  handleIncomingData(msg.toString(), rinfo.address);
});


var serialServer = require("./serialServer").serialServer;

serialServer.on("data", function(data) {
  handleIncomingData(data.toString(), "serial port");
});



// sensor stats
setInterval(function() {
  var windowOfStats = {};
  _.forEach(dataBuffer, function(data, key) {


    // find message rate
    var stats = {};
    stats['message_rate'] = 1000*1.0*data.length/app_settings.get('client_update_period');


    // find average message size and max data rate
    var minInterval = 0;

    totalBytes = 0;
    _.forEach(data, function(message, index) {
      totalBytes += message['size'];
      minInterval += message['data']['interval'];
    });

    minInterval /= data.length; // average
    // prevent divide-by-zero issue
    minInterval = minInterval === 0 ? 1e-9 : minInterval;
    stats['max_rate'] = 1e6 / minInterval; // interval in microseconds to Hz
    stats['data_rate'] = 1000*1.0*totalBytes/app_settings.get('client_update_period');
    stats['avg_size'] = totalBytes/data.length;


    // find dropped messages
    var dropped = 0;
    var counterList = _.pluck(_.pluck(data, 'data'), 'counter');

    counterList.sort();
    for (i = 1; i < counterList.length; i++) {
        if (counterList[i]-1 != counterList[i-1]) {
          dropped += counterList[i] - counterList[i-1];
        }
    }
    stats['drop_rate'] = 1000*(dropped/app_settings.get('client_update_period'));

    windowOfStats[key] = stats;
  });
  app_web.writeToWebSockets('sensorStats', windowOfStats);
  dataBuffer = {};
}, app_settings.get('client_update_period'));



// server stats
setInterval(function() {
  var stats = serverStats.getStats();
  app_web.writeToWebSockets('serverStats', stats);
  app_logger.write(stats);
}, 1000);


// square wave
gpio.wave.on('edge', function(state) {
  console.log("EDGE", state);
});

gpio.outputSquareWave(app_settings.get('outputSquareWave'));
