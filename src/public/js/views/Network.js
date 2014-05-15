
// Devon Rueckner
// The Human Grid
// All Rights Reserved

app.views = app.views || {};


app.views.Network = Backbone.Viewmaster.extend({
  el: $('.js-network'),
  template: function(context) {
    return app.utils.render('sensorStats', context);
  },
  context: function() {
    var tableRows = _.map(app.data.clientAddresses, function genStatsTableRow(address) {
      var stats = app.data.networkStats[address];

      row = {};
      row.address = address === "serial port" ? "Controller" : address;

      if (stats) { // we have new data
        row.message_rate =  _.has(stats, 'message_rate') ?
                                  stats.message_rate.toFixed(1) : '?';
        row.drop_rate =     _.has(stats, 'drop_rate') ?
                                  stats.drop_rate.toFixed(1) : '?';
        row.data_rate =     _.has(stats, 'data_rate') ?
                                  (stats.data_rate/1024).toFixed(2) : '?';
        row.voltage =       _.has(stats, 'avg_v') ?
                                  (stats.avg_v).toFixed(2) : '?';
        row.power_in =      _.has(stats, 'avg_c_in') ?
                                  (stats.avg_v * stats.avg_c_in).toFixed(2) : '?';
        row.power_out =     _.has(stats, 'avg_c_out') ?
                                  (stats.avg_v * stats.avg_c_out).toFixed(2) : '?';
        row.connected =     true;
      }
      else { // no data received from this address
        row.message_rate = 0;
        row.drop_rate =    "";
        row.data_rate =    (0).toFixed(2);
        row.connected =    false;
        row.voltage =      "";
        row.power_in =     "";
        row.power_out =    "";
      }
      return row;
    });
    return {
      'tableRows': tableRows
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});


