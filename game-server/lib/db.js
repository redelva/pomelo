var Sequelize = require('sequelize');
var dbConfig = require('../config/database.json');

var sequelize = new Sequelize(dbConfig.dbname, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4'
  },
  timezone: '+08:00',
  benchmark: dbConfig.benchmark,
  //logging: console.log//dbConfig.logging
});

if (dbConfig.pool_max) {
  if (!sequelize.pool) sequelize.pool = {}
  sequelize.pool.max = dbConfig.pool_max;
}

if (dbConfig.pool_min) {
  if (!sequelize.pool) sequelize.pool = {}
  sequelize.pool.min = dbConfig.pool_min;
}

if (dbConfig.pool_idle) {
  if (!sequelize.pool) sequelize.pool = {}
  sequelize.pool.idle = dbConfig.pool_idle;
}

module.exports = sequelize;