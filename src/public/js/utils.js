

// Devon Rueckner
// The Human Grid
// All Rights Reserved


var app = app || {};
app.utils = app.utils || {};


app.utils.message = function(msg, timesOut, isError) {
  isError = typeof isError !== 'undefined' ? isError : false;
  timesOut = typeof timesOut !== 'undefined' ? timesOut : true;
  this.elem = $('#status_message');
  this.elem.text(msg);
  console.log((isError ? "ERROR: " : "NOTICE: ")+msg);
  if (typeof this.timeoutID == "number") {
    window.clearTimeout(this.timeoutID);
    delete this.timeoutID;
  }
  this.elem.toggleClass('error', isError);
  var that = this;
  this.elem.fadeIn({complete:function() {
    if (timesOut) {
      that.timeoutID = setTimeout(function() {
        that.elem.fadeOut({complete:function() {
          that.elem.text("");
        }});
      }, isError ? 10000 : 2000 );
    }
  }});
};


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


// for each argument, add a table data element and wrap the entire thing in a table row
app.utils.genTableRowRight = function() {
  var row = "<tr>";
  _.each(arguments, function(arg) {
      row = row + "<td class='text-right'>" + arg + "</td>";
  });
  return row + "</tr>";
};

app.utils.genTableRow = function() {
  var row = "<tr>";
  _.each(arguments, function(arg) {
      row = row + "<td>" + arg + "</td>";
  });
  return row + "</tr>";
};


app.utils.genSensorTableRow = function(address, newStats) {

  // table columns:
  //  * address
  //  * max rate
  //  * actual rate
  //  * message size
  //  * KB/s
  //  * Dropped
  //  * Connected

  if (!newStats) {
    return app.utils.genTableRowRight(
      address,
      "",
      0,
      "",
      "",
      (0).toFixed(2),
      ""
    );
  }

  return app.utils.genTableRowRight(
    address,
    newStats.max_rate > 1e4 ? "max" : newStats.max_rate.toFixed(1),
    newStats.message_rate.toFixed(1),
    newStats.drop_rate.toFixed(1),
    newStats.avg_size.toFixed(1),
    (newStats.data_rate/1024).toFixed(2),
    '<span class="glyphicon glyphicon-flash"></span>'
  );
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



