var mongoose = require('mongoose');

var Schema = mongoose.Schema;


var chatSchema = new Schema ({

  userID: String,
  chatLog: {
    user: String,
    message: String
  }

});

module.exports = mongoose.model('chatLog', chatSchema);
