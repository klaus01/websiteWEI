/* global __filename */
var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');
var notCheckLoginUrls = [];


/**
 * 领奖
 * @param appUserID, activityID, sign
 * @returns {message}
 */
notCheckLoginUrls.push('/award');
router.get('/award', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.activityID && data.activityID.length && parseInt(data.activityID)
        && data.sign && data.sign.length)
        if (publicFunction.checkAwardSign(data.appUserID, data.activityID, data.sign))
            dbHelper.activities.award(data.appUserID, data.activityID, function(result){
                if (result.affectedRows)
                    publicFunction.success(res, '领奖登记成功');
                else
                    publicFunction.error(res, '该用户未参加此活动，或已经领取过奖品');
            });
        else
            publicFunction.error(res, '活动验证失败，提供的二维码是错误的');
    else
        publicFunction.error(res, '缺少参数');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.notCheckLoginUrls = notCheckLoginUrls;