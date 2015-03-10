var dbConn = require('../dbConn');

function newAPNSMessage(token, content, connection, next) {
    if (!token || !token.length) {
        next && next();
        return;
    }
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
            if (err)
                connection.rollback(function () {
                    connection.end();
                    throw err;
                });
            next && next(result);
        });
    else
        dbConn.query(sql, parameters, function(err, result) {
            if (err) throw err;
            next && next(result);
        });
}

/**
 *
 * @param sourceUserID
 * @param receiveUserID
 * @param type 0成为朋友、1字、2公众号广播、3中奖
 * @param content
 * @param isRead 0未读、1已读
 * @param connection
 * @param next
 */
function newMessage(sourceUserID, receiveUserID, type, content, isRead, connection, next) {
    if (!next && typeof(connection) === 'function') {
        next = connection;
        connection = null;
    }
    var sql = 'INSERT INTO Messages SET ?';
    var parameters = {
        SourceUserID: sourceUserID,
        ReceiveUserID: receiveUserID,
        Type: type,
        Content: content,
        IsRead: isRead
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

module.exports.newFriendMessage = function (sourceUserID, receiveUserID, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) {
            connection.end();
            throw err;
        }
        newMessage(sourceUserID, receiveUserID, 0, messageContent, 0, connection, function(result){
            var messageID = result.insertId;
            newAPNSMessage(APNSToken, messageContent, connection, function (){
                connection.commit(function(err) {
                    if (err)
                        connection.rollback(function() {
                            connection.end();
                            throw err;
                        });
                    connection.end();
                    next && next(messageID);
                });
            });
        });
    });
};

module.exports.newWordMessage = function (sourceUserID, receiveUserID, wordID, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) {
            connection.end();
            throw err;
        }
        newMessage(sourceUserID, receiveUserID, 1, messageContent, 0, connection, function(result){
            var messageID = result.insertId;
            var sql = 'INSERT INTO WordMessages SET ?';
            var parameters = {
                MessageID: messageID,
                WordID: wordID
            };
            connection.query(sql, parameters, function(err, result) {
                if (err)
                    connection.rollback(function() {
                        connection.end();
                        throw err;
                    });
                // 增加字的使用量
                var sql = 'UPDATE Words SET UseCount=UseCount+1 WHERE ID=?';
                var parameters = [wordID];
                connection.query(sql, parameters, function(err, result) {
                    if (err)
                        connection.rollback(function() {
                            connection.end();
                            throw err;
                        });
                    newAPNSMessage(APNSToken, messageContent, connection, function () {
                        connection.commit(function (err) {
                            if (err)
                                connection.rollback(function () {
                                    connection.end();
                                    throw err;
                                });
                            connection.end();
                            next && next(messageID);
                        });
                    });
                });
            });
        });
    });
};

module.exports.newActivityMessage = function (sourceUserID, receiveUserID, activityID, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect();
    connection.beginTransaction(function(err) {
        if (err) {
            connection.end();
            throw err;
        }
        newMessage(sourceUserID, receiveUserID, 2, messageContent, 0, connection, function(result){
            var messageID = result.insertId;
            var sql = 'INSERT INTO ActivityMessages SET ?';
            var parameters = {
                MessageID: messageID,
                PartnerActivityID: activityID
            };
            connection.query(sql, parameters, function(err, result) {
                if (err)
                    connection.rollback(function() {
                        connection.end();
                        throw err;
                    });
                newAPNSMessage(APNSToken, messageContent, connection, function (){
                    connection.commit(function(err) {
                        if (err)
                            connection.rollback(function() {
                                connection.end();
                                throw err;
                            });
                        connection.end();
                        next && next(messageID);
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
        newMessage(sourceUserID, receiveUserID, 3, messageContent, 0, connection, function(result){
            var messageID = result.insertId;
            var sql = 'INSERT INTO ActivityGiftMessages SET ?';
            var parameters = {
                MessageID: messageID,
                PartnerActivityID: activityID,
                AwardQRCodeInfo: awardQRCodeInfo
            };
            connection.query(sql, parameters, function(err, result) {
                if (err)
                    connection.rollback(function() {
                        connection.end();
                        throw err;
                    });
                newAPNSMessage(APNSToken, messageContent, connection, function (){
                    connection.commit(function(err) {
                        if (err)
                            connection.rollback(function() {
                                connection.end();
                                throw err;
                            });
                        connection.end();
                        next && next(messageID);
                    });
                });
            });
        });
    });
};
