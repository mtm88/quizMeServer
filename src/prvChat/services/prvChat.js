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

               /*  userDataOrigin.aggregate(

                   [
                     { $match : { username : "gerion" }}, { $project : { chatLogs : { $size : '$chatLogs' }}}

                   ]

                 ).exec(function(error, success) {
                     if(error) console.log('blad');

                     console.log(success);
                   }); */

                 userDataOrigin.aggregate( [
                   { $match : { "_id" : { $in: [ mongoose.Types.ObjectId(req.body.userDbId) ] }  } },
                   { $unwind : '$chatLogs' },
                   { $match : { 'chatLogs.username' : req.body.friendName }},
                   { $unwind : '$chatLogs.chatLog'},
                   { $group : {_id : '$_id', chatLog : { $push : '$chatLogs.chatLog' }}}
                 ] )
                   .exec(function(error, success) {
                     if(error) console.log(error);

                     if(success) {
                       res.send(success);
                     }

                   })



               }

             }

           )

        })

    };
