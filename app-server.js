/**
 * Created by pc on 2016-03-26.
 */
var userData = require('./src/userData/service/userDataService');

var express = require('express');
var cors = require('cors');
var app = express();

app.use(cors());
app.use(express.static('public'));

var multer  = require('multer');
var morgan = require('morgan');

var jwt = require('jsonwebtoken');

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




app.post('/api/checkUsernameAvailability', userData.checkUsernameAvailability);

app.post('/api/registerNewUser', userData.registerNewUser);

app.post('/api/jwtUserLogin', userData.jwtUserLogin);

app.use(function(req, res, next) {

  if (req.body.FBverified == true) {
    next();
  }

  else {

  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  if (token) {

    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if(err) {
        return res.json({ jwtTokenAuth: false, message: 'Failed to authenticate token'});
      } else {
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


app.post('/api/fbUserData', userData.fbUserInfo);








app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

