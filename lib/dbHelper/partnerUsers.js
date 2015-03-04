var dbConn = require('../dbConn');

function equivalentFind(fieldName, value, next) {
    var sql = 'SELECT * FROM VPartnerUsers WHERE ??=?';
    var parameters = [fieldName, value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next(rows);
    });
}

module.exports.findAll = function (next) {
    var sql = 'SELECT * FROM VPartnerUsers';
    dbConn.query(sql, function(err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.findByID = function (id, next) {
    equivalentFind('PartnerUserID', id, next);
};

module.exports.findByLoginName = function (loginName, excludeID, next) {
    if (!next && typeof excludeID === 'function') {
        next = excludeID;
        excludeID = null;
    }

    var sql = 'SELECT * FROM VPartnerUsers WHERE LoginName=?';
    var parameters = [loginName];
    if (excludeID) {
        sql += ' AND PartnerUserID<>?';
        parameters.push(excludeID);
    }

    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.findBySubscriberID = function (value, next) {
    var sql = 'SELECT p.* FROM VPartnerUsers AS p, Friends AS f WHERE f.FriendUserID=p.PartnerUserID AND f.AppUserID=?';
    var parameters = [value];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.new = function (name, iconFileName, description, loginName, loginPassword, enabled, appUserID, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) throw err;
        var sql = 'INSERT INTO Users SET Type=0';
        connection.query(sql, function(err, result) {
            if (err) {
                connection.rollback(function() {
                    connection.end();
                    throw err;
                });
            }
            var sql = 'INSERT INTO PartnerUsers SET ?, CreateTime=NOW()';
            var setObj = {
                PartnerUserID: result.insertId,
                Name: name,
                IconFileName: iconFileName,
                Description: description,
                LoginName: loginName,
                LoginPassword: loginPassword,
                Enabled: enabled,
                AppUserID: appUserID
            };
            connection.query(sql, setObj, function(err, rows) {
                if (err) {
                    connection.rollback(function() {
                        connection.end();
                        throw err;
                    });
                }
                connection.commit(function(err) {
                    if (err) {
                        connection.rollback(function() {
                            connection.end();
                            throw err;
                        });
                    }
                    connection.end();
                    next(result.insertId);
                });
            });
        });
    });
};

module.exports.update = function (id, name, iconFileName, description, loginName, loginPassword, enabled, appUserID, next) {
    var sql = 'UPDATE PartnerUsers SET ? WHERE PartnerUserID=?';
    var setObj = {
        Name: name,
        Description: description,
        LoginName: loginName,
        Enabled: enabled,
        AppUserID: appUserID
    };
    if (iconFileName)
        setObj.IconFileName = iconFileName;
    if (loginPassword)
        setObj.LoginPassword = loginPassword;
    var parameters = [setObj, id];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next(rows);
    });
};

module.exports.updateLoginInfo = function (id, ip) {
    var sql = 'UPDATE PartnerUsers SET LastLoginTime=NOW(), LastLoginIP=? WHERE PartnerUserID=?';
    var parameters = [ip, id];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
    });
};
