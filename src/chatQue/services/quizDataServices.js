var quizDataModel = require('../models/quizDataModel');
var q = require('q');


exports.fromQueToQuizData = function(chosenPlayers) {


    var deferred = q.defer();

    var quizID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);

    var Quiz = new quizDataModel({

      quizID : quizID,
      quizStarted : false,
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

        userData.remove(function(err) {
          if(err) { console.log('blad przy usuwaniu gracza w quizData'); console.log(err); deferred.reject(error); }

          deferred.resolve({ 'userRemovedTogetherWithQuiz' : true })
        })


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
        deferred.resolve({ 'userAcceptedQuiz' : true });
      }

    });

  return deferred.promise;

};


exports.lookForPreparedGames = function() {

  var deferred = q.defer();

  quizDataModel.find(
    { 'players.0.acceptedQuiz' : true, 'players.1.acceptedQuiz' : true, 'quizStarted' : false },
    function(error, allQuizData) {

      if(error) throw error;

      deferred.resolve(allQuizData);
    }

  );

  return deferred.promise;

};

exports.setAsStarted = function(quizID) {

  var deferred = q.defer();

  quizDataModel.update(
    { 'quizID' : quizID },

    { $set : {
      'quizStarted' : true
      }
    },

    function(error) {

      if(error) throw error;

      deferred.resolve({ 'setAsStarted' : true });

    }

  );

  return deferred.promise;


};
