
/**
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 *
 * Implements a basic publish/subscribe system with a similar API to redis
 */


//// EXTERNAL MODULES

var _ = require('lodash');
var minimatch = require("minimatch");


//// LOCAL VARIABLES

var handlers = [];


//// LOCAL FUNCTIONS

var subscribe = function(handler, channelGlob) {
  handlers.push({
    pattern:  new minimatch.Minimatch(channelGlob),
    glob:     channelGlob,
    func:     handler,
  });
};

var unsubscribe = function(handler, channelGlob) {
  var where = {func: handler};
  if (channelGlob) {
    where.glob = channelGlob;
  }
  _.remove(handlers, where);
};

var publish = function(message, channel) {
  var sentTo = 0;
  _.each(handlers, function(handler) {
    if (handler.pattern.match(channel)) {
      handler.func(message);
      sentTo++;
    }
  });
  return sentTo;
};


//// EXPORTS

module.exports.subscribe = subscribe;
module.exports.unsubscribe = unsubscribe;
module.exports.publish = publish;
module.exports.handlers = handlers;

