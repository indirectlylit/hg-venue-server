
// Devon Rueckner
// The Human Grid
// All Rights Reserved



_.templateSettings = {
  evaluate : /\{\[([\s\S]+?)\]\}/g,
  interpolate : /\{\{([\s\S]+?)\}\}/g
};


var app = app || {};

// router class
app.router = new app.Router();
// an event dispatcher for global listeners
app.dispatcher = _.clone(Backbone.Events);
app.stats = new app.models.Stats();

app._genTableRow = function() {
    var row = "<tr>";
    _.each(arguments, function(arg) {
        row = row + "<td>" + arg + "</td>";
    });
    return row + "</tr>";
};


app.cumulativeStats = {};


app.StreamHandler = (function(){
  var sock = new SockJS(window.location.protocol+'//'+window.location.hostname+':8081/data');
  sock.onmessage = function(e) {
    /*
    Handle each incoming message.
    Limit the size to max_data.
    */
    var stats = jQuery.parseJSON(e.data);

    var tableRows = [];

    _(stats).keys().sort().each(function (address) {
      var stat = stats[address];
      if (!app.cumulativeStats[address]) {
        app.cumulativeStats[address] = {garbled:0};
      }
      app.cumulativeStats[address].garbled += stat.garbled;
      tableRows.push(app._genTableRow(
        address,
        stat.message_rate,
        stat.attempted,
        (stat.data_rate/1000).toPrecision(2),
        app.cumulativeStats[address].garbled)
      );
    });

    console.log(stats);

    $('#dataTable').html(tableRows.join('\n'));
  };

})();


