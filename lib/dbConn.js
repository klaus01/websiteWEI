var mysql      = require('mysql');
var settings   = require('../settings');
var connection = mysql.createConnection(settings.mysqlConnectionOptions);

module.exports = connection;