
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
    var bikeStats = _.sortBy(
      _.where(app.state.networkStats, function findController(statsObj) {
        return statsObj.kind === 'bike';
      }),
      function (statObj){
        return statObj.uid;
      }
    );
    return {
      'tableRows': _.sortBy(_.map(bikeStats, function genBikeStatsTableRow(stats) {
        var power_out = stats.avg_v * stats.avg_c_out[0];
        return {
          label: app.utils.sensorLabel(stats),
          power_out: power_out.toFixed(0),
          power_out_pct: 100.0 * (power_out / app.maxGraph),
        };
      }),
      'label')
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});
