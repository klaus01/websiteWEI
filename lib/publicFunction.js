var settings = require('../settings');

module.exports.addPartnerUserIconUrl = function(partnerUserRows){
    for (var i = 0; i < partnerUserRows.length; i++) {
        var row = partnerUserRows[i];
        row.IconFileUrl = settings.partnerUserIconsDir + row.IconFileName;
    }
    return partnerUserRows;
};