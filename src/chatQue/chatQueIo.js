var quizQueServices = require('./services/quizQueServices');

var express = require('express');
var app = express();
var quizQue = require('http').Server(app);

quizQue.listen(5003, function() {
  console.log('Quiz Que server is now running at port 5003');
});

var io = require('socket.io')(quizQue);

io.on('connect_error', function(data) {
  console.log(' Quiz Que backend blad connect error');
  console.log(data);
});


io.on('connection', function (socket) {


  console.log('User connected to Quiz Que IO');

  socket.on('addUsertoQue', function(userData) {

    quizQueServices.addToQue(userData)
      .then(function(response) {
        socket.emit(userData.username + ' - user added to que', response);
      });

  });

  socket.on('removeUserFromQue', function(userData) {

    quizQueServices.removeFromQue(userData)
      .then(function(response) {
        socket.emit(userData.username + ' - user removed from que', response);
      });

  });

  socket.on('playersFound', function(userInfo) {

    socket.broadcast.emit(userInfo.playerOne.userDbId + ' - opponent found', { 'matchFound' : true });
    socket.broadcast.emit(userInfo.playerTwo.userDbId + ' - opponent found', { 'matchFound' : true });

  });



});






