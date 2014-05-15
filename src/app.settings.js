

var _ = require('lodash');
var fs = require('fs');
var os = require('os');
var path = require('path');





var CONFIG_FILE = path.join(os.tmpdir(), "venue_server_config.json");

defaults = {
  log_file_name : '',
  log_external : true,
  output_square_wave : false,
  client_update_period : 1000, // ms
};

var settings = {};

function resetSync() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(settings));
  settings = _.clone(defaults);
  console.log("Reset to default settings: "+CONFIG_FILE);
}

// Load the previous settings if they are less than a week old
try {
  var a_week = 1000*60*60*24*7; // in ms
  if (Date.now() - fs.statSync(CONFIG_FILE).mtime.getTime() < a_week) {
    settings = JSON.parse(fs.readFileSync(CONFIG_FILE));
    _.defaults(settings, defaults);
    console.log("Loaded existing settings from "+CONFIG_FILE);
  }
  else {
    resetSync();
  }
}
catch (e) {
  resetSync();
}


module.exports.get = function(key) {
  if (key === undefined) {
    return settings;
  }
  if (!_.has(settings, key)) {
    throw("'" + key + "' is not a setting.");
  }
  return settings[key];
};

module.exports.set = function(key, value, callback) {
  if (!_.has(settings, key)) {
    callback("'" + key + "' is not a setting.");
  }
  if (settings[key] === value) {
    callback();
  }
  settings[key] = value;
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings), function(){callback();});
};

module.exports.reset = function(callback) {
  settings = _.clone(defaults);
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings), callback);
};
