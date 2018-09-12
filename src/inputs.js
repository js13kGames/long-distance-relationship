module.exports = function(blockPlaceCallback, blockPickupCallback, startTeleportCallback, stopTeleportCallback) {
  var keys = {
    up: false,
    down: false,
    left: false,
    right: false,
  }

  onkeydown = function(e) {
    switch (e.keyCode) {
      case 37:
        keys.left = true
        break
      case 38:
        keys.up = true
        break
      case 39:
        keys.right = true
        break
      case 40:
        keys.down = true
        break
      case 116:
      case 84:
        startTeleportCallback()
        break
    }
  }

  onkeyup = function(e) {
    switch (e.keyCode) {
      case 37:
        keys.left = false
        break
      case 38:
        keys.up = false
        break
      case 39:
        keys.right = false
        break
      case 40:
        keys.down = false
        break
      case 116:
      case 84:
        stopTeleportCallback()
        break
    }
  }

  onkeypress = function(e) {
    if (!e.shiftKey) {
      switch (e.keyCode) {
        case 65:
        case 97:
          blockPlaceCallback('left')
          break
        case 87:
        case 119:
          blockPlaceCallback('up')
          break
        case 68:
        case 100:
          blockPlaceCallback('right')
          break
        case 83:
        case 115:
          blockPlaceCallback('down')
          break
      }
    } else {
      switch (e.keyCode) {
        case 65:
        case 97:
          blockPickupCallback('left')
          break
        case 87:
        case 119:
          blockPickupCallback('up')
          break
        case 68:
        case 100:
          blockPickupCallback('right')
          break
        case 83:
        case 115:
          blockPickupCallback('down')
          break
      }
    }
  }

  return keys
}
