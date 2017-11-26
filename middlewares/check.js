module.exports = {
    checkLogin: function checkLogin (req, res, next) {
        if(!req.session.user) {
            req.session.error = "未登录";
            return res.redirect('/login');
        }
        next();
    },
    checkNotLogin: function checkNotLogin (req, res, next) {
        if (req.session.user) {
            req.session.error = "已登录";
            return res.redirect('/home')// 返回之前的页面
        }
        next()
      }

}