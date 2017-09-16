var userService = require('../../../services/userService');
var roomService = require('../../../services/roomService');
var MahjongUtils = require('../../../util/mahjongUtil');
var Promise = require('sequelize').Promise;
var PlayStatus = require('../../../../lib/enum/playStatus');

module.exports = function(app) {
  return new Handler(app);
};

var Handler = function(app) {
  this.app = app;
};

var handler = Handler.prototype;

handler.start = function(msg, session, next) {
  var self = this;
  var roomId = session.get('roomId');
  var regionId = session.get('regionId');
  var userName = session.uid.split('*')[0];
  var channelService = this.app.get('channelService');

  userService.getUserInfoByUsername(userName).then(function (user) {
    return roomService.startInRoom(roomId, user.id).then(function (room) {
      return roomService.getAvailableUsers(roomId);
    });
  }).then(function (players) {
    if (players.length < 4) {
      return next(null, {
        players: players
      });
    } else if(players.filter(function (p) {
        return p.status === PlayStatus.Ready;
      }).length < 4) {
      return next(null, {
        players: players
      });
    }else {
      return userService.batchGetUserInfoByIds(players.map(function (t) {
        return t.user_id
      })).then(function (users) {
        var channel = channelService.getChannel(roomId + "@" + regionId, false);

        var result = {};

        var cards = MahjongUtils.shuffle();

        for (var i = 0; i < users.length; i++) {
          result[users[i].username] = cards.slice(i * 13, (i + 1) * 13);
        }

        result.remain = cards.slice(52);//剩下未使用的牌
        result.used = [];//已经出的牌

        var randomValue = MahjongUtils.roll(0, 3);
        var user = users[randomValue];
        result.currentPlayer = randomValue;

        var param = {
          msg: '开始了,' + user.username + '先出牌',
          from: userName,
          target: '*',
          cards: result
        };

        //channel.pushMessage('onStart', param);
        for (var i = 0; i < users.length; i++) {
          var tuid = users[i].username + '*' + regionId + "@" + roomId;//msg.username + '*' + regionId + "@" + roomId;
          if (channel.getMember(tuid)) {
            var tsid = channel.getMember(tuid)['sid'];

            channelService.pushMessageByUids('onStart', param, [{
              uid: tuid,
              sid: tsid
            }]);
          }

        }
        return next(null, result);
      });
    }
  });
};

handler.send = function(msg, session, next) {
  var self = this;
  var roomId = session.get('roomId');
  var regionId = session.get('regionId');
  var userName = session.uid.split('*')[0];
  var channelService = this.app.get('channelService');

  userService.getUserInfoByUsername(userName).then(function (user) {
    return roomService.startInRoom(roomId, user.id).then(function (room) {
      return roomService.getAvailableUsers(roomId);
    });
  }).then(function (players) {
    return userService.batchGetUserInfoByIds(players.map(function (t) {return t.user_id }));
  }).then(function(users){
    var channel = channelService.getChannel(roomId + "@" + regionId, false);

    var cards = msg.cards;
    if(users[cards.currentPlayer].username !== userName){
      return next(null, {
        code: 500,
        error: true,
        msg: "当前不是你出牌"
      });
    }

    cards.currentPlayer = (cards.currentPlayer + 1) % 4;

    //pick up a card
    var picked = cards.remain.pop();

    var card = null;

    for(var i = cards[userName].length - 1; i >= 0; i--) {
      if(cards[userName][i].name === msg.currentCard) {
        card = cards[userName][i];
        cards.used.push(card);
        cards[userName].splice(i, 1);
        break;
      }
    }

    cards[userName].push(picked);

    var param = {
      msg: userName + '出牌' + msg.currentCard + ",摸牌" + picked.name + ",下一个是" + users[cards.currentPlayer].username ,
      from: userName,
      target: '*',
      cards: cards
    };

    //channel.pushMessage('onStart', param);
    for(var i=0; i < users.length;i++) {
      var tuid = users[i].username + '*' + regionId + "@" + roomId;//msg.username + '*' + regionId + "@" + roomId;
      if(channel.getMember(tuid)){
        var tsid = channel.getMember(tuid)['sid'];

        channelService.pushMessageByUids('onSend', param, [{
          uid: tuid,
          sid: tsid
        }]);
      }
    }
    return next(null, {});
  });
};

handler.canPong = function (msg, session, next) {
  var self = this;
  var roomId = session.get('roomId');
  var regionId = session.get('regionId');
  var userName = session.uid.split('*')[0];
  var channelService = this.app.get('channelService');

  userService.getUserInfoByUsername(userName).then(function (user) {
    return roomService.startInRoom(roomId, user.id).then(function (room) {
      return roomService.getAvailableUsers(roomId);
    });
  }).then(function (players) {
    return userService.batchGetUserInfoByIds(players.map(function (t) {return t.user_id }));
  }).then(function(users) {
    var channel = channelService.getChannel(roomId + "@" + regionId, false);

    var cards = msg.cards;

    var card = cards.used[cards.used.length - 1];

    var myCards = cards[userName];

    var canPong = MahjongUtils.canPong(myCards, card);

    return next(null, {'canPong':canPong});
  })
};

handler.pong = function (msg, session, next) {
  var self = this;
  var roomId = session.get('roomId');
  var regionId = session.get('regionId');
  var userName = session.uid.split('*')[0];
  var channelService = this.app.get('channelService');

  userService.getUserInfoByUsername(userName).then(function (user) {
    return roomService.startInRoom(roomId, user.id).then(function (room) {
      return roomService.getAvailableUsers(roomId);
    });
  }).then(function (players) {
    return userService.batchGetUserInfoByIds(players.map(function (t) {return t.user_id }));
  }).then(function(users){
    var channel = channelService.getChannel(roomId + "@" + regionId, false);

    var cards = msg.cards;

    var card = cards.used[cards.used.length - 1];

    var myCards = cards[userName];

    var canPong = MahjongUtils.canPong(myCards, card);

    if(!canPong){
      return next(null, {
        code: 500,
        error: true,
        msg: "不能碰"
      });
    }

    cards.used.pop();

    myCards.push(card);

    users.forEach(function (t, number) {
      if(t.username === userName){
        cards.currentPlayer = (number + 1) % 4;
      }
    });

    var param = {
      msg: userName + '碰' + card.name + ",出牌" + msg.currentCard + ",下一个是" + users[cards.currentPlayer].username ,
      from: userName,
      target: '*',
      cards: cards
    };

    //channel.pushMessage('onStart', param);
    for(var i=0; i < users.length;i++) {
      var tuid = users[i].username + '*' + regionId + "@" + roomId;//msg.username + '*' + regionId + "@" + roomId;
      if(channel.getMember(tuid)){
        var tsid = channel.getMember(tuid)['sid'];

        channelService.pushMessageByUids('onPong', param, [{
          uid: tuid,
          sid: tsid
        }]);
      }
    }
    return next(null, {});
  });
};