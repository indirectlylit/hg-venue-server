

var _ = require('lodash');
var fs = require('fs');
var os = require('os');
var path = require('path');





var CONFIG_FILE = path.join(os.tmpdir(), "venue_server_config.json");

defaults = {
  log_file_name : '',
  outputSquareWave : true,
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
    throw("'" + key + "' is not a setting.");
  }
  settings[key] = value;
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings), callback);
};

module.exports.reset = function(callback) {
  settings = _.clone(defaults);
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings), callback);
};
