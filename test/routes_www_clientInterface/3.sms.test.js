var should = require('should');
var begin = require('../begin.test');
var agent = begin.www_clientInterface;


describe('短信相关', function() {
    var BEGINURL = '/sms';
    it('checkVerificationCode 短信验证码已过期', function (done) {
        var query = {
            phoneNumber: '99999999',
            verificationCode: '666666'
        };
        agent
            .get(BEGINURL + '/checkVerificationCode')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":false').and.containEql('驗證碼已過期');
                done(err);
            });
    });
    it('checkVerificationCode 短信验证码错误', function (done) {
        var query = {
            phoneNumber: begin.data.newAppUser2.phoneNumber,
            verificationCode: '999999'
        };
        agent
            .get(BEGINURL + '/checkVerificationCode')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":false').and.containEql('验证码错误');
                res.text.should;
                done(err);
            });
    });
    it('checkVerificationCode 短信验证码666666', function (done) {
        var query = {
            phoneNumber: begin.data.newAppUser2.phoneNumber,
            verificationCode: '666666'
        };
        agent
            .get(BEGINURL + '/checkVerificationCode')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                done(err);
            });
    });
});