var quizCategoriesModel = require('../models/quizCategoriesModel');
var quizQuestionsModel = require('../models/quizQuestionsModel');
var quizDataModel = require('../models/quizDataModel');
var q = require('q');



exports.updateGivenAnswer = function(typeOfAnswer, category, username, quizID, i) {

  quizDataModel.update(
    { 'quizID' : quizID, 'players.username' : username, 'players.answers.' },
    {
      $push : {
        'players.$.answers
      }
    }

  )



};


exports.bringQuestion = function(category, questionNumber) {

  var questionsData = [];

  var deferred = q.defer();

  quizQuestionsModel.find(
    { 'category' : category },
    function(error, results) {
      if(error) throw error;

      if(results) {

        for( i = 0 ; i < questionNumber.length ; i++ ) {

          questionsData.push(results[questionNumber[i]]);

        }

        console.log(questionsData);
        deferred.resolve(questionsData);

      }
    }
  );

  return deferred.promise;

};


exports.rollQuestions = function(category, quizID) {

  var deferred = q.defer();

  quizQuestionsModel.find(
    { 'category' : category },
    function(error, foundQuestions) {
      if(error) throw error;

      if(foundQuestions) {

        var chosenQuestionsArray = [];

        var i = 0;

        rollThreeQuestions(i);

        function rollThreeQuestions(i) {

          console.log('i: %s', i);

          if(i > 2) {
            updateDataModel(chosenQuestionsArray);
          }

          else {

          fillArray();

          function fillArray() {

           // console.log('jestem w fillArray');

            var rolledNumber = Math.floor(Math.random() * foundQuestions.length);

             console.log(chosenQuestionsArray.indexOf(rolledNumber));

             if((chosenQuestionsArray.indexOf(rolledNumber)) !== -1) {
                //console.log('ten numer jest juz w arrayu');
                fillArray();
              }

            else {
               //console.log('pushuje do arraya: %s', rolledNumber);
               i++;
               chosenQuestionsArray.push(rolledNumber);
               rollThreeQuestions(i);
              }
            }
          }
        }

       function updateDataModel(chosenQuestionsArray) {

        // console.log(chosenQuestionsArray);
        // console.log(quizID);
        // console.log(category);

        quizDataModel.update(
          { 'quizID' : quizID, 'quizData.category' : category },
          { $set : {
              'quizData.$.questions' : [ chosenQuestionsArray[0], chosenQuestionsArray[1], chosenQuestionsArray[2] ]
            }
          },
          function(error) {
            if(error) throw error;

            deferred.resolve(chosenQuestionsArray);

          }
        );
       }
      }
    }
  );

  return deferred.promise;

};


