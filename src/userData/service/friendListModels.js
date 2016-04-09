var onlineStatus = require('../models/onlineStatus');

var q = require('q');


exports.setOnlineStatus = function(req, res) {

  onlineStatus.findOneAndUpdate(

    { 'userDbId' : req.body.userDbId },

    {
      'Online' : req.body.status
    },

    function(err, statusResponse) {

      if(err) throw err;

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
    userDataOrigin = require('../models/fbUserData');
  else if(req.body.loginService == 'jwt')
    userDataOrigin = require('../models/jwtUserData');

    deferred.resolve(userDataOrigin);

    return deferred.promise;

  }


  userDataOrigin.findOne (

    { '_id' : req.body.userDbId },

    function(err, userInfo) {

      if(err) throw err;

      else if(!userInfo) {
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
                    friendsArray.push({ username : friendResult[i]._id.username, userStatus : user.Online });
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

              res.json({ userExists : true, friendList: friendsArray });

            })



          });

        });


      }

    }



  )

};


