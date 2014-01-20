
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

// for each argument, add a table data element and wrap the entire thing in a table row
app._genTableRow = function() {
  var row = "<tr>";
  _.each(arguments, function(arg) {
      row = row + "<td>" + arg + "</td>";
  });
  return row + "</tr>";
};


app.cumulativeStats = {};

app.dom = {
  statsTable        : $('.js-dataTable'),
  connectionState   : $('.js-connection-state')
};

app.websocket.on('message', function(e) {
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

  app.dom.statsTable.html(tableRows.join('\n'));
});

app.websocket.on('connecting', function(e) {
  app.dom.connectionState.text('Not Connected');
  app.utils.setLabelClass(app.dom.connectionState, 'label-danger');
});

app.websocket.on('error', function(e) {
  app.dom.connectionState.text('Connection Error');
  app.utils.setLabelClass(app.dom.connectionState, 'label-warning');
});

app.websocket.on('open', function(e) {
  app.dom.connectionState.text('Connected');
  app.utils.setLabelClass(app.dom.connectionState, 'label-default');
});



app.websocket.start();


