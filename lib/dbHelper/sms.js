var dbConn = require('../dbConn');

module.exports.getCount = function (next) {
    var sql = 'SELECT COUNT(*) AS c FROM VSMSLogs';
    dbConn.query(sql, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.findAll = function (offset, resultCount, next) {
    var sql = 'SELECT * FROM VSMSLogs ORDER BY ID DESC LIMIT ?, ?';
    var parameters = [offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows);
    });
};

module.exports.findUnexpiredAndUnverifiedCheckSMSByPhoneNumber = function (phoneNumber, next) {
    var sql = 'SELECT * FROM SMSLogs_Check WHERE PhoneNumber=? AND NOW()<ExpirationTime AND IsVerified=0';
    var parameters = [phoneNumber];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows);
    });
};

module.exports.newUnsentSMS = function (smsID, next) {
    var sql = 'INSERT INTO SMSWaitingList SET SMSID=?';
    var parameters = [smsID];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows);
    });
};

module.exports.newInviteFriendSMS = function (phoneNumber, smsContent, next) {
    var sql = 'INSERT INTO SMSLogs SET CreateTime=NOW(), ?';
    var parameters = {
        Type: 2,
        PhoneNumber: phoneNumber,
        Content: smsContent
    };
    dbConn.query(sql, parameters, function(err, result) {
        if (err) throw err;
        next && next(result.insertId);
    });
};

module.exports.newCheckSMS = function (phoneNumber, smsContent, verificationCode, expirationTime, next) {
    dbConn.getConnection(function(err, connection){
        if (err) throw err;
        connection.beginTransaction(function(err) {
            if (err) {
                connection.release();
                throw err;
            }
            var sql = 'INSERT INTO SMSLogs SET CreateTime=NOW(), ?';
            var parameters = {
                Type: 1,
                PhoneNumber: phoneNumber,
                Content: smsContent
            };
            connection.query(sql, parameters, function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        connection.release();
                        throw err;
                    });
                }
                var sql = 'INSERT INTO SMSLogs_Check SET ?';
                var parameters = {
                    SMSID: result.insertId,
                    PhoneNumber: phoneNumber,
                    VerificationCode: verificationCode,
                    ExpirationTime: expirationTime,
                    IsVerified: 0
                };
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

module.exports.updateVerified = function (smsID, next) {
    var sql = 'UPDATE SMSLogs_Check SET IsVerified=1 WHERE SMSID=?';
    var parameters = [smsID];
    dbConn.query(sql, parameters, function(err, result) {
        if (err) throw err;
        next && next();
    });
};
