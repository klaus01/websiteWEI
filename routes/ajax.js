var express = require('express');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var fileHelper = require('../lib/fileHelper');
var settings = require('../settings');
var PATHHEADER = 'ajax';


function resultJSON(res, isSuccess, content) {
    var ret = {
        success: isSuccess
    };
    if (isSuccess)
        ret.data = content;
    else
        ret.message = content;
    res.jsonp(ret);
}
function error(res, message) {
    resultJSON(res, false, message);
}
function success(res, data) {
    resultJSON(res, true, data);
}

function checkIsManager(req, res, isManager) {
    if (req.session.user.IsManager)
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
            if (!data.id) {
                error(res, '缺少id');
                return;
            }
            var id = parseInt(data.id);
            if (!data.name) {
                error(res, '缺少姓名');
                return;
            }
            if (!data.loginname) {
                error(res, '缺少登录名');
                return;
            }
            if ((id <= 0) && !data.password) {
                error(res, '缺少密码');
                return;
            }

            dbHelper.backendUsers.findByLoginName(data.loginname, id, function(rows) {
                if (rows.length > 0)
                    error(res, '登录名' + data.loginname + '已存在，请更换');
                else if (id > 0)
                    dbHelper.backendUsers.update(id, data.name, 0, data.loginname, data.password, function (data) {
                        success(res, data);
                    });
                else
                    dbHelper.backendUsers.new(data.name, 0, data.loginname, data.password, function (data) {
                        success(res, data);
                    });
            });
        }
    );
});

router.post('/backendUser/delete', function(req, res) {
    checkIsManager(req, res,
        function() {
            var id = req.body.id;
            if (id)
                dbHelper.backendUsers.delete(id, function(rows){
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
    if (id)
        dbHelper.partnerUsers.findByID(parseInt(id), function(rows){
            if (rows.length)
                success(res, rows[0]);
            else
                error(res, '无此用户');
        });
    else
        error(res, '缺少id');
});

router.post('/partnerUser/post', function(req, res) {
    var data = req.body;
    var files = req.files;
    if (!data.id) {
        error(res, '缺少id');
        return;
    }
    var id = parseInt(data.id);
    if (!data.name) {
        error(res, '缺少名称');
        return;
    }
    if ((id <= 0) && !files.iconfile) {
        error(res, '缺少头像');
        return;
    }
    if (!data.description) {
        error(res, '缺少描述');
        return;
    }
    if (!data.loginname) {
        error(res, '缺少登录名');
        return;
    }
    if ((id <= 0) && !data.password) {
        error(res, '缺少密码');
        return;
    }
    if (!data.enabled) {
        error(res, '缺少启用状态');
        return;
    }

    dbHelper.partnerUsers.findByLoginName(data.loginname, id, function(rows) {
        if (rows.length > 0) {
            error(res, '登录名' + data.loginname + '已存在，请更换');
            return;
        }

        function operatingDB(){
            var iconFileName = files.iconfile ? files.iconfile.name : null;
            if (id > 0)
                dbHelper.partnerUsers.update(id, data.name, iconFileName, data.description, data.loginname, data.password, data.enabled, function (data) {
                    success(res, data);
                });
            else
                dbHelper.partnerUsers.new(data.name, iconFileName, data.description, data.loginname, data.password, data.enabled, function (data) {
                    success(res, data);
                });
        }

        if (files.iconfile)
            fileHelper.movePartnerUserIconFile(files.iconfile, operatingDB);
        else
            operatingDB();
    });
});

module.exports = router;
module.exports.PATHHEADER = PATHHEADER;