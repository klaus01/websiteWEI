var should = require('should');
var begin = require('../begin.test');
var agent = begin.www_clientInterface;



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
            appUserID: begin.data.newAppUser1.appUserID
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
            appUserID: begin.data.newAppUser1.appUserID,
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
            appUserID: begin.data.newAppUser1.appUserID,
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
            appUserID: begin.data.newAppUser1.appUserID,
            description: begin.data.wordNotAudio.description
        };
        var obj = agent.post(BEGINURL + '/new');
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
            appUserID: begin.data.newAppUser1.appUserID,
            description: begin.data.wordHaveAudio.description
        };
        var obj = agent.post(BEGINURL + '/new');
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