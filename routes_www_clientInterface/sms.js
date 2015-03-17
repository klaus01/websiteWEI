var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');
var notCheckLoginUrls = [];

var app = express();


/**
 * 向手机号发送验证码短信
 * @param phoneNumber
 * @returns {smsID: Number}
 */
notCheckLoginUrls.push('/sendCheck');
router.get('/sendCheck', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length > 0) {
        dbHelper.sms.findUnexpiredAndUnverifiedCheckSMSByPhoneNumber(data.phoneNumber, function(rows){

            function newUnsentSMS(smsID){
                dbHelper.sms.newUnsentSMS(smsID, function(){
                    publicFunction.success(res, {smsID: smsID});
                });
            }

            if (rows.length > 0) {
                // 存在未过期未验证的短信，则不再生成新的短信，直接重发
                newUnsentSMS(rows[0].SMSID);
            }
            else {
                // 生成新的短信且发送

                // 验证码在开发环境或测试环境中始终是666666，生产环境为随机100000-999999
                var verificationCode = '';
                if (app.get('env') === 'development' || app.get('env') === 'test')
                    verificationCode = '666666';
                else {
                    var codeNumber = Math.floor(Math.random() * 899999 + 100000);
                    verificationCode = codeNumber.toString();
                }
                var smsContent = '验证码为' + verificationCode + '【' + settings.appName + '】';
                // 验证码半小时后过期
                var expirationTime = new Date();
                expirationTime.setTime(expirationTime.getTime() + 30 * 60 * 1000);

                dbHelper.sms.newCheckSMS(data.phoneNumber, smsContent, verificationCode, expirationTime, function(smsID){
                    newUnsentSMS(smsID);
                });
            }
        });
    }
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 校验手机验证码
 * @param phoneNumber, verificationCode
 */
notCheckLoginUrls.push('/checkVerificationCode');
router.get('/checkVerificationCode', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length > 0
        && data.verificationCode && data.verificationCode.length > 0) {
        dbHelper.sms.findUnexpiredAndUnverifiedCheckSMSByPhoneNumber(data.phoneNumber, function(rows){
            if (rows.length > 0) {
                if (rows[0].VerificationCode === data.verificationCode) {
                    dbHelper.sms.updateVerified(rows[0].SMSID, function () {
                        dbHelper.appUsers.findByPhoneNumber(data.phoneNumber, function (rows) {
                            if (rows.length) {
                                req.session.appUserID = rows[0].AppUserID;
                                publicFunction.success(res, null);
                                if (rows[0].RegistrationStatus < 1)
                                    dbHelper.appUsers.update({RegistrationStatus: 1}, {PhoneNumber: data.phoneNumber});
                            }
                            else
                                publicFunction.error(res, 'App用户' + data.phoneNumber + '不存在');
                        });
                    });
                }
                else
                    publicFunction.error(res, '验证码错误');
            }
            else
                publicFunction.error(res, '验证码已过期，请重新获取验证码');
        });
    }
    else
        publicFunction.error(res, '缺少参数');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.notCheckLoginUrls = notCheckLoginUrls;