var express = require('express');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var PATHHEADER = 'admin';


function resRender(res, moduleFileName, json) {
	res.render(PATHHEADER + '/' + moduleFileName, json);
}

function resRedirect(res, path) {
	return res.redirect('/' + PATHHEADER + path);
}

function checkIsManager(req, res, next) {
    if (req.session.user.IsManager)
        next();
    else
        resRedirect(res, '/');
}

router.get('/', function(req, res) {
    resRender(res, 'index', {
        title: '管理首页',
        user: req.session.user
    });
});

router.get('/login', function(req, res) {
	resRender(res, 'login', { title: '用户登录' });
});

router.post('/login', function(req, res) {

    function error(message) {
        resRender(res, 'login', {
            title: '用户登录',
            message: message
        });
    }

    var data = req.body;
    if (!data.username) {
        error('请输入用户名');
        return;
    }
    if (!data.password) {
        error('请输入密码');
        return;
    }
    if (!data.verificationCode) {
        error('请输入验证码');
        return;
    }
    var verificationCode = req.session.verificationCode;
    if (!verificationCode || verificationCode !== data.verificationCode.toUpperCase()) {
        error('验证码错误');
        return;
    }

    var password = new Buffer(data.password, 'base64').toString();
	dbHelper.backendUsers.findByLoginName(data.username, function(rows) {
		if (rows.length) {
            if (password === rows[0].LoginPassword) {
                req.session.user = rows[0];
                dbHelper.backendUsers.updateLoginInfo(req.session.user.ID, req.connection.remoteAddress);
                resRedirect(res, '/');
            } else
                error('密码错误');
		} else
            error('无此用户');
	});
});

router.get('/logout', function(req, res) {
	req.session.user = null;
	resRedirect(res, '/');
});

router.get('/backendUsers', function(req, res) {
    checkIsManager(req, res, function() {
        dbHelper.backendUsers.findAll(function(rows) {
            resRender(res, 'backendUsers', {
                title: '后台用户管理',
                user: req.session.user,
                isBackendUsers: true,
                rows: rows
            });
        })
    });
});

router.get('/appUsers', function(req, res) {
    resRender(res, 'appUsers', {
        title: 'APP用户列表',
        user: req.session.user,
        isAppUsers: true
    });
});

router.get('/appUser/:id', function(req, res) {
    var id = parseInt(req.params.id);
    if (id)
        dbHelper.appUsers.findByID(id, function(rows){
            if (rows.length <= 0)
                res.end('用户' + id + '不存在');
            else
                resRender(res, 'appUserInfo', {
                    title: 'APP用户信息',
                    user: rows[0]
                });
        });
    else
        res.end('缺少ID');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.checkLogin = function (req, res, next) {
    var url = req.originalUrl;
    if (url.indexOf('/' + PATHHEADER) == 0) {
        if ((url !== '/' + PATHHEADER + '/login')
            && (url !== '/' + PATHHEADER + '/logout')
            && !req.session.user)

            return resRedirect(res, '/login');
    }
    next();
};
