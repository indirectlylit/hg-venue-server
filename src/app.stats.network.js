
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
var windowPeriod = app_settings.get('client_update_period');


//// CONSTANTS


//// LOGIC

var _nodeIdentifier = function(data) {
  return([data.msg.kind, data.msg.uid, data.address].join('_'));
};


var updateStats = function(data) {
  var id = _nodeIdentifier(data);
};



var sendStats = function() {
  var recentStats = {};
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
