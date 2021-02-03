const low = require('lowdb');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');
const usersAdapter = new FileSync('db.json');
const db = low(usersAdapter);

db._.mixin(lodashId);

db.defaults({
  users: [
    // {
    //   login: '',
    //   password: '',
    //   session: {},
    //   chatsIDs: [],
    //   deletedChatIDs: [],
    //   contacts: []
    // }
  ],
  chats: [
    // {
    //   users: []
    //   messages: [{
    //     from: '',
    //     message: '',
    //     time: 0,
    //   }]
    // }
  ]
})
  .write()

function addChat(users) {
  const newChat = db
    .get('chats')
    .insert({
      users: users,
      messages: [],
    })
    .write();

  users.forEach((user) => {
    db.get('users')
    .find({login: user})
    .get('chatsIDs')
    .push(newChat.id)
    .write();
  });

  const initialMsg = {
    chatID: newChat.id,
    messageObj: {
      from: '',
      message: '',
      time: new Date().getTime(),
    },
  };
  addMsg(initialMsg);
  return newChat;
}

function addMsg(msg) {
  const chat = db
    .get('chats')
    .find({id: msg.chatID})
    .value();
  if (chat) {
    const msgObj = {
      from: msg.messageObj.from,
      message: msg.messageObj.message,
      time: new Date().getTime(),
    };
    db
      .get('chats')
      .find({id: msg.chatID})
      .get('messages')
      .push(msgObj)
      .write();
    return msgObj;
  }
}

function getUser(login) {
  return db
    .get('users')
    .find({login: login})
    .value()
}

function authentication(info) {
  const user = getUser(info.login);
  if (user) {
    return user.password === info.password;
  }
  return false;
}

function getUserChats(user) {
  const chatsID = user.chatsIDs;
  let chats = [];
  for (let i = 0; i < chatsID.length; i += 1) {
    let elem = db
      .get('chats')
      .find({id: chatsID[i]})
      .value()
    chats.push(elem);
  }
  return chats;
}

function registration(info) {
  const isExist = getUser(info.login);
  if (isExist) {
    return false;
  }
  const newUser = {
    login: info.login,
    password: info.password,
    session: {},
    chatsIDs: [],
    deletedChatIDs: [],
    contacts: [],
  };
  const newUserID = db.get('users')
    .insert(newUser)
    .write();
  return info.login;
}

function updateUser(userObj) {
  db.get('users')
    .find({ login: userObj.login })
    .assign(userObj)
    .write();
}

module.exports.db = db;
module.exports.addMsg = addMsg;
module.exports.addChat = addChat;
module.exports.registration = registration;
module.exports.getUser = getUser;
module.exports.getUserChats = getUserChats;
module.exports.authentication = authentication;
module.exports.updateUser = updateUser;