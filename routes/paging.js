var express = require('express');
var path = require('path');
var url = require('url');
var router = express.Router();
var publicFunction = require('../lib/publicFunction');
var dbHelper = require('../lib/dbHelper');
var settings = require('../settings');
var lonlatHelper = require('../lib/LonLat');
var PATHHEADER = path.basename(__filename, '.js');

function deleteUrlPageNumberQuery(urlString){
    var urlObj = url.parse(urlString, true);
    delete urlObj.query.pageNumber;
    return url.format({pathname: urlObj.pathname, query: urlObj.query});
}

function resRender(res, moduleFileName, json) {
    res.render(PATHHEADER + '/' + moduleFileName, json);
}

router.get('/appUserList', function(req, res) {
    var data = req.query;
    var searchMode = data.mode ? parseInt(data.mode) : 0;
    var pageNumber = data.pageNumber ? parseInt(data.pageNumber) : 1;
    if (pageNumber < 1)
        pageNumber = 1;
    var offset = (pageNumber - 1) * settings.pageRows;

    var rowCount = 0;
    function resultRows(rows) {
        // 将URL中的pageNumber参数对掉，并返回给页面使用
        var pageUrl = deleteUrlPageNumberQuery(req.originalUrl) + '&';

        resRender(res, req._parsedUrl.pathname, {
            pageUrl: pageUrl,
            currentPage: pageNumber,
            totalPages: Math.ceil(rowCount / settings.pageRows),
            rows: rows
        });
    }

    switch(searchMode) {
        case 1://昵称
            dbHelper.appUsers.getCountByNickname(data.content, data.partnerUserID, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByNickname(data.content, offset, settings.pageRows, data.partnerUserID, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 2://手机号
            dbHelper.appUsers.getCountByPhoneNumber(data.content, data.partnerUserID, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByPhoneNumber(data.content, offset, settings.pageRows, data.partnerUserID, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 3://性别。0女，1男
            dbHelper.appUsers.getCountByIsMan(parseInt(data.content), data.partnerUserID, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByIsMan(parseInt(data.content), offset, settings.pageRows, data.partnerUserID, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 4://注册状态。0手机未验证，1手机已验证，2已经完善用户资料，3已进入应用主页
            dbHelper.appUsers.getCountByRegistrationStatus(parseInt(data.content), data.partnerUserID, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByRegistrationStatus(parseInt(data.content), offset, settings.pageRows, data.partnerUserID, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 5://注册时间段
            dbHelper.appUsers.getCountByRegistrationTime(data.bTime, data.eTime, data.partnerUserID, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByRegistrationTime(data.bTime, data.eTime, offset, settings.pageRows, data.partnerUserID, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 6://登录时间段
            dbHelper.appUsers.getCountByLastLoginTime(data.bTime, data.eTime, data.partnerUserID, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByLastLoginTime(data.bTime, data.eTime, offset, settings.pageRows, data.partnerUserID, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 7://坐标范围
            var lonlatRange = lonlatHelper.getAround(data.lon, data.lat, data.raidus);
            dbHelper.appUsers.getCountByLonLatRange(lonlatRange.minLon, lonlatRange.maxLon, lonlatRange.minLat, lonlatRange.maxLat, data.partnerUserID, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findByLonLatRange(lonlatRange.minLon, lonlatRange.maxLon, lonlatRange.minLat, lonlatRange.maxLat, offset, settings.pageRows, data.partnerUserID, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 8://指定用户的朋友
            dbHelper.appUsers.getFriendsCountByAppUserID(parseInt(data.content), data.partnerUserID, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findFriendsByAppUserID(parseInt(data.content), offset, settings.pageRows, data.partnerUserID, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 9://指定公众号的订阅用户
            dbHelper.appUsers.getFriendsCountByPartnerUserID(parseInt(data.content), data.partnerUserID, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.appUsers.findFriendsByPartnerUserID(parseInt(data.content), offset, settings.pageRows, data.partnerUserID, resultRows);
                else
                    resultRows([]);
            });
            break;
        default:
            dbHelper.appUsers.findAll(offset, settings.pageRows, resultRows);
    }
});

router.get('/partnerUserList', function(req, res) {
    var data = req.query;
    var searchMode = data.mode ? parseInt(data.mode) : 0;
    switch(searchMode) {
        case 1://根据 订阅者ID 查询公众号列表
            dbHelper.partnerUsers.findBySubscriberID(data.content, function(rows){
                resRender(res, req._parsedUrl.pathname, {
                    rows: rows
                });
            });
            break;
    }
});

router.get('/wordList', function(req, res) {
    var data = req.query;
    var searchMode = data.mode ? parseInt(data.mode) : 0;
    var pageNumber = data.pageNumber ? parseInt(data.pageNumber) : 1;
    if (pageNumber < 1)
        pageNumber = 1;
    var offset = (pageNumber - 1) * settings.pageRows;

    var rowCount = 0;
    var userCaption = '';
    function resultRows(rows) {
        // 将URL中的pageNumber参数对掉，并返回给页面使用
        var pageUrl = deleteUrlPageNumberQuery(req.originalUrl) + '&';

        resRender(res, req._parsedUrl.pathname, {
            userCaption: userCaption,
            pageUrl: pageUrl,
            currentPage: pageNumber,
            totalPages: Math.ceil(rowCount / settings.pageRows),
            rows: rows
        });
    }

    switch(searchMode) {
        case 1://根据 字发送者ID 查询发送的字和接收者信息
            dbHelper.words.getCountBySourceUserID(data.content, function(count){
                rowCount = count;
                userCaption = '接收者';
                if (count > 0)
                    dbHelper.words.findBySourceUserID(data.content, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
        case 2://根据 字接收者ID 查询接收的字和发送者信息
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

router.get('/activityList', function(req, res) {
    var data = req.query;
    var searchMode = data.mode ? parseInt(data.mode) : 0;
    var pageNumber = data.pageNumber ? parseInt(data.pageNumber) : 1;
    if (pageNumber < 1)
        pageNumber = 1;
    var offset = (pageNumber - 1) * settings.pageRows;

    var rowCount = 0;
    function resultRows(rows) {
        // 将URL中的pageNumber参数对掉，并返回给页面使用
        var pageUrl = deleteUrlPageNumberQuery(req.originalUrl) + '&';
        rows = publicFunction.addActivityPictureUrl(rows);
        resRender(res, req._parsedUrl.pathname, {
            pageUrl: pageUrl,
            currentPage: pageNumber,
            totalPages: Math.ceil(rowCount / settings.pageRows),
            rows: rows
        });
    }

    switch(searchMode) {
        case 1://根据 活动创建者 查询
            dbHelper.activities.getCountByPartnerUserID(data.content, function(count){
                rowCount = count;
                if (count > 0)
                    dbHelper.activities.findByPartnerUserID(data.content, offset, settings.pageRows, resultRows);
                else
                    resultRows([]);
            });
            break;
    }
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.checkLogin = function (req, res, next) {
    if (!req.session.adminUser && !req.session.partnerUser)
        return res.end('登录已过期，请重新登录');
    next();
};
