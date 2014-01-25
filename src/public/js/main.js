
// Devon Rueckner
// The Human Grid
// All Rights Reserved


var app = app || {};

// router class
app.router = new app.Router();
// an event dispatcher for global listeners
app.dispatcher = _.clone(Backbone.Events);
app.stats = new app.models.Stats();



$(function() {

  /*********************/
  /* Sensor Statistics */
  /*********************/
  app.websocket.on('sensorStats', function(newStats) {

    // update cumulative stats to include any new addresses and information
    _(newStats).forIn(function (nodeStats, address) {
      if (!app.cumulativeStats[address]) {
        app.cumulativeStats[address] = {dropped:0, shuffled:0};
      }
      // console.log(nodeStats);
      // app.cumulativeStats[address].dropped += nodeStats.dropped;
      // app.cumulativeStats[address].shuffled += nodeStats.shuffled;
    });

    // update HTML
    var htmlTableRows = [];
    _(app.cumulativeStats).keys().sort().each(function (address) {
      htmlTableRows.push(app.utils.genSensorTableRow(address, newStats[address]));
    });
    app.dom.statsTable.html(htmlTableRows.join('\n'));
  });


  /*********************/
  /* Server Statistics */
  /*********************/
  app.websocket.on('serverStats', function(stats) {
    app.dom.serverArch.text(stats.arch);
    app.dom.serverMemory.text(
      app.utils.formatKBytes(stats.freemem) + " / " +
      app.utils.formatKBytes(stats.totalmem)
    );
    app.dom.serverDisk.text(
      app.utils.formatKBytes(stats.freedisk) + " / " +
      app.utils.formatKBytes(stats.totaldisk)
    );
    app.dom.serverLoad.text(
      (100*stats.loadavg[0]).toFixed(0) + "%, " +
      (100*stats.loadavg[1]).toFixed(0) + "%, " +
      (100*stats.loadavg[2]).toFixed(0) + "%"
    );
    app.dom.serverUptime.text(stats.uptime + " s");
    app.dom.serverAppUptime.text(stats.appUptime + " s");
  });

  app.websocket.on('connecting', function(e) {
    app.dom.connectionState.text('Not Connected');
    app.utils.setLabelClass(app.dom.connectionState, 'label-danger');
  });

  app.websocket.on('error', function(e) {
    app.dom.connectionState.text('Connection Error');
    app.utils.setLabelClass(app.dom.connectionState, 'label-warning');
  });

  app.websocket.on('open', function(e) {
    app.dom.connectionState.text('Connected');
    app.utils.setLabelClass(app.dom.connectionState, 'label-default');
  });


  /*********/
  /* Setup */
  /*********/

  app.dom = {
    statsTable        : $('.js-dataTable'),
    connectionState   : $('.js-connection-state'),
    serverArch        : $('.js-server-arch'),
    serverMemory      : $('.js-server-mem'),
    serverDisk        : $('.js-server-disk'),
    serverLoad        : $('.js-server-load'),
    serverUptime      : $('.js-server-uptime'),
    serverAppUptime   : $('.js-server-app-uptime')
  };

  $("[data-toggle=tooltip]").tooltip({ placement: 'auto top'});

  app.cumulativeStats = {};
  app.websocket.start();

});
