

// Devon Rueckner
// The Human Grid
// All Rights Reserved



var _ = require('lodash');
var fs = require("fs");
var os = require('os');

var dataLog = fs.createWriteStream("./data.log");
var errLog = fs.createWriteStream("./errors.log");


var webServer = require("./webServer");
var settings = require("./settings");
var serverStats = require("./serverStats");


var dataBuffer = {};


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

  var line = JSON.stringify(data);
  if (settings.logToFile) {
    dataLog.write(line + '\n');
  }
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
  var allStats = {};
  _.forEach(dataBuffer, function(data, key) {
    
    
    // find message rate
    var stats = {};
    stats['message_rate'] = 1000*1.0*data.length/settings.client_update_period;


    // find average message size, attempted interval, and data rate
    var attemptedInterval = 0;
    
    totalBytes = 0;
    _.forEach(data, function(message, index) {
      totalBytes += message['size'];
      attemptedInterval += message['data']['interval'];
    });

    attemptedInterval /= data.length;
    stats['target_interval'] = attemptedInterval;
    stats['target_rate'] = attemptedInterval === 0 ? 100000000 : (1000.0/attemptedInterval);
    stats['data_rate'] = 1000*1.0*totalBytes/settings.client_update_period;
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
    stats['drop_rate'] = 1000*(dropped/settings.client_update_period);

    allStats[key] = stats;
  });
  webServer.writeToWebSockets('sensorStats', allStats);
  dataBuffer = {};

}, settings.client_update_period);



// server stats
setInterval(function() {
  webServer.writeToWebSockets('serverStats', serverStats.getStats());
}, 1000);

