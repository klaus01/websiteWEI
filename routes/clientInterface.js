var express = require('express');
var app = express();
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');


function resultJSON(res, isSuccess, content) {
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

function getAwardUrlParameterStr(appUserID, activityID) {
    var sign = publicFunction.md5(settings.signMark + appUserID + activityID);
    return 'appUserID=' + appUserID + '&activityID=' + activityID + '&sign=' + sign;
}

function checkAwardUrlParameter(appUserID, activityID, sign) {
    var tSign = publicFunction.md5(settings.signMark + appUserID + activityID);
    return sign === tSign;
}

/********************************
 * App用户相关
 ********************************/

/**
 * 获取App用户信息
 * @param appUserID or phoneNumber
 * @returns {appUser}
 */
router.get('/appUser/get', function(req, res, next) {

    function result(rows) {
        if (rows.length)
            success(res, rows[0]);
        else
            error(res, 'App用户不存在');
    }

    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID))
        dbHelper.appUsers.findByID(data.appUserID, result);
    else if (data.phoneNumber && data.phoneNumber.length)
        dbHelper.appUsers.findByPhoneNumber(data.phoneNumber, result);
    else
        error(res, '缺少参数');
});

/**
 * 获取朋友信息列表
 * @param appUserID
 * @returns {[{SourceUserID, LastTime, UneadCount, AppUser:{}, PartnerUser:{}}]}
 */
router.get('/appUser/getFriends', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length > 0 && parseInt(data.appUserID)) {
        dbHelper.appUsers.findFriendsByAppUserID(data.appUserID, function(rows){
            success(res, rows);
        });
    }
    else
        error(res, '缺少参数');
});

/**
 * 注册App用户
 * @param phoneNumber, registrationDevice, registrationOS
 * @returns {appUserID: Number}
 */
router.get('/appUser/register', function(req, res, next) {
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
            success(res, {appUserID: newAppUserID});
        });
    }
    else
        error(res, '缺少参数');
});

/**
 * 修改App用户资料
 * @param appUserID, iconFile, nickname, isMan
 */
router.post('/appUser/update', function(req, res, next) {
    var data = req.body;
    var files = req.files;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.nickname && data.nickname.length
        && data.isMan && data.isMan.length
        && files.iconFile && files.iconFile.size)

        dbHelper.appUsers.findByID(data.appUserID, function (rows) {
            if (rows.length) {
                publicFunction.moveAppUserIconFile(parseInt(data.appUserID), files.iconFile, function(){
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
                        success(res, null);
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
                error(res, 'App用户' + data.appUserID + '不存在');
        });
    else
        error(res, '缺少参数');
});

/**
 * 更新苹果远程通知令牌
 * @param appUserID, APNSToken
 */
router.get('/appUser/updateAPNSToken', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.APNSToken && data.APNSToken.length) {
        dbHelper.appUsers.update({APNSToken: data.APNSToken}, {AppUserID: data.appUserID}, function(result){
            if (result.affectedRows)
                success(res, null);
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
 */
router.get('/appUser/enterHome', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID))
        dbHelper.appUsers.update({RegistrationStatus: 3}, {AppUserID: data.appUserID}, function(result){
            if (result.affectedRows)
                success(res, null);
            else
                error(res, 'App用户' + data.appUserID + '不存在');
        });
    else
        error(res, '缺少参数');
});

/**
 * 更新地理位置信息
 * @param appUserID, longitude, latitude
 */
router.get('/appUser/updateLocation', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.longitude && parseFloat(data.longitude) != undefined
        && data.latitude && parseFloat(data.latitude) != undefined) {
        var setKeyValues = {
            LastLoginTime: new Date(),
            LastLoginIP: req.connectionIP,
            LastLoginLongitude: data.longitude,
            LastLoginLatitude: data.latitude
        };
        dbHelper.appUsers.update(setKeyValues, {AppUserID: data.appUserID}, function(result){
            if (result.affectedRows)
                success(res, null);
            else
                error(res, 'App用户' + data.appUserID + '不存在');
        });
    }
    else
        error(res, '缺少参数');
});

