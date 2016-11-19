
// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');


//// INTERNAL MODULES

var app_settings = require("./app.settings");


//// LOCAL VARIABLES

var moduleExports = {};
var statTrackers = {};
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


//// LOGIC

var initAccumOutArray = function(kind) {
  var arr = [];
  for (var i=0; i < N_OUTPUT_SENSORS[kind]; i++) {
    arr.push(0);
  }
  return arr;
};

var updateStats = function(data, id) {
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
    accumulated_c_out: initAccumOutArray(data.msg.kind),
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
    case KIND.CTRL:
      stats.accumulated_c_in += data.msg.c_in;
      stats.accumulated_c_out[0] += data.msg.c_out;
      break;
    case KIND.BIKE:
      stats.accumulated_c_out[0] += data.msg.c_out;
      break;
    case KIND.TIERS:
    case KIND.AC:
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
  if (tracker.kind == KIND.CTRL) {
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

  // hack hack
  if (moduleExports.eventEmitter) {
    moduleExports.eventEmitter.emit('stats', recentStats);
  }
}

var sendLabels = function() {
  // first, check to see whether any devices need to be added to the labels
  var labels = app_settings.get('labels');

  _.forEach(statTrackers, function(tracker) {
    switch (tracker.kind) {
      case KIND.BIKE:
        labels.bikes[tracker.uid] = labels.bikes[tracker.uid] || new Array(N_OUTPUT_SENSORS[tracker.kind])
        break;
      case KIND.AC:
        labels.ac[tracker.uid] = labels.ac[tracker.uid] || new Array(N_OUTPUT_SENSORS[tracker.kind])
        break;
    }
  });

  app_settings.set('labels', labels, function(){}); // don't wait for callback

  // hack hack
  if (moduleExports.eventEmitter) {
    moduleExports.eventEmitter.emit('labels', labels);
  }
}

setInterval(sendStats, windowPeriod);
setInterval(sendLabels, windowPeriod*5);
sendStats();
sendLabels();



//// EXPORTS

moduleExports.updateStats = updateStats;
module.exports = moduleExports;
