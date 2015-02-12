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
        resRender(res, 'index', {
            title: '管理首页',
            user: req.session.user
        });
    else
        resRedirect(res, '/login');
});

router.get('/login', function(req, res, next) {
	resRender(res, 'login', { title: '用户登录' });
});

router.post('/login', function(req, res, next) {

    function loginError(message) {
        resRender(res, 'login', {
            title: '用户登录',
            message: message
        });
    }

    if (!req.body.username) {
        loginError('请输入用户名');
        return;
    }
    if (!req.body.password) {
        loginError('请输入密码');
        return;
    }
    if (!req.body.verificationCode) {
        loginError('请输入验证码');
        return;
    }
    var verificationCode = req.session.verificationCode;
    if (!verificationCode || verificationCode !== req.body.verificationCode.toUpperCase()) {
        loginError('验证码错误');
        return;
    }

	dbHelper.backendUsers.find(req.body.username, function(rows) {
		if (rows.length) {
            if (req.body.password === rows[0].LoginPassword) {
                req.session.user = rows[0];
                dbHelper.backendUsers.updateLoginInfo(req.session.user.ID, req.connection.remoteAddress);
                resRedirect(res, '/');
            } else
                loginError('密码错误');
		} else
            loginError('无此用户');
	});
});

router.get('/logout', function(req, res, next) {
	req.session.user = null;
	resRedirect(res, '/');
});

router.get('/backendUsers', function(req, res, next) {
    if (req.session.user) {
        if (req.session.user.IsManager)
            resRender(res, 'backendUsers', {
                title: '后台用户管理',
                user: req.session.user
            });
        else
            resRedirect(res, '/');
    }
    else
        resRedirect(res, '/login');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
