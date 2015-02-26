/*
http://jiarong.blog.51cto.com/3398433/930067
 */
var PI = 3.14159265;
var EARTH_RADIUS = 6378137;
var RAD = Math.PI / 180.0;

/**
 * 计算经纬度指定距离的经纬度范围
 * @param lon 指定经度
 * @param lat 指定纬度
 * @param raidus 指定距离，单位米
 * @returns {{minLat: number, maxLat: number, minLon: number, maxLon: number}}
 */
module.exports.getAround = function (lon, lat, raidus) {
    var ret = {
        minLat: 0.0,
        maxLat: 0.0,
        minLon: 0.0,
        maxLon: 0.0
    };
    var latitude = lat;
    var longitude = lon;

    var degree = (24901 * 1609) / 360.0;
    var raidusMile = raidus;

    var dpmLat = 1 / degree;
    var radiusLat = dpmLat * raidusMile;
    ret.minLat = latitude - radiusLat;
    ret.maxLat = latitude + radiusLat;

    var mpdLon = degree * Math.cos(latitude * (PI/180));
    var dpmLon = 1 / mpdLon;
    var radiusLon = dpmLon * raidusMile;
    ret.minLon = longitude - radiusLon;
    ret.maxLon = longitude + radiusLon;

    return ret;
};

/**
 * 根据两点间经纬度坐标（double值），计算两点间距离，单位为米
 * @param lon1
 * @param lat1
 * @param lon2
 * @param lat2
 * @returns {number}
 */
module.exports.getDistance = function (lon1, lat1, lon2, lat2) {
    var radLat1 = lat1 * RAD;
    var radLat2 = lat2 * RAD;
    var a = radLat1 - radLat2;
    var b = (lon1 - lon2) * RAD;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;
};