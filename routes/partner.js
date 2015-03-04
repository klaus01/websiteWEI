var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
//var publicFunction = require('../lib/publicFunction');
//var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');


function resRender(res, moduleFileName, json) {
    res.render(PATHHEADER + '/' + moduleFileName, json);
}

function resRedirect(res, path) {
    return res.redirect('/' + PATHHEADER + path);
}

router.get('/', function(req, res) {
    resRender(res, 'index', {
        title: 'WEI公众号管理首页',
        user: req.session.partnerUser
    });
});

router.get('/login', function(req, res) {
    resRender(res, 'login', { title: '公众号用户登录' });
});

router.post('/login', function(req, res) {

    function error(message) {
        resRender(res, 'login', {
            title: '公众号用户登录',
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
    dbHelper.partnerUsers.findByLoginName(data.username, function(rows) {
        if (rows.length) {
            if (password === rows[0].LoginPassword) {
                req.session.partnerUser = rows[0];
                dbHelper.partnerUsers.updateLoginInfo(req.session.partnerUser.PartnerUserID, req.connection.remoteAddress);
                resRedirect(res, '/');
            } else
                error('密码错误');
        } else
            error('无此用户');
    });
});

router.get('/logout', function(req, res) {
    req.session.partnerUser = null;
    resRedirect(res, '/');
});

router.get('/appUsers', function(req, res) {
    resRender(res, 'appUsers', {
        title: '订阅者列表',
        user: req.session.partnerUser,
        isAppUsersPage: true
    });
});

module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.checkLogin = function (req, res, next) {
    var url = req.url;
    if ((url !== '/login') && (url !== '/logout') && !req.session.partnerUser)
        return resRedirect(res, '/login');
    next();
};
