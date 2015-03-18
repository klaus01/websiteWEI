# websiteWEI
WEI服务端及后台管理

`node 0.10.36 + express + mysql + mongodb`

下载后需要在当前目录执行`npm install`来安装依赖包

使用[pm2](https://github.com/Unitech/PM2)来管理进程，`./pm2_startall.sh`来启动进程

mysql需要开启EVENT功能，因为一些数据需要定时更新。[开启方法](http://liu346435400.iteye.com/blog/1575299)
