module.exports = {
    cookie: {
        secret: 'websiteWEI2015',
        maxAge: 60 * 60 * 1000,
        sessionMongoDB: 'mongodb://localhost/WEIDB'
    },
    mysqlConnectionOptions: {
        host     : 'localhost',
        database : 'WEIDB',
        user     : 'root',
        password : '111'
    },
    // 分页数据页面，每页显示的记录数
    pageRows: 20,
    // 上传文件的临时目录
    tempUploadDir: './uploads/',
    // 公众号头像图片存放目录
    partnerUserIconsDir: '/images/partnerUserIcons/',
    // 公众号活动图片存放目录
    activityPicturesDir: '/images/activityPictures/',
    // 客户端App应用名称
    appName: 'WEI应用'
};