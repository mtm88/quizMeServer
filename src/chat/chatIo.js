var chatSchema = require('../../src/chat/models/chatLog');

var q = require('q');

var currentDate = new Date().toDateString();

exports.chatMessage = function(message) {

  var deferred = q.defer();

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
        chatLog: { 'user' : message.user, 'message' : message.message }
      }
    },

    { safe : true, upsert : true, new : true },

    function(error, success) {

      if(error) {
        console.log(error);
        deferred.reject(error);
      }


      if(success) {
        deferred.resolve(success);
      }
    }
  );

  return deferred.promise;

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
