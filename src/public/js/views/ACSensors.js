
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
    var acStats = _.where(app.state.networkStats, {'kind': app.KIND.AC});
    var rows = [];
    _.forEach(acStats, function(stats){
      for (var i=0; i<stats.avg_c_out.length; i++) {
        var power_out = stats.avg_v * stats.avg_c_out[i];
        var row = {
          power_out: power_out.toFixed(0),
          power_out_pct: 100.0 * (power_out / app.maxGraph),
        };
        if (app.state.labels.ac[stats.uid] && app.state.labels.ac[stats.uid][i]) {
          row.unlabeled = false;
          row.label = app.state.labels.ac[stats.uid][i];
        }
        else {
          row.unlabeled = true;
          row.label = ['#', stats.uid, '-', String.fromCharCode('A'.charCodeAt(0)+i)].join(' ');
        }
        rows.push(row);
      }
    });
    return { 'rows': _.sortByOrder(rows, ['unlabeled', 'label']) };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});
