const Post = require('../database/mongo').Post
const marked = require('markdown')

module.exports = {
    //创建一篇文章
    create: function create (post) {
        return Post.create(post).exec()
    },
    //通过文章 id 获取一篇文章
    getPostById: function getPostById (postId) {
        return Post
            .findOne({ _id: postId })
            .populate({ path: 'author', model: 'User' })
            .addCreatedAt()
            .exec()
    },
    //根据时间降序获取所有用户文章 或者特定用户文章
    getPosts: function getPosts (author) {
        const query = {}
        if(author) {
            query.author = author
        }
        return Post
            .find(query)
            .populate({ path: 'author', model: 'User' })
            .sort({ _id: -1 })
            .addCreatedAt()
            .exec()
    },
    //通过文章 id 给 pv 加 1
    incPv: function incPv (postId) {
        return Post
            .update({ _id: postId }, { $inc: { pv: 1 } })
            .exec()
    },
    //通过 postId 获取原生文章
    getRawPostById: function getRawPostById (postId) {
        return Post
            .findOne({_id: postId})
            .populate({ path: 'author', model: 'User'})
            .exec()
    },
    //通过 postId 更新文章页
    updatePostById: function updatePostById (postId, data) {
        return Post.update({ _id: postId }, { $set: data }).exec()        
    },
    //通过 postId 删除一篇文章
    deletePostById: function deletePostById (postId) {
        return Post
            .remove({_id: postId})
            .exec()
    }
}