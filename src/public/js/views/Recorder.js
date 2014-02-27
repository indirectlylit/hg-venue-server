
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
      size :          state.recording ? app.utils.formatKBytes(state.kbytes) : '',
    };
  },
  render: function() {
    var retVal = Backbone.Viewmaster.prototype.render.apply(this, arguments);
    this.$('.js-filename').focus();
    this.$("[data-toggle='tooltip']").tooltip();
    return retVal;
  },
  constructor: function(){
    _.bindAll(this, '_start', '_stop', '_reset', '_save');
    $(document).bind('keyup', 'ctrl+r', this._start);
    $(document).bind('keyup', 'ctrl+r', this._stop);
    $(document).bind('keyup', 'ctrl+t', this._reset);
    $(document).bind('keyup', 'ctrl+s', this._save);
    return Backbone.Viewmaster.prototype.constructor.apply(this, arguments);
  },
  events: function() {
    return {
      "click  .js-record" :   "_start",
      "click  .js-stop" :     "_stop",
      "click  .js-reset" :    "_reset",
      "click  .js-save" :     "_save",
      "submit form" :         "_save",
      "keyup  .js-filename" : "_updateFileName",
    };
  },
  _start: function(event) {
    if (this.context().enable_record) {
      app.ctrl.startRecording();
    }
  },
  _stop: function(event) {
    if (this.context().enable_stop) {
      app.ctrl.stopRecording();
    }
  },
  _reset: function(event) {
    if (this.context().enable_reset) {
      app.ctrl.resetRecording();
    }
  },
  _save: function(event) {
    if (this.context().enable_save) {
      app.ctrl.saveRecording(app.data.fileName);
    }
    return false;
  },
  _updateFileName: function(event) {
    app.data.fileName = event.target.value;
  }
});




