

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

app.utils.pad = function(number) {
  if (number <= 10000) {
    return ("000"+number).slice(-5);
  }
  return ''+number;
}

app.utils.sensorLabel = function(stats, circuit) {
  switch (stats.kind) {
    case "ctrl-ac":
      return "Tier " + (circuit + 1);
    case "4-ac":
      if (stats.labels[circuit]) {
        return stats.labels[circuit];
      }
      return ['#', app.utils.pad(stats.uid), String.fromCharCode('A'.charCodeAt(0)+circuit)].join(' ');
    case "bike":
      return stats.label ? stats.label : '# '+app.utils.pad(stats.uid);
    default:
      console.log('unhandled label type: '+stats.kind);
      return '# '+app.utils.pad(stats.uid);
  }
}

app.utils.genACStatsTableRow = function(stats) {
  var row = {
    uid: stats.uid,
    output_sensor: [],
  };
  for (var i = 0; i < stats.avg_c_out.length; i++) {
    var power = stats.avg_v * stats.avg_c_out[i];
    row.output_sensor.push({
      power: power.toFixed(0),
      power_pct: 100.0 * (power / app.maxGraph),
      circuit: app.utils.sensorLabel(stats, i),
    });
  }
  return row;
};
