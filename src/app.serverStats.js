

// Devon Rueckner
// The Human Grid
// All Rights Reserved



//// EXTERNAL MODULES

var _ = require('lodash');
var cp = require('child_process');
var os = require('os');


//// INTERNAL MODULES

var app_logger = require('./app.logger');


//// LOCAL VARIABLES

var startTime = (new Date()).getTime();

var stats = {
  arch : os.arch(),
  totalmem : (os.totalmem()/Math.pow(2, 10)).toFixed(0), // KB
  totaldisk : null,                                      // KB
  freedisk : null                                        // KB
};


//// LOCAL FUNCTIONS

var retrieveDiskSpace = function() {
  cp.exec("df -k  " + app_logger.dataDir(), function(error, stdout, stderr) {
    if (error) {
      stats.totaldisk = null;
      stats.freedisk = null;
      console.log("Could not retrieve disk space:", stderr.toString());
    }
    else {
      // stdout will return something like:
      //   Filesystem                 1K-blocks    Used Available Use% Mounted on
      //   /dev/mapper/precise32-root  82711212 2410284  76158644   4% /
      var metrics = stdout.toString().split("\n")[1].split(/\s+/);
      stats.totaldisk = metrics[1];
      stats.freedisk = metrics[3];
    }
  });
};

getStats = function() {
  var now = new Date();
  return _.merge(stats, {
    logs_overloaded : app_logger.overloaded(),
    freemem : (os.freemem()/Math.pow(2, 10)).toFixed(0),      // KB
    loadavg : os.loadavg(),                                   // 3-tuple of percentages
    uptime : os.uptime().toFixed(0),                          // seconds
    appUptime : ((now.getTime()-startTime)/1000).toFixed(0),  // seconds
    time : now.getTime()                                      // ms since 1970
  });
};


//// MODULE LOGIC

retrieveDiskSpace();

setInterval(function() {
  retrieveDiskSpace();
}, 2500);


//// EXPORTS

module.exports.getStats = getStats;
