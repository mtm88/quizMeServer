var chatExports = require('./services/chatExports');

var express = require('express');
var app = express();
var chat = require('http').Server(app);

chat.listen(5001, function() {
  console.log('Chat server is now running at port 6000');
});

var io = require('socket.io')(chat);

io.on('connect_error', function(data) {
  console.log(' backend blad connect error');
  console.log(data);
});

var usersConnected = 0;

io.on('connection', function (socket) {

  console.log('socket.io: user connected');
  usersConnected++;
  io.emit('users online', usersConnected);

  socket.on('disconnect', function() {
    console.log('socket.io: user disconnected');
    usersConnected--;
    io.emit('users online', usersConnected);
  });

  socket.on('chat message', function(message) {

    console.log('message received at backend');
    chatExports.chatMessage(message); // no promise needed, it lagged the refresh of chatlog and DB chatlog is used only to load the log every time user opens the chat tab
    io.emit('chat message', message);
  });

  socket.on('get chat log', function() {

    console.log('request for chat log received');

    chatExports.getChatLog()
      .then(function(response) {
        io.emit('chat log', response);
      });

  });

});


