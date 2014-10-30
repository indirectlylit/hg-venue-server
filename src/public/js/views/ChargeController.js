
// Devon Rueckner
// The Human Grid
// All Rights Reserved

app.views = app.views || {};


app.views.ChargeController = Backbone.Viewmaster.extend({
  el: $('.js-chargecontroller'),
  template: function(context) {
    return app.utils.render('chargeController', context);
  },
  context: function() {
    var chargeControllerStats = _.find(app.state.networkStats, function findController(statsObj) {
      return statsObj.last_msg.kind === 'ctrl';
    });
    // there should be at most one of these
    var acsensorStats = _.where(app.state.networkStats, function findControllerAC(statsObj) {
      return statsObj.last_msg.kind === 'ctrl-ac';
    });
    var tierRows = _.map(acsensorStats, app.utils.genStatsTableRow);
    if (chargeControllerStats && chargeControllerStats.last_msg.v) {
      var power_in = chargeControllerStats.avg_c_in * chargeControllerStats.avg_v;
      var power_out = chargeControllerStats.avg_c_out * chargeControllerStats.avg_v;
      return {
        'inv' : chargeControllerStats.last_msg.inv ? 'On' : 'Off',
        'tiers' : chargeControllerStats.last_msg.tiers,
        'shunts' : chargeControllerStats.last_msg.shunts,
        'power_in' : power_in.toFixed(0),
        'power_out' : power_out.toFixed(0),
        'power_in_pct' : 100.0 * (power_in / app.maxGraph),
        'power_out_pct' : 100.0 * (power_out / app.maxGraph),
        'tableRows': tierRows,
      };
    }
    return {
      'inv' : '',
      'tiers' : '',
      'shunts' : '',
      'power_in' : '',
      'power_out' : '',
      'power_in_pct' : 0,
      'power_out_pct' : 0,
      'tableRows': tierRows,
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});


