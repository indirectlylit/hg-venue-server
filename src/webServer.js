
/**
 * Set up web socket server.
 *
 * Devon Rueckner
 * The Human Grid
 * All rights reserved
 */


var express = require('express');
var http = require('http');
var path = require('path');
var sockjs = require('sockjs');
var logger = require('./logger');
var _ = require('lodash');
var dir = require('node-dir');
var async = require('async');
var fs = require('fs');


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


exports.writeToWebSockets = function(msgType, object) {
  var msg = {type:msgType, msg:object};
  var line = JSON.stringify(msg);
  for (var i = 0; i < webSockets.length; i++) {
    webSockets[i].write(line);
  }
};



/**
 * Set up Express web framework.
 */

var expressApp = express();

expressApp.configure(function(){
  expressApp.set('port', process.env.PORT || 8080);
  expressApp.set('views', __dirname + '/views');
  expressApp.set('view engine', 'hjs');
  expressApp.use(express.logger());
  expressApp.use(express.json());
  expressApp.use(express.methodOverride());
  expressApp.use(expressApp.router);
  expressApp.use(express.static(path.join(__dirname, 'public')));
});


// loads up all the client-side templates
exports.loadClientTemplates = function(callback) {
  var cwd = process.cwd();
  var templatesDir = path.join(cwd, 'templates');
  async.waterfall([

    // find all possible templates
    function(callback) {
      dir.files('templates', callback);
    },

    // load contents of all templates and assign them IDs
    function(names, callback) {
      names = _.filter(names, function(name) {return path.extname(name) === '.html';});
      var allMetaData = _.map(names, function(name) {
        return {
          'file': path.join(cwd, name),
          'id':   name.slice(0, -5).replace(/\//g, '-')
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


exports.route = function(verb, url, handler) {
  // handler takes request and response objects
  expressApp[verb](url, handler);
};

http.createServer(expressApp).listen(expressApp.get('port'), function(){
  console.log("Web server listening on port " + expressApp.get('port'));
});

