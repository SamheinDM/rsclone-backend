const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient();

let usersDB, chatsDB, messagesDB;

MongoClient.connect('mongodb://127.0.0.1:27017', function(err, db) {
  if (err) {throw err}
  db.createCollection('users');
  db.createCollection('chats');
  db.createCollection('messages');
});

io.on('connection', (socket) => {
  socket.on('requestInfo', (user) => {
    console.log('connect');
    socket.emit('recieveInfo', 'data');
  });

  socket.on('message', (message) => {
    const newMessage = {
      user: message.user,
      message: message.message,
      time: new Date().getTime(),
    }
    messagesDB.insertOne(newMessage);
    socket.emit('message', newMessage);
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
