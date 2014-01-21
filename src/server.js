

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

  data['timestamp'] = isodate;
  data['address'] = address;
  data['size'] = message.length;

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
  handleIncomingData(msg, rinfo.address);
});


var serialServer = require("./serialServer").serialServer;

serialServer.on("data", function(data) {
  handleIncomingData(data.toString(), "serial port");
});



// sensor stats
setInterval(function() {
  var allStats = {};
  _.forEach(dataBuffer, function(data, key) {
    var stats = {};
    stats['message_rate'] = 1000*1.0*data.length/settings.client_update_period;

    var missingOrShuffled = 0;
    var attemptedInterval = 0;

    totalBytes = 0;
    _.forEach(data, function(message, index) {
      totalBytes += message['size'];
      
      attemptedInterval += message['interval'];

      if (index !== 0 && message['counter']) {
        if (message['counter'] != data[index-1]['counter']-1) {
          missingOrShuffled++;
        }
      }
    });

    attemptedInterval = attemptedInterval/data.length;


    stats['data_rate'] = 1000*1.0*totalBytes/settings.client_update_period;
    stats['garbled'] = missingOrShuffled;
    stats['attempted'] = attemptedInterval;

    allStats[key] = stats;
  });
  // console.log("updating stats");
  webServer.writeToWebSockets('sensorStats', allStats);
  console.log("Current stats:", JSON.stringify(allStats));
  dataBuffer = {};

}, settings.client_update_period);



var startTime = (new Date()).getTime();


// server stats
setInterval(function() {
  var stats = {
    freemem : os.freemem(),
    totalmem : os.totalmem(),
    loadavg : os.loadavg(),
    platform : os.platform(),
    arch : os.arch(),
    uptime : os.uptime().toFixed(0),
    appUptime : (((new Date()).getTime()-startTime)/1000).toFixed(0),
    time : (new Date()).getTime()
  };
  webServer.writeToWebSockets('serverStats', stats);
}, 1000);

