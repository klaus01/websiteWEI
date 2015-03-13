process.env.NODE_ENV = 'test';
process.env.PORT = 4001;

var app = require('../../bin/www_clientInterface');
var request = require('supertest');
var agent = request.agent(app);

var publicFunction = require('../../lib/publicFunction');

module.exports = agent;


describe('启动www_clientInterface服务', function () {
    it('等待启动', function(){
        publicFunction.sleep(500);
    });
});