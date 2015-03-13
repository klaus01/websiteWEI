process.env.NODE_ENV = 'test';
process.env.PORT = 4000;

var fs = require('fs');
var mysql = require('mysql');
var settings = require('../../settings');
var options = JSON.parse(JSON.stringify(settings.mysqlConnectionOptions));
delete options.database;
var dbConn = mysql.createConnection(options);

console.log('启动www服务');
var app = require('../../bin/www');
var agent = require('supertest').agent(app);
module.exports = agent;

function query(sql, next) {
    sql = sql.replace(/\/\*[^\*]+\*\//g, '');
    var queryCount = 0, overCount = 0;
    function callback(){
        var i = sql.indexOf(';')
        if (i <= 0) {
            if (queryCount === overCount) {
                process.stdout.write('\n');
                next && next();
            }
            return;
        }
        process.stdout.write('>');
        var s = sql.substr(0, i).trim();
        sql = sql.substr(i + 1);
        ++queryCount;
        dbConn.query(s, function(err){
            if (err) { dbConn.end(); throw err; }
            ++overCount;
            callback();
        });
    }
    callback();
}


describe('初始化数据库', function () {
    it('初始化数据库 完成', function(done){
        this.timeout(20000);
        var dbName = settings.mysqlConnectionOptions.database;
        dbConn.connect(function(err){
            if (err) throw err;
            dbConn.query('DROP DATABASE IF EXISTS ' + dbName, function(err) {
                if (err) { dbConn.end(); throw err; }
                dbConn.query('CREATE DATABASE ' + dbName, function(err) {
                    if (err) { dbConn.end(); throw err; }
                    dbConn.query('USE ' + dbName, function(err) {
                        if (err) { dbConn.end(); throw err; }
                        console.log('创建表');
                        var data = fs.readFileSync(__dirname + '/../../doc/后台数据库.sql', 'utf-8');
                        query(data, function(){
                            console.log('创建视图与默认数据');
                            var data = fs.readFileSync(__dirname + '/../../doc/后台数据库_默认数据.sql', 'utf-8');
                            query(data, function(){
                                dbConn.end();
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});