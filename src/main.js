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
  enemies.update((gameState.currentMapStack.length + gameState.data.daysPassed) / 2)
}

function startTeleportCallback () {
  hero.startTeleport(currMap, updateMap)
}

function stopTeleportCallback () {
  hero.stopTeleport()
}

function pauseCallback () {
  gameState.pause()
}

function addNoise () {
  enemies.addNoise()
}

function heroReset () {
  hero.positionReset()
}

// Init modules
keys = inputs(blockPlaceCallback, blockPickupCallback, startTeleportCallback, stopTeleportCallback, pauseCallback)
map = mapGen(ctx, config)
gameState = gameStateGen(map, keys, addNoise, updateMap, heroReset)
hero = heroGen(ctx, config, keys, gameState, updateMap)
enemies = enemiesGen(ctx, ememyConfig, keys, gameState)

updateMap()
gameState.startDayNightCycle()
addNoise()

raf.start(function() {
  // Clear the screen
  if (!gameState.data.paused) {
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
  }
});
