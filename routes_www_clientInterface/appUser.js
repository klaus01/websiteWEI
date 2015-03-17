var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');
var notCheckLoginUrls = [];


/**
 * 获取App用户信息
 * @param appUserID or phoneNumber
 * @returns {[appUser]}
 */
router.get('/get', function(req, res, next) {

    function result(rows) {
        if (rows.length)
            publicFunction.success(res, rows[0]);
        else
            publicFunction.error(res, 'App用户不存在');
    }

    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID))
        dbHelper.appUsers.findByID(data.appUserID, result);
    else if (data.phoneNumber && data.phoneNumber.length)
        dbHelper.appUsers.findByPhoneNumber(data.phoneNumber, result);
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 获取朋友信息列表
 * @returns {[{SourceUserID, LastTime, UneadCount, AppUser:{}, PartnerUser:{}}]}
 */
router.get('/getFriends', function(req, res, next) {
    dbHelper.appUsers.findFriendsByAppUserID(req.appUserID, function(rows){
        publicFunction.success(res, rows);
    });
});

/**
 * 返回当前session是否已登录
 * @returns {*}
 */
notCheckLoginUrls.push('/isLogged');
router.get('/isLogged', function(req, res, next) {
    if (req.appUserID)
        publicFunction.success(res, null);
    else
        publicFunction.error(res, '未登录或登录已过期');
});

/**
 * 注册App用户
 * @param phoneNumber, registrationDevice, registrationOS
 * @returns {appUserID: Number}
 */
notCheckLoginUrls.push('/register');
router.get('/register', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length) {
        var keyValues = {
            PhoneNumber: data.phoneNumber,
            LoginPassword: '',
            RegistrationStatus: 0,
            RegistrationDevice: data.registrationDevice,
            RegistrationOS: data.registrationOS
        };
        dbHelper.appUsers.new(keyValues, function(newAppUserID) {
            publicFunction.success(res, {appUserID: newAppUserID});
        });
    }
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 修改App用户资料
 * @param iconFile, nickname, isMan
 */
