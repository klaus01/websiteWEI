var mysql      = require('mysql');
var settings   = require('../settings');

module.exports = mysql.createPool(settings.mysqlConnectionOptions);
