var dbConn = require('../dbConn');

module.exports.find = function (appUserID, phoneNumber, next) {
    var sql = 'SELECT * FROM InviteFriends WHERE AppUserID=? AND FriendPhoneNumber=?';
    var parameters = [appUserID, phoneNumber];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows);
    });
};

module.exports.new = function (appUserID, phoneNumber, next) {
    var sql = 'INSERT INTO InviteFriends SET AppUserID=?, FriendPhoneNumber=?';
    var parameters = [appUserID, phoneNumber];
    dbConn.query(sql, parameters, function (err, result) {
        if (err) throw err;
        next && next(result);
    });
};
