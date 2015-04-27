
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
        return statsObj.last_msg.kind === 'bike';
      }),
      function (statObj){
        return statObj.last_msg.uid;
      }
    );
    return {
      'tableRows': _.sortBy(_.map(bikeStats, function genBikeStatsTableRow(stats) {
        var power_out = stats.avg_v * stats.avg_c_out[0];
        var row = {};
        row.label = stats.label ? stats.label : '# '+stats.last_msg.uid;
        row.power_out = power_out.toFixed(0);
        row.power_out_pct = 100.0 * (power_out / app.maxGraph);
        return row;
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
