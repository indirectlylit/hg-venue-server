
/**
 * Deal with writing data
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 *
 * !!!!!!!!!!!!!!!
 * TODO: remove usage of 'fs.exists' which  may cause race conditions. see Node docs.
 * !!!!!!!!!!!!!!!
 */


//// EXTERNAL MODULES

var _ = require('lodash');
var async = require('async');
var crypto = require('crypto');
var fs = require('fs');
var os = require('os');
var path = require('path');
var childProcess = require('child_process');

//// INTERNAL MODULES

var app_settings = require('./app.settings');


//// LOCAL VARIABLES

var isExternal;
var rootDir;
var fileStream;
var startTime;
var stopTime;
var fileNamePattern = /(.*?) - (.*)\.txt/;

var rateCalc = {
  WINDOW : 1000,
  msgsIn : 0,
  msgsOut : 0,
  rateIn : 0,
  rateOut : 0,
};


//// LOCAL FUNCTIONS

var quoteFileName = function(input) {
  // generates a URI-encoded string that is safe to use in a file name
  var SAFE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789^&'@{}[],$=!#()+_- ";
  return _.map(input, function (character) {
    if (_.contains(SAFE_CHARS, character)) { return character; }
    return '%'+(character.charCodeAt(0).toString(16));
  }).join('');
};

var unquoteFileName = function(input) {
  return decodeURIComponent(input);
};

var dataDir = function() {
  return path.join(rootDir, "data");
};

var tempFileName = function() {
  return path.join(rootDir, "tempdata.txt");
};

var genFileName = function(time, label) {
  label = label || 'untitled';
  return time.toISOString().replace(/:/g, "'") + " - " + quoteFileName(label) + ".txt";
};

