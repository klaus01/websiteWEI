/* global __filename */
var async = require('async');
var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');
var notCheckLoginUrls = [];


/**
 * 校验手机验证码
 * @param phoneNumber, verificationCode
 */
notCheckLoginUrls.push('/checkVerificationCode');
router.get('/checkVerificationCode', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length > 0 && data.verificationCode && data.verificationCode.length > 0) {
        var areaType = publicFunction.getAreaTypeByPhoneNumber(data.phoneNumber);
        async.auto({
            checkSMS: function (callback) {
                dbHelper.sms.findUnexpiredAndUnverifiedCheckSMSByPhoneNumber(data.phoneNumber, function(rows){
                    if (rows.length <= 0)
                        callback(areaType === 0 ? '验证码已过期，请重新获取验证码' : '驗證碼已過期，請重新獲取驗證碼');
                    else if (rows[0].VerificationCode !== data.verificationCode)
                        callback(areaType === 0 ? '验证码错误' : '驗證碼錯誤');
                    else
                        callback(null, rows[0].SMSID);
                });
            },
            updateSMSVerified: ['checkSMS', function (callback, result) {
                dbHelper.sms.updateVerified(result.checkSMS, function () { callback(); });
            }],
            findByPhoneNumber: ['checkSMS', function (callback) {
                dbHelper.appUsers.findByPhoneNumber(data.phoneNumber, function (rows) {
                    if (rows.length) {
                        req.session.appUserID = rows[0].AppUserID;
                        if (rows[0].RegistrationStatus < 1)
                            dbHelper.appUsers.update({RegistrationStatus: 1}, {PhoneNumber: data.phoneNumber});
                        callback();
                    }
                    else
                        callback('App用户' + data.phoneNumber + '不存在');
                });
            }]
        }, function (err, result) {
            if (err) {
                if (typeof(err) !== 'string')
                    console.error(err);
                publicFunction.error(res, err);
                return;
            }
            publicFunction.success(res, null);
        });
    }
    else
        publicFunction.error(res, '缺少参数');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.notCheckLoginUrls = notCheckLoginUrls;