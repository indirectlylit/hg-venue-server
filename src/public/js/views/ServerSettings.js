
// Devon Rueckner
// The Human Grid
// All Rights Reserved


var app = app || {};
app.views = app.views || {};


app.views.ServerSettings = Backbone.Viewmaster.extend({
  el: $('.js-settings'),
  template: function(context) {
    return app.utils.render('serverSettings', context);
  },
  context: function() {
    return {
      wave_info:    app.data.wave_info,
      log_location: app.data.logger_info.location,
      socket:       app.websocket.getDisplayAddress()
    };
  },
  initialize: function() {
  },
  events: function() {
    return {
      "click  .js-wave"     :   "_toggleWave",
      "click  .js-external" :   "_toggleExternal",
      "keyup  .js-socket"   :   "_updateSocket",
      "submit .form"        :   "_submit",
    };
  },
  _toggleWave: function(event) {
    var checkbox = $(event.target);
    app.ctrl.setWave(checkbox.prop('checked'));
    checkbox.prop('disabled', true);
  },
  _toggleExternal: function(event) {
    var checkbox = $(event.target);
    app.ctrl.setLogExternal(checkbox.prop('checked'));
    checkbox.prop('disabled', true);
  },
  _updateSocket: _.debounce(function(event) {
    app.websocket.setAddress(event.target.value);
  }, 100),
  _submit: function(event) {
    return false;
  },
});




