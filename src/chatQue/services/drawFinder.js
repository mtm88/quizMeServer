var quizDrawServices = require('./quizDrawServices');
var quizDataServices = require('./quizDataServices');

var chatQueIo = require('./../chatQueIo');
var socket = require('socket.io-client')('http://192.168.0.2:5004');


var i = 0;

lookForDraws(i);

function lookForDraws(i) {

  //console.log('looking for draws...');

  quizDrawServices.lookForDraws()
    .then(function(gamesWithDraw) {

      if(gamesWithDraw.length > 0) {

          quizDataServices.getNewCategory(gamesWithDraw[i].quizID, gamesWithDraw[i].usedCategories)
            .then(function(rolledCategoryData) {

              socket.emit('new rolled category', gamesWithDraw[i].players, rolledCategoryData);

              quizDrawServices.removeDrawData(gamesWithDraw[i].quizID)
                .then(function() {

                  i++;

                    if(i >= gamesWithDraw.length) {
                      i = 0;
                      setTimeout(function () {
                        lookForDraws(i);
                      }, 1000)
                    }

                    else {
                      lookForDraws(i);
                    }

                })

            });





      }

      else {
        setTimeout(function () {
          lookForDraws(i);
        }, 1000)
      }






    })



}
