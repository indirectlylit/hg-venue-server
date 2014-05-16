
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
    if (chargeControllerStats) {
      return {
        'inv' : chargeControllerStats.last_msg.inv ? 'On' : 'Off',
        'tiers' : chargeControllerStats.last_msg.tiers,
        'shunts' : chargeControllerStats.last_msg.shunts,
        'voltage' : chargeControllerStats.avg_v.toFixed(1) + ' volts',
        'power_in' : (chargeControllerStats.avg_c_in * chargeControllerStats.avg_v).toFixed(1) + ' watts',
        'power_out' : (chargeControllerStats.avg_c_out * chargeControllerStats.avg_v).toFixed(1) + ' watts',
      };
    }
    return {
      'inv' : '?',
      'tiers' : '?',
      'shunts' : '?',
      'voltage' : '?',
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


