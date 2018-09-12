var raf = require('./raf')
var mapGen = require('./map')
var heroGen = require('./hero')
var enemiesGen = require('./enemies')
var inputs = require('./inputs')
var gameStateGen = require('./gameState')

var canvas = document.querySelector('#game')
var ctx = canvas.getContext('2d')

var config = {width: canvas.width, height: canvas.height, gravity: 0.5, basicSpeed: 5}
var ememyConfig = {width: canvas.width, height: canvas.height, gravity: 0.1, basicSpeed: 2}

var hero, map, keys, currMap, gameState, enemies

function blockPlaceCallback (direction) {
  hero.placeBlock(currMap, direction)
}

function blockPickupCallback (direction) {
  hero.pickupBlock(currMap, direction)
}

function updateMap() {
  currMap = gameState.getCurrentMap()
}

function startTeleportCallback () {
  hero.startTeleport(currMap, updateMap)
}

function stopTeleportCallback () {
  hero.stopTeleport()
}

// Init modules
map = mapGen(ctx, config)
keys = inputs(blockPlaceCallback, blockPickupCallback, startTeleportCallback, stopTeleportCallback)
gameState = gameStateGen(map, keys)
hero = heroGen(ctx, config, keys, gameState, updateMap)
enemies = enemiesGen(ctx, ememyConfig, keys, gameState)

updateMap()
gameState.startDayNightCycle()
enemies.addNoise()
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
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  gameState.refresh()
  hero.move(currMap)
  enemies.moveAll(currMap)
  enemies.checkCollisionAll(hero)
  map.draw(currMap)
  hero.draw()
  enemies.drawAll()
  enemies.explosionsPropagateAll()
  hero.drawTeleport()
});
