var quizDataModel = require('../models/quizDataModel');
var q = require('q');


exports.fromQueToQuizData = function(chosenPlayers) {


    var deferred = q.defer();

    var quizID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);

    var Quiz = new quizDataModel({

      quizID : quizID,
      players : [

        {
          'username' : chosenPlayers.playerOne.username,
          'userDbId' : chosenPlayers.playerOne.userDbId,
          'difficulty' : chosenPlayers.playerOne.difficulty
        },
        {
          'username' : chosenPlayers.playerTwo.username,
          'userDbId' : chosenPlayers.playerTwo.userDbId,
          'difficulty' : chosenPlayers.playerTwo.difficulty
        }

      ]

    });

  Quiz.save(function(error) {
        if(error) { console.log('blad przy dodawaniu usera w quizData: '); console.log(error); deferred.reject({ 'userAddedToQue' : false }) }

        console.log('niby save');
        deferred.resolve({ 'userAddedToQuizData' : true });
      }
    );

    return deferred.promise;

};

exports.discardQuiz = function(userInfo) {

  var deferred = q.defer();

  quizDataModel.findOne(
    { 'players.username' : userInfo },
    function(err, userData) {

      if(userData.players.length == 1) {

        userData.remove(function(err) {
          if(err) { console.log('blad przy usuwaniu ostatniego gracza w quizData'); console.log(err); deferred.reject(error); }

          deferred.resolve({ 'userRemovedTogetherWithQuiz' : true })
        })
      }

      else {

        quizDataModel.update(

          { 'players.username' : userInfo },

          { $pull : {
            'players' : { username : userInfo }
          }
          },

          function(error, userInData) {

            if(error) { console.log('blad przy usuwaniu usera z quizData'); console.log(error); deferred.reject(error); }

            if(userInData) {
              deferred.resolve({ 'userRemovedFromQuizData' : true })
            }

          });
      }
    }
  );

  return deferred.promise;

};



exports.userAcceptedQuiz = function(userUsername) {


  var deferred = q.defer();

  quizDataModel.update(

    { 'players.username' : userUsername },

    { $set : {
      'players.$.acceptedQuiz' : true
    }
    },

    function(error, numAffected) {

      if(error) { console.log('blad przy usuwaniu usera z quizData'); console.log(error); deferred.reject(error); }

      if(numAffected) {
        console.log(numAffected);

        quizDataModel.find(
          { 'players.username' : userUsername },
          function(error, playersInfo) {
            if(error) throw error;

            if(playersInfo) {

              if(playersInfo[0].players[0].acceptedQuiz == true && playersInfo[0].players[1].acceptedQuiz == true)
              {
                deferred.resolve({ 'userAcceptedQuiz' : true, 'opponentAcceptedQuiz' : true });
              }

              else {
                deferred.resolve({ 'userAcceptedQuiz' : true, 'opponentAcceptedQuiz' : false });
              }

            }

          }
        )

      }

    });

  return deferred.promise;

};
