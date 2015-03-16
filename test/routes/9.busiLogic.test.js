var should = require('should');
var begin = require('../begin.test');


describe('业务逻辑测试', function() {

    describe('受邀用户注册完善资料后，邀请者会收到消息', function() {
        it('newAppUser3注册', function (done) {
            begin.www_clientInterface
                .get('/appUser/register')
                .query({
                    phoneNumber: begin.data.newAppUser3.phoneNumber
                })
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"appUserID"');
                    begin.data.newAppUser3.appUserID = res.body.data.appUserID;
                    done(err);
                });
        });
        it('newAppUser3完善资料', function (done) {
            var obj = begin.www_clientInterface.post('/appUser/update');
            begin.jsonToAgentField({
                appUserID: begin.data.newAppUser3.appUserID,
                nickname: begin.data.newAppUser3.nickname,
                isMan: begin.data.newAppUser3.isMan
            }, obj);
            obj
                .attach('iconFile', begin.getIconFilePath())
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true');
                    // 接口是先返回结果，再处理的数据库入库，为保证数据能正常入库所以这里延迟结束
                    setTimeout(function(){
                        done(err);
                    }, 100);
                });
        });
        it('newAppUser1有1条未出消息', function (done) {
            begin.www_clientInterface
                .get('/message/getUnread')
                .query({
                    appUserID: begin.data.newAppUser1.appUserID
                })
                .expect(200, function (err, res) {
                    console.log(res.text);
                    res.text.should.containEql('"success":true').and.containEql(begin.data.newAppUser3.nickname + ' 已加你为好友');
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
