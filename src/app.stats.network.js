
// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');
var events = require('events');


//// INTERNAL MODULES

var app_logger = require("./app.logger");
var app_constants = require("./app.constants");
var app_settings = require("./app.settings");
var app_network = require("./app.network");


//// LOCAL VARIABLES

var eventEmitter = new events.EventEmitter();
var windowPeriod = app_settings.get('client_update_period');
var dataBuffers = {}; // kind -> id -> array of data


//// CALC HELPERS

// rounds to 3 decimals
function _round(number) {
  return Math.round(number * 1000) / 1000;
}

// given an array of objects with keys that include objectKeys
// return an object whose keys are the sums of the values...
function _calcAverages(arrayOfData, objectKeys) {
  // initialize all to 0
  var avgsObject = {};
  objectKeys.forEach(function (key) {
    avgsObject[key] = 0;
  });
  // aggregate sums
  arrayOfData.forEach(function (data) {
    objectKeys.forEach(function (key) {
      avgsObject[key] += data.msg[key];
    });
  });
  // divide by total
  objectKeys.forEach(function (key) {
    avgsObject[key] = _round(avgsObject[key] / arrayOfData.length);
  });
  return avgsObject;
}


//// CALCULATORS

var statsCalc = {};

statsCalc[app_constants.MachineKinds.AC] = function (dataArray, uid) {
  var averages = _calcAverages(dataArray,
    ['c_1', 'c_2', 'c_3', 'c_4', 'v']
  );
  var stats = {
    c_ckts: [averages.c_1, averages.c_2, averages.c_3, averages.c_4],
    v: averages.v,
  };
  var labels = app_settings.get('labels')[app_constants.MachineKinds.AC];
  if (labels && labels[uid]) {
    stats.labels = labels[uid];
  }
  return stats;
};

statsCalc[app_constants.MachineKinds.BIKE] = function (dataArray, uid) {
  var stats = _calcAverages(dataArray, ['c_out', 'v']);
  var labels = app_settings.get('labels')[app_constants.MachineKinds.BIKE];
  if (labels && labels[uid]) {
    stats.label = labels[uid][0];
  }
  return stats;
};

statsCalc[app_constants.MachineKinds.INVERTER] = function (dataArray, uid) {
  var mostRecent = _.last(dataArray);
  stats = {
    inv: mostRecent.msg.inv,
    soft: mostRecent.msg.soft,
  };
  return stats;
};

statsCalc[app_constants.MachineKinds.CAPS_SHUNTS] = function (dataArray, uid) {
  // uncomment the lines below to return the 'average shunts on'
  /*
  return _calcAverages(dataArray,
    ['c_in', 'c_out_fwd', 'c_out_rev', 'c_shunt', 'v', 'temp', 'shunts']
  );
  */

  // this returns the most recent shunts on rather than average
  var stats = _calcAverages(dataArray,
    ['c_in', 'c_out_fwd', 'c_out_rev', 'c_shunt', 'v', 'temp']
  );
  stats.shunts = _.last(dataArray).shunts;
  return stats;
};

statsCalc[app_constants.MachineKinds.AC_NETWORK] = function (dataArray, uid) {
  var averages = _calcAverages(dataArray,
    ['c_t1', 'c_t2', 'c_t3', 'c_t4', 'v_ac', 'temp']
  );
  var stats = {
    c_tiers: [averages.c_t1, averages.c_t2, averages.c_t3, averages.c_t4],
    v_ac: averages.v_ac,
    temp: averages.temp,
  };
  var mostRecent = _.last(dataArray);
  stats.tierSense = [
    mostRecent.msg.v_t1, mostRecent.msg.v_t2, mostRecent.msg.v_t3, mostRecent.msg.v_t4
  ];
  stats.tiersOn = mostRecent.msg.tiers;
  stats.numTiers = 4;
  return stats;
};


//// LOGIC

var resetBuffers = function() {
  _.values(app_constants.MachineKinds).forEach(function (kind) {
    dataBuffers[kind] = {};
  });
}

var bufferData = function(data) {
  if (!dataBuffers[data.msg.kind]) {
    app_logger.error('No data buffer for kind:', data.msg.kind);
    return;
  }
  if (!dataBuffers[data.msg.kind][data.msg.uid]) {
    dataBuffers[data.msg.kind][data.msg.uid] = [];
  }
  dataBuffers[data.msg.kind][data.msg.uid].push(data);
};

var sendStats = function() {
  var allStats = {};
  _.forIn(dataBuffers, function (buffers, kind) {
    allStats[kind] = [];
    _.forIn(buffers, function (buffer, uid) {
      if (buffer.length) {
        var stats = statsCalc[kind](buffer, uid);
        stats.device_id = uid;
        allStats[kind].push(stats);
      }
    });
  });
  eventEmitter.emit('stats', allStats);
  resetBuffers();
}

setInterval(sendStats, windowPeriod);
resetBuffers();
sendStats();


//// EVENT HANDLERS

app_network.on('data', function (data) {
  bufferData(data);
});


//// EXPORTS

module.exports = eventEmitter;
