var pomelo = window.pomelo;
var username;
var password;
var users;
var rooms;
var regions;
var regionId;
var roomId;
var base = 1000;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";
var myCards;
var autoStart;
var NUMBERS = {
  '一':1,
  '二':2,
  '三':3,
  '四':4,
  '五':5,
  '六':6,
  '七':7,
  '八':8,
  '九':9
};

util = {
	urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
	//  html sanitizer
	toStaticHTML: function(inputHtml) {
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	//pads n with zeros on the left,
	//digits is minimum length of output
	//zeroPad(3, 5); returns "005"
	//zeroPad(2, 500); returns "500"
	zeroPad: function(digits, n) {
		n = n.toString();
		while(n.length < digits)
		n = '0' + n;
		return n;
	},
	//it is almost 8 o'clock PM here
	//timeString(new Date); returns "19:49"
	timeString: function(date) {
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	},

	//does the argument only contain whitespace?
	isBlank: function(text) {
		var blank = /^\s*$/;
		return(text.match(blank) !== null);
	}
};

//always view the most recent message when it is added
function scrollDown(base) {
	window.scrollTo(0, base);
	$("#entry").focus();
};

// add message on board
function addMessage(from, target, text, time) {
	var name = (target == '*' ? 'all' : target);
	if(text === null) return;
	if(time == null) {
		// if the time is null or undefined, use the current time.
		time = new Date();
	} else if((time instanceof Date) === false) {
		// if it's a timestamp, interpret it
		time = new Date(time);
	}
	//every message you see is actually a table with 3 cols:
	//  the time,
	//  the person who caused the event,
	//  and the content
	var messageElement = $(document.createElement("table"));
	messageElement.addClass("message");
	// sanitize
	text = util.toStaticHTML(text);
	var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
	messageElement.html(content);
	//the log is the stream that we view
	$("#chatHistory").append(messageElement);
	base += increase;
	scrollDown(base);
};

// show tip
function tip(type, name) {
	var tip,title;
	switch(type){
		case 'online':
			tip = name + ' is online now.';
			title = 'Online Notify';
			break;
		case 'offline':
			tip = name + ' is offline now.';
			title = 'Offline Notify';
			break;
		case 'message':
			tip = name + ' is saying now.'
			title = 'Message Notify';
			break;
	}
	var pop=new Pop(title, tip);
};

// init user list
function initUserList(data) {
	users = data.users;
	for(var i = 0; i < users.length; i++) {
		var slElement = $(document.createElement("option"));
		slElement.attr("value", users[i]);
		slElement.text(users[i]);
		$("#usersList").append(slElement);
	}
};

// init region list
function initRegionList(data){
  regions = data.regions;
  for(var i = 0; i < regions.length; i++) {
    var slElement = $(document.createElement("option"));
    slElement.attr("value", regions[i].id);
    slElement.text(regions[i].name);
    $("#regionList").append(slElement);
  }
}

// init room list
function initRoomList(data){
  rooms = data.rooms;
  if(rooms.length === 0){
    //$("#txtRoom").show();
    //$("#roomList").hide();
    $( "#dialog-form" ).dialog( "open" );
  }else{
    for(var i = 0; i < rooms.length; i++) {
      var slElement = $(document.createElement("option"));
      slElement.attr("value", rooms[i].id);
      slElement.text(rooms[i].name);
      $("#roomList").append(slElement);
    }
  }
}

// add user in user list
function addUser(user) {
	var slElement = $(document.createElement("option"));
	slElement.attr("value", user);
	slElement.text(user);
	$("#usersList").append(slElement);
};

// remove user from user list
function removeUser(user) {
	$("#usersList option").each(
		function() {
			if($(this).val() === user) $(this).remove();
	});
};

// set your name
function setName() {
	$("#name").text(username);
};

// set your region
function setRegion() {
	$("#region").text(regionId);
};

// set your room
function setRoom() {
  $("#room").text(roomId);
};

// show error
function showError(content) {
	$("#loginError").text(content);
	$("#loginError").show();
};

// show login panel
function showLogin() {
	$("#loginView").show();
	$("#chatHistory").hide();
	$("#toolbar").hide();
	$("#loginError").hide();
	$("#loginUser").focus();
};

// show chat panel
function showChat() {
	$("#loginView").hide();
	$("#loginError").hide();
	$("#toolbar").show();
	$("entry").focus();
	scrollDown(base);
};

// query rooms list by regionid
function queryRoom(uid, pwd, regionId, callback){
  username = $("#loginUser").attr("value");
  password = $("#password").attr("value");

  if(username.length > 20 || username.length == 0) {
    showError(LENGTH_ERROR);
    return false;
  }

  if(!reg.test(username)) {
    showError(NAME_ERROR);
    return false;
  }

  var router = 'connector.entryHandler.getRoomListByRegionId';
  pomelo.request(router, {username: username, pwd: password, regionId: regionId}, function(data){
    if(data.code === 500) {
      showError(LOGIN_ERROR);
      return;
    }
    initRoomList(data);
    callback();
  })
}

// create room
function createRoom(callback){
  username = $("#loginUser").attr("value");
  password = $("#password").attr("value");
  var regionId = $("#regionList").find(":selected").val();
  var roomName = $("#txtRoom").val();

  var router = 'connector.entryHandler.createRoom';
  pomelo.request(router, {username: username, pwd: password, regionId: regionId, roomName: roomName}, function(data){
    if(data.code === 500) {
      showError(LOGIN_ERROR);
      return;
    }
    initRoomList({rooms:[data.room]});
    callback();
  })
}

// load room list
function queryRegionList(callback){
  var route = 'gate.gateHandler.queryEntry';
  pomelo.init({
    host: window.location.hostname,
    port: 3014,
    log: true
  }, function() {
    pomelo.request(route, function(data) {
      //pomelo.disconnect();
      if(data.code === 500) {
        showError(LOGIN_ERROR);
        return;
      }
      pomelo.init({
        host: data.host,
        port: data.port,
        log: true
      }, function() {
        var roomRouter = "connector.entryHandler.getRegionList";
        pomelo.request(roomRouter, function(data) {
          if(data.error) {
            showError(DUPLICATE_ERROR);
            return;
          }
          initRegionList(data);
          callback();
        });
      });
    });
  });
}

function showCards(data){
  myCards = data.cards;

  var names = [];
  for(var c in data.cards[username]){
    names.push(data.cards[username][c].name);
  }

  names.sort(function (a, b) {
    if(a[1] === b[1]) {
      return NUMBERS[a[0]] - NUMBERS[b[0]];
    }else{
      return a.charCodeAt(1)-b.charCodeAt(1);
    }
  });

  addMessage(data.from, data.target, "我的牌:" + JSON.stringify(names));

  names = [];
  for(var c in data.cards.used){
    names.push(data.cards.used[c].name);
  }

  if(names.length > 0){
    addMessage(data.from, data.target, "已出牌:" + JSON.stringify(names));
  }

  names = [];
  for(var i = data.cards.remain.length - 1, j=0; i >= 0 && j<10; i--,j++) {
    names.push(data.cards.remain[i].name);
  }

  if(names.length > 0){
    addMessage(data.from, data.target, "剩下牌:" + JSON.stringify(names));
  }
}

function getUrlParam(name, url) {
  if (!url) {
    url = window.location.href;
  }
  var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
  if (!results) {
    return undefined;
  }
  return results[1] || undefined;
}

$(document).ready(function() {
	//when first time into chat room.
	showLogin();

	//init username & password from url
  $("#loginUser").attr("value", getUrlParam('username'));
  $("#password").attr("value", getUrlParam('password'));
  autoStart = parseInt(getUrlParam('autoStart')) > 0;

	//wait message from the server.
	pomelo.on('onChat', function(data) {
		addMessage(data.from, data.target, data.msg);
		$("#chatHistory").show();
		if(data.from !== username)
			tip('message', data.from);
	});

  //wait message from the server.
  pomelo.on('onSend', function(data) {

    addMessage(data.from, data.target, data.msg);
    showCards(data);
    $("#chatHistory").show();
    if(data.from !== username)
      tip('message', data.from);
  });

  //wait message from the server.
  pomelo.on('onStart', function(data) {
    $("#start").hide();
    $("#send").show();
    $("#pong").show();

    addMessage(data.from, data.target, data.msg);
    showCards(data);
    $("#chatHistory").show();
    if(data.from !== username)
      tip('message', data.from);
  });

  //wait message from the server.
  pomelo.on('onPong', function(data) {
    addMessage(data.from, data.target, data.msg);
    showCards(data);
    $("#chatHistory").show();
    if(data.from !== username)
      tip('message', data.from);
  });

  //update user list
  pomelo.on('onJoin', function(data) {
    tip('online', 'someone join room');
  });

	//update user list
	pomelo.on('onAdd', function(data) {
		var user = data.user;
		tip('online', user);
		addUser(user);
	});

	//update user list
	pomelo.on('onLeave', function(data) {
		var user = data.user;
		tip('offline', user);
		removeUser(user);
	});


	//handle disconect message, occours when the client is disconnect with servers
	pomelo.on('disconnect', function(reason) {
		showLogin();
	});

    $( "#dialog-form" ).dialog({
      autoOpen: false,
      height: 300,
      width: 350,
      modal: true,
      buttons: {
        "创建房间": function() {
          createRoom(function () {
            $('#dialog-form').dialog( "close" );
          })
        },
        Cancel: function() {
          $(this).dialog( "close" );
        }
      },
      close: function() {
        $("#txtRoom").val( "" );
      }
    });

	queryRegionList(function(){
		console.log('region load complete');
	});

    $("#regionList").on('change', function() {
      var regionId = $(this).find(":selected").val();
      queryRoom(username, password, regionId, function(){
        console.log('room load complete');
      })
    });

    $('#start').click(function () {
      var router = "play.playHandler.start";
      pomelo.request(router, function(data) {
        if(data.error) {
          showError(DUPLICATE_ERROR);
          return;
        }
      });
    });

  $('#send').click(function () {
    var route = "play.playHandler.send";
    var target = '*';

    var msg = $("#entry").attr("value").replace("\n", "");

    if(!util.isBlank(msg)) {
      pomelo.request(route, {
        roomId: roomId,
        regionId: regionId,
        cards: myCards,
        from: username,
        currentCard: msg,
		target: target
      }, function(data) {
        $("#entry").attr("value", ""); // clear the entry field.

        if(data.error){
          tip('message', data.msg);
          return;
        }

        if(target != '*' && target != username) {
          addMessage(username, target, msg);
          $("#chatHistory").show();
        }
      });
    }
  });

  $('#pong').click(function () {
    var route = "play.playHandler.canPong";
    var target = '*';

    var msg = $("#entry").attr("value").replace("\n", "");

    if(!util.isBlank(msg)) {
      pomelo.request(route, {
        roomId: roomId,
        regionId: regionId,
        cards: myCards,
        from: username,
        currentCard: msg,
        target: target
      }, function(data) {


        if(data.error){
          tip('message', data.msg);
          return;
        }

       if(data.canPong){
         route = "play.playHandler.pong";
         pomelo.request(route, {
           roomId: roomId,
           regionId: regionId,
           cards: myCards,
           from: username,
           currentCard: msg,
           target: target
         }, function(data) {});
       }else{
         tip('message', "不能碰");
         return;
       }
      });
    }
  });

  $("#send").hide();
  $("#pong").hide();

	//deal with login button click.
	$("#login").click(function() {

		username = $("#loginUser").attr("value");
    	password = $("#password").attr("value");
		regionId = $('#regionList').val();
		roomId = $('#roomList').val();

		if(username.length > 20 || username.length == 0 || roomId.length > 20 || roomId.length == 0) {
			showError(LENGTH_ERROR);
			return false;
		}

		if(!reg.test(username) || !reg.test(roomId)) {
			showError(NAME_ERROR);
			return false;
		}

		//query entry of connection
		// queryEntry(username, password, function(host, port) {
		// 	pomelo.init({
		// 		host: host,
		// 		port: port,
		// 		log: true
		// 	}, function() {
				var route = "connector.entryHandler.enter";
				pomelo.request(route, {
					username: username,
					password: password,
                  	roomId: roomId,
				  	regionId: regionId
				}, function(data) {
					if(data.error) {
						showError(DUPLICATE_ERROR);
						return;
					}
					setName();
					setRoom();
					setRegion();
					showChat();
					initUserList(data);
					if(autoStart) $('#start').click();
				});
		// 	});
		// });
	});

	//deal with chat mode.
	$("#entry").keypress(function(e) {
		var route = "chat.chatHandler.send";
		var target = $("#usersList").val();
		if(e.keyCode != 13 /* Return */ ) return;
		var msg = $("#entry").attr("value").replace("\n", "");
		if(!util.isBlank(msg)) {
			pomelo.request(route, {
				roomId: roomId,
			  	regionId: regionId,
				content: msg,
				from: username,
				target: target
			}, function(data) {
				$("#entry").attr("value", ""); // clear the entry field.
				if(target != '*' && target != username) {
					addMessage(username, target, msg);
					$("#chatHistory").show();
				}
			});
		}
	});
});