/**
 * 后台发送短信单元
 */

var dbHelper = require('./lib/dbHelper');
var settings = require('./settings');

function timer(){
    console.log(new Date(), '开始查询待发送短信列表');
    dbHelper.messages.findWaitingSMS(function(rows){
        console.log(new Date(), '查询完成，有' + rows.length + '条');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            console.log(new Date(), row.ID, '发送', '成功', row.PhoneNumber, row.Content);
            // TODO 调用短信接口发送短信
            dbHelper.messages.updateSMSAsSent(row.ID, function(){
                console.log(new Date(), row.ID, '标记为已发送', '成功');
            });
        }
        setTimeout(timer, settings.QueryWaitingSmsInterval);
    });
}
timer();