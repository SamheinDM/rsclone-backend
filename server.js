const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dbAPI = require('./dbAPI');

let usersOnline = [];

function authorise(socket, login) {
  const user = dbAPI.getUser(login);
  const chats = dbAPI.getUserChats(user);
  usersOnline.push({ socket: socket, login: login });
  socket.emit('authorise', { user: user, chats: chats });
}

io.on('connection', (socket) => {
  socket.on('registration', (info) => {
    const newUser = dbAPI.registration(info);
    if (newUser) {
      authorise(socket, newUser);
    } else {
      socket.emit('registration', newUser);
    }
  })
  
  socket.on('authentication', (info) => {
    const authResult = dbAPI.authentication(info);
    if (authResult) {
      authorise(socket, info.login);
    } else {
      socket.emit('authorise', authResult);
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
