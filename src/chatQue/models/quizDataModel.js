var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quizDataSchema = new Schema({

  quizID : String,
  quizStarted : Boolean,
  players: [{
  username: String,
  userDbId: String,
  difficulty: String,
  acceptedQuiz: Boolean
  }],
  quizData: [

    {
      category: String
    }

  ]


});

module.exports = mongoose.model('quizData', quizDataSchema);
