var server = require('./index');
var io = require('socket.io')(server);

module.exports = new Promise( resolve => {
  io.on('connection', function (socket) {
    socket.emit('welcome', {
      message: 'Welcome to Deception: Murder In Hong Kong Online - an Adaptation by Trung Do of the same name game irl'
    });  
    resolve(socket);
  });
});

require('./io-files/user');
