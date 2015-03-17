var should = require('should');
var begin = require('../begin.test');
var agent = begin.www;

describe('routes ajax', function(){

    /******************
     * 后台管理用户相关
     ******************/
    describe('ajax/backendUser', function(){
        var BEGINURL = '/ajax/backendUser';
        it('获取 admin信息', function(done){
            agent
                .post(BEGINURL + '/get')
                .send({id: 1})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"LoginName":"admin"');
                    done(err);
                });
        });
        it('缺少id', function(done) {
            agent
                .post(BEGINURL + '/get')
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('缺少id');
                    done(err);
                });
        });
        it('无此用户', function(done){
            agent
                .post(BEGINURL + '/get')
                .send({id: 19494})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('无此用户');
                    done(err);
                });
        });


        it('新增用户 admin2', function(done){
            agent
                .post(BEGINURL + '/post')
                .send({id: 0, name: 'admin2', loginname: 'admin2', password: '222'})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":2');
                    done(err);
                });
        });
        it('新增用户 admin2已存在', function(done){
            agent
                .post(BEGINURL + '/post')
                .send({id: 0, name: 'admin2', loginname: 'admin2', password: '222'})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('admin2已存在');
                    done(err);
                });
        });
        it('新增用户 admin3', function(done){
            agent
                .post(BEGINURL + '/post')
                .send({id: 0, name: 'admin3', loginname: 'admin3', password: '333'})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":3');
                    done(err);
                });
        });
        it('修改用户3', function(done){
            agent
                .post(BEGINURL + '/post')
                .send({id: 3, name: 'admin11', loginname: 'admin11', password: '111'})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('删除用户', function(done){
            agent
                .post(BEGINURL + '/delete')
                .send({id: 3})
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
    });


    /********************************
     * 公众用户相关
     ********************************/
    describe('ajax/partnerUser', function() {
        var BEGINURL = '/ajax/partnerUser';
        it('新增公众号', function (done) {
            var obj = agent.post(BEGINURL + '/post');
            begin.jsonToAgentField({
                id: 0,
                name: begin.data.partnerUser.name,
                description: begin.data.partnerUser.description,
                loginName: begin.data.partnerUser.loginName,
                password: begin.data.partnerUser.password,
                enabled: begin.data.partnerUser.enabled
            }, obj);
            obj
                .attach('iconFile', begin.data.partnerUser.iconFile)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":');
                    begin.data.partnerUser.partnerUserID = res.body.data.newID;
                    done(err);
                });
        });
        it('修改公众号', function (done) {
            agent
                .post(BEGINURL + '/post')
                .send({
                    id: begin.data.partnerUser.partnerUserID,
                    name: begin.data.partnerUser.name,
                    description: begin.data.partnerUser.description,
                    loginName: begin.data.partnerUser.loginName,
                    enabled: begin.data.partnerUser.enabled
                })
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    done(err);
                });
        });
        it('新增公众号 为禁用状态', function (done) {
            var obj = agent.post(BEGINURL + '/post');
            begin.jsonToAgentField({
                id: 0,
                name: begin.data.partnerUserDisable.name,
                description: begin.data.partnerUserDisable.description,
                loginName: begin.data.partnerUserDisable.loginName,
                password: begin.data.partnerUserDisable.password,
                enabled: begin.data.partnerUserDisable.enabled
            }, obj);
            obj
                .attach('iconFile', begin.data.partnerUserDisable.iconFile)
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":');
                    begin.data.partnerUserDisable.partnerUserID = res.body.data.newID;
                    done(err);
                });
        });
    });


    /********************************
     * 活动相关
     ********************************/
    describe('ajax/activity', function() {
        var BEGINURL = '/ajax/activity';
        it('新增普通活动', function (done) {
            var obj = agent.post(BEGINURL + '/post');
            begin.jsonToAgentField({
                partnerUserID: begin.data.partnerUser.partnerUserID,
                mode: 0,
                content: '普通消息广播'
            }, obj);
            obj
                .attach('pictureFile', begin.getIconFilePath())
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":1');
                    done(err);
                });
        });
        it('新增回复消息活动', function (done) {
            var obj = agent.post(BEGINURL + '/post');
            begin.jsonToAgentField({
                partnerUserID: begin.data.partnerUser.partnerUserID,
                mode: 1,
                content: '回复消息活动',
                beginTime: '2010-01-01',
                endTime: '2020-01-01',
                expireAwardTime: '2020-01-01'
            }, obj);
            obj
                .attach('pictureFile', begin.getIconFilePath())
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":2');
                    done(err);
                });
        });
        it('新增区域回复活动', function (done) {
            var obj = agent.post(BEGINURL + '/post');
            begin.jsonToAgentField({
                partnerUserID: begin.data.partnerUser.partnerUserID,
                mode: 2,
                content: '区域回复活动',
                beginTime: '2015-01-01',
                endTime: '2020-01-01',
                expireAwardTime: '2020-01-01',
                longitude: 12.1,
                latitude: 12.1,
                distanceMeters: 500
            }, obj);
            obj
                .attach('pictureFile', begin.getIconFilePath())
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":3');
                    done(err);
                });
        });
    });
});