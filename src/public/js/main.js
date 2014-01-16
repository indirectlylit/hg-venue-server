
// Devon Rueckner
// The Human Grid
// All Rights Reserved



_.templateSettings = {
  evaluate : /\{\[([\s\S]+?)\]\}/g,
  interpolate : /\{\{([\s\S]+?)\}\}/g
};

$('#status_message').hide();


var app = app || {};

// router class
app.router = new app.Router();
// an event dispatcher for global listeners
app.dispatcher = _.clone(Backbone.Events);
app.stats = new app.models.Stats();
var tableElem = $('#dataTable');

var _genTableRow = function() {
    var row = "<tr>";
    _.each(arguments, function(arg) {
        row = row + "<td>" + arg + "</td>";
    });
    return row + "</tr>";
};


var cumulativeStats = {};


var StreamHandler = (function(){
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
      if (!cumulativeStats[address]) {
        cumulativeStats[address] = {garbled:0};
      }
      cumulativeStats[address].garbled += stat.garbled;
      tableRows.push(_genTableRow(
        address,
        stat.message_rate,
        (stat.data_rate/1000).toPrecision(2),
        cumulativeStats[address].garbled)
      );
    });

    console.log(stats);

    tableElem.html(tableRows.join('\n'));
  };

})();


