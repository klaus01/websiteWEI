var dbConn = require('./lib/dbConn');
var dbHelper = require('./lib/dbHelper');
var publicFunction = require('./lib/publicFunction');
var settings = require('./settings');

function timer(){
    console.log(new Date(), '开始查询待发送短信列表');
    dbHelper.messages.findWaiting(function(rows){
        console.log(new Date(), '查询待发送短信列表成功，有' + rows.length + '条');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            console.log(new Date(), row.ID, '发送', '成功', row.PhoneNumber, row.Contnet);
            // TODO 调用短信接口发送短信
            dbHelper.messages.updateAsSent(row.ID, function(){
                console.log(new Date(), row.ID, '标记为已发送', '成功');
            });
        }
        setTimeout(timer, settings.QueryWaitingSmsInterval);
    });
}

dbConn.connect(function(err){
    if (err) {
        console.error('数据库连接失败:' + err.stack);
        return;
    }
    console.log(new Date(), '数据库已成功连接id:' + dbConn.threadId);
    timer();
});