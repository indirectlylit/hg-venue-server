

// Devon Rueckner
// The Human Grid
// All Rights Reserved


var _ = require('lodash');
var path = require('path');


var app_gpio = require("./app.gpio");
var app_serverStats = require("./app.serverStats");
var app_logger = require("./app.logger");
var app_web = require("./app.web");


app_web.route('get', '/', function(req, res) {
  // render the index with all templates embedded; also auto-load view files
  app_web.loadFiles('templates', '.hjs', function(err, templateData) {
    if (err) {
      console.log("Error:", err);
      return res.json(500, err);
    }
    app_web.loadFiles(path.join('public', 'js', 'views'), '.js', function(err, viewData) {
      if (err) {
        console.log("Error:", err);
        return res.json(500, err);
      }
      app_logger.getInfo(function(err, logger_info) {
        if (err) {
          console.log("Error:", err);
          return res.json(500, err);
        }
        // gets put in app.state on the client
        var initState = {
          logger_info:    logger_info,
          wave_info:      app_gpio.getWaveInfo(),
          serverStats:    app_serverStats.getStats()
        };
        console.log(viewData);
        res.render('index', {
          templateData: templateData,
          viewData: viewData,
          initState: JSON.stringify(initState)
        });
      });
    });
  });
});

app_web.route('put', '/api/squarewave/', function(req, res) {
  var state = req.body;
  if (!_.contains([true, false], state)) {
    var err = "'on' must be true or false";
    console.log("Error:", err);
    return res.json(400, err);
  }
  app_gpio.outputSquareWave(state, function(err) {
    if (err) {
      console.log("Error:", err);
      return res.json(500, err);
    }
    res.json(state);
  });
});

app_web.route('put', '/api/logger/start', function(req, res) {
  app_logger.startLogging(function(err, state){
    if (err) {
      console.log("Error:", err);
      return res.json(500, err);
    }
    res.json(state);
  });
});

app_web.route('put', '/api/logger/stop', function(req, res) {
  app_logger.stopLogging(function(err, state){
    if (err) {
      console.log("Error:", err);
      return res.json(500, err);
    }
    res.json(state);
  });
});

app_web.route('put', '/api/logger/reset', function(req, res) {
  app_logger.reset(function(err, state){
    if (err) {
      console.log("Error:", err);
      return res.json(500, err);
    }
    res.json(state);
  });
});

app_web.route('post', '/api/logger/save_as', function(req, res) {
  app_logger.saveAs(req.body, function(err){
    if (err) {
      console.log("Error:", err);
      return res.json(500, err);
    }
    app_logger.getInfo(function(err, file_info) {
      res.json(file_info);
    });
  });
});

app_web.route('put', '/api/logger/external', function(req, res) {
  if (!_.contains([true, false], req.body)) {
    var err = "'on' must be true or false";
    console.log("Error:", err);
    return res.json(400, err);
  }
  app_logger.setExternal(req.body, function(err, state){
    if (err) {
      console.log("Error:", err);
      return res.json(400, err);
    }
    app_logger.getInfo(function(err, file_info) {
      res.json(file_info);
    });
  });
});

app_web.route('get', '/api/socket_ready', function(req, res) {
  res.json(app_web.socketReady());
});

