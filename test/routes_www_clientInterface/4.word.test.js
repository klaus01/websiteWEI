var should = require('should');
var begin = require('../begin.test');
var agent = begin.www_clientInterface;



describe('字相关', function() {
    var BEGINURL = '/word';

    describe('findAll', function() {
        it('缺少参数1', function (done) {
            agent
                .get(BEGINURL + '/findAll')
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":false').and.containEql('缺少参数');
                    done(err);
                });
        });
        it('缺少参数2', function (done) {
            var query = {
                orderByType: 0,
                offset: 0
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":false').and.containEql('缺少参数');
                    done(err);
                });
        });
        it('获取所有 按1天使用量', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 0
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('获取所有 按30天使用量', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 1
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('获取所有 按365天使用量', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 2
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('获取所有 按 编号 和 1天使用量', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 0,
                number: '1000'
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('获取所有 按 描述 和 1天使用量', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 0,
                description: '1000'
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
    });

    describe('findByAppUser', function() {
        it('缺少参数', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                offset: '0'
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":false').and.containEql('缺少参数');
                    done(err);
                });
        });
        it('按用户 报有', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('按用户 按字编号', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                number: ''
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('按用户 按字描述', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                description: ''
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
    });

    it('new 创建字 不带音频文件', function (done) {
        var query = {
            description: begin.data.wordNotAudio.description
        };
        var obj = agent.post(BEGINURL + '/new?appUserID=' + begin.data.newAppUser1.appUserID);
        begin.jsonToAgentField(query, obj);
        obj
            .attach('pictureFile', begin.data.wordNotAudio.pictureFile)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true').and.containEql('"newWordID":');
                begin.data.wordNotAudio.id = res.body.data.newWordID;
                done(err);
            });
    });
    it('new 创建字 带音频文件', function (done) {
        var query = {
            description: begin.data.wordHaveAudio.description
        };
        var obj = agent.post(BEGINURL + '/new?appUserID=' + begin.data.newAppUser1.appUserID);
        begin.jsonToAgentField(query, obj);
        obj
            .attach('pictureFile', begin.data.wordHaveAudio.pictureFile)
            .attach('audioFile', begin.data.wordHaveAudio.audioFile)
            .expect(200, function (err, res) {
                console.log(res.text);
                res.text.should.containEql('"success":true').and.containEql('"newWordID":');
                begin.data.wordHaveAudio.id = res.body.data.newWordID;
                done(err);
            });
    });

    it('send 发送字 发给一个用户', function (done) {
        var query = {
            wordID: begin.data.wordNotAudio.id,
            appUserID: begin.data.newAppUser1.appUserID,
            friendsUserID: [begin.data.newAppUser2.appUserID]
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
            wordID: begin.data.wordHaveAudio.id,
            appUserID: begin.data.newAppUser1.appUserID,
            friendsUserID: [begin.data.newAppUser2.appUserID, begin.data.partnerUser.partnerUserID]
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

    after(function (done) {
        // 有很多接口是先返回结果，再处理的数据库入库，为保证数据能正常入库所以这里延迟结束测试进程
        setTimeout(done, 500);
    });
});