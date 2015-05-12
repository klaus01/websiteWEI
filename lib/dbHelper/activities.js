var dbConn = require('../dbConn');
var publicFunction = require('../publicFunction');

module.exports.findByID = function (id, next) {
    var sql = 'SELECT * ' +
        'FROM VPartnerActivities AS a LEFT JOIN ActivitiesExt AS b ON a.ID=b.PartnerActivityID ' +
        'WHERE a.ID=?';
    var parameters = [id];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addActivityPictureUrl(rows);
        next && next(rows);
    });
};

module.exports.getCountByPartnerUserID = function (value, next) {
    var sql = 'SELECT COUNT(*) AS c FROM VPartnerActivities WHERE PartnerUserID=?';
    var parameters = [value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.findByPartnerUserID = function (value, offset, resultCount, next) {
    var sql = 'SELECT * FROM VPartnerActivities WHERE PartnerUserID=? ORDER BY ID DESC LIMIT ?, ?';
    var parameters = [value, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addActivityPictureUrl(rows);
        next && next(rows);
    });
};

/**
 * 查找appUserID可参加且未过期的活动
 * @param value
 * @param next
 */
module.exports.findActivitiesExtUnexpiredByAppUserID = function (value, next) {
    var sql = '\
    SELECT ext.*\
    FROM PartnerActivities AS a\
        INNER JOIN ActivitiesExt AS ext ON a.ID=ext.PartnerActivityID\
        INNER JOIN ActivityMessages AS am ON a.ID=am.PartnerActivityID\
    WHERE NOW() BETWEEN ext.BeginTime AND ext.EndTime AND am.AppUserID=?';
    var parameters = [value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows);
    });
};

/**
 * appUserID在activityID活动中已经是否已中奖
 * @param appUserID
 * @param activityID
 * @param next(bool: true已中奖)
 */
module.exports.hasGift = function (appUserID, activityID, next) {
    var sql = '\
    SELECT *\
    FROM ActivityGiftMessages\
    WHERE PartnerActivityID=? AND AppUserID=?';
    var parameters = [activityID, appUserID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows.length > 0);
    });
};

module.exports.new = function (partnerUserID, mode, pictureFileName, content, url, beginTime, endTime, expireAwardTime, longitude, latitude, distanceMeters, next) {
    dbConn.getConnection(function(err, connection){
        if (err) throw err;
        connection.beginTransaction(function(err) {
            if (err) {
                connection.release();
                throw err;
            }
            var sql = 'INSERT INTO PartnerActivities SET ?, CreateTime=NOW()';
            var parameters = {
                PartnerUserID: partnerUserID,
                Mode: mode,
                PictureFileName: pictureFileName,
                Content: content,
                URL: url
            };
            connection.query(sql, parameters, function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        connection.release();
                        throw err;
                    });
                }

                function commitTrans(){
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
                }

                if (mode == 0) {
                    commitTrans();
                    return;
                }

                // 非广播消息，需要再保存更多活动信息
                var sql = 'INSERT INTO ActivitiesExt SET ?';
                var parameters = {
                    PartnerActivityID: result.insertId,
                    BeginTime: beginTime,
                    EndTime: endTime,
                    ExpireAwardTime: expireAwardTime
                };
                if (mode == 2) {
                    parameters.Longitude = longitude;
                    parameters.Latitude = latitude;
                    parameters.DistanceMeters = distanceMeters;
                }
                connection.query(sql, parameters, function(err, rows) {
                    if (err) {
                        connection.rollback(function() {
                            connection.release();
                            throw err;
                        });
                    }
                    commitTrans();
                });
            });
        });
    });
};

/**
 * 领奖登记
 * @param appUserID
 * @param activityID
 * @param next
 */
module.exports.award = function(appUserID, activityID, next) {
    var sql = 'UPDATE ActivityGiftMessages SET AwardTime=NOW() WHERE AppUserID=? AND PartnerActivityID=? AND ISNULL(AwardTime)';
    var parameters = [appUserID, activityID];
    dbConn.query(sql, parameters, function(err, result) {
        if (err) throw err;
        next && next(result);
    });
};