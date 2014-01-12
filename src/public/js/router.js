
// Devon Rueckner
// The Human Grid
// All Rights Reserved


var app = app || {};
app.viewInstances = app.viewInstances || {};

app.Router = Backbone.Router.extend({
    routes: {
      ""                        : "showMain"
    },
    _pagesIDs: [
      '#main'
    ],
    _showPage: function(id) {
      _.each(_.without(this._pagesIDs, id), function(val) {
        $(val).hide();
      });
      $(id).show();
    },
    showMain: function(){
      app.viewInstances.home.render();
      this._showPage('#main');
    }
});


