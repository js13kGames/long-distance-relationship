module.exports = function (map, keys) {
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

  var data = {
    time: 0,
    night: false,
    repairBlocks: 0,
    buildBlocks: 20,
    stamina: 100,
    health: 100
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

  var dayNightProgress = document.getElementById('day-night')
  var staminaProgress = document.getElementById('stamina')
  var healthProgress = document.getElementById('health')
  var buildBlocksCount = document.getElementById('build-blocks')
  var repairBlocksCount = document.getElementById('rep-blocks')

  function _startDayNightCycle() {
    setInterval(function () {
      data.time += 0.25

      if (data.timelue >= 70) data.night = true

      if (data.time >= 100) {
        _startNewDay()
        data.time = 0
      }
      dayNightProgress.setAttribute('value', data.time)
    }, 1000)
  }

  function _startNewDay () {
    data.night = false
  }


  function _changeBuildBlock (num) {
    data.buildBlocks += num
    buildBlocksCount.innerHTML = data.buildBlocks
  }

  function _changeRepairBlock (num) {
    data.repairBlocks += num
    repairBlocksCount.innerHTML = data.repairBlocks
  }

  function _changeStamina (num) {
    data.stamina += num
    staminaProgress.setAttribute('value', data.stamina)
  }

  function _changeHealth (num) {
    data.health += num
    healthProgress.setAttribute('value', data.health)
  }

  function _refresh () {
    // start resoring stamina if no keys pressed
    if (data.stamina < 100 && !keys.up && !keys.left && !keys.right) {
      _changeStamina(0.2)
    }
  }

  return {
    data: data,
    getCurrentMap: _getCurrentMap,
    currentMapStack: currentMapStack,
    startDayNightCycle: _startDayNightCycle,
    changeBuildBlock: _changeBuildBlock,
    changeRepairBlock: _changeRepairBlock,
    changeStamina: _changeStamina,
    changeHealth: _changeHealth,
    refresh: _refresh
  }
}
