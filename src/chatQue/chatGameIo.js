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

   quizGameServices.checkOpponentAnswers(userDbId, quizData, myAnswers, category)
     .then(function(data) {
       socket.emit(userDbId + ' - opponent category results', data);
     });



  });


  socket.on('add me to draws', function(quizID, userDbId, usedCategories) {
    console.log('adding ' + userDbId + ' to draws!');
    quizDrawServices.addMeToDraw(quizID, userDbId, usedCategories);

  });


});






