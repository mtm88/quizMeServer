var chatSchema = require('../models/chatLog');
var q = require('q');

var currentDate = new Date().toDateString();

exports.chatMessage = function(message) {

  chatSchema.findOneAndUpdate(

    { 'date' : currentDate },

    {
      /* $set:
       {
       userID: message.user
       },
       */
      $push:
      {
        chatLog: { 'user' : message.user, 'message' : message.message, timeAdded : message.timeAdded }
      }
    },

    { safe : true, upsert : true, new : true },

    function(error, success) {

      if(error) {
        console.log(error);
      }

      if(success) {
        // console.log(success);
      }
    }
  );

};

exports.getChatLog = function() {

  var deferred = q.defer();

  chatSchema.findOne(

    { 'date' : currentDate },

    function(error, success) {

      if(error) {
        console.log(error);
        deferred.reject(error);
      }


      if(success) {
        deferred.resolve(success.chatLog);
      }
    }
  );

  return deferred.promise;

};
/**
 * Created by pc on 2016-04-22.
 */
