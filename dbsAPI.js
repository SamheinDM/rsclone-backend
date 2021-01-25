const low = require('lowdb');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');
const usersAdapter = new FileSync('usersDB.json');
const usersDB = low(usersAdapter);
const chatsAdapter = new FileSync('chatsDB.json');
const chatsDB = low(chatsAdapter);

usersDB._.mixin(lodashId);
chatsDB._.mixin(lodashId);

usersDB.defaults({ name: '', password: '', session: {}, chats: [], contacts: {} })
  .write()

chatsDB.defaults({ users: [], messages: [] })
  .write()

module.exports = { usersDB, chatsDB };
