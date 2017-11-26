//const config = require('config-lite')(__dirname);
//var mongoose = require('mongoose');
const Mongolass = require('mongolass');
const mongolass = new Mongolass('mongodb://localhost:27017/blogdb');

exports.User = mongolass.model('User', {
    username: {type: String},
    password: {type: String}
})

exports.User.index({username: 1}, { unique: true}).exec();//按用户名找到用户,用户名唯一

exports.Post = mongolass.model('Post', {
    author: {type: Mongolass.Types.ObjectId},
    title: {type: String},
    content: {type: String},
    pv: {type: Number}
})

exports.Post.index({author: 1, _id: -1}).exec();//按创建时间降序查看用户文章

const moment = require('moment')
const objectIdToTimestamp = require('objectid-to-timestamp')

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
  afterFind: function (results) {
    results.forEach(function (item) {
      item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm')
    })
    return results
  },
  afterFindOne: function (result) {
    if (result) {
      result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm')
    }
    return result
  }
});

/*
module.exports = {
    user:{
        username:{type: String, required: true, index: {unique: true, dropDups: true}},
        password:{type: String, required: true}
    },
    blog:{
        author:{type: String, required: true},
        title:{type: String, required: true},
        content:{type: String, required: true}
    }
};
*/