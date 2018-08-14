var raf = require('./raf')
// var rng = require('./rng')
var mapGen = require('./map')
var heroGen = require('./hero')
var inputs = require('./inputs')

var canvas = document.querySelector('#game')
var ctx = canvas.getContext('2d')

var config = {width: canvas.width, height: canvas.height}

// var rand = rng(1)
var map = mapGen(ctx, config)
var keys = inputs()
var hero = heroGen(ctx, config, keys)
var map1 = map.generate(64, 48)
// var map1 = map.homeMap

// var map1 = [
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 0, 1, 1, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 0, 0, 0, 0, 0, 1],
//   [1, 1, 1, 1, 1, 1, 1],
// ]

raf.start(function(elapsed) {
  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hero.move(map1);
  map.draw(map1);
  hero.draw(map1);
});
