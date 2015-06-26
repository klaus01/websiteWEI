/* global Buffer */
/* global __filename */
var express = require('express');
var path = require('path');
var url = require('url');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');

var app = express();


function resRender(res, moduleFileName, json) {
	res.render(PATHHEADER + '/' + moduleFileName, json);
}

function resRedirect(res, path) {
	return res.redirect('/' + PATHHEADER + path);
}

function checkIsManager(req, res, next) {
    if (req.session.adminUser.IsManager)
        next();
    else
        resRedirect(res, '/');
}

router.get('/', function(req, res) {
    resRender(res, 'index', {
        title: 'WEI后台管理首页',
        user: req.session.adminUser
    });
});

router.get('/login', function(req, res) {
    res.render('public/login', { title: '后台用户登录' });
});

router.post('/login', function(req, res) {

    function error(message) {
        res.render('public/login', {
            title: '后台用户登录',
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
    if (app.get('env') !== 'test') {
        if (!data.verificationCode) {
            error('请输入验证码');
            return;
        }
        var verificationCode = req.session.verificationCode;
        if (!verificationCode || verificationCode !== data.verificationCode.toUpperCase()) {
            error('验证码错误');
            return;
        }
    }

    var password = new Buffer(data.password, 'base64').toString();
	dbHelper.backendUsers.findByLoginName(data.username, function(rows) {
		if (rows.length) {
            if (password === rows[0].LoginPassword) {
                req.session.adminUser = rows[0];
                dbHelper.backendUsers.updateLoginInfo(req.session.adminUser.ID, req.connectionIP);
                resRedirect(res, '/');
            } else
                error('密码错误');
		} else
            error('无此用户');
	});
});

router.get('/logout', function(req, res) {
	req.session.adminUser = null;
	resRedirect(res, '/');
});

router.get('/backendUsers', function(req, res) {
    checkIsManager(req, res, function() {
        dbHelper.backendUsers.findAll(function(rows) {
            resRender(res, req.url, {
                title: '后台用户管理',
                user: req.session.adminUser,
                isBackendUsersPage: true,
                rows: rows
            });
        });
    });
});

router.get('/appUsers', function(req, res) {
    resRender(res, req.url, {
        title: 'APP用户列表',
        user: req.session.adminUser,
        isAppUsersPage: true
    });
});

router.get('/words', function(req, res) {
    resRender(res, req.url, {
        title: '字列表',
        user: req.session.adminUser,
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
            resRender(res, url.parse(req.url).pathname, {
                title: '短信列表',
                user: req.session.adminUser,
                isSMSLogsPage: true,
                pageUrl: url.parse(req.originalUrl).pathname + '?',
                currentPage: pageNumber,
                totalPages: Math.ceil(count / settings.pageRows),
                rows: rows
            });
        });
    });
});

router.get('/partnerUsers', function(req, res) {
    dbHelper.partnerUsers.findAll(function(rows) {
        resRender(res, req.url, {
            title: '公众号管理',
            user: req.session.adminUser,
            isPartnerUsersPage: true,
            rows: rows
        });
    });
});

router.get('/appUserInfo/:id', function(req, res) {
    var id = parseInt(req.params.id);
    if (id)
        dbHelper.appUsers.findByID(id, function(rows){
            if (rows.length <= 0)
                res.end('用户' + id + '不存在');
            else
                resRender(res, path.dirname(req.url), {
                    title: 'APP用户信息',
                    user: rows[0]
                });
        });
    else
        res.end('缺少ID');
});

router.get('/partnerUserInfo/:id', function(req, res) {
    var id = parseInt(req.params.id);
    if (id)
        dbHelper.partnerUsers.findByID(id, function(rows){

            if (rows.length) {
                var data = rows[0];

                function resultFunc(){
                    resRender(res, path.dirname(req.url), {
                        title: '公众号用户信息',
                        user: data
                    });
                }

                if (data.AppUserID)
                    dbHelper.appUsers.findByID(data.AppUserID, function(rows){
                        if (rows.length) {
                            data.AppUser = rows[0];
                            resultFunc();
                        }
                        else
                            res.end('公众号关联的App用户ID：' + data.AppUserID + '不存在');
                    });
                else
                    resultFunc();
            }
            else
                res.end('公众号' + id + '不存在');
        });
    else
        res.end('缺少ID');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.checkLogin = function (req, res, next) {
    var url = req.url;
    if ((url !== '/login') && (url !== '/logout') && !req.session.adminUser)
        return resRedirect(res, '/login');
    next();
};
