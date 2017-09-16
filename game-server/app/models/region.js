/**
 * Created by USER-PC on 2017-7-17.
 */
var db = require('../../lib/db.js');
var Sequelize = require('sequelize');

var staticMethods = {
  //Add static methods
};

var Region = db.define('Region', {
  "id": {"type": Sequelize.INTEGER, "primaryKey": true, "autoIncrement": true},
  "name": {"type": Sequelize.STRING, "defaultValue": "", "trim": true},
  "code": {"type": Sequelize.STRING, "defaultValue": "", "trim": true}
}, {
  underscored: true,
  tableName: 'regions',
  classMethods: staticMethods
});

module.exports = Region;