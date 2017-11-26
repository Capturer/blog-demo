const User = require('../database/mongo').User;

module.exports = {
    //注册一个用户
    create: function create (user) {
        return User.create(user).exec();
    },
    //根据用户名获取用户信息
    getuserByName: function getuserByName (username) {
        return User
            .findOne({username: username})
            .addCreatedAt()
            .exec()
    }
}