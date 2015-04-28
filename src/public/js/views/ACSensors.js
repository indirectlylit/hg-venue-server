
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
    var sensors = _(app.state.networkStats)
      .where({kind: app.KIND.AC})
      .map(function(stats) {
        var sensors = [];
        for (var i = 0; i < stats.avg_c_out.length; i++) {
          var power = stats.avg_v * stats.avg_c_out[i];
          var label_disp = stats.labels[i] ? stats.labels[i] :
            [
              '#',
              app.utils.pad(stats.uid),
              '-',
              String.fromCharCode('A'.charCodeAt(0)+i)
            ].join(' ');
          sensors.push({
            unlabeled: !stats.labels[i],
            power: power.toFixed(0),
            power_pct: 100.0 * (power / app.maxGraph),
            label_disp: label_disp,
          });
        }
        return sensors;
      })
      .flatten()
      .sortByOrder(['unlabeled', 'label_disp'])
      .value();

    return {
      'tableRows':sensors,
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});
