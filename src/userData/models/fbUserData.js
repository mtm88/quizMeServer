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
  userOrigin: String

});

module.exports = mongoose.model('fbUser', userSchema);
