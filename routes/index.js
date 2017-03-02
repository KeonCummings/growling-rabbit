var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log('started up3')
  res.render('index', { title: 'The Growling Rabbit' });
});

module.exports = router;
