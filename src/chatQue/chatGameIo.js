var quizGameServices = require('./services/quizGameServices');
var quizDataServices = require('./services/quizDataServices');

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

  socket.on('get first questions', function(data) {

    quizGameServices.bringQuestion(data.category, data.questions)
      .then(function(questionsData) {
        socket.emit('first questions data', questionsData);
      })

  });

  socket.on('answer', function(typeOfAnswer, category, username, quizID, i) {

    quizGameServices.updateGivenAnswer(typeOfAnswer, category, username, quizID, i)
      .then(function() {



      })

  });

});






