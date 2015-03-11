var dbConn = require('../dbConn');

module.exports = {
    findAll : function (next) {
        var sql = 'SELECT * FROM BackendUsers';
        dbConn.query(sql, function(err, rows) {
            if (err) throw err;
            next && next(rows);
        });
    },

    findByID : function (id, next) {
        var sql = 'SELECT * FROM BackendUsers WHERE ID=?';
        var parameters = [id];
        dbConn.query(sql, parameters, function(err, rows) {
            if (err) throw err;
            next && next(rows);
        });
    },

    /**
     * 查询后台用户
     * @param loginName 查询指定登录用户的信息
     * @param excludeID 排除ID
     * @param next      回调
     */
    findByLoginName : function (loginName, excludeID, next) {
        if (!next && typeof excludeID === 'function') {
            next = excludeID;
            excludeID = null;
        }

        var sql = 'SELECT * FROM BackendUsers WHERE LoginName=?';
        var parameters = [loginName];
        if (excludeID) {
            sql += ' AND ID<>?';
            parameters.push(excludeID);
        }

        dbConn.query(sql, parameters, function(err, rows) {
            if (err) throw err;
            next && next(rows);
        });
    },

    /**
     * 新增后台用户
     * @param name          姓名
     * @param isManager     是否管理员
     * @param loginName     登录名
     * @param loginPassword 登录密码
     * @param next          回调
     */
    new : function (name, isManager, loginName, loginPassword, next) {
        var sql = 'INSERT INTO BackendUsers(Name, IsManager, LoginName, LoginPassword, CreateTime) VALUES(?, ?, ?, ?, NOW())';
        var parameters = [name, isManager, loginName, loginPassword];
        dbConn.query(sql, parameters, function(err, rows) {
            if (err) throw err;
            next && next(rows);
        });
    },

    /**
     * 更新后台用户信息
     * @param id
     * @param name          姓名
     * @param isManager     是否管理员
     * @param loginName     登录名
     * @param loginPassword 登录密码
     * @param next          回调
     */
    update : function (id, name, isManager, loginName, loginPassword, next) {
        var sql = 'UPDATE BackendUsers SET ? WHERE ID=?';
        var setObj = {
            Name: name,
            IsManager: isManager,
            LoginName: loginName
        };
        if (loginPassword)
            setObj.LoginPassword = loginPassword;
        var parameters = [setObj, id];
        dbConn.query(sql, parameters, function(err, rows) {
            if (err) throw err;
            next && next(rows);
        });
    },

    /**
     * 更新后台用户的最近登录IP和时间
     * @param id
     * @param ip
     */
    updateLoginInfo : function (id, ip) {
        var sql = 'UPDATE BackendUsers SET LastLoginTime=NOW(), LastLoginIP=? WHERE ID=?';
        var parameters = [ip, id];
        dbConn.query(sql, parameters, function(err, rows) {
            if (err) throw err;
        });
    },

    /**
     * 删除后台用户
     * @param id
     * @param next
     */
    delete : function (id, next) {
        var sql = 'DELETE FROM BackendUsers WHERE ID=?';
        var parameters = [id];
        dbConn.query(sql, parameters, function(err, rows) {
            if (err) throw err;
            next && next(rows);
        });
    }
};

