var express = require('express');
var fs = require("fs");
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session");
var hbs = require("hbs");
var MySQLStore = require("express-mysql-session")(session);
var config = require("./config/config.json");

//  http access logger
var morgan = require("morgan");
var rfs = require("rotating-file-stream");

//  logger
var logger = require("winston");
require("winston-daily-rotate-file");

var app = express();
app.disable("x-powered-by");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// view engine setup
hbs.registerHelper("section", function(name, options) {
  if (!this._sections) this._sections = {};
  this._sections[name] = options.fn(this);
  return null;
});

hbs.registerHelper("year", function() {
  return (new Date().getFullYear());
});

hbs.registerHelper("json", function(object) {
  return JSON.stringify(object);
});

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

//  setup loggers
var logDirectory = path.join(__dirname, "logs");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

//  create a rotating write stream
var accessLogStream = rfs("access.log", {
  interval: "1d",
  path: logDirectory
});

app.use(morgan("combined", {stream: accessLogStream}));

var transport = new logger.transports.DailyRotateFile({
  filename: path.join(logDirectory, "./log"),
  datePattern: "winston-yyyy-MM-dd.",
  prepend: true,
  level: "debug"
});

logger.configure({
  transports: [ transport ],
  exitOnError: false
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.cookie.secret));

app.use(express.static(path.join(__dirname, 'public')));

//  setup session token
var sess = config.session;

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
  var sessionStore = new MySQLStore(config.sessionOptions);

  sess.key = "session_cookie_name";
  sess.store = sessionStore;
  sess.cookie.secure = true;
}

app.use(session(sess));

var index = require('./routes/index');
var users = require('./routes/users');

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404);
  res.render("404");
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  logger.error(err);
  
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
