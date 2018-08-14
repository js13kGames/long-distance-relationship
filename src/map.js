module.exports = function(ctx, config) {

  var tiles = {
    1: {
      color: '#000'
    },
    0: {
      color: '#fff'
    }
  }

  var homeMap = []
  for (var i = 0; i < 48; i++) {
    var row = []
    for (var j = 0; j < 64; j++) {
      row.push(i < 40? 0: 1)
    }
    homeMap.push(row)
  }

  return {

    homeMap: homeMap,

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
          ctx.fillRect(
            1 + j * blockWidth,
            1 + i * blockHeight,
            blockWidth - 2,
            blockHeight - 2
          )
        })
      })
    },

    generate: function (sizeX, sizeY) {
      var map = []
      for (var i = 0; i < sizeY; i++) {
        var row = []
        for (var j = 0; j < sizeX; j++) {
          row.push((sizeY - i + 20 > j) && (i < j) ? 0: 1)
        }
        map.push(row)
      }
      return map
    }
  }
}
