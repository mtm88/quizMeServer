var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quizDataSchema = new Schema({

  quizID : String,
  quizStarted : Boolean,
  players: [{
  username: String,
  userDbId: String,
  difficulty: String,
  acceptedQuiz: Boolean,
  answers: []
  }],
  quizData: [

    {
      category: String,
      questions: []
    }

  ]


});

module.exports = mongoose.model('quizData', quizDataSchema);
