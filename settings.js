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
    }
};