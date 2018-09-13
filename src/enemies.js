var Movement = require('./movement')

module.exports = function (ctx, config, keys, gameState) {

  var _noises = []
  var _explosions = []
  var mov = Movement(config, keys, gameState)

  function _moveAll (map) {
    _noises.forEach(function (noise, i) {
      noise.move(map, i)
    })
  }

  function _drawAll () {
    _noises.forEach(function (noise) {
      noise.draw()
    })
  }

  function _checkCollisionAll (hero) {
    _noises.forEach(function (noise, i) {
      noise.checkCollision(hero, i)
    })
  }

  function _explosionsPropagateAll () {
    _explosions.forEach(function (explosion, i) {
      explosion.propagate(i)
    })
  }

  function _addExplosion(noise) {
    var explosion = {
      posX: noise.posX,
      posY: noise.posY,
      state: 12
    }
    explosion.draw = function () {
      var tempLineWidth = ctx.lineWidth
      ctx.lineWidth = 3
      ctx.strokeStyle='red';
      ctx.beginPath()
      ctx.arc(
        explosion.posX,
        explosion.posY,
        12 - explosion.state,
        0,
        2*Math.PI
      )
      ctx.stroke()
      ctx.lineWidth = tempLineWidth
    }
    explosion.propagate = function (i) {
      explosion.state -= 1
      if (explosion.state < 0) _explosions.splice(i, 1)
      else explosion.draw()
    }
    _explosions.push(explosion)
  }

  function _addNoise () {
    var noise = {
      posX: Math.random() * (config.width - 20) + 10,
      posY: Math.random() * (config.height - 20) + 10,
      speedX: config.basicSpeed,
      speedY: 0,
      accX: 0,
      accY: config.gravity,
      isnoise: true,

      draw: function () {
        ctx.fillStyle = '#614433'
        ctx.fillRect(
          noise.posX - noise.blockWidth / 2,
          noise.posY - noise.blockHeight / 2,
          noise.blockWidth,
          noise.blockHeight
        )
      },

      checkCollision: function (hero, i) {
        var noiseBorders = noise.getBorders()
        var heroBorders = hero.getBorders()
        if (
          noiseBorders.top < heroBorders.bottom &&
          noiseBorders.bottom > heroBorders.top &&
          noiseBorders.left < heroBorders.right &&
          noiseBorders.right > heroBorders.left
        ) {
          noise.destroy(i)
        }
      },

      destroy: function (i, type) {
        if (!type) gameState.changeStamina(-20)
        else if (type === 'home') gameState.changeHealth(-10)
        _addExplosion(noise)
        _noises.splice(i, 1)
      }
    }
    noise.move = mov.move.bind(noise)
    noise.roundFloat = mov.roundFloat.bind(noise)
    noise.getBlockBorders = mov.getBlockBorders.bind(noise)
    noise.getBorders = mov.getBorders.bind(noise)
    noise.handleRepBlock = mov.handleRepBlock.bind(noise)
    noise.getBlockIndex = mov.getBlockIndex.bind(noise)

    _noises.push(noise)
  }

  function _update (diff) {
    _noises.splice(0, _noises.length)
    for (var i = 0; i < diff; i++){
      if (Math.random() > 0.5 || gameState.data.night) _addNoise()
    }
  }

  return {
    noises: _noises,
    moveAll: _moveAll,
    drawAll: _drawAll,
    addNoise: _addNoise,
    checkCollisionAll: _checkCollisionAll,
    explosionsPropagateAll: _explosionsPropagateAll,
    update: _update
  }
}
