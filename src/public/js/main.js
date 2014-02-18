
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

  /*************/
  /* DOM Setup */
  /*************/

  app.dom = {
    statsTable        : $('.js-dataTable'),
    fileTable         : $('.js-fileTable'),
    connectionState   : $('.js-connection-state'),
    serverstats       : $('.js-serverstats')
  };

  $("[data-toggle=tooltip]").tooltip({ placement: 'auto top'});


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
    var context = {
      arch:       stats.arch,
      memory:     app.utils.formatKBytes(stats.freemem) + " / " +
                  app.utils.formatKBytes(stats.totalmem),
      disk:       app.utils.formatKBytes(stats.freedisk) + " / " +
                  app.utils.formatKBytes(stats.totaldisk),
      load:       (100*stats.loadavg[0]).toFixed(0) + "%, " +
                  (100*stats.loadavg[1]).toFixed(0) + "%, " +
                  (100*stats.loadavg[2]).toFixed(0) + "%",
      uptime:     stats.uptime + " s",
      appUptime:  stats.appUptime + " s"
    };
    app.dom.serverstats.html(app.utils.render('serverstats', context));
  });

  // pre-render
  app.dom.serverstats.html(app.utils.render('serverstats', {}));

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



  /*************/
  /* File List */
  /*************/
  app.websocket.on('fileData', function(fileData) {

    // update HTML
    var htmlTableRows = [];
    _(fileData).forIn(function (fileStats) {
      htmlTableRows.push(app.utils.genTableRow(
        (new Date(fileStats.ctime)).toLocaleString(),
        fileStats.name,
        app.utils.formatKBytes(fileStats.size/1024.0)
      ));
    });
    app.dom.fileTable.html(htmlTableRows.join('\n'));
  });



  app.cumulativeStats = {};
  app.websocket.start();

});
