var express = require('express');
var app = express();
var router = express.Router();
var fileHelper = require('../lib/fileHelper');
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
 * @returns {appUserID: Number}
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
            success(res, {appUserID: appUserID});
        });
    }
    else
        error(res, '缺少参数');
});

/**
 * 修改App用户资料
 * @param appUserID, iconFile, nickname, isMan
 * @returns {}
 */
router.post('/appUser/update', function(req, res, next) {
    var data = req.body;
    var files = req.files;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.nickname && data.nickname.length
        && data.isMan && data.isMan.length
        && files.iconFile && files.iconFile.length) {

        fileHelper.moveAppUserIconFile(parseInt(data.appUserID), files.iconFile, function(){
            var setKeyValues = {
                IconFileName: files.iconFile.name,
                Nickname: data.nickname,
                IsMan: data.isMan,
                RegistrationStatus: 2//用户已完善资料
            };
            dbHelper.appUsers.update(setKeyValues, {AppUserID: data.appUserID}, function(result){
                if (result.affectedRows)
                    success(res, {});
                else
                    error(res, 'App用户' + data.appUserID + '不存在');
            });
        });
    }
    else
        error(res, '缺少参数');
});

/**
 * 更新苹果远程通知令牌
 * @param appUserID, APNSToken
 * @returns {}
 */
router.get('/appUser/updateAPNSToken', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.APNSToken && data.APNSToken.length) {
        dbHelper.appUsers.update({APNSToken: data.APNSToken}, {AppUserID: data.appUserID}, function(result){
            if (result.affectedRows)
                success(res, {});
            else
                error(res, 'App用户' + data.appUserID + '不存在');
        });
    }
    else
        error(res, '缺少参数');
});

/**
 * 更新用户状态为 已进入应用主页
 * @param appUserID
 * @returns {}
 */
router.get('/appUser/enterHome', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID))
        dbHelper.appUsers.update({RegistrationStatus: 3}, {AppUserID: data.appUserID}, function(result){
            if (result.affectedRows)
                success(res, {});
            else
                error(res, 'App用户' + data.appUserID + '不存在');
        });
    else
        error(res, '缺少参数');
});

/**
 * 更新登录信息
 * @param appUserID, longitude, latitude
 * @returns {}
 */
router.get('/appUser/login', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.longitude && data.latitude) {
        var setKeyValues = {
            LastLoginTime: new Date(),
            LastLoginIP: req.connection.remoteAddress,
            LastLoginLongitude: data.longitude,
            LastLoginLatitude: data.latitude
        };
        dbHelper.appUsers.update(setKeyValues, {AppUserID: data.appUserID}, function(result){
            if (result.affectedRows)
                success(res, {});
            else
                error(res, 'App用户' + data.appUserID + '不存在');
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
 * @returns {smsID: Number}
 */
router.get('/SMS/sendCheck', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length > 0) {
        dbHelper.sms.findUnexpiredAndUnverifiedCheckSMSByPhoneNumber(data.phoneNumber, function(rows){

            function newUnsentSMS(smsID){
                dbHelper.sms.newUnsentSMS(smsID, function(){
                    success(res, {smsID: smsID});
                });
            }

            if (rows.length > 0) {
                // 存在未过期未验证的短信，则不再生成新的短信，直接重发
                newUnsentSMS(rows[0].SMSID);
            }
            else {
                // 生成新的短信且发送

                // 验证码在开发环境中始终是666666，生产环境为随机100000-999999
                var verificationCode = '';
                if (app.get('env') === 'development')
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
        error(res, '缺少参数');
});

/**
 * 校验手机验证码
 * @param phoneNumber, verificationCode
 * @returns {}
 */
router.get('/SMS/checkVerificationCode', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length > 0
        && data.verificationCode && data.verificationCode.length > 0) {
        dbHelper.sms.findUnexpiredAndUnverifiedCheckSMSByPhoneNumber(data.phoneNumber, function(rows){
            if (rows.length > 0) {
                if (rows[0].VerificationCode === data.verificationCode) {
                    dbHelper.appUsers.update({RegistrationStatus: 1}, {PhoneNumber: data.phoneNumber});
                    success(res, {});
                }
                else
                    error(res, '验证码错误');
            }
            else
                error(res, '验证码已过期，请重新获取验证码');
        });
    }
    else
        error(res, '缺少参数');
});


module.exports = router;
