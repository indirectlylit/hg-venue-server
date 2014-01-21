
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


  app.cumulativeStats = {};

  app.dom = {
    statsTable        : $('.js-dataTable'),
    connectionState   : $('.js-connection-state'),
    serverArch        : $('.js-server-arch'),
    serverMemory      : $('.js-server-mem'),
    serverLoad        : $('.js-server-load'),
    serverUptime      : $('.js-server-uptime'),
    serverAppUptime   : $('.js-server-app-uptime'),
    serverSkew        : $('.js-server-skew')
  };

  app.websocket.on('sensorStats', function(stats) {
    var tableRows = [];
    _(stats).keys().sort().each(function (address) {
      var stat = stats[address];
      if (!app.cumulativeStats[address]) {
        app.cumulativeStats[address] = {garbled:0};
      }
      app.cumulativeStats[address].garbled += stat.garbled;
      tableRows.push(app.utils.genTableRow(
        address,
        stat.message_rate,
        stat.attempted,
        (stat.data_rate/1000).toPrecision(2),
        app.cumulativeStats[address].garbled)
      );
    });
    app.dom.statsTable.html(tableRows.join('\n'));
  });

  app.websocket.on('serverStats', function(stats) {
    app.dom.serverArch.text(stats.arch);
    app.dom.serverMemory.text(
      (stats.freemem/1000000.0).toFixed(1) + " / " +
      (stats.totalmem/1000000.0).toFixed(1) + " MB"
    );
    app.dom.serverLoad.text(
      (100*stats.loadavg[0]).toFixed(0) + "%, " +
      (100*stats.loadavg[1]).toFixed(0) + "%, " +
      (100*stats.loadavg[2]).toFixed(0) + "%"
    );
    app.dom.serverUptime.text(stats.uptime + " s");
    app.dom.serverAppUptime.text(stats.appUptime + " s");
    app.dom.serverSkew.text(((stats.time - (new Date()).getTime())/1000).toFixed(1) + " s");
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

  app.websocket.start();

  $("[data-toggle=tooltip]").tooltip({ placement: 'auto top'});

});