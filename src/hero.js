var defaultInit = {
  posX: 512,
  posY: 0
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
        hero.speedY = -10
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
      var left = [getBlockIndex(hero.left[0], config.width, numBlocksX), getBlockIndex(hero.left[1], config.height, numBlocksY)]
      var right = [getBlockIndex(hero.right[0], config.width, numBlocksX), getBlockIndex(hero.right[1], config.height, numBlocksY)]
      var top = [getBlockIndex(hero.top[0], config.width, numBlocksX), getBlockIndex(hero.top[1], config.height, numBlocksY)]
      var bottom = [getBlockIndex(hero.bottom[0], config.width, numBlocksX), getBlockIndex(hero.bottom[1], config.height, numBlocksY)]

      if (map[left[1]][left[0]] === 1 && hero.speedX < 0) {
        tempPosX = (left[0] + 1.5) * blockWidth
        hero.speedX = 0
        hero.accX = 0
      }
      if (map[right[1]][right[0]] === 1 && hero.speedX > 0) {
        tempPosX = (right[0] - 0.5) * blockWidth
        hero.speedX = 0
        hero.accX = 0
      }
      if ((map[top[1]][top[0]] === 1 && hero.speedY < 0)) {
        tempPosY = (top[1] + 2) * blockHeight
        hero.speedY = 0
      }
      if (map[bottom[1]][bottom[0]] === 1 && hero.speedY > 0) {
        tempPosY = (bottom[1] - 1) * blockHeight
        hero.speedY = 0
        hero.accY = 0
      } else if (map[bottom[1]][bottom[0]] === 0) {
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
    }
  }

  return hero
}
