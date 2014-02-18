
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
  logger.triggerRefresh();
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
  expressApp.use(express.logger('dev'));
  expressApp.use(express.bodyParser());
  expressApp.use(express.methodOverride());
  expressApp.use(expressApp.router);
  expressApp.use(require('less-middleware')({
      src: path.join(__dirname, 'public', 'css'),
      dest: path.join(process.env['HOME'], 'generated_files')
    }));
  expressApp.use(express.static(path.join(__dirname, 'public')));
  expressApp.use(express.static(path.join(process.env['HOME'], 'generated_files')));
});

expressApp.configure('development', function() {
  expressApp.use(express.errorHandler());
});

expressApp.get('/', function(req, res){
  // loads up all the client-side templates and embeds them in the main page
  var cwd = process.cwd();
  var templatesDir = path.join(cwd, 'templates');
  async.waterfall(
    [
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
        // maps the list of meta-data to a list of meta-data with contents
        async.map(
          allMetaData,
          function (metaData, callback) {
            fs.readFile(metaData['file'], 'utf8', function(err, contents) {
              metaData['contents'] = contents;
              callback(err, metaData);
            });
          },
          function(err, results) { callback(err, results); }
        );
      }
    ],
    // render the index with all templates embedded
    function(err, templateData) {
      console.log(templateData);
      res.render('index', { templateData: templateData});
    }
  );
});

expressApp.get('/start', function(req, res){
  if (exports.startLogging) {
    exports.startLogging();
  }
  res.send('starting');
});

expressApp.get('/stop', function(req, res){
  if (exports.stopLogging) {
    exports.stopLogging();
  }
  res.send('stopping');
});

exports.startLogging = null;
exports.stopLogging = null;

http.createServer(expressApp).listen(expressApp.get('port'), function(){
  console.log("Web server listening on port " + expressApp.get('port'));
});

