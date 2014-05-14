
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
var statTrackers = {};
var recentStats = {};
var windowPeriod = app_settings.get('client_update_period');


//// LOCAL FUNCTIONS

var updateStats = function(data, address) {
  statTrackers[address] = statTrackers[address] || {
    totalMessages : 0,
    totalBytes: 0,
    lastPacketID: 0,
    dropped : 0,
    accumulated_v: 0,
    accumulated_c1: 0,
    accumulated_c2: 0,
  };
  statTrackers[address].totalMessages++;
  statTrackers[address].totalBytes += data.size;
  if (data.msg.i !== statTrackers[address]+1) {
    statTrackers[address].dropped++;
  }
  statTrackers[address].lastPacketID = data.msg.i;
  statTrackers[address].accumulated_v += data.msg.v;
  statTrackers[address].accumulated_c1 += data.msg.c1;
  statTrackers[address].accumulated_c2 += data.msg.c2;
};

var resetStatTracker = function(tracker) {
  tracker.totalMessages = 0;
  tracker.totalBytes = 0;
  tracker.dropped = 0;
  tracker.accumulated_v = 0;
  tracker.accumulated_c1 = 0;
  tracker.accumulated_c2 = 0;
  return tracker;
};

var genStatsFromTracker = function(tracker) {
  // find message rate
  var stats = {};
  stats['message_rate'] = 1000.0*(tracker.totalMessages/windowPeriod);
  stats['data_rate'] =    1000.0*(tracker.totalBytes/windowPeriod);
  stats['drop_rate'] =    1000.0*(tracker.dropped/windowPeriod);
  stats['avg_v'] =        tracker.accumulated_v/tracker.totalMessages;
  stats['avg_c1'] =       tracker.accumulated_c1/tracker.totalMessages;
  stats['avg_c2'] =       tracker.accumulated_c1/tracker.totalMessages;
  return stats;
};


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
  if (!data.error) {
    updateStats(data, address);
  }
  eventEmitter.emit('data', data);
};


//// MODULE LOGIC

app_sensors_udp.on("message", function (msg, rinfo) {
  handleIncomingData(msg.toString(), rinfo.address);
});


app_sensors_serial.on("data", function(data) {
  handleIncomingData(data.toString(), "serial port");
});

setInterval(function() {
  var recentStats = _.transform(
    _.filter(statTrackers, function filter(tracker) {
      return tracker.totalMessages > 0;
    }),
    function(result, tracker, key) {
      result[key] = genStatsFromTracker(tracker);
    }
  );
  statTrackers = _.transform(statTrackers, function(result, tracker, key) {
    result[key] = resetStatTracker(tracker);
  });
  eventEmitter.emit('stats', recentStats);
}, windowPeriod);



//// EXPORTS

// emits 'data' and 'stats' events
module.exports = eventEmitter;
