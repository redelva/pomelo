var userService = require('../../../services/userService');
var roomService = require('../../../services/roomService');
var regionService = require('../../../services/regionService');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
		this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function(msg, session, next) {
  var self = this;
  var regionId = msg.regionId;
  var roomId = msg.roomId;
  var pwd = msg.password;
  var uid = msg.username + '*' + regionId + "@" + roomId;
  var sessionService = self.app.get('sessionService');
  var user;

  //duplicate log in
  if (!!sessionService.getByUid(uid)) {
    return next(null, {
      code: 500,
      error: true
    });
  }

  //validate user login
  userService.login(msg.username, pwd).then(function (u, err) {
    if (!!err) {
      next(null, {
        code: 500,
        error: true
      });
      return;
    }

    user = u;
  }).then(function(){
    return roomService.getRoomById(roomId);
  }).then(function(room){
    return room.addPlayer(user);
  }).then(function(players){

    session.bind(uid);
    session.set('roomId', roomId);
    session.push('roomId', function(err) {
      if(err) {
        console.error('set roomId for session service failed! error is : %j', err.stack);
      }
    });
    session.set('regionId', regionId);
    session.push('regionId', function(err) {
      if(err) {
        console.error('set regionId for session service failed! error is : %j', err.stack);
      }
    });
    session.on('closed', onUserLeave.bind(null, self.app));

    //put user into channel
    self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), roomId + "@" + regionId, true, function(users){
      self.app.rpc.play.playRemote.add(session, uid, self.app.get('serverId'), roomId + "@" + regionId, true, function(players){
        next(null, {
          users:users,
          user: user,
          players:players
        });
      });
    });
  })
};

handler.getRegionList = function(msg, session, next){
  regionService.getRegionList().then(function(regions, err){
    if (err) {
      next(null, {
        code: 500,
        error: true
      });
      return;
    }else{
      next(null, {
        regions:regions
      });
      return;
	}
  });
};

handler.getRoomListByRegionId = function(msg, session, next){
  var regionId = msg.regionId;
  var username = msg.username;
  var pwd = msg.pwd;

  userService.login(username, pwd).then(function (u, err) {
    if (!!err) {
      next(null, {
        code: 500,
        error: true
      });
      return;
    }

    return u;
  }).then(function (user) {
    return regionService.getRoomListByRegionId(user.id, regionId).then(function(rooms, err){
      if (err) {
        next(null, {
          code: 500,
          error: true
        });
        return;
      }else{
        next(null, {
          rooms:rooms
        });
        return;
      }
    });
  });
};

handler.createRoom = function (msg, session, next) {
  var regionId = msg.regionId;
  var roomName = msg.roomName;
  var username = msg.username;
  var pwd = msg.pwd;

  userService.login(username, pwd).then(function (u, err) {
    if (!!err) {
      next(null, {
        code: 500,
        error: true
      });
      return;
    }

    return u;
  }).then(function (user) {
    return roomService.createRoom({
      name: roomName,
      status: 1,
      count: 1,
      creator_id: user.id,
      region_id: regionId
    })
  }).then(function (room) {
    next(null, {
      room: room
    });
    return;
  });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function(app, session) {
  if(!session || !session.uid) {
    return;
  }
  app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('roomId') + "@" +session.get('regionId'), null);
  app.rpc.play.playRemote.kick(session, session.uid, app.get('serverId'), session.get('roomId') + "@" +session.get('regionId'), null);
};