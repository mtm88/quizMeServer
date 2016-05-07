var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quizCategoriesSchema = new Schema({

  category: String


});

module.exports = mongoose.model('quizCategories', quizCategoriesSchema);
