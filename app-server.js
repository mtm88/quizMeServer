/**
 * Created by pc on 2016-03-26.
 */
var userData = require('./src/userData/service/userDataModels');
var friendList = require('./src/friendList/services/friendListModels');
var chatIo = require('./src/chat/chatIo');

var cors = require('cors');

var express = require('express');
var app = express();
var server = require('http').Server(app);

app.set('port', (process.env.PORT || 5000));
server.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

var io = require('socket.io')(server);

var usersConnected = 0;

io.on('connect_error', function(data) {
  console.log(' backend blad connect error');
  console.log(data);
});

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
            chatIo.chatMessage(message); // no promise needed, it lagged the refresh of chatlog and DB chatlog is used only to load the log every time user opens the chat tab
                 io.emit('chat message', message);
          });

          socket.on('get chat log', function() {

            console.log('request for chat log received');

            chatIo.getChatLog()
              .then(function(response) {
                console.log(response);
                io.emit('chat log', response);
          });

  });



});



app.use(cors());
app.use(express.static('public'));

var multer  = require('multer');
var morgan = require('morgan');

var jwt = require('jsonwebtoken');
var secret = 'dupabizona';
app.set('pmSecret', secret);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.use(morgan('dev'));

var mongoose = require('mongoose');

mongoose.connect('mongodb://mtm88:mtm88@ds025399.mlab.com:25399/heroku_lcq5b0x8');

mongoose.connection.on('error',function (err) {
    console.log('Mongoose default connection error: ' + err);
});

mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection open');
});



app.post('/api/fbUserData', userData.fbUserInfo);

app.post('/api/checkUsernameAvailability', userData.checkUsernameAvailability);

app.post('/api/registerNewUser', userData.registerNewUser);

app.post('/api/jwtUserLogin', userData.jwtUserLogin);

app.post('/api/setOnlineStatus', friendList.setOnlineStatus);

app.use(function(req, res, next) {

  if (req.body.FBverified == true) {
    console.log('auth by FB, forwarding');
    next();
  }

  else {

  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {

    jwt.verify(token, app.get('pmSecret'), function(err, decoded) {
      if(err) {
        return res.json({ jwtTokenAuth: false, message: 'Failed to authenticate token'});
      } else {
        console.log('Token received and authenticated');
        req.decoded = decoded;
        next();

      }
    });

  } else {

    return res.status(403).send({
      jwtTokenAuth: false,
      message: 'No token provided.'
    });
  }

  }

});



app.post('/api/getFriendlist', friendList.getFriendlist);
app.post('/api/friendFinder', friendList.friendFinder);
app.post('/api/sendInvite', friendList.sendInvite);
app.post('/api/acceptInvite', friendList.acceptInvite);





