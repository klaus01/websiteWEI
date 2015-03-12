var should = require('should');
var agent = require('../beginClientInterface.test');

describe('routes clientInterface', function() {


    describe('App用户相关', function() {
        var BEGINURL = '/appUser';
        var newAppUser1 = 0, newAppUser2 = 0;
        it('注册App用户 有设备信息参数', function (done) {
            agent
                .get(BEGINURL + '/register')
                .query({
                    phoneNumber: '13800000001',
                    registrationDevice: 'iPhone 6',
                    registrationOS: '8.1.1'
                })
                .expect(200, function (err, res) {
                    res.text.should.containEql('"appUserID"');
                    newAppUser1 = res.body.data.appUserID;
                    done(err);
                });
        });
        it('注册App用户 无设备信息参数', function (done) {
            agent
                .get(BEGINURL + '/register')
                .query({
                    phoneNumber: '13800000002'
                })
                .expect(200, function (err, res) {
                    res.text.should.containEql('"appUserID"');
                    newAppUser2 = res.body.data.appUserID;
                    done(err);
                });
        });
    });


});