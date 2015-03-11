var publicFunction = require('../lib/publicFunction');
// 启动服务
var app = require('../bin/www');
module.exports = app;

describe('启动www服务', function () {
    it('等待启动', function(){
        publicFunction.sleep(1500);
    });
});