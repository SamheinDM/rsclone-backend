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

function sendMsg(newMsg, chatID) {
  const chatUsers = dbAPI.db
    .get('chats')
    .find({id: chatID})
    .get('users')
    .value();
  for (let i = 0; i < chatUsers.length; i += 1) {
    const userIndex = usersOnline.findIndex((elem) => elem.login === chatUsers[i]);
    const isUserOnline = userIndex !== -1;
    if (isUserOnline) {
      usersOnline[userIndex].socket.emit('message', newMsg);
    }
  }
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
    const newMsg = dbAPI.addMsg(message);
    sendMsg(newMsg, message.chatID);
  })

  socket.on('disconnect', () => {
    const index = usersOnline.findIndex((elem) => elem.socket === socket);
    usersOnline.splice(index, 1);
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
