var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var settings = require('../settings');


/********************************
 * 扩展Date对象
 ********************************/

Date.prototype.format = function(format) {
    var date = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "S+": this.getMilliseconds()
    };
    if (/(y+)/i.test(format)) {
        format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (var k in date) {
        if (new RegExp("(" + k + ")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1
                ? date[k] : ("00" + date[k]).substr(("" + date[k]).length));
        }
    }
    return format;
};

Date.prototype.toStandardString = function() {
    return this.format('yyyy-MM-dd hh:mm:ss');
};


/********************************
 * 其它
 ********************************/

function sleep(sleepTime) {
    for(var start = Date.now(); Date.now() - start <= sleepTime; ) { }
}
module.exports.sleep = sleep;

function md5(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}
module.exports.md5 = md5;


/********************************
 * Express相关
 ********************************/

/**
 * Express中间件方法，为req增加connectionIP属性，兼容Nginx
 * @param req
 * @param res
 * @param next
 */
module.exports.addConnectionIPToRequest = function(req, res, next){
    req.connectionIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    next && next();
};


/********************************
 * 项目公共方法
 ********************************/

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
module.exports.error = function (res, message) {
    resultJSON(res, false, message);
};
module.exports.success = function (res, data) {
    resultJSON(res, true, data);
};


/**
 * 生成用户领奖签名
 * @param appUserID
 * @param activityID
 * @returns {*}
 */
module.exports.getAwardSign = function (appUserID, activityID) {
    return md5(settings.signMark + appUserID + activityID);
};

/**
 * 验证用户领奖签名
 * @param appUserID
 * @param activityID
 * @param sign
 * @returns {boolean}
 */
module.exports.checkAwardSign = function (appUserID, activityID, sign) {
    var tSign = md5(settings.signMark + appUserID + activityID);
    return sign === tSign;
};

/**
 * 根据手机号返回区域类型
 * @param phoneNumber
 * @returns {number} 0大陆，1香港
 */
module.exports.getAreaTypeByPhoneNumber = function (phoneNumber) {
    //TODO 根据手机号返回AreaType
    return 0;
};

/**
 * 为row或rows中的元素添加属性
 * @param rowOrRows
 * @param callbackAddProp 传入row，添加属性后返回此row
 * @returns {*} 处理后的rowOrRows
 */
function addProperty(rowOrRows, callbackAddProp) {
    if (Array.isArray(rowOrRows))
        for (var i = 0; i < rowOrRows.length; i++)
            rowOrRows[i] = callbackAddProp(rowOrRows[i]);
    else
        rowOrRows = callbackAddProp(rowOrRows);
    return rowOrRows;
}

function mkdirsSync(dirPath) {
    var parentDir = path.dirname(dirPath);
    if (!fs.existsSync(parentDir))
        mkdirsSync(parentDir);
    fs.mkdirSync(dirPath);
}
module.exports.mkdirsSync = mkdirsSync;

function movefile(sourcePath, targetPath, next) {
    // 如果目标目录不存在则创建
    var targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir))
        mkdirsSync(targetDir);
    // 移动文件
    fs.rename(sourcePath, targetPath, next);
}
module.exports.movefile = movefile;

module.exports.moveAppUserIconFile = function (appUserID, file, next){
    movefile(
        path.join(__dirname, '..', file.path),
        path.join(__dirname, '..', 'public', settings.appUserIconsDir, (appUserID % 10).toString(), file.name),
        function(err) {
            if (err) {// 删除临时文件夹文件
                fs.unlink(tmpPath, function (err) {
                    if (err) throw err;
                });
                throw err;
            }
            next && next();
        }
    );
};

module.exports.addAppUserIconUrl = function(appUserRows){
    return addProperty(appUserRows, function(row){
        row.IconUrl = row.IconFileName && row.IconFileName.length ? path.join(settings.partnerUserIconsDir, (row.AppUserID % 10).toString(), row.IconFileName) : null;
        return row;
    });
};

module.exports.movePartnerUserIconFile = function (file, next){
    movefile(
        path.join(__dirname, '..', file.path),
        path.join(__dirname, '..', 'public', settings.partnerUserIconsDir, file.name),
        function(err) {
            if (err) {// 删除临时文件夹文件
                fs.unlink(tmpPath, function (err) {
                    if (err) throw err;
                });
                throw err;
            }
            next && next();
        }
    );
};

module.exports.addPartnerUserIconUrl = function(partnerUserRows){
    return addProperty(partnerUserRows, function(row){
        row.IconUrl = row.IconFileName && row.IconFileName.length ? path.join(settings.partnerUserIconsDir, row.IconFileName) : null;
        return row;
    });
};

module.exports.moveActivityPictureFile = function (partnerUserID, file, next){
    movefile(
        path.join(__dirname, '..', file.path),
        path.join(__dirname, '..', 'public', settings.activityPicturesDir, partnerUserID, file.name),
        function(err) {
            if (err) {// 删除临时文件夹文件
                fs.unlink(tmpPath, function (err) {
                    if (err) throw err;
                });
                throw err;
            }
            next && next();
        }
    );
};

module.exports.addActivityPictureUrl = function(activityRows){
    return addProperty(activityRows, function(row){
        row.PictureUrl = row.PictureFileName && row.PictureFileName.length ? path.join(settings.activityPicturesDir, row.PartnerUserID.toString(), row.PictureFileName) : null;
        return row;
    });
};

module.exports.moveWordPictureFile = function (wordID, file, next){
    movefile(
        path.join(__dirname, '..', file.path),
        path.join(__dirname, '..', 'public', settings.wordPicturesDir, (wordID % 10).toString(), file.name),
        function(err) {
            if (err) {// 删除临时文件夹文件
                fs.unlink(tmpPath, function (err) {
                    if (err) throw err;
                });
                throw err;
            }
            next && next();
        }
    );
};

module.exports.moveWordAudioFile = function (wordID, file, next){
    movefile(
        path.join(__dirname, '..', file.path),
        path.join(__dirname, '..', 'public', settings.wordAudioDir, (wordID % 10).toString(), file.name),
        function(err) {
            if (err) {// 删除临时文件夹文件
                fs.unlink(tmpPath, function (err) {
                    if (err) throw err;
                });
                throw err;
            }
            next && next();
        }
    );
};

module.exports.addWordPictureAndAudioUrl = function(wordRows){
    return addProperty(wordRows, function(row){
        row.PictureUrl = null;
        row.AudioUrl = null;
        if (row.ID) {
            var idDir = (row.ID % 10).toString();
            if (row.PictureFileName)
                row.PictureUrl = path.join(settings.wordPicturesDir, idDir, row.PictureFileName);
            if (row.AudioFileName)
                row.AudioUrl = path.join(settings.wordAudioDir, idDir, row.AudioFileName);
        }
        return row;
    });
};