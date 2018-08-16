module.exports = function(ctx, config) {

  var tiles = {
    1: {
      color: '#000'
    },
    0: {
      color: '#fff'
    }
  }

  var _homeMap = []
  for (var i = 0; i < 96; i++) {
    var row = []
    for (var j = 0; j < 128; j++) {
      row.push(i < 80? 0: 1)
    }
    _homeMap.push(row)
  }

  function _basicMap (width, height, emptyPercentage) {
    var entranceHeight = Math.floor(height / 5)
    var result = []

    for (var i = 0; i < height; i++) {
      var row = []
      for (var j = 0; j < width; j++) {
        row.push(
          (j === 0 || j === width - 1 || i === 0 || i === height - 1)?
            1:
            Math.random() > emptyPercentage? 0: 1
        )
      }
      result.push(row)
    }

    // add endtrances
    for (var k = entranceHeight; k <= entranceHeight * 4; k++) {
      if (k > entranceHeight * 2 && k <= entranceHeight * 3) {
        result[k][0] = 0
      } else {
        result[k][width - 1] = 0
      }
    }

    return result
  }

  function _countAliveCellsAround(map, x, y) {
    var result = 0
    for (var i = -1; i <= 1; i++) {
      for (var j = -1; j <= 1; j++) {
        if (i !== 0 || j !== 0) {
          result += map[y + i][x + j]
        }
      }
    }
    return result
  }

  function _doSimulationStep(oldMap, deathLimit, birthLimit) {
    var newMap = []
    for (var i = 0; i < oldMap.length; i++) {
      var row = []
      for (var j = 0; j < oldMap[i].length; j++) {
        if (j === 0 || j === oldMap[i].length - 1 || i === 0 || i === oldMap.length - 1) {
          row.push(oldMap[i][j])
        } else {
          var numOfAliveNeighbours = _countAliveCellsAround(oldMap, j, i)
          if (oldMap[i][j] === 1) {
            row.push(
              (numOfAliveNeighbours < deathLimit)? 0: 1
            )
          } else {
            row.push(
              (numOfAliveNeighbours > birthLimit)? 1: 0
            )
          }
        }
      }
      newMap.push(row)
    }
    return newMap
  }

  return {

    homeMap: _homeMap,

    /**
     * Draw a map on provided canvas
     *
     * @param  {int} [max]
     * @return {int}
     * @api public
     */
    draw: function(map) {
      var blockWidth = config.width / map[0].length
      var blockHeight = config.height / map.length

      map.forEach(function (row, i) {
        row.forEach(function (block, j) {
          ctx.fillStyle = tiles[block].color
          var border = 0
          ctx.fillRect(
            border + j * blockWidth,
            border + i * blockHeight,
            blockWidth - 2 * border,
            blockHeight - 2 * border
          )
        })
      })
    },

    generate: function (width, height, emptyPercentage) {
      var baseMap = _basicMap(width, height, emptyPercentage)
      return _doSimulationStep(_doSimulationStep(baseMap, 2, 3),2,3)
    }
  }
}
