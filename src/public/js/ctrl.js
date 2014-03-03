
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
    var err = ([textStatus, errorThrown, jqXHR.responseText]).join('\n');
    if (jqXHR.readyState === 0 || jqXHR.status === 0) {
      err = "No response received from server.";
    }
    app.utils.error(err);
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
    app.views.recorder.render();
  });
};


var _updateRecordingState = function(state) {
  ajax('put', '/api/logger/'+state)
  .done(function(recording_state, textStatus, jqXHR) {
    app.data.logger_info.recording_state = recording_state;
  })
  .always(function() {
    app.views.recorder.render();
  });
};

app.ctrl.startRecording = function() {
  _updateRecordingState('start');
};

app.ctrl.stopRecording = function() {
  _updateRecordingState('stop');
};

app.ctrl.resetRecording = function() {
  _updateRecordingState('reset');
};


app.ctrl.saveRecording = function(name) {
  ajax('post', '/api/logger/save_as/', name)
  .done(function(logger_info, textStatus, jqXHR) {
    app.data.logger_info = logger_info;
  })
  .always(function() {
    app.views.recorder.render();
    app.views.logList.render();
  });
};
