/**
 * Created by USER-PC on 2017-7-17.
 */
var db = require('../../lib/db.js');
var Sequelize = require('sequelize');

var UserRoom = db.define('UserRoom', {
  "id": {"type": Sequelize.INTEGER, "primaryKey": true, "autoIncrement": true},
  "status": {"type": Sequelize.INTEGER, "default":0}
}, {
  underscored: true,
  tableName: 'user_room'
});

module.exports = UserRoom;