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

module.exports = function (ctx, config, keys, gameState, updateMap) {
  var init = {
    posX: 500,
    posY: 200
  }

  var gravity = 0.5
  var basicSpeed = 5

  function getBlockIndex (pos, max, num) {
    var possibleMax = Math.floor((pos / max) * num)
    return possibleMax > num - 1 ? num - 1 : possibleMax
  }

  function roundFloat(float) {
    return Math.round(float * 10000) / 10000
  }

  function getBlockBorders(block, width, height) {
    return {
      top: roundFloat((block[1]) * height),
      bottom: roundFloat((block[1] + 1) * height),
      left: roundFloat((block[0]) * width),
      right: roundFloat((block[0] + 1) * width)
    }
  }

  function collectRepBlock (map, x, y) {
    if (map[y][x] === 3) {
      gameState.changeRepairBlock(1)
      map[y][x] = 0
    }
  }

  var hero = {
    posX: 0,
    posY: 0,
    speedX: 0,
    speedY: 0,
    accX: 0,
    accY: gravity,

    getBorders: function () {
      return {
        top: roundFloat(hero.posY - 0.5 * hero.blockHeight),
        bottom: roundFloat(hero.posY + 0.5 * hero.blockHeight),
        left: roundFloat(hero.posX - 0.5 * hero.blockWidth),
        right: roundFloat(hero.posX + 0.5 * hero.blockWidth)
      }
    },

    move: function (map) {
      var numBlocksX = map[0].length
      var numBlocksY = map.length
      hero.blockWidth = config.width / numBlocksX
      hero.blockHeight = config.height / numBlocksY

      // stop if stamina runs out
      if (gameState.data.stamina <= 0) {
        hero.speedX = 0
      } else {

        // react to keys being pressed
        if (!keys.left && !keys.right || keys.left && keys.right) hero.speedX = 0
        if (keys.left && !keys.right) {
          hero.speedX = -1 * basicSpeed
          gameState.changeStamina(-0.1)
        }
        if (keys.right && !keys.left) {
          hero.speedX = basicSpeed
          gameState.changeStamina(-0.1)
        }

        // jump
        if (keys.up && hero.accY === 0) {
          hero.speedY = -8
          hero.accY = gravity
          gameState.changeStamina(-0.1)
        }
      }


      var speedX = hero.speedX
      var speedY = hero.speedY

      // collision sides
      while (speedX !== 0) {
        var step = speedX > hero.blockWidth? hero.blockWidth: speedX
        hero.posX += step;

        var heroBlock = [
          getBlockIndex(hero.posX, config.width, numBlocksX),
          getBlockIndex(hero.posY, config.height, numBlocksY)
        ]
        var blocksBelow = false

        for (var i = -1; i <= 1; i++) {
          for (var j = -2; j <= 1; j++) {
            // AABB
            var block = getBlockBorders([heroBlock[0] + i, heroBlock[1] + j], hero.blockWidth, hero.blockHeight)
            var heroBorders = hero.getBorders()

            if (
              map[heroBlock[1] + j] && map[heroBlock[1] + j][heroBlock[0] + i] &&
              map[heroBlock[1] + j][heroBlock[0] + i] > 0 &&
              block.top < heroBorders.bottom &&
              block.bottom > heroBorders.top &&
              block.left < heroBorders.right &&
              block.right > heroBorders.left
            ) {
              collectRepBlock(map, heroBlock[0] + i, heroBlock[1] + j)

              if (hero.speedX > 0) {
                hero.posX = block.left - 0.5 * hero.blockWidth
                speedX = step
                hero.speedX = 0
                hero.accX = 0
              }
              if (hero.speedX < 0) {
                hero.posX = block.right + 0.5 * hero.blockWidth
                speedX = step
                hero.speedX = 0
                hero.accX = 0
              }
            } else if (
              j === 1 &&
              block.left < heroBorders.right &&
              block.right > heroBorders.left
            ) {
              blocksBelow = blocksBelow || map[heroBlock[1] + j][heroBlock[0] + i] > 0
            }
          }
        }

        if (!blocksBelow) hero.accY = gravity

        speedX -= step
      }

      // collision top/bottom
      while (speedY !== 0) {
        step = speedY > hero.blockHeight? hero.blockHeight: speedY
        hero.posY += step;

        heroBlock = [
          getBlockIndex(hero.posX, config.width, numBlocksX),
          getBlockIndex(hero.posY, config.height, numBlocksY)
        ]

        for (i = -1; i <= 1; i++) {
          for (j = -1; j <= 1; j++) {
            // AABB
            block = getBlockBorders([heroBlock[0] + i, heroBlock[1] + j], hero.blockWidth, hero.blockHeight)
            heroBorders = hero.getBorders()

            if (
              map[heroBlock[1] + j] && map[heroBlock[1] + j][heroBlock[0] + i] &&
              map[heroBlock[1] + j][heroBlock[0] + i] > 0 &&
              block.top < heroBorders.bottom &&
              block.bottom > heroBorders.top &&
              block.left < heroBorders.right &&
              block.right > heroBorders.left
            ) {
              collectRepBlock(map, heroBlock[0] + i, heroBlock[1] + j)

              if (hero.speedY > 0) {
                hero.posY = block.top - 0.5 * hero.blockHeight
                speedY = step
                hero.speedY = 0
                hero.accY = 0
              }
              if (hero.speedY < 0) {
                hero.posY = block.bottom + 0.5 * hero.blockHeight
                speedY = step
                hero.speedY = 0
              }
            }
          }
        }

        speedY -= step
      }

      // canvas border collision
      if (gameState.currentMapStack.length === 0) {
        if (hero.posX < 0) {
          gameState.currentMapStack.push(0)
          hero.posX = config.width - hero.blockWidth
          hero.posY = config.height / 2
          updateMap()
        } else if (hero.posX > config.width) {
          gameState.currentMapStack.push(1)
          hero.posX = hero.blockWidth
          hero.posY = config.height / 2
          updateMap()
        }
      } else {
        if (gameState.currentMapStack[0] === 0) {
          if (hero.posX < 0) {
            gameState.currentMapStack.push(hero.posY < config.height / 2? 0: 1)
            hero.posX = config.width - hero.blockWidth
            hero.posY = config.height / 2
            updateMap()
          } else if (hero.posX > config.width) {
            var comingFrom = gameState.currentMapStack.pop()
            hero.posX = hero.blockWidth
            hero.posY = (0.5 * comingFrom + 0.25) * config.height
            updateMap()
          }
        } else {
          if (hero.posX < 0) {
            comingFrom = gameState.currentMapStack.pop()
            hero.posX = config.width - hero.blockWidth
            hero.posY = (0.5 * comingFrom + 0.25) * config.height
            updateMap()
          } else if (hero.posX > config.width) {
            gameState.currentMapStack.push(hero.posY < config.height / 2? 0: 1)
            hero.posX = hero.blockWidth
            hero.posY = config.height / 2
            updateMap()
          }
        }
      }

      hero.speedX += hero.accX
      hero.speedY += hero.accY
    },

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
        getBlockIndex(hero.posX, config.width, numBlocksX),
        getBlockIndex(hero.posY, config.height, numBlocksY)
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
        getBlockIndex(hero.posX, config.width, numBlocksX),
        getBlockIndex(hero.posY, config.height, numBlocksY)
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
            hero.accY = gravity
            gameState.changeBuildBlock(1)
          }
          break
      }
    }
  }

  hero.posX = init.posX
  hero.posY = init.posY

  return hero
}
