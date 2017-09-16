//分组

//mXXX+nXYZ+AA

//m+n=4

//万 对子
//筒
//条

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

var result = isEnd(true, [
  {name:'一万'},{name:'二万'},{name:'三万'},
  {name:'一条'},{name:'二条'},{name:'三条'},
  {name:'一筒'},{name:'二筒'},{name:'三筒'},
  {name:'四筒'},{name:'四筒'},{name:'四筒'},
  {name:'五筒'}, {name:'五筒'}]);

console.log('result is true');

function clone(arr){
  return JSON.parse(JSON.stringify(arr));
}

function isEnd(enableCheckDouble,cards){
  var result;
  var steps = [];

  if(!cards) return cards;

  if(cards.length === 0){
    return true;
  }

  var card = cards.pop();
  var doubleResult;

  if(enableCheckDouble){
    doubleResult = findDouble(clone(cards), card);

    //find double
    if(doubleResult){
      steps.push(card.name);
      steps.push(card.name);

      //console.log('double result is ' + JSON.stringify(doubleResult));

      var nextStep = isEnd(false, doubleResult);
      if(nextStep && Array.isArray(nextStep)){
          steps = steps.concat(nextStep);
      }
    }
  }

  var tripleResult = findTriple(clone(cards), card);

  //find triple
  if(tripleResult){
    steps.push(card.name);
    steps.push(card.name);
    steps.push(card.name);

    //console.log('tripe result is ' + JSON.stringify(tripleResult));

    var nextStep = isEnd(doubleResult, tripleResult);
    if(nextStep && Array.isArray(nextStep)){
      steps = steps.concat(nextStep);
    }
  }

  var xyzResult = findXYZ(clone(cards), card);

  //find xyz
  if(xyzResult){
    steps = steps.concat(getXYZ(card));

    //console.log('xyz result is ' + JSON.stringify(xyzResult));

    var nextStep = isEnd(doubleResult, xyzResult);
    if(nextStep && Array.isArray(nextStep)){
      steps = steps.concat(nextStep);
    }
  }

  if(steps.length > 0)
    console.log(JSON.stringify(steps));

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
  while (idx !== -1) {
    indices.push(idx);
    idx = (idx > 0 ? names.lastIndexOf(card.name, idx - 1) : -1);
  }

  if(indices.length === 2){

    return cards.filter(function (c, i) {
      return indices.indexOf(i) === -1;
    });
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

    return cards.filter(function (c, i) {
      return i !== yIndex && i !== zIndex;
    })
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

function isXYZ(cards){
  var card = cards[0];
  var number = STRING_TO_NUMBER[card.name[0]];
  var type = card.name[1];
  var names = cards.map(function (t) { return t.name });

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
}

function isTriple(cards){
  return cards[0] === cards[1] && cards[0] === cards[2];
}

function isCouple(cards){
  return cards[0] === cards[1];
}