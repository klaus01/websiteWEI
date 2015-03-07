var path = require('path');
var settings = require('../settings');

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

module.exports.addAppUserIconUrl = function(appUserRows){
    for (var i = 0; i < appUserRows.length; i++) {
        var row = appUserRows[i];
        row.IconUrl = path.join(settings.partnerUserIconsDir, (row.AppUserID % 10).toString(), row.IconFileName);
    }
    return appUserRows;
};

module.exports.addPartnerUserIconUrl = function(partnerUserRows){
    for (var i = 0; i < partnerUserRows.length; i++) {
        var row = partnerUserRows[i];
        row.IconUrl = path.join(settings.partnerUserIconsDir, row.IconFileName);
    }
    return partnerUserRows;
};

module.exports.addActivityPictureUrl = function(activityRows){
    for (var i = 0; i < activityRows.length; i++) {
        var row = activityRows[i];
        row.PictureUrl = path.join(settings.activityPicturesDir, row.PartnerUserID.toString(), row.PictureFileName);
    }
    return activityRows;
};