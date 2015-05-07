
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
      .where({'kind': app.KIND.BIKE})
      .map(function(stats, i){
        var power_out = stats.avg_v * stats.avg_c_out[0];
        var row = {
          power_out: power_out.toFixed(0),
          power_out_pct: 100.0 * (power_out / app.maxGraph),
        };
        if (app.state.labels.bikes[stats.uid]) {
          row.unlabeled = false;
          row.label = app.state.labels.bikes[stats.uid];
        }
        else {
          row.unlabeled = true;
          row.label = '# '+stats.uid;
        }
        return row;
      })
      .sortByOrder([
        'unlabeled',
        function (i) { return i.label.toLowerCase(); }
      ])
      .value();

    return { 'rows': rows };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});
