var dbConn = require('../dbConn');
var publicFunction = require('../publicFunction');

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
        next && next(result);
    });
}

module.exports.newFriendMessage = function (sourceUserID, receiveUserID, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect(function(err) {
        if (err) throw err;
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
    });
};

module.exports.newWordMessage = function (sourceUserID, receiveUserID, wordID, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect(function(err) {
        if (err) throw err;
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
    });
};

module.exports.newActivityMessage = function (sourceUserID, receiveUserID, activityID, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect(function(err) {
        if (err) throw err;
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
    });
};

module.exports.newGiftMessage = function (sourceUserID, receiveUserID, activityID, awardQRCodeInfo, APNSToken, messageContent, next) {
    var connection = dbConn.newConnection();
    connection.connect(function(err) {
        if (err) throw err;
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
    });
};

module.exports.findUnread = function (appUserID, next) {
    dbConn.query({
        sql: '\
 SELECT au.*, pu.*, m.*, w.*, a.*, gm.*\
 FROM Messages AS m\
     LEFT JOIN AppUsers AS au ON m.SourceUserID=au.AppUserID\
     LEFT JOIN PartnerUsers AS pu ON m.SourceUserID=pu.PartnerUserID\
     LEFT JOIN WordMessages AS wm ON m.ID=wm.MessageID\
     LEFT JOIN ActivityMessages AS am ON m.ID=am.MessageID\
     LEFT JOIN ActivityGiftMessages AS gm ON m.ID=gm.MessageID\
     LEFT JOIN Words AS w ON wm.WordID=w.ID\
     LEFT JOIN PartnerActivities AS a ON am.PartnerActivityID=a.ID\
 WHERE m.IsRead=0 AND m.ReceiveUserID=?\
 ORDER BY m.CreateTime DESC',
        values: [appUserID],
        nestTables: true
    }, function(err, rows){
        if (err) throw err;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];

            row.Message = row.m;
            delete row.m;

            if (row.au.AppUserID)
                row.AppUser = publicFunction.addAppUserIconUrl(row.au);
            delete row.au;

            if (row.pu.PartnerUserID)
                row.PartnerUser = publicFunction.addPartnerUserIconUrl(row.pu);
            delete row.pu;

            if (row.w.ID)
                row.Word = publicFunction.addWordPictureAndAudioUrl(row.w);
            delete row.w;

            if (row.a.ID)
                row.Activity = publicFunction.addActivityPictureUrl(row.a);
            delete row.a;

            if (row.gm.MessageID)
                row.Gift = row.gm;
            delete row.gm;
        }
        next && next(rows);
    });
};
