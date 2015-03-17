var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');
var PATHHEADER = '/' + path.basename(__filename, '.js');
var notCheckLoginUrls = [];


/**
 * 获取可订阅公众号列表(未禁用的公众号列表)
 * @returns {[partnerUser]}
 */
router.get('/getCanSubscribe', function(req, res, next) {
    dbHelper.partnerUsers.findEnabled(function(rows){
        publicFunction.success(res, rows);
    });
});

/**
 * 获取用户已订阅的公众号列表
 * @param appUserID
 * @returns {[partnerUser]} 按最近消息时间降序排序，增加了UnreadCount和NoAwardCount属性
 */
router.get('/getSubscribed', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length > 0 && parseInt(data.appUserID))
        dbHelper.partnerUsers.findMessagesBySubscriberID(data.appUserID, function(rows){
            publicFunction.success(res, rows);
        });
    else
        publicFunction.error(res, '缺少参数');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.notCheckLoginUrls = notCheckLoginUrls;