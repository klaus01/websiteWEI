var dbConn = require('../dbConn');

function likeFind(fieldName, value, offset, rows, next) {
    var sql = 'SELECT * FROM AppUsers WHERE ? LIKE ? LIMIT ?, ?';
    var parameters = [fieldName, '%' + value + '%', offset, rows];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
}

function equivalentFind(fieldName, value, offset, rows, next) {
    var sql = 'SELECT * FROM AppUsers WHERE ?=? LIMIT ?, ?';
    var parameters = [fieldName, value, offset, rows];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
}

function betweenFind(fieldName, bValue, eValue, offset, rows, next) {
    var sql = 'SELECT * FROM AppUsers WHERE ? BETWEEN ? AND ? LIMIT ?, ?';
    var parameters = [fieldName, bValue, eValue, offset, rows];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
}

module.exports.getCount = function (next) {
    var sql = 'SELECT COUNT(*) AS c FROM AppUsers';
    dbConn.query(sql, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.findAll = function (offset, rows, next) {
    var sql = 'SELECT * FROM AppUsers LIMIT ?, ?';
    var parameters = [offset, rows];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.findByNickname = function (value, offset, rows, next) {
    likeFind('Nickname', value, offset, rows, next);
};

module.exports.findByPhoneNumber = function (value, offset, rows, next) {
    likeFind('PhoneNumber', value, offset, rows, next);
};

module.exports.findByIsMan = function (value, offset, rows, next) {
    equivalentFind('IsMan', value, offset, rows, next);
};

module.exports.findByRegistrationStatus = function (value, offset, rows, next) {
    equivalentFind('RegistrationStatus', value, offset, rows, next);
};

module.exports.findByRegistrationTime = function (bTime, eTime, offset, rows, next) {
    betweenFind('RegistrationTime', bTime, eTime, offset, rows, next);
};

module.exports.findByLastLoginTime = function (bTime, eTime, offset, rows, next) {
    betweenFind('LastLoginTime', bTime, eTime, offset, rows, next);
};

module.exports.findByLonLatRange = function (minLon, maxLon, minLat, maxLat, offset, rows, next) {
    var sql = 'SELECT * FROM AppUsers WHERE (LastLoginLongitude BETWEEN ? AND ?) AND (LastLoginLatitude BETWEEN ? AND ?) LIMIT ?, ?';
    var parameters = [minLon, maxLon, minLat, maxLat, offset, rows];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};


