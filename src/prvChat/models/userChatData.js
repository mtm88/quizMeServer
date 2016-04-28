/**
 * Created by pc on 2016-04-28.
 */

var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userChatSchema = new Schema ({

  userID : String


});

module.exports = mongoose.model('userChatSchema', userChatSchema);
