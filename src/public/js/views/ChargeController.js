
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
    var ctx =  {
      'inv' : '',
      'tiers' : '',
      'shunts' : '',
      'power_in' : '',
      'power_out' : '',
      'power_in_pct' : 0,
      'power_out_pct' : 0,
      'tierInfo': [],
    };

    // Make sure we have data from the charge controller
    var chargeControllerStats = _.find(app.state.networkStats, {kind: app.KIND.CTRL});
    if (chargeControllerStats) {
      var power_in = chargeControllerStats.avg_c_in * chargeControllerStats.avg_v;
      var power_out = chargeControllerStats.avg_c_out[0] * chargeControllerStats.avg_v;
      ctx.inv = chargeControllerStats.inv ? 'On' : 'Off';
      ctx.tiers = chargeControllerStats.tiers;
      ctx.shunts = chargeControllerStats.shunts;
      ctx.power_in = power_in.toFixed(0);
      ctx.power_out = power_out.toFixed(0);
      ctx.power_in_pct = 100.0 * (power_in / app.maxGraph);
      ctx.power_out_pct = 100.0 * (power_out / app.maxGraph);
    }

    // there should be 0 or 1 of these
    var acsensorStats = _.find(app.state.networkStats, {kind: app.KIND.TIERS});
    if (acsensorStats) {
        ctx.tierInfo = [];
        for (var i = 0; i < acsensorStats.avg_c_out.length; i++) {
          var power = acsensorStats.avg_v * acsensorStats.avg_c_out[i];
          ctx.tierInfo.push({
            power: power.toFixed(0),
            power_pct: 100.0 * (power / app.maxGraph),
            label_disp: "Tier " + (i + 1),
          });
        }
    }

    return ctx;
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});
