var quizGameServices = require('./services/quizGameServices');
var quizDataServices = require('./services/quizDataServices');
var quizDrawServices = require('./services/quizDrawServices');



var express = require('express');
var app = express();
var quizGame = require('http').Server(app);

quizGame.listen(5004, function() {
  console.log('Quiz GAME server is now running at port 5004');
});

var io = require('socket.io')(quizGame);

io.on('connect_error', function(data) {
  console.log(' Quiz Game backend blad connect error');
  console.log(data);
});


io.on('connection', function (socket) {

  //console.log('User connected to Quiz GAME IO');

  socket.on('get questions', function(data) {
    quizGameServices.bringQuestions(data.category, data.questions, data.quizData)
      .then(function(questionsData) {

        for( i = 0 ; i < 2 ; i++ ) {
        console.log('emitting: i = ' + i + ', to user: ' + questionsData[1].players[i].userDbId);
        socket.broadcast.emit(questionsData[1].players[i].userDbId + ' - new questions data', questionsData[0], data.category);
        }

      })

  });

  socket.on('answer', function(typeOfAnswer, category, username, quizID, i) {
    quizGameServices.updateGivenAnswer(typeOfAnswer, category, username, quizID, i)
  });


  socket.on('category results', function(userDbId, quizData, myAnswers, category) {

    checkForOpponentAnswers();

    function checkForOpponentAnswers() {

      quizGameServices.checkOpponentAnswers(userDbId, quizData, myAnswers, category)
       .then(function(data) {

        if(data.length < 3) {

            console.log('nie ma jeszcze wszystkich odpowiedzi przeciwnika, czekam 1s');

         setTimeout(function() {
           checkForOpponentAnswers();
         }, 1000);
        }

         else {
          socket.emit(userDbId + ' - opponent category results', data);
        }

       });

    }

  });

  socket.on('add me to draws', function(quizID, userDbId, usedCategories) {
    console.log('adding ' + userDbId + ' to draws!');
    quizDrawServices.addMeToDraw(quizID, userDbId, usedCategories);

  });


  socket.on('get quiz results', function(quizID, userDbId) {
    quizGameServices.getQuizResults(quizID, userDbId)
      .then(function(answersArray) {

        console.log(answersArray);
        socket.emit('final quiz results', answersArray);

      })
  });


  socket.on('bring categories to choose', function(usedCategories, quizID) {

    var i = 0;
    var temporaryModifiedArray = usedCategories;
    var preparedCategories = [];

    prepareArray(i);

    function prepareArray(i) {

      if(i < 3) {

        quizDataServices.getNewCategory(quizID, temporaryModifiedArray)
           .then(function(newRolledCategory) {
              console.log('dodaje ' + newRolledCategory + ' do tymczasowego arraya');
              preparedCategories.push(newRolledCategory);
              temporaryModifiedArray.push(newRolledCategory);
              i++;
              prepareArray(i);
           })

       }

       else {
        socket.emit('prepared categories after loss', preparedCategories);
       }

    }      
  });



  socket.on('chosen category after loss', function(chosenCategory, quizData, categoriesToChoose) {

    console.log('wybrana kategoria: ' + chosenCategory);


       quizGameServices.removeNotChosen(chosenCategory, categoriesToChoose, quizData.quizID);
       
       quizGameServices.rollQuestions(chosenCategory, quizData.quizID)
                .then(function(questionNumbers) {
                  
                  console.log('wylosowane pytania: ' + questionNumbers);

                  quizGameServices.bringQuestions(chosenCategory, questionNumbers, quizData)
                        .then(function(questionsData) {

                          console.log('dane pytan: ');
                          console.log(questionsData);

                          for( i = 0 ; i < 2 ; i++ ) {
                          console.log('emitting: i = ' + i + ', to user: ' + quizData.players[i].userDbId);
                          io.emit(quizData.players[i].userDbId + ' - new questions data', questionsData[0], chosenCategory);
                          }


                        })

                });

    });


  socket.on('move quiz to archive', function(quizID) {
    console.log('odebralem request o przeniesienie do archiwum');
    quizGameServices.moveToArchive(quizID);
  })




});

    






