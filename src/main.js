var raf = require('./raf')
var mapGen = require('./map')
var heroGen = require('./hero')
var inputs = require('./inputs')
var gameStateGen = require('./gameState')

var canvas = document.querySelector('#game')
var ctx = canvas.getContext('2d')

var config = {width: canvas.width, height: canvas.height}

var hero, map, keys, currMap, gameState

function blockPlaceCallback (direction) {
  hero.placeBlock(currMap, direction)
}

function blockPickupCallback (direction) {
  hero.pickupBlock(currMap, direction)
}

function updateMap() {
  currMap = gameState.getCurrentMap()
}

// Init modules
map = mapGen(ctx, config)
keys = inputs(blockPlaceCallback, blockPickupCallback)
gameState = gameStateGen(map)
hero = heroGen(ctx, config, keys, gameState, updateMap)

updateMap()
// currMap = map.generate(128, 96)
// currMap = map.homeMap
// currMap = [
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

raf.start(function() {
  // Clear the screen
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  hero.move(currMap);
  map.draw(currMap);
  hero.draw(currMap);
});
