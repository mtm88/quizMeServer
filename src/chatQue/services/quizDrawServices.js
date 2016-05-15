var quizDrawModel = require('../models/quizDrawModel');
var q = require('q');


exports.addMeToDraw = function(quizID, userDbId, usedCategories) {

  quizDrawModel.update(

    { 'quizID' : quizID },
    { $push : {
      'players': { 'userDbId': userDbId }
      },
      $set : {
        'usedCategories' : usedCategories
      }
    },

    { upsert : true, returnNewDocument : true },

    function(error) {
      if(error) { console.log('blad przy dodawaniu usera do DrawData: '); console.log(error); }

    }
  );

};


exports.lookForDraws = function() {

  var deferred = q.defer();

  quizDrawModel.find(
    {},
    function(error, gamesWithDraw) {
      if(error) throw error;

      if(gamesWithDraw) {
        deferred.resolve(gamesWithDraw);
      }
    }
  );
  return deferred.promise;
};

exports.removeDrawData = function(quizID) {

  var deferred = q.defer();

quizDrawModel.findOne(

  { quizID : quizID },

  function(error, foundDraw) {

    if(error) { console.log('blad przy usuwaniu usera z que'); console.log(error); }

    if(foundDraw) {

      foundDraw.remove();
      deferred.resolve();
    }
  }
);

  return deferred.promise;

};
