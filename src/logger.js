
/**
 * Deal with writing data
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


var _ = require('lodash');
var os = require('os');
var fs = require('fs');
var path = require('path');
var events = require('events');


exports.dirwatch = new events.EventEmitter();


var TEMP_FILE = path.join(os.tmpdir(), "venue_server_data-tmp.txt");
var DATA_DIR = path.join(os.tmpdir(), "venue_server_data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}


var tempLog = fs.createWriteStream(TEMP_FILE);

var hasData = false;

var refreshDirs = function () {
  fs.readdir(DATA_DIR, function(err, files) {
    if (err) {
      console.log("Could not list files:", err);
      return;
    }
    fileData = [];
    _.each(files, function(fileName) {
      stats = fs.statSync(path.join(DATA_DIR, fileName));
      fileData.push({
        name: fileName,
        size: stats.size,
        ctime: stats.ctime.getTime()
      });
    });
    exports.dirwatch.emit('change', _.sortBy(fileData, 'mtime'));
  });
};

// fs.watch(DATA_DIR, refreshDirs);



exports.triggerRefresh = refreshDirs;

