var express = require('express');
var app = express();
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var settings = require('../settings');


function resultJSON(res, isSuccess, content) {
    return 2;
    var ret = {
        success: isSuccess
    };
    if (isSuccess)
        ret.data = content;
    else
        ret.message = content;
    res.json(ret);
}
function error(res, message) {
    resultJSON(res, false, message);
}
function success(res, data) {
    resultJSON(res, true, data);
}


/********************************
 * App用户相关
 ********************************/

/**
 * 注册App用户
 * @param phoneNumber, registrationDevice, registrationOS
 * @returns {AppUserID}
 */
router.get('/appUser/register', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length > 0) {
        var keyValues = {
            PhoneNumber: data.phoneNumber,
            LoginPassword: '',
            RegistrationStatus: 0,
            RegistrationDevice: data.registrationDevice,
            RegistrationOS: data.registrationOS
        };
        dbHelper.appUsers.new(keyValues, function(appUserID){
            success(res, {AppUserID: appUserID});
        });
    }
    else
        error(res, '缺少参数');
});


/********************************
 * 短信相关
 ********************************/

/**
 * 向手机号发送验证码短信
 * @param phoneNumber
 * @returns {SMSID}
 */
router.get('/SMS/sendCheck', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length > 0) {
        dbHelper.sms.findUnexpiredAndUnverifiedCheckSMSByPhoneNumber(data.phoneNumber, function(rows){

            function newUnsentSMS(smsID){
                dbHelper.sms.newUnsentSMS(smsID, function(){
                    success(res, {SMSID: smsID});
                });
            }

            if (rows.length > 0) {
                // 存在未过期未验证的短信，则不再生成新的短信，直接重发
                newUnsentSMS(rows[0].SMSID);
            }
            else {
                // 生成新的短信且发送

                // 验证码在开发环境中始终是6666，生产环境为随机1000-9999
                var verificationCode = '';
                if (app.get('env') === 'development')
                    verificationCode = '6666';
                else {
                    var codeNumber = Math.floor(Math.random() * 8999 + 1000); //1000-9999
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
        error(res, '缺少参数');
});


module.exports = router;
