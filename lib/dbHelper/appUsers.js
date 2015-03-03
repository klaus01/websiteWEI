var dbConn = require('../dbConn');

function getCountByLike(fieldName, value, next) {
    var sql = 'SELECT COUNT(*) AS c FROM AppUsers WHERE ' + fieldName + ' LIKE ?';
    var parameters = ['%' + value + '%'];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
}

function getCountByEquivalent(fieldName, value, next) {
    var sql = 'SELECT COUNT(*) AS c FROM AppUsers WHERE ??=?';
    var parameters = [fieldName, value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
}

function getCountByBetween(fieldName, bValue, eValue, next) {
    var sql = 'SELECT COUNT(*) AS c FROM AppUsers WHERE ?? BETWEEN ? AND ?';
    var parameters = [fieldName, bValue, eValue];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
}

function likeFind(fieldName, value, offset, resultCount, next) {
    var sql = 'SELECT * FROM VAppUsers WHERE ' + fieldName + ' LIKE ? LIMIT ?, ?';
    var parameters = ['%' + value + '%', offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
}

function equivalentFind(fieldName, value, offset, resultCount, next) {
    if (!next && typeof(offset) === 'function') {
        next = offset;
        offset = null;
    }

    var sql = 'SELECT * FROM VAppUsers WHERE ??=?';
    var parameters = [fieldName, value];
    if (offset) {
        sql += ' LIMIT ?, ?';
        parameters.push([offset, resultCount]);
    }

    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
}

function betweenFind(fieldName, bValue, eValue, offset, resultCount, next) {
    var sql = 'SELECT * FROM VAppUsers WHERE ?? BETWEEN ? AND ? LIMIT ?, ?';
    var parameters = [fieldName, bValue, eValue, offset, resultCount];
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

module.exports.getCountByNickname = function (value, next) {
    getCountByLike('Nickname', value, next);
};

module.exports.getCountByPhoneNumber = function (value, next) {
    getCountByLike('PhoneNumber', value, next);
};

module.exports.getCountByIsMan = function (value, next) {
    getCountByEquivalent('IsMan', value, next);
};

module.exports.getCountByRegistrationStatus = function (value, next) {
    getCountByEquivalent('RegistrationStatus', value, next);
};

module.exports.getCountByRegistrationTime = function (bTime, eTime, next) {
    getCountByBetween('RegistrationTime', bTime, eTime, next);
};

module.exports.getCountByLastLoginTime = function (bTime, eTime, next) {
    getCountByBetween('LastLoginTime', bTime, eTime, next);
};

module.exports.getCountByLonLatRange = function (minLon, maxLon, minLat, maxLat, next) {
    var sql = 'SELECT COUNT(*) AS c FROM AppUsers WHERE (LastLoginLongitude BETWEEN ? AND ?) AND (LastLoginLatitude BETWEEN ? AND ?)';
    var parameters = [minLon, maxLon, minLat, maxLat];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.getFriendsCountByAppUserID = function (appUserID, next) {
    var sql = 'SELECT COUNT(*) AS c FROM Friends AS f, VAppUsers AS u WHERE f.FriendUserID=u.AppUserID AND f.AppUserID=?';
    var parameters = [appUserID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.getFriendsCountByPartnerUserID = function (partnerUserID, next) {
    var sql = 'SELECT COUNT(*) AS c FROM Friends AS f, VAppUsers AS u WHERE f.AppUserID=u.AppUserID AND f.FriendUserID=?';
    var parameters = [partnerUserID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows[0].c);
    });
};

module.exports.findAll = function (offset, resultCount, next) {
    var sql = 'SELECT * FROM VAppUsers LIMIT ?, ?';
    var parameters = [offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.findByID = function (id, next) {
    equivalentFind('AppUserID', id, next);
};

module.exports.findByNickname = function (value, offset, resultCount, next) {
    likeFind('Nickname', value, offset, resultCount, next);
};

module.exports.findByPhoneNumber = function (value, offset, resultCount, next) {
    if (!next && (typeof(offset) === 'function'))
        equivalentFind('PhoneNumber', value, offset);
    else
        likeFind('PhoneNumber', value, offset, resultCount, next);
};

module.exports.findByIsMan = function (value, offset, resultCount, next) {
    equivalentFind('IsMan', value, offset, resultCount, next);
};

module.exports.findByRegistrationStatus = function (value, offset, resultCount, next) {
    equivalentFind('RegistrationStatus', value, offset, resultCount, next);
};

module.exports.findByRegistrationTime = function (bTime, eTime, offset, resultCount, next) {
    betweenFind('RegistrationTime', bTime, eTime, offset, resultCount, next);
};

module.exports.findByLastLoginTime = function (bTime, eTime, offset, resultCount, next) {
    betweenFind('LastLoginTime', bTime, eTime, offset, resultCount, next);
};

module.exports.findByLonLatRange = function (minLon, maxLon, minLat, maxLat, offset, resultCount, next) {
    var sql = 'SELECT * FROM VAppUsers WHERE (LastLoginLongitude BETWEEN ? AND ?) AND (LastLoginLatitude BETWEEN ? AND ?) LIMIT ?, ?';
    var parameters = [minLon, maxLon, minLat, maxLat, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.findFriendsByAppUserID = function (appUserID, offset, resultCount, next) {
    var sql = 'SELECT u.* FROM Friends AS f, VAppUsers AS u WHERE f.FriendUserID=u.AppUserID AND f.AppUserID=? LIMIT ?, ?';
    var parameters = [appUserID, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.findFriendsByPartnerUserID = function (partnerUserID, offset, resultCount, next) {
    var sql = 'SELECT u.* FROM Friends AS f, VAppUsers AS u WHERE f.AppUserID=u.AppUserID AND f.FriendUserID=? LIMIT ?, ?';
    var parameters = [partnerUserID, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
};
