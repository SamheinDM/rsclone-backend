const WebSocketServer = require('ws').Server;
const wss = new WebSocketServer({port: 9000});

const MongoClient = require('mongodb').MongoClient;
const format = require('util').format;

let userListDB, chatDB;
let peers = [];
let lpeers = [];

MongoClient.connect('mongodb://127.0.0.1:27017', function(err, db) {
  if (err) {throw err}
  userListDB = db.collections('users');
  chatDB = db.collections('chat');
});

function existUser(user, callback) {
  userListDB.find({login: user}).toArray(function(error, list) {
    if (error) throw error;
    callback(list.length !== 0);
  });
}

function checkUser(user, password, callback) {
  existUser(user, function(exist) {
    if (exist) {
      userListDB.find({login: user}).toArray(function(error, list) {
        if (error) throw error;
        callback(list.pop().password === password);
      });
    } else {
      const returning = {type:'authorize', success: false};
      ws.send(JSON.stringify(returning));
    }
  });
}

function sendMsg(by, to, message) {
  const time = new Date().getTime();

  chatDB.find({user: to}).find({user: by}).toArray(function(error, list) {
    if (error) throw error;
    const newMsg = {message: message, from: by, time: time};
    list.insertOne(newMsg, {w: 1});
    ws.send(JSON.stringify(newMsg));
  });
}

function sendNewMessages (ws, user) {
	chatDB.find({user: user}).toArray(function(error, entries) {
		if (error) {throw error};
		entries.forEach(function (entry){
			entry.type = 'message';
			ws.send (JSON.stringify (entry));
		});
	});
}

wss.on('connection', function(ws) {
  let login = '';
  let registered = false;

  ws.on('message', function(message) {
    const event = JSON.parse(message);

    if (event.type === 'authorize') {
      checkUser(event.user, event.password, function(success) {
        registered = success;

        const returning = {type: 'authorize', success: success};

        if (success) {
          lpeers.push(event.user);
          peers.push(ws);
          login = event.user;

          ws.on('close', function() {
            peers.splice(peers.indexOf(ws), 1);
            lpeers.splice(lpeers.indexOf(event.user), 1);
          });
        }
        ws.send(JSON.stringify(returning));

        if (success) {
          sendNewMessages(ws, login);
        }
      });
    } else {
      if (registered) {
        if (event.type === 'message') {
          sendMsg();
        }
      }
    }
  })
});
