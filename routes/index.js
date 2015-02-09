var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '首页' });
});

router.get('/login', function(req, res, next) {
	res.render('login', { title: '用户登录' });
});

router.post('/login', function(req, res, next) {
	var user = {
		username: 'admin',
		password: 'admin'
	}
	if (req.body.username === user.username && req.body.password === user.password)
		res.redirect('/home');
	else
		res.redirect('/login');
});

router.get('/logout', function(req, res, next) {
	res.redirect('/');
});

router.get('/home', function(req, res, next) {
	var user = {
		username: 'admin',
		password: 'admin'
	}
	res.render('home', { title: 'Home', user: user });
});


module.exports = router;
