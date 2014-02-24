
// The Human Grid
// All Rights Reserved

var app = app || {};
app.views = app.views || {};


/*
  Settings editor
*/
app.views.ServerSettings = Backbone.Viewmaster.extend({
  el: $('.js-settings'),
  template: function(context){
    return app.utils.render('serverSettings', context);
  },
  context: function() {
    return app.data;
  },
  initialize: function() {
  },
  events: {
  }
});




