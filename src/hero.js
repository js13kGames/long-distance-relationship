var defaultInit = {
  posX: 512,
  posY: 384
}

module.exports = function (ctx, config, keys, init) {
  init = init || defaultInit
  var gravity = 0.2
  var basicSpeed = 5

  function getBlockIndex (pos, max, num) {
    return Math.floor((pos / max) * num)
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
      var offset = 1

      // react to keys being pressed
      if (!keys.left && !keys.right || keys.left && keys.right) hero.speedX = 0
      if (keys.left && !keys.right) hero.speedX = -1 * basicSpeed
      if (keys.right && !keys.left) hero.speedX = basicSpeed

      // jump
      if (keys.up && hero.accY === 0) {
        hero.speedY = -5
        hero.accY = gravity
      }

      // map collision
      hero.left = [(hero.posX - blockWidth / 2) + offset, hero.posY]
      hero.right = [(hero.posX + blockWidth / 2) - offset, hero.posY]
      hero.bottom = [hero.posX, (hero.posY + blockHeight) - offset]
      hero.top = [hero.posX, (hero.posY - blockHeight) + offset]

      // colliding blocks indexes
      var left = [getBlockIndex(hero.left[0], config.width, numBlocksX), getBlockIndex(hero.left[1], config.height, numBlocksY)]
      var right = [getBlockIndex(hero.right[0], config.width, numBlocksX), getBlockIndex(hero.right[1], config.height, numBlocksY)]
      var top = [getBlockIndex(hero.top[0], config.width, numBlocksX), getBlockIndex(hero.top[1], config.height, numBlocksY)]
      var bottom = [getBlockIndex(hero.bottom[0], config.width, numBlocksX), getBlockIndex(hero.bottom[1], config.height, numBlocksY)]

      if (map[left[1]][left[0]] === 1 && hero.speedX < 0) {
        hero.speedX = 0
        hero.accX = 0
        hero.posX += (left[0] + 1) * blockWidth - hero.left[0] - basicSpeed
      }
      if (map[right[1]][right[0]] === 1 && hero.speedX > 0) {
        hero.speedX = 0
        hero.accX = 0
        hero.posX += right[0] * blockWidth - hero.right[0]
      }
      if (map[top[1]][top[0]] === 1 && hero.speedY < 0) {
        hero.speedY = 0
        hero.posY -= (top[1] + 1) * blockHeight - hero.top[1]
      }
      if (map[bottom[1]][bottom[0]] === 1 && hero.speedY > 0) {
        hero.speedY = 0
        hero.accY = 0
        hero.posY += bottom[1] * blockHeight - hero.bottom[1]
      } else if (map[bottom[1]][bottom[0]] === 0) {
        hero.accY = gravity
      }

      hero.speedX += hero.accX
      hero.speedY += hero.accY
      hero.posX += hero.speedX
      hero.posY += hero.speedY
    },

    setAcceleration: function(x,y) {
      hero.accX = x
      hero.accY = y
    },

    setSpeed: function(x,y) {
      hero.speedX = x
      hero.speedY = y
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
      // Debug - collision points
      ctx.fillStyle = 'red'
      ctx.fillRect(hero.left[0]-1, hero.left[1]-1, 2, 2)
      ctx.fillRect(hero.right[0]-1, hero.right[1]-1, 2, 2)
      ctx.fillRect(hero.top[0]-1, hero.top[1]-1, 2, 2)
      ctx.fillRect(hero.bottom[0]-1, hero.bottom[1]-1, 2, 2)
    }
  }

  return hero
}
