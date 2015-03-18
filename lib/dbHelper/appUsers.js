var dbConn = require('../dbConn');
var publicFunction = require('../publicFunction');

function getCountByLike(fieldName, value, next) {
    var sql = 'SELECT COUNT(*) AS c FROM AppUsers WHERE ' + fieldName + ' LIKE ?';
    var parameters = ['%' + value + '%'];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
}

function getCountByPartnerLike(partnerUserID, fieldName, value, next) {
    var sql = 'SELECT COUNT(u.AppUserID) AS c FROM AppUsers AS u, Friends AS f WHERE u.AppUserID=f.AppUserID AND f.FriendUserID=? AND u.' + fieldName + ' LIKE ?';
    var parameters = [partnerUserID, '%' + value + '%'];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
}

function getCountByEquivalent(fieldName, value, next) {
    var sql = 'SELECT COUNT(*) AS c FROM AppUsers WHERE ??=?';
    var parameters = [fieldName, value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
}

function getCountByPartnerEquivalent(partnerUserID, fieldName, value, next) {
    var sql = 'SELECT COUNT(u.AppUserID) AS c FROM AppUsers AS u, Friends AS f WHERE u.AppUserID=f.AppUserID AND f.FriendUserID=? AND u.??=?';
    var parameters = [partnerUserID, fieldName, value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
}

function getCountByBetween(fieldName, bValue, eValue, next) {
    var sql = 'SELECT COUNT(*) AS c FROM AppUsers WHERE ?? BETWEEN ? AND ?';
    var parameters = [fieldName, bValue, eValue];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
}

function getCountByPartnerBetween(partnerUserID, fieldName, bValue, eValue, next) {
    var sql = 'SELECT COUNT(u.AppUserID) AS c FROM AppUsers AS u, Friends AS f WHERE u.AppUserID=f.AppUserID AND f.FriendUserID=? AND (u.?? BETWEEN ? AND ?)';
    var parameters = [partnerUserID, fieldName, bValue, eValue];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
}

function findByLike(fieldName, value, offset, resultCount, next) {
    var sql = 'SELECT * FROM VAppUsers WHERE ' + fieldName + ' LIKE ? LIMIT ?, ?';
    var parameters = ['%' + value + '%', offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
}

function findByPartnerLike(partnerUserID, fieldName, value, offset, resultCount, next) {
    var sql = 'SELECT u.* FROM VAppUsers AS u, Friends AS f WHERE u.AppUserID=f.AppUserID AND f.FriendUserID=? AND u.' + fieldName + ' LIKE ? LIMIT ?, ?';
    var parameters = [partnerUserID, '%' + value + '%', offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
}

function findByEquivalent(fieldName, value, offset, resultCount, next) {
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
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
}

function findByPartnerEquivalent(partnerUserID, fieldName, value, offset, resultCount, next) {
    if (!next && typeof(offset) === 'function') {
        next = offset;
        offset = null;
    }

    var sql = 'SELECT u.* FROM VAppUsers AS u, Friends AS f WHERE u.AppUserID=f.AppUserID AND f.FriendUserID=? AND u.??=?';
    var parameters = [partnerUserID, fieldName, value];
    if (offset) {
        sql += ' LIMIT ?, ?';
        parameters.push([offset, resultCount]);
    }

    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
}

function findByBetween(fieldName, bValue, eValue, offset, resultCount, next) {
    var sql = 'SELECT * FROM VAppUsers WHERE ?? BETWEEN ? AND ? LIMIT ?, ?';
    var parameters = [fieldName, bValue, eValue, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
}

function findByPartnerBetween(partnerUserID, fieldName, bValue, eValue, offset, resultCount, next) {
    var sql = 'SELECT u.* FROM VAppUsers AS u, Friends AS f WHERE u.AppUserID=f.AppUserID AND f.FriendUserID=? AND (u.?? BETWEEN ? AND ?) LIMIT ?, ?';
    var parameters = [partnerUserID, fieldName, bValue, eValue, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
}

module.exports.getCount = function (next) {
    var sql = 'SELECT COUNT(*) AS c FROM AppUsers';
    dbConn.query(sql, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.getCountByNickname = function (value, partnerUserID, next) {
    if (partnerUserID)
        getCountByPartnerLike(partnerUserID, 'Nickname', value, next);
    else
        getCountByLike('Nickname', value, next);
};

module.exports.getCountByPhoneNumber = function (value, partnerUserID, next) {
    if (partnerUserID)
        getCountByPartnerLike(partnerUserID, 'PhoneNumber', value, next);
    else
        getCountByLike('PhoneNumber', value, next);
};

module.exports.getCountByIsMan = function (value, partnerUserID, next) {
    if (partnerUserID)
        getCountByPartnerEquivalent(partnerUserID, 'IsMan', value, next);
    else
        getCountByEquivalent('IsMan', value, next);
};

module.exports.getCountByRegistrationStatus = function (value, partnerUserID, next) {
    if (partnerUserID)
        getCountByPartnerEquivalent(partnerUserID, 'RegistrationStatus', value, next);
    else
        getCountByEquivalent('RegistrationStatus', value, next);
};

module.exports.getCountByRegistrationTime = function (bTime, eTime, partnerUserID, next) {
    if (partnerUserID)
        getCountByPartnerBetween(partnerUserID, 'RegistrationTime', bTime, eTime, next);
    else
        getCountByBetween('RegistrationTime', bTime, eTime, next);
};

module.exports.getCountByLastLoginTime = function (bTime, eTime, partnerUserID, next) {
    if (partnerUserID)
        getCountByPartnerBetween(partnerUserID, 'LastLoginTime', bTime, eTime, next);
    else
        getCountByBetween('LastLoginTime', bTime, eTime, next);
};

module.exports.getCountByLonLatRange = function (minLon, maxLon, minLat, maxLat, partnerUserID, next) {
    var sql = '';
    var parameters = [];
    if (partnerUserID) {
        sql = 'SELECT COUNT(*) AS c FROM AppUsers AS u, Friends AS f WHERE u.AppUserID=f.AppUserID AND f.FriendUserID=?' +
        ' AND (LastLoginLongitude BETWEEN ? AND ?) AND (LastLoginLatitude BETWEEN ? AND ?)';
        parameters = [partnerUserID, minLon, maxLon, minLat, maxLat];
    }
    else {
        sql = 'SELECT COUNT(*) AS c FROM AppUsers WHERE (LastLoginLongitude BETWEEN ? AND ?) AND (LastLoginLatitude BETWEEN ? AND ?)';
        parameters = [minLon, maxLon, minLat, maxLat];
    }

    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.getCountByActivityID = function (activityID, next) {
    var sql = 'SELECT COUNT(m.ReceiveUserID) AS c ' +
        'FROM ActivityMessages AS a, Messages AS m ' +
        'WHERE m.ID=a.MessageID AND a.PartnerActivityID=?';
    var parameters = [activityID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.getGiftUsersCountByActivityID = function (activityID, next) {
    var sql = 'SELECT COUNT(m.ReceiveUserID) AS c ' +
        'FROM ActivityGiftMessages AS a, Messages AS m ' +
        'WHERE m.ID=a.MessageID AND a.PartnerActivityID=?';
    var parameters = [activityID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.getAwardUsersCountByActivityID = function (activityID, next) {
    var sql = 'SELECT COUNT(m.ReceiveUserID) AS c ' +
        'FROM ActivityGiftMessages AS a, Messages AS m ' +
        'WHERE m.ID=a.MessageID AND NOT(AwardTime IS NULL) AND a.PartnerActivityID=?';
    var parameters = [activityID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.getFriendsCountByAppUserID = function (appUserID, next) {
    var sql = 'SELECT COUNT(*) AS c FROM Friends AS f, VAppUsers AS u WHERE f.FriendUserID=u.AppUserID AND f.AppUserID=?';
    var parameters = [appUserID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.getFriendsCountByPartnerUserID = function (partnerUserID, next) {
    var sql = 'SELECT COUNT(*) AS c FROM Friends AS f, VAppUsers AS u WHERE f.AppUserID=u.AppUserID AND f.FriendUserID=?';
    var parameters = [partnerUserID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.findAll = function (offset, resultCount, next) {
    var sql = 'SELECT * FROM VAppUsers LIMIT ?, ?';
    var parameters = [offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.findByID = function (id, next) {
    findByEquivalent('AppUserID', id, next);
};

module.exports.findByNickname = function (value, offset, resultCount, partnerUserID, next) {
    if (partnerUserID)
        findByPartnerLike(partnerUserID, 'Nickname', value, offset, resultCount, next);
    else
        findByLike('Nickname', value, offset, resultCount, next);
};

module.exports.findByPhoneNumber = function (value, offset, resultCount, partnerUserID, next) {
    if (!next && (typeof(offset) === 'function'))
        findByEquivalent('PhoneNumber', value, offset);
    else if (partnerUserID)
        findByPartnerLike(partnerUserID, 'PhoneNumber', value, offset, resultCount, next);
    else
        findByLike('PhoneNumber', value, offset, resultCount, next);
};

module.exports.findByIsMan = function (value, offset, resultCount, partnerUserID, next) {
    if (partnerUserID)
        findByPartnerEquivalent(partnerUserID, 'IsMan', value, offset, resultCount, next);
    else
        findByEquivalent('IsMan', value, offset, resultCount, next);
};

module.exports.findByRegistrationStatus = function (value, offset, resultCount, partnerUserID, next) {
    if (partnerUserID)
        findByPartnerEquivalent(partnerUserID, 'RegistrationStatus', value, offset, resultCount, next);
    else
        findByEquivalent('RegistrationStatus', value, offset, resultCount, next);
};

module.exports.findByRegistrationTime = function (bTime, eTime, offset, resultCount, partnerUserID, next) {
    if (partnerUserID)
        findByPartnerBetween(partnerUserID, 'RegistrationTime', value, offset, resultCount, next);
    else
        findByBetween('RegistrationTime', bTime, eTime, offset, resultCount, next);
};

module.exports.findByLastLoginTime = function (bTime, eTime, offset, resultCount, partnerUserID, next) {
    if (partnerUserID)
        findByPartnerBetween(partnerUserID, 'LastLoginTime', value, offset, resultCount, next);
    else
        findByBetween('LastLoginTime', bTime, eTime, offset, resultCount, next);
};

module.exports.findByLonLatRange = function (minLon, maxLon, minLat, maxLat, offset, resultCount, partnerUserID, next) {
    var sql = '';
    var parameters = [];
    if (partnerUserID) {
        sql = 'SELECT * FROM VAppUsers AS u, Friends AS f WHERE u.AppUserID=f.AppUserID AND f.FriendUserID=?' +
        ' AND (LastLoginLongitude BETWEEN ? AND ?) AND (LastLoginLatitude BETWEEN ? AND ?) LIMIT ?, ?';
        parameters = [partnerUserID, minLon, maxLon, minLat, maxLat, offset, resultCount];
    }
    else {
        sql = 'SELECT * FROM VAppUsers WHERE (LastLoginLongitude BETWEEN ? AND ?) AND (LastLoginLatitude BETWEEN ? AND ?) LIMIT ?, ?';
        parameters = [minLon, maxLon, minLat, maxLat, offset, resultCount];
    }
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.findByActivityID = function (activityID, offset, resultCount, next) {
    var sql = 'SELECT u.* ' +
        'FROM VAppUsers AS u, ActivityMessages AS a, Messages AS m ' +
        'WHERE u.AppUserID=m.ReceiveUserID AND m.ID=a.MessageID AND a.PartnerActivityID=? ' +
        'LIMIT ?, ?';
    var parameters = [activityID, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.findGiftUsersByActivityID = function (activityID, offset, resultCount, next) {
    var sql = 'SELECT u.* ' +
        'FROM VAppUsers AS u, ActivityGiftMessages AS a, Messages AS m ' +
        'WHERE u.AppUserID=m.ReceiveUserID AND m.ID=a.MessageID AND a.PartnerActivityID=? ' +
        'LIMIT ?, ?';
    var parameters = [activityID, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.findAwardUsersByActivityID = function (activityID, offset, resultCount, next) {
    var sql = 'SELECT u.* ' +
        'FROM VAppUsers AS u, ActivityGiftMessages AS a, Messages AS m ' +
        'WHERE u.AppUserID=m.ReceiveUserID AND m.ID=a.MessageID AND NOT(a.AwardTime IS NULL) AND a.PartnerActivityID=? ' +
        'LIMIT ?, ?';
    var parameters = [activityID, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.findFriendsByAppUserID = function (appUserID, offset, resultCount, next) {
    if (!next && typeof(offset) === 'function') {
        next = offset;
        offset = null;
    }
    var sql = 'SELECT u.* FROM Friends AS f, VAppUsers AS u WHERE f.FriendUserID=u.AppUserID AND f.AppUserID=?';
    var parameters = [appUserID];
    if (offset) {
        sql += ' LIMIT ?, ?';
        parameters.push([offset, resultCount]);
    }
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
};

/**
 * APP客户端获取的朋友消息列表
 * @param appUserID
 * @param next
 */
module.exports.findAPPFriendsByAppUserID = function (appUserID, next) {
    dbConn.query({
        sql: '\
SELECT au.*, pu.*, m.*\
FROM Friends AS f\
    LEFT JOIN AppUsers AS au ON f.FriendUserID=au.AppUserID\
    LEFT JOIN PartnerUsers AS pu ON f.FriendUserID=pu.PartnerUserID\
    LEFT JOIN (SELECT SourceUserID, MAX(CreateTime) AS LastTime, COUNT(IsRead) - SUM(IsRead) AS UneadCount\
        FROM Messages WHERE ReceiveUserID=? GROUP BY SourceUserID) AS m ON f.FriendUserID=m.SourceUserID\
WHERE f.AppUserID=?\
ORDER BY m.LastTime DESC',
        values: [appUserID, appUserID],
        nestTables: true
    }, function (err, rows) {
        if (err) throw err;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];

            row.SourceUserID = row.m.SourceUserID;
            row.LastTime = row.m.LastTime;
            row.UneadCount = row.m.UneadCount;
            delete row.m;

            if (row.au.AppUserID)
                row.AppUser = publicFunction.addAppUserIconUrl(row.au);
            delete row.au;

            if (row.pu.PartnerUserID)
                row.PartnerUser = publicFunction.addPartnerUserIconUrl(row.pu);
            delete row.pu;
        }
        next && next(rows);
    });
};

/**
 * 查询公众号的订阅用户列表
 * @param partnerUserID
 * @param offset
 * @param resultCount
 * @param next
 */
module.exports.findFriendsByPartnerUserID = function (partnerUserID, offset, resultCount, next) {
    if (!next && typeof(offset) === 'function') {
        next = offset;
        offset = null;
    }
    var sql = 'SELECT u.* FROM Friends AS f, VAppUsers AS u WHERE f.AppUserID=u.AppUserID AND f.FriendUserID=?';
    var parameters = [partnerUserID];
    if (offset) {
        sql += ' LIMIT ?, ?';
        parameters.push([offset, resultCount]);
    }
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.findByInviteesPhoneNumber = function (phoneNumber, next) {
    var sql = 'SELECT u.* FROM VAppUsers AS u, InviteFriends AS i WHERE u.AppUserID=i.AppUserID AND i.FriendPhoneNumber=?';
    var parameters = [phoneNumber];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows);
    });
};

module.exports.new = function (setKeyValues, next) {
    dbConn.getConnection(function(err, connection){
        if (err) throw err;
        connection.beginTransaction(function(err) {
            if (err) {
                connection.release();
                throw err;
            }
            var sql = 'INSERT INTO Users SET Type=1';
            connection.query(sql, function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        connection.release();
                        throw err;
                    });
                }
                var sql = 'INSERT INTO AppUsers SET ?, AppUserID=?, RegistrationTime=NOW()';
                var parameters = [setKeyValues, result.insertId];
                connection.query(sql, parameters, function(err, rows) {
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

module.exports.update = function (setKeyValues, whereKeyValues, next) {
    var sql = 'UPDATE AppUsers SET ? WHERE ?';
    var parameters = [setKeyValues, whereKeyValues];
    dbConn.query(sql, parameters, function(err, result) {
        if (err) throw err;
        next && next(result);
    });
};

/**
 * 查询appUserID与friendUserID是否已经是朋友关系
 * @param appUserID
 * @param friendUserID
 * @param next
 * @return next(isFriend)
 */
module.exports.isFriend = function (appUserID, friendUserID, next) {
    var sql = 'SELECT * FROM Friends WHERE AppUserID=? AND FriendUserID=?';
    var parameters = [appUserID, friendUserID];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next && next(rows.length > 0);
    });
};

module.exports.addFriend = function (appUserID, friendUserID, next) {
    dbConn.getConnection(function(err, connection){
        if (err) throw err;
        connection.beginTransaction(function(err) {
            if (err) {
                connection.release();
                throw err;
            }
            var sql = 'INSERT INTO Friends SET AppUserID=?, FriendUserID=?, IsBlack=0, CreateTime=NOW()';
            var parameters = [appUserID, friendUserID];
            connection.query(sql, parameters, function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        connection.release();
                        throw err;
                    });
                }
                var parameters = [friendUserID, appUserID];
                connection.query(sql, parameters, function(err, rows) {
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
                        next && next(result);
                    });
                });
            });
        });
    });
};

module.exports.addPartner = function (appUserID, partnerUserID, next) {
    var sql = 'INSERT INTO Friends SET AppUserID=?, FriendUserID=?, IsBlack=0, CreateTime=NOW()';
    var parameters = [appUserID, partnerUserID];
    dbConn.query(sql, parameters, function(err, result) {
        if (err) throw err;
        next && next(result);
    });
};

module.exports.getFriendIsBlack = function (appUserID, friendUserID, next) {
    var sql = 'SELECT * FROM Friends WHERE AppUserID=? AND FriendUserID=? AND IsBlack=1';
    var parameters = [appUserID, friendUserID];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next && next(rows.length > 0);
    });
};

module.exports.setFriendIsBlack = function (appUserID, friendUserID, isBlack, next) {
    var sql = 'UPDATE Friends SET IsBlack=? WHERE AppUserID=? AND FriendUserID=?';
    var parameters = [isBlack, appUserID, friendUserID];
    dbConn.query(sql, parameters, function(err, result) {
        if (err) throw err;
        next && next(result);
    });
};