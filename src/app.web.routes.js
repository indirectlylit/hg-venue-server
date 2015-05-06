

// Devon Rueckner
// The Human Grid
// All Rights Reserved


var _ = require('lodash');
var path = require('path');


var app_gpio = require("./app.gpio");
var app_logger = require("./app.logger");
var app_serverStats = require("./app.serverStats");
var app_settings = require("./app.settings");
var app_web = require("./app.web");
var app_web_routes_logger = require("./app.web.routes.logger");


var base = function(baseName, req, res) {
  // render the index with all templates embedded; also auto-load view files
  app_web.loadFiles('templates/inner', '.hjs', function (err, templateData) {
    if (err) {
      console.log("Error:", err);
      return res.json(500, err);
    }
    app_web.loadFiles(path.join('public', 'js', 'views'), '.js', function (err, viewData) {
      if (err) {
        console.log("Error:", err);
        return res.json(500, err);
      }
      app_logger.getState(function (err, logger_info) {
        if (err) {
          console.log("Error:", err);
          return res.json(500, err);
        }
        // gets put in app.state on the client
        var initState = {
          logger_info:    logger_info,
          wave_info:      app_gpio.getWaveInfo(),
          serverStats:    app_serverStats.getStats(),
          labels:         app_settings.get('labels'),
        };
        res.render('templates/'+baseName, {
          templateData: templateData,
          viewData: viewData,
          initState: JSON.stringify(initState)
        });
      });
    });
  });
};

app_web.route('get', '/', function (req, res) {
  base('index', req, res);
});

app_web.route('get', '/admin', function (req, res) {
  base('admin', req, res);
});

app_web.route('get', '/labels', function (req, res) {
  base('labels', req, res);
});

app_web.route('put', '/api/squarewave/', function (req, res) {
  var state = req.body;
  if (!_.contains([true, false], state)) {
    var err = "'on' must be true or false";
    console.log("Error:", err);
    return res.json(400, err);
  }
  app_gpio.outputSquareWave(state, function (err) {
    if (err) {
      console.log("Error:", err);
      return res.json(500, err);
    }
    res.json(state);
  });
});


app_web.route('get', '/api/socket_ready', function (req, res) {
  res.json(app_web.socketReady());
});
