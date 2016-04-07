var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var jwtUserSchema = new Schema ({

  username: String,
  password: String,
  jwtToken: String,
  friends: {
    username: String,
    userDbId: String
  }

});

module.exports = mongoose.model('jwtUser', jwtUserSchema);
