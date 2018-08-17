var defaultInit = {
  posX: 4,
  posY: 384
}

module.exports = function (ctx, config, keys, init) {
  init = init || defaultInit
  var gravity = 0.5
  var basicSpeed = 5

  function getBlockIndex (pos, max, num) {
    var possibleMax = Math.floor((pos / max) * num)
    return possibleMax > num - 1 ? num - 1 : possibleMax
  }

  var hero = {
    posX: init.posX,
    posY: init.posY,
    speedX: 0,
    speedY: 0,
    accX: 0,
    accY: gravity,

    move: function(map) {
      var numBlocksX = map[0].length
      var numBlocksY = map.length
      var blockWidth = config.width / numBlocksX
      var blockHeight = config.height / numBlocksY
      var offset = 0

      // react to keys being pressed
      if (!keys.left && !keys.right || keys.left && keys.right) hero.speedX = 0
      if (keys.left && !keys.right) hero.speedX = -1 * basicSpeed
      if (keys.right && !keys.left) hero.speedX = basicSpeed

      // jump
      if (keys.up && hero.accY === 0) {
        hero.speedY = -8
        hero.accY = gravity
      }

      var tempPosX = hero.posX + hero.speedX
      var tempPosY = hero.posY + hero.speedY

      // canvas border collision
      if ((tempPosX - blockWidth / 2) <= 0) tempPosX = blockWidth / 2
      if ((tempPosX + blockWidth / 2) >= config.width) tempPosX = blockWidth / 2
      if ((tempPosY + blockHeight) >= config.height) tempPosY = config.height - blockHeight
      if ((tempPosY - blockHeight) <= 0) {
        tempPosY = blockHeight
        hero.speedY = 0
      }

      // map collision
      hero.left = [(tempPosX - blockWidth / 2) + offset, tempPosY]
      hero.right = [(tempPosX + blockWidth / 2) - offset, tempPosY]
      hero.bottom = [tempPosX, (tempPosY + blockHeight) - offset]
      hero.top = [tempPosX, (tempPosY - blockHeight) + offset]

      // colliding blocks indexes
      hero.leftBlock = [getBlockIndex(hero.left[0], config.width, numBlocksX), getBlockIndex(hero.left[1], config.height, numBlocksY)]
      hero.rightBlock = [getBlockIndex(hero.right[0], config.width, numBlocksX), getBlockIndex(hero.right[1], config.height, numBlocksY)]
      hero.topBlock = [getBlockIndex(hero.top[0], config.width, numBlocksX), getBlockIndex(hero.top[1], config.height, numBlocksY)]
      hero.bottomBlock = [getBlockIndex(hero.bottom[0], config.width, numBlocksX), getBlockIndex(hero.bottom[1], config.height, numBlocksY)]

      if (map[hero.leftBlock[1]][hero.leftBlock[0]] > 0 && hero.speedX < 0) {
        if (map[hero.leftBlock[1]][hero.leftBlock[0]] === 3) console.log('win')
        tempPosX = (hero.leftBlock[0] + 1.5) * blockWidth
        hero.speedX = 0
        hero.accX = 0
      }
      if (map[hero.rightBlock[1]][hero.rightBlock[0]] > 0 && hero.speedX > 0) {
        if (map[hero.rightBlock[1]][hero.rightBlock[0]] === 3) console.log('win')
        tempPosX = (hero.rightBlock[0] - 0.5) * blockWidth
        hero.speedX = 0
        hero.accX = 0
      }
      if ((map[hero.topBlock[1]][hero.topBlock[0]] > 0 && hero.speedY < 0)) {
        if (map[hero.topBlock[1]][hero.topBlock[0]] === 3) console.log('win')
        tempPosY = (hero.topBlock[1] + 2) * blockHeight
        hero.speedY = 0
      }
      if (map[hero.bottomBlock[1]][hero.bottomBlock[0]] > 0 && hero.speedY > 0) {
        if (map[hero.bottomBlock[1]][hero.bottomBlock[0]] === 3) console.log('win')
        tempPosY = (hero.bottomBlock[1] - 1) * blockHeight
        hero.speedY = 0
        hero.accY = 0
      } else if (map[hero.bottomBlock[1]][hero.bottomBlock[0]] === 0) {
        hero.accY = gravity
      }

      hero.posX = tempPosX
      hero.posY = tempPosY
      hero.speedX += hero.accX
      hero.speedY += hero.accY
    },

    draw: function (map) {
      var blockWidth = config.width / map[0].length
      var blockHeight = config.height / map.length
      ctx.fillStyle = '#614433'
      ctx.fillRect(
        hero.posX - blockWidth / 2,
        hero.posY - blockHeight,
        blockWidth,
        blockHeight * 2
      )
      // // Debug - collision points
      // ctx.fillStyle = 'red'
      // ctx.fillRect(hero.left[0]-1, hero.left[1]-1, 2, 2)
      // ctx.fillRect(hero.right[0]-1, hero.right[1]-1, 2, 2)
      // ctx.fillRect(hero.top[0]-1, hero.top[1]-1, 2, 2)
      // ctx.fillRect(hero.bottom[0]-1, hero.bottom[1]-1, 2, 2)
    },

    placeBlock: function (map, direction) {
      switch (direction) {
        case 'left':
          if (map[hero.leftBlock[1]][hero.leftBlock[0]] === 0) {
            map[hero.leftBlock[1]][hero.leftBlock[0]] = 2
          }
          break
        case 'right':
          if (map[hero.rightBlock[1]][hero.rightBlock[0]] === 0) {
            map[hero.rightBlock[1]][hero.rightBlock[0]] = 2
          }
          break
        case 'up':
          if (map[hero.topBlock[1] - 1][hero.topBlock[0]] === 0) {
            map[hero.topBlock[1] - 1][hero.topBlock[0]] = 2
          }
          break
        case 'down':
        if (map[hero.bottomBlock[1] - 1][hero.bottomBlock[0]] === 0) {
          map[hero.bottomBlock[1] - 1][hero.bottomBlock[0]] = 2
        }
        break
      }
    }
  }

  return hero
}
