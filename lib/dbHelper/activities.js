var dbConn = require('../dbConn');

module.exports.getCountByPartnerUserID = function (value, next) {
    var sql = 'SELECT COUNT(*) AS c FROM VPartnerActivities WHERE PartnerUserID=?';
    var parameters = [value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.findByPartnerUserID = function (value, offset, resultCount, next) {
    var sql = 'SELECT * FROM VPartnerActivities WHERE PartnerUserID=? ORDER BY ID DESC LIMIT ?, ?';
    var parameters = [value, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};
