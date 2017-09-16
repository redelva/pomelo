/**
 * Created by USER-PC on 2017-7-17.
 */
var db = require('../../lib/db.js');
var Sequelize = require('sequelize');

var staticMethods = {
  //Add static methods
};

var User = db.define('User', {
  "id": {"type": Sequelize.INTEGER, "primaryKey": true, "autoIncrement": true},
  "username": {"type": Sequelize.STRING, "defaultValue": "", "trim": true},
  "password": {"type": Sequelize.STRING, "defaultValue": "", "trim": true},
  "source": {"type": Sequelize.INTEGER, "defaultValue": 0, "trim": true}
}, {
  underscored: true,
  tableName: 'users',
  classMethods: staticMethods
});

module.exports = User;