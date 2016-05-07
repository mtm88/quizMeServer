var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quizQuestionsSchema = new Schema({

  category: String,
  question: String,
  correctAnswer: String,
  incorrectAnswer1: String,
  incorrectAnswer2: String,
  incorrectAnswer3: String

});

module.exports = mongoose.model('quizquestions', quizQuestionsSchema);
