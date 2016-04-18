/**
 * Created by pc on 2016-04-18.
 */

module.exports = function (io) {

  console.log('test');

  'use strict';

  io.on('connection', function(socket) {
    console.log('nowy user');
    socket.on('message', function(from, msg) {

      console.log('received message from', from, 'msg', JSON.stringify(msg));

      console.log('broadcasting message');
      console.log('payload is', msg);

      io.sockets.emit('broadcast', {
        payload : msg,
        source : from
      });

      console.log('broadcast complete');

    });

  });

};
