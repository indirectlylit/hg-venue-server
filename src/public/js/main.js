
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
    currentDataSet    : $('.js-currentDataSet'),
    settings          : $('.js-settings'),
    logList           : $('.js-logList'),
    serverStats       : $('.js-serverStats'),
    sensorStats       : $('.js-sensorStats')
  };

  // configure bootstrap tooltips
  $("[data-toggle=tooltip]").tooltip({ placement: 'auto top'});

  // configure notifications
  $.pnotify.defaults.styling = "bootstrap3";
  $.pnotify.defaults.history = false;

  // pre-render
  app.dom.logList.html(app.utils.render('logList', {
    'location': app.initData.log_location,
    'fileInfo': app.initData.log_info
  }));
  app.dom.currentDataSet.html(app.utils.render('currentDataSet', []));
  app.dom.settings.html(app.utils.render('settings', []));


  /*********************/
  /* Sensor Statistics */
  /*********************/
  app.websocket.on('sensorStats', function(newStats) {

    app.clientAddresses = _.union(app.clientAddresses, _.keys(newStats)).sort();

    var tableRows = _.map(app.clientAddresses, function (address) {
      var stats = newStats[address];
      row = {address: address};

      if (stats) { // we have new data
        if (_.has(stats, 'max_rate')) {
          row.max_rate = stats.max_rate > 1e4 ? "max" : stats.max_rate.toFixed(1);
        }
        else {
          row.max_rate = '?';
        }
        row.message_rate =  _.has(stats, 'message_rate') ?
                                  stats.message_rate.toFixed(1) : '?';
        row.drop_rate =     _.has(stats, 'drop_rate') ?
                                  stats.drop_rate.toFixed(1) : '?';
        row.avg_size =      _.has(stats, 'avg_size') ?
                                  stats.avg_size.toFixed(1) : '?';
        row.data_rate =     _.has(stats, 'data_rate') ?
                                  (stats.data_rate/1024).toFixed(2) : '?';
        row.connected =     true;
      }
      else { // no data received from this address
        row.address =      address;
        row.max_rate =     "";
        row.message_rate = 0;
        row.drop_rate =    "";
        row.avg_size =     "";
        row.data_rate =    (0).toFixed(2);
        row.connected =    false;
      }
      return row;
    });
    app.dom.sensorStats.html(app.utils.render('sensorStats', {tableRows: tableRows}));
  });

  // pre-render
  app.dom.sensorStats.html(app.utils.render('sensorStats', []));



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
    app.dom.serverStats.html(app.utils.render('serverStats', context));
  });

  // pre-render
  app.dom.serverStats.html(app.utils.render('serverStats', {}));

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


  app.clientAddresses = [];
  app.websocket.start();

});
