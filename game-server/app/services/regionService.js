var Region = require('../models/region');
var Room = require('../models/room');

module.exports.getRegionList = function(){
  return Region.findAll();
};

module.exports.getRoomListByRegionId = function(userId, regionId){
  return Room.findAll({
    where:{
      region_id:regionId
    }
  }).then(function (rooms) {
    return rooms;
  });
  //   if(rooms && rooms.length > 0){
  //     return rooms;
  //   }else{
  //     return Room.create({
  //       name:'test',
  //       status:1,
  //       count:1,
  //       creator_id: userId,
  //       region_id: regionId
  //     });
  //   }
  // }).then(function(results){
  //   if(Array.isArray(results)){
  //     return results;
  //   }else{
  //     return [results];
  //   }
  // })
};