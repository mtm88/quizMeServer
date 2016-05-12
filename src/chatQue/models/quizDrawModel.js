var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var quizDrawSchema = new Schema({

  quizID : String,
  usedCategories : [],
  players: [{
    userDbId: String
  }]

});

module.exports = mongoose.model('drawsData', quizDrawSchema);
