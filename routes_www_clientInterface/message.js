var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');
var notCheckLoginUrls = [];


/**
 * 获取未读消息列表
 * @returns {[{AppUser:{}, PartnerUser:{}, Message:{}, Word:{}, Activity:{}, Gift:{}}]}
 */
router.get('/getUnread', function(req, res, next) {
    dbHelper.messages.findUnreadByAppUserID(req.appUserID, function(rows){
        publicFunction.success(res, rows);
    });
});

/**
 * 获取用户与公众号历史消息列表
 * @param partnerUserID
 * @returns {[{Message:{}, Word:{}, Activity:{}, Gift:{}}]}
 */
router.get('/getByPartnerUser', function(req, res, next) {
    var data = req.query;
    if (data.partnerUserID && data.partnerUserID.length > 0 && parseInt(data.partnerUserID))
        dbHelper.messages.findByAppUserIDAndPartnerUserID(req.appUserID, data.partnerUserID, function(rows){
            publicFunction.success(res, rows);
        });
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 设置消息为已读
 * @param messageID
 * @returns {*}
 */
router.get('/setRead', function(req, res, next) {
    var data = req.query;
    if (data.messageID && data.messageID.length > 0 && parseInt(data.messageID))
        dbHelper.messages.updateIsRead(data.messageID, 1, function(){
            publicFunction.success(res, null);
        });
    else
        publicFunction.error(res, '缺少参数');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.notCheckLoginUrls = notCheckLoginUrls;