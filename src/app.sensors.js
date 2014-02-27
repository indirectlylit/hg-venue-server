
/**
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


//// EXTERNAL MODULES

var _ = require('lodash');
var events = require('events');


//// INTERNAL MODULES

var app_sensors_serial = require("./app.sensors.serial");
var app_sensors_udp = require("./app.sensors.udp");
var app_settings = require("./app.settings");
var app_web = require("./app.web");


//// LOCAL VARIABLES

var eventEmitter = new events.EventEmitter();
var dataBuffers = {};
var recentStats = {};
var windowPeriod = app_settings.get('client_update_period');


//// LOCAL FUNCTIONS

var handleIncomingData = function(message, address) {
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

  if (!dataBuffers[address]) {
    dataBuffers[address] = [];
  }

  dataBuffers[address].push(data);

  eventEmitter.emit('data', data);
};


var genStats = function(data) {
  // find message rate
  var stats = {};
  stats['message_rate'] = 1000*1.0*data.length/windowPeriod;


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
  stats['data_rate'] = 1000*1.0*totalBytes/windowPeriod;
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
  stats['drop_rate'] = 1000*(dropped/windowPeriod);
  return stats;
};


app_sensors_udp.on("message", function (msg, rinfo) {
  handleIncomingData(msg.toString(), rinfo.address);
});


app_sensors_serial.on("data", function(data) {
  handleIncomingData(data.toString(), "serial port");
});



// sensor stats
setInterval(function() {
  recentStats = _.map(dataBuffers, genStats);
  eventEmitter.emit('stats', recentStats);
  dataBuffers = {};
}, windowPeriod);



//// EXPORTS

// emits 'data' and 'stats' events
module.exports = eventEmitter;
