
/*
 * GET home page.
 */

exports.phone = function(req, res){
	console.log("test");
  res.render('phone', { title: 'Celilo' });
};
