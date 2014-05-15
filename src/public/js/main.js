
// Devon Rueckner
// The Human Grid
// All Rights Reserved


$(function() {

  /*************/
  /* DOM Setup */
  /*************/

  app.dom = {
    connectionState   : $('.js-connectionState')
  };

  app.views = app.views || {};
  app.views.network         = new app.views.Network().render();
  app.views.serverStats     = new app.views.ServerStats().render();
  app.views.serverSettings  = new app.views.ServerSettings().render();
  app.views.logList         = new app.views.LogList().render();
  app.views.recorder        = new app.views.Recorder().render();

  // configure bootstrap tooltips
  $("[data-toggle=tooltip]").tooltip({ placement: 'auto top'});

  // configure notifications
  $.pnotify.defaults.styling = "bootstrap3";
  // $.pnotify.defaults.history = false;

  // hide settings when not in advanced mode
  $('.js-settings').toggleClass('hidden', !location.hash.match(/^#?advanced$/));


  /*********************/
  /* Application State */
  /*********************/

  // Note: the following should be pre-populated by the server:
  // * app.state.logger_info
  // * app.state.wave_info
  // * app.state.serverStats
  app.state.clientAddresses = [];
  app.state.networkStats = {};
  app.state.fileName = "";


  /**********************/
  /* Network Statistics */
  /**********************/

  app.websocket.on('network.stats', function(newStats) {
    app.state.clientAddresses = _.union(app.state.clientAddresses, _.keys(newStats)).sort();
    app.state.networkStats = newStats;
    app.views.network.render();
  });


  /*********************/
  /* Server Statistics */
  /*********************/

  app.websocket.on('server.stats', function(stats) {
    app.state.serverStats = stats;
    app.views.serverStats.render();
  });


  /*******************/
  /* Recording State */
  /*******************/

  app.websocket.on('logger.recording_state', function(recording_state) {
    app.state.logger_info.recording_state = recording_state;
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
