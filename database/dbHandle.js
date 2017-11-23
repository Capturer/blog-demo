var mongoose = require('mongoose');
var Scheme = mongoose.Schema;

var models = require('./models');

for(var m in models) {
    mongoose.model(m, new Scheme(models[m]));
}

module.exports = {
    getModel: function(type) {
        return _getModel(type);
    }
};

var _getModel = function(type) {
    return mongoose.model(type);
}