/**
 * 邀请朋友
 * @param appUserID, phoneNumber
 * @returns {message}
 */
router.get('/appUser/addFriend', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.phoneNumber && data.phoneNumber.length) {
        dbHelper.appUsers.findByID(data.appUserID, function(rows){
            if (rows.length) {
                var appUserInfo = rows[0];
                dbHelper.appUsers.findByPhoneNumber(data.phoneNumber, function(rows){
                    if (rows.length) {
                        // 被邀手机号已经是WEI用户，则双方加为朋友，且向该手机号发送WEI消息(xxx已加你为朋友)
                        var friendUserID = rows[0].AppUserID;
                        dbHelper.appUsers.isFriend(data.appUserID, friendUserID, function(isFriend){
                            if (isFriend)
                                success(res, {message:'你们已经是朋友了'});
                            else
                                dbHelper.appUsers.addFriend(data.appUserID, friendUserID, function(){
                                    dbHelper.messages.newFriendMessage(data.appUserID, friendUserID, rows[0].APNSToken, appUserInfo.Nickname + ' 已加你好友。', function(){
                                        success(res, {message:'已加为朋友'});
                                    });
                                });
                        });
                    }
                    else
                        // 被邀手机号不是WEI用户，添加邀请关系待该手机号注册时直接建立朋友关系，再向该手机号发送邀请短信(xxx 邀请你加为 WEI好友。[URL]URL是WEI的Home Web Page)
                        dbHelper.inviteFriends.find(data.appUserID, data.phoneNumber, function(rows){
                            if (rows.length <= 0)
                                dbHelper.inviteFriends.new(data.appUserID, data.phoneNumber, function(){
                                    dbHelper.sms.newInviteFriendSMS(data.phoneNumber, appUserInfo.PhoneNumber + appUserInfo.Nickname + ' 邀请你加为[' + settings.appName + ']好友。' + settings.appHomePageUrl, function(smsID){
                                        dbHelper.sms.newUnsentSMS(smsID, function(){
                                            success(res, {message:'已邀请'});
                                        });
                                    });
                                });
                            else
                                success(res, {message:'你已经邀请过此用户'});
                        });
                });
            }
            else
                error(res, 'App用户' + data.appUserID + '不存在');
        });
    }
    else
        error(res, '缺少参数');
});

/**
 * 订阅公众号
 * @param appUserID, partnerUserID
 * @returns {*}
 */
router.get('/appUser/addPartnerUser', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.partnerUserID && data.partnerUserID.length && parseInt(data.partnerUserID))
        dbHelper.appUsers.addPartner(data.appUserID, data.partnerUserID, function(result){
            success(res, null);
        });
    else
        error(res, '缺少参数');
});

/**
 * 设置朋友是否在黑名单中
 * @param appUserID, friendUserID, isBlack:0不是，1是
 */
router.get('/appUser/setFriendIsBlack', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.friendUserID && data.friendUserID.length && parseInt(data.friendUserID)
        && data.isBlack && parseInt(data.isBlack))
        dbHelper.appUsers.setFriendIsBlack(data.appUserID, data.friendUserID, data.isBlack, function(result){
            if (result.affectedRows)
                success(res, null);
            else
                error(res, '用户' + data.appUserID + '与用户' + data.friendUserID + '不是朋友');
        });
    else
        error(res, '缺少参数');
});


/********************************
 * 公众号相关
 ********************************/

/**
 * 获取可订阅公众号列表(未禁用的公众号列表)
 * @returns {[partnerUser]}
 */
router.get('/partnerUser/getCanSubscribe', function(req, res, next) {
    dbHelper.partnerUsers.findEnabled(function(rows){
        success(res, rows);
    });
});

/**
 * 获取用户已订阅的公众号列表
 * @param appUserID
 * @returns {[partnerUser]} 按最近消息时间降序排序，增加了UnreadCount和NoAwardCount属性
 */
router.get('/partnerUser/getSubscribed', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length > 0 && parseInt(data.appUserID))
        dbHelper.partnerUsers.findMessagesBySubscriberID(data.appUserID, function(rows){
            success(res, rows);
        });
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
router.get('/sms/sendCheck', function(req, res, next) {
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
        error(res, '缺少参数');
});

