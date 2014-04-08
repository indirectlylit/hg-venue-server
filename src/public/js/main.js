
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
    sensorStats       : $('.js-sensorStats')
  };

  app.views = app.views || {};
  // app.views.serverSettings  = new app.views.ServerSettings().render();
  app.views.logList         = new app.views.LogList().render();
  app.views.recorder        = new app.views.Recorder().render();

  // configure bootstrap tooltips
  $("[data-toggle=tooltip]").tooltip({ placement: 'auto top'});

  // configure notifications
  $.pnotify.defaults.styling = "bootstrap3";
  // $.pnotify.defaults.history = false;

  // pre-render
  app.dom.sensorStats.html(app.utils.render('sensorStats'));
  app.dom.serverStats.html(app.utils.render('serverStats'));

  // application data (some pre-populated in index.hjs)
  app.data = app.data || {};
  app.data.clientAddresses = [];
  app.data.fileName = "";


  /*********************/
  /* Sensor Statistics */
  /*********************/
  app.websocket.on('sensors.stats', function(newStats) {
    app.data.clientAddresses = _.union(app.data.clientAddresses, _.keys(newStats)).sort();

    var tableRows = _.map(app.data.clientAddresses, function(address) {
      var stats = newStats[address];

      row = {};
      row.address = address === "serial port" ? "Controller" : address;

      if (stats) { // we have new data
        row.message_rate =  _.has(stats, 'message_rate') ?
                                  stats.message_rate.toFixed(1) : '?';
        row.drop_rate =     _.has(stats, 'drop_rate') ?
                                  stats.drop_rate.toFixed(1) : '?';
        row.data_rate =     _.has(stats, 'data_rate') ?
                                  (stats.data_rate/1024).toFixed(2) : '?';
        row.voltage =       _.has(stats, 'avg_v') ?
                                  (stats.avg_v).toFixed(2) : '?';
        row.power_in =      _.has(stats, 'avg_c1') ?
                                  (stats.avg_v * stats.avg_c1).toFixed(2) : '?';
        row.power_out =     _.has(stats, 'avg_c2') ?
                                  (stats.avg_v * stats.avg_c2).toFixed(2) : '?';
        row.connected =     true;
      }
      else { // no data received from this address
        row.message_rate = 0;
        row.drop_rate =    "";
        row.data_rate =    (0).toFixed(2);
        row.connected =    false;
        row.voltage =      "";
        row.power_in =     "";
        row.power_out =    "";
      }
      return row;
    });
    app.dom.sensorStats.html(app.utils.render('sensorStats', {tableRows: tableRows}));
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
