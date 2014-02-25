
// Devon Rueckner
// The Human Grid
// All Rights Reserved


var app = app || {};
app.ctrl = app.ctrl || {};



var ajax = function(verb, url, data) {
  return $.ajax({
    url:          url,
    type:         verb,
    data:         JSON.stringify(data),
    contentType:  'application/json'
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    app.utils.notify(jqXHR.responseText);
  });
};


app.ctrl.setWave = function(newState) {
  ajax('put', '/api/squarewave/', newState)
  .done(function(on, textStatus, jqXHR) {
    app.data.wave_info.on = on;
  })
  .always(function() {
    app.views.serverSettings.render();
  });
};


app.ctrl.setLogExternal = function(newState) {
  ajax('put', '/api/logger/external/', newState)
  .done(function(data, textStatus, jqXHR) {
    app.data.logger_info = data;
  })
  .always(function() {
    app.views.serverSettings.render();
    app.views.logList.render();
  });
};

