
/**
 * Deal with writing data
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */

process.env.TZ = 'America/New_York';

var _ = require('lodash');
var async = require('async');
var fs = require('fs');
var os = require('os');
var path = require('path');


var EXTERNAL = "/media/usbhdd";
// var EXTERNAL = "/vagrant";

var rootDir = fs.existsSync(EXTERNAL) ? EXTERNAL : os.tmpdir();
var dataDir = path.join(rootDir, "data");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}


var tempFileName = path.join(rootDir, "tempdata.txt");
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

module.exports.getFileInfo = function(callback) {
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


module.exports.rootDir = rootDir;

module.exports.startLogging = function(callback) {
  if (fileStream) {
    return callback("Already logging.");
  }
  fs.exists(tempFileName, function(exists) {
    if (exists) {
      return callback("Already exists");
    }
    fileStream = fs.createWriteStream(tempFileName);
    startTime = new Date();
    stopTime = null;
    callback(null);
  });
};

module.exports.stopLogging = function(callback) {
  if (!fileStream) {
    return callback("Not logging.");
  }
  fileStream.end(function(err){
    fileStream = null;
    stopTime = new Date();
    callback();
  });
};

module.exports.reset = function(callback) {
  if (fileStream) {
    return callback("Currently logging.");
  }
  fs.exists(tempFileName, function(exists) {
    if (!exists) {
      return callback("Nothing to reset "+tempFileName);
    }
    startTime = null;
    stopTime = null;
    fs.unlink(tempFileName, callback);
  });
};

module.exports.saveAs = function(name, callback) {
  if (fileStream) {
    return callback("currently logging");
  }
  fs.exists(tempFileName, function(exists) {
    if (!exists) {
      return callback("No data written");
    }
    startTime = null;
    stopTime = null;
    fs.rename(tempFileName, path.join(dataDir, encodeURI(name)), callback);
  });
};

module.exports.state = function(callback) {
  // Note for future explorers: 'fs.exists' may cause race conditions. see Node docs.
  fs.exists(tempFileName, function(exists) {
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

module.exports.write = function(data) {
  if (fileStream) {
    var ok = fileStream.write(JSON.stringify(data)+'\n');
    if (!ok) {
      console.log("slow down please!");
    }
  }
};


