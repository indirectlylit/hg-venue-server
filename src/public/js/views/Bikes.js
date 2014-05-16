
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
      'tableRows': _.map(bikeStats, function genStatsTableRow(stats) {
        row = {};
        row.uid = stats.last_msg.uid;
        row.voltage = stats.avg_v.toFixed(1);
        row.current = stats.avg_c_out.toFixed(1);
        row.power_out = (stats.avg_v * stats.avg_c_out).toFixed(1);
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


