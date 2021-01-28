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
    //   contacts: {}
    // }
  ],
  chats: [
    // {
    //   messages: [{
    //     from: '',
    //     to: '',
    //     message: '',
    //     time: 0,
    //   }]
    // }
  ]
})
  .write()

function addChat(msg) {
  const newChatID = db
    .get('chats')
    .insert({
      messages: [{
        from: msg.from,
        to: msg.to,
        message: msg.message,
        time: new Date().getTime(),
      }]
    })
    .write()
    .id;

  db.get('users')
    .find({login: msg.from})
    .get('chatsIDs')
    .push(newChatID)
    .write();

  db.get('users')
    .find({login: msg.to})
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
        from: msg.from,
        to: msg.to,
        message: msg.message,
        time: new Date().getTime(),
      })
      .write();
  } else {
    addChat(msg);
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
    contacts: {}
  };
  const newUserID = db.get('users')
    .insert(newUser)
    .write();
  return info.login;
}

module.exports.db = db;
module.exports.addMsg = addMsg;
module.exports.registration = registration;
module.exports.getUser = getUser;
module.exports.getUserChats = getUserChats;
module.exports.authentication = authentication;