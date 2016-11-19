
// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');
var events = require('events');


//// INTERNAL MODULES

var app_network_serial = require("./app.network.serial");
var app_network_udp = require("./app.network.udp");
var app_network_stats = require("./app.network.stats");
var app_settings = require("./app.settings");
var app_web = require("./app.web");


//// LOCAL VARIABLES

var eventEmitter = new events.EventEmitter();
app_network_stats.eventEmitter = eventEmitter; // hack hack

//// HELPERS

var identifier = function(data) {
  return([data.msg.uid, data.address].join('@'));
};

var paddedString = function(number) {
  if (number <= 10000) {
    return ("000"+number).slice(-5);
  }
  return ''+number;
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

    // turn it into a string so it can be used as a JSON key
    data.msg.uid = paddedString(data.msg.uid);
  }
  catch(e) {
    data.error = e;
    data.text = message;
  }
  data.address = address;
  data.size = message.length;

  if (!data.msg) {
    console.log("No msg attribute", data);
  }

  if (data.msg && data.msg.ping) {
    eventEmitter.emit('ping', data);
  }
  else {
    if (!data.error) {
      app_network_stats.updateStats(data, identifier(data));
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


//// EXPORTS

// emits 'data', 'stats', 'labels', and 'ping' events
module.exports = eventEmitter;
