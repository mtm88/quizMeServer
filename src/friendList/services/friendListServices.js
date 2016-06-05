var onlineStatus = require('../models/onlineStatus');
var mongoose = require('mongoose');

var q = require('q');

var searchedFriendDataOrigin;
var userDataOrigin;

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

exports.acceptInvite = function(req, res) {

  setUserOrigin(req.body.loginService)
    .then(function(userDataOrigin) {

      userDataOrigin.findOneAndUpdate(

        { '_id' : req.body.userDbId },

            { $push  : {
              'friends' : { 'username' : req.body.chosenUserData.username, 'userDbId' : req.body.chosenUserData.userDbId },
              'chatLogs' : { 'username' : req.body.chosenUserData.username, 'chatLog' : [] }
            }
        },

        function(error, acceptingUserInfo) {

          if(error) {
            console.log('blad przy dodawaniu znajomego');
            res.json({ friendAdded : false, friendRequestRemoved : false })
          }

          if(acceptingUserInfo) {

            userDataOrigin.update(

              { '_id' : req.body.userDbId },

              { $pull : { receivedInvites :  { userDbId : req.body.chosenUserData.userDbId } } },

              function(error, userInfo) {

                if(error) {
                  console.log('blad przy usuwaniu receivedInvite');
                  res.json({ friendAdded : true, friendRequestRemoved : false })
                }

                if(userInfo) {

                  console.log(userInfo);
                  var friendDataOrigin = null;

                  setFriendDataOrigin();

                  function setFriendDataOrigin() {

                    var deferred = q.defer();

                  if(req.body.chosenUserData.username.indexOf('@') !== -1) {
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


                  friendDataOrigin.findOneAndUpdate (

                    { '_id' : req.body.chosenUserData.userDbId },

                    {
                      $push: {
                        'friends': {'username': acceptingUserInfo.username, 'userDbId': req.body.userDbId},
                        'chatLogs': { 'username' : acceptingUserInfo.username, 'chatLog': [] }
                      }
                    },

                      function(error, success) {

                        if(error) console.log('blad przy dodawaniu znajomego po drugiej stronie');

                        if(success) {

                          friendDataOrigin.update (

                            { '_id' : req.body.chosenUserData.userDbId },

                            { $pull : { sentInvites :  { userDbId : req.body.userDbId } } },

                            function(error, success) {

                              if(error) console.log('blad przy usuwaniu sentInvite po drugiej stronie');

                              if(success)
                                res.json({ friendAdded : true, friendRequestRemoved : true, friendAdded2ndSide : true, sentInviteRemoved2ndSide : true })

                            }
                          )
                        }
                      }
                  );

                }
              }

            )

          }

        }

      )

    });

};

exports.sendInvite = function(req, res) {

  if(req.body.chosenUserData.friendUsername.indexOf('@') !== -1)
    searchedFriendDataOrigin = require('../../global/models/fbUserData');
  else
    searchedFriendDataOrigin = require('../../global/models/jwtUserData');

  if(req.body.loginService == 'fb')
    userDataOrigin = require('../../global/models/fbUserData');
  else
    userDataOrigin = require('../../global/models/jwtUserData');


  var currentTime = new Date();



  // WYSLIJ REQUEST DO WYBRANEGO ZNAJOMEGO
  console.log(req.body);

  searchedFriendDataOrigin.findOneAndUpdate(

    { 'username' : req.body.chosenUserData.friendUsername },

    { $push: {
      "receivedInvites" : { userDbId : req.body.sendingUserDbId, username : req.body.sendingUsername, timeSent : currentTime }
      }
    },

    function(err, searchedFriendData) {
      if(err) throw err;

      console.log(searchedFriendData);

      // JESLI UDALO SIE WYSLAC REQUEST DO ZNAJOMEGO DODAJ TA INFORMACJE W PROFILU UZYTKOWNIKA BY NIE MOGL WYSLAC GO DRUGI RAZ
      userDataOrigin.findOneAndUpdate(

        { '_id' : req.body.sendingUserDbId },

          { $push: {
            "sentInvites" : { userDbId : searchedFriendData._id, username : req.body.chosenUserData.friendUsername, timeSent : currentTime }
            }
        },

        function(err) {
          if(err) throw err;

          res.json({ 'success' : true })

        }
      );
    }
  );
};


exports.friendFinder = function(req, res) {

  var friendDataOrigin = null;

  checkIfEmail();

  function checkIfEmail() {

    var deferred = q.defer();

    if(req.body.friendUsername.indexOf('@') !== -1) {
      friendDataOrigin = require('../../global/models/fbUserData');
      deferred.resolve();
    } else {
      friendDataOrigin = require('../../global/models/jwtUserData');
      deferred.resolve();
    }


    return deferred.promise;

  }

  friendDataOrigin.findOne(

    { 'username' : req.body.friendUsername },

    function(err, friendInfo) {

      if(err) throw err;

      if(!friendInfo) {
        res.json({ friendExists : 'no' });
      }

      else {

        var filteredFriendInfo = {

          'username' : friendInfo.username,
          '_id' : friendInfo._id


        };

         // SPRAWDZ CZY WYSZUKIWANY UZYTKOWNIK MIAL JUZ WYSLANE ZAPROSZENIE PRZEZ TEGO UZYTKOWNIKA

        var loggedUserDataOrigin;

        setRightRequire();

        function setRightRequire() {

          var deferred = q.defer();

        if(req.body.loginService == 'fb'){
          loggedUserDataOrigin = require('../../global/models/fbUserData');
          deferred.resolve(loggedUserDataOrigin);
        }
        else {
          loggedUserDataOrigin = require('../../global/models/jwtUserData');
          deferred.resolve(loggedUserDataOrigin);
        }

        return deferred.promise;

        }


        loggedUserDataOrigin.aggregate(

          [
            { "$match" : { "_id" : { $in: [ mongoose.Types.ObjectId(req.body.userDbId) ] }  } },

            { "$unwind" : "$sentInvites" },

            { "$group" : {
              "_id" : "$_id",
              "count" : { "$sum" : 1 }
              }
            }
          ]

        ).exec(function(err, countResults) {
          console.log(countResults);
          if (err) console.log('CountResult error, ' + err);



          else if(countResults[0]) {

              loggedUserDataOrigin.aggregate(
                [
                  { "$match": { "_id" : { $in: [ mongoose.Types.ObjectId(req.body.userDbId) ] } } },

                  { "$unwind": "$sentInvites" },

                  {
                    "$group": {
                      "_id": "$sentInvites"
                    }
                  }
                ]
              ).exec(function (err, sentInvite) {

                var requestAlreadySent = false;

                if (err) console.log('sentInvite error, ' + err);

                for( i = 0; i < countResults[0].count; i++) {

                  if(sentInvite[i]._id.userDbId == friendInfo._id) {
                    requestAlreadySent = true;
                  }

                }

                res.json({ friendExists: 'yes', requestAlreadySent : requestAlreadySent, friendInfo : filteredFriendInfo });

              });
          }

          else {
            res.json({ friendExists: 'yes', requestAlreadySent : false, friendInfo : filteredFriendInfo });
          }

        });
      }
    }
  )

};


exports.setOnlineStatus = function(req, res) {

  console.log('tu jestem');

  onlineStatus.findOneAndUpdate(

    { 'userDbId' : req.body.userDbId },

    {
      'Online' : req.body.status
    },

    { upsert : true, returnNewDocument : true },

    function(err) {

      if(err) throw err;

      console.log('niby dodalem w statusach');

      res.json({ 'Online status updated to' : req.body.status })

    }
  )
};


exports.getFriendlist = function(req, res) {

  var friendsArray = [];
  var userDataOrigin = null;

  setUserDataOrigin();

  function setUserDataOrigin() {

    var deferred = q.defer();

  if(req.body.loginService == 'fb')
    userDataOrigin = require('../../global/models/fbUserData');
  else if(req.body.loginService == 'jwt')
    userDataOrigin = require('../../global/models/jwtUserData');

    deferred.resolve(userDataOrigin);

    return deferred.promise;

  }




  userDataOrigin.findOne (

    { '_id' : req.body.userDbId },

    function(err, userInfo) {

      if(err) throw err;

      else if(!userInfo) {
        console.log(userInfo);
        res.json({ 'Error message' : 'Unable to find user' });
      }

      else {

          userDataOrigin.aggregate(

          [
            { "$match" : { "username" : userInfo.username }},

            { "$unwind" : "$friends" },

            { "$group" : {
                  "_id" : "$username",
                  "count" : { "$sum" : 1 }
                  }
            }
          ]

        ).exec(function(err, countResult) {

          if(err) throw err;

            else if(countResult[0]) {

                userDataOrigin.aggregate(

                  [
                    { "$match" : { "username" : userInfo.username }},

                    { "$unwind" : "$friends" },

                    { "$group" : {
                      "_id" : "$friends"
                    } }
                  ]

                ).exec(function(err, friendResult) {

                  if(err) throw err;


                  function asyncLoop( i, callback ) {

                    if ( i < countResult[0].count ) {

                      onlineStatus.findOneQ( { 'userDbId' : friendResult[i]._id.userDbId } )
                        .then( function(user) {
                          friendsArray.push({ userDbId : friendResult[i]._id.userDbId, username : friendResult[i]._id.username, userStatus : user.Online });
                          asyncLoop( i+1, callback );
                        })
                        .catch(function(err) {
                          console.log(err);
                        })
                        .done();

                    }

                    else {
                      callback();
                    }

                  }

                  asyncLoop( 0, function() {

                    res.json({ userExists : true, friendList: friendsArray, receivedInvites : userInfo.receivedInvites, username : userInfo.username });

                  })

                });

          }

            else {
            res.json({ userExists : true, username : userInfo.username, receivedInvites : userInfo.receivedInvites });
          }

        });


      }

    }



  )

};


