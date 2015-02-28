var dbConn = require('../dbConn');

module.exports.getCountBySourceUserID = function (sourceUserID, next) {
    var sql = '\
    SELECT COUNT(wm.WordID) AS c\
    FROM Messages AS m, WordMessages AS wm\
    WHERE m.ID=wm.MessageID AND m.SourceUserID=?';
    var parameters = [sourceUserID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.findBySourceUserID = function (sourceUserID, offset, resultCount, next) {
    var sql = '\
    SELECT w.*, u.*\
    FROM Messages AS m, WordMessages AS wm, Words AS w, VAppUsers AS u\
    WHERE m.ID=wm.MessageID AND wm.WordID=w.ID AND m.ReceiveUserID=u.AppUserID AND m.SourceUserID=?\
    LIMIT ?, ?';
    var parameters = [sourceUserID, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.getCountByReceiveUserID = function (receiveUserID, next) {
    var sql = '\
    SELECT COUNT(wm.WordID) AS c\
    FROM Messages AS m, WordMessages AS wm\
    WHERE m.ID=wm.MessageID AND m.ReceiveUserID=?';
    var parameters = [receiveUserID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.findByReceiveUserID = function (receiveUserID, offset, resultCount, next) {
    var sql = '\
    SELECT w.*, u.*\
    FROM Messages AS m, WordMessages AS wm, Words AS w, VAppUsers AS u\
    WHERE m.ID=wm.MessageID AND wm.WordID=w.ID AND m.SourceUserID=u.AppUserID AND m.ReceiveUserID=?\
    LIMIT ?, ?';
    var parameters = [receiveUserID, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};
