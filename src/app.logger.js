
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
var fs = require('fs');
var os = require('os');
var path = require('path');


//// INTERNAL MODULES

var app_settings = require('./app.settings');


//// LOCAL VARIABLES

var isExternal;
var rootDir;
var fileStream;
var startTime;
var stopTime;


//// LOCAL FUNCTIONS

var dataDir = function() {
  return path.join(rootDir, "data");
};

var tempFileName = function() {
  return path.join(rootDir, "tempdata.txt");
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
    return startTime - now;
  }
  return startTime - stopTime;
};

var getFileList = function(callback) {
  fs.readdir(dataDir(), function(err, fileNames) {
    if (err) {
      console.log("Could not list files:", err);
      callback(err);
    }

    // maps the list of filenames to a list of data
    // important: IDs and pre-compiled client-side templates
    async.map(
      fileNames,
      function (fName, callback) {
        fs.stat(path.join(dataDir(), fName), function(err, stats){
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

var getLocationInfo = function() {
  return {
    external: isExternal,
    directory: rootDir
  };
};

var startLogging = function(callback) {
  if (fileStream) {
    return callback("Already logging.");
  }
  fs.exists(tempFileName(), function(exists) {
    if (exists) {
      return callback("Already exists");
    }
    fileStream = fs.createWriteStream(tempFileName());
    startTime = new Date();
    stopTime = null;
    getRecordingState(callback);
  });
};

var stopLogging = function(callback) {
  if (!fileStream) {
    return callback("Not logging.");
  }
  fileStream.end(function(err){
    fileStream = null;
    stopTime = new Date();
    getRecordingState(callback);
  });
};

var reset = function(callback) {
  if (fileStream) {
    return callback("Currently logging.");
  }
  fs.exists(tempFileName(), function(exists) {
    if (!exists) {
      return callback("Nothing to reset "+tempFileName());
    }
    startTime = null;
    stopTime = null;
    fs.unlink(tempFileName(), function(err) {
      if (err) {
        callback(err);
      }
      getRecordingState(callback);
    });
  });
};

var saveAs = function(name, callback) {
  if (fileStream) {
    return callback("currently logging");
  }
  fs.exists(tempFileName(), function(exists) {
    if (!exists) {
      return callback("No data written");
    }
    startTime = null;
    stopTime = null;
    fs.rename(tempFileName(), path.join(dataDir(), encodeURI(name)), callback);
  });
};

var getRecordingState = function(callback) {
  fs.exists(tempFileName(), function(exists) {
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
      fs.stat(tempFileName(), function(err, stats) {
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

var write = function(data) {
  if (fileStream) {
    var ok = fileStream.write(JSON.stringify(data)+'\n');
    if (!ok) {
      console.log("slow down please!");
    }
  }
};

var setExternalWithChecks = function(external, callback) {
  getRecordingState(function(err, state) {
    if (state.recording) {
      callback("Cannot change directory while recording.");
      return;
    }
    result = setExternalSync(external);
    app_settings.set('log_external', result.external, function(err) {
      callback(err, result);
    });
  });
};


var getInfo = function(callback) {
  var info = {
    'location' : getLocationInfo()
  };
  getFileList(function(err, saved_file_info) {
    if (err) {
      callback(err);
      return;
    }
    info.saved_files = saved_file_info;
    getRecordingState(function(err, recording_state) {
      if (err) {
        callback(err);
        return;
      }
      info.recording_state = recording_state;
      callback(null, info);
    });
  });
};



//// MODULE LOGIC

process.env.TZ = 'America/New_York';
setExternalSync(app_settings.get('log_external'));


//// EXPORTS

module.exports.getInfo            = getInfo;
module.exports.setExternal        = setExternalWithChecks;

module.exports.write              = write;
module.exports.stopLogging        = stopLogging;
module.exports.startLogging       = startLogging;
module.exports.reset              = reset;
module.exports.saveAs             = saveAs;
