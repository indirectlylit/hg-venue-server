
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
    callback(null, fileStream);
  });
};

exports.stopLogging = function(callback) {
  if (!fileStream) {
    return callback("Not logging.");
  }
  fileStream.end(function(err){
    fileStream = null;
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
    fs.rename(tempFileName, path.join(dataDir, name), callback);
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


