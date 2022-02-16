var express = require('express');
var router = express.Router();
// var db=monk('localhost:27017/Project');
// var collection = db.get('user_data');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
