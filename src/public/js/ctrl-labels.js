
// Devon Rueckner
// The Human Grid
// All Rights Reserved


app.ctrl = app.ctrl || {};



var _ajax = function(verb, url, data) {
  return $.ajax({
    url:          url,
    type:         verb,
    data:         JSON.stringify(data),
    contentType:  'application/json'
  })
  .fail(function (jqXHR, textStatus, errorThrown) {
    var err = ([textStatus, errorThrown, jqXHR.responseText]).join('\n');
    if (jqXHR.readyState === 0 || jqXHR.status === 0) {
      err = "No response received from server.";
    }
    app.utils.error(err);
  });
};


/***********************/
/* Data Network Events */
/***********************/

app.pauseRendering = false;

app.websocket.on('network.stats', function (newStats) {
  app.state.clientAddresses = _.union(app.state.clientAddresses, _.keys(newStats)).sort();
  app.state.networkStats = newStats;
  if (app.pauseRendering) {
    return;
  }
  app.views.labels.update();
});

app.websocket.on('network.ping', function (msg) {
  console.log("PING!", msg);
  app.views.labels.update();
});

app.websocket.on('network.labels', function (labels) {
  app.state.labels = labels;
  app.views.labels.update();
});


/****************************/
/* General Websocket events */
/****************************/

app.websocket.on('connecting', function (e) {
  app.views.connection.render();
});

app.websocket.on('error', function (e) {
  app.views.connection.render();
});

app.websocket.on('close', function (e) {
  app.views.connection.render();
});

app.websocket.on('open', function (e) {
  app.views.connection.render();
});