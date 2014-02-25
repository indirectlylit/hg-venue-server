
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
    var fileInfo = _.map(app.data.logger_info.saved_files, function(metaData) {
      return {
        size: app.utils.formatKBytes(metaData.kbytes),
        name: metaData.name,
        time: metaData.time,
      };
    });
    return {
      'location': app.data.logger_info.location.directory,
      'fileInfo': fileInfo
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});




