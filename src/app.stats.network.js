
// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');
var events = require('events');


//// INTERNAL MODULES

var app_constants = require("./app.constants");
var app_settings = require("./app.settings");
var app_network = require("./app.network");


//// LOCAL VARIABLES

var eventEmitter = new events.EventEmitter();
var statTrackers = {};
var windowPeriod = app_settings.get('client_update_period');


//// CONSTANTS

var N_OUTPUT_SENSORS = {};
N_OUTPUT_SENSORS[app_constants.MachineKinds.CTRL] = 1;
N_OUTPUT_SENSORS[app_constants.MachineKinds.BIKE] = 1;
N_OUTPUT_SENSORS[app_constants.MachineKinds.AC] = 4;
N_OUTPUT_SENSORS[app_constants.MachineKinds.TIERS] = 3;


//// LOGIC

var _nodeIdentifier = function(data) {
  return([data.msg.kind, data.msg.uid, data.address].join('_'));
};

var _initAccumOutArray = function(kind) {
  var arr = [];
  for (var i=0; i < N_OUTPUT_SENSORS[kind]; i++) {
    arr.push(0);
  }
  return arr;
};

var updateStats = function(data) {
  var id = _nodeIdentifier(data);
  var stats = statTrackers[id] = statTrackers[id] || {
    uid : data.msg.uid,
    kind : data.msg.kind,
    last_msg : {},
    totalMessages : 0,
    totalBytes: 0,
    lastPacketID: 0,
    dropped : 0,
    accumulated_v: 0,
    accumulated_c_in: 0,
    accumulated_c_out: _initAccumOutArray(data.msg.kind),
  };
  stats.last_msg = data.msg;
  stats.totalMessages++;
  stats.totalBytes += data.size;
  if (data.msg.i !== stats.lastPacketID+1) {
    stats.dropped++;
  }
  stats.lastPacketID = data.msg.i;
  stats.accumulated_v += data.msg.v;

  switch (data.msg.kind) {
    case app_constants.MachineKinds.CTRL:
      stats.accumulated_c_in += data.msg.c_in;
      stats.accumulated_c_out[0] += data.msg.c_out;
      break;
    case app_constants.MachineKinds.BIKE:
      stats.accumulated_c_out[0] += data.msg.c_out;
      break;
    case app_constants.MachineKinds.TIERS:
    case app_constants.MachineKinds.AC:
    default:
      for (var i=0; i < N_OUTPUT_SENSORS[data.msg.kind]; i++) {
        stats.accumulated_c_out[i] += data.msg['c_'+(i+1)];
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
  if (tracker.kind == app_constants.MachineKinds.CTRL) {
    stats['inv'] = tracker.last_msg.inv;
    stats['tiers'] = tracker.last_msg.tiers;
    stats['shunts'] = tracker.last_msg.shunts;
  }
  return stats;
};


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

  if (eventEmitter) {
    eventEmitter.emit('stats', recentStats);
  }
}

setInterval(sendStats, windowPeriod);
sendStats();



//// EVENT HANDLERS

app_network.on('data', function (data) {
  if (!data.error) {
    updateStats(data);
  }
});


//// EXPORTS

module.exports = eventEmitter;
