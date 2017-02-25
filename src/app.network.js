
// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');
var events = require('events');


//// INTERNAL MODULES

var app_logger = require("./app.logger");
var app_network_serial = require("./app.network.serial");
var app_network_udp = require("./app.network.udp");
var validateMsg = require("./app.network.validate");
var app_settings = require("./app.settings");
var app_web = require("./app.web");


//// LOCAL VARIABLES

var eventEmitter = new events.EventEmitter();


//// HELPERS

var _paddedString = function(number) {
  if (number <= 10000) {
    return ("000"+number).slice(-5);
  }
  return ''+number;
};

var handleIncomingData = function(message, address) {
  var data = {};
  try {
    data.msg = JSON.parse(message);
    validateMsg(data.msg);
  }
  catch(e) {
    app_logger.error('Malformed data from', address, '|', e, '| Message:', message);
    return;
  }

  // for replaying old data
  if (data.msg.address) {
    address = data.msg.address;
    delete data.msg.address;
  }

  // UIDs are sometimes not reported or reported as negative numbers
  data.msg.uid = data.msg.uid || 0;
  data.msg.uid = Math.abs(data.msg.uid);

  // turn it into a string so it can be used as a JSON key
  data.msg.uid = _paddedString(data.msg.uid);

  data.address = address;
  data.size = message.length;

  if (data.msg.ping) {
    eventEmitter.emit('ping', data);
  } else {
    eventEmitter.emit('data', data);
  }
};


//// MODULE LOGIC

app_network_udp.on('message', function (msg, rinfo) {
  handleIncomingData(msg.toString(), rinfo.address);
});

app_network_serial.on('data', function (data) {
  handleIncomingData(data.toString(), 'serial');
});


//// EXPORTS

// emits 'data', 'stats', 'labels', and 'ping' events
module.exports = eventEmitter;
