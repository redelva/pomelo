var User = require('../models/user');

var UserService = {
  login: function(uid, pwd) {
    return User.findOne({
      where: {
        username: uid,
        password: pwd,
      },
    });
  },

  getUserInfoByUsername: function(username) {
    return User.findOne({
      where: {
        username: username,
      },
    });
  },

  getUserInfoByUid: function(uid) {
    return User.findOne({
      where: {
        id: uid,
      },
    });
  },

  batchGetUserInfoByIds: function(ids) {
    return User.findAll({
      where: {
        id: ids,
      },
    });
  },
};

module.exports = UserService;
