
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

  app.kinds = {
    bike: 'bike',
    ac: '4-ac',
  };

  app.views = app.views || {};
  app.views.connection = new app.views.NotConnectedLayer().render();
  riot.compile(function() {
    app.views.labels = riot.mount('vs-labels-page')[0];
  })

  // configure notifications
  $.pnotify.defaults.styling = "bootstrap3";
  // $.pnotify.defaults.history = false;

  // start up the socket once all the handlers are in place
  app.websocket.start();
});
