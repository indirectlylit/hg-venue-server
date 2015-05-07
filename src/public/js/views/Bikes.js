
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
    var bikeStats = _.where(app.state.networkStats, {'kind': app.KIND.BIKE})

    var labeledRows = [];
    var unlabeledRows = [];

    var genRow = function(stats, label) {
      var power_out = stats.avg_v * stats.avg_c_out[0];
      return {
        label_disp: label,
        power_out: power_out.toFixed(0),
        power_out_pct: 100.0 * (power_out / app.maxGraph),
      };
    };

    _.forEach(bikeStats, function(stats, i){
      if (app.state.labels.bikes[stats.uid]) {
        labeledRows.push(genRow(stats, app.state.labels.bikes[stats.uid]));
      }
      else {
        unlabeledRows.push(genRow(stats, '# '+stats.uid));
      }
    });

    return {
      'labeledRows': _.sortBy(labeledRows, 'label_disp'),
      'unlabeledRows': _.sortBy(unlabeledRows, 'label_disp'),
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});
