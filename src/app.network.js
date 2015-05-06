
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


//// CONSTANTS

var KIND = {
  AC: "4-ac",
  CTRL: "ctrl",
  TIERS: "ctrl-ac",
  BIKE: "bike",
}

var N_OUTPUT_SENSORS = {};
N_OUTPUT_SENSORS[KIND.CTRL] = 1;
N_OUTPUT_SENSORS[KIND.BIKE] = 1;
N_OUTPUT_SENSORS[KIND.AC] = 4;
N_OUTPUT_SENSORS[KIND.TIERS] = 3;


//// LOCAL FUNCTIONS

var initAccumOutArray = function(kind) {
  var arr = [];
  for (var i=0; i < N_OUTPUT_SENSORS[kind]; i++) {
    arr.push(0);
  }
  return arr;
};

var updateStats = function(data, id) {
  statTrackers[id] = statTrackers[id] || {
    uid : data.msg.uid,
    kind : data.msg.kind,
    last_msg : {},
    totalMessages : 0,
    totalBytes: 0,
    lastPacketID: 0,
    dropped : 0,
    accumulated_v: 0,
    accumulated_c_in: 0,
    accumulated_c_out: initAccumOutArray(data.msg.kind),
  };
  statTrackers[id].last_msg = data.msg;
  statTrackers[id].totalMessages++;
  statTrackers[id].totalBytes += data.size;
  if (data.msg.i !== statTrackers[id]+1) {
    statTrackers[id].dropped++;
  }
  statTrackers[id].lastPacketID = data.msg.i;
  statTrackers[id].accumulated_v += data.msg.v;

  switch (data.msg.kind) {
    case KIND.CTRL:
      statTrackers[id].accumulated_c_in += data.msg.c_in;
      statTrackers[id].accumulated_c_out[0] += data.msg.c_out;
      break;
    case KIND.BIKE:
      statTrackers[id].accumulated_c_out[0] += data.msg.c_out;
      break;
    case KIND.TIERS:
    case KIND.AC:
    default:
      for (var i=0; i < N_OUTPUT_SENSORS[data.msg.kind]; i++) {
        statTrackers[id].accumulated_c_out[i] += data.msg['c_'+(i+1)];
      }
  }
};

var resetStatTracker = function(tracker) {
  tracker.totalMessages = 0;
  tracker.totalBytes = 0;
  tracker.dropped = 0;
  tracker.accumulated_v = 0;
  tracker.accumulated_c_in = 0;
  for (var i = 0; i < tracker.accumulated_c_out.length; i++) {
    tracker.accumulated_c_out[i] = 0;
  }
  return tracker;
};

var genStatsFromTracker = function(tracker) {
  // find message rate
  var stats = {};
  stats['message_rate'] = 1000.0*(tracker.totalMessages/windowPeriod);
  stats['data_rate'] =    1000.0*(tracker.totalBytes/windowPeriod);
  stats['drop_rate'] =    1000.0*(tracker.dropped/windowPeriod);
  stats['avg_v'] =        tracker.accumulated_v/tracker.totalMessages;
  stats['avg_c_in'] =     tracker.accumulated_c_in/tracker.totalMessages;
  stats['uid'] =          tracker.uid;
  stats['kind'] =         tracker.kind;

  stats['avg_c_out'] = [];
  for (var i = 0; i < N_OUTPUT_SENSORS[tracker.kind]; i++) {
    stats['avg_c_out'].push(tracker.accumulated_c_out[i]/tracker.totalMessages)
  }

  // customize information
  if (tracker.kind == KIND.CTRL) {
    stats['inv'] = tracker.last_msg.inv;
    stats['tiers'] = tracker.last_msg.tiers;
    stats['shunts'] = tracker.last_msg.shunts;
  }
  return stats;
};

var identifier = function(data) {
  return([data.msg.uid, data.address].join('@'));
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

  if (data.msg.ping) {
    eventEmitter.emit('ping', data);
  }
  else {
    if (!data.error) {
      updateStats(data, identifier(data));
    }
    eventEmitter.emit('data', data);
  }
};


//// MODULE LOGIC

app_network_udp.on("message", function (msg, rinfo) {
  handleIncomingData(msg.toString(), rinfo.address);
});

app_network_serial.on("data", function (data) {
  handleIncomingData(data.toString(), "serial port");
});


var sendStats = function() {
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
}

var sendLabels = function() {
  eventEmitter.emit('labels', app_settings.get('labels'));
}

setInterval(sendStats, windowPeriod);
setInterval(sendLabels, windowPeriod*5);
sendStats();
sendLabels();



//// EXPORTS

// emits 'data' and 'stats' events
module.exports = eventEmitter;
