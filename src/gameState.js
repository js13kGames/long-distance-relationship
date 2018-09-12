module.exports = function (map, keys, addNoise) {
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
    phoneCallTime: 10,
    phoneRinging: false,
    daysPassed: 0,
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
  var callIndicator = document.getElementById('call')

  function _startDayNightCycle() {
    setInterval(function () {
      data.time += 0.5

      // phonecall
      if (data.time > data.phoneCallTime && data.time < data.phoneCallTime + 5 && !data.phoneRinging){
        data.phoneRinging = true
        callIndicator.className += ' ringing'
      }
      if (data.time > data.phoneCallTime + 5 && data.phoneRinging) {
        _missPhoneCall()
      }

      // night
      if (data.time >= 70) {
        data.night = true
        var threshold = (80 - data.daysPassed - currentMapStack.length) / 100
        if (Math.random() > threshold) addNoise()
      }

      // end of day
      if (data.time >= 100) {
        _startNewDay()
        data.time = 0
      }
      dayNightProgress.setAttribute('value', data.time)
    }, 1000)
  }

  function _startNewDay () {
    data.phoneCallTime = Math.floor(Math.random() * 80)
    data.night = false
    data.daysPassed += 1
    callIndicator.setAttribute('style', 'left: ' + data.phoneCallTime + '%')
  }

  function _missPhoneCall () {
    callIndicator.className = callIndicator.className.replace(' ringing', '')
    _changeHealth(-30)
    data.phoneRinging = false
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
    if (data.health <= 0) _gameOver()
  }

  function _refresh () {
    // start restoring stamina if no keys pressed
    if (data.stamina < 100 && !keys.up && !keys.left && !keys.right) {
      _changeStamina(0.2)
    }
  }

  function _gameOver () {
    console.log('game over')
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
