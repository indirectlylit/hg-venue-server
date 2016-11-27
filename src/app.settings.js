
//// EXTERNAL MODULES

var _ = require('lodash');
var fs = require('fs');
var os = require('os');
var path = require('path');

var MachineKinds = require("./app.constants").MachineKinds;
var app_logger = require("./app.logger");


//// LOCAL VARIABLES

var externalDir = _.find(["/media/usbhdd", "/vagrant", "../"], fs.existsSync);
var CONFIG_FILE = path.join(externalDir, "venue_server_settings.json");

var defaults = {
  log_external: true,
  client_update_period: 650, // ms
  labels: {},
};

defaults.labels[MachineKinds.BIKE] = {};
defaults.labels[MachineKinds.AC] = {};

var settings = {};


//// LOCAL FUNCTIONS

function get(key) {
  if (key === undefined) {
    return settings;
  }
  if (!_.has(settings, key)) {
    throw("'" + key + "' is not a setting.");
  }
  return _.cloneDeep(settings[key]);
}

function set(key, value, callback) {
  if (!_.has(settings, key)) {
    if (callback) {
      callback("'" + key + "' is not a setting.");
    }
  }
  if (_.isEqual(settings[key], value)) {
    if (callback) {
      callback();
    }
    return;
  }
  settings[key] = value;
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings, null, 2), function () {
    if (callback) {
      callback();
    }
  });
}

function reset(callback) {
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings, null, 2), callback);
  settings = _.clone(defaults);
}

function resetSync() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(settings, null, 2));
  settings = _.clone(defaults);
  app_logger.info("Reset to default settings: "+CONFIG_FILE);
}


//// MODULE LOGIC

// Load the previous settings if they are less than a week old
try {
  var a_week = 1000*60*60*24*7; // in ms
  if (Date.now() - fs.statSync(CONFIG_FILE).mtime.getTime() < a_week) {
    settings = JSON.parse(fs.readFileSync(CONFIG_FILE));
    _.defaults(settings, defaults);
    app_logger.info("Loaded existing settings from "+CONFIG_FILE);
  }
  else {
    resetSync();
  }
}
catch (e) {
  app_logger.error("Couldn't read settings file", CONFIG_FILE, e);
  resetSync();
}


//// EXPORTS

module.exports.get = get;
module.exports.set = set;
module.exports.reset = reset;
module.exports.externalDir = externalDir;
