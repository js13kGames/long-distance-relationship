module.exports = function(ctx, config) {

  var tiles = {
    1: {
      // ground
      color: '#5A5A5A'
    },
    0: {
      // air
      color: '#898989'
    },
    2: {
      // build
      color: '#FBDF5B'
    },
    3: {
      // repair
      color: '#d30000'
    },
    10: {
      // home
      color: '#CACACA'
    },
    11: {
      color: '#007100'
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

  var phonebox = [
    [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
    [10, 10, 10, 10, 11, 11, 11, 11, 11, 10],
    [10, 10, 10, 11, 11, 11, 11, 11, 10, 10],
    [10, 10, 11, 11, 10, 10, 11, 10, 10, 10],
    [10, 11, 11, 10, 10, 10, 10, 10, 10, 10],
    [10, 11, 11, 10, 10, 10, 10, 10, 10, 10],
    [10, 11, 11, 11, 10, 10, 10, 10, 10, 10],
    [10, 11, 11, 10, 10, 10, 10, 10, 10, 10],
    [10, 11, 10, 10, 10, 10, 10, 10, 10, 10],
    [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
  ]
  phonebox.forEach(function(row, i) {
    row.forEach(function(cell, j) {
      _homeMap[70 + i][57 + j] = cell
    })
  })

  function _basicMap (width, height, emptyPercentage, flipped) {
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
        result[k][flipped? width - 1: 0] = 0
      } else {
        result[k][flipped? 0: width - 1] = 0
      }
    }

    // add bar
    for (
      var l = flipped? 0: Math.floor(width / 2);
      l < (flipped? Math.floor(width / 2): width);
      l++
    ) {
      var midHeight = Math.floor(height/2);
      for (var m = -1; m <= 1; m++) {
        result[midHeight + m][l] = 1;
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

function _addTreasure(map, amount, type) {
  var randHeight, randWidth

  for (var i = 0; i < amount; i++) {
    do {
      randHeight = Math.floor(Math.random() * map.length)
      randWidth = Math.floor(Math.random() * map[0].length)
    } while (map[randHeight][randWidth] !== 0)
    map[randHeight][randWidth] = type
  }
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

    generate: function (width, height, flipped, diff) {
      var fillAmount = 0.43 + diff / 100 > 0.49 ? 0.49 : 0.43 + diff / 100
      var map = _basicMap(width, height, fillAmount, flipped)
      for (var i = 0; i < 10; i++) {
        map = _doSimulationStep(map, 4, 4)
      }
      _addTreasure(map, 1 + diff, 3);
      _addTreasure(map, 1.5 * diff + 3, 2);
      return map
    }
  }
}
