var http =  require('http');
var ccap = require('ccap')();
var express = require('express');
var router = express.Router();
var publicFunction = require('../lib/publicFunction');


router.get('/verificationCode', function(req, res, next) {
    var ary = ccap.get();
    req.session.verificationCode = ary[0];
    res.end(ary[1]);
});

router.get('/gpsToAddr', function(req, res, next) {
    // GPS坐标 转 Baidu坐标
    var url = 'http://api.map.baidu.com/geoconv/v1/?coords=' + req.query.x + ',' + req.query.y + '&from=1&to=5&ak=ZyY69hHlmZGBZLdr5kzxbBes';
    http.get(url, function(_res) {
        var content = "";
        _res.on('data', function(data) {
            content += data;
        });
        _res.on('end', function() {
            var resultObj = JSON.parse(content);
            if (resultObj.status === 0 && resultObj.result.length > 0) {

                // Baidu坐标转地址
                var url = 'http://api.map.baidu.com/geocoder/v2/?location=' + resultObj.result[0].y + ',' + resultObj.result[0].x + '&output=json&ak=ZyY69hHlmZGBZLdr5kzxbBes';
                http.get(url, function(_res) {
                    var content = "";
                    _res.on('data', function(data) {
                        content += data;
                    });
                    _res.on('end', function() {
                        var resultObj = JSON.parse(content);
                        if (resultObj.status === 0) {
                            publicFunction.success(res, resultObj.result, req.query.callback);
                        }
                        else {
                            publicFunction.error(res, '获取地址失败', req.query.callback);
                        }
                    });
                }).on('error', function(error) {
                    publicFunction.error(res, error, req.query.callback);
                });

            }
            else {
                publicFunction.error(res, 'GPS坐标转Baidu坐标失败', req.query.callback);
            }
        });
    }).on('error', function(error) {
        publicFunction.error(res, error, req.query.callback);
    });
});


module.exports = router;
