
// Devon Rueckner
// The Human Grid
// All Rights Reserved



var app = app || {};
app.websocket = app.websocket || {};

_.extend(app.websocket, Backbone.Events);


// Websocket readyState constants
app.websocket.CONNECTING = 0;  // The connection is not yet open.
app.websocket.OPEN       = 1;  // The connection is open and ready to communicate.
app.websocket.CLOSING    = 2;  // The connection is in the process of closing.
app.websocket.CLOSED     = 3;  // The connection is closed or couldn't be opened.


app.websocket.start = function() {
  setInterval(function() {
    if (!app.websocket.socket || app.websocket.socket.readyState == app.websocket.CLOSED) {
      app.websocket.reconnect();
    }
  }, 500);
};

app.websocket.reconnect = function() {
  console.log("Reconnecting socket");

  app.websocket.socket = new SockJS(window.location.protocol+'//'+window.location.hostname+':8081/data');

  app.websocket.trigger('connecting');

  app.websocket.socket.onclose = function(e) {
    console.log("websocket closed", e);
    app.websocket.trigger('close', e);
  };
  app.websocket.socket.onerror = function(e) {
    console.log("websocket error", e);
    app.websocket.trigger('error', e);
  };
  app.websocket.socket.onmessage = function(e) {
    var msg = jQuery.parseJSON(e.data);
    app.websocket.trigger(msg.type, msg.msg);
  };
  app.websocket.socket.onopen = function(e) {
    console.log("websocket opened", e);
    app.websocket.trigger('open', e);
  };
};

app.websocket.isOpen = function() {
  return (app.websocket.socket && app.websocket.socket.readyState == app.websocket.OPEN);
};
