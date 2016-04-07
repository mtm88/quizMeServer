var onlineStatus = require('../models/onlineStatus');
var jwtUserData = require('../models/jwtUserData');

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


  jwtUserData.findOne (

    { '_id' : req.body.userDbId },

    function(err, userInfo) {

      if(err) throw err;

      else if(!userInfo) {
        res.json({ 'Error message' : 'Unable to find user' });
      }

      else {

        jwtUserData.aggregate(

          [

     //       { "$match" : { "_id" : req.body.userDbId }},

            { "$unwind" : "$friends" },


            { "$group" : {
                  "_id" : "$_id",
                  "count" : { "$sum" : 1 }
                  }

            }

          ]

        ).exec(function(e, d) {
          console.log(e);
          console.log(d)

        });



        res.json({ userExists : true, friendList: userInfo.friends });
      }

    }

  )

};


