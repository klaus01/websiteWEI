/**
 * 后台发送苹果远程通知单元
 */

var dbHelper = require('./lib/dbHelper');
var settings = require('./settings');
var apn = require('apn');

var apnConnection = new apn.connection(settings.apnsOptions);

apnConnection.on("connected", function() {
    console.log("apn 连接成功");
});

apnConnection.on("transmitted", function(notification, device) {
    console.log("apn 发送通知给:" + device.token.toString("hex"));
});

apnConnection.on("transmissionError", function(errCode, notification, device) {
    console.error("apn 发送通知出错 ErrorCode:" + errCode + " 设备:", device, notification);
    if (errCode === 8) {
        console.log("A error code of 8 indicates that the device token is invalid. This could be for a number of reasons - are you using the correct environment? i.e. Production vs. Sandbox");
    }
});

apnConnection.on("completed", function () {
    console.log("apn 队列已发送完成");
});

apnConnection.on("timeout", function () {
    console.log("apn 连接超时");
});

apnConnection.on("disconnected", function() {
    console.log("apn 连接断开");
});

apnConnection.on("error", console.error);
apnConnection.on("socketError", console.error);


//var note = new apn.notification();
//note.sound = "ping.aiff";
//note.setAlertText("test3");
//note.badge = 5;
//apnConnection.pushNotification(note, "65c8d6ed0a5223926b03a76329305cc7d2b6dc2cc67106e27dcf27b42245a510");

function timer(){
    console.log(new Date(), '开始查询待发通知列表');
    dbHelper.messages.findWaitingAPNS(function(rows){
        console.log(new Date(), '查询完成，有' + rows.length + '条');
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];

            var note = new apn.notification();
            note.setAlertText(row.Content);
            note.badge = 1;
            apnConnection.pushNotification(note, row.Token);

            console.log(new Date(), row.ID, '发送', '成功', row.Token, row.Content);
            dbHelper.messages.updateAPNSAsSent(row.ID, function(){
                console.log(new Date(), row.ID, '标记为已发送', '成功');
            });
        }
        setTimeout(timer, settings.QueryWaitingAPNSInterval);
    });
}
timer();