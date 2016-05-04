var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quizDataSchema = new Schema({

  quizID : String,
  players: [{
  username: String,
  userDbId: String,
  difficulty: String,
  acceptedQuiz: Boolean
  }]


});

module.exports = mongoose.model('quizData', quizDataSchema);
