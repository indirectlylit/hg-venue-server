

// Devon Rueckner
// The Human Grid
// All Rights Reserved


var _ = require('lodash');
var path = require('path');


var app_disklogger = require("./app.disklogger");
var app_pubsub = require("./app.pubsub");
var app_web = require("./app.web");
var app_logger = require("./app.logger");



app_web.route('put', '/api/logger/start', function (req, res) {
  app_disklogger.startLogging(function (err, state){
    if (err) {
      app_logger.error("routing error:", err);
      return res.json(500, err);
    }
    // redundant response so all clients get the message
    app_pubsub.publish('logger.state.recording_state', state);
    res.json(state);
  });
});

app_web.route('put', '/api/logger/stop', function (req, res) {
  app_disklogger.stopLogging(function (err, state){
    if (err) {
      app_logger.error("routing error:", err);
      return res.json(500, err);
    }
    // redundant response so all clients get the message
    app_pubsub.publish('logger.state.recording_state', state);
    res.json(state);
  });
});

app_web.route('put', '/api/logger/reset', function (req, res) {
  app_disklogger.reset(function (err, state){
    if (err) {
      app_logger.error("routing error:", err);
      return res.json(500, err);
    }
    // redundant response so all clients get the message
    app_pubsub.publish('logger.state.recording_state', state);
    res.json(state);
  });
});

app_web.route('post', '/api/logger/save_as', function (req, res) {
  app_disklogger.saveAs(req.body, function (err){
    if (err) {
      app_logger.error("routing error:", err);
      return res.json(500, err);
    }
    app_disklogger.getState(function (err, loggerState) {
      if (err) {
        app_logger.error("routing error:", err);
        return res.json(500, err);
      }
      // redundant response so all clients get the message
      app_pubsub.publish('logger.state', loggerState);
      res.json(loggerState);
    });
  });
});

app_web.route('put', '/api/logger/external', function (req, res) {
  if (!_.contains([true, false], req.body)) {
    var err = "'on' must be true or false";
    app_logger.error("routing error:", err);
    return res.json(400, err);
  }
  app_disklogger.setExternal(req.body, function (err, state){
    if (err) {
      app_logger.error("routing error:", err);
      return res.json(400, err);
    }
    app_disklogger.getState(function (err, loggerState) {
      if (err) {
        app_logger.error("routing error:", err);
        return res.json(500, err);
      }
      // redundant response so all clients get the message
      app_pubsub.publish('logger.state', loggerState);
      res.json(loggerState);
    });
  });
});

app_web.route('delete', '/api/logger/files/:id', function (req, res) {
  app_disklogger.deleteFile(req.params.id, function (err){
    if (err) {
      app_logger.error("routing error:", err);
      return res.json(500, err);
    }
    app_disklogger.getState(function (err, loggerState) {
      if (err) {
        app_logger.error("routing error:", err);
        return res.json(500, err);
      }
      // redundant response so all clients get the message
      app_pubsub.publish('logger.state', loggerState);
      res.json(loggerState);
    });
  });
});

app_web.route('get', '/api/logger/files/:id', function (req, res) {
  app_disklogger.getFileInfo(req.params.id, function (err, fileInfo){
    if (err) {
      app_logger.error("routing error:", err);
      return res.json(500, err);
    }

    // express.js's download function seems to automatically URI-decode the file name,
    // even though the encoded version is the correct name. Below, we encode it a second
    // time to trick it into using the correct name.
    var encoded = encodeURIComponent(fileInfo.fName);
    res.download(path.join(app_disklogger.dataDir(), encoded));
  });
});

app_web.route('get', '/api/logger/clap', function (req, res) {
  app_pubsub.publish('logger.state.clap', true);
  return res.json(200)
});
