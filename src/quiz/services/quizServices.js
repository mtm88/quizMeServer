var quizQueModel = require('../models/quizQueModel');


exports.addToQue = function(req, res) {


  quizQueModel.findOneAndUpdate(

    { 'username' : req.body.username },

    {

      'username' : req.body.username,
      'userDbId' : req.body.userDbId,
      'difficulty' : req.body.difficulty


    },

    { upsert : true, returnNewDocument : true },

    function(error, queInfo) {
      if(error) { console.log('blad przy wyszukiwaniu usera w Que: '); console.log(error); }

        res.send('user dodany do que');

    }


  );

};

exports.removeFromQue = function(req, res) {

  quizQueModel.findOne(

    { username : req.body.username },

    function(error, userInQue) {

      if(error) { console.log('blad przy usuwaniu usera z que'); console.log(error); }

      if(userInQue) {

        quizQueModel.remove(function(error) {

          if(!error)
            res.send('user usuniety z que');

        });


      }
    }


  )


};
