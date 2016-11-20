
// Devon Rueckner
// The Human Grid
// All Rights Reserved

app.views = app.views || {};


app.views.ServerStats = Backbone.Viewmaster.extend({
  el: $('.js-serverStats'),
  template: function(context) {
    return app.utils.render('serverStats', context);
  },
  context: function() {
    return {
      memory:     app.utils.formatKBytes(app.state.serverStats.freemem) + " / " +
                  app.utils.formatKBytes(app.state.serverStats.totalmem),
      disk:       app.utils.formatKBytes(app.state.serverStats.freedisk || 0) + " / " +
                  app.utils.formatKBytes(app.state.serverStats.totaldisk || 0),
      load:       (100*app.state.serverStats.loadavg[0]).toFixed(0) + "%, " +
                  (100*app.state.serverStats.loadavg[1]).toFixed(0) + "%, " +
                  (100*app.state.serverStats.loadavg[2]).toFixed(0) + "%",
      uptime:     moment.duration(app.state.serverStats.uptime, 'seconds').humanize(),
      appUptime:  moment.duration(app.state.serverStats.appUptime, 'seconds').humanize(),
      overload:   app.state.serverStats.logs_overloaded ? "Yes" : "No",
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});
