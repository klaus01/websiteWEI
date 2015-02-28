var express = require('express');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var lonlatHelper = require('../lib/LonLat');
var PATHHEADER = 'ajax';


function resultJSON(res, isSuccess, content) {
    var ret = {
        success: isSuccess
    };
    if (isSuccess)
        ret.data = content;
    else
        ret.message = content;
    res.jsonp(ret);
}
function error(res, message) {
    resultJSON(res, false, message);
}
function success(res, data) {
    resultJSON(res, true, data);
}

function checkIsManager(req, res, isManager) {
    if (req.session.user.IsManager)
        isManager();
    else
        error(res, '不是管理员用户');
}

/********************************
 * 后台管理用户相关
 ********************************/

router.post('/backendUser/get', function(req, res) {
    checkIsManager(req, res,
        function() {
            var id = req.body.id;
            if (id)
                dbHelper.backendUsers.findByID(parseInt(id), function(rows){
                    if (rows.length)
                        success(res, rows[0]);
                    else
                        error(res, '无此用户');
                });
            else
                error(res, '缺少id');
        }
    );
});

router.post('/backendUser/post', function(req, res) {
    checkIsManager(req, res,
        function() {
            var data = req.body;
            if (!data.id) {
                error(res, '缺少id');
                return;
            }
            if (!data.name) {
                error(res, '缺少姓名');
                return;
            }
            if (!data.loginname) {
                error(res, '缺少登录名');
                return;
            }
            if (!data.password) {
                error(res, '缺少密码');
                return;
            }

            var id = parseInt(data.id);
            dbHelper.backendUsers.findByLoginName(data.loginname, id, function(rows) {
                if (rows.length > 0)
                    error(res, '登录名' + data.loginname + '已存在，请更换');
                else if (id > 0)
                    dbHelper.backendUsers.update(id, data.name, 0, data.loginname, data.password, function (data) {
                        success(res, data);
                    });
                else
                    dbHelper.backendUsers.new(data.name, 0, data.loginname, data.password, function (data) {
                        success(res, data);
                    });
            });
        }
    );
});

router.post('/backendUser/delete', function(req, res) {
    checkIsManager(req, res,
        function() {
            var id = req.body.id;
            if (id)
                dbHelper.backendUsers.delete(id, function(rows){
                    success(res, null);
                });
            else
                error(res, '缺少id');
        }
    );
});

/********************************
 * APP用户相关
 ********************************/

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
        var pageUrl = '/ajax/appUser/search?';
        for (var p in data) {
            pageUrl += p + '=' + encodeURIComponent(data[p]) + '&';
        }
        res.render(PATHHEADER + '/appUserList', {
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
                dbHelper.appUsers.findByNickname(data.content, offset, RESULTCOUNT, resultRows);
            });
            break;
        case 2://手机号
            dbHelper.appUsers.getCountByPhoneNumber(data.content, function(count){
                rowCount = count;
                dbHelper.appUsers.findByPhoneNumber(data.content, offset, RESULTCOUNT, resultRows);
            });
            break;
        case 3://性别。0女，1男
            dbHelper.appUsers.getCountByIsMan(parseInt(data.content), function(count){
                rowCount = count;
                dbHelper.appUsers.findByIsMan(parseInt(data.content), offset, RESULTCOUNT, resultRows);
            });
            break;
        case 4://注册状态。0手机未验证，1手机已验证，2已经完善用户资料，3已进入应用主页
            dbHelper.appUsers.getCountByRegistrationStatus(parseInt(data.content), function(count){
                rowCount = count;
                dbHelper.appUsers.findByRegistrationStatus(parseInt(data.content), offset, RESULTCOUNT, resultRows);
            });
            break;
        case 5://注册时间段
            dbHelper.appUsers.getCountByRegistrationTime(data.bTime, data.eTime, function(count){
                rowCount = count;
                dbHelper.appUsers.findByRegistrationTime(data.bTime, data.eTime, offset, RESULTCOUNT, resultRows);
            });
            break;
        case 6://登录时间段
            dbHelper.appUsers.getCountByLastLoginTime(data.bTime, data.eTime, function(count){
                rowCount = count;
                dbHelper.appUsers.findByLastLoginTime(data.bTime, data.eTime, offset, RESULTCOUNT, resultRows);
            });
            break;
        case 7://坐标范围
            var lonlatRange = lonlatHelper.getAround(data.lon, data.lat, data.raidus);
            dbHelper.appUsers.getCountByLonLatRange(lonlatRange.minLon, lonlatRange.maxLon, lonlatRange.minLat, lonlatRange.maxLat, function(count){
                rowCount = count;
                dbHelper.appUsers.findByLonLatRange(lonlatRange.minLon, lonlatRange.maxLon, lonlatRange.minLat, lonlatRange.maxLat, offset, RESULTCOUNT, resultRows);
            });
        case 8://指定用户的朋友
            break;
        default:
            dbHelper.appUsers.findAll(offset, RESULTCOUNT, resultRows);
    }
});

module.exports = router;
module.exports.PATHHEADER = PATHHEADER;