var express = require('express');
var router = express.Router();
var dbHelper = require('../lib/dbHelper');
var PATHHEADER = 'admin';


function resRender(res, moduleFileName, json) {
	res.render(PATHHEADER + '/' + moduleFileName, json);
}

function resRedirect(res, path) {
	res.redirect('/' + PATHHEADER + path);
}

function checkIsLogged(req, res, next) {
    if (req.session.user)
        next();
    else
        resRedirect(res, '/login');
}

function checkIsManager(req, res, next) {
    if (req.session.user.IsManager)
        next();
    else
        resRedirect(res, '/');
}

router.get('/', function(req, res) {
    checkIsLogged(req, res, function() {
        resRender(res, 'index', {
            title: '管理首页',
            user: req.session.user
        });
    });
});

router.get('/login', function(req, res) {
	resRender(res, 'login', { title: '用户登录' });
});

router.post('/login', function(req, res) {

    function error(message) {
        resRender(res, 'login', {
            title: '用户登录',
            message: message
        });
    }

    var data = req.body;
    if (!data.username) {
        error('请输入用户名');
        return;
    }
    if (!data.password) {
        error('请输入密码');
        return;
    }
    if (!data.verificationCode) {
        error('请输入验证码');
        return;
    }
    var verificationCode = req.session.verificationCode;
    if (!verificationCode || verificationCode !== data.verificationCode.toUpperCase()) {
        error('验证码错误');
        return;
    }

	dbHelper.backendUsers.findByLoginName(data.username, function(rows) {
		if (rows.length) {
            if (data.password === rows[0].LoginPassword) {
                req.session.user = rows[0];
                dbHelper.backendUsers.updateLoginInfo(req.session.user.ID, req.connection.remoteAddress);
                resRedirect(res, '/');
            } else
                loginError('密码错误');
		} else
            loginError('无此用户');
	});
});

router.get('/logout', function(req, res) {
	req.session.user = null;
	resRedirect(res, '/');
});

router.get('/backendUsers', function(req, res) {
    checkIsLogged(req, res, function() {
        checkIsManager(req, res, function() {
            dbHelper.backendUsers.findAll(function(rows) {
                resRender(res, 'backendUsers', {
                    title: '后台用户管理',
                    user: req.session.user,
                    rows: rows
                });
            })
        });
    });
});

router.get('/editBackendUser/:id?', function(req, res) {
    checkIsLogged(req, res, function() {
        checkIsManager(req, res, function() {
            var id = req.params.id;
            if (id)
                dbHelper.backendUsers.findByID(parseInt(id), function(rows){
                    if (rows.length)
                        resRender(res, 'editBackendUser', {
                            title: '修改后台用户',
                            data: rows[0]
                        });
                    else
                        res.end('无此用户信息');
                });
            else
                resRender(res, 'editBackendUser', {
                    title: '新增后台用户',
                    data: null
                });
        });
    });
});

router.post('/editBackendUser/:id?', function(req, res) {
    checkIsLogged(req, res, function() {
        checkIsManager(req, res, function() {
            var id = req.params.id ? parseInt(req.params.id) : 0;
            var data = req.body;

            function showMessage(isError, message) {
                resRender(res, 'editBackendUser', {
                    title: id ? '修改' : '新增' + '后台用户',
                    data: {
                        Name: data.name,
                        LoginName: data.loginname
                    },
                    isError: isError,
                    message: message
                });
            }
            function error(message) {
                showMessage(true, message);
            }
            function success(rows) {
                console.log(rows);
                showMessage(false, '成功');
            }

            var data = req.body;
            if (!data.name) {
                error('请输入姓名');
                return;
            }
            if (!data.loginname) {
                error('请输入登录名');
                return;
            }
            if (!data.password) {
                error('请输入密码');
                return;
            }
            dbHelper.backendUsers.findByLoginName(data.loginname, id, function(rows) {
                if (rows.length > 0)
                    error('登录名' + data.loginname + '已存在，请更换');
                else if (id > 0)
                    dbHelper.backendUsers.update(id, data.name, 0, data.loginname, data.password, success);
                else
                    dbHelper.backendUsers.new(0, data.loginname, data.password, success);
            });
        });
    });
});

router.get('/deleteBackendUser/:id', function(req, res) {
    checkIsLogged(req, res, function() {
        checkIsManager(req, res, function() {
            var id = parseInt(req.params.id);
            if (id)
                dbHelper.backendUsers.delete(id, function(rows){
                    console.log(rows);
                    res.end('成功');
                });
            else
                res.end('失败：缺少ID');
        });
    });
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;
