
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

