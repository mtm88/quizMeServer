var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var express = require('express');

var app = express();

var userOnlineStatusSchema = new Schema ({

  userID : String,
  userStatus: Boolean

});

var userOnlineStatus = mongoose.model('usersOnline', userOnlineStatusSchema);

exports.setOnlineStatus = function(req, res) {

  console.log(req.body.status);


};


