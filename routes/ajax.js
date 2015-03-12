var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var PATHHEADER = path.basename(__filename, '.js');


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

function checkIsManager(req, res, isManager) {
    if (req.session.adminUser && req.session.adminUser.IsManager)
        isManager();
    else
        error(res, '不是管理员用户');
}

/********************************
 * 后台管理用户相关
 ********************************/

router.post('/backendUser/get', function(req, res) {
    checkIsManager(req, res,
        function() {
            var id = req.body.id;
            if (id)
                dbHelper.backendUsers.findByID(parseInt(id), function(rows){
                    if (rows.length)
                        success(res, rows[0]);
                    else
                        error(res, '无此用户');
                });
            else
                error(res, '缺少id');
        }
    );
});

router.post('/backendUser/post', function(req, res) {
    checkIsManager(req, res,
        function() {
            var data = req.body;
            if (data.id == undefined || parseInt(data.id) == undefined) {
                error(res, '缺少id');
                return;
            }
            var id = parseInt(data.id);
            if (data.name == undefined || !data.name.length) {
                error(res, '缺少姓名');
                return;
            }
            if (data.loginname == undefined || !data.loginname.length) {
                error(res, '缺少登录名');
                return;
            }
            if ((id <= 0) && (data.password == undefined || !data.password.length)) {
                error(res, '缺少密码');
                return;
            }

            dbHelper.backendUsers.findByLoginName(data.loginname, id, function(rows) {
                if (rows.length > 0)
                    error(res, '登录名' + data.loginname + '已存在，请更换');
                else if (id > 0)
                    dbHelper.backendUsers.update(id, data.name, 0, data.loginname, data.password, function (result) {
                        success(res, null);
                    });
                else
                    dbHelper.backendUsers.new(data.name, 0, data.loginname, data.password, function (newID) {
                        success(res, {newID: newID});
                    });
            });
        }
    );
});

router.post('/backendUser/delete', function(req, res) {
    checkIsManager(req, res,
        function() {
            var id = req.body.id;
            if (id != undefined && parseInt(id))
                dbHelper.backendUsers.delete(id, function(){
                    success(res, null);
                });
            else
                error(res, '缺少id');
        }
    );
});

/********************************
 * 公众用户相关
 ********************************/

router.post('/partnerUser/get', function(req, res) {
    var id = req.body.id;
    if (id != undefined && parseInt(id))
        dbHelper.partnerUsers.findByID(parseInt(id), function(rows){
            if (rows.length) {
                var data = rows[0];
                if (data.AppUserID)
                    dbHelper.appUsers.findByID(data.AppUserID, function(rows){
                        if (rows.length) {
                            data.AppUser = rows[0];
                            success(res, data);
                        }
                        else
                            error(res, '公众号关联的App用户ID:' + data.AppUserID + '不存在');
                    });
                else
                    success(res, data);
            }
            else
                error(res, '无此用户');
        });
    else
        error(res, '缺少id');
});

router.post('/partnerUser/post', function(req, res) {
    var data = req.body;
    var files = req.files;
    if (data.id == undefined || parseInt(data.id) == undefined) {
        error(res, '缺少id');
        return;
    }
    var id = parseInt(data.id);
    if (data.name == undefined || !data.name.length) {
        error(res, '缺少名称');
        return;
    }
    if ((id <= 0) && !files.iconFile) {
        error(res, '缺少头像');
        return;
    }
    if (data.description == undefined || !data.description.length) {
        error(res, '缺少描述');
        return;
    }
    if (data.loginName == undefined || !data.loginName.length) {
        error(res, '缺少登录名');
        return;
    }
    if ((id <= 0) && (data.password == undefined || !data.password.length)) {
        error(res, '缺少密码');
        return;
    }
    if (data.enabled == undefined || !data.enabled.length) {
        error(res, '缺少启用状态');
        return;
    }

    dbHelper.partnerUsers.findByLoginName(data.loginName, id, function(rows) {
        if (rows.length > 0) {
            error(res, '登录名' + data.loginName + '已存在，请更换');
            return;
        }

        var appUserID = null;
        // 操作入库
        function operatingDB(){
            var iconFileName = files.iconFile ? files.iconFile.name : null;
            if (id > 0)
                dbHelper.partnerUsers.update(id, data.name, iconFileName, data.description, data.loginName, data.password, data.enabled, appUserID, function (result) {
                    success(res, null);
                });
            else
                dbHelper.partnerUsers.new(data.name, iconFileName, data.description, data.loginName, data.password, data.enabled, appUserID, function (newID) {
                    success(res, {newID: newID});
                });
        }

        // 根据App用户手机号查询出用户ID
        function findAppUserID(){
            if (data.appUserPhoneNumber)
                dbHelper.appUsers.findByPhoneNumber(data.appUserPhoneNumber, function(rows){
                    if (rows.length) {
                        appUserID = rows[0].AppUserID;
                        operatingDB();
                    }
                    else
                        error(res, 'App用户手机号' + data.appUserPhoneNumber + '不存在，请确认是否输入正确');
                });
            else
                operatingDB();
        }

        if (files.iconFile)
            publicFunction.movePartnerUserIconFile(files.iconFile, findAppUserID);
        else
            findAppUserID();
    });
});

