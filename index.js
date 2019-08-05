const app = require('express')();
const server = require('http').Server(app);
const configs = require('./configs'); 

server.listen(configs.port);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

if (process.platform === "win32") {
  var rl = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on("SIGINT", function () {
    process.emit("SIGINT");
  });
}

process.on("SIGINT", function () {
  //graceful shutdown
  process.exit();
});

const theModule = module.exports = server;

const mongoose = require('mongoose');
mongoose.connect(configs.db.url, {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

theModule.mongoose = mongoose;

/* 
 * Socket Server Logic 
 */

const io = require('socket.io')(server);
const jwt = require('jsonwebtoken');
const User = require('./models/user');

io.on('connection', function (socket) {
  socket.emit('welcome', {
    message: 'Welcome to Deception: Murder In Hong Kong Online - an Adaptation by Trung Do of the same name game irl'
  });

  socket.on('register', function (data = {}) {
    console.log('Received register request: ', data);

    const username = data.username;
    const password = data.password;

    if (!username || !password) {
      socket.emit('sv_registerError', {
        error: 'Invalid username/password',
      })
      return;
    }

    const newUser = new User({
      username,
      password,
      playerName: username
    });

    newUser.save();

    socket.emit('sv_registerCb', {
      success: 'You\'ve registered successfully.',
    });
  });

  socket.on('login', function (data = {}) {
    console.log('Received login request: ', data);

    const username = data.username;
    const password = data.password;
    
    if (!username || !password) {
      socket.emit('sv_registerError', {
        error: 'Invalid username/password',
      })
      return;
    }

    User.findOne({
      username
    }, function(err, user) {
      user.comparePassword(password, function(err, isMatch){
        if (err) {
          socket.emit('sv_login', {
            error: 'Wrong username or password.',
          });
        }

        if (isMatch) {
          const verifiedUser = {};
          
          verifiedUser.username = user.username;
          verifiedUser.totalPlayed = user.totalPlayed;
          verifiedUser.totalWin = user.totalWin;
          verifiedUser.totalLose = user.totalLose;

          let token = jwt.sign(verifiedUser, 'secret', { expiresIn: '1h' });

          socket.emit('sv_loginCb', {
            success: 'Logged in.',
            token
          });
        }
      })
    });
  })
});
