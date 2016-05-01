/**
 * Created by pc on 2016-04-28.
 */
var q = require('q');
var mongoose = require('mongoose');

function setUserOrigin(userLoginService) {

  var deferred = q.defer();

  if(userLoginService == 'fb'){
    userDataOrigin = require('../../global/models/fbUserData');
    deferred.resolve(userDataOrigin);
  }
  else {
    userDataOrigin = require('../../global/models/jwtUserData');
    deferred.resolve(userDataOrigin);
  }

  return deferred.promise;

}



    exports.getPrvChatLog = function(req, res) {

      setUserOrigin(req.body.loginService)
        .then(function() {

            userDataOrigin.find(

             { '_id' : req.body.userDbId },

             function(error, userInfo) {

               if(error) {
                 console.log('blad przy wyszukiwaniu usera');
                 console.log(error);
               }

               if(userInfo) {


                 userDataOrigin.aggregate( [
                   { $match : { "_id" : { $in: [ mongoose.Types.ObjectId(req.body.userDbId) ] }  } },
                   { $unwind : '$chatLogs' },
                   { $match : { 'chatLogs.username' : req.body.friendName }},
                   { $unwind : '$chatLogs.chatLog'},
                   { $group : {_id : '$_id', chatLog : { $push : '$chatLogs.chatLog' }}}
                 ] )
                   .exec(function(error, success) {

                     if(error) {
                       console.log(error);
                       console.log('blad przy pobieraniu private chatloga');
                     }

                     if(success) {
                       res.send(success);
                     }

                   })



               }

             }

           )

        })

    };


exports.sendPrvChatLogMsg = function(message) {

  setUserOrigin(message.loginService)
    .then(function() {

      var date = new Date();
      var dateToISO = date.toISOString();

      userDataOrigin.update(
        {'chatLogs.username': message.friendName },
        {'$push': {
          'chatLogs.$.chatLog': { 'userID' : message.userDbId, 'message' : message.message, 'timeAdded' : dateToISO }
        }},

        function(error, numAffected) {

          if(error) {
            console.log('wystapil blad przy pushu nowej wiadomosci');
              console.log(error);
          }

          console.log(numAffected);

          if(!numAffected) {
            console.log('nima sukces');
          }
        }
      );


      function setFriendDataOrigin() {

        var deferred = q.defer();

        if(message.friendName.indexOf('@') !== -1) {
          friendDataOrigin = require('../../global/models/fbUserData');
          console.log('ustawiam frienddataorigin na fb');
          deferred.resolve();
        } else {
          friendDataOrigin = require('../../global/models/jwtUserData');
          console.log('ustawiam frienddataorigin na jwt');
          deferred.resolve();
        }

        return deferred.promise;
      }

      setFriendDataOrigin()
        .then(function() {

          friendDataOrigin.update(
            {'chatLogs.username': message.ownUsername },
            {'$push': {
              'chatLogs.$.chatLog': { 'userID' : message.userDbId, 'message' : message.message, 'timeAdded' : dateToISO }
            }},

            function(error, numAffected) {

              if(error) {
               console.log('wystapil blad przy pushu nowej wiadomosci');
                console.log(error);
              }

              if(numAffected) {
                console.log(numAffected);
              }

              if(!numAffected) {
                console.log('nima sukces');
              }
            }

          )
        })
    })


};
