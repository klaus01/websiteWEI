var should = require('should');
var begin = require('../begin.test');
var agent = begin.www_clientInterface;


describe('公众号相关', function() {
    var BEGINURL = '/partnerUser';
    it('getCanSubscribe 返回有一个可用公众号', function (done) {
        agent
            .get(BEGINURL + '/getCanSubscribe')
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                res.body.data.should.have.length(1);
                done(err);
            });
    });
    it('getSubscribed 返回已订阅的一个公众号', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID
        };
        agent
            .get(BEGINURL + '/getCanSubscribe')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                res.body.data.should.have.length(1);
                done(err);
            });
    });
});