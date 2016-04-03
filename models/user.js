/**
 * Created by pc on 2016-03-29.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = mongoose.model('JWTUser', new Schema({
  name: String,
  password: String,
  admin: Boolean
}));
