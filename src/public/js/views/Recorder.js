
// Devon Rueckner
// The Human Grid
// All Rights Reserved


var app = app || {};
app.views = app.views || {};


app.views.Recorder = Backbone.Viewmaster.extend({
  el: $('.js-recorder'),
  template: function(context) {
    return app.utils.render('recorder', context);
  },
  context: function() {
    var state = app.data.logger_info.recording_state;
    return {
      file_name :     app.data.fileName,
      enable_stop :   state.recording,
      enable_save :   !state.recording && state.exists,
      enable_reset :  !state.recording && state.exists,
      enable_record : !state.recording && !state.exists,
      size :          app.utils.formatKBytes(state.kbytes),
    };
  },
  initialize: function() {
  },
  events: function() {
    return {
      "click  .js-record" :   "_start",
      "click  .js-stop" :     "_stop",
      "click  .js-reset" :    "_reset",
      "click  .js-save" :     "_save",
      "keyup  .js-filename" : "_updateFileName",
    };
  },
  _start: function(event) {
    app.ctrl.startRecording();
  },
  _stop: function(event) {
    app.ctrl.stopRecording();
  },
  _reset: function(event) {
    app.ctrl.resetRecording();
  },
  _save: function(event) {
    console.log("save");
  },
  _updateFileName: function(event) {
    app.data.fileName = event.target.value;
  }
});




