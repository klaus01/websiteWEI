var dbConn = require('../dbConn');
var publicFunction = require('../publicFunction');

function equivalentFind(fieldName, value, next) {
    var sql = 'SELECT * FROM VPartnerUsers WHERE ??=?';
    var parameters = [fieldName, value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addPartnerUserIconUrl(rows);
        next && next(rows);
    });
}

module.exports.findAll = function (next) {
    var sql = 'SELECT * FROM VPartnerUsers';
    dbConn.query(sql, function(err, rows) {
        if (err) throw err;
        rows = publicFunction.addPartnerUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.findEnabled = function (next) {
    equivalentFind('Enabled', 1, next);
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
        rows = publicFunction.addPartnerUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.findBySubscriberID = function (value, next) {
    var sql = 'SELECT p.* FROM VPartnerUsers AS p, Friends AS f WHERE f.FriendUserID=p.PartnerUserID AND f.AppUserID=?';
    var parameters = [value];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        rows = publicFunction.addPartnerUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.findMessagesBySubscriberID = function (value, next) {
    dbConn.query({
        sql: '\
 SELECT pu.*, m.*\
 FROM PartnerUsers AS pu\
     INNER JOIN Friends AS f ON f.FriendUserID=pu.PartnerUserID\
     LEFT JOIN (SELECT m.SourceUserID,\
             MAX(m.CreateTime) AS LastTime,\
             COUNT(m.IsRead) - SUM(m.IsRead) AS UnreadCount,\
             SUM(NOT ISNULL(gm.MessageID) AND ISNULL(gm.AwardTime)) AS NoAwardCount\
         FROM Messages AS m LEFT JOIN ActivityGiftMessages AS gm ON m.ID=gm.MessageID\
         WHERE m.ReceiveUserID=?\
         GROUP BY m.SourceUserID\
     ) AS m ON f.FriendUserID=m.SourceUserID\
 WHERE f.AppUserID=?\
 ORDER BY m.LastTime',
        values: [value, value],
        nestTables: true
    }, function(err, rows) {
        if (err) throw err;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var messageOverview = null;
            if (row.m.LastTime)
                messageOverview = {
                    LastTime: row.m.LastTime,
                    UnreadCount: row.m.UnreadCount,
                    NoAwardCount: row.m.NoAwardCount
                };
            rows[i] = {
                PartnerUser: publicFunction.addPartnerUserIconUrl(row.pu),
                MessageOverview: messageOverview
            };
        }
        next && next(rows);
    });
}

module.exports.new = function (name, iconFileName, description, loginName, loginPassword, enabled, appUserID, next) {
    dbConn.getConnection(function(err, connection){
        if (err) throw err;
        connection.beginTransaction(function(err) {
            if (err) {
                connection.release();
                throw err;
            }
            var sql = 'INSERT INTO Users SET Type=0';
            connection.query(sql, function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        connection.release();
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
                            connection.release();
                            throw err;
                        });
                    }
                    connection.commit(function(err) {
                        if (err) {
                            connection.rollback(function() {
                                connection.release();
                                throw err;
                            });
                        }
                        connection.release();
                        next && next(result.insertId);
                    });
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
        next && next(rows);
    });
};

module.exports.updatePassword = function (partnerUserID, loginPassword, next) {
    var sql = 'UPDATE PartnerUsers SET LoginPassword=? WHERE PartnerUserID=?';
    var parameters = [loginPassword, partnerUserID];
    dbConn.query(sql, parameters, function(err, result) {
        if (err) throw err;
        next && next(result);
    });
};

module.exports.updateLoginInfo = function (id, ip) {
    var sql = 'UPDATE PartnerUsers SET LastLoginTime=NOW(), LastLoginIP=? WHERE PartnerUserID=?';
    var parameters = [ip, id];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
    });
};
