const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const db = require('dbsAPI');

// const MongoClient = require('mongodb').MongoClient();

// MongoClient.connect('mongodb://127.0.0.1:27017', function(err, db) {
//   if (err) {throw err}
//   db.createCollection('users');
//   db.createCollection('chats');
//   db.createCollection('messages');
// });

function addMsg(msg) {
  const chatUsers = db
    .get('chats')
    .find({id: msg.chatID})
    .value()
  if (chatUsers) {
    chatUsers
      .get('messages')
      .push(msg)
      .write();
  } else {
    const newChatID = db
      .get('chats')
      .insert({
        messages: [{
          fromID: msg.fromID,
          toID: msg.toID,
          message: msg.message,
          time: new Date().getTime(),
        }]
      })
      .write()
      .id
    const user_1 = db
      .get('users')
      .find({id: msg.fromID})
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
