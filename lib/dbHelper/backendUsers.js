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
module.exports.find = function (loginName, excludeID, next) {
    if (!next && typeof loginName === 'function') {
        next = loginName;
        excludeID = null;
        loginName = null;
    }
    if (!next && typeof excludeID === 'function') {
        next = excludeID;
        excludeID = null;
    }

	var sql = 'SELECT * FROM BackendUsers';
    var parameters = null;
    if (loginName !== null) {
        sql += ' WHERE LoginName=?';
        parameters = [loginName];
        if (excludeID) {
            sql += ' AND ID<>?';
            parameters += [excludeID];
        }
    }

	dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next(rows);
    });
}

/**
 * 新增后台用户
 * @param name          姓名
 * @param isManager     是否管理员
 * @param loginName     登录名
 * @param loginPassword 登录密码
 * @param next          回调
 */
module.exports.new = function (name, isManager, loginName, loginPassword, next) {
    var sql = 'INSERT INTO BackendUsers(Name, IsManager, LoginName, LoginPassword, CreateTime) VALUES(?, ?, ?, ?, NOW())';
    var parameters = [name, (isManager ? 1 : 0), loginName, loginPassword];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next(rows);
    });
}

/**
 * 更新后台用户信息
 * @param id
 * @param name          姓名
 * @param isManager     是否管理员
 * @param loginName     登录名
 * @param loginPassword 登录密码
 * @param next          回调
 */
module.exports.update = function (id, name, isManager, loginName, loginPassword, next) {
    var sql = 'UPDATE BackendUsers SET Name=?, IsManager=?, LoginName=?, LoginPassword=? WHERE ID=?';
    var parameters = [name, (isManager ? 1 : 0), loginName, loginPassword, id];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next(rows);
    });
}

/**
 * 更新后台用户的最近登录IP和时间
 * @param id
 * @param ip
 */
module.exports.updateLoginInfo = function (id, ip) {
    var sql = 'UPDATE BackendUsers SET LastLoginTime=NOW(), LastLoginIP=? WHERE ID=?';
    var parameters = [ip, id];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
    });
}

/**
 * 删除后台用户
 * @param id
 * @param next
 */
module.exports.delete = function (id, next) {
    var sql = 'DELETE BackendUsers WHERE ID=?';
    var parameters = [id];
    dbConn.query(sql, parameters, function(err, rows) {
        if (err) throw err;
        next(rows);
    });
}
