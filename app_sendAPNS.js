/**
 * 后台发送苹果远程通知单元
 */

var dbConn = require('./lib/dbConn');
var dbHelper = require('./lib/dbHelper');
var settings = require('./settings');

function timer(){
    console.log(new Date(), '开始查询待发通知列表');
    dbHelper.messages.findWaitingAPNS(function(rows){
        console.log(new Date(), '查询完成，有' + rows.length + '条');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            console.log(new Date(), row.ID, '发送', '成功', row.Token, row.Content);
            // TODO 调用APNS接口发送通知
            dbHelper.messages.updateAPNSAsSent(row.ID, function(){
                console.log(new Date(), row.ID, '标记为已发送', '成功');
            });
        }
        setTimeout(timer, settings.QueryWaitingAPNSInterval);
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