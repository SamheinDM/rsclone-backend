const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dbAPI = require('./dbAPI');

const PORT = process.env.PORT || 80;

let usersOnline = [];

function authorise(socket, login) {
  const user = dbAPI.getUser(login);
  const chats = dbAPI.getUserChats(user);
  usersOnline.push({ socket: socket, login: login });
  socket.emit('authorise', { user: user, chats: chats });
}

function sendMsg(typeOfMessage, newMsg, chatID) {
  const chatUsers = dbAPI.db
    .get('chats')
    .find({id: chatID})
    .get('users')
    .value();
  for (let i = 0; i < chatUsers.length; i += 1) {
    const userIndex = usersOnline.findIndex((elem) => elem.login === chatUsers[i]);
    const isUserOnline = userIndex !== -1;
    if (isUserOnline) {
      usersOnline[userIndex].socket.emit(typeOfMessage, newMsg);
    }
  }
}

app.use(express.static('client'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/client/index.html');
});

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

  socket.on('create_chat', (usersArray) => {
    const newChat = dbAPI.addChat(usersArray);
    sendMsg('new_chat', newChat, newChat.id);
  });

  socket.on('message', (message) => {
    const newMsg = dbAPI.addMsg(message);
    sendMsg('message', newMsg, message.chatID);
  });

  socket.on('possible_contacts', (user) => {
    const contacts = dbAPI.getPossibleContacts(user);
    socket.emit('possible_contacts', contacts);
  })

  socket.on('delete_contact', (userObj) => dbAPI.updateUser(userObj));

  socket.on('disconnect', () => {
    const index = usersOnline.findIndex((elem) => elem.socket === socket);
    usersOnline.splice(index, 1);
  })
});

http.listen(PORT);