/********************************
 * 活动相关
 ********************************/

router.post('/activity/post', function(req, res) {
    var data = req.body;
    var files = req.files;

    if (data.partnerUserID == undefined || parseInt(data.partnerUserID) == undefined) {
        error(res, '缺少公众号ID');
        return;
    }
    if (parseInt(data.partnerUserID) <= 0) {
        error(res, '公众号ID错误');
        return;
    }
    if (data.mode == undefined || parseInt(data.mode) == undefined) {
        error(res, '缺少活动类型');
        return;
    }
    mode = parseInt(data.mode);
    switch(mode) {
        case 2:
            if (data.longitude == undefined || parseFloat(data.longitude) == undefined) {
                error(res, '缺少经度');
                return;
            }
            if (data.latitude == undefined || parseFloat(data.latitude) == undefined) {
                error(res, '缺少纬度');
                return;
            }
            if (!data.distanceMeters == undefined || parseInt(data.distanceMeters) == undefined || parseInt(data.distanceMeters) <= 0) {
                error(res, '缺少距离');
                return;
            }
        case 1:
            if (data.beginTime == undefined || !data.beginTime.length) {
                error(res, '缺少开始时间');
                return;
            }
            if (data.endTime == undefined || !data.endTime.length) {
                error(res, '缺少结束时间');
                return;
            }
            if (data.expireAwardTime == undefined || !data.expireAwardTime.length) {
                error(res, '缺少终止领奖时间');
                return;
            }
            var beginTime = new Date(data.beginTime);
            var endTime = new Date(data.endTime);
            var expireAwardTime = new Date(data.expireAwardTime);
            if (isNaN(beginTime.getTime())) {
                error(res, '开始时间格式错误');
                return;
            }
            if (isNaN(endTime.getTime())) {
                error(res, '结束时间格式错误');
                return;
            }
            if (isNaN(expireAwardTime.getTime())) {
                error(res, '终止领奖时间格式错误');
                return;
            }
            if (endTime < new Date()) {
                error(res, '"结束时间"应在当前时间之后');
                return;
            }
            if (beginTime > endTime || expireAwardTime < endTime) {
                error(res, '"开始时间"应在"结束时间"之前，"结束时间"应在"终止领奖时间"之前');
                return;
            }
        default:
            if (!files.pictureFile) {
                error(res, '缺少图片');
                return;
            }
            if (data.content == undefined || !data.content.length) {
                error(res, '缺少文字内容');
                return;
            }
    }

    publicFunction.moveActivityPictureFile(data.partnerUserID, files.pictureFile, function(){
        dbHelper.activities.new(data.partnerUserID, mode, files.pictureFile.name, data.content, data.url, data.beginTime, data.endTime, data.expireAwardTime, data.longitude, data.latitude, data.distanceMeters, function (newID) {
            var activityID = newID;
            dbHelper.appUsers.findFriendsByPartnerUserID(data.partnerUserID, function(rows){
                var i = 0;
                function next(){
                    if (i >= rows.length) return;
                    var user = rows[i++];
                    dbHelper.messages.newActivityMessage(data.partnerUserID, user.AppUserID, activityID, user.APNSToken, data.content, next);
                }
                next();
                success(res, {newID: activityID});
            });
        });
    });
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;