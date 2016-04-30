var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var chatLogSchema = new Schema ({
  userID: String,
  message: String,
  timeAdded: String
});

var userSchema = new Schema ({

  userID: String,
  username: String,
  userFirstName: String,
  userLastName: String,
  userGender: String,
  userAgeRange: String,
  FBtoken: String,
  userOrigin: String,

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



module.exports = mongoose.model('fbUser', userSchema);
