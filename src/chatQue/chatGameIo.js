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

  socket.on('get first questions', function(data) {

    quizGameServices.bringQuestion(data.category, data.questions)
      .then(function(questionsData) {
        socket.emit('first questions data', questionsData);
      })

  });

  socket.on('answer', function(typeOfAnswer, category, username, quizID, i) {
    quizGameServices.updateGivenAnswer(typeOfAnswer, category, username, quizID, i)
  });


  socket.on('category results', function(username, opponentData, myAnswers) {

    socket.broadcast.emit(opponentData.userDbId + ' - opponent category results', myAnswers);

  });


  socket.on('add me to draws', function(quizID, userDbId, usedCategories) {

    quizDrawServices.addMeToDraw(quizID, userDbId, usedCategories)
      .then(function() {
        console.log('niby dodany do draws');
      });

  });

  socket.on('new rolled category', function(quizData, rolledCategory) {
    socket.broadcast.emit(quizData[0].userDbId + ' - rolled category from draw', rolledCategory);
    socket.broadcast.emit(quizData[1].userDbId + ' - rolled category from draw', rolledCategory);
  })

});






