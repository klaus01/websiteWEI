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

module.exports.new = function (partnerUserID, mode, pictureFileName, content, url, beginTime, endTime, expireAwardTime, longitude, latitude, distanceMeters, next) {
    var connection = dbConn.newConnection();
    connection.connect(function(err) {
        if (err) throw err;
        connection.beginTransaction(function(err) {
            if (err) {
                connection.end();
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
                        connection.end();
                        throw err;
                    });
                }

                function commitTrans(){
                    connection.commit(function(err) {
                        if (err) {
                            connection.rollback(function() {
                                connection.end();
                                throw err;
                            });
                        }
                        connection.end();
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
                            connection.end();
                            throw err;
                        });
                    }
                    commitTrans();
                });
            });
        });
    });
};
