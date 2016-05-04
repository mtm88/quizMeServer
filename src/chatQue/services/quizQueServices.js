var quizQueModel = require('../models/quizQueModel');
var q = require('q');



exports.matchPlayers = function() {

  var deferred = q.defer();

  quizQueModel.find(
    { 'difficulty' : 'regular' },

    function(error, players) {
      if(error) { console.log('blad przy dopasowywaniu graczy'); console.log(error); deferred.reject(error); }

      if(players.length >= 2) {
        var chosenPlayers = ({ 'playerOne' : players[0], 'playerTwo' : players[1] });
        deferred.resolve(chosenPlayers);
      }

      else {
        deferred.resolve({ 'notEnoughUsers' : true });
      }
    }
  );

  return deferred.promise;

};

exports.addToQue = function(userData) {


  var deferred = q.defer();

  quizQueModel.findOneAndUpdate(

    { 'username' : userData.username },

    {

      'username' : userData.username,
      'userDbId' : userData.userDbId,
      'difficulty' : userData.difficulty


    },

    { upsert : true, returnNewDocument : true },

    function(error) {
      if(error) { console.log('blad przy wyszukiwaniu usera w Que: '); console.log(error); deferred.reject({ 'userAddedToQue' : false }) }

        deferred.resolve({ 'userAddedToQue' : true });
    }
  );

  return deferred.promise;

};

exports.removeFromQue = function(userData) {

  var deferred = q.defer();

  quizQueModel.findOne(

    { username : userData.username },

    function(error, userInQue) {

      if(error) { console.log('blad przy usuwaniu usera z que'); console.log(error); deferred.reject(error); }

      if(userInQue) {

        userInQue.remove(function(error) {

          if(!error)
           deferred.resolve({ 'userRemovedFromQue' : true });

        });
      }
    }
  );

  return deferred.promise;

};

