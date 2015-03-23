var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');
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
 * @returns {[PartnerUser: {}, MessageOverview: {LastTime, UnreadCount, NoAwardCount}]} 按最近消息时间降序排序
 */
router.get('/getSubscribed', function(req, res, next) {
    dbHelper.partnerUsers.findMessagesBySubscriberID(req.appUserID, function(rows){
        publicFunction.success(res, rows);
    });
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.notCheckLoginUrls = notCheckLoginUrls;