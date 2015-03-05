var dbConn = require('../dbConn');
var dbHelper = require('../dbHelper');

function newAPNSMessage(token, content, connection, next) {
    if (!next && typeof(connection) === 'function') {
        next = connection;
        connection = null;
    }
    var sql = 'INSERT INTO APNSWaitingList SET ?';
    var parameters = {
        Token: token,
        Content: content
    };
    if (connection)
        connection.query(sql, parameters, function(err, result) {
            if (err) {
                connection.rollback(function () {
                    connection.end();
                    throw err;
                });
            }
            next(result);
        });
    else
        dbConn.query(sql, parameters, function(err, result) {
            if (err) throw err;
            next(result);
        });
}

/**
 *
 * @param sourceUserID
 * @param receiveUserID
 * @param type 0成为朋友、1字、2公众号广播、3中奖
 * @param connection
 * @param next
 */
function newMessage(sourceUserID, receiveUserID, type, connection, next) {
    if (!next && typeof(connection) === 'function') {
        next = connection;
        connection = null;
    }
    var sql = 'INSERT INTO Messages SET ?';
    var parameters = {
        SourceUserID: sourceUserID,
        ReceiveUserID: receiveUserID,
        Type: type
    };
    if (connection)
        connection.query(sql, parameters, function(err, result) {
            if (err) {
                connection.rollback(function () {
                    connection.end();
                    throw err;
                });
            }
            next(result);
        });
    else
        dbConn.query(sql, parameters, function(err, result) {
            if (err) throw err;
            next(result);
        });
}

function newUnreadMessage(messageID, connection, next) {
    if (!next && typeof(connection) === 'function') {
        next = connection;
        connection = null;
    }
    var sql = 'INSERT INTO NewMessages SET ?';
    var parameters = {
        MessageID: messageID
    };
    if (connection)
        connection.query(sql, parameters, function(err, result) {
            if (err) {
                connection.rollback(function () {
                    connection.end();
                    throw err;
                });
            }
            next(result);
        });
    else
        dbConn.query(sql, parameters, function(err, result) {
            if (err) throw err;
            next(result);
        });
}

module.exports.newWordMessage = function (wordID, sourceUserID, receiveUserID, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) {
            connection.end();
            throw err;
        }
        newMessage(sourceUserID, receiveUserID, 1, connection, function(result){
            var sql = 'INSERT INTO WordMessages SET ?';
            var parameters = {
                MessageID: result.insertId,
                WordID: wordID
            };
            connection.query(sql, parameters, function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        connection.end();
                        throw err;
                    });
                }
                // TODO 接收者是公众号，是否中奖，newGiftMessage
            });
        });
    });
};

module.exports.newActivityMessage = function (activityID, sourceUserID, receiveUserID, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) {
            connection.end();
            throw err;
        }
        newMessage(sourceUserID, receiveUserID, 2, connection, function(result){
            var messageID = result.insertId;
            var sql = 'INSERT INTO ActivityMessages SET ?';
            var parameters = {
                MessageID: messageID,
                PartnerActivityID: activityID
            };
            connection.query(sql, parameters, function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        connection.end();
                        throw err;
                    });
                }
                newUnreadMessage(messageID, connection, function(result){
                    dbHelper.appUsers.findByID(receiveUserID, function(rows){
                        if ((rows.length > 0) && rows[0].APNSToken)
                            newAPNSMessage(rows[0].APNSToken, messageContent, connection, function(result){
                                connection.end();
                                next();
                            });
                        else
                            connection.end();
                    });
                });
            });
        });
    });
};

module.exports.newGiftMessage = function (activityID, sourceUserID, receiveUserID, awardQRCodeInfo, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) {
            connection.end();
            throw err;
        }
        newMessage(sourceUserID, receiveUserID, 3, connection, function(result){
            var messageID = result.insertId;
            var sql = 'INSERT INTO ActivityGiftMessages SET ?';
            var parameters = {
                MessageID: messageID,
                PartnerActivityID: activityID,
                AwardQRCodeInfo: awardQRCodeInfo
            };
            connection.query(sql, parameters, function(err, result) {
                if (err) {
                    connection.rollback(function() {
                        connection.end();
                        throw err;
                    });
                }
                newUnreadMessage(messageID, connection, function(result){
                    dbHelper.appUsers.findByID(receiveUserID, function(rows){
                        if ((rows.length > 0) && rows[0].APNSToken)
                            newAPNSMessage(rows[0].APNSToken, messageContent, connection, function(result){
                                connection.end();
                                next();
                            });
                        else
                            connection.end();
                    });
                });
            });
        });
    });
};
