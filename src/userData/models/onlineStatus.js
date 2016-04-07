var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var onlineStatusSchema = new Schema ({

  userDbId : String,
  Online: Boolean

});

module.exports = mongoose.model('onlineStatus', onlineStatusSchema);
