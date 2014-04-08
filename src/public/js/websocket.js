
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


app.websocket._makeAddress = function(address) {
  if (address) {
    // tcp://host:port
    var match = address.match(/^(tcp:\/\/)?(.*?:\d+)$/);
    if (match) {
      return window.location.protocol+'//'+match[2]+'/data';
    }
    return app.websocket._makeAddress();
  }
  return window.location.protocol+'//'+window.location.hostname+':8081/data';
};


app.websocket.start = function() {
  setInterval(function() {
    if (!app.websocket.socket || app.websocket.socket.readyState == app.websocket.CLOSED) {
      $.ajax({
        url:          "/api/socket_ready/",
        type:         "get",
        contentType:  'application/json'
      })
      .done(function(ready, textStatus, jqXHR) {
        if (ready) {
          app.websocket.reconnect();
        }
      });
    }
  }, 3000);
};


app.websocket.reconnect = function() {
  app.websocket.socket = new SockJS(app.websocket.getAddress());
  app.websocket.trigger('connecting');
  app.websocket.socket.onclose = function(e) {
    console.log("socket closed");
    app.websocket.trigger('close', e);
  };
  app.websocket.socket.onerror = function(e) {
    console.log("socket error", e);
    app.websocket.trigger('error', e);
  };
  app.websocket.socket.onmessage = function(e) {
    var msg = jQuery.parseJSON(e.data);
    app.websocket.trigger(msg.chan, msg.data, new Date(msg.time));
  };
  app.websocket.socket.onopen = function(e) {
    console.log("socket opened");
    app.websocket.trigger('open', e);
  };
};


app.websocket.isOpen = function() {
  return (app.websocket.socket && app.websocket.socket.readyState == app.websocket.OPEN);
};


app.websocket.setAddress = function(address) {
  // Address:
  //  * empty for default
  //  * otherwise, tcp://host:port or just host:port
  var prev = app.websocket.getAddress();
  var next = app.websocket._makeAddress(address);
  if (prev !== next) {
    if (app.websocket.socket) {
      app.websocket.socket.close();
    }
    $.cookie('socket_addr', address);
    app.websocket.reconnect();
  }
};

app.websocket.getAddress = function() {
  if ($.cookie('socket_addr')) {
    return app.websocket._makeAddress($.cookie('socket_addr'));
  }
  return app.websocket._makeAddress();
};


app.websocket.getDisplayAddress = function(address) {
  return $.cookie('socket_addr') ? $.cookie('socket_addr') : "";
};


app.websocket.setAddress();
