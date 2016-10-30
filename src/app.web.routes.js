

// Devon Rueckner
// The Human Grid
// All Rights Reserved


var _ = require('lodash');
var path = require('path');


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
  base('index-labels', req, res);
});

app_web.route('get', '/api/socket_ready', function (req, res) {
  res.json(app_web.socketReady());
});

app_web.route('put', '/api/labels/:uid', function (req, res) {
  var newLabels = req.body;
  console.log("Put labels", req.params.uid, newLabels);

  if (!newLabels) {
    var err = "No labels sent"
    console.log(err);
    res.json(400, err);
  }

  var type = newLabels.length == 1 ? 'bikes' : 'ac';
  var currentLabels = app_settings.get('labels');
  _.forEach(currentLabels[type], function(labels, uid) {
    if (uid == req.params.uid) {
      currentLabels[type][uid] = newLabels;
    }
  });
  app_settings.set('labels', currentLabels, function(err) {
    if (err) {
      res.json(500, err);
    }
    else {
      res.json({});
    }
  });
});
