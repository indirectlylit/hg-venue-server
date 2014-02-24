
// The Human Grid
// All Rights Reserved

var app = app || {};
app.views = app.views || {};


/*
  Settings editor
*/
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
    var checkbox = $(event.currentTarget);
    $.ajax({
      url:          '/api/squarewave/',
      type:         'put',
      data:         JSON.stringify(checkbox.prop('checked')),
      contentType:  'application/json',
      context:      this
    })
    .done(function(on, textStatus, jqXHR) {
      app.data.wave_info.on = on;
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      app.utils.notify(jqXHR.responseText);
    })
    .always(function() {
      this.render();
    });
    checkbox.prop('disabled', true);
  },
  _toggleExternal: function(event) {
    var checkbox = $(event.currentTarget);
    $.ajax({
      url:          '/api/logger/external/',
      type:         'put',
      data:         JSON.stringify(checkbox.prop('checked')),
      contentType:  'application/json',
      context:      this
    })
    .done(function(data, textStatus, jqXHR) {
      app.data.logger_info = data;
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      app.utils.notify(jqXHR.responseText);
    })
    .always(function() {
      this.render();
    });
    checkbox.prop('disabled', true);
  }
});




