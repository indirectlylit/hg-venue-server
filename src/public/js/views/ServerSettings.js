
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
      log_location: app.data.logger_info.location
    };
  },
  initialize: function() {
  },
  events: function() {
    return {
      "click  .js-wave"     :   "_toggleWave",
      "click  .js-external" :   "_toggleExternal",
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
  }
});




