var should = require('should');
var begin = require('../begin.test');
var agent = begin.www_clientInterface;

describe('App用户相关', function() {
    var BEGINURL = '/appUser';
    it('注册App用户 有设备信息参数', function (done) {
        agent
            .get(BEGINURL + '/register')
            .query({
                phoneNumber: begin.data.newAppUser1.phoneNumber,
                registrationDevice: begin.data.newAppUser1.registrationDevice,
                registrationOS: begin.data.newAppUser1.registrationOS
            })
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"appUserID"');
                begin.data.newAppUser1.appUserID = res.body.data.appUserID;
                done(err);
            });
    });
    it('注册App用户 无设备信息参数', function (done) {
        agent
            .get(BEGINURL + '/register')
            .query({
                phoneNumber: begin.data.newAppUser2.phoneNumber
            })
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"appUserID"');
                begin.data.newAppUser2.appUserID = res.body.data.appUserID;
                done(err);
            });
    });

    it('查询用户信息 appUserID=begin.data.newAppUser2 返回phoneNumber=13800000002', function (done) {
        agent
            .get(BEGINURL + '/get')
            .query({
                appUserID: begin.data.newAppUser2.appUserID
            })
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"PhoneNumber":"' + begin.data.newAppUser2.phoneNumber + '"');
                done(err);
            });
    });
    it('查询用户信息 appUserID=0 返回App用户不存在', function (done) {
        agent
            .get(BEGINURL + '/get')
            .query({
                appUserID: 999999
            })
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('App用户不存在');
                done(err);
            });
    });
    it('查询用户信息 phoneNumber=13800000001 返回registrationOS=8.1.1', function (done) {
        agent
            .get(BEGINURL + '/get')
            .query({
                phoneNumber: begin.data.newAppUser1.phoneNumber
            })
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"RegistrationOS":"' + begin.data.newAppUser1.registrationOS + '"');
                done(err);
            });
    });
    it('查询用户信息 phoneNumber=1388 返回App用户不存在', function (done) {
        agent
            .get(BEGINURL + '/get')
            .query({
                phoneNumber: '1388'
            })
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('App用户不存在');
                done(err);
            });
    });

    it('修改用户信息 用户不存在', function (done) {
        var query = {
            appUserID: 99999,
            nickname: 'x',
            isMan: 0
        };
        var obj = agent.post(BEGINURL + '/update');
        begin.jsonToAgentField(query, obj);
        obj
            .attach('iconFile', begin.getIconFilePath())
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('App用户' + query.appUserID + '不存在');
                done(err);
            });
    });
    it('修改用户信息 begin.data.newAppUser1', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            nickname: begin.data.newAppUser1.nickname,
            isMan: begin.data.newAppUser1.isMan
        };
        var obj = agent.post(BEGINURL + '/update');
        begin.jsonToAgentField(query, obj);
        obj
            .attach('iconFile', begin.getIconFilePath())
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                // 检查修改后的数据
                agent
                    .get(BEGINURL + '/get')
                    .query(query)
                    .expect(200, function (err, res) {
                        console.log(res.text);
                        res.text.should.containEql('"Nickname":"' + query.nickname + '"').and.containEql('"RegistrationStatus":2');
                        done(err);
                    });
            });
    });

    it('updateAPNSToken 用户不存在', function (done) {
        var query = {
            appUserID: 99999,
            APNSToken: 'xxxx'
        };
        agent
            .get(BEGINURL + '/updateAPNSToken')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('App用户' + query.appUserID + '不存在');
                done(err);
            });
    });
    it('updateAPNSToken begin.data.newAppUser1', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            APNSToken: begin.data.newAppUser1.APNSToken
        };
        agent
            .get(BEGINURL + '/updateAPNSToken')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                // 检查修改后的数据
                agent
                    .get(BEGINURL + '/get')
                    .query(query)
                    .expect(200, function (err, res) {
                        console.log(res.text);
                        res.text.should.containEql('"APNSToken":"' + query.APNSToken + '"');
                        done(err);
                    });
            });
    });
    it('updateAPNSToken begin.data.newAppUser2', function (done) {
        var query = {
            appUserID: begin.data.newAppUser2.appUserID,
            APNSToken: begin.data.newAppUser2.APNSToken
        };
        agent
            .get(BEGINURL + '/updateAPNSToken')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                // 检查修改后的数据
                agent
                    .get(BEGINURL + '/get')
                    .query(query)
                    .expect(200, function (err, res) {
                        console.log(res.text);
                        res.text.should.containEql('"APNSToken":"' + query.APNSToken + '"');
                        done(err);
                    });
            });
    });

    it('enterHome 用户不存在', function (done) {
        var query = {
            appUserID: 99999,
            APNSToken: 'xxxx'
        };
        agent
            .get(BEGINURL + '/enterHome')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('App用户' + query.appUserID + '不存在');
                done(err);
            });
    });
    it('enterHome begin.data.newAppUser1', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID
        };
        agent
            .get(BEGINURL + '/enterHome')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                // 检查修改后的数据
                agent
                    .get(BEGINURL + '/get')
                    .query(query)
                    .expect(200, function (err, res) {
                        console.log(res.text);
                        res.text.should.containEql('"RegistrationStatus":3');
                        done(err);
                    });
            });
    });

    it('updateLocation 用户不存在', function (done) {
        var query = {
            appUserID: 99999,
            longitude: 0,
            latitude: 0
        };
        agent
            .get(BEGINURL + '/updateLocation')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('App用户' + query.appUserID + '不存在');
                done(err);
            });
    });
    it('updateLocation begin.data.newAppUser1', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            longitude: begin.data.newAppUser1.longitude,
            latitude: begin.data.newAppUser1.latitude
        };
        agent
            .get(BEGINURL + '/updateLocation')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                // 检查修改后的数据
                agent
                    .get(BEGINURL + '/get')
                    .query(query)
                    .expect(200, function (err, res) {
                        console.log(res.text);
                        res.text.should.containEql('"LastLoginLongitude":' + query.longitude);
                        done(err);
                    });
            });
    });

    it('addFriend 用户不存在', function (done) {
        var query = {
            appUserID: 99999,
            phoneNumber: 0
        };
        agent
            .get(BEGINURL + '/addFriend')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('App用户' + query.appUserID + '不存在');
                done(err);
            });
    });
    it('addFriend newAppUser1添加朋友newAppUser2(是应用注册用户)', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            phoneNumber: begin.data.newAppUser2.phoneNumber
        };
        agent
            .get(BEGINURL + '/addFriend')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('已加为朋友');
                done(err);
            });
    });
    it('addFriend newAppUser1重复添加朋友newAppUser2', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            phoneNumber: begin.data.newAppUser2.phoneNumber
        };
        agent
            .get(BEGINURL + '/addFriend')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('你们已经是朋友了');
                done(err);
            });
    });
    it('addFriend newAppUser1邀请朋友newAppUser3(非应用注册用户)', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            phoneNumber: begin.data.newAppUser3.phoneNumber
        };
        agent
            .get(BEGINURL + '/addFriend')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('已邀请');
                done(err);
            });
    });
    it('addFriend newAppUser1重复邀请朋友newAppUser3', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            phoneNumber: begin.data.newAppUser3.phoneNumber
        };
        agent
            .get(BEGINURL + '/addFriend')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('你已经邀请过此用户');
                done(err);
            });
    });

    it('addPartnerUser newAppUser1订阅partnerUser', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            partnerUserID: begin.data.partnerUser.partnerUserID
        };
        agent
            .get(BEGINURL + '/addPartnerUser')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                done(err);
            });
    });

    it('setFriendIsBlack newAppUser1拉黑999，不是朋友关系', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            friendUserID: 999,
            isBlack: 1
        };
        agent
            .get(BEGINURL + '/setFriendIsBlack')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('不是朋友');
                done(err);
            });
    });
    it('setFriendIsBlack newAppUser1拉黑newAppUser2', function (done) {
        var query = {
            appUserID: begin.data.newAppUser1.appUserID,
            friendUserID: begin.data.newAppUser2.appUserID,
            isBlack: 1
        };
        agent
            .get(BEGINURL + '/setFriendIsBlack')
            .query(query)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true');
                done(err);
            });
    });
});