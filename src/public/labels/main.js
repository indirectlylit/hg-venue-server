
// Devon Rueckner
// The Human Grid
// All Rights Reserved


$(function() {

  app.kinds = {
    bike: 'bike',
    ac: '4-ac',
  };

  riot.compile(function() {
    app.view = riot.mount('vs-labels-page')[0];
  })

  // start up the socket once all the handlers are in place
  app.websocket.start();
});
