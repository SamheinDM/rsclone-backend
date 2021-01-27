const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dbAPI = require('./dbAPI');

io.on('connection', (socket) => {
  socket.on('registration', (info) => {
    socket.emit('registered', dbAPI.registration(info));
  })

  socket.on('authentication', (info) => {
    const authResult = dbAPI.authentication(info);
    if (authResult) {
      const user = dbAPI.getUser(info.login);
      const chats = dbAPI.db
        .get('chats')
        .fil
      socket.emit('authorise', {});
    }
  })

  socket.on('message', (message) => {
    dbAPI.addMsg(message, message.chatID);
    // socket.emit('message', message, message.chatID);
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
