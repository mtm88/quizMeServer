var quizQueServices = require('./services/quizQueServices');
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
        socket.emit('playersFound', chosenPlayers);
        setTimeout(function() {
          lookforPlayers();
        }, 3000)
      }

    });
}
