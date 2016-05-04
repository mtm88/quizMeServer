var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var chatQueSchema = new Schema({

  username: String,
  userDbId: String,
  difficulty: String


});

module.exports = mongoose.model('chatQue', chatQueSchema);
