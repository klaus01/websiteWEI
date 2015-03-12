process.env.NODE_ENV = 'test';
process.env.PORT = 4000;

var fs = require('fs');
var settings = require('../../settings');
var dbConn = require('../../lib/dbConn');

var app = require('../../bin/www');
var request = require('supertest');
var agent = request.agent(app);

var publicFunction = require('../../lib/publicFunction');

module.exports = agent;


function query(sql, next) {
    sql = sql.replace(/\/\*[^\*]+\*\//g, '');
    var queryCount = 0, overCount = 0;
    function callback(){
        var i = sql.indexOf(';')
        if (i <= 0) {
            if (queryCount === overCount)
                next && next();
            return;
        }
        var s = sql.substr(0, i).trim();
        sql = sql.substr(i + 1);
        ++queryCount;
        dbConn.query(s, function(err){
            if (err) throw err;
            ++overCount;
            callback();
        });
    }
    callback();
}

describe('启动www服务', function () {
    it('等待启动', function(){
        publicFunction.sleep(500);
    });
    it('初始化数据库', function (done) {
        this.timeout(20000);
        var dbName = settings.mysqlConnectionOptions.database;
        dbConn.query('DROP DATABASE ' + dbName, function(err) {
            if (err) throw err;
            dbConn.query('CREATE DATABASE ' + dbName, function(err) {
                if (err) throw err;
                dbConn.query('USE ' + dbName, function(err) {
                    if (err) throw err;
                    console.log('创建表');
                    var data = fs.readFileSync(__dirname + '/../../doc/后台数据库.sql', 'utf-8');
                    query(data, function(){
                        console.log('创建视图与默认数据');
                        var data = fs.readFileSync(__dirname + '/../../doc/后台数据库_默认数据.sql', 'utf-8');
                        query(data, done);
                    });
                });
            });
        });
    });
});