

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
  classes = [
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
