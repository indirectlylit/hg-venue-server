
/**
 * Deal with writing data
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */

process.env.TZ = 'America/New_York';

var _ = require('lodash');
var os = require('os');
var fs = require('fs');
var path = require('path');
var async = require('async');
var events = require('events');


var EXTERNAL = "/media/usbhdd";

var rootDir = fs.existsSync(EXTERNAL) ? EXTERNAL : os.tmpdir();
var dataDir = path.join(rootDir, "data");

if (!fs.existsSync(rootDir)) {
  fs.mkdirSync(rootDir);
}


var tempFileName = path.join(rootDir, "tempdata.log");
var fileStream = null;
var startTime = null;
var stopTime = null;


var recordingTime = function() {
  if (!startTime) {
    return 0;
  }
  if (startTime && !stopTime) {
    var now = new Date();
    return startTime - now;
  }
  return startTime - stopTime;
};

exports.getFileInfo = function(callback) {
  fs.readdir(dataDir, function(err, fileNames) {
    if (err) {
      console.log("Could not list files:", err);
      callback(err);
    }

    // maps the list of filenames to a list of data
    // important: IDs and pre-compiled client-side templates
    async.map(
      fileNames,
      function (fName, callback) {
        fs.stat(path.join(dataDir, fName), function(err, stats){
          callback(err, {
            name: fName,
            size: stats.size,
            time: new Date(stats.ctime.getTime())
          });
        });
      },

      function(err, fileStats) {
        callback(err, fileStats);
      }
    );

  });
};


exports.rootDir = rootDir;

exports.startLogging = function(callback) {
  if (fileStream) {
    return callback("Already logging.");
  }
  fs.exists(tempFileName, function(err, exists) {
    if (exists) {
      return callback("Already exists");
    }
    fileStream = fs.createWriteStream(tempFileName);
    startTime = new Date();
    stopTime = null;
    callback(null);
  });
};

exports.stopLogging = function(callback) {
  if (!fileStream) {
    return callback("Not logging.");
  }
  fileStream.end(function(err){
    fileStream = null;
    stopTime = new Date();
    callback();
  });
};

exports.reset = function(callback) {
  if (fileStream) {
    return callback("Currently logging.");
  }
  fs.exists(tempFileName, function(err, exists) {
    if (!exists) {
      return callback("Nothing to reset");
    }
    startTime = null;
    stopTime = null;
    fs.unlink(tempFileName, callback);
  });
};

exports.saveAs = function(name, callback) {
  if (fileStream) {
    return callback("currently logging");
  }
  fs.exists(tempFileName, function(err, exists) {
    if (!exists) {
      return callback("No data written");
    }
    startTime = null;
    stopTime = null;
    fs.rename(tempFileName, path.join(dataDir, encodeURI(name)), callback);
  });
};

exports.state = function(callback) {
  fs.exists(tempFileName, function(err, exists) {
    if (err) {
      return callback(err);
    }
    // reset state
    if (!exists) {
      return callback(null, {
        'exists' : false,
        'recording' : false,
        'time' : 0,
        'bytes': 0
      });
    }
    // currently recording
    else if (fileStream) {
      return callback(null, {
        'exists' : true,
        'recording' : true,
        'time' : recordingTime(),
        'bytes': fileStream.bytesWritten
      });
    }
    // temp file written
    else {
      fs.stat(tempFileName, function(err, stats) {
        callback(null, {
          'exists' : true,
          'recording' : false,
          'time' : recordingTime(),
          'bytes': stats.size
        });
      });
    }
  });
};

exports.log = function(data, callback) {
  if (fileStream) {
    fileStream.write(JSON.stringify(data), callback);
  }
  else {
    callback("not currently logging");
  }
};


