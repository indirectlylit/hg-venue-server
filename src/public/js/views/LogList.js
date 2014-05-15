
// Devon Rueckner
// The Human Grid
// All Rights Reserved

app.views = app.views || {};


app.views.LogList = Backbone.Viewmaster.extend({
  el: $('.js-logList'),
  template: function(context) {
    return app.utils.render('logList', context);
  },
  context: function() {
    var fileInfo = _.map(
      _.sortBy(app.state.logger_info.saved_files, 'time').reverse(),
      function(metaData) {
        var timestamp = moment(metaData.time);
        return {
          size: app.utils.formatKBytes(metaData.kbytes),
          name: metaData.name,
          time: timestamp.format("ddd MMM Do, h:mm a"),
        };
      }
    );
    return {
      'location': app.state.logger_info.location.directory,
      'fileInfo': fileInfo
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});




