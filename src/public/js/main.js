
// Devon Rueckner
// The Human Grid
// All Rights Reserved


/*
  Note: all views and the following files are loaded before this file in HTML:
   * jquery.hotkeys-mod.js
   * utils.js
   * websocket.js
   * ctrl.js
*/

$(function() {

  app.views = app.views || {};
  app.views.bikes           = new app.views.Bikes().render();
  app.views.serverStats     = new app.views.ServerStats().render();
  app.views.serverSettings  = new app.views.ServerSettings().render();
  app.views.logList         = new app.views.LogList().render();
  app.views.recorder        = new app.views.Recorder().render();
  app.views.connection      = new app.views.NotConnectedLayer().render();

  // configure bootstrap tooltips
  $("[data-toggle=tooltip]").tooltip({ placement: 'auto top'});

  // configure notifications
  $.pnotify.defaults.styling = "bootstrap3";
  // $.pnotify.defaults.history = false;

  // hide settings when not in advanced mode
  $('.js-settings').toggleClass('hidden', !location.hash.match(/^#?advanced$/));

  // Note: the following should be pre-populated by the server:
  // * app.state.logger_info
  // * app.state.wave_info
  // * app.state.serverStats
  app.state.clientAddresses = [];
  app.state.networkStats = {};
  app.state.fileName = "";

  // start up the socket once all the handlers are in place
  app.websocket.start();

});
