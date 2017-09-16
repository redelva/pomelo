var Room = require('../models/room');
var UserRoom = require('../models/userRoom');
var User = require('../models/user');

module.exports.createRoom = function(model){
  return Room.create(model);
};

module.exports.getRoomById = function(roomID){
  return Room.findById(roomID);
};

module.exports.startInRoom = function (roomId, userId) {
  return UserRoom.findOne({
    where:{
      room_id: roomId,
      user_id: userId
    }
  }).then(function (model) {
    model.status = 1;
    return model.save();
  });
};

module.exports.leaveRoom = function (roomId, username) {
  return User.findOne({
    where:{
      username:username
    }
  }).then(function (user) {
    return UserRoom.destroy({
      where:{
        room_id: roomId,
        user_id: user.id
      }
    });
  });
};

module.exports.getRoomList = function(){
  return Room.findAll();
};

module.exports.getAvailableUsers = function(roomId){
  return UserRoom.findAll({
    where:{
      room_id: roomId
    }
  });
};