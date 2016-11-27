

// Devon Rueckner
// The Human Grid
// All Rights Reserved


var _ = require('lodash');
var path = require('path');


var app_disklogger = require("./app.disklogger");
var app_stats_server = require("./app.stats.server");
var app_settings = require("./app.settings");
var app_web = require("./app.web");
var app_web_routes_logger = require("./app.web.routes.logger");
var MachineKinds = require("./app.constants").MachineKinds;


var bootstrapAdmin = function(baseName, req, res) {
  var viewsDir = path.join('public', 'admin', 'views');
  // render the index with all templates embedded; also auto-load view files
  app_web.loadFiles(viewsDir, '.hjs', function (err, templateData) {
    if (err) {
      console.log("Error:", err);
      return res.json(500, err);
    }
    app_web.loadFiles(viewsDir, '.js', function (err, viewData) {
      if (err) {
        console.log("Error:", err);
        return res.json(500, err);
      }
      app_disklogger.getState(function (err, logger_info) {
        if (err) {
          console.log("Error:", err);
          return res.json(500, err);
        }
        // gets put in app.state on the client
        var initState = {
          logger_info:    logger_info,
          serverStats:    app_stats_server.getStats(),
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

// handled as a static file out of public
// app_web.route('get', '/', function (req, res) {
//   res.sendfile('index-overview.html');
// });

app_web.route('get', '/admin', function (req, res) {
  bootstrapAdmin('index-admin', req, res);
});

app_web.route('get', '/labels', function (req, res) {
  res.render('templates/index-labels');
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

  var type = newLabels.length === 1 ? MachineKinds.BIKE : MachineKinds.AC;
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
