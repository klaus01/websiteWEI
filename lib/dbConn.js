var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	database : 'WEIDB',
	user     : 'root',
	password : '111'
});

module.exports = connection;