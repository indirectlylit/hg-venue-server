

// Devon Rueckner
// The Human Grid
// All Rights Reserved


var app = app || {};
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
  _.forEach(classes, function(className) {
    $(elem).toggleClass(className, className==labelClass);
  });
};


app.utils.genTableRow = function() {
  var row = "<tr>";
  _.each(arguments, function(arg) {
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
  return kbytes.toFixed(3) + " KB";
};


app.utils._templates = {};

app.utils.render = function(name, context) {
  if (!app.utils._templates[name]) {
    var template = $("#templates-"+name);
    if (!template.length) {
      console.log("Template not found:", name);
      return "missing template";
    }
    app.utils._templates[name] = Hogan.compile(template.html());
  }
  return app.utils._templates[name].render(context);
};


app.utils.notify = function(msg) {
  $.pnotify({
    text: msg,
    type: 'error',
    icon: false,
  });
  console.log('error:', msg);
};
