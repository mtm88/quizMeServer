var quizQueServices = require('./services/quizQueServices');
var quizDataServices = require('./services/quizDataServices');
var chatQueIo = require('./chatQueIo');
var socket = require('socket.io-client')('http://192.168.0.6:5003');


lookforPlayers();


function lookforPlayers() {
  console.log('checking for matched players...');
  quizQueServices.matchPlayers()
    .then(function(chosenPlayers) {

      if(chosenPlayers.notEnoughUsers == true) {
        setTimeout(function() {
          lookforPlayers();
        }, 3000)
      }

      else {
        quizQueServices.removeFromQue(chosenPlayers.playerOne)
          .then(function() {
            quizQueServices.removeFromQue(chosenPlayers.playerTwo)
              .then(function() {

                quizDataServices.fromQueToQuizData(chosenPlayers)
                  .then(function(response) {
                    socket.emit('quizPrepared', chosenPlayers);
                    console.log(response);

                  })


              })
          });

        socket.emit('playersFound', chosenPlayers);

        console.log('Matching players found! emiting!');
        setTimeout(function() {
          lookforPlayers();
        }, 3000)
      }

    });
}
