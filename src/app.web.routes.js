

// Devon Rueckner
// The Human Grid
// All Rights Reserved


var _ = require('lodash');


var app_gpio = require("./app.gpio");
var app_logger = require("./app.logger");
var app_web = require("./app.web");


app_web.route('get', '/', function(req, res) {
  // render the index with all templates embedded
  app_web.loadClientTemplates(function(err, templateData) {
    if (err) {
      throw err;
    }
    app_logger.getFileInfo(function(err, saved_file_info) {
      if (err) {
        throw err;
      }
      app_logger.getState(function(err, recording_state) {
        if (err) {
          throw err;
        }
        var initData = {
          log_location:     app_logger.getLocationInfo(),
          log_info:         saved_file_info,
          recording_state:  recording_state
        };
        res.render('index', { templateData: templateData, initData: JSON.stringify(initData) });
      });
    });
  });
});

app_web.route('put', '/api/squarewave/', function(req, res) {
  var state = req.body.state;
  if (!_.contains([true, false], state)) {
    throw("'state' must be true or false\n");
  }
  app_gpio.outputSquareWave(state, function(err) {
    res.json({'state':state});
  });
});

app_web.route('put', '/api/logger/start', function(req, res) {
  app_logger.startLogging(function(err, state){
    if (err) {
      return res.json(500, err);
    }
    res.json(state);
  });
});

app_web.route('put', '/api/logger/stop', function(req, res) {
  app_logger.stopLogging(function(err, state){
    if (err) {
      return res.json(500, err);
    }
    res.json(state);
  });
});

app_web.route('put', '/api/logger/reset', function(req, res) {
  app_logger.reset(function(err, state){
    if (err) {
      return res.json(500, err);
    }
    res.json(state);
  });
});

app_web.route('post', '/api/logger/save_as/:name', function(req, res) {
  app_logger.saveAs(req.params.name, function(err){
    if (err) {
      return res.json(500, err);
    }
    app_logger.getFileInfo(function(err, file_info) {
      res.json(file_info);
    });
  });
});

app_web.route('put', '/api/logger/external', function(req, res) {
  app_logger.setExternal(req.body.state, function(err, state){
    if (err) {
      return res.json(500, err);
    }
    res.json(state);
  });
});

