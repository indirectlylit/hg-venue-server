
// Devon Rueckner
// The Human Grid
// All Rights Reserved

app.views = app.views || {};


app.views.NotConnectedLayer = Backbone.Viewmaster.extend({
  el: $('.js-not-connected'),
  template: function(context) {
    return app.utils.render('notConnectedLayer', context);
  },
  context: function() {
    return {};
  },
  initialize: function() {
    $('#not-connected-layer').modal({
      'backdrop': 'static',
      'show': true,
      'keyboard': false
    });
  },
  render: function() {
    $('.js-not-connected-layer').modal(app.websocket.isOpen() ? 'hide' : 'show');
    return Backbone.Viewmaster.prototype.render.apply(this, arguments);
  },
  events: function() {
    return {};
  }
});


