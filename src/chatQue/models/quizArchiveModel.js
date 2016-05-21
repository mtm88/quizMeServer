var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quizArchiveSchema = new Schema({

  quizID : String,
  quizStarted : Boolean,
  players: [{
  username: String,
  userDbId: String,
  difficulty: String,
  acceptedQuiz: Boolean,
  answers: [{
    category: String,
    questionNumber: Number,
    answer: Boolean
  }]
  }],
  quizData: [

    {
      category: String,
      questions: []
    }

  ]


});

module.exports = mongoose.model('quizArchive', quizArchiveSchema);
