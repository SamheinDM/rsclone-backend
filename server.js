const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const db = require('dbsAPI');

function addChat(msg) {
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
    .id;

  db.get('users')
    .find({id: msg.fromID})
    .get('chatsIDs')
    .push(newChatID)
    .write();

  db.get('users')
    .find({id: msg.toID})
    .get('chatsIDs')
    .push(newChatID)
    .write();
}

function addMsg(msg, chatID) {
  const chatUsers = db
    .get('chats')
    .find({id: chatID})
    .value();
  if (chatUsers) {
    db.get('chats')
      .find({id: chatID})
      .get('messages')
      .push({
        fromID: msg.fromID,
        toID: msg.toID,
        message: msg.message,
        time: new Date().getTime(),
      })
      .write();
  } else {
    addChat(msg);
  }
}

io.on('connection', (socket) => {
  socket.on('message', (message) => {
    addMsg(message, message.chatID);
    // socket.emit('message', message, message.chatID);
  })
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
