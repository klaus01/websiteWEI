var should = require('should');
var agent = require('../begin.test');

function jsonToAgentField(json, agent) {
    for (var p in json)
        agent.field(p, json[p]);
}

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
        it('修改用户', function(done){
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
            jsonToAgentField({
                id: 0,
                name: '可口可乐',
                description: '饮料',
                loginName: 'kl',
                password: '111',
                enabled: '1'
            }, obj);
            obj
                .attach('iconFile', __dirname + '/../icon.jpg')
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":1');
                    done(err);
                });
        });
        it('修改公众号', function (done) {
            agent
                .post(BEGINURL + '/post')
                .send({
                    id: 1,
                    name: '可口可乐',
                    description: '饮料',
                    loginName: 'kl',
                    enabled: '1'
                })
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
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
            jsonToAgentField({
                partnerUserID: 1,
                mode: 0,
                content: '普通消息广播'
            }, obj);
            obj
                .attach('pictureFile', __dirname + '/../icon.jpg')
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":1');
                    done(err);
                });
        });
        it('新增回复消息活动', function (done) {
            var obj = agent.post(BEGINURL + '/post');
            jsonToAgentField({
                partnerUserID: 1,
                mode: 1,
                content: '回复消息活动',
                beginTime: '2010-01-01',
                endTime: '2020-01-01',
                expireAwardTime: '2020-01-01'
            }, obj);
            obj
                .attach('pictureFile', __dirname + '/../icon.jpg')
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":2');
                    done(err);
                });
        });
        it('新增区域回复活动', function (done) {
            var obj = agent.post(BEGINURL + '/post');
            jsonToAgentField({
                partnerUserID: 1,
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
                .attach('pictureFile', __dirname + '/../icon.jpg')
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"newID":3');
                    done(err);
                });
        });
    });
});