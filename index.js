// state
const game = {
  screen: true,
  map: [
    [1,0,0,0,0,0,1,0],
    [1,1,1,0,0,0,1,0],
    [0,0,1,1,1,1,1,1],
    [0,0,1,0,0,0,0,1],
    [0,1,1,1,1,1,0,1],
    [0,0,0,0,0,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0],
  ],
  rootElement: document.querySelector('#root'),
  mapElement: null,
  objects: {
    player: {
      id: 'player',
      type: 'player',
      x: 0,
      y: 0,
      maxHealth: 100,
      health: 100,
      attack: 25,
    },
    monster1: {
      id: 'monster1',
      type: 'monster',
      unitId: 'fallen',
      x: 2,
      y: 2,
      maxHealth: 50,
      health: 50,
      attack: 5,
    },
    monster2: {
      id: 'monster2',
      type: 'monster',
      unitId: 'fallen',
      x: 4,
      y: 4,
      maxHealth: 300,
      health: 300,
      attack: 2,
    },
    monster3: {
      id: 'monster3',
      type: 'monster',
      unitId: 'fallen',
      x: 7,
      y: 3,
      maxHealth: 50,
      health: 50,
      attack: 5,
    },
    monster4: {
      id: 'monster4',
      type: 'monster',
      unitId: 'zombie',
      x: 1,
      y: 6,
      maxHealth: 45,
      health: 45,
      attack: 15,
    },
  },
}


// ################# utils
const isPath = (x,y) => game.map?.[y]?.[x] === 1

const getTile = (x,y)  => {
  const length = game.map[y].length
  const index = ( y * length ) + x
  return game.mapElement.childNodes?.[index]
}

const getTilePosition = (x,y) => {
  return getTile(x,y).getBoundingClientRect()
}

const getTileElements = (map) => {
  return map
    .reduce((list, items) => list.concat(items))
    .map(isPath => {
      const element = document.createElement('div')
      element.className = `tile tile${isPath ? 'Path' : 'Wall'}`
      const randomInt = Math.floor((Math.random() * 4) + 0);
      element.classList.add(`rotate${randomInt}`)
      return element
    })
}

const getObject = (x,y) => {
  return Object.values(game.objects).find(object => object.x === x && object.y === y)
}

const interactWithObject = (object) => {
  const player = game.objects.player
  // fight monster
  if(object.type === 'monster' && object.health > 0){
    object.health -= player.attack
    player.health -= object.attack
    if(object.health < 0) object.health = 0
    if(player.health < 0) player.health = 0
  }
}


// ################# detect and handle events
const handleStartClick = (event) => {
  game.screen = false
  render()
}

const handleRestartClick = () => {
  location.reload()
}

const handleInput = (event) => {

  if(game.screen) return

  // get players next position
  const next = {
    x: game.objects.player.x,
    y: game.objects.player.y
  }

  const key = event.key
  if(key === 'ArrowRight') next.x += 1
  else if(key === 'ArrowLeft') next.x -= 1
  else if(key === 'ArrowDown') next.y += 1
  else if(key === 'ArrowUp') next.y -= 1

  // check that next position can be walked
  if(!isPath(next.x, next.y)) return

  // check that there is not an object in the way
  const object = getObject(next.x, next.y)
  if(object) interactWithObject(object)

  // update
  if(!object || !object.health){
    game.objects.player.x = next.x
    game.objects.player.y = next.y
  }
  render()
}


// ################# render
const render = () => {
  _renderScreens()
  _renderMap()
  _renderMapObjects()
}

const _renderMap = () => {
  if(game.mapElement) return false

  const mapElement = document.createElement('div')
  mapElement.id = 'map'
  mapElement.className = 'map'
  mapElement.style.width = (game.map[0].length * 95) + 'px'

  for(let tile of getTileElements(game.map)){
    mapElement.appendChild(tile)
  }

  game.mapElement = mapElement
  game.rootElement.appendChild(mapElement)

  return true
}

const _renderMapObjects = () => {
  for(let key in game.objects){
    _renderObject(game.objects[key])
  }
}

const _renderObject = (object) => {

  // inject dom element
  const elementKey = object.id + 'Element'
  let element = game[elementKey]

  let healthBar = null
  let healthIndicator = null

  if(!element){
    element = document.createElement('div')
    element.className = object.type
    if(object.unitId) element.classList.add(object.unitId)
    game.rootElement.appendChild(element)
    game[elementKey] = element

    if(object.health){
      healthBar = document.createElement('div')
      healthBar.classList.add('healthBar')
      healthBar.classList.add('hidden')
      healthIndicator = document.createElement('div')
      healthIndicator.classList.add('healthIndicator')
      healthBar.appendChild(healthIndicator)
      element.appendChild(healthBar)
    }
  }

  // health bar
  if(object.health !== undefined){
    const curentHealthPercent = object.health / object.maxHealth * 100
    if(curentHealthPercent !== 100){
      healthBar = element.childNodes[0]
      healthBar.classList.remove('hidden')
      healthIndicator = element.childNodes[0].childNodes[0]
      healthIndicator.style.width = curentHealthPercent + '%'
    }
  }

  // dead state
  if(object.type === 'monster' && object.health === 0){
    element.classList.add('dead')
    return
  }

  // position
  const { top: tileTop, left: tileLeft } = getTilePosition(object.x, object.y)
  element.style.top = tileTop + 1 + 'px'
  element.style.left = tileLeft + 1+ 'px'
}

const _renderScreens = () => {

  // start screen
  document.getElementById('startScreen').style.display = game.screen ? 'block' : 'none'

  // death screen
  if(game.objects.player.health === 0){
    game.screen = true
    document.getElementById('deathScreen').style.display = 'block'
    return
  }

  // winner screen
  if(
    game.objects.monster1.health === 0 &&
    game.objects.monster2.health === 0 &&
    game.objects.monster3.health === 0 &&
    game.objects.monster4.health === 0
    ) {
      game.screen = true
      document.getElementById('winnerScreen').style.display = 'block'
      return
    }
}


// ################# main
render()
window.addEventListener('keydown', handleInput)
