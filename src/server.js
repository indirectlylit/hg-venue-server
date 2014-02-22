

// Devon Rueckner
// The Human Grid
// All Rights Reserved



var _ = require('lodash');
var fs = require("fs");
var os = require('os');
var path = require('path');


var settings = require("./settings");
var serverStats = require("./serverStats");
var logger = require("./logger");
var webServer = require("./webServer");


webServer.route('get', '/', function(req, res) {
  // render the index with all templates embedded
  webServer.loadClientTemplates(function(err, templateData) {
    if (err) {
      throw err;
    }
    logger.getFileInfo(function(err, saved_file_info) {
      if (err) {
        throw err;
      }
      logger.state(function(err, recording_state) {
        if (err) {
          throw err;
        }
        var initData = {
          log_location:     logger.rootDir,
          log_info:         saved_file_info,
          recording_state:  recording_state
        };
        res.render('index', { templateData: templateData, initData: JSON.stringify(initData) });
      });
    });
  });
});

webServer.route('get', '/settings/:key', function(req, res) {
  res.json(settings.get(req.params.key));
});

webServer.route('get', '/settings', function(req, res) {
  res.json(settings.get());
});

webServer.route('get', '/settings-reset', function(req, res) {
  settings.reset(function(err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(settings.get());
  });
});

webServer.route('put', '/settings/:key', function(req, res) {
  console.log(req.params.key, req.body.value);
  settings.set(req.params.key, req.body.value, function(err) {
    if (err) throw("Could not set: " + err);
    res.json(settings.get());
  });
});

webServer.route('get', '/logger/start', function(req, res) {
  logger.startLogging(function(err){
    if (err) {
      return res.json(500, err);
    }
    res.json("OK");
  });
});

webServer.route('get', '/logger/stop', function(req, res) {
  logger.stopLogging(function(err){
    if (err) {
      return res.json(500, err);
    }
    res.json("OK");
  });
});

webServer.route('get', '/logger/reset', function(req, res) {
  logger.reset(function(err){
    if (err) {
      return res.json(500, err);
    }
    res.json("OK");
  });
});

webServer.route('get', '/logger/save_as/:name', function(req, res) {
  logger.saveAs(req.params.name, function(err){
    if (err) {
      return res.json(500, err);
    }
    logger.getFileInfo(function(err, file_info) {
      res.json(file_info);
    });
  });
});


var dataBuffer = {};

function handleIncomingData(message, address) {
  var isodate = new Date().toISOString();
  var data = {};

  try {
    data = JSON.parse(message);
  } catch(e) {
    err = isodate + "\t" + address + "\t" + message + '\n';
    console.log("Not JSON:\t"+err);
    return;
  }

  // console.log(message);

  if (!data['timestamp']) {
    data['timestamp'] = isodate;
  }
  if (!data['address']) {
    data['address'] = address;
  }
  else {
    address = data['address'];
  }
  if (!data['size']) {
    data['size'] = message.length;
  }

  if (!dataBuffer[address]) {
    dataBuffer[address] = [];
  }

  dataBuffer[address].push(data);

  logger.write(data);
}



var udpServer = require("./udpServer").udpServer;

udpServer.on("message", function (msg, rinfo) {
  handleIncomingData(msg.toString(), rinfo.address);
});


var serialServer = require("./serialServer").serialServer;

serialServer.on("data", function(data) {
  handleIncomingData(data.toString(), "serial port");
});



// sensor stats
setInterval(function() {
  var windowOfStats = {};
  _.forEach(dataBuffer, function(data, key) {


    // find message rate
    var stats = {};
    stats['message_rate'] = 1000*1.0*data.length/settings.get('client_update_period');


    // find average message size and max data rate
    var minInterval = 0;

    totalBytes = 0;
    _.forEach(data, function(message, index) {
      totalBytes += message['size'];
      minInterval += message['data']['interval'];
    });

    minInterval /= data.length; // average
    // prevent divide-by-zero issue
    minInterval = minInterval === 0 ? 1e-9 : minInterval;
    stats['max_rate'] = 1e6 / minInterval; // interval in microseconds to Hz
    stats['data_rate'] = 1000*1.0*totalBytes/settings.get('client_update_period');
    stats['avg_size'] = totalBytes/data.length;


    // find dropped messages
    var dropped = 0;
    var counterList = _.pluck(_.pluck(data, 'data'), 'counter');

    counterList.sort();
    for (i = 1; i < counterList.length; i++) {
        if (counterList[i]-1 != counterList[i-1]) {
          dropped += counterList[i] - counterList[i-1];
        }
    }
    stats['drop_rate'] = 1000*(dropped/settings.get('client_update_period'));

    windowOfStats[key] = stats;
  });
  webServer.writeToWebSockets('sensorStats', windowOfStats);
  dataBuffer = {};
}, settings.get('client_update_period'));



// server stats
setInterval(function() {
  var stats = serverStats.getStats();
  webServer.writeToWebSockets('serverStats', stats);
  logger.write(stats);
}, 1000);




