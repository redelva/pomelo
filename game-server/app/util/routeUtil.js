var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(session, msg, app, cb) {
	var chatServers = app.getServersByType('chat');

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	var res = dispatcher.dispatch(session.get('roomId') + "@" + session.get('regionId'), chatServers);

	cb(null, res.id);
};

exp.play = function(session, msg, app, cb) {
  var playServers = app.getServersByType('play');

  if(!playServers || playServers.length === 0) {
    cb(new Error('can not find chat servers.'));
    return;
  }

  var res = dispatcher.dispatch(session.get('roomId') + "@" + session.get('regionId'), playServers);

  cb(null, res.id);
};