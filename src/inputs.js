module.exports = function(blockCallback) {
  var keys = {
    up: false,
    down: false,
    left: false,
    right: false
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
    }
  }

  onkeypress = function(e) {
    if (e.shiftKey) {
      switch (e.keyCode) {
        case 65:
          blockCallback('left')
          break
        case 87:
          blockCallback('up')
          break
        case 68:
          blockCallback('right')
          break
        case 83:
          blockCallback('down')
          break
      }
    }
  }

  return keys
}
