module.exports = {
    cookie: {
        secret: 'websiteWEI2015',
        maxAge: 60 * 60 * 1000,
        sessionMongoDB: 'mongodb://localhost/WEIDB'
    },
    // mysql数据库连接设置
    mysqlConnectionOptions: {
        host     : 'localhost',
        database : 'WEIDB',
        user     : 'root',
        password : '111'
    },
    // 分页数据页面，每页显示的记录数
    pageRows: 20,
    // 客户端App应用名称
    appName: 'WEI应用',
    // 客户端App主页地址
    appHomePageUrl: 'http://weiapp.cf/',
    // 上传文件的临时目录
    tempUploadDir: './uploads/',

    // 图片目录是放在网站静态文件目录public下的
    // App用户头像图片存放目录
    appUserIconsDir: '/images/appUserIcons/',
    // 公众号头像图片存放目录
    partnerUserIconsDir: '/images/partnerUserIcons/',
    // 公众号活动图片存放目录
    activityPicturesDir: '/images/activityPictures/',
    // 字图片存放目录
    wordPicturesDir: '/images/wordPictures/',
    // 字音频存放目录
    wordAudioDir: '/audio/wordAudio/',

    // 用于签名的标识串
    signMark: 'WEI2015'
};