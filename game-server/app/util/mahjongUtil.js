var initCards = [];
var cardLength = 108;
var cardNames = [
  '一万','二万','三万','四万','五万','六万','七万','八万','九万',
  '一万','二万','三万','四万','五万','六万','七万','八万','九万',
  '一万','二万','三万','四万','五万','六万','七万','八万','九万',
  '一万','二万','三万','四万','五万','六万','七万','八万','九万',
  '一条','二条','三条','四条','五条','六条','七条','八条','九条',
  '一条','二条','三条','四条','五条','六条','七条','八条','九条',
  '一条','二条','三条','四条','五条','六条','七条','八条','九条',
  '一条','二条','三条','四条','五条','六条','七条','八条','九条',
  '一筒','二筒','三筒','四筒','五筒','六筒','七筒','八筒','九筒',
  '一筒','二筒','三筒','四筒','五筒','六筒','七筒','八筒','九筒',
  '一筒','二筒','三筒','四筒','五筒','六筒','七筒','八筒','九筒',
  '一筒','二筒','三筒','四筒','五筒','六筒','七筒','八筒','九筒'
];

var cardIdMap = {
  '一万':1,
  '二万':17,
  '三万':33,
  '四万':49,
  '五万':65,
  '六万':81,
  '七万':97,
  '八万':113,
  '九万':129,

  '一筒':513,
  '二筒':529,
  '三筒':545,
  '四筒':561,
  '五筒':577,
  '六筒':593,
  '七筒':609,
  '八筒':625,
  '九筒':641,

  '一条':257,
  '二条':273,
  '三条':289,
  '四条':305,
  '五条':321,
  '六条':337,
  '七条':353,
  '八条':369,
  '九条':385
};

var STRING_TO_NUMBER = {
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

var NUMBER_TO_STRING = {
  1:'一',
  2:'二',
  3:'三',
  4:'四',
  5:'五',
  6:'六',
  7:'七',
  8:'八',
  9:'九'
};

module.exports.shuffle = function() {

  for (var i = cardLength -1; i >=0; i--) {
    initCards.push({index: i, name: cardNames[i], id: cardIdMap[cardNames[i]]});
  }

  for (var i = cardLength -1; i >=0; i--) {

    var randomIndex = Math.floor(Math.random()*(i+1));
    var itemAtIndex = initCards[randomIndex];

    initCards[randomIndex] = initCards[i];
    initCards[i] = itemAtIndex;
  }

  return initCards;
};

module.exports.roll = function (min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports.xyz = function (myCards, card) {
  var number = STRING_TO_NUMBER[card.name[0]];
  var type = card.name[1];
  var names = myCards.map(function (t) { return t.name });

  var candidates = [];

  if(number === 1){
    candidates.push(NUMBER_TO_STRING[2] + type);
    candidates.push(NUMBER_TO_STRING[3] + type);
  }else if(number === 9){
    candidates.push(NUMBER_TO_STRING[8] + type);
    candidates.push(NUMBER_TO_STRING[7] + type);
  }else{
    candidates.push(NUMBER_TO_STRING[number+1] + type);
    candidates.push(NUMBER_TO_STRING[number-1] + type);
  }

  return names.indexOf(candidates[0]) > -1 && names.indexOf(candidates[1]) > -1;
};

module.exports.canPong = function (myCards, card) {

  var count = 0;

  myCards.forEach(function (t) {
    if(t.name === card.name){
      count++;
    }
  });

  return count === 2;
};

module.exports.isEnd = function(enableCheckDouble,cards){
  var result;
  var steps = [];

  if(!cards) return cards;

  if(cards.length === 0){
    return true;
  }

  var card = cards.pop();
  var doubleResult;

  if(enableCheckDouble){
    doubleResult = findDouble(cards.slice(0), card);

    //find double
    if(doubleResult){
      steps.push(card.name);
      steps.push(card.name);

      if(steps.length > 0)
        console.log(JSON.stringify(steps));

      //console.log('double result is ' + JSON.stringify(doubleResult));

      var nextStep = isEnd(false, doubleResult);
      if(nextStep)
        steps = steps.concat(nextStep);
      else
        return false;
    }
  }

  var tripleResult = findTriple(cards.slice(0), card);

  //find triple
  if(tripleResult){
    steps.push(card.name);
    steps.push(card.name);
    steps.push(card.name);

    if(steps.length > 0)
      console.log(JSON.stringify(steps));

    //console.log('tripe result is ' + JSON.stringify(tripleResult));

    var nextStep = isEnd(doubleResult, tripleResult);
    if(nextStep)
      steps = steps.concat(nextStep);
    else
      return false;
  }

  var xyzResult = findXYZ(cards.slice(0), card);

  //find xyz
  if(xyzResult){
    steps = steps.concat(getXYZ(card));

    if(steps.length > 0)
      console.log(JSON.stringify(steps));

    //console.log('xyz result is ' + JSON.stringify(xyzResult));

    var nextStep = isEnd(doubleResult, xyzResult);
    if(nextStep)
      steps = steps.concat(nextStep);
    else
      return false;
  }

  return false;
}

function findDouble(cards, card){
  var names = cards.map(function (t) { return t.name });
  var idx = names.indexOf(card.name);
  if(idx === -1){
    return null;
  }else{
    cards.splice(idx, 1);
    return cards;
  }
}

function findTriple(cards, card){
  var indices = [];
  var names = cards.map(function (t) { return t.name });
  var idx = names.lastIndexOf(card.name);
  while (idx != -1) {
    indices.push(idx);
    idx = (idx > 0 ? names.lastIndexOf(card.name, idx - 1) : -1);
  }

  if(indices.length === 2){
    indices.forEach(function(i){
      cards[i].name = "";
    });

    return cards.filter(function(c){return c.name !== ''});
  }else{
    return null;
  }
}

function findXYZ(cards, card){
  var X = card;
  var number = STRING_TO_NUMBER[X.name.substr(0,1)];
  var type = X.name.substr(1,1);
  var names = cards.map(function (t) { return t.name });

  number--;
  var Y = NUMBER_TO_STRING[number] + type;
  number--;
  var Z = NUMBER_TO_STRING[number] + type;

  var yIndex = names.indexOf(Y);
  var zIndex = names.indexOf(Z);
  if(yIndex> -1 && zIndex > -1){
    cards[yIndex].name = "";
    cards[zIndex].name = "";
    return cards.filter(function(c){return c.name !== ''});
  }
}

function getXYZ(X){
  var number = STRING_TO_NUMBER[X.name.substr(0,1)];
  var type = X.name.substr(1,1);
  number--;
  var Y = NUMBER_TO_STRING[number] + type;
  number--;
  var Z = NUMBER_TO_STRING[number] + type;

  return [X.name,Y,Z];
}