var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var session = require('express-session');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');
var settings = require('./setting');

var app = express();
app.use(session({// session持久化设置
  secret: settings.cookieSecret,
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 },//超时时间 30 days
  //resave: false,
  //saveUninitialized: true,
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port,
    url: 'mongodb://localhost:27017/blogdb'
  }
  )
}));

//global.dbHandle = require('./database/dbHandle');
//global.db = mongoose.connect("mongodb://localhost:27017/blogdb");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(multer()); //最新版不支持此种用法
app.use(express.static(path.join(__dirname, 'public')));

// session handle
app.use(function(req, res, next) {
  res.locals.user = req.session.user; //从session获取user对象
  var err = req.session.error;
  delete req.session.error;
  res.locals.message = "";
  if(err){ 
    res.locals.message = '<div class="alert alert-danger" style="margin-bottom:20px;color:red;">'+err+'</div>';
  }
  next();  //中间件传递
});

app.use('/', index);
app.use('/users', users);
app.use('/register', index);
app.use('/login', index);
app.use('/home', index);
app.use('/logout', index);
app.use('/post', index);
app.use('/posts', index);
app.use('/create', index);

// 添加模板必需的三个变量
app.use(function (req, res, next) {
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