router.post('/update', function(req, res, next) {
    var data = req.body;
    var files = req.files;
    if (data.nickname && data.nickname.length
        && data.isMan && data.isMan.length
        && files.iconFile && files.iconFile.size)

        dbHelper.appUsers.findByID(req.appUserID, function (rows) {
            if (rows.length) {
                publicFunction.moveAppUserIconFile(parseInt(req.appUserID), files.iconFile, function(){
                    var setKeyValues = {
                        IconFileName: files.iconFile.name,
                        Nickname: data.nickname,
                        IsMan: data.isMan
                    };
                    var updateAppUser = rows[0];
                    // 用户首次设置资料
                    if (updateAppUser.RegistrationStatus < 2)
                        setKeyValues.RegistrationStatus = 2;
                    dbHelper.appUsers.update(setKeyValues, {AppUserID: updateAppUser.AppUserID}, function(result){
                        publicFunction.success(res, null);
                        // 用户首次设置资料 检查是否被邀请过，邀请过则建立邀请朋友关系且发送加好友消息
                        if (updateAppUser.RegistrationStatus < 2)
                            dbHelper.appUsers.findByInviteesPhoneNumber(updateAppUser.PhoneNumber, function(appUsers){
                                var i = 0;
                                function nextFunc(){
                                    if (i >= appUsers.length) return;
                                    var appUser = appUsers[i++];
                                    dbHelper.appUsers.addFriend(appUser.AppUserID, updateAppUser.AppUserID, function(){
                                        dbHelper.messages.newFriendMessage(updateAppUser.AppUserID, appUser.AppUserID, appUser.APNSToken, data.nickname + ' 已加你为好友。', nextFunc);
                                    });
                                }
                                nextFunc();
                            });
                    });
                });
            }
            else
                publicFunction.error(res, 'App用户' + req.appUserID + '不存在');
        });
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 更新苹果远程通知令牌
 * @param APNSToken
 */
router.get('/updateAPNSToken', function(req, res, next) {
    var data = req.query;
    if (data.APNSToken && data.APNSToken.length)
        dbHelper.appUsers.update({APNSToken: data.APNSToken}, {AppUserID: req.appUserID}, function(result){
            publicFunction.success(res, null);
        });
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 更新用户状态为 已进入应用主页
 */
router.get('/enterHome', function(req, res, next) {
    dbHelper.appUsers.update({RegistrationStatus: 3}, {AppUserID: req.appUserID}, function(result){
        publicFunction.success(res, null);
    });
});

/**
 * 更新地理位置信息
 * @param longitude, latitude
 */
router.get('/updateLocation', function(req, res, next) {
    var data = req.query;
    if (data.longitude && parseFloat(data.longitude) != undefined
        && data.latitude && parseFloat(data.latitude) != undefined) {
        var setKeyValues = {
            LastLoginTime: new Date(),
            LastLoginIP: req.connectionIP,
            LastLoginLongitude: data.longitude,
            LastLoginLatitude: data.latitude
        };
        dbHelper.appUsers.update(setKeyValues, {AppUserID: req.appUserID}, function(result){
            publicFunction.success(res, null);
        });
    }
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 邀请朋友
 * @param phoneNumber
 * @returns {message}
 */
router.get('/addFriend', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length) {
        dbHelper.appUsers.findByID(req.appUserID, function(rows){
            if (rows.length) {
                var appUserInfo = rows[0];
                dbHelper.appUsers.findByPhoneNumber(data.phoneNumber, function(rows){
                    if (rows.length) {
                        // 被邀手机号已经是WEI用户，则双方加为朋友，且向该手机号发送WEI消息(xxx已加你为朋友)
                        var friendUserID = rows[0].AppUserID;
                        dbHelper.appUsers.isFriend(req.appUserID, friendUserID, function(isFriend){
                            if (isFriend)
                                publicFunction.success(res, {message:'你们已经是朋友了'});
                            else
                                dbHelper.appUsers.addFriend(req.appUserID, friendUserID, function(){
                                    dbHelper.messages.newFriendMessage(req.appUserID, friendUserID, rows[0].APNSToken, appUserInfo.Nickname + ' 已加你好友。', function(){
                                        publicFunction.success(res, {message:'已加为朋友'});
                                    });
                                });
                        });
                    }
                    else
                    // 被邀手机号不是WEI用户，添加邀请关系待该手机号注册时直接建立朋友关系，再向该手机号发送邀请短信(xxx 邀请你加为 WEI好友。[URL]URL是WEI的Home Web Page)
                        dbHelper.inviteFriends.find(req.appUserID, data.phoneNumber, function(rows){
                            if (rows.length <= 0)
                                dbHelper.inviteFriends.new(req.appUserID, data.phoneNumber, function(){
                                    dbHelper.sms.newInviteFriendSMS(data.phoneNumber, appUserInfo.PhoneNumber + appUserInfo.Nickname + ' 邀请你加为[' + settings.appName + ']好友。' + settings.appHomePageUrl, function(smsID){
                                        dbHelper.sms.newUnsentSMS(smsID, function(){
                                            publicFunction.success(res, {message:'已邀请'});
                                        });
                                    });
                                });
                            else
                                publicFunction.success(res, {message:'你已经邀请过此用户'});
                        });
                });
            }
            else
                publicFunction.error(res, 'App用户' + req.appUserID + '不存在');
        });
    }
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 订阅公众号
 * @param partnerUserID
 * @returns {*}
 */
router.get('/addPartnerUser', function(req, res, next) {
    var data = req.query;
    if (data.partnerUserID && data.partnerUserID.length && parseInt(data.partnerUserID))
        dbHelper.appUsers.addPartner(req.appUserID, data.partnerUserID, function(result){
            publicFunction.success(res, null);
        });
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 设置朋友是否在黑名单中
 * @param friendUserID, isBlack:0不是，1是
 */
router.get('/setFriendIsBlack', function(req, res, next) {
    var data = req.query;
    if (data.friendUserID && data.friendUserID.length && parseInt(data.friendUserID)
        && data.isBlack && parseInt(data.isBlack))
        dbHelper.appUsers.setFriendIsBlack(req.appUserID, data.friendUserID, data.isBlack, function(result){
            if (result.affectedRows)
                publicFunction.success(res, null);
            else
                publicFunction.error(res, '不是朋友');
        });
    else
        publicFunction.error(res, '缺少参数');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.notCheckLoginUrls = notCheckLoginUrls;