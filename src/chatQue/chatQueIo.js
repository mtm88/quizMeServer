var quizQueServices = require('./services/quizQueServices');
var quizDataServices = require('./services/quizDataServices');

var express = require('express');
var app = express();
var quizQue = require('http').Server(app);

quizQue.listen(5003, function() {
  console.log('Quiz Que server is now running at port 5003');
});

var matchedPlayers = '';

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

    matchedPlayers = userInfo;

    console.log('tu jestem 1');

    socket.broadcast.emit(userInfo.playerOne.userDbId + ' - opponent found', { 'matchFound' : true });
    socket.broadcast.emit(userInfo.playerTwo.userDbId + ' - opponent found', { 'matchFound' : true });

  });

  socket.on('quizPrepared', function(userInfo) {

    socket.broadcast.emit(userInfo.playerOne.userDbId + ' - quiz prepared', { 'quizPrepared' : true });
    socket.broadcast.emit(userInfo.playerTwo.userDbId + ' - quiz prepared', { 'quizPrepared' : true });

  });

  socket.on('discardQuiz', function(userInfo) {

    console.log(matchedPlayers);
    var opponentArrayPosition = '';

    if(matchedPlayers.playerOne.username == userInfo)
      opponentArrayPosition = matchedPlayers.playerTwo.username;
    else
      opponentArrayPosition = matchedPlayers.playerOne.username;

    quizDataServices.discardQuiz(userInfo)
      .then(function(response) {
        socket.broadcast.emit(opponentArrayPosition + ' - opponent resigned', { 'opponentResigned' : true });
        socket.emit('quizDiscarded', response);
      })

  });

  socket.on('user accepted quiz', function(userUsername) {
    quizDataServices.userAcceptedQuiz(userUsername)
      .then(function(response) {

          socket.emit(userUsername + ' - user accepted quiz', response);

      })
  });

  socket.on('readyGameData', function(readyGameData) {

    socket.broadcast.emit(readyGameData.allQuizData.players[0].userDbId + ' - readyToLoadGame',
      { 'readyToLoadGame' : true, 'gameData' : readyGameData.allQuizData, 'firstCategory' : readyGameData.firstCategory, 'questions' : readyGameData.questions });
    socket.broadcast.emit(readyGameData.allQuizData.players[1].userDbId + ' - readyToLoadGame',
      { 'readyToLoadGame' : true, 'gameData' : readyGameData.allQuizData, 'firstCategory' : readyGameData.firstCategory, 'questions' : readyGameData.questions });

  })



});






