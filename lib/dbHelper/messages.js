var dbConn = require('../dbConn');

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
    connection.query(sql, parameters, function(err, result) {
        if (err) {
            connection.rollback(function () {
                connection.end();
                throw err;
            });
        }
        next(result);
    });
}

/**
 *
 * @param sourceUserID
 * @param receiveUserID
 * @param type 0成为朋友、1字、2公众号广播、3中奖
 * @param content
 * @param connection
 * @param next
 */
function newMessage(sourceUserID, receiveUserID, type, content, connection, next) {
    if (!next && typeof(connection) === 'function') {
        next = connection;
        connection = null;
    }
    var sql = 'INSERT INTO Messages SET ?';
    var parameters = {
        SourceUserID: sourceUserID,
        ReceiveUserID: receiveUserID,
        Type: type,
        Content: content
    };
    connection.query(sql, parameters, function(err, result) {
        if (err) {
            connection.rollback(function () {
                connection.end();
                throw err;
            });
        }
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
    connection.query(sql, parameters, function(err, result) {
        if (err) {
            connection.rollback(function () {
                connection.end();
                throw err;
            });
        }
        next(result);
    });
}

module.exports.newUnreadMessage = function (messageID, APNSToken, messageContent, connection, next) {
    newUnreadMessage(messageID, connection, function(result){
        if (APNSToken && (APNSToken.length > 0))
            newAPNSMessage(APNSToken, messageContent, connection, function(result){
                next();
            });
        else
            next();
    });
};

module.exports.newFriendMessage = function (sourceUserID, receiveUserID, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) {
            connection.end();
            throw err;
        }
        newMessage(sourceUserID, receiveUserID, 0, messageContent, connection, function(result){
            var messageID = result.insertId;
            module.exports.newUnreadMessage(messageID, APNSToken, messageContent, connection, function(){
                connection.commit(function(err) {
                    if (err) {
                        connection.rollback(function() {
                            connection.end();
                            throw err;
                        });
                    }
                    connection.end();
                    next && next();
                });
            });
        });
    });
};

//module.exports.newWordMessage = function (sourceUserID, receiveUserID, wordID, connection, next) {
//    newMessage(sourceUserID, receiveUserID, 1, 'xxx给你发来一个字', connection, function(result){
//        var messageID = result.insertId;
//        var sql = 'INSERT INTO WordMessages SET ?';
//        var parameters = {
//            MessageID: messageID,
//            WordID: wordID
//        };
//        connection.query(sql, parameters, function(err) {
//            if (err) {
//                connection.rollback(function() {
//                    connection.end();
//                    throw err;
//                });
//            }
//            next(result)
//        });
//    });
//};

module.exports.newActivityMessage = function (sourceUserID, receiveUserID, activityID, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) {
            connection.end();
            throw err;
        }
        newMessage(sourceUserID, receiveUserID, 2, messageContent, connection, function(result){
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
                module.exports.newUnreadMessage(messageID, APNSToken, messageContent, connection, function(){
                    connection.commit(function(err) {
                        if (err) {
                            connection.rollback(function() {
                                connection.end();
                                throw err;
                            });
                        }
                        connection.end();
                        next && next();
                    });
                });
            });
        });
    });
};

module.exports.newGiftMessage = function (sourceUserID, receiveUserID, activityID, awardQRCodeInfo, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) {
            connection.end();
            throw err;
        }
        newMessage(sourceUserID, receiveUserID, 3, messageContent, connection, function(result){
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
                module.exports.newUnreadMessage(messageID, APNSToken, messageContent, connection, function(){
                    connection.commit(function(err) {
                        if (err) {
                            connection.rollback(function() {
                                connection.end();
                                throw err;
                            });
                        }
                        connection.end();
                        next && next();
                    });
                });
            });
        });
    });
};
