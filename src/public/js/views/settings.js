
// The Human Grid
// All Rights Reserved

var app = app || {};
app.views = app.views || {};


/*
  Settings editor
*/
app.views.Settings = Backbone.ViewMaster.extend({
  el: $('#settings'),
  template: function(context){
    return app.utils.namedTemplate('settings', context);
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




