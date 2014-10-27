
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
    chargeControllerStats = _.find(app.state.networkStats, function findController(statsObj) {
      return statsObj.last_msg.kind === 'ctrl';
    });
    if (chargeControllerStats && chargeControllerStats.last_msg.v) {
      var power_in = chargeControllerStats.avg_c_in * chargeControllerStats.avg_v;
      var power_out = chargeControllerStats.avg_c_out * chargeControllerStats.avg_v;
      return {
        'inv' : chargeControllerStats.last_msg.inv ? 'On' : 'Off',
        'tiers' : chargeControllerStats.last_msg.tiers,
        'shunts' : chargeControllerStats.last_msg.shunts,
        'power_in' : power_in.toFixed(1),
        'power_out' : power_out.toFixed(1),
        'power_in_pct' : 100.0 * (power_in / app.maxGraph),
        'power_out_pct' : 100.0 * (power_out / app.maxGraph),
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
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});


