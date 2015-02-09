var express = require('express');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var PATHHEADER = 'admin';


function resRender(res, moduleFileName, json) {
	res.render(PATHHEADER + '/' + moduleFileName, json);
}

function resRedirect(res, path) {
	res.redirect('/' + PATHHEADER + path);
}


router.get('/', function(req, res, next) {
	if (req.session.user)
		resRender(res, 'index', { title: '首页' });
	else
		resRedirect(res, '/login');
});

router.get('/login', function(req, res, next) {
	resRender(res, 'login', { title: '用户登录' });
});

router.post('/login', function(req, res, next) {
	dbHelper.backendUsers.find(req.body.username, function(rows) {
		if (rows.length) {
			// TODO
		// if (req.body.username === user.username && req.body.password === user.password) {
		// 	req.session.user = user;
		// 	resRedirect(res, '/');
		// } else
		} else
			resRedirect(res, '/login');
	});
});

router.get('/logout', function(req, res, next) {
	req.session.user = null;
	resRedirect(res, '/');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
