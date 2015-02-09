var express = require('express');
var router = express.Router();
var PATHHEADER = 'partner';


router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
module.exports.PATHHEADER = PATHHEADER;