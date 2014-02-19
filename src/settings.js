

var _ = require('lodash');
var os = require('os');
var fs = require('fs');
var path = require('path');


var CONFIG_FILE = path.join(os.tmpdir(), "venue_server_config.json");

defaults = {
  custom_log_directory : null,
  client_update_period : 1000, // ms
};

var settings = {};

try {
  settings = JSON.parse(fs.readFileSync(CONFIG_FILE));
  _.defaults(settings, defaults);
}
catch (e) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaults));
  settings = _.clone(defaults);
}


exports.get = function(key) {
  return settings[key];
};

exports.set = function(key, value, callback) {
  settings[key] = value;
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings), callback);
};

exports.reset = function(callback) {
  settings = _.clone(defaults);
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings), callback);
};
