var express = require('express');
var path = require('path');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var publicFunction = require('../lib/publicFunction');
var PATHHEADER = path.basename(__filename, '.js');


function checkIsManager(req, res, isManager) {
    if (req.session.adminUser && req.session.adminUser.IsManager)
        isManager();
    else
        publicFunction.error(res, '不是管理员用户');
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
                        publicFunction.success(res, rows[0]);
                    else
                        publicFunction.error(res, '无此用户');
                });
            else
                publicFunction.error(res, '缺少id');
        }
    );
});

router.post('/backendUser/post', function(req, res) {
    checkIsManager(req, res,
        function() {
            var data = req.body;
            if (data.id == undefined || parseInt(data.id) == undefined) {
                publicFunction.error(res, '缺少id');
                return;
            }
            var id = parseInt(data.id);
            if (data.name == undefined || !data.name.length) {
                publicFunction.error(res, '缺少姓名');
                return;
            }
            if (data.loginname == undefined || !data.loginname.length) {
                publicFunction.error(res, '缺少登录名');
                return;
            }
            if ((id <= 0) && (data.password == undefined || !data.password.length)) {
                publicFunction.error(res, '缺少密码');
                return;
            }

            dbHelper.backendUsers.findByLoginName(data.loginname, id, function(rows) {
                if (rows.length > 0)
                    publicFunction.error(res, '登录名' + data.loginname + '已存在，请更换');
                else if (id > 0)
                    dbHelper.backendUsers.update(id, data.name, 0, data.loginname, data.password, function (result) {
                        publicFunction.success(res, null);
                    });
                else
                    dbHelper.backendUsers.new(data.name, 0, data.loginname, data.password, function (newID) {
                        publicFunction.success(res, {newID: newID});
                    });
            });
        }
    );
});

router.post('/backendUser/updatePassword', function(req, res) {
    if (!req.session.adminUser) {
        publicFunction.error(res, '未登录或登录已过期，请重新登录');
        return;
    }
    var backendUserID = req.session.adminUser.ID;
    var data = req.body;
    if (data.oldpassword == undefined || !data.oldpassword.length) {
        publicFunction.error(res, '缺少旧密码');
        return;
    }
    if (data.newpassword == undefined || !data.newpassword.length) {
        publicFunction.error(res, '缺少新密码');
        return;
    }

    dbHelper.backendUsers.findByID(backendUserID, function(rows) {
        if (rows.length) {
            var oldPassword = new Buffer(data.oldpassword, 'base64').toString();
            var newPassword = new Buffer(data.newpassword, 'base64').toString();
            if (oldPassword === rows[0].LoginPassword)
                dbHelper.backendUsers.updatePassword(backendUserID, newPassword, function () {
                    publicFunction.success(res, '修改成功');
                });
            else
                publicFunction.error(res, '旧密码错误');
        }
        else
            publicFunction.error(res, '用户不存在');
    });
});

router.post('/backendUser/delete', function(req, res) {
    checkIsManager(req, res,
        function() {
            var id = req.body.id;
            if (id != undefined && parseInt(id))
                dbHelper.backendUsers.delete(id, function(){
                    publicFunction.success(res, null);
                });
            else
                publicFunction.error(res, '缺少id');
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
                            publicFunction.success(res, data);
                        }
                        else
                            publicFunction.error(res, '公众号关联的App用户ID:' + data.AppUserID + '不存在');
                    });
                else
                    publicFunction.success(res, data);
            }
            else
                publicFunction.error(res, '无此用户');
        });
    else
        publicFunction.error(res, '缺少id');
});

