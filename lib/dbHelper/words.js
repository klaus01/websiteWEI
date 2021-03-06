var dbConn = require('../dbConn');
var publicFunction = require('../publicFunction');

function getCountByLike(fieldName, value, next) {
    var sql = 'SELECT COUNT(*) AS c FROM Words WHERE ' + fieldName + ' LIKE ?';
    var parameters = ['%' + value + '%'];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
}

function likeFind(fieldName, value, orderByFieldName, offset, resultCount, next) {
    if (!next && typeof(offset) === 'function') {
        next = offset;
        offset = null;
    }
    var sql = '\
    SELECT *\
    FROM Words AS w LEFT JOIN VAppUsers AS u ON w.CreateUserID=u.AppUserID \
    WHERE w.' + fieldName + ' LIKE ? ORDER BY ?';
    var parameters = ['%' + value + '%', orderByFieldName];
    if (publicFunction.isNum(offset)) {
        sql += ' LIMIT ?, ?';
        parameters.push(offset, resultCount);
    }
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addWordPictureAndAudioUrl(rows);
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
}

module.exports.find = function (orderByFieldName, offset, resultCount, next) {
    if (!next && typeof(offset) === 'function') {
        next = offset;
        offset = null;
    }
    var sql = 'SELECT * FROM Words ORDER BY ?';
    var parameters = [orderByFieldName];
    if (publicFunction.isNum(offset)) {
        sql += ' LIMIT ?, ?';
        parameters.push(offset, resultCount);
    }
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addWordPictureAndAudioUrl(rows);
        next && next(rows);
    });
};

module.exports.getCountBySourceUserID = function (value, next) {
    var sql = '\
    SELECT COUNT(wm.WordID) AS c\
    FROM Messages AS m, WordMessages AS wm\
    WHERE m.ID=wm.MessageID AND m.SourceUserID=?';
    var parameters = [value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.findBySourceUserID = function (value, offset, resultCount, next) {
    var sql = '\
    SELECT w.*, u.*\
    FROM Messages AS m, WordMessages AS wm, Words AS w, VAppUsers AS u\
    WHERE m.ID=wm.MessageID AND wm.WordID=w.ID AND m.ReceiveUserID=u.AppUserID AND m.SourceUserID=?\
    LIMIT ?, ?';
    var parameters = [value, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addWordPictureAndAudioUrl(rows);
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.getCountByReceiveUserID = function (value, next) {
    var sql = '\
    SELECT COUNT(wm.WordID) AS c\
    FROM Messages AS m, WordMessages AS wm\
    WHERE m.ID=wm.MessageID AND m.ReceiveUserID=?';
    var parameters = [value];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        next && next(rows[0].c);
    });
};

module.exports.findByReceiveUserID = function (value, offset, resultCount, next) {
    var sql = '\
    SELECT w.*, u.*\
    FROM Messages AS m, WordMessages AS wm, Words AS w, VAppUsers AS u\
    WHERE m.ID=wm.MessageID AND wm.WordID=w.ID AND m.SourceUserID=u.AppUserID AND m.ReceiveUserID=?\
    LIMIT ?, ?';
    var parameters = [value, offset, resultCount];
    dbConn.query(sql, parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addWordPictureAndAudioUrl(rows);
        rows = publicFunction.addAppUserIconUrl(rows);
        next && next(rows);
    });
};

module.exports.getCountByNumber = function (value, next) {
    getCountByLike('Number', value, next);
};

module.exports.findByNumber = function (value, orderByFieldName, offset, resultCount, next) {
    likeFind('Number', value, orderByFieldName, offset, resultCount, next);
};

module.exports.getCountByDescription = function (value, next) {
    getCountByLike('Description', value, next);
};

module.exports.findByDescription = function (value, orderByFieldName, offset, resultCount, next) {
    likeFind('Description', value, orderByFieldName, offset, resultCount, next);
};

function getFindByAppUserID_SqlAndParam(appUserID){
    return {
        sql: '\
 SELECT * FROM Words WHERE Number<10001\
 UNION\
 SELECT w.*\
 FROM Words AS w\
      LEFT JOIN WordMessages AS wm ON w.ID=wm.WordID\
      LEFT JOIN Messages AS m ON wm.MessageID=m.ID\
 WHERE w.CreateUserID=? OR m.SourceUserID=? OR m.ReceiveUserID=?\
 ORDER BY Number',
        parameters: [appUserID, appUserID, appUserID]
    };
}

module.exports.findByAppUserID = function (value, offset, resultCount, next) {
    if (!next && typeof(offset) === 'function') {
        next = offset;
        offset = null;
    }
    var obj = getFindByAppUserID_SqlAndParam(value);
    if (publicFunction.isNum(offset)) {
        obj.sql += ' LIMIT ?, ?';
        obj.parameters.push(offset, resultCount);
    }
    dbConn.query(obj.sql, obj.parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addWordPictureAndAudioUrl(rows);
        next && next(rows);
    });
};

module.exports.findByAppUserIDAndNumber = function (appUserID, number, offset, resultCount, next) {
    if (!next && typeof(offset) === 'function') {
        next = offset;
        offset = null;
    }
    var obj = getFindByAppUserID_SqlAndParam(appUserID);
    obj.sql = 'SELECT * FROM (' + obj.sql + ') AS a WHERE Number LIKE ?';
    obj.parameters.push('%' + number + '%');
    if (publicFunction.isNum(offset)) {
        obj.sql += ' LIMIT ?, ?';
        obj.parameters.push(offset, resultCount);
    }
    dbConn.query(obj.sql, obj.parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addWordPictureAndAudioUrl(rows);
        next && next(rows);
    });
};

module.exports.findByAppUserIDAndDescription = function (appUserID, description, offset, resultCount, next) {
    if (!next && typeof(offset) === 'function') {
        next = offset;
        offset = null;
    }
    var obj = getFindByAppUserID_SqlAndParam(appUserID);
    obj.sql = 'SELECT * FROM (' + obj.sql + ') AS a WHERE Description LIKE ?';
    obj.parameters.push('%' + description + '%');
    if (publicFunction.isNum(offset)) {
        obj.sql += ' LIMIT ?, ?';
        obj.parameters.push(offset, resultCount);
    }
    dbConn.query(obj.sql, obj.parameters, function (err, rows) {
        if (err) throw err;
        rows = publicFunction.addWordPictureAndAudioUrl(rows);
        next && next(rows);
    });
};

module.exports.new = function (appUserID, pictureFileName, description, audioFileName, next) {
    var BEGINNUMBER = 10000000;
    var sql = '\
    INSERT INTO Words(CreateUserID, PictureFileName, Description, AudioFileName, UseCount_Before1D_CN, UseCount_Before30D_CN, UseCount_Before365D_CN, UseCount_Before1D_HK, UseCount_Before30D_HK, UseCount_Before365D_HK, Number)\
    SELECT ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, SUBSTRING(?*10+1+IFNULL(MAX(Number),?),2) FROM Words WHERE Number>?';
    var parameters = [appUserID, pictureFileName, description, audioFileName, BEGINNUMBER, BEGINNUMBER, BEGINNUMBER];
    dbConn.query(sql, parameters, function (err, result) {
        if (err) throw err;
        next && next(result.insertId);
    });
};