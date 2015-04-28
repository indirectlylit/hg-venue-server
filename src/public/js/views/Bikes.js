
// Devon Rueckner
// The Human Grid
// All Rights Reserved

app.views = app.views || {};


app.views.Bikes = Backbone.Viewmaster.extend({
  el: $('.js-bikes'),
  template: function(context) {
    return app.utils.render('bikes', context);
  },
  context: function() {
    var rows = _(app.state.networkStats)
      .where({kind: app.KIND.BIKE})
      .map(function(stats) {
        var power_out = stats.avg_v * stats.avg_c_out[0];
        return {
          label_disp: stats.label ? stats.label : '# '+app.utils.pad(stats.uid),
          power_out: power_out.toFixed(0),
          power_out_pct: 100.0 * (power_out / app.maxGraph),
        };
      })
      .sortBy('label_disp')
      .value();
    return { 'tableRows': rows };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});
