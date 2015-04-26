
// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');
var events = require('events');


//// INTERNAL MODULES

var app_network_serial = require("./app.network.serial");
var app_network_udp = require("./app.network.udp");
var app_settings = require("./app.settings");
var app_web = require("./app.web");


//// LOCAL VARIABLES

var eventEmitter = new events.EventEmitter();
var statTrackers = {};
var recentStats = {};
var windowPeriod = app_settings.get('client_update_period');


//// LOCAL FUNCTIONS

var updateStats = function(data, id) {
  statTrackers[id] = statTrackers[id] || {
    last_msg : {},
    totalMessages : 0,
    totalBytes: 0,
    lastPacketID: 0,
    dropped : 0,
    accumulated_v: 0,
    accumulated_c_in: 0,
    accumulated_c_out = [0, 0, 0, 0],
  };
  statTrackers[id].last_msg = data.msg;
  statTrackers[id].totalMessages++;
  statTrackers[id].totalBytes += data.size;
  if (data.msg.i !== statTrackers[id]+1) {
    statTrackers[id].dropped++;
  }
  statTrackers[id].lastPacketID = data.msg.i;
  statTrackers[id].accumulated_v += data.msg.v;

  if (data.msg.kind == "ctrl") {
    statTrackers[id].accumulated_c_in += data.msg.c_in;
    statTrackers[id].accumulated_c_out[0] += data.msg.c_out;
  }
  else if (data.msg.kind == "bike") {
    statTrackers[id].accumulated_c_out[0] += data.msg.c_out;
  }
  else if (data.msg.kind == "4-ac") {
    statTrackers[id].accumulated_c_out[0] += data.msg.c_1;
    statTrackers[id].accumulated_c_out[1] += data.msg.c_2;
    statTrackers[id].accumulated_c_out[2] += data.msg.c_3;
    statTrackers[id].accumulated_c_out[3] += data.msg.c_4;
  }
  else if (data.msg.kind == "ctrl-ac") {
    statTrackers[id].accumulated_c_out[0] += data.msg.c_1;
    statTrackers[id].accumulated_c_out[1] += data.msg.c_2;
    statTrackers[id].accumulated_c_out[2] += data.msg.c_3;
  }
};

var resetStatTracker = function(tracker) {
  tracker.totalMessages = 0;
  tracker.totalBytes = 0;
  tracker.dropped = 0;
  tracker.accumulated_v = 0;
  tracker.accumulated_c_in = 0;
  tracker.accumulated_c_out = [0, 0, 0, 0];
  return tracker;
};

bike_labels = {
  "24340":  "Bike 01",
  "6213":   "Bike 02",
  "9129":   "Bike 03",
  "14798":  "Bike 04",
  "25410":  "Bike 05",
  "28052":  "Bike 06",
  "27805":  "Bike 07",
  "7410":   "Bike 08",
  "16251":  "Bike 09",
  "18837":  "Bike 10",
  "19951":  "Bike 11",
  "9215":   "Bike 12",
  "16928":  "Bike 13"
};

var genStatsFromTracker = function(tracker) {
  // find message rate
  var stats = {};
  stats['message_rate'] = 1000.0*(tracker.totalMessages/windowPeriod);
  stats['data_rate'] =    1000.0*(tracker.totalBytes/windowPeriod);
  stats['drop_rate'] =    1000.0*(tracker.dropped/windowPeriod);
  stats['avg_v'] =        tracker.accumulated_v/tracker.totalMessages;
  stats['avg_c_in'] =     tracker.accumulated_c_in/tracker.totalMessages;
  stats['avg_c_out'] =    tracker.accumulated_c_out[0]/tracker.totalMessages;
  stats['avg_c_out_2'] =  tracker.accumulated_c_out[1]/tracker.totalMessages;
  stats['avg_c_out_3'] =  tracker.accumulated_c_out[2]/tracker.totalMessages;
  stats['avg_c_out_4'] =  tracker.accumulated_c_out[3]/tracker.totalMessages;
  stats['last_msg'] =     tracker.last_msg;
  if (tracker.last_msg.kind == "bike") {
    // var label = app_settings.get('bike_labels')[''+tracker.last_msg.uid];
    var label = bike_labels[''+tracker.last_msg.uid];
    if (label) {
      stats['label'] = label;
    } else {
      stats['label'] = "";
    }
  }
  return stats;
};

var identifier = function(data) {
  return([data.address, data.msg.uid].join('-'));
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

    // UIDs are sometimes not reported or reported as negative numbers
    data.msg.uid = data.msg.uid || 0;
    data.msg.uid = Math.abs(data.msg.uid);
  }
  catch(e) {
    data.error = e;
    data.text = message;
  }
  data.address = address;
  data.size = message.length;

  if (!data.error) {
    updateStats(data, identifier(data));
  }
  eventEmitter.emit('data', data);
};


//// MODULE LOGIC

app_network_udp.on("message", function (msg, rinfo) {
  handleIncomingData(msg.toString(), rinfo.address);
});

app_network_serial.on("data", function (data) {
  handleIncomingData(data.toString(), "serial port");
});

setInterval(function genStats() {
  var recentStats = _.transform(
    _.filter(statTrackers, function filter(tracker) {
      return tracker.totalMessages > 0;
    }),
    function mapTrackerToStats(stats, tracker, key) {
      stats[key] = genStatsFromTracker(tracker);
    }
  );
  statTrackers = _.transform(statTrackers, function resetTracker(trackers, tracker, key) {
    trackers[key] = resetStatTracker(tracker);
  });
  eventEmitter.emit('stats', recentStats);
}, windowPeriod);



//// EXPORTS

// emits 'data' and 'stats' events
module.exports = eventEmitter;
