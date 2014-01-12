
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Celilo' });
};

exports.phone = function(req, res){
  res.render('phone', { title: 'Celilo' });
};
