
/**
 * Set up web socket server.
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


var _ = require('lodash');
var async = require('async');
var dir = require('node-dir');
var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var sockjs = require('sockjs');


var webSockets = [];

var sockjsServer = sockjs.createServer();
var httpStreamServer = http.createServer();

sockjsServer.on('connection', function(conn) {
  webSockets.push(conn);
  console.log("sockjsServer connection: "+webSockets.length);
  conn.on('close', function(conn) {
    webSockets.pop(conn);
    console.log("sockjsServer connection close: "+webSockets.length);
  });
});

sockjsServer.installHandlers(httpStreamServer, {prefix:'/data'});
httpStreamServer.listen(8081, function(){
  console.log("Stream server listening on port 8081");
});


module.exports.writeToSockets = function(str) {
  for (var i = 0; i < webSockets.length; i++) {
    webSockets[i].write(str);
  }
};

module.exports.socketReady = function() {
  return true;
};


/**
 * Set up Express web framework.
 */

var expressApp = express();

expressApp.configure(function(){
  expressApp.set('port', process.argv[2] || 8080);
  expressApp.set('views', __dirname);
  expressApp.set('view engine', 'hjs');
  expressApp.use(express.logger('tiny'));
  expressApp.use(express.json({strict:false}));
  expressApp.use(express.methodOverride());
  expressApp.use(expressApp.router);
  expressApp.use(express.static(path.join(__dirname, 'public')));
});


// loads up all the client-side templates
module.exports.loadClientTemplates = function(callback) {
  var cwd = __dirname;
  async.waterfall([

    // find all possible templates
    function(callback) {
      dir.files(path.join(cwd, 'templates'), callback);
    },

    // load contents of all templates and assign them IDs
    function(filePaths, callback) {
      filePaths = _.filter(filePaths, function(filePath) {return path.extname(filePath) === '.hjs';});
      var allMetaData = _.map(filePaths, function(filePath) {
        return {
          'file': filePath,
          'id':   path.basename(filePath).slice(0, -('.hjs'.length))
        };
      });
      // maps the list of meta-data to a list of data
      // important: IDs and pre-compiled client-side templates
      async.map(
        allMetaData,
        function (metaData, callback) {
          fs.readFile(metaData['file'], 'utf8', function(err, contents) {
            // a list of these objects gets passed to index.hjs
            var data = {
              id: metaData['id'],
              contents: contents
            };
            callback(err, data);
          });
        },
        callback
      );
    }],

    callback
  );
};


module.exports.route = function(verb, url, handler) {
  // handler takes request and response objects
  expressApp[verb](url, handler);
};

http.createServer(expressApp).listen(expressApp.get('port'), function(){
  console.log("Web server listening on port " + expressApp.get('port'));
});




// set up routes
require("./app.web.routes.js");
