/* global it */
/* global describe */
/* global after */
var should = require('should');
var begin = require('../begin.test');
var agent = begin.www_clientInterface;



describe('字相关', function() {
    var BEGINURL = '/word';

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

    describe('send word', function() {
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
                wordID: begin.data.wordNotAudio.id,
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
                    res.body.data.should.have.lengthOf(5);
                    done(err);
                });
        });
        it('获取所有 按1天使用量 分页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 0,
                offset: 0,
                resultCount: 1
            };
            console.log(query);
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(1);
                    done(err);
                });
        });
        it('获取所有 按1天使用量 第2页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 0,
                offset: 1,
                resultCount: 10
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(4);
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
        it('获取所有 按30天使用量 分页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 1,
                offset: 0,
                resultCount: 10
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
        it('获取所有 按365天使用量 分页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 2,
                offset: 0,
                resultCount: 10
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
                number: '0001'
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(2);
                    done(err);
                });
        });
        it('获取所有 按 编号 和 1天使用量 分页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 0,
                number: '1000',
                offset: 0,
                resultCount: 10
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(2);
                    done(err);
                });
        });
        it('获取所有 按 描述 和 1天使用量', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 0,
                description: '不知道'
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(1);
                    done(err);
                });
        });
        it('获取所有 按 描述 和 1天使用量 分页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                orderByType: 0,
                description: '1000',
                offset: 0,
                resultCount: 10
            };
            agent
                .get(BEGINURL + '/findAll')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(0);
                    done(err);
                });
        });
    });

    describe('findByAppUser', function() {
        it('缺少参数', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                offset: 0
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
        it('带分页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                offset: 0,
                resultCount: 3
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(3);
                    done(err);
                });
        });
        it('按用户', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(5);
                    done(err);
                });
        });
        it('按用户 用户没字，三个系统字', function (done) {
            var query = {
                appUserID: begin.data.newAppUser3.appUserID
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(3);
                    done(err);
                });
        });
        it('按用户 分页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                offset: '0',
                resultCount: '10'
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
                number: '0001'
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(2);
                    done(err);
                });
        });
        it('按用户 按字编号 分页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                number: '',
                offset: 0,
                resultCount: 10
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(5);
                    done(err);
                });
        });
        it('按用户 按字描述', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                description: '带音频'
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(1);
                    done(err);
                });
        });
        it('按用户 按字描述 分页', function (done) {
            var query = {
                appUserID: begin.data.newAppUser1.appUserID,
                description: '',
                offset: 0,
                resultCount: 10
            };
            agent
                .get(BEGINURL + '/findByAppUser')
                .query(query)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    res.body.data.should.have.lengthOf(5);
                    done(err);
                });
        });
    });

});