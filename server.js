const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const usersDB = require('dbsAPI').usersDB;
const chatsDB = require('dbsAPI').chatsDB;

let authUser;

// const MongoClient = require('mongodb').MongoClient();

// MongoClient.connect('mongodb://127.0.0.1:27017', function(err, db) {
//   if (err) {throw err}
//   db.createCollection('users');
//   db.createCollection('chats');
//   db.createCollection('messages');
// });

function addMsg(msg) {
  const chatUsers = chatsDB
    .get({id: msg.id})
    .value()
  if (chatUsers) {
    chatUsers.push(msg).write();
  } else {
    chatsDB
      .get('users')
      .push([authUser, msg.user])
      .write()
    chatsDB
      .get('messages')
      .push(msg)
      .write()
  }
}

io.on('connection', (socket) => {
  socket.on('requestInfo', (user) => {
    console.log('connect ' + user);
    authUser = user;
    socket.emit('recieveInfo', 'data');
  });

  socket.on('message', (message) => {
    const newMessage = {
      id: 1,
      user: message.user,
      message: message.message,
      time: new Date().getTime(),
    }
    addMsg(newMessage);
    socket.emit('message', newMessage);
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
