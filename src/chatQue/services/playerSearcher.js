var quizQueServices = require('./quizQueServices');
var quizDataServices = require('./quizDataServices');
var chatQueIo = require('./../chatQueIo');
var socket = require('socket.io-client')('http://192.168.0.4:5003');


lookforPlayers();


function lookforPlayers() {
  //console.log('checking for matched players...');
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
            console.log('a');
            quizQueServices.removeFromQue(chosenPlayers.playerTwo)
              .then(function() {
                console.log('b');
                socket.emit('playersFound', chosenPlayers);
                setTimeout(function() {
                quizDataServices.fromQueToQuizData(chosenPlayers)
                  .then(function() {
                    console.log('c');
                    socket.emit('quizPrepared', chosenPlayers);
                  })
                }, 1000)


              })
          });

        console.log('Matching players found! emiting!');
        setTimeout(function() {
          lookforPlayers();
        }, 3000)
      }

    });
}
