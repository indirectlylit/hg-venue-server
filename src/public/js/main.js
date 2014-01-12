
// The Human Grid
// All Rights Reserved



_.templateSettings = {
  evaluate : /\{\[([\s\S]+?)\]\}/g,
  interpolate : /\{\{([\s\S]+?)\}\}/g
};

$('#status_message').hide();
$.fx.speeds._default = 250;



var app = app || {};

// router class
app.router = new app.Router();

// an event dispatcher for global listeners
app.dispatcher = _.clone(Backbone.Events);


app.stats = new app.models.Stats();


app.utils.message("Hello", false, false);

var ohNo = function(){
  app.utils.message("der...", false, true);
};

var ohYes = function(){
  app.utils.message("Hi!", false, true);
};

$.when(app.stats.fetch()).then(ohYes, ohNo);


