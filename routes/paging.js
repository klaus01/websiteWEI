var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var settings = require('../settings');
var lonlatHelper = require('../lib/LonLat');
var PATHHEADER = path.basename(__filename, '.js');


function resRender(res, moduleFileName, json) {
    res.render(PATHHEADER + '/' + moduleFileName, json);
}

router.get('/appUserList', function(req, res) {
    var data = req.query;
    var searchMode = 0;
    var pageNumber = 1;
    if (data.mode) {
        searchMode = parseInt(data.mode);
        pageNumber = parseInt(data.pageNumber);
    }
    if (pageNumber < 1)
        pageNumber = 1;
    var offset = (pageNumber - 1) * settings.pageRows;

    var rowCount = 0;
    function resultRows(rows) {
        delete data.pageNumber;
        var pageUrl = '/' + PATHHEADER + '/appUserList?';
        for (var p in data) {
            pageUrl += p + '=' + encodeURIComponent(data[p]) + '&';
        }
        resRender(res, 'appUserList', {
            pageUrl: pageUrl,
            currentPage: pageNumber,
            totalPages: Math.ceil(rowCount / settings.pageRows),
            rows: rows
        });
    }

    switch(searchMode) {
        case 1://昵称
            dbHelper.appUsers.getCountByNickname(data.content, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByNickname(data.content, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 2://手机号
            dbHelper.appUsers.getCountByPhoneNumber(data.content, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByPhoneNumber(data.content, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 3://性别。0女，1男
            dbHelper.appUsers.getCountByIsMan(parseInt(data.content), function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByIsMan(parseInt(data.content), offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 4://注册状态。0手机未验证，1手机已验证，2已经完善用户资料，3已进入应用主页
            dbHelper.appUsers.getCountByRegistrationStatus(parseInt(data.content), function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByRegistrationStatus(parseInt(data.content), offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 5://注册时间段
            dbHelper.appUsers.getCountByRegistrationTime(data.bTime, data.eTime, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByRegistrationTime(data.bTime, data.eTime, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 6://登录时间段
            dbHelper.appUsers.getCountByLastLoginTime(data.bTime, data.eTime, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByLastLoginTime(data.bTime, data.eTime, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 7://坐标范围
            var lonlatRange = lonlatHelper.getAround(data.lon, data.lat, data.raidus);
            dbHelper.appUsers.getCountByLonLatRange(lonlatRange.minLon, lonlatRange.maxLon, lonlatRange.minLat, lonlatRange.maxLat, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByLonLatRange(lonlatRange.minLon, lonlatRange.maxLon, lonlatRange.minLat, lonlatRange.maxLat, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 8://指定用户的朋友
            dbHelper.appUsers.getFriendsCountByAppUserID(parseInt(data.content), function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findFriendsByAppUserID(parseInt(data.content), offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        default:
            dbHelper.appUsers.findAll(offset, settings.pageRows, resultRows);
    }
});

router.get('/wordList', function(req, res) {
    var data = req.query;
    var searchMode = 0;
    var pageNumber = 1;
    if (data.mode) {
        searchMode = parseInt(data.mode);
        pageNumber = parseInt(data.pageNumber);
    }
    if (pageNumber < 1)
        pageNumber = 1;
    var offset = (pageNumber - 1) * settings.pageRows;

    var rowCount = 0;
    var userCaption = '';
    function resultRows(rows) {
        delete data.pageNumber;
        var pageUrl = '/' + PATHHEADER + '/wordList?';
        for (var p in data) {
            pageUrl += p + '=' + encodeURIComponent(data[p]) + '&';
        }
        resRender(res, 'wordList', {
            userCaption: userCaption,
            pageUrl: pageUrl,
            currentPage: pageNumber,
            totalPages: Math.ceil(rowCount / settings.pageRows),
            rows: rows
        });
    }

    switch(searchMode) {
        case 1://字发送者ID
            dbHelper.words.getCountBySourceUserID(data.content, function(count){
                rowCount = count;
                userCaption = '接收者';
                if (count > 0)
                    dbHelper.words.findBySourceUserID(data.content, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 2://字接收者ID
            dbHelper.words.getCountByReceiveUserID(data.content, function(count){
                rowCount = count;
                userCaption = '发送者';
                if (count > 0)
                    dbHelper.words.findByReceiveUserID(data.content, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 3://字编号
            dbHelper.words.getCountByNumber(data.content, function(count){
                rowCount = count;
                userCaption = '创建者';
                if (count > 0)
                    dbHelper.words.findByNumber(data.content, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 4://字解释
            dbHelper.words.getCountByDescription(data.content, function(count){
                rowCount = count;
                userCaption = '创建者';
                if (count > 0)
                    dbHelper.words.findByDescription(data.content, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
    }
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.checkLogin = function (req, res, next) {
    if (!req.session.user)
        return res.end('登录已过期，请重新登录');
    next();
};
