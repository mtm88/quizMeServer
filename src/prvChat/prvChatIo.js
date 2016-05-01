var prvChatExports = require('./services/prvChat');

var express = require('express');
var app = express();
var chat = require('http').Server(app);

chat.listen(5002, function() {
  console.log('Private chat server is now running at port 5002');
});

var io = require('socket.io')(chat);

io.on('connect_error', function(data) {
  console.log(' backend blad connect error');
  console.log(data);
});



io.on('connection', function (socket) {

  console.log('socket.io: Private Chat user connected');

  socket.on('end', function() {
    socket.disconnect(true);
    console.log('socket.io: Private Chat user disconnected');
  });


  socket.on('disconnect', function() {

  });

  socket.on('private chat message to server', function(message) {
    console.log('private message received at backend');
    prvChatExports.sendPrvChatLogMsg(message);
    io.emit('private chat message from server', message);


  });


});


