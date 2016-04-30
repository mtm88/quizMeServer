var mongoose = require('mongoose-q')(require('mongoose'));
var Schema = mongoose.Schema;

var chatLogSchema = new Schema ({
  userID: String,
  message: String,
  timeAdded: String
});

var jwtUserSchema = new Schema ({

  username: String,
  password: String,
  jwtToken: String,
  test: String,

  chatLogs: [{
    username: String,
    chatLog: [chatLogSchema]
  }],

  friends: {
    username: String,
    userDbId: String
  },

  receivedInvites: {
    userDbId: String,
    timeSent: String,
    username: String
  },

  sentInvites: {
    timeSent: String,
    userDbId: String,
    username: String
  }

});

module.exports = mongoose.model('jwtUser', jwtUserSchema);
