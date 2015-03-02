var fs = require('fs');
var path = require('path');
var settings = require('../settings');

fs.mkdirsSync = function(dirPath) {
    var parentDir = path.dirname(dirPath);
    if (!fs.existsSync(parentDir))
        fs.mkdirParentSync(parentDir);
    fs.mkdirSync(dirPath);
};

module.exports.movePartnerUserIconFile = function (file, next){
    // 获得文件的临时路径
    var tmpPath = path.join(__dirname, '..', file.path);
    // 指定文件上传后的目录
    var targetPath = path.join(__dirname, '..', 'public', settings.partnerUserIconsDir, file.name);
    var targetDir = path.dirname(targetPath);
    // 如果目标目录不存在则创建
    if (!fs.existsSync(targetDir))
        fs.mkdirsSync(targetDir);
    // 移动文件
    fs.rename(tmpPath, targetPath, function(err) {
        if (err) {
            // 删除临时文件夹文件
            fs.unlink(tmpPath, function(err) {
                if (err) throw err;
            });
            throw err;
        }
        next();
    });
};