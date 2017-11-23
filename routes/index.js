var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET login page. */
router.route('/login').get(function(req, res) {
  res.render('login', { title: 'User login' });
}).post(function(req, res) {
  //get User info
  var User = global.dbHandle.getModel('user');
  var uname = req.body.uname;
  User.findOne({username: uname}, function(err, doc) {
    if(err) {
      res.send(500);
      console.log(err);
    } else if(!doc) {//查询不到用户名信息，即用户不存在
      req.session.error = "用户不存在";
      res.send(404);
    } else {
      if(req.body.upwd != doc.password) {//查询到相应的用户名信息,但是密码信息不匹配
        req.session.error = "密码错误";
        res.send(404);
      } else { //信息匹配成功
        req.session.user = doc;
        res.send(200);
      }
    }
  });
});

/* GET register page */
router.route('/register').get(function(req, res) {
  res.render('register', { title: 'User register'});
}).post(function(req, res) {
  var User = global.dbHandle.getModel('user');
  var uname = req.body.uname;
  var upwd = req.body.upwd;
  User.findOne({username: uname}, function(err, doc) {
    if(err) {
      res.send(500);
      req.session.error = "网络异常";
      console.log(err);
    } else if(doc) {
      req.session.error = "用户已存在";
      res.send(500);
    } else {
      User.create({
        username: uname,
        password: upwd
      }, function(err, doc) {
        if(err) {
          res.send(500);
          console.log(err);
        } else {
          req.session.error = "用户创建成功";
          res.send(200);
        }
      });
    }
  });
});

 /* GET home page. */
router.get("/home",function(req,res){ 
  if(!req.session.user){                     //到达/home路径首先判断是否已经登录
      req.session.error = "请先登录"
      res.redirect("/login");                //未登录则重定向到 /login 路径
  }
  res.render("home",{title:'Home'});         //已登录则渲染home页面
});

/* GET logout page. */
router.get("/logout",function(req,res){    // 到达 /logout 路径则登出， session中user,error对象置空，并重定向到根路径
  req.session.user = null;
  req.session.error = null;
  res.redirect("/");
});

module.exports = router;