router.post('/partnerUser/post', function(req, res) {
    var data = req.body;
    var files = req.files;
    if (data.id == undefined || parseInt(data.id) == undefined) {
        publicFunction.error(res, '缺少id');
        return;
    }
    var id = parseInt(data.id);
    if (data.name == undefined || !data.name.length) {
        publicFunction.error(res, '缺少名称');
        return;
    }
    if ((id <= 0) && (!files.iconFile || !files.iconFile.size)) {
        publicFunction.error(res, '缺少头像');
        return;
    }
    if (data.description == undefined || !data.description.length) {
        publicFunction.error(res, '缺少描述');
        return;
    }
    if (data.loginName == undefined || !data.loginName.length) {
        publicFunction.error(res, '缺少登录名');
        return;
    }
    if ((id <= 0) && (data.password == undefined || !data.password.length)) {
        publicFunction.error(res, '缺少密码');
        return;
    }
    if (data.enabled == undefined || !data.enabled.length) {
        publicFunction.error(res, '缺少启用状态');
        return;
    }

    dbHelper.partnerUsers.findByLoginName(data.loginName, id, function(rows) {
        if (rows.length > 0) {
            publicFunction.error(res, '登录名' + data.loginName + '已存在，请更换');
            return;
        }

        var appUserID = null;
        // 操作入库
        function operatingDB(){
            var iconFileName = files.iconFile ? files.iconFile.name : null;
            if (id > 0)
                dbHelper.partnerUsers.update(id, data.name, iconFileName, data.description, data.loginName, data.password, data.enabled, appUserID, function (result) {
                    publicFunction.success(res, null);
                });
            else
                dbHelper.partnerUsers.new(data.name, iconFileName, data.description, data.loginName, data.password, data.enabled, appUserID, function (newID) {
                    publicFunction.success(res, {newID: newID});
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
                        publicFunction.error(res, 'App用户手机号' + data.appUserPhoneNumber + '不存在，请确认是否输入正确');
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

router.post('/partnerUser/updatePassword', function(req, res) {
    if (!req.session.partnerUser) {
        publicFunction.error(res, '未登录或登录已过期，请重新登录');
        return;
    }
    var partnerUserID = req.session.partnerUser.PartnerUserID;
    var data = req.body;
    if (data.oldpassword == undefined || !data.oldpassword.length) {
        publicFunction.error(res, '缺少旧密码');
        return;
    }
    if (data.newpassword == undefined || !data.newpassword.length) {
        publicFunction.error(res, '缺少新密码');
        return;
    }

    dbHelper.partnerUsers.findByID(partnerUserID, function(rows) {
        if (rows.length) {
            var oldPassword = new Buffer(data.oldpassword, 'base64').toString();
            var newPassword = new Buffer(data.newpassword, 'base64').toString();
            if (oldPassword === rows[0].LoginPassword)
                dbHelper.partnerUsers.updatePassword(partnerUserID, newPassword, function () {
                    publicFunction.success(res, '修改成功');
                });
            else
                publicFunction.error(res, '旧密码错误');
        }
        else
            publicFunction.error(res, '用户不存在');
    });
});

/********************************
 * 活动相关
 ********************************/

router.post('/activity/post', function(req, res) {
    var data = req.body;
    var files = req.files;

    if (data.partnerUserID == undefined || parseInt(data.partnerUserID) == undefined) {
        publicFunction.error(res, '缺少公众号ID');
        return;
    }
    if (parseInt(data.partnerUserID) <= 0) {
        publicFunction.error(res, '公众号ID错误');
        return;
    }
    if (data.mode == undefined || parseInt(data.mode) == undefined) {
        publicFunction.error(res, '缺少活动类型');
        return;
    }
    mode = parseInt(data.mode);
    switch(mode) {
        case 2:
            if (data.longitude == undefined || parseFloat(data.longitude) == undefined) {
                publicFunction.error(res, '缺少经度');
                return;
            }
            if (data.latitude == undefined || parseFloat(data.latitude) == undefined) {
                publicFunction.error(res, '缺少纬度');
                return;
            }
            if (!data.distanceMeters == undefined || parseInt(data.distanceMeters) == undefined || parseInt(data.distanceMeters) <= 0) {
                publicFunction.error(res, '缺少距离');
                return;
            }
        case 1:
            if (data.beginTime == undefined || !data.beginTime.length) {
                publicFunction.error(res, '缺少开始时间');
                return;
            }
            if (data.endTime == undefined || !data.endTime.length) {
                publicFunction.error(res, '缺少结束时间');
                return;
            }
            if (data.expireAwardTime == undefined || !data.expireAwardTime.length) {
                publicFunction.error(res, '缺少终止领奖时间');
                return;
            }
            var beginTime = new Date(data.beginTime);
            var endTime = new Date(data.endTime);
            var expireAwardTime = new Date(data.expireAwardTime);
            if (isNaN(beginTime.getTime())) {
                publicFunction.error(res, '开始时间格式错误');
                return;
            }
            if (isNaN(endTime.getTime())) {
                publicFunction.error(res, '结束时间格式错误');
                return;
            }
            if (isNaN(expireAwardTime.getTime())) {
                publicFunction.error(res, '终止领奖时间格式错误');
                return;
            }
            if (endTime < new Date()) {
                publicFunction.error(res, '"结束时间"应在当前时间之后');
                return;
            }
            if (beginTime > endTime || expireAwardTime < endTime) {
                publicFunction.error(res, '"开始时间"应在"结束时间"之前，"结束时间"应在"终止领奖时间"之前');
                return;
            }
        default:
            if (!files.pictureFile) {
                publicFunction.error(res, '缺少图片');
                return;
            }
            if (data.content == undefined || !data.content.length) {
                publicFunction.error(res, '缺少文字内容');
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
                    dbHelper.appUsers.getFriendIsBlack(user.AppUserID, data.partnerUserID, function (isBlack) {
                        if (isBlack)
                            next();
                        else
                            dbHelper.messages.newActivityMessage(data.partnerUserID, user.AppUserID, activityID, user.APNSToken, data.content, next);
                    });
                }
                next();
                publicFunction.success(res, {newID: activityID});
            });
        });
    });
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;