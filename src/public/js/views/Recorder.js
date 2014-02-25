
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
    var time = new Date(state.time);
    return {
      file_name :     app.data.fileName,
      enable_stop :   state.recording,
      enable_save :   !state.recording && state.exists,
      enable_reset :  !state.recording && state.exists,
      enable_record : !state.recording && !state.exists,
      minutes :       time.getMinutes(),
      seconds :       (time.getSeconds() < 10 ? '0' : '') + time.getSeconds(),
    };
  },
  initialize: function() {
  },
  events: function() {
    return {
      "click  .js-record" :   "_record",
      "click  .js-stop" :     "_stop",
      "click  .js-reset" :    "_reset",
      "click  .js-save" :     "_save",
      "keyup  .js-filename" : "_updateFileName",
    };
  },
  _record: function(event) {
    console.log("record");
  },
  _stop: function(event) {
    console.log("stop");
  },
  _reset: function(event) {
    console.log("stop");
  },
  _save: function(event) {
    console.log("save");
  },
  _updateFileName: function(event) {
    app.data.fileName = event.target.value;
  }
});




