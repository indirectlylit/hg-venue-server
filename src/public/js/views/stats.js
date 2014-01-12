
// Devon Rueckner
// The Human Grid
// All Rights Reserved

var app = app || {};
app.views = app.views || {};


/*
  statistics view
*/
app.views.Stats = Backbone.ViewMaster.extend({
  el: $('#stats'),
  template: function(context){
    return app.utils.namedTemplate('stats', context);
  },
  context: function() {
    return {
    };
  },
  initialize: function() {
  },
  constructor: function() {
  },
  events: {
  }
});




