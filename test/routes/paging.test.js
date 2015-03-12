var should = require('should');
var agent = require('../begin.test');

describe('routes paging', function(){

    describe('paging/appUserList', function(){
        var URL = '/paging/appUserList';
        it('查询所有用户', function(done){
            agent
                .get(URL)
                .query({mode: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('按昵称查询', function(done){
            agent
                .get(URL)
                .query({mode: 1, content: ''})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('按手机号查询', function(done){
            agent
                .get(URL)
                .query({mode: 2, content: ''})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('按性别查询', function(done){
            agent
                .get(URL)
                .query({mode: 3, content: 1})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('按注册状态查询', function(done){
            agent
                .get(URL)
                .query({mode: 4, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('按注册时间段查询', function(done){
            agent
                .get(URL)
                .query({mode: 5, bTime: '', eTime: ''})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('按登录时间段查询', function(done){
            agent
                .get(URL)
                .query({mode: 6, bTime: '', eTime: ''})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('按坐标范围查询', function(done){
            agent
                .get(URL)
                .query({mode: 7, lon: 0, lat: 0, raidus: 500})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('查询 指定用户的朋友', function(done){
            agent
                .get(URL)
                .query({mode: 8, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('查询 指定公众号的订阅用户', function(done){
            agent
                .get(URL)
                .query({mode: 9, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('查询 指定活动的 接收或参与 用户', function(done){
            agent
                .get(URL)
                .query({mode: 10, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('查询 指定活动的 中奖 用户', function(done){
            agent
                .get(URL)
                .query({mode: 11, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('查询 指定活动的 领奖 用户', function(done){
            agent
                .get(URL)
                .query({mode: 12, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
    });


    describe('paging/partnerUserList', function() {
        var URL = '/paging/partnerUserList';
        it('按 订阅者ID 查询公众号列表', function (done) {
            agent
                .get(URL)
                .query({mode: 1, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
    });


    describe('paging/wordList', function() {
        var URL = '/paging/wordList';
        it('根据 字发送者ID 查询发送的字和接收者信息', function (done) {
            agent
                .get(URL)
                .query({mode: 1, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('根据 字接收者ID 查询接收的字和发送者信息', function (done) {
            agent
                .get(URL)
                .query({mode: 2, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('根据 字编号', function (done) {
            agent
                .get(URL)
                .query({mode: 3, content: ''})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
        it('根据 字解释', function (done) {
            agent
                .get(URL)
                .query({mode: 4, content: ''})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
    });


    describe('paging/activityList', function() {
        var URL = '/paging/activityList';
        it('根据 活动创建者 查询', function (done) {
            agent
                .get(URL)
                .query({mode: 1, content: 0})
                .expect(200, function (err, res) {
                    done(err);
                });
        });
    });


});