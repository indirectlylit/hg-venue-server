
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

  app.KIND = {
    AC: "4-ac",
    CTRL: "ctrl",
    TIERS: "ctrl-ac",
    BIKE: "bike",
  };

  app.views = app.views || {};
  app.views.acsensors       = new app.views.ACSensors().render();
  app.views.bikes           = new app.views.Bikes().render();
  app.views.chargeController = new app.views.ChargeController().render();
  app.views.serverStats     = new app.views.ServerStats().render();
  app.views.serverSettings  = new app.views.ServerSettings().render();
  app.views.logList         = new app.views.LogList().render();
  app.views.recorder        = new app.views.Recorder().render();
  app.views.connection      = new app.views.NotConnectedLayer().render();
  app.views.clapper         = new app.views.Clapper().render();

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
  // * app.state.labels.bikes
  // * app.state.labels.ac
  app.state.networkStats = {};
  app.state.fileName = "";

  // global scale for graphs
  app.maxGraph = 1600; // watts

  // start up the socket once all the handlers are in place
  app.websocket.start();

});
