const low = require('lowdb');
const lodashId = require('lodash-id');
const FileSync = require('lowdb/adapters/FileSync');
const usersAdapter = new FileSync('db.json');
const db = low(usersAdapter);

db._.mixin(lodashId);

db.defaults({
  users: [
    {
      login: '',
      password: '',
      session: {},
      chatsIDs: [],
      contacts: {}
    }
  ],
  chats: [
    {
      messages: [{
        fromID: '',
        toID: '',
        message: '',
        time: 0,
      }]
    }
  ]
})
  .write()

module.exports = db;
