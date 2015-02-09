var dbConn = require('../dbConn');

module.exports.find = function (loginName, callback) {
	var sql = 'SELECT * FROM BackendUsers WHERE LoginName = ?';
	var parameters = [loginName];
	dbConn.query(sql, parameters, function(err, rows) {
		if (err) throw err;
		callback(rows);
	});
}
