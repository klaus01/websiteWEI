var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');


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
                isBackendUsersPage: true,
                rows: rows
            });
        })
    });
});

router.get('/appUsers', function(req, res) {
    resRender(res, 'appUsers', {
        title: 'APP用户列表',
        user: req.session.user,
        isAppUsersPage: true
    });
});

router.get('/words', function(req, res) {
    resRender(res, 'words', {
        title: '字列表',
        user: req.session.user,
        isWordsPage: true
    });
});

router.get('/smsLogs', function(req, res) {
    dbHelper.sms.getCount(function(count){
        var pageNumber = 1;
        if (req.query.pageNumber)
            pageNumber = parseInt(req.query.pageNumber);
        if (pageNumber < 1)
            pageNumber = 1;
        var offset = (pageNumber - 1) * settings.pageRows;

        dbHelper.sms.findAll(offset, settings.pageRows, function(rows){
            resRender(res, 'smsLogs', {
                title: '短信列表',
                user: req.session.user,
                isSMSLogs: true,
                pageUrl: '/admin/smsLogs?',
                currentPage: pageNumber,
                totalPages: Math.ceil(count / settings.pageRows),
                rows: rows
            });
        });
    });
});

router.get('/partnerUsers', function(req, res) {
    dbHelper.partnerUsers.findAll(function(rows) {
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            row.IconFileUrl = settings.partnerUserIconsDir + row.IconFileName;
        }
        resRender(res, 'partnerUsers', {
            title: '公众号管理',
            user: req.session.user,
            isPartnerUsersPage: true,
            rows: rows
        });
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
