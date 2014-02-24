
// Devon Rueckner
// The Human Grid
// All Rights Reserved


var app = app || {};
app.views = app.views || {};


app.views.Recorder = Backbone.Viewmaster.extend({
  el: $('.js-recorder'),
  template: function(context) {
    return app.utils.render('recorder', context);
  },
  context: function() {
    return {};
  },
  initialize: function() {
  },
  events: function() {
    return {
      "click  .js-record" :   "_record",
      "click  .js-stop" :     "_stop",
      "click  .js-reset" :    "_reset",
      "click  .js-save" :     "_save",
    };
  },
  _record: function(event) {
    console.log("record");
  },
  _stop: function(event) {
    console.log("stop");
  },
  _reset: function(event) {
    console.log("stop");
  },
  _save: function(event) {
    console.log("save");
  }
});