var parseFileName = function(fileName) {
  var match = fileName.match(fileNamePattern);
  if (match[1] && match[2]) {
    return {
      time: new Date(match[1].replace(/'/g, ":")),
      name: unquoteFileName(match[2]),
    };
  }
  throw("Can't parse file name:", fileName);
};

var setExternalSync = function(external) {
  var externalDir = _.find(["/media/usbhdd", "/vagrant"], fs.existsSync);
  isExternal = Boolean(external && externalDir);
  if (isExternal) {
    rootDir = externalDir;
  }
  else {
    rootDir = os.tmpdir();
  }
  if (!fs.existsSync(dataDir())) {
    fs.mkdirSync(dataDir());
  }
  return getLocationInfo();
};

var recordingTime = function() {
  if (!startTime) {
    return 0;
  }
  if (startTime && !stopTime) {
    var now = new Date();
    return now - startTime;
  }
  return stopTime - startTime;
};

var getFileList = function(callback) {
  fs.readdir(dataDir(), function (err, fileNames) {
    if (err) {
      console.log("Could not list files:", err);
      callback(err);
    }

    // maps the list of filenames to a list of data
    // important: IDs and pre-compiled client-side templates
    async.map(
      fileNames,
      function (fName, callback) {
        fs.stat(path.join(dataDir(), fName), function (err, stats) {
          if (err) {
            callback(err);
            return;
          }
          var parsedName;
          try {
            parsedName = parseFileName(fName);
          }
          catch(e) {
            console.log("Error:", e);
            parsedName = {
              name: fName,
              time: new Date(stats.ctime.getTime()),
            };
          }

          // generate a document ID based on the creation time
          var shasum = crypto.createHash('sha1');
          shasum.write(parsedName.time.toString());

          callback(null, {
            id: shasum.digest('hex'),
            fName: fName,
            name: parsedName.name,
            time: parsedName.time,
            kbytes: stats.size/1024.0,
          });
        });
      },

      function(err, fileStats) {
        callback(err, fileStats);
      }
    );

  });
};

var getLocationInfo = function() {
  return {
    external: isExternal,
    directory: dataDir()
  };
};

var startLogging = function(callback) {
  if (fileStream) {
    return callback("Already logging.");
  }
  fs.exists(tempFileName(), function (exists) {
    if (exists) {
      return callback("Already exists");
    }
    fileStream = fs.createWriteStream(tempFileName());
    fileStream.on('error', function (err) {
      console.log("File stream error:", err);
    });
    fileStream.on('drain', function () {
      console.log("DRAINED");
    });
    startTime = new Date();
    stopTime = null;
    getRecordingState(callback);
  });
};

var stopLogging = function(callback) {
  if (!fileStream) {
    return callback("Not logging.");
  }
  fileStream.stopped = true;
  fileStream.end(function (err){
    if (err) {
      console.log("Could not close the file stream:", err);
      callback(err);
      return;
    }
    fileStream = null;
    stopTime = new Date();
    getRecordingState(callback);
  });
};

var reset = function(callback) {
  if (fileStream) {
    return callback("Currently logging.");
  }
  fs.exists(tempFileName(), function (exists) {
    if (!exists) {
      return callback("Nothing to reset "+tempFileName());
    }
    startTime = null;
    stopTime = null;
    fs.unlink(tempFileName(), function (err) {
      if (err) {
        callback(err);
      }
      getRecordingState(callback);
    });
  });
};

var saveAs = function(label, callback) {
  if (fileStream) {
    return callback("currently logging");
  }
  fs.exists(tempFileName(), function (exists) {
    if (!exists) {
      return callback("No data written");
    }
    if (!startTime) {
      // Temp file already existed, but server had been restarted in the meantime.
      // Could have pulled this info from the filesystem, but it's an edge case.
      startTime = new Date();
    }
    var target = path.join(dataDir(), genFileName(startTime, label));
    console.log("Rename '"+tempFileName()+"' to '"+target+"'");
    childProcess.exec('mv '+ tempFileName() + ' "' + target + '"', function (err, std_out, std_err) {
      if (!err) {
        startTime = null;
        stopTime = null;
        return callback();
      }
      callback("Couldn't rename '"+tempFileName()+"' to '"+target+"': "+err);
    });
  });
};

var getFileInfo = function(id, callback) {
  getFileList(function (err, allFileInfo) {
    if (err) return callback(err);
    var fileInfo = _.find(allFileInfo, {'id':id});
    if (!fileInfo) {
      return callback("File id not found: "+id);
    }
    callback(null, fileInfo);
  });
};

var deleteFile = function(id, callback) {
  getFileInfo(id, function (err, fileInfo) {
    if (err) return callback(err);
    fs.unlink(path.join(dataDir(), fileInfo.fName), function (err) {
      if (err) return callback(err);
      callback();
    });
  });
};

var getRecordingState = function(callback) {
  fs.exists(tempFileName(), function (exists) {
    // reset state
    if (!exists) {
      return callback(null, {
        'exists' : false,
        'recording' : false,
        'time' : 0,
        'kbytes': 0
      });
    }
    // currently recording
    else if (fileStream) {
      return callback(null, {
        'exists' : true,
        'recording' : true,
        'time' : recordingTime(),
        'kbytes': fileStream.bytesWritten/1024.0
      });
    }
    // temp file written
    else {
      fs.stat(tempFileName(), function (err, stats) {
        if (err) {
          return callback(err);
        }
        callback(null, {
          'exists' : true,
          'recording' : false,
          'time' : recordingTime(),
          'kbytes': stats.size/1024.0
        });
      });
    }
  });
};

var write = function(data) {
  if (fileStream && fileStream.fd && !fileStream.closed && !fileStream.stopped) {
    var ok = fileStream.write(data+'\n');
  }
  rateCalc.msgsIn++;
  rateCalc.msgsOut++;
};

var setExternalWithChecks = function(external, callback) {
  getRecordingState(function (err, state) {
    if (state.recording) {
      callback("Cannot change directory while recording.");
      return;
    }
    result = setExternalSync(external);
    app_settings.set('log_external', result.external, function (err) {
      callback(err, result);
    });
  });
};


var getState = function(callback) {
  var info = {
    'location' : getLocationInfo()
  };
  getFileList(function (err, saved_file_info) {
    if (err) {
      callback(err);
      return;
    }
    info.saved_files = saved_file_info;
    getRecordingState(function (err, recording_state) {
      if (err) {
        callback(err);
        return;
      }
      info.recording_state = recording_state;
      callback(null, info);
    });
  });
};

var wasOverloaded = function() {
  // TODO: fix me
  return false;
};


//// MODULE LOGIC

process.env.TZ = 'America/New_York';
setExternalSync(app_settings.get('log_external'));

setInterval(
  function recalcRates() {
    rateCalc.rateIn = 1.0 * rateCalc.msgsIn / rateCalc.WINDOW;
    rateCalc.rateOut = 1.0 * rateCalc.msgsOut / rateCalc.WINDOW;
    rateCalc.msgsOut = rateCalc.msgsIn = 0;
    // console.log("In:", rateCalc.rateIn.toFixed(3), "\tOut:", rateCalc.rateOut.toFixed(3));
  },
  rateCalc.WINDOW
);

//// EXPORTS

module.exports.dataDir            = dataDir;
module.exports.getFileInfo        = getFileInfo;
module.exports.getState           = getState;
module.exports.getRecordingState  = getRecordingState;
module.exports.setExternal        = setExternalWithChecks;
module.exports.overloaded         = wasOverloaded;

module.exports.write              = write;
module.exports.stopLogging        = stopLogging;
module.exports.startLogging       = startLogging;
module.exports.reset              = reset;
module.exports.saveAs             = saveAs;
module.exports.deleteFile         = deleteFile;
