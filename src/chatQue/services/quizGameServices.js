var quizCategoriesModel = require('../models/quizCategoriesModel');
var quizQuestionsModel = require('../models/quizQuestionsModel');
var quizDataModel = require('../models/quizDataModel');
var quizArchiveModel = require('../models/quizArchiveModel');
var q = require('q');


exports.getQuizResults = function(quizID, userDbId) {

  var deferred = q.defer();

  var userPositionInArray = '';
  var firstPlayerResult = 0;
  var secondPlayerResult = 0;

  quizDataModel.find(
    { 'quizID' : quizID },
    function(error, foundQuiz) {
      if(error) throw error;

      if(foundQuiz) {

        if(foundQuiz[0].players[0].userDbId == userDbId)
          userPositionInArray = 1;
        else
          userPositionInArray = 2;

        for( i = 0 ; i < foundQuiz[0].players[0].answers.length ; i++ ) {
          if(foundQuiz[0].players[0].answers[i].answer == true)
            firstPlayerResult++;
        }

        for( i = 0 ; i < foundQuiz[0].players[1].answers.length ; i++ ) {
          if(foundQuiz[0].players[1].answers[i].answer == true)
            secondPlayerResult++;
        }

        deferred.resolve([userPositionInArray, firstPlayerResult, secondPlayerResult])
      }

    }
  );

  return deferred.promise;

};


exports.checkOpponentAnswers = function(userDbId, quizData, userAnswers, category) {

  var deferred = q.defer();

  var opponentNumberInArray = '';
  var opponentAnswers = [];
  var answer = '';

  quizDataModel.find(
    { quizID : quizData.quizID },
    function(error, data) {
      if(error) throw error;

      if(data) {
        //console.log(data);

        if(data[0].players[0].userDbId != userDbId) {
          opponentNumberInArray = 0;
        } else {
          opponentNumberInArray = 1;
        }

        for( i = 0 ; i < data[0].players[opponentNumberInArray].answers.length ; i++ ) {

          console.log('to co widzi system: ');
          console.log(data[0].players[opponentNumberInArray].answers[i].answer);

          if(data[0].players[opponentNumberInArray].answers[i].category == category) {           
            opponentAnswers.push({ 'correctAnswer' : data[0].players[opponentNumberInArray].answers[i].answer, 'question' : i+1 })
          }

        }

        deferred.resolve(opponentAnswers);
      }

      else {
        deferred.resolve(opponentAnswers);
      }
    }
  );

  return deferred.promise;

};

exports.updateGivenAnswer = function(typeOfAnswer, category, username, quizID, i) {

  var deferred = q.defer();

  quizDataModel.update(
    { 'quizID' : quizID, 'players.username' : username },
    {
      $push : {
        'players.$.answers' : { 'category' : category, 'questionNumber' : i, 'answer' : typeOfAnswer }
      }
    },

    function(error, numAffected) {
      if(error) throw error;

      //console.log(numAffected);
      deferred.resolve();
    }

  );

  return deferred.promise;

};


exports.bringQuestions = function(category, questionNumber, quizData) {

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

        //console.log(questionsData);
        deferred.resolve([questionsData, quizData]);

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

          //console.log('i: %s', i);

          if(i > 2) {
            updateDataModel(chosenQuestionsArray);
          }

          else {

          fillArray();

          function fillArray() {

           // console.log('jestem w fillArray');

            var rolledNumber = Math.floor(Math.random() * foundQuestions.length);

             //console.log(chosenQuestionsArray.indexOf(rolledNumber));

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



exports.removeNotChosen = function(chosenCategory, categoriesToChoose, quizID) {

  
  for( i = 0 ; i < categoriesToChoose.length ; i++ ) {

    if(categoriesToChoose[i] != chosenCategory) {

      quizDataModel.update(

        { 'quizID' : quizID },

        { $pull : { quizData : { category : categoriesToChoose[i] } } } ,

        function(error, success) {
          if(error) throw error;

          console.log(success);
          console.log('wyciagam nieuzyta kategorie');

        }
      )
    }
  }

};


exports.moveToArchive = function(quizID) {

  quizDataModel.find(
    { 'quizID' : quizID },

    function(error, quizFound) {
      if(error) throw error;

      if(quizFound.length > 0) {

        console.log(quizFound[0]);

        var quizToArchive = new quizArchiveModel ({

            quizID : quizFound[0].quizID,
            quizStarted : quizFound[0].quizStarted,
            quizData: quizFound[0].quizData,
            players : quizFound[0].players

        });

        quizToArchive.save(function(error) {
          if(error) console.log('blad przy zapisywaniu w archiwum');
        });

        quizFound[0].remove(function(error) {
          if(error) console.log('blad przy usuwaniu quizu z QuizData');
        });

      }

      else {
        console.log('Quiz propably already in archive');
      }
    }

  )

}


