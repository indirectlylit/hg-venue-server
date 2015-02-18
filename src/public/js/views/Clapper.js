
// Devon Rueckner
// The Human Grid
// All Rights Reserved


app.views = app.views || {};


app.views.Clapper = Backbone.Viewmaster.extend({
  el: $('.js-clapper'),
  template: function(context) {
    return app.utils.render('clapper', context);
  },
  events: function() {
    return {"click .js-clap": "clap"};
  },
  clap: function(event) {
    app.views.Clapper.audio.play();
    app.ctrl.clap();
  },
});

app.views.Clapper.audio = new Audio('/glass.mp3');


