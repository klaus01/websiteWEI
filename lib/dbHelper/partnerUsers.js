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

module.exports.new = function (name, iconFileName, description, loginName, loginPassword, enabled, next) {
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
            var sql = 'INSERT INTO PartnerUsers SET PartnerUserID=?, Name=?, IconFileName=?, Description=?, LoginName=?, LoginPassword=?, Enabled=?, CreateTime=NOW()';
            var parameters = [result.insertId, name, iconFileName, description, loginName, loginPassword, enabled];
            connection.query(sql, parameters, function(err, rows) {
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

module.exports.update = function (id, name, iconFileName, description, loginName, loginPassword, enabled, next) {
    var sql = 'UPDATE PartnerUsers SET ? WHERE PartnerUserID=?';
    var setObj = {
        Name: name,
        Description: description,
        LoginName: loginName,
        Enabled: enabled,
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