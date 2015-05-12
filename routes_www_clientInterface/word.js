var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var LonLat = require('../lib/LonLat');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');
var notCheckLoginUrls = [];


/**
 * 获取字列表
 * @param orderByType: 0按UseCount_Before1D排序，1按UseCount_Before30D排序，2按UseCount_Before365D排序
 * @param [number or description]
 * @param [offset, resultCount]
 * @returns {[word]} 按UseCount降序
 */
router.get('/findAll', function(req, res, next) {
    var data = req.query;
    if (data.orderByType && data.orderByType.length && parseInt(data.orderByType) != undefined
        && (!data.offset || (data.offset && data.resultCount && parseInt(data.offset) != undefined && parseInt(data.resultCount))))
        dbHelper.appUsers.findByID(req.appUserID, function (rows) {
            if (rows.length) {

                function resultFunc(rows) {
                    publicFunction.success(res, rows);
                }

                var orderByFieldName = 'UseCount_Before';
                switch (data.orderByType) {
                    case '0': orderByFieldName += '1'; break;
                    case '1': orderByFieldName += '30'; break;
                    default : orderByFieldName += '365';
                }
                orderByFieldName += 'D_' + (rows[0].AreaType === 0 ? 'CN' : 'HK');
                var findNumber = data.number;
                var findDescription = data.description;
                var offset = parseInt(data.offset);
                var resultCount = parseInt(data.resultCount);

                if (findNumber)
                    dbHelper.words.findByNumber(findNumber, orderByFieldName, offset, resultCount, resultFunc);
                else if (findDescription)
                    dbHelper.words.findByDescription(findDescription, orderByFieldName, offset, resultCount, resultFunc);
                else
                    dbHelper.words.find(orderByFieldName, offset, resultCount, resultFunc);
            }
            else
                publicFunction.error(res, 'App用户' + req.appUserID + '不存在');
        });
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 获取用户可看到的字列表
 * @param [number or description]
 * @param [offset, resultCount]
 * @returns {[word]} 按Number升序 返回系统字、appUserID发送的字 和 appUserID接收到的字
 */
router.get('/findByAppUser', function(req, res, next) {
    var data = req.query;
    if (!data.offset || (data.offset && data.resultCount && parseInt(data.offset) != undefined && parseInt(data.resultCount))) {

        function resultFunc(rows) {
            publicFunction.success(res, rows);
        }

        var findNumber = data.number;
        var findDescription = data.description;
        var offset = parseInt(data.offset);
        var resultCount = parseInt(data.resultCount);

        if (findNumber)
            dbHelper.words.findByAppUserIDAndNumber(req.appUserID, findNumber, offset, resultCount, resultFunc);
        else if (findDescription)
            dbHelper.words.findByAppUserIDAndDescription(req.appUserID, findDescription, offset, resultCount, resultFunc);
        else
            dbHelper.words.findByAppUserID(req.appUserID, offset, resultCount, resultFunc);
    }
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 创建字
 * @param description, pictureFile[, audioFile]
 * @returns {newWordID}
 */
router.post('/new', function(req, res, next) {
    var data = req.body;
    var files = req.files;
    if (files.pictureFile)
        dbHelper.words.new(req.appUserID, files.pictureFile.name, data.description, files.audioFile ? files.audioFile.name : null, function(newWordID){
            publicFunction.success(res, {newWordID: newWordID});
            publicFunction.moveWordPictureFile(newWordID, files.pictureFile);
            if (files.audioFile) publicFunction.moveWordAudioFile(newWordID, files.audioFile);
        });
    else
        publicFunction.error(res, '缺少参数');
});

/**
 * 发送字
 * @param wordID, friendsUserID[]
 */
router.get('/send', function(req, res, next) {
    var appUserID = req.appUserID;
    var data = req.query;
    if (data.wordID && data.wordID.length && parseInt(data.wordID)
        && data.friendsUserID && data.friendsUserID.length)
        dbHelper.appUsers.findByID(appUserID, function(rows){
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
                                dbHelper.messages.newWordMessage(appUserID, friendUserID, data.wordID, null, user.Nickname + ' 给你发来一个字。', function(){
                                    dbHelper.activities.findActivitiesExtUnexpiredByAppUserID(appUserID, function (rows) {
                                        for (var i = 0; i < rows.length; i++) {
                                            var activityExt = rows[i];
                                            var gift = false;
                                            if (activityExt.DistanceMeters) {
                                                // 指定时间指定范围内回复字消息
                                                var obj = LonLat.getAround(activityExt.Longitude, activityExt.Latitude, activityExt.DistanceMeters);
                                                if (user.LastLoginLongitude != null && obj.minLon <= user.LastLoginLongitude && user.LastLoginLongitude <= obj.maxLon
                                                    && user.LastLoginLatitude != null && obj.minLat <= user.LastLoginLatitude && user.LastLoginLatitude <= obj.maxLat) {
                                                    gift = true;
                                                }
                                            }
                                            else
                                                // 指定时间范围内回复字消息，中奖
                                                gift = true;
                                            if (gift) {
                                                dbHelper.activities.hasGift(appUserID, activityExt.PartnerActivityID, function(hasGift){
                                                    if (hasGift) return;
                                                    var awardQRCodeInfo = 'appUserID=' + appUserID
                                                        + '&activityID=' + activityExt.PartnerActivityID
                                                        + '&sign=' + publicFunction.getAwardSign(appUserID, activityExt.PartnerActivityID);
                                                    var messageContent = user.AreaType === 0 ? '您中奖了，快来领取奖品' : '您中獎了，快來領取獎品';
                                                    dbHelper.messages.newGiftMessage(friendUserID, appUserID, activityExt.PartnerActivityID, awardQRCodeInfo, user.APNSToken, messageContent);
                                                });
                                            }
                                        }
                                    });
                                    nextFunc();
                                });
                            }
                            else
                                // 不是公众号就向APP用户发消息
                                dbHelper.appUsers.getFriendIsBlack(friendUserID, appUserID, function (isBlack) {
                                    // 看friendUserID是否拉黑appUserID，如果拉黑了就跳过
                                    if (isBlack)
                                        nextFunc();
                                    else
                                        dbHelper.appUsers.findByID(friendUserID, function (rows) {
                                            if (rows.length) {
                                                var msg = user.Nickname;
                                                if (rows[0].AreaType === 0)
                                                    msg += ' 给你发来一个字。';
                                                else
                                                    msg += ' 給你發來一個字。';
                                                dbHelper.messages.newWordMessage(appUserID, friendUserID, data.wordID, rows[0].APNSToken, msg, nextFunc);
                                            }
                                            else
                                                nextFunc();
                                        });
                                });
                        });
                    else
                        nextFunc();
                }
                nextFunc();
                publicFunction.success(res, null);
            }
            else
                publicFunction.error(res, 'App用户' + appUserID + '不存在');
        });
    else
        publicFunction.error(res, '缺少参数');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.notCheckLoginUrls = notCheckLoginUrls;