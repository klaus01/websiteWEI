module.exports = {
	cookie: {
		secret: 'websiteWEI2015',	
		maxAge: 10 * 60 * 1000,
		sessionMongoDB: 'mongodb://localhost/test-app'
	},
	mysqlConnectionOptions: {
		host     : 'localhost',
		database : 'WEIDB',
		user     : 'root',
		password : '111'
	}
}