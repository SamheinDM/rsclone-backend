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
    //     fromID: '',
    //     toID: '',
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

function isUserExist(login) {
  return db
    .get('users')
    .find({login: login})
    .value();
}

function authentication(login, password) {
  const user = isUserExist(login);
  return user && user.password === password;
}

function getUser(login) {
  return db
    .get('users')
    .find({login: login})
    .value()
}

function getUserChats(user) {
  const chatsID = user.chatsIDs;
  let chats = [];
  for (let i = 0; i < chatsID.length; i += 0) {
    chats.push((i) => {
      db.get('chats')
        .find({id: chatsID[i]})
        .value()
    });
  }
  return chats;
}

function registration(info) {
  const isExist = isUserExist(info.login);
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
    .write()
    .id;
  const isSucsses = authentication(info.login, info.password);
  if (isSucsses) {
    return newUserID;
  }
  return false;
}

module.exports.db = db;
module.exports.addMsg = addMsg;
module.exports.registration = registration;
module.exports.getUser = getUser;
