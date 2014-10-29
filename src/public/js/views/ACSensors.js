
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
      _.where(app.state.networkStats, function findAC(statsObj) {
        return statsObj.last_msg.kind === '3-ac';
      }),
      function (statObj){
        return statObj.last_msg.uid;
      }
    );
    return {
      'tableRows': _.map(acsensorStats, app.utils.genStatsTableRow)
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});


