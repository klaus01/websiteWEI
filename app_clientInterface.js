var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var ejs = require('ejs');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

var activityRoutes = require('./routes_www_clientInterface/activity');
var appUserRoutes = require('./routes_www_clientInterface/appUser');
var messageRoutes = require('./routes_www_clientInterface/message');
var partnerUserRoutes = require('./routes_www_clientInterface/partnerUser');
var smsRoutes = require('./routes_www_clientInterface/sms');
var wordRoutes = require('./routes_www_clientInterface/word');

var settings = require('./settings');
var publicFunction = require('./lib/publicFunction');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html', ejs.__express);
app.set('view engine', 'html');

app.use(logger(app.get('env') === 'production' ? 'combined' : 'dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest: settings.tempUploadDir}));
app.use(cookieParser());
app.use(session({
    secret: settings.cookie.secret,
    saveUninitialized: true,
    resave: true,
    rolling: true,//每请求一次，过期时间将延长
    store: new mongoStore({
        db: settings.cookie.sessionMongoDB
    }),
    cookie: { maxAge: settings.cookie.maxAge }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(publicFunction.addConnectionIPToRequest);

// 验证是否已经登录
var map = {};
map[activityRoutes.PATHHEADER] = activityRoutes.notCheckLoginUrls;
map[appUserRoutes.PATHHEADER] = appUserRoutes.notCheckLoginUrls;
map[messageRoutes.PATHHEADER] = messageRoutes.notCheckLoginUrls;
map[partnerUserRoutes.PATHHEADER] = partnerUserRoutes.notCheckLoginUrls;
map[smsRoutes.PATHHEADER] = smsRoutes.notCheckLoginUrls;
map[wordRoutes.PATHHEADER] = wordRoutes.notCheckLoginUrls;
app.use('/', function (req, res, next) {
    if (app.get('env') === 'test') {
        req.appUserID = parseInt(req.query.appUserID);
        next();
    }
    else {
        req.appUserID = req.session.appUserID;
        var pathnames = req._parsedUrl.pathname.split(path.sep);
        if (pathnames.length < 3)
            next();
        else {
            var notCheckLoginUrls = map[pathnames[1]];
            if (req.session.appUserID || (notCheckLoginUrls && notCheckLoginUrls.indexOf('/' + pathnames[2]) >= 0))
                next();
            else
                publicFunction.error(res, '未登录或登录已过期，请重新登录');
        }
    }
});

app.use('/' + activityRoutes.PATHHEADER, activityRoutes);
app.use('/' + appUserRoutes.PATHHEADER, appUserRoutes);
app.use('/' + messageRoutes.PATHHEADER, messageRoutes);
app.use('/' + partnerUserRoutes.PATHHEADER, partnerUserRoutes);
app.use('/' + smsRoutes.PATHHEADER, smsRoutes);
app.use('/' + wordRoutes.PATHHEADER, wordRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
