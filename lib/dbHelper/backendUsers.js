var dbConn = require('../dbConn');

/**
 * 查询后台用户
 * @param loginName 查询指定登录用户的信息
 * @param next      回调
 *
 * 查询所有
 * find(next)
 *
 * 查询指定loginName
 * find(loginName, next)
 */
module.exports.find = function (loginName, next) {
    if (!next && typeof loginName === 'function') {
        next = loginName;
        loginName = null;
    }

	var sql = 'SELECT * FROM BackendUsers';
    var parameters = null;
    if (loginName !== null) {
        sql += ' WHERE LoginName=?';
        parameters = [loginName];
    }

	dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next(rows);
    });
}

/**
 * 更新后台用户的最近登录IP和时间
 * @param userid
 * @param ip
 */
module.exports.login = function (userid, ip) {
    var sql = 'UPDATE BackendUsers SET LastLoginTime=NOW(), LastLoginIP=? WHERE ID=?';
    var parameters = [ip, userid];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
    });
}
