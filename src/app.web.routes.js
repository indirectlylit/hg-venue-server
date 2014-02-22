

// Devon Rueckner
// The Human Grid
// All Rights Reserved


var _ = require('lodash');

var app_settings = require("./app.settings");
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
      app_logger.state(function(err, recording_state) {
        if (err) {
          throw err;
        }
        var initData = {
          log_location:     app_logger.rootDir,
          log_info:         saved_file_info,
          recording_state:  recording_state
        };
        res.render('index', { templateData: templateData, initData: JSON.stringify(initData) });
      });
    });
  });
});

app_web.route('get', '/settings/:key', function(req, res) {
  res.json(app_settings.get(req.params.key));
});

app_web.route('get', '/settings', function(req, res) {
  res.json(app_settings.get());
});

app_web.route('get', '/settings-reset', function(req, res) {
  settings.reset(function(err) {
    if (err) {
      return res.json(500, err);
    }
    res.json(app_settings.get());
  });
});

app_web.route('put', '/settings/:key', function(req, res) {
  console.log(req.params.key, req.body.value);
  settings.set(req.params.key, req.body.value, function(err) {
    if (err) throw("Could not set: " + err);
    res.json(app_settings.get());
  });
});

app_web.route('get', '/logger/start', function(req, res) {
  app_logger.startLogging(function(err){
    if (err) {
      return res.json(500, err);
    }
    res.json("OK");
  });
});

app_web.route('get', '/logger/stop', function(req, res) {
  app_logger.stopLogging(function(err){
    if (err) {
      return res.json(500, err);
    }
    res.json("OK");
  });
});

app_web.route('get', '/logger/reset', function(req, res) {
  app_logger.reset(function(err){
    if (err) {
      return res.json(500, err);
    }
    res.json("OK");
  });
});

app_web.route('get', '/logger/save_as/:name', function(req, res) {
  app_logger.saveAs(req.params.name, function(err){
    if (err) {
      return res.json(500, err);
    }
    app_logger.getFileInfo(function(err, file_info) {
      res.json(file_info);
    });
  });
});

