/* *****************************************************************************
 ->
|
v
                0     1     2
                *-----*-----*
                |           |
              9 *           * 3
                |           |
                |     X     |
                |           |
              8 *           * 4
                |           |
                *-----*-----*
                7     6     5

***************************************************************************** */
var Movement = require('./movement')

module.exports = function (ctx, config, keys, gameState, updateMap) {
  var init = {
    posX: 500,
    posY: 200
  }

  var mov = Movement(config, keys, gameState, updateMap)
  var teleportTimeout
  var teleportCircleCircumference = 0

  var hero = {
    posX: 0,
    posY: 0,
    speedX: 0,
    speedY: 0,
    accX: 0,
    accY: config.gravity,
    isHero: true,

    draw: function () {
      ctx.fillStyle = '#614433'
      ctx.fillRect(
        hero.posX - hero.blockWidth / 2,
        hero.posY - hero.blockHeight / 2,
        hero.blockWidth,
        hero.blockHeight
      )
    },

    placeBlock: function (map, direction) {
      var numBlocksX = map[0].length
      var numBlocksY = map.length
      var heroBlock = [
        hero.getBlockIndex(hero.posX, config.width, numBlocksX),
        hero.getBlockIndex(hero.posY, config.height, numBlocksY)
      ]

      if (gameState.data.buildBlocks > 0) {
        switch (direction) {
          case 'left':
            if (map[heroBlock[1]][heroBlock[0] - 1] === 0) {
              map[heroBlock[1]][heroBlock[0] - 1] = 2
            }
            break
          case 'right':
            if (map[heroBlock[1]][heroBlock[0] + 1] === 0) {
              map[heroBlock[1]][heroBlock[0] + 1] = 2
              gameState.changeBuildBlock(-1)
            }
            break
          case 'up':
            if (map[heroBlock[1] - 1][heroBlock[0]] === 0) {
              map[heroBlock[1] - 1][heroBlock[0]] = 2
              gameState.changeBuildBlock(-1)
            }
            break
          case 'down':
            if (hero.speedY !== 0) {
              if (map[heroBlock[1] + 1][heroBlock[0]] === 0) {
                map[heroBlock[1] + 1][heroBlock[0]] = 2
                gameState.changeBuildBlock(-1)
              }
            } else {
              if (map[heroBlock[1] - 1][heroBlock[0]] < 1) {
                hero.posY -= hero.blockHeight
                map[heroBlock[1]][heroBlock[0]] = 2
                gameState.changeBuildBlock(-1)
              }
            }
            break
        }
      }
    },

    pickupBlock: function (map, direction) {
      var numBlocksX = map[0].length
      var numBlocksY = map.length
      var heroBlock = [
        hero.getBlockIndex(hero.posX, config.width, numBlocksX),
        hero.getBlockIndex(hero.posY, config.height, numBlocksY)
      ]

      switch (direction) {
        case 'left':
          if (map[heroBlock[1]][heroBlock[0] - 1] === 2) {
            map[heroBlock[1]][heroBlock[0] - 1] = 0
            gameState.changeBuildBlock(1)
          }
          break
        case 'right':
          if (map[heroBlock[1]][heroBlock[0] + 1] === 2) {
            map[heroBlock[1]][heroBlock[0] + 1] = 0
            gameState.changeBuildBlock(1)
          }
          break
        case 'up':
          if (map[heroBlock[1] - 1][heroBlock[0]] === 2) {
            map[heroBlock[1] - 1][heroBlock[0]] = 0
            gameState.changeBuildBlock(1)
          }
          break
        case 'down':
          if (map[heroBlock[1] + 1][heroBlock[0]] === 2) {
            map[heroBlock[1] + 1][heroBlock[0]] = 0
            hero.accY = config.gravity
            gameState.changeBuildBlock(1)
          }
          break
      }
    },

    drawTeleport: function () {
      var tempLineWidth = ctx.lineWidth
      ctx.lineWidth = 3
      ctx.strokeStyle='blue';
      ctx.beginPath()
      ctx.arc(
        hero.posX,
        hero.posY,
        teleportCircleCircumference,
        0,
        2*Math.PI
      )
      ctx.stroke()
      ctx.lineWidth = tempLineWidth
    },

    startTeleport: function (map, updateMap) {

      teleportCircleCircumference += 0.15

      if (!teleportTimeout) {
        teleportTimeout = setTimeout(function () {
          // block dump
          if (gameState.data.buildBlocks > 0 || gameState.data.repairBlocks > 0) {
            var numBlocksX = map[0].length
            var numBlocksY = map.length
            var heroBlock = [
              hero.getBlockIndex(hero.posX, config.width, numBlocksX),
              hero.getBlockIndex(hero.posY, config.height, numBlocksY)
            ]

            var numBlocks = gameState.data.buildBlocks + gameState.data.repairBlocks
            var side = Math.sqrt(numBlocks)
            var offset = Math.min(Math.floor(side / 2), heroBlock[0]) * -1
            while ((gameState.data.buildBlocks > 0 || gameState.data.repairBlocks > 0) && heroBlock[1] > 0) {
              for (var i = 0; i < side; i++) {
                var x = heroBlock[0] + offset + i
                if (map[heroBlock[1]][x] === 0) {
                  if (gameState.data.repairBlocks > 0) {
                    map[heroBlock[1]][x] = 3
                    gameState.changeRepairBlock(-1)
                  } else if (gameState.data.buildBlocks > 0) {
                    map[heroBlock[1]][x] = 2
                    gameState.changeBuildBlock(-1)
                  }
                }
              }
              heroBlock[1] -= 1
            }
          }
          gameState.changeBuildBlock(gameState.data.buildBlocks * -1)
          gameState.changeRepairBlock(gameState.data.repairBlocks * -1)

          // reposition
          hero.posX = init.posX
          hero.posY = init.posY
          hero.accY = config.gravity
          gameState.currentMapStack.splice(0, gameState.currentMapStack.length)
          updateMap()
          teleportTimeout = null
          teleportCircleCircumference = 0
        }, 2000)
      }
    },

    stopTeleport: function () {
      if (teleportTimeout) {
        clearTimeout(teleportTimeout)
        teleportTimeout = null
        teleportCircleCircumference = 0
      }
    }
  }

  hero.posX = init.posX
  hero.posY = init.posY
  hero.move = mov.move.bind(hero)
  hero.roundFloat = mov.roundFloat.bind(hero)
  hero.getBlockBorders = mov.getBlockBorders.bind(hero)
  hero.getBorders = mov.getBorders.bind(hero)
  hero.handleRepBlock = mov.handleRepBlock.bind(hero)
  hero.getBlockIndex = mov.getBlockIndex.bind(hero)

  return hero
}
