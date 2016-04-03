var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var express = require('express');
var app = express();

var jwt = require('jsonwebtoken');

var secret = 'dupabizona';
app.set('pmSecret', secret);

var userSchema = new Schema ({

    userID: String,
    userEmail: String,
    userFirstName: String,
    userLastName: String,
    userGender: String,
    userAgeRange: String,
    FBtoken: String,
    userOrigin: String

});

var jwtUserSchema = new Schema ({

  username: String,
  password: String,
  jwtToken: String

});

var userData = mongoose.model('User', userSchema);
var jwtUserData = mongoose.model('jwtUser', jwtUserSchema);


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
console.log(req.body);
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
          res.json({ userExists : true, message : "Wrong password"});
        } else {

          var token = jwt.sign(userInfo, app.get('pmSecret'), {
            expiresIn: 86400
          });

          userInfo.jwtToken = token;
          userInfo.save();

      res.json({ userExists : true, username : userInfo.username, userToken : token, message : "uzytkownik istnieje, haslo sie zgadza" });
        }
      }


  })

};


exports.fbUserInfo = function(req, res) {

   userData.findOneAndUpdate(

     // find this ->
     { 'userID' : req.body.data.id },

     // do updates
     {
       'userID' : req.body.data.id,
       'userEmail' : req.body.data.email,
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

       res.send(success);

     }
   );


};
