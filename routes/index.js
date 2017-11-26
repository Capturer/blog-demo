var express = require('express');
var router = express.Router();
const UserModel = require('../models/users');
const checkNotLogin = require('../middlewares/check').checkNotLogin;
const PostModel = require('../models/posts');

/* GET login page. */
router.get('/', checkNotLogin, function(req, res, next) {
  res.render('login');
});

/** Post login */
router.post('/login', checkNotLogin, function(req, res, next) {
  const username = req.body.uname;
  const password = req.body.upwd;

  console.log(username);
  //检查参数
  try{
    if(!username.length) {
      throw new Error('请填写用户名')
    } if(!password.length) {
      throw new Error('请填写密码')
    } 
  } catch(err) {
    req.flash('error', err.message);
    res.redirect('back');
  }

  UserModel.getuserByName(username)
  .then(function (user) {
    if(!user) {
      console.log('用户不存在');
      req.session.error = "用户不存在";
      //req.flash('error', '用户不存在');
      return res.redirect('back');
    } if(password !== user.password) {
      req.flash('error', '密码错误');
      return res.redirect('back');
    } else {
      req.flash('success', '登录成功');
      delete user.password;
      req.session.user = user;
      res.redirect('/home');
    }
  })
  .catch(next);
})


// GET /signup 注册页
router.get('/register', checkNotLogin, function (req, res, next) {
  res.render('register');
})

// POST /signup 用户注册
router.post('/register', checkNotLogin, function (req, res, next) {
  const name = req.body.uname;
  let password = req.body.upwd;
  console.log(name);
  // 校验参数
  try {
    if (!(name.length >= 1 && name.length <= 10)) {
      throw new Error('名字请限制在 1-10 个字符')
    }
    if (password.length < 6) {
      throw new Error('密码至少 6 个字符')
    }
  } catch (e) {
    // 注册失败，异步删除上传的头像
    req.flash('error', e.message)
    return res.redirect('/signup')
  }

  // 待写入数据库的用户信息
  let user = {
    username: name,
    password: password
  }
  // 用户信息写入数据库
  UserModel.create(user)
    .then(function (result) {
      // 此 user 是插入 mongodb 后的值，包含 _id
      user = result.ops[0]
      // 删除密码这种敏感信息，将用户信息存入 session
      delete user.password
      req.session.user = user
      // 写入 flash
      req.flash('success', '注册成功')
      // 跳转到首页
      res.redirect('/login')
    })
    .catch(function (e) {
      // 注册失败，异步删除上传的头像
      //fs.unlink(req.files.avatar.path)
      // 用户名被占用则跳回注册页，而不是错误页
      if (e.message.match('duplicate key')) {
        req.flash('error', '用户名已被占用')
        return res.redirect('/register')
      }
      next(e)
    })
})

/* GET login page. */
/*router.route('/login').get(function(req, res) {
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
        req.flash('error', '密码错误');
        //req.session.error = "密码错误";
        res.send(404);
      } else { //信息匹配成功
        req.session.user = doc;
        res.send(200);
      }
    }
  });
});
*/

/* GET register page */
/*
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
*/

const checkLogin = require('../middlewares/check').checkLogin;

router.get('/create', checkLogin, function(req, res, next) {
  res.render('create');
});

router.post('/create', checkLogin, function(req, res, next) {
    const author = req.session.user._id;
    const title = req.body.title;
    const content = req.body.content;
    try{
      if ( !title.length) {
        console.log("文章标题不能为空");
        req.session.error = "请填写标题";
        //throw new Error('请填写标题')
      } if ( !content.length ) {
        //throw new Error('请填写内容')
        res.session.error = "请填写内容";
      }
    } catch (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    let post = {
      author: author,
      title: title,
      content: content,
      pv: 0
    }
    PostModel.create(post)
    .then(function (result) {
      // 此 post 是插入 mongodb 后的值，包含 _id
      post = result.ops[0]
      //req.flash('success', '发表成功')
      req.session.error = "发表成功";
      //res.sendStatus(200);
      // 发表成功后跳转到该文章页
      res.redirect(`/posts/${post._id}`);
    })
    .catch(next)
});

router.get('/posts/:postId', function(req, res, next) {
  const postId = req.params.postId;
  console.log(postId);
  Promise.all([
    PostModel.getPostById(postId),
    PostModel.incPv(postId)
  ])
  .then(function(result) {
    const post = result[0];
    console.log(post);
    if (!post) {
      throw new Error('该文章不存在')
    }

    res.render('post', {
      post: post
    })
  })
  .catch(next)
})

//Get /posts/:postid/edit 更新文章页
router.get('/posts/:postId/edit', checkLogin, function(req, res, next) {
  const postId = req.params.postId;
  const author = req.session.user._id;
  PostModel.getRawPostById(postId)
    .then(function(post) {
      if(!post) {
        throw new Error('该文章不存在')
      } if (author.toString() !== post.author._id.toString()) {
        throw new Error('权限不足')
      }
      res.render('edit', {
        post: post
      })
    }).catch(next)
})

//Post /posts/:postId/edit 更新文章页
router.post('/posts/:postId/edit', checkLogin, function(req, res, next) {
  const postId = req.params.postId;
  const author = req.session.user._id;
  console.log(author);
  const title = req.body.title;
  const content = req.body.content;
  console.log('title:' + `${title}`);
  console.log(content);
  try{
    if (!title.length) {
      throw new Error('文章标题不能为空')
    } if (!content.length) {
      throw new Error('正文不能为空')
    } 
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('back');
  }
  PostModel.getRawPostById(postId)
    .then(function(post) {
      if (!post) {
        throw new Error('该文章不存在')
      } 
      /*
      if (post.author._id.toString() !== author._id.toString()) {
        throw new Error('权限不足')
      }
      */
      PostModel.updatePostById(postId, {title: title, content: content})
        .then(function() {
          req.flash('success', '更新成功')
          res.redirect(`/posts/${postId}`)
        }).catch(next)
    })
})

//Get /posts/:postId/remove 
router.get('/posts/:postId/remove', checkLogin, function(req, res, next) {
  const postId = req.params.postId;
  const author = req.session.user._id;
  console.log('author: '+`${author}`);

  PostModel.getRawPostById(postId)
    .then(function(post) {
      if(!post) {
        throw new Error('文章不存在')
      }
      PostModel.deletePostById(postId)
        .then(function() {
          req.flash('success', '删除文章成功');
          res.redirect('/posts')
        })
        .catch(next)
    })
})
router.get('/posts', function(req, res, next) {
  const author = req.query.author;
  console.log(author);
  PostModel.getPosts(author)
    .then(function (posts) {
      res.render('posts',{
        posts: posts
      })
    }).catch(next)
})

/*
router.post('/post').get(function(req, res, next) {
  res.render('post', { title: 'Post content'});
}).post(function(req, res) {
  var Blog = global.dbHandle.getModel('blog');
  var  title = req.body.title;
  var content = req.body.content;
  Blog.findOne({title: title}, function(err, doc) {
    if(err) {
      res.send(500);
      req.session.error = "网络异常";
      console.log(err);
    } else if(doc) {
      req.session.error = "相同标题文章已存在";
      res.send(500);
      console.log(doc);
    } else {
      Blog.create({
        title: title,
        content: content
      }, function(err, doc) {
        if(err) {
          res.send(500);
          console.log(err);
        } else {
          req.session.error = "发表成功";
          res.sendStatus(200);
        }
      });
    }
  })
});
*/
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
  req.flash('success', '登出成功');
  res.redirect("/login");
});

module.exports = router;
