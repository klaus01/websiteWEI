var should = require('should');
var begin = require('../begin.test');
var agent = begin.www_clientInterface;


describe('消息相关', function() {
    var BEGINURL = '/message';
    var unreadMessageID = 0;
    it('getUnread newAppUser2有3条未出消息，1条加朋友，2条字', function (done) {
        var query = {
            appUserID: begin.data.newAppUser2.appUserID
        };
        agent
            .get(BEGINURL + '/getUnread')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                res.body.data.should.have.lengthOf(3);
                unreadMessageID = res.body.data[0].Message.ID;
                done(err);
            });
    });
    it('getByAppUserAndPartnerUser newAppUser1与partnerUser有一条字消息', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            partnerUserID: begin.data.partnerUser.partnerUserID
        };
        agent
            .get(BEGINURL + '/getByAppUserAndPartnerUser')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                res.body.data.should.have.lengthOf(1);
                done(err);
            });
    });
    it('setRead 将unreadMessageID消息设置为已读', function (done) {
        var query = {
            messageID: unreadMessageID
        };
        agent
            .get(BEGINURL + '/setRead')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                done(err);
            });
    });
    it('getUnread newAppUser2只有2条消息了，之前有一条已设置已读', function (done) {
        var query = {
            appUserID: begin.data.newAppUser2.appUserID
        };
        agent
            .get(BEGINURL + '/getUnread')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                res.body.data.should.have.lengthOf(2);
                done(err);
            });
    });
});