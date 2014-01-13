
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
    return $(row + "</tr>");
};


var StreamHandler = (function(){
  var sock = new SockJS(window.location.protocol+'//'+window.location.hostname+':8081/data');
  sock.onmessage = function(e) {
    /*
    Handle each incoming message.
    Limit the size to max_data.
    */
    var d = jQuery.parseJSON(e.data);
    d.timestamp = Date.parse(d.timestamp);
    console.log(d);

    tableElem.prepend(_genTableRow(d.address, d.timestamp, JSON.stringify(d.data)));
  };

})();


