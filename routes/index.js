var ccap = require('ccap')();
var express = require('express');
var router = express.Router();


router.get('/VerificationCode', function(req, res, next) {
    var ary = ccap.get();
    req.session.verificationCode = ary[0];
    res.end(ary[1]);
});


module.exports = router;
