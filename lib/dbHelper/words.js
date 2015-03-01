var dbConn = require('../dbConn');

function getCountByLike(fieldName, value, next) {
    var sql = 'SELECT COUNT(*) AS c FROM Words WHERE ' + fieldName + ' LIKE ?';
    var parameters = ['%' + value + '%'];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
}

function likeFind(fieldName, value, offset, resultCount, next) {
    var sql = '\
    SELECT *\
    FROM Words AS w, VAppUsers AS u\
    WHERE w.CreateUserID=u.AppUserID AND w.' + fieldName + ' LIKE ?\
    LIMIT ?, ?';
    var parameters = ['%' + value + '%', offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
}

module.exports.getCountBySourceUserID = function (value, next) {
    var sql = '\
    SELECT COUNT(wm.WordID) AS c\
    FROM Messages AS m, WordMessages AS wm\
    WHERE m.ID=wm.MessageID AND m.SourceUserID=?';
    var parameters = [value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.findBySourceUserID = function (value, offset, resultCount, next) {
    var sql = '\
    SELECT w.*, u.*\
    FROM Messages AS m, WordMessages AS wm, Words AS w, VAppUsers AS u\
    WHERE m.ID=wm.MessageID AND wm.WordID=w.ID AND m.ReceiveUserID=u.AppUserID AND m.SourceUserID=?\
    LIMIT ?, ?';
    var parameters = [value, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.getCountByReceiveUserID = function (value, next) {
    var sql = '\
    SELECT COUNT(wm.WordID) AS c\
    FROM Messages AS m, WordMessages AS wm\
    WHERE m.ID=wm.MessageID AND m.ReceiveUserID=?';
    var parameters = [value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.findByReceiveUserID = function (value, offset, resultCount, next) {
    var sql = '\
    SELECT w.*, u.*\
    FROM Messages AS m, WordMessages AS wm, Words AS w, VAppUsers AS u\
    WHERE m.ID=wm.MessageID AND wm.WordID=w.ID AND m.SourceUserID=u.AppUserID AND m.ReceiveUserID=?\
    LIMIT ?, ?';
    var parameters = [value, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.getCountByNumber = function (value, next) {
    getCountByLike('Number', value, next);
};

module.exports.findByNumber = function (value, offset, resultCount, next) {
    likeFind('Number', value, offset, resultCount, next);
};

module.exports.getCountByDescription = function (value, next) {
    getCountByLike('Description', value, next);
};

module.exports.findByDescription = function (value, offset, resultCount, next) {
    likeFind('Description', value, offset, resultCount, next);
};
