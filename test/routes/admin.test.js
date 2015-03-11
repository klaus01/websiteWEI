// https://github.com/alsotang/node-lessons/tree/master/lesson8
// https://github.com/cnodejs/nodeclub/blob/master/test/controllers/topic.test.js
var should = require('should');
var request = require('supertest');
var app = require('../begin.test');

describe('routes admin', function(){
    it('GET /admin/login', function(done){
        request(app)
            .get('/admin/login')
            .expect(200, function (err, res) {
                res.text.should.containEql('后台用户登录');
                done(err);
            });
    });
});