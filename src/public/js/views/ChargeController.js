
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
      return {
        'inv' : chargeControllerStats.last_msg.inv ? 'On' : 'Off',
        'tiers' : chargeControllerStats.last_msg.tiers,
        'shunts' : chargeControllerStats.last_msg.shunts,
        'voltage' : chargeControllerStats.avg_v.toFixed(1) + ' volts',
        'current_in' : chargeControllerStats.avg_c_in.toFixed(1),
        'current_out' : chargeControllerStats.avg_c_out.toFixed(1),
        'power_in' : (chargeControllerStats.avg_c_in * chargeControllerStats.avg_v).toFixed(1),
        'power_out' : (chargeControllerStats.avg_c_out * chargeControllerStats.avg_v).toFixed(1),
      };
    }
    return {
      'inv' : '?',
      'tiers' : '?',
      'shunts' : '?',
      'voltage' : '?',
      'current_in' : '?',
      'current_out' : '?',
      'power_in' : '?',
      'power_out' : '?'
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});


