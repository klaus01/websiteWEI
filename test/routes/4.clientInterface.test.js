var should = require('should');
var begin = require('../begin.test');
var agent = begin.www_clientInterface;

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
    var wordNotAudio = {
        id: 0,
        description: '不知道这是什么字',
        pictureFile: begin.getIconFilePath()
    };
    var wordHaveAudio = {
        id: 0,
        description: '不知道这是什么字',
        pictureFile: begin.getIconFilePath(),
        audioFile: begin.getIconFilePath()
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
            begin.jsonToAgentField(query, obj);
            obj
                .attach('iconFile', begin.getIconFilePath())
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
        it('enterHome newAppUser1', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID
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

    describe('字相关', function() {
        var BEGINURL = '/word';
        it('find 缺少参数', function (done) {
            var query = {
                offset: '0'
            };
            agent
                .get(BEGINURL + '/find')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":false').and.containEql('缺少参数');
                    done(err);
                });
        });
        it('find 所有', function (done) {
            agent
                .get(BEGINURL + '/find')
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('find 按字编号', function (done) {
            var query = {
                number: ''
            };
            agent
                .get(BEGINURL + '/find')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('find 按字描述', function (done) {
            var query = {
                description: ''
            };
            agent
                .get(BEGINURL + '/find')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('find 按用户', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID
            };
            agent
                .get(BEGINURL + '/find')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('find 按用户 按字编号', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID,
                number: ''
            };
            agent
                .get(BEGINURL + '/find')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('find 按用户 按字描述', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID,
                description: ''
            };
            agent
                .get(BEGINURL + '/find')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });

        it('new 创建字 不带音频文件', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID,
                description: wordNotAudio.description
            };
            var obj = agent.post(BEGINURL + '/new');
            begin.jsonToAgentField(query, obj);
            obj
                .attach('pictureFile', wordNotAudio.pictureFile)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true').and.containEql('"newWordID":');
                    wordNotAudio.id = res.body.data.newWordID;
                    done(err);
                });
        });
        it('new 创建字 带音频文件', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID,
                description: wordHaveAudio.description
            };
            var obj = agent.post(BEGINURL + '/new');
            begin.jsonToAgentField(query, obj);
            obj
                .attach('pictureFile', wordHaveAudio.pictureFile)
                .attach('audioFile', wordHaveAudio.audioFile)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true').and.containEql('"newWordID":');
                    wordHaveAudio.id = res.body.data.newWordID;
                    done(err);
                });
        });

        it('send 发送字 发给一个用户', function (done) {
            var query = {
                wordID: wordNotAudio.id,
                appUserID: newAppUser1.appUserID,
                friendsUserID: [newAppUser2.appUserID]
            };
            agent
                .get(BEGINURL + '/send')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('send 发送字 发给一个用户和一个公众号用户', function (done) {
            var query = {
                wordID: wordHaveAudio.id,
                appUserID: newAppUser1.appUserID,
                friendsUserID: [newAppUser2.appUserID, partnerUser.partnerUserID]
            };
            agent
                .get(BEGINURL + '/send')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
    });

    describe('消息相关', function() {
        var BEGINURL = '/message';
        it('getUnread newAppUser2有3条未出消息，1条加朋友，2条字', function (done) {
            var query = {
                appUserID: newAppUser2.appUserID
            };
            agent
                .get(BEGINURL + '/getUnread')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(3);
                    done(err);
                });
        });
        it('getByAppUserAndPartnerUser newAppUser1与partnerUser有一条字消息', function (done) {
            var query = {
                appUserID: newAppUser1.appUserID,
                partnerUserID: partnerUser.partnerUserID
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
    });

    after(function (done) {
        // 有很多接口是先返回结果，再处理的数据库入库，为保证数据能正常入库所以这里延迟结束测试进程
        setTimeout(done, 500);
    });
});