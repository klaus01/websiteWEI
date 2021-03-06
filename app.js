var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var ejs = require('ejs');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);

var indexRoutes = require('./routes_www/index');
var adminRoutes = require('./routes_www/admin');
var partnerRoutes = require('./routes_www/partner');
var pagingRoutes = require('./routes_www/paging');
var ajaxRoutes = require('./routes_www/ajax');
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

app.use('/', indexRoutes);
app.use('/' + ajaxRoutes.PATHHEADER, ajaxRoutes);

app.use('/' + adminRoutes.PATHHEADER, adminRoutes.checkLogin);
app.use('/' + adminRoutes.PATHHEADER, adminRoutes);
app.use('/' + partnerRoutes.PATHHEADER, partnerRoutes.checkLogin);
app.use('/' + partnerRoutes.PATHHEADER, partnerRoutes);
app.use('/' + pagingRoutes.PATHHEADER, pagingRoutes.checkLogin);
app.use('/' + pagingRoutes.PATHHEADER, pagingRoutes);

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
