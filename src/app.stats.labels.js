
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
var clientUpdatePeriod = app_settings.get('client_update_period');


//// BROADCAST INFORMATION

var sendLabels = function() {
  eventEmitter.emit('labels', app_settings.get('labels'));
}

setInterval(sendLabels, clientUpdatePeriod*5);
sendLabels();


//// EVENT HANDLERS

// If any of nodes show up which aren't yet tracked, add them to the settings.
// Note that actual labels are set in app.web.routes.js by the API
var updateLabelIDs = function(data) {
  var labels = app_settings.get('labels');
  var label_object = undefined;

  if (data.msg.kind === app_constants.MachineKinds.BIKE) {
    label_object = labels.bikes;
  } else if (data.msg.kind === app_constants.MachineKinds.AC) {
    label_object = labels.ac;
  }

  if (label_object && !label_object[data.msg.uid]) {
    // add a new empty placeholder
    label_object[data.msg.uid] = new Array(app_constants.NumSensors[data.msg.kind]);
    app_settings.set('labels', labels);
  }
}

app_network.on('data', function (data) {
  if (!data.error) {
    updateLabelIDs(data);
  }
});


//// EXPORTS

module.exports = eventEmitter;
