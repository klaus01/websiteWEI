var should = require('should');
var begin = require('../begin.test');


describe('业务逻辑测试', function() {

    describe('之前有后台管理用户，新增的管理用户没有“后台用户管理”功能', function() {
        it('登录admin2', function (done) {
            begin.www
                .post('/admin/login')
                .send({username: 'admin2', password: 'MjIy'})
                .expect(302, function (err, res) {
                    res.text.should.containEql('/admin');
                    done(err);
                });
        });
        it('首页应该没有“后台用户管理”入口', function (done) {
            begin.www
                .get('/admin/')
                .expect(200, function (err, res) {
                    res.text.should.not.containEql('后台用户管理');
                    done(err);
                });
        });
        it('不能打开“后台用户管理”页面', function (done) {
            begin.www
                .get('/admin/backendUsers')
                .expect(302, function (err, res) {
                    res.text.should.containEql('/admin');
                    done(err);
                });
        });
    });


    describe('测试后台用户修改密码功能', function() {
        it('修改密码 老密码错误', function (done) {
            begin.www
                .post('/ajax/backendUser/updatePassword')
                .send({oldpassword: 'fdsa', newpassword: 'fads'})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":false').and.containEql('旧密码错误');
                    done(err);
                });
        });
        it('修改密码 成功', function (done) {
            begin.www
                .post('/ajax/backendUser/updatePassword')
                .send({oldpassword: 'MjIy', newpassword: 'MTEx'})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('登录admin2', function (done) {
            begin.www
                .post('/admin/login')
                .send({username: 'admin2', password: 'MTEx'})
                .expect(302, function (err, res) {
                    res.text.should.containEql('/admin');
                    done(err);
                });
        });
    });


    describe('测试公众号用户修改密码功能', function() {
        it('修改密码 老密码错误', function (done) {
            begin.www
                .post('/ajax/partnerUser/updatePassword')
                .send({oldpassword: 'fdsa', newpassword: 'fads'})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":false').and.containEql('旧密码错误');
                    done(err);
                });
        });
        it('修改密码 成功', function (done) {
            begin.www
                .post('/ajax/partnerUser/updatePassword')
                .send({oldpassword: 'MTEx', newpassword: 'MjIy'})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('登录admin2', function (done) {
            begin.www
                .post('/partner/login')
                .send({username: 'kl', password: 'MjIy'})
                .expect(302, function (err, res) {
                    res.text.should.containEql('/partner');
                    done(err);
                });
        });
    });

});
