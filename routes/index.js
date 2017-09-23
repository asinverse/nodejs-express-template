var express = require('express');
var router = express.Router();

const logger = require("winston");

/* GET home page. */
router.get('/', function(req, res, next) {
	logger.info("Get home page");
	
  res.render('index', { title: 'Express' });
});

module.exports = router;
