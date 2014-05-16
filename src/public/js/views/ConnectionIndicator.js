
// Devon Rueckner
// The Human Grid
// All Rights Reserved

app.views = app.views || {};


app.views.ConnectionIndicator = Backbone.Viewmaster.extend({
  el: $('.js-connectionIndicator'),
  template: function(context) {
    return app.utils.render('connectionIndicator', context);
  },
  context: function() {
    if (app.websocket.isOpen()) {
      return {
        cssClass:     "label-default",
        text:         "Connected"
      };
    }
    return {
      cssClass:     "label-danger",
      text:         "Not Connected"
    };
  },
  initialize: function() {
  },
  events: function() {
    return {};
  }
});


