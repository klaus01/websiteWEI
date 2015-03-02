var mysql      = require('mysql');
var settings   = require('../settings');

function newConnection(){
    return mysql.createConnection(settings.mysqlConnectionOptions);
}

var connection = newConnection();

module.exports = connection;
module.exports.newConnection = newConnection;