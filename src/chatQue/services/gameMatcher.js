var quizDataServices = require('./quizDataServices');
var quizGameServices = require('./quizGameServices');
var chatQueIo = require('./../chatQueIo');
var chatQueSocket = require('socket.io-client')('http://192.168.0.2:5003');
var chatGameSocket = require('socket.io-client')('http://192.168.0.2:5004');


lookForReadyPlayers();

function lookForReadyPlayers() {

  //console.log('Looking for games with ready players...');
  quizDataServices.lookForPreparedGames()
    .then(function (allQuizData) {
      if(allQuizData == '') {
        //console.log('no ready games found, 3 sec timeout');
        setTimeout(function() {
          lookForReadyPlayers();
        },3000);
      }

      else {

       // console.log('game found!');

        setTimeout(function() {
          gamePreparingLoop(0);
        }, 1000);


        function gamePreparingLoop (i) {

          quizDataServices.setAsStarted(allQuizData[i].quizID)
            .then(function(data) {

              quizGameServices.rollQuestions(data.firstCategory, allQuizData[i].quizID)
                .then(function(questions) {

           //   var dataToEmit = { 'allQuizData' : allQuizData[i], 'firstCategory' : data.firstCategory };
           //    chatQueSocket.emit('readyGameData', dataToEmit);

                  quizGameServices.bringQuestions(data.firstCategory, questions, allQuizData[i])
                    .then(function(questionsAndQuizData) {
                      //console.log(questionsAndQuizData[1]);
                      chatQueSocket.emit('readyGameData', questionsAndQuizData[1], data.firstCategory, questionsAndQuizData[0])
                    });

                  i++;

                  if(i < allQuizData.length)
                    gamePreparingLoop(i);

            })
          })
        }

        setTimeout(function() {
          lookForReadyPlayers();
        }, 3000)

      }



    })
}
