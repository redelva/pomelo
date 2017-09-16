var RoomService = require('../../../services/roomService');

module.exports = function(app) {
  return new PlayRemote(app);
};

var PlayRemote = function(app) {
  this.app = app;
  this.channelService = app.get('channelService');
};

PlayRemote.prototype.add = function(uid, sid, name, flag, cb){
  var channel = this.channelService.getChannel(name, flag);
  var username = uid.split('*')[0];
  var param = {
    route: 'onJoin',
    user: username
  };
  channel.pushMessage(param);

  if( !! channel) {
    channel.add(uid, sid);
  }

  cb();
};

PlayRemote.prototype.start = function(uid, sid, name, flag, cb){
  var channel = this.channelService.getChannel(name, flag);
  var username = uid.split('*')[0];
  var param = {
    route: 'onAdd',
    user: username
  };
  channel.pushMessage(param);

  if( !! channel) {
    channel.add(uid, sid);
  }

  cb(this.get(name, flag));
};

PlayRemote.prototype.kick = function(uid, sid, name, cb) {

  var username = uid.split('*')[0];
  var roomId = uid.split('*')[1].split('@')[1];
  var regionId = uid.split('*')[1].split('@')[0];

  RoomService.leaveRoom(roomId, username).then(cb);
};