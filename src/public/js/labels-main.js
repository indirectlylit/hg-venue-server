
// Devon Rueckner
// The Human Grid
// All Rights Reserved


/*
  Note: all views and the following files are loaded before this file in HTML:
   * utils.js
   * websocket.js
   * ctrl.js
*/

$(function() {

  app.KIND = {
    AC: "4-ac",
    CTRL: "ctrl",
    TIERS: "ctrl-ac",
    BIKE: "bike",
  };

  app.views = app.views || {};
  app.views.connection      = new app.views.NotConnectedLayer().render();
  app.views.labels          = riot.mount('vs-labels-page', app.state.labels);

  // configure notifications
  $.pnotify.defaults.styling = "bootstrap3";
  // $.pnotify.defaults.history = false;

  // Note: the following should be pre-populated by the server:
  // * app.state.logger_info
  // * app.state.wave_info
  // * app.state.serverStats
  // * app.state.labels.bikes
  // * app.state.labels.ac
  app.state.clientAddresses = [];
  app.state.networkStats = {};
  app.state.fileName = "";

  // start up the socket once all the handlers are in place
  app.websocket.start();
});
