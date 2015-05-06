
//// EXTERNAL MODULES

var _ = require('lodash');
var fs = require('fs');
var os = require('os');
var path = require('path');


//// LOCAL VARIABLES

var CONFIG_FILE = path.join(os.tmpdir(), "venue_server_config.json");

var defaults = {
  log_external : true,
  output_square_wave : false,
  client_update_period : 650, // ms
  labels : {
    "bikes": [
      {
        "id": "27805",
        "label": "Bike X"
      },
    ],  // list of objects: {id:___, label:___}
    "ac": [
      {
        "id": "4247",
        "labels": [null, "AC ONE", null, null]
      },
      {
        "id": "4246",
        "labels": ["AA", "AC TWO", "CC", "DD"]
      },
    ],   // list of objects: {id:___, labels:[___, ___, ___, ___]}
  },
};

var settings = {};


//// LOCAL FUNCTIONS

function get(key) {
  if (key === undefined) {
    return settings;
  }
  if (!_.has(settings, key)) {
    throw("'" + key + "' is not a setting.");
  }
  return settings[key];
}

function set(key, value, callback) {
  if (!_.has(settings, key)) {
    callback("'" + key + "' is not a setting.");
  }
  if (settings[key] === value) {
    callback();
  }
  settings[key] = value;
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings), function (){callback();});
}

function reset(callback) {
  fs.writeFile(CONFIG_FILE, JSON.stringify(settings), callback);
  settings = _.clone(defaults);
}

function resetSync() {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(settings));
  settings = _.clone(defaults);
  console.log("Reset to default settings: "+CONFIG_FILE);
}


//// MODULE LOGIC

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
  console.log("Couldn't read settings file", CONFIG_FILE, e);
  resetSync();
}


//// EXPORTS

module.exports.get = get;
module.exports.set = set;
module.exports.reset = reset;
