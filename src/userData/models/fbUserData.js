var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema ({

  userID: String,
  username: String,
  userFirstName: String,
  userLastName: String,
  userGender: String,
  userAgeRange: String,
  FBtoken: String,
  userOrigin: String,

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
