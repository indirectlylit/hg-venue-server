
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


/*******************/
/* Server Settings */
/*******************/


app.ctrl.setWave = function(newState) {
  _ajax('put', '/api/squarewave/', newState)
  .done(function (on, textStatus, jqXHR) {
    app.state.wave_info.on = on;
  })
  .always(function () {
    app.views.serverSettings.render();
  });
};

app.ctrl.setLogExternal = function(newState) {
  _ajax('put', '/api/logger/external/', newState)
  .done(function (data, textStatus, jqXHR) {
    app.state.logger_info = data;
  })
  .always(function () {
    app.views.serverSettings.render();
    app.views.logList.render();
    app.views.recorder.render();
  });
};


app.pauseRendering = false;


/*********************/
/* Server Statistics */
/*********************/

app.websocket.on('stats.server', function (stats) {
  app.state.serverStats = stats;
  app.views.serverStats.render();
});


/******************************/
/* Logger and Recording State */
/******************************/

app.websocket.on('logger.state.recording_state', function (recording_state) {
  app.state.logger_info.recording_state = recording_state;
  app.views.recorder.render();
});

app.websocket.on('logger.state', function (logger_info) {
  app.state.logger_info = logger_info;
  app.views.logList.render();
  app.views.recorder.render();
});

var _updateRecordingState = function(state) {
  _ajax('put', '/api/logger/'+state)
  .done(function (recording_state, textStatus, jqXHR) {
    app.state.logger_info.recording_state = recording_state;
  })
  .always(function () {
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
  _ajax('post', '/api/logger/save_as/', name)
  .done(function (logger_info, textStatus, jqXHR) {
    app.state.logger_info = logger_info;
  })
  .always(function () {
    app.views.recorder.render();
    app.views.logList.render();
  });
};

app.ctrl.deleteFile = function(fileID) {
  _ajax('delete', '/api/logger/files/'+fileID)
  .done(function (logger_info, textStatus, jqXHR) {
    app.state.logger_info = logger_info;
  })
  .always(function () {
    app.views.logList.render();
  });
};

app.ctrl.clap = function() {
  _ajax('get', '/api/logger/clap')
};



/****************************/
/* General Websocket events */
/****************************/

function setConnected(state) {
  $('.js-connected').toggle(state);
  $('.js-connecting').toggle(!state);
}

app.websocket.on('connecting', function (e) {
  setConnected(false);
});

app.websocket.on('error', function (e) {
  setConnected(false);
});

app.websocket.on('close', function (e) {
  setConnected(false);
});

app.websocket.on('open', function (e) {
  setConnected(true);
});
