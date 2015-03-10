var fs = require('fs');
var path = require('path');
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
        fs.mkdirsSync(targetDir);
    // 移动文件
    fs.rename(sourcePath, targetPath, next);
}
module.exports.movefile = movefile;

module.exports.moveAppUserIconFile = function (appUserID, file, next){
    movefile(
        path.join(__dirname, '..', file.path),
        path.join(__dirname, '..', 'public', settings.appUserIconsDir, appUserID % 10, file.name),
        function(err) {
            if (err) {// 删除临时文件夹文件
                fs.unlink(tmpPath, function (err) {
                    if (err) throw err;
                });
                throw err;
            }
            next();
        }
    );
};

module.exports.addAppUserIconUrl = function(appUserRows){
    for (var i = 0; i < appUserRows.length; i++) {
        var row = appUserRows[i];
        row.IconUrl = path.join(settings.partnerUserIconsDir, (row.AppUserID % 10).toString(), row.IconFileName);
    }
    return appUserRows;
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
            next();
        }
    );
};

module.exports.addPartnerUserIconUrl = function(partnerUserRows){
    for (var i = 0; i < partnerUserRows.length; i++) {
        var row = partnerUserRows[i];
        row.IconUrl = path.join(settings.partnerUserIconsDir, row.IconFileName);
    }
    return partnerUserRows;
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
            next();
        }
    );
};

module.exports.addActivityPictureUrl = function(activityRows){
    for (var i = 0; i < activityRows.length; i++) {
        var row = activityRows[i];
        row.PictureUrl = path.join(settings.activityPicturesDir, row.PartnerUserID.toString(), row.PictureFileName);
    }
    return activityRows;
};

module.exports.moveWordPictureFile = function (wordID, file, next){
    movefile(
        path.join(__dirname, '..', file.path),
        path.join(__dirname, '..', 'public', settings.wordPicturesDir, wordID % 10, file.name),
        function(err) {
            if (err) {// 删除临时文件夹文件
                fs.unlink(tmpPath, function (err) {
                    if (err) throw err;
                });
                throw err;
            }
            next();
        }
    );
};

module.exports.moveWordAudioFile = function (wordID, file, next){
    movefile(
        path.join(__dirname, '..', file.path),
        path.join(__dirname, '..', 'public', settings.wordAudioDir, wordID % 10, file.name),
        function(err) {
            if (err) {// 删除临时文件夹文件
                fs.unlink(tmpPath, function (err) {
                    if (err) throw err;
                });
                throw err;
            }
            next();
        }
    );
};

module.exports.addWordPictureAndAudioUrl = function(wordRows){
    for (var i = 0; i < wordRows.length; i++) {
        var row = wordRows[i];
        var idDir = (row.ID % 10).toString();
        row.PictureUrl = path.join(settings.wordPicturesDir, idDir, row.PictureFileName);
        row.AudioUrl = row.AudioFileName ? path.join(settings.wordAudioDir, idDir, row.AudioFileName) : null;
    }
    return wordRows;
};