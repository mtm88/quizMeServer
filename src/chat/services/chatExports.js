var chatSchema = require('../models/chatLog');

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

exports.getChatLog = function(req, res) {

  chatSchema.find(

    { 'date' : currentDate },

    function(error, success) {

      if(error) {
        console.log(error);
        res.send(error);
      }


      if(success) {
        if(!success.length) {
          res.send({ noMessagesYet : true, message : 'No one spoke today yet' });
        }
        else {
        res.send(success[0].chatLog);
        }
      }
    }
  );

};


