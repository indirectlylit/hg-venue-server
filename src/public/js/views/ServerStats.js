
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
      arch:       app.data.serverStats.arch,
      memory:     app.utils.formatKBytes(app.data.serverStats.freemem) + " / " +
                  app.utils.formatKBytes(app.data.serverStats.totalmem),
      disk:       app.utils.formatKBytes(app.data.serverStats.freedisk || 0) + " / " +
                  app.utils.formatKBytes(app.data.serverStats.totaldisk || 0),
      load:       (100*app.data.serverStats.loadavg[0]).toFixed(0) + "%, " +
                  (100*app.data.serverStats.loadavg[1]).toFixed(0) + "%, " +
                  (100*app.data.serverStats.loadavg[2]).toFixed(0) + "%",
      uptime:     moment.duration(app.data.serverStats.uptime, 'seconds').humanize(),
      appUptime:  moment.duration(app.data.serverStats.appUptime, 'seconds').humanize(),
      overload:   app.data.serverStats.logs_overloaded ? "Yes" : "No",
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});


