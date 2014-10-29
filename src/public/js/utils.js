

// Devon Rueckner
// The Human Grid
// All Rights Reserved


app.utils = app.utils || {};



app.utils.setLabelClass = function(elem, labelClass) {
  var classes = [
    'label-default',
    'label-primary',
    'label-success',
    'label-info',
    'label-warning',
    'label-danger'
  ];
  _.forEach(classes, function (className) {
    $(elem).toggleClass(className, className==labelClass);
  });
};


app.utils.genTableRow = function() {
  var row = "<tr>";
  _.each(arguments, function (arg) {
      row = row + "<td>" + arg + "</td>";
  });
  return row + "</tr>";
};


app.utils.formatKBytes = function(kbytes) {
  // these values are relative to 1 KByte (2^10 bytes).
  var MB = Math.pow(2, 10);
  var GB = Math.pow(2, 20);

  if (kbytes >= GB) {
    return (kbytes / GB).toFixed(2) + " GB";
  }
  else if (kbytes >= MB){
    return (kbytes / MB).toFixed(2) + " MB";
  }
  return kbytes.toFixed(2) + " KB";
};


app.utils.render = function(name, context) {
  // check the cache for pre-compiled templates
  app.utils._templates = app.utils._templates || {};
  if (!app.utils._templates[name]) {
    // retrieve it from index.hjs
    var template = $("#templates-"+name);
    if (!template.length) {
      throw("Missing template: "+name);
    }
    app.utils._templates[name] = Hogan.compile(template.html());
  }
  return app.utils._templates[name].render(context);
};


app.utils.error = function(msg) {
  $.pnotify({
    text: msg,
    type: 'error',
    icon: false,
  });
  console.log('error:', msg);
};

app.utils.warn = function(msg) {
  $.pnotify({
    text: msg,
    type: 'warn',
    icon: false,
  });
  console.log('warn:', msg);
};

app.utils.genStatsTableRow = function(stats) {
  var power_out_1 = stats.avg_v * stats.avg_c_out;
  var power_out_2 = stats.avg_v * stats.avg_c_out_2;
  var power_out_3 = stats.avg_v * stats.avg_c_out_3;
  var row = {};
  row.uid = stats.last_msg.uid;
  row.power_out_1 = power_out_1.toFixed(1);
  row.power_out_2 = power_out_2.toFixed(1);
  row.power_out_3 = power_out_3.toFixed(1);
  row.power_out_1_pct = 100.0 * (power_out_1 / app.maxGraph);
  row.power_out_2_pct = 100.0 * (power_out_2 / app.maxGraph);
  row.power_out_3_pct = 100.0 * (power_out_3 / app.maxGraph);
  return row;
};
