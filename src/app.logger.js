

// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');
var events = require('events');


//// LOCAL VARIABLES

var eventEmitter = new events.EventEmitter();


//// LOCAL FUNCTIONS

function log(level, args) {
  // convert arguments object to Array and concatenate as strings
  var message = Array.prototype.slice.call(args).join(' ');
  console.log((new Date()).toISOString(), '-', level, '-', message);
  var data = {
    level: level,
    message: message,
  };
  eventEmitter.emit('log', data);
};


//// EXPORTS

module.exports = {
  debug: function() {
    log('DEBUG', arguments);
  },
  info: function() {
    log('INFO', arguments);
  },
  warn: function() {
    log('WARNING', arguments);
  },
  error: function() {
    log('ERROR', arguments);
  },
  eventEmitter: eventEmitter,
};
