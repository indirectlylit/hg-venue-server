
// Devon Rueckner
// The Human Grid
// All Rights Reserved


var app = app || {};


$(function() {

  /*************/
  /* DOM Setup */
  /*************/

  app.dom = {
    fileTable         : $('.js-fileTable'),
    connectionState   : $('.js-connectionState'),
    serverStats       : $('.js-serverStats'),
    settings          : $('.js-settings'),
  };

  app.views = app.views || {};
  app.views.network         = new app.views.Network().render();
  app.views.serverSettings  = new app.views.ServerSettings().render();
  app.views.logList         = new app.views.LogList().render();
  app.views.recorder        = new app.views.Recorder().render();

  // configure bootstrap tooltips
  $("[data-toggle=tooltip]").tooltip({ placement: 'auto top'});

  // configure notifications
  $.pnotify.defaults.styling = "bootstrap3";
  // $.pnotify.defaults.history = false;

  // pre-render
  app.dom.serverStats.html(app.utils.render('serverStats'));

  // hide settings when not in advanced mode
  app.dom.settings.toggleClass('hidden', !location.hash.match(/^#?advanced$/));

  // application data (some pre-populated in index.hjs)
  app.data = app.data || {};
  app.data.clientAddresses = [];
  app.data.fileName = "";
  app.data.networkStats = {};


  /*********************/
  /* Sensor Statistics */
  /*********************/
  app.websocket.on('sensors.stats', function(newStats) {
    app.data.clientAddresses = _.union(app.data.clientAddresses, _.keys(newStats)).sort();
    app.data.networkStats = newStats;
    app.views.network.render();
  });


  /*********************/
  /* Server Statistics */
  /*********************/
  app.websocket.on('server.stats', function(stats) {
    var context = {
      arch:       stats.arch,
      memory:     app.utils.formatKBytes(stats.freemem) + " / " +
                  app.utils.formatKBytes(stats.totalmem),
      disk:       app.utils.formatKBytes(stats.freedisk || 0) + " / " +
                  app.utils.formatKBytes(stats.totaldisk || 0),
      load:       (100*stats.loadavg[0]).toFixed(0) + "%, " +
                  (100*stats.loadavg[1]).toFixed(0) + "%, " +
                  (100*stats.loadavg[2]).toFixed(0) + "%",
      uptime:     moment.duration(stats.uptime, 'seconds').humanize(),
      appUptime:  moment.duration(stats.appUptime, 'seconds').humanize(),
      overload:   stats.logs_overloaded ? "Yes" : "No",
    };
    app.dom.serverStats.html(app.utils.render('serverStats', context));
  });

  /*******************/
  /* Recording State */
  /*******************/
  app.websocket.on('logger.recording_state', function(recording_state) {
    app.data.logger_info.recording_state = recording_state;
    app.views.recorder.render();
  });


  /****************************/
  /* General Websocket events */
  /****************************/
  app.websocket.on('connecting', function(e) {
    app.dom.connectionState.text('Not Connected');
    app.utils.setLabelClass(app.dom.connectionState, 'label-danger');
  });

  app.websocket.on('error', function(e) {
    app.dom.connectionState.text('Connection Error');
    app.utils.setLabelClass(app.dom.connectionState, 'label-warning');
  });

  app.websocket.on('close', function(e) {
    app.dom.connectionState.text('Connection Closed');
    app.utils.setLabelClass(app.dom.connectionState, 'label-danger');
  });

  app.websocket.on('open', function(e) {
    app.dom.connectionState.text('Connected');
    app.utils.setLabelClass(app.dom.connectionState, 'label-default');
  });


  // start up the socket once all the handlers are in place
  app.websocket.start();

});
