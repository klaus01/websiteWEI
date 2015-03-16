var should = require('should');
var agent = require('../beginClientInterface.test');

function jsonToAgentField(json, agent) {
    for (var p in json)
        agent.field(p, json[p]);
}

function getIconFilePath() {
    return __dirname + '/../../icon.jpg';
}

describe('routes clientInterface', function() {

    var partnerUser = {
        partnerUserID: 1
    };
    var newAppUser1 = {
        appUserID: 0,
        phoneNumber: '13800000001',
        nickname: '饮',
        isMan: '1',
        registrationDevice: 'iPhone 6',
        registrationOS: '8.1.1',
        longitude: 10.2,
        latitude: 10,
        APNSToken: 'nnnn'
    };
    var newAppUser2 = {
        appUserID: 0,
        phoneNumber: '13800000002'
    };
    var newAppUser3 = {
        appUserID: 0,
        phoneNumber: '13800000003'
    };

    describe('App用户相关', function() {
        var BEGINURL = '/appUser';
        it('注册App用户 有设备信息参数', function (done) {
            agent
                .get(BEGINURL + '/register')
                .query({
                    phoneNumber: newAppUser1.phoneNumber,
                    registrationDevice: newAppUser1.registrationDevice,
                    registrationOS: newAppUser1.registrationOS
                })
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"appUserID"');
                    newAppUser1.appUserID = res.body.data.appUserID;
                    done(err);
                });
        });
        it('注册App用户 无设备信息参数', function (done) {
            agent
                .get(BEGINURL + '/register')
                .query({
                    phoneNumber: newAppUser2.phoneNumber
                })
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"appUserID"');
                    newAppUser2.appUserID = res.body.data.appUserID;
                    done(err);
                });
        });

        it('查询用户信息 appUserID=newAppUser2 返回phoneNumber=13800000002', function (done) {
            agent
                .get(BEGINURL + '/get')
                .query({
                    appUserID: newAppUser2.appUserID
                })
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"PhoneNumber":"' + newAppUser2.phoneNumber + '"');
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
                    phoneNumber: newAppUser1.phoneNumber
                })
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"RegistrationOS":"' + newAppUser1.registrationOS + '"');
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
            jsonToAgentField(query, obj);
            obj
                .attach('iconFile', getIconFilePath())
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('App用户' + query.appUserID + '不存在');
                    done(err);
                });
        });
        it('修改用户信息 newAppUser1', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID,
                nickname: newAppUser1.nickname,
                isMan: newAppUser1.isMan
            };
            var obj = agent.post(BEGINURL + '/update');
            jsonToAgentField(query, obj);
            obj
                .attach('iconFile', getIconFilePath())
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    // 检查修改后的数据
                    agent
                        .get(BEGINURL + '/get')
                        .query(query)
                        .expect(200, function (err, res) {
                            console.log(res.text);
                            res.text.should.containEql('"Nickname":"' + query.nickname + '"').containEql('"RegistrationStatus":2');
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
        it('updateAPNSToken newAppUser1 APNSToken=nnnn', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID,
                APNSToken: newAppUser1.APNSToken
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
        it('updateLocation newAppUser1', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID,
                longitude: newAppUser1.longitude,
                latitude: newAppUser1.latitude
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
                appUserID: newAppUser1.appUserID,
                phoneNumber: newAppUser2.phoneNumber
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
                appUserID: newAppUser1.appUserID,
                phoneNumber: newAppUser2.phoneNumber
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
                appUserID: newAppUser1.appUserID,
                phoneNumber: newAppUser3.phoneNumber
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
                appUserID: newAppUser1.appUserID,
                phoneNumber: newAppUser3.phoneNumber
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
                appUserID: newAppUser1.appUserID,
                partnerUserID: partnerUser.partnerUserID
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
                appUserID: newAppUser1.appUserID,
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
                appUserID: newAppUser1.appUserID,
                friendUserID: newAppUser2.appUserID,
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
                appUserID: newAppUser1.appUserID
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

    describe('短信相关', function() {
        var BEGINURL = '/sms';
        it('sendCheck 发送验证短信', function (done) {
            var query = {
                phoneNumber: newAppUser2.phoneNumber
            };
            agent
                .get(BEGINURL + '/sendCheck')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.text.should.containEql('"smsID":');
                    done(err);
                });
        });
        it('checkVerificationCode 短信验证码已过期', function (done) {
            var query = {
                phoneNumber: newAppUser1.phoneNumber,
                verificationCode: '999999'
            };
            agent
                .get(BEGINURL + '/checkVerificationCode')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":false');
                    res.text.should.containEql('验证码已过期');
                    done(err);
                });
        });
        it('checkVerificationCode 短信验证码错误', function (done) {
            var query = {
                phoneNumber: newAppUser2.phoneNumber,
                verificationCode: '999999'
            };
            agent
                .get(BEGINURL + '/checkVerificationCode')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":false');
                    res.text.should.containEql('验证码错误');
                    done(err);
                });
        });
        it('checkVerificationCode 短信验证码666666', function (done) {
            var query = {
                phoneNumber: newAppUser2.phoneNumber,
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

});