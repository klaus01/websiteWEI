var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var settings = require('../settings');
var PATHHEADER = path.basename(__filename, '.js');
var notCheckLoginUrls = [];


/**
 * 获取字列表
 * @param [appUserID, number or description, (offset, resultCount)]
 * @returns {[word]} 有appUserID时按Number升序，没有appUserID时按UseCount降序
 */
router.get('/find', function(req, res, next) {
    var data = req.query;
    if (!data.offset || (data.offset && data.resultCount && parseInt(data.offset) && parseInt(data.resultCount))) {
        function resultFunc(rows) {
            publicFunction.success(res, rows);
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
                publicFunction.error(res, '缺少参数');
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
    var data = req.query;
    if (data.wordID && data.wordID.length && parseInt(data.wordID)
        && data.friendsUserID && data.friendsUserID.length)
        dbHelper.appUsers.findByID(req.appUserID, function(rows){
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
                                dbHelper.messages.newWordMessage(req.appUserID, friendUserID, data.wordID, null, user.Nickname + ' 给你发来一个字。', function(){
                                    dbHelper.activities.findActivitiesExtUnexpiredByAppUserID(req.appUserID, function (rows) {
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
                                                var awardQRCodeInfo = 'appUserID=' + appUserID
                                                    + '&activityID=' + activityID
                                                    + '&sign=' + publicFunction.getAwardSign(req.appUserID, activityExt.PartnerActivityID);
                                                dbHelper.messages.newGiftMessage(friendUserID, req.appUserID, activityExt.PartnerActivityID, awardQRCodeInfo, user.APNSToken, '您中奖了，快来领取礼品');
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
                                        dbHelper.messages.newWordMessage(req.appUserID, friendUserID, data.wordID, rows[0].APNSToken, user.Nickname + ' 给你发来一个字。', nextFunc);
                                    else
                                        nextFunc();
                                });
                        });
                    else
                        nextFunc();
                }
                nextFunc();
                publicFunction.success(res, null);
            }
            else
                publicFunction.error(res, 'App用户' + req.appUserID + '不存在');
        });
    else
        publicFunction.error(res, '缺少参数');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
module.exports.notCheckLoginUrls = notCheckLoginUrls;