module.exports = function (map) {
  // Init world map
  var currentMapStack = []
  var MAP_WIDTH = 128
  var MAP_HEIGHT = 96
  var maps = {
    home: map.homeMap,
    children: [
      {map: map.generate(MAP_WIDTH, MAP_HEIGHT, true)},
      {map: map.generate(MAP_WIDTH, MAP_HEIGHT)}
    ]
  }

  function _getCurrentMap () {
    if (currentMapStack.length < 1) return maps.home

    var currentMapObj = maps
    for (var i = 0; i < currentMapStack.length; i++) {
      var index = currentMapStack[i]

      if (!currentMapObj.children) {
        currentMapObj.children = [
          {map: map.generate(MAP_WIDTH, MAP_HEIGHT, currentMapStack[0] === 0)},
          {map: map.generate(MAP_WIDTH, MAP_HEIGHT, currentMapStack[0] === 0)}
        ]
      }
      currentMapObj = currentMapObj.children[index]
    }
    return currentMapObj.map
  }

  return {
    getCurrentMap: _getCurrentMap,
    currentMapStack: currentMapStack
  }
}
