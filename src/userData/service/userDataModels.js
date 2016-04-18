var onlineStatus = require('../../friendList/models/onlineStatus');
var jwtUserData = require('../../global/models/jwtUserData');
var fbUserData = require('../../global/models/fbUserData');

var express = require('express');
var app = express();

var jwt = require('jsonwebtoken');

var secret = 'dupabizona';
app.set('pmSecret', secret);


exports.registerNewUser = function(req, res) {

  var token = jwt.sign(req.body.newUserData.username, app.get('pmSecret'), {
    expiresIn: 86400
  });

  console.log(req.body);

  var newUser = new jwtUserData ({
    username: req.body.newUserData.username,
    password: req.body.newUserData.password,
    jwtToken: token
  });

  newUser.save(function(err) {
    if(err) throw err;

    res.json({ username : req.body.newUserData.username, userToken : token, success : true });
  });

};

exports.checkUsernameAvailability = function(req, res) {

  jwtUserData.findOne({
    username: req.body.username
  }, function(error, userInfo) {

    if(error) throw error;

    if(!userInfo) {
      res.json({ searchedUser : req.body.username, exists: false })
    } else if(userInfo) {
      res.json({ searchedUser : req.body.username, exists: true })
    }

  })

};

exports.jwtUserLogin = function(req, res) {

  jwtUserData.findOne({
    username: req.body.data.username
  }, function(error, userInfo) {

    if(error) throw error;

    if(!userInfo) {
      console.log("uzytkownik nie istnieje");
      res.json({ userExists : false, message : "User doesn't exist" });
    } else if(userInfo) {

        if(userInfo.password != req.body.data.password) {
          res.json({ wrongPassword : true, message : "Wrong password"});
        } else {

          var userFilteredData = { 'username' : userInfo.username, 'password' : userInfo.password };

          var token = jwt.sign(userFilteredData, app.get('pmSecret'), {
            expiresIn: 86400
          });

          userInfo.jwtToken = token;
          userInfo.save();
          res.json({ userExists : true, username : userInfo.username, userToken : token, userDbId : userInfo._id, message : "uzytkownik istnieje, haslo sie zgadza" });

           onlineStatus.findOneAndUpdate(

            { 'userDbId' : userInfo._id },

            {
              'Online' : true,
              'userDbId' : userInfo._id
            },

            { upsert : true, returnNewDocument : true },

            function(err) {

              if(err) throw err;

            }
          )
        }
      }

  })

};


exports.fbUserInfo = function(req, res) {

   fbUserData.findOneAndUpdate(

     // find this ->
     { 'userID' : req.body.data.id },

     // do updates
     {
       'userID' : req.body.data.id,
       'username' : req.body.data.email,
       'userFirstName' : req.body.data.first_name,
       'userLastName' : req.body.data.last_name,
       'userGender' : req.body.data.gender,
       'userAgeRange' : req.body.data.age_range.min,
       'FBtoken' : req.body.token_fb,
       'userOrigin' : req.body.userOrigin
     },

     //options
     { upsert: true, returnNewDocument: false },
     function(err, success) {

       if(err) console.log("Blad: %s", err);

       else {

         onlineStatus.findOneAndUpdate(

           { 'userDbId' : success._id },

           {
             'Online' : true,
             'userDbId' : success._id
           },

           { upsert : true, returnNewDocument : true },

           function(err) {

             if(err) throw err;

           }

         )

       }

       res.send(success);

     }
   );


};
