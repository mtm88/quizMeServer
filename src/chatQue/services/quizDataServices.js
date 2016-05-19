var quizDataModel = require('../models/quizDataModel');
var quizCategoriesModel = require('../models/quizCategoriesModel');
var q = require('q');


exports.fromQueToQuizData = function(chosenPlayers) {

    var deferred = q.defer();

    var quizID = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);

    var Quiz = new quizDataModel({

      quizID : quizID,
      quizStarted : false,
      quizData: [],
      players : [

        {
          'username' : chosenPlayers.playerOne.username,
          'userDbId' : chosenPlayers.playerOne.userDbId,
          'difficulty' : chosenPlayers.playerOne.difficulty,
          'answers' : []
        },
        {
          'username' : chosenPlayers.playerTwo.username,
          'userDbId' : chosenPlayers.playerTwo.userDbId,
          'difficulty' : chosenPlayers.playerTwo.difficulty,
          'answers' : []
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
        //console.log(numAffected);
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

      rollCategory(quizID)
        .then(function(dataFromRollCategory) {
      deferred.resolve({ 'setAsStarted' : true, 'firstCategory' : dataFromRollCategory.foundCategories[dataFromRollCategory.rolledCategoryNumber].category });
        })

    }

  );

  return deferred.promise;


};

exports.getNewCategory = function(quizID, usedCategories) {

  var deferred = q.defer();

  rollCategory(quizID, usedCategories)
    .then(function(rolledCategory) {
      var categoryData = rolledCategory.foundCategories[rolledCategory.rolledCategoryNumber];
      deferred.resolve(categoryData);
    });

  return deferred.promise;
};


function rollCategory(quizID, usedCategories) {

  var deferredCategory = q.defer();

    quizCategoriesModel.find(
      {},
      function(error, foundCategoriesData) {

        if(error) { console.log('blad przy roll category'); console.log(error); }

        var rolledCategoryNumber = '';

        var arrayOfFoundCategories = [];

        for( i = 0 ; i < foundCategoriesData.length ; i++ ) {
          arrayOfFoundCategories.push(foundCategoriesData[i].category);
        }


        if(usedCategories) {

          console.log('foundCategories przed cieciem: ' + arrayOfFoundCategories.length);

          for( i = 0 ; i < usedCategories.length ; i++) {

            var usedCategoryPosition = arrayOfFoundCategories.indexOf(usedCategories[i]);
            console.log('used category position: ' + usedCategoryPosition);
            console.log('wyciagam z arraya: ' + arrayOfFoundCategories[usedCategoryPosition]);
            arrayOfFoundCategories.splice(usedCategoryPosition, 1);

          }

          console.log('foundCategories po cieciu: ' + arrayOfFoundCategories.length);

          rolledCategoryNumber = Math.floor(Math.random() * arrayOfFoundCategories.length);

          console.log('wylosowana kategoria: ' + arrayOfFoundCategories[rolledCategoryNumber]);

          quizDataModel.update(
            { 'quizID' : quizID },

            { $push : {
              'quizData' : { 'category' : arrayOfFoundCategories[rolledCategoryNumber], 'questions' : [] }
            }
            },

            function(error) {

              if(error) { console.log('blad przy dodawaniu kategorii'); console.log(error); }

              deferredCategory.resolve({ 'foundCategories' : arrayOfFoundCategories, 'rolledCategoryNumber' : rolledCategoryNumber});

            }
          );



        }

        else {

          rolledCategoryNumber = Math.floor(Math.random() * foundCategoriesData.length);
          console.log('pierwsza wylosowana kategoria: ' + rolledCategoryNumber + foundCategoriesData[rolledCategoryNumber].category);

          quizDataModel.update(
            { 'quizID' : quizID },

            { $push : {
              'quizData' : { 'category' : foundCategoriesData[rolledCategoryNumber].category, 'questions' : [] }
            }
            },

            function(error) {

              if(error) { console.log('blad przy dodawaniu kategorii'); console.log(error); }

              deferredCategory.resolve({ 'foundCategories' : foundCategoriesData, 'rolledCategoryNumber' : rolledCategoryNumber});

            }
          );
        
        }

      }

    );

  return deferredCategory.promise;

}
