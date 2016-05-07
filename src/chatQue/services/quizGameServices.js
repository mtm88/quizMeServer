var quizCategoriesModel = require('../models/quizCategoriesModel');
var quizQuestionsModel = require('../models/quizQuestionsModel');
var q = require('q');

exports.rollQuestions = function(category) {

  var deferred = q.defer();

  quizQuestionsModel.find(
    { 'category' : category },
    function(error, foundQuestions) {
      if(error) throw error;

      if(foundQuestions) {

        console.log('Found questions in this category: %s', foundQuestions.length);

        var alreadyChosenQuestions = [];

        for( i = 0 ; i < 3 ; i++) {

          console.log('i: ' + i);

        var rolledQuestionNumber = rollQuestion();

          console.log('jestem poza while');

        alreadyChosenQuestions.push(rolledQuestionNumber);

        console.log(alreadyChosenQuestions);

        }

        deferred.resolve();

        function rollQuestion() {

          var rolledQuestionNumber = Math.floor(Math.random() * foundQuestions.length);
          console.log('ROLLED QUESTION NUMBER: %s', rolledQuestionNumber);
          if(alreadyChosenQuestions.indexOf(rolledQuestionNumber)) {
            rollQuestion();
          }
          else {
            return rolledQuestionNumber;
          }

        }

      }



    }
  );



  return deferred.promise;

};


