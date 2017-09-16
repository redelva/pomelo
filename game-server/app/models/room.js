/**
 * Created by USER-PC on 2017-7-17.
 */
var db = require('../../lib/db.js');
var Sequelize = require('sequelize');
var User = require('./user');
var UserRoom = require('./userRoom');
var Region = require('./region');

var staticMethods = {
  //Add static methods
};

var Room = db.define('Room', {
  "id": {"type": Sequelize.INTEGER, "primaryKey": true, "autoIncrement": true},
  "name": {"type": Sequelize.STRING, "defaultValue": "", "trim": true},
  "status": {"type": Sequelize.INTEGER, "defaultValue": 0, "trim": true},
  "count": {"type": Sequelize.INTEGER, "defaultValue": 0, "trim": true},
}, {
  underscored: true,
  tableName: 'rooms',
  classMethods: staticMethods
});

Room.belongsTo(Region);
Room.belongsTo(User, {'as': 'creator'});
Room.belongsToMany(User, {as:'players', through: UserRoom});
//User.belongsTo(Room, {as:'creator', foreignKey: 'roomId', targetKey: 'userId', through: UserRoom});

module.exports = Room;