/**
 * 校验手机验证码
 * @param phoneNumber, verificationCode
 */
router.get('/sms/checkVerificationCode', function(req, res, next) {
    var data = req.query;
    if (data.phoneNumber && data.phoneNumber.length > 0
        && data.verificationCode && data.verificationCode.length > 0) {
        dbHelper.sms.findUnexpiredAndUnverifiedCheckSMSByPhoneNumber(data.phoneNumber, function(rows){
            if (rows.length > 0) {
                if (rows[0].VerificationCode === data.verificationCode) {
                    dbHelper.sms.updateVerified(rows[0].SMSID, function () {
                        dbHelper.appUsers.findByPhoneNumber(data.phoneNumber, function (rows) {
                            if (rows.length <= 0) return;
                            if (rows[0].RegistrationStatus < 1)
                                dbHelper.appUsers.update({RegistrationStatus: 1}, {PhoneNumber: data.phoneNumber});
                        });
                    });
                    success(res, null);
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


/********************************
 * 字相关
 ********************************/

/**
 * 获取字列表
 * @param [appUserID, number or description, (offset, resultCount)]
 * @returns {[word]} 有appUserID时按Number升序，没有appUserID时按UseCount降序
 */
router.get('/word/find', function(req, res, next) {
    var data = req.query;
    if (!data.offset || (data.offset && data.resultCount && parseInt(data.offset) && parseInt(data.resultCount))) {
        function resultFunc(rows) {
            success(res, rows);
        }

        var findNumber = data.number;
        var findDescription = data.description;
        var offset = data.offset;
        var resultCount = data.resultCount;

        if (data.appUserID) {
            // 返回系统字、appUserID发送的字 和 appUserID接收到的字
            if (data.appUserID.length && parseInt(data.appUserID)) {
                if (findNumber)
                    dbHelper.words.findByAppUserIDAndNumber(data.appUserID, findNumber, offset, resultCount, resultFunc);
                else if (findDescription)
                    dbHelper.words.findByAppUserIDAndDescription(data.appUserID, findDescription, offset, resultCount, resultFunc);
                else
                    dbHelper.words.findByAppUserID(data.appUserID, offset, resultCount, resultFunc);
            }
            else
                error(res, '缺少参数');
        }
        else {
            // 返回所有字
            if (findNumber)
                dbHelper.words.findByNumber(findNumber, offset, resultCount, resultFunc);
            else if (findDescription)
                dbHelper.words.findByDescription(findDescription, offset, resultCount, resultFunc);
            else
                dbHelper.words.find(offset, resultCount, resultFunc);
        }
    }
    else
        error(res, '缺少参数');
});

/**
 * 创建字
 * @param appUserID, description, pictureFile[, audioFile]
 * @returns {newWordID}
 */
router.post('/word/new', function(req, res, next) {
    var data = req.body;
    var files = req.files;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && files.pictureFile)
        dbHelper.words.new(data.appUserID, files.pictureFile.name, data.description, files.audioFile ? files.audioFile.name : null, function(newWordID){
            success(res, {newWordID: newWordID});
            publicFunction.moveWordPictureFile(newWordID, files.pictureFile);
            if (files.audioFile) publicFunction.moveWordAudioFile(newWordID, files.audioFile);
        });
    else
        error(res, '缺少参数');
});

/**
 * 发送字
 * @param wordID, appUserID, friendsUserID[]
 */
router.get('/word/send', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.wordID && data.wordID.length && parseInt(data.wordID)
        && data.friendsUserID && data.friendsUserID.length)
        dbHelper.appUsers.findByID(data.appUserID, function(rows){
            if (rows.length) {
                var user = rows[0];
                var i = 0;
                function nextFunc(){
                    if (i >= data.friendsUserID.length) return;
                    var friendUserID = parseInt(data.friendsUserID[i++]);
                    if (friendUserID)
                        // 判断是不是发给公众号的
                        dbHelper.partnerUsers.findByID(friendUserID, function(rows) {
                            if (rows.length) {
                                // 是则判断查询有没有可参加的活动且是否中奖
                                dbHelper.messages.newWordMessage(data.appUserID, friendUserID, data.wordID, null, user.Nickname + ' 给你发来一个字。', function(){
                                    dbHelper.activities.findActivitiesExtUnexpiredByAppUserID(data.appUserID, function (rows) {
                                        for (var i = 0; i < rows.length; i++) {
                                            var activityExt = rows[i];
                                            var gift = false;
                                            if (activityExt.DistanceMeters) {
                                                // TODO 指定范围活动中奖的判断逻辑
                                            }
                                            else
                                                // 指定时间范围内回复字消息，中奖
                                                gift = true;
                                            if (gift) {
                                                var awardQRCodeInfo = getAwardUrlParameterStr(data.appUserID, activityExt.PartnerActivityID);
                                                dbHelper.messages.newGiftMessage(friendUserID, data.appUserID, activityExt.PartnerActivityID, awardQRCodeInfo, user.APNSToken, '您中奖了，快来领取礼品');
                                            }
                                        }
                                    });
                                    nextFunc();
                                });
                            }
                            else
                                // 不是公众号就查询App用户
                                dbHelper.appUsers.findByID(friendUserID, function (rows) {
                                    if (rows.length)
                                        dbHelper.messages.newWordMessage(data.appUserID, friendUserID, data.wordID, rows[0].APNSToken, user.Nickname + ' 给你发来一个字。', nextFunc);
                                    else
                                        nextFunc();
                                });
                        });
                    else
                        nextFunc();
                }
                nextFunc();
                success(res, null);
            }
            else
                error(res, 'App用户' + data.appUserID + '不存在');
        });
    else
        error(res, '缺少参数');
});


/********************************
 * 消息相关
 ********************************/

/**
 * 获取未读消息列表
 * @param appUserID
 * @returns {[{AppUser:{}, PartnerUser:{}, Message:{}, Word:{}, Activity:{}, Gift:{}}]}
 */
router.get('/message/getUnread', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID))
        dbHelper.messages.findUnreadByAppUserID(data.appUserID, function(rows){
            success(res, rows);
        });
    else
        error(res, '缺少参数');
});

/**
 * 获取用户与公众号历史消息列表
 * @param appUserID, partnerUserID
 * @returns {[{Message:{}, Word:{}, Activity:{}, Gift:{}}]}
 */
router.get('/message/getByAppUserAndPartnerUser', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length > 0 && parseInt(data.appUserID)
        && data.partnerUserID && data.partnerUserID.length > 0 && parseInt(data.partnerUserID))
        dbHelper.messages.findByAppUserIDAndPartnerUserID(data.appUserID, data.partnerUserID, function(rows){
            success(res, rows);
        });
    else
        error(res, '缺少参数');
});

/**
 * 设置消息为已读
 * @param messageID
 * @returns {*}
 */
router.get('/message/setRead', function(req, res, next) {
    var data = req.query;
    if (data.messageID && data.messageID.length > 0 && parseInt(data.messageID))
        dbHelper.messages.updateIsRead(data.messageID, 1, function(){
            success(res, null);
        });
    else
        error(res, '缺少参数');
});


/********************************
 * 活动相关
 ********************************/

/**
 * 领奖
 * @param appUserID, activityID, sign
 * @returns {message}
 */
router.get('/activity/award', function(req, res, next) {
    var data = req.query;
    if (data.appUserID && data.appUserID.length && parseInt(data.appUserID)
        && data.activityID && data.activityID.length && parseInt(data.activityID)
        && data.sign && data.sign.length)
        if (checkAwardUrlParameter(data.appUserID, data.activityID, data.sign))
            dbHelper.activities.award(data.appUserID, data.activityID, function(result){
                if (result.affectedRows)
                    success(res, '领奖登录成功');
                else
                    error(res, '该用户未参加此活动，或已经领取过奖品');
            });
        else
            error(res, '活动验证失败，提供的二维码是错误的');
    else
        error(res, '缺少参数');
});


module.exports = router;
