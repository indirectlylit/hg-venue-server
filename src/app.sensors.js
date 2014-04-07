
// Devon Rueckner
// The Human Grid
// All Rights Reserved



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
  var data = {};
  try {
    data.msg = JSON.parse(message);

    // for replaying old data
    if (data.msg.address) {
      address = data.msg.address;
      delete data.msg.address;
    }
  }
  catch(e) {
    data.error = e;
    data.text = message;
  }
  data.address = address;
  data.size = message.length;
  dataBuffers[address] = dataBuffers[address] || [];
  if (!data.error) {
    dataBuffers[address].push(data);
  }
  eventEmitter.emit('data', data);
};


var genStats = function(dataList) {
  // find message rate
  var stats = {};
  stats['message_rate'] = 1000*1.0*dataList.length/windowPeriod;

  // find average message size and max data rate
  var minInterval = 0;

  totalBytes = 0;
  _.forEach(dataList, function(annotatedData, index) {
    totalBytes += annotatedData.size;
    minInterval += annotatedData.msg.interval;
  });

  minInterval /= dataList.length; // average
  // prevent divide-by-zero issue
  minInterval = minInterval === 0 ? 1e-9 : minInterval;
  stats['max_rate'] = 1e6 / minInterval; // interval in microseconds to Hz
  stats['data_rate'] = 1000*1.0*totalBytes/windowPeriod;
  stats['avg_size'] = totalBytes/dataList.length;


  // find dropped messages
  var dropped = 0;
  var counterList = _.pluck(_.pluck(_.pluck(dataList, 'msg'), 'data'), 'counter');

  counterList.sort();
  for (i = 1; i < counterList.length; i++) {
      if (counterList[i]-1 != counterList[i-1]) {
        dropped += counterList[i] - counterList[i-1];
      }
  }
  stats['drop_rate'] = 1000*(dropped/windowPeriod);
  return stats;
};


//// MODULE LOGIC

app_sensors_udp.on("message", function (msg, rinfo) {
  handleIncomingData(msg.toString(), rinfo.address);
});


app_sensors_serial.on("data", function(data) {
  handleIncomingData(data.toString(), "serial port");
});

setInterval(function() {
  var recentStats = _.transform(dataBuffers, function(result, buffer, key) {
    result[key] = genStats(buffer);
  });
  eventEmitter.emit('stats', recentStats);
  dataBuffers = {};
}, windowPeriod);



//// EXPORTS

// emits 'data' and 'stats' events
module.exports = eventEmitter;
