var should = require('should');
var agent = require('../begin.test').www;

describe('routes partner', function() {


    it('访问 登录页', function (done) {
        agent
            .get('/partner/login')
            .expect(200, function (err, res) {
                res.text.should.containEql('公众号用户登录');
                done(err);
            });
    });
    it('登录 无此用户', function(done){
        agent
            .post('/partner/login')
            .send({username: 'fds432afa', password: 'fdsa432fdas'})
            .expect(200, function (err, res) {
                res.text.should.containEql('无此用户');
                done(err);
            });
    });
    it('登录 密码错误', function(done){
        agent
            .post('/partner/login')
            .send({username: 'kl', password: '111'})
            .expect(200, function (err, res) {
                res.text.should.containEql('密码错误');
                done(err);
            });
    });
    it('登录 账号已被禁用', function(done){
        agent
            .post('/partner/login')
            .send({username: 'kdj', password: '111'})
            .expect(200, function (err, res) {
                res.text.should.containEql('账号已被禁用');
                done(err);
            });
    });
    it('登录 成功 转到/partner', function(done){
        agent
            .post('/partner/login')
            .send({username: 'kl', password: 'MTEx'})
            .expect(302, function (err, res) {
                res.text.should.containEql('/partner');
                done(err);
            });
    });


    it('访问 订阅者列表', function(done){
        agent
            .get('/partner/appUsers')
            .expect(200, function (err, res) {
                res.text.should.containEql('坐标范围');
                done(err);
            });
    });
    it('访问 活动管理', function(done){
        agent
            .get('/partner/activities')
            .expect(200, function (err, res) {
                res.text.should.containEql('新增活动');
                done(err);
            });
    });
    it('访问 收到的字列表', function(done){
        agent
            .get('/partner/words')
            .expect(200, function (err, res) {
                res.text.should.containEql('收到的字列表');
                done(err);
            });
    });


    it('访问 公众号详情页', function(done){
        agent
            .get('/partner/activityInfo/1')
            .expect(200, function (err, res) {
                res.text.should.containEql('接收消息用户');
                done(err);
            });
    });


});