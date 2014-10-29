
// Devon Rueckner
// The Human Grid
// All Rights Reserved

app.views = app.views || {};


app.views.ACSensors = Backbone.Viewmaster.extend({
  el: $('.js-acsensors'),
  template: function(context) {
    return app.utils.render('acsensors', context);
  },
  context: function() {
    var acsensorStats = _.sortBy(
      _.where(app.state.networkStats, function findController(statsObj) {
        return statsObj.last_msg.kind === '3-ac';
      }),
      function (statObj){
        return statObj.last_msg.uid;
      }
    );
    return {
      'tableRows': _.map(acsensorStats, function genStatsTableRow(stats) {
        var power_out_1 = stats.avg_v * stats.avg_c_out;
        var power_out_2 = stats.avg_v * stats.avg_c_out_2;
        var power_out_3 = stats.avg_v * stats.avg_c_out_3;
        var row = {};
        row.uid = stats.last_msg.uid;
        row.power_out_1 = power_out_1.toFixed(1);
        row.power_out_2 = power_out_2.toFixed(1);
        row.power_out_3 = power_out_3.toFixed(1);
        row.power_out_1_pct = 100.0 * (power_out_1 / app.maxGraph);
        row.power_out_2_pct = 100.0 * (power_out_2 / app.maxGraph);
        row.power_out_3_pct = 100.0 * (power_out_3 / app.maxGraph);
        return row;
      }
    )};
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});


