
// Devon Rueckner
// The Human Grid
// All Rights Reserved

var app = app || {};
app.views = app.views || {};


app.views.LogList = Backbone.Viewmaster.extend({
  el: $('.js-logList'),
  template: function(context) {
    return app.utils.render('logList', context);
  },
  context: function() {
    return {
      'location': app.data.logger_info.location.directory,
      'fileInfo': app.data.logger_info.saved_files
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});




