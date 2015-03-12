// https://github.com/alsotang/node-lessons/tree/master/lesson8
// https://github.com/cnodejs/nodeclub/blob/master/test/controllers/topic.test.js
var should = require('should');
var agent = require('../beginAdmin.test');

describe('routes admin', function(){

    /******************
     * 登录
     ******************/
    it('访问 登录页', function(done){
        agent
            .get('/admin/login')
            .expect(200, function (err, res) {
                res.text.should.containEql('后台用户登录');
                done(err);
            });
    });
    it('登录 无此用户', function(done){
        agent
            .post('/admin/login')
            .send({username: 'fds432afa', password: 'fdsa432fdas'})
            .expect(200, function (err, res) {
                res.text.should.containEql('无此用户');
                done(err);
            });
    });
    it('登录 密码错误', function(done){
        agent
            .post('/admin/login')
            .send({username: 'admin', password: '111'})
            .expect(200, function (err, res) {
                res.text.should.containEql('密码错误');
                done(err);
            });
    });
    it('登录 成功 转到/admin', function(done){
        agent
            .post('/admin/login')
            .send({username: 'admin', password: 'MTEx'})
            .expect(302, function (err, res) {
                res.text.should.containEql('/admin');
                done(err);
            });
    });


    it('访问 后台管理首页', function(done){
        agent
            .get('/admin/')
            .expect(200, function (err, res) {
                res.text.should.containEql('WEI后台管理');
                done(err);
            });
    });
    it('访问 APP用户列表', function(done){
        agent
            .get('/admin/appUsers')
            .expect(200, function (err, res) {
                res.text.should.containEql('坐标范围');
                done(err);
            });
    });
    it('访问 公众号管理', function(done){
        agent
            .get('/admin/partnerUsers')
            .expect(200, function (err, res) {
                res.text.should.containEql('新增公众号');
                done(err);
            });
    });
});