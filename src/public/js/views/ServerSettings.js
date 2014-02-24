
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
    return app.data;
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
      data:         JSON.stringify({'on':checkbox.prop('checked')}),
      contentType:  'application/json',
      context:      this
    })
    .done(function(data, textStatus, jqXHR) {
      app.data.wave_info.on = data.on;
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
      app.utils.notify(jqXHR.responseText);
    })
    .always(function() {
      checkbox.prop('disabled', false);
      this.render();
    });
    checkbox.prop('disabled', true);
  },
  _toggleExternal: function(event) {
    console.log($(event.currentTarget).is(':checked'));
  }
});




