var dbConn = require('../dbConn');

module.exports.getCount = function (next) {
    var sql = 'SELECT COUNT(*) AS c FROM VSMSLogs';
    dbConn.query(sql, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.findAll = function (offset, resultCount, next) {
    var sql = 'SELECT * FROM VSMSLogs ORDER BY ID DESC LIMIT ?, ?';
    var parameters = [offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};
