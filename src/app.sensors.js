
/**
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


//// EXTERNAL MODULES

var _ = require('lodash');


//// INTERNAL MODULES

var app_serialServer = require("./app.serialServer");
var app_settings = require("./app.settings");
var app_udpServer = require("./app.udpServer");
var app_web = require("./app.web");


//// LOCAL VARIABLES

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



app_udpServer.on("message", function (msg, rinfo) {
  handleIncomingData(msg.toString(), rinfo.address);
});


app_serialServer.on("data", function(data) {
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



//// EXPORTS

