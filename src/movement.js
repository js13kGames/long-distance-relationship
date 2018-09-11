module.exports = function (config, keys, gameState, updateMap) {

  return {
    roundFloat: function (float) {
      return Math.round(float * 10000) / 10000
    },

    getBlockBorders: function (block, width, height) {
      return {
        top: this.roundFloat((block[1]) * height),
        bottom: this.roundFloat((block[1] + 1) * height),
        left: this.roundFloat((block[0]) * width),
        right: this.roundFloat((block[0] + 1) * width)
      }
    },

    getBorders: function () {
      return {
        top: this.roundFloat(this.posY - 0.5 * this.blockHeight),
        bottom: this.roundFloat(this.posY + 0.5 * this.blockHeight),
        left: this.roundFloat(this.posX - 0.5 * this.blockWidth),
        right: this.roundFloat(this.posX + 0.5 * this.blockWidth)
      }
    },

    collectRepBlock: function (map, x, y) {
      if (map[y][x] === 3) {
        gameState.changeRepairBlock(1)
        map[y][x] = 0
      }
    },

    getBlockIndex: function (pos, max, num) {
      var possibleMax = Math.floor((pos / max) * num)
      return possibleMax > num - 1 ? num - 1 : possibleMax
    },

    move: function (map, index) {
      var numBlocksX = map[0].length
      var numBlocksY = map.length
      this.blockWidth = config.width / numBlocksX
      this.blockHeight = config.height / numBlocksY

      if (this.isHero) {
        // stop if stamina runs out
        if (gameState.data.stamina <= 0) {
          this.speedX = 0
        } else {

          // react to keys being pressed
          if (!keys.left && !keys.right || keys.left && keys.right) this.speedX = 0
          if (keys.left && !keys.right) {
            this.speedX = -1 * config.basicSpeed
            gameState.changeStamina(-0.1)
          }
          if (keys.right && !keys.left) {
            this.speedX = config.basicSpeed
            gameState.changeStamina(-0.1)
          }

          // jump
          if (keys.up && this.accY === 0) {
            this.speedY = -8
            this.accY = config.gravity
            gameState.changeStamina(-0.1)
          }
        }
      } else if (this.accY === 0) {
        this.speedY = -8
        this.accY = config.gravity
      }


      var speedX = this.speedX
      var speedY = this.speedY

      // collision sides
      while (speedX !== 0) {
        var step = speedX > this.blockWidth? this.blockWidth: speedX
        this.posX += step;

        var avatarBlock = [
          this.getBlockIndex(this.posX, config.width, numBlocksX),
          this.getBlockIndex(this.posY, config.height, numBlocksY)
        ]
        var blocksBelow = false

        for (var i = -1; i <= 1; i++) {
          for (var j = -2; j <= 1; j++) {
            // AABB
            var block = this.getBlockBorders([avatarBlock[0] + i, avatarBlock[1] + j], this.blockWidth, this.blockHeight)
            var avatarBorders = this.getBorders()

            if (
              map[avatarBlock[1] + j] && map[avatarBlock[1] + j][avatarBlock[0] + i] &&
              map[avatarBlock[1] + j][avatarBlock[0] + i] > 0 &&
              block.top < avatarBorders.bottom &&
              block.bottom > avatarBorders.top &&
              block.left < avatarBorders.right &&
              block.right > avatarBorders.left
            ) {
              if (this.isHero) this.collectRepBlock(map, avatarBlock[0] + i, avatarBlock[1] + j)
              else if (map[avatarBlock[1] + j][avatarBlock[0] + i] === 2){
                this.destroy(index, true)
                map[avatarBlock[1] + j][avatarBlock[0] + i] = 0
              }

              if (this.speedX > 0) {
                this.posX = block.left - 0.5 * this.blockWidth
                speedX = step

                if (this.isHero) {
                  this.speedX = 0
                  this.accX = 0
                } else {
                  this.speedX *= -1
                }
              } else if (this.speedX < 0) {
                this.posX = block.right + 0.5 * this.blockWidth
                speedX = step

                if (this.isHero) {
                  this.speedX = 0
                  this.accX = 0
                } else {
                  this.speedX *= -1
                }
              }
            } else if (
              j === 1 &&
              block.left < avatarBorders.right &&
              block.right > avatarBorders.left
            ) {
              blocksBelow = blocksBelow || map[avatarBlock[1] + j][avatarBlock[0] + i] > 0
            }
          }
        }

        if (!blocksBelow) this.accY = config.gravity

        speedX -= step
      }

      // collision top/bottom
      while (speedY !== 0) {
        step = speedY > this.blockHeight? this.blockHeight: speedY
        this.posY += step;

        avatarBlock = [
          this.getBlockIndex(this.posX, config.width, numBlocksX),
          this.getBlockIndex(this.posY, config.height, numBlocksY)
        ]

        for (i = -1; i <= 1; i++) {
          for (j = -1; j <= 1; j++) {
            // AABB
            block = this.getBlockBorders([avatarBlock[0] + i, avatarBlock[1] + j], this.blockWidth, this.blockHeight)
            avatarBorders = this.getBorders()

            if (
              map[avatarBlock[1] + j] && map[avatarBlock[1] + j][avatarBlock[0] + i] &&
              map[avatarBlock[1] + j][avatarBlock[0] + i] > 0 &&
              block.top < avatarBorders.bottom &&
              block.bottom > avatarBorders.top &&
              block.left < avatarBorders.right &&
              block.right > avatarBorders.left
            ) {
              if (this.isHero) this.collectRepBlock(map, avatarBlock[0] + i, avatarBlock[1] + j)
              else if (map[avatarBlock[1] + j][avatarBlock[0] + i] === 2){
                this.destroy(index, true)
                map[avatarBlock[1] + j][avatarBlock[0] + i] = 0
              }

              if (this.speedY > 0) {
                this.posY = block.top - 0.5 * this.blockHeight
                speedY = step
                this.speedY = 0
                this.accY = 0
              }
              if (this.speedY < 0) {
                this.posY = block.bottom + 0.5 * this.blockHeight
                speedY = step
                this.speedY = 0
              }
            }
          }
        }
        speedY -= step
      }

      if (this.isHero) {
        // canvas border collision
        if (gameState.currentMapStack.length === 0) {
          if (this.posX < 0) {
            gameState.currentMapStack.push(0)
            this.posX = config.width - this.blockWidth
            this.posY = config.height / 2
            updateMap()
          } else if (this.posX > config.width) {
            gameState.currentMapStack.push(1)
            this.posX = this.blockWidth
            this.posY = config.height / 2
            updateMap()
          }
        } else {
          if (gameState.currentMapStack[0] === 0) {
            if (this.posX < 0) {
              gameState.currentMapStack.push(this.posY < config.height / 2? 0: 1)
              this.posX = config.width - this.blockWidth
              this.posY = config.height / 2
              updateMap()
            } else if (this.posX > config.width) {
              var comingFrom = gameState.currentMapStack.pop()
              this.posX = this.blockWidth
              this.posY = (0.5 * comingFrom + 0.25) * config.height
              updateMap()
            }
          } else {
            if (this.posX < 0) {
              comingFrom = gameState.currentMapStack.pop()
              this.posX = config.width - this.blockWidth
              this.posY = (0.5 * comingFrom + 0.25) * config.height
              updateMap()
            } else if (this.posX > config.width) {
              gameState.currentMapStack.push(this.posY < config.height / 2? 0: 1)
              this.posX = this.blockWidth
              this.posY = config.height / 2
              updateMap()
            }
          }
        }
      } else {
        if (
          this.posX >= config.width ||
          this.posX <= 0
        ) {
          this.speedX *= -1
        }
      }

      this.speedX += this.accX
      this.speedY += this.accY
    },
  };
}
