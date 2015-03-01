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

router.get('/appUser/search', function(req, res) {
    var RESULTCOUNT = 20;

    var data = req.query;
    var searchMode = 0;
    var pageNumber = 1;
    if (data.mode) {
        searchMode = parseInt(data.mode);
        pageNumber = parseInt(data.pageNumber);
    }
    if (pageNumber < 1)
        pageNumber = 1;
    var offset = (pageNumber - 1) * RESULTCOUNT;

    var rowCount = 0;
    function resultRows(rows) {
        delete data.pageNumber;
        var pageUrl = '/admin/appUser/search?';
        for (var p in data) {
            pageUrl += p + '=' + encodeURIComponent(data[p]) + '&';
        }
        resRender(res, 'appUserList', {
            pageUrl: pageUrl,
            currentPage: pageNumber,
            totalPages: Math.ceil(rowCount / RESULTCOUNT),
            rows: rows
        });
    }

    switch(searchMode) {
        case 1://昵称
            dbHelper.appUsers.getCountByNickname(data.content, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByNickname(data.content, offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 2://手机号
            dbHelper.appUsers.getCountByPhoneNumber(data.content, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByPhoneNumber(data.content, offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 3://性别。0女，1男
            dbHelper.appUsers.getCountByIsMan(parseInt(data.content), function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByIsMan(parseInt(data.content), offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 4://注册状态。0手机未验证，1手机已验证，2已经完善用户资料，3已进入应用主页
            dbHelper.appUsers.getCountByRegistrationStatus(parseInt(data.content), function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByRegistrationStatus(parseInt(data.content), offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 5://注册时间段
            dbHelper.appUsers.getCountByRegistrationTime(data.bTime, data.eTime, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByRegistrationTime(data.bTime, data.eTime, offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 6://登录时间段
            dbHelper.appUsers.getCountByLastLoginTime(data.bTime, data.eTime, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByLastLoginTime(data.bTime, data.eTime, offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 7://坐标范围
            var lonlatRange = lonlatHelper.getAround(data.lon, data.lat, data.raidus);
            dbHelper.appUsers.getCountByLonLatRange(lonlatRange.minLon, lonlatRange.maxLon, lonlatRange.minLat, lonlatRange.maxLat, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByLonLatRange(lonlatRange.minLon, lonlatRange.maxLon, lonlatRange.minLat, lonlatRange.maxLat, offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 8://指定用户的朋友
            dbHelper.appUsers.getFriendsCountByAppUserID(parseInt(data.content), function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findFriendsByAppUserID(parseInt(data.content), offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
        default:
            dbHelper.appUsers.findAll(offset, RESULTCOUNT, resultRows);
    }
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

router.get('/word/search', function(req, res) {
    var RESULTCOUNT = 20;

    var data = req.query;
    var searchMode = 0;
    var pageNumber = 1;
    if (data.mode) {
        searchMode = parseInt(data.mode);
        pageNumber = parseInt(data.pageNumber);
    }
    if (pageNumber < 1)
        pageNumber = 1;
    var offset = (pageNumber - 1) * RESULTCOUNT;

    var rowCount = 0;
    var userCaption = '';
    function resultRows(rows) {
        delete data.pageNumber;
        var pageUrl = '/admin/word/search?';
        for (var p in data) {
            pageUrl += p + '=' + encodeURIComponent(data[p]) + '&';
        }
        resRender(res, 'wordList', {
            userCaption: userCaption,
            pageUrl: pageUrl,
            currentPage: pageNumber,
            totalPages: Math.ceil(rowCount / RESULTCOUNT),
            rows: rows
        });
    }

    switch(searchMode) {
        case 1://字发送者ID
            dbHelper.words.getCountBySourceUserID(data.content, function(count){
                rowCount = count;
                userCaption = '接收者';
                if (count > 0)
                    dbHelper.words.findBySourceUserID(data.content, offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 2://字接收者ID
            dbHelper.words.getCountByReceiveUserID(data.content, function(count){
                rowCount = count;
                userCaption = '发送者';
                if (count > 0)
                    dbHelper.words.findByReceiveUserID(data.content, offset, RESULTCOUNT, resultRows);
                else
                    resultRows([]);
            });
            break;
    }
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
