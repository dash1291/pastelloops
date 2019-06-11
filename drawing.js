var x, y
var WIDTH = 900
var HEIGHT = 900
var viz, sketch
var audioLoaded = false
const STATE_AUDIO = 0
const STATE_DRAW = 1
var state = -1
var repeating = false

function createLines (offsetX, offsetY) {
  viz.line(offsetX, 0, offsetX, HEIGHT)
}

var bgColor = '#dbd8e3'
//how can i set this bgColor to 0% opacity?//
function setup () {
  cursor(CROSS)
  if (windowHeight < HEIGHT) {
    HEIGHT = windowHeight * 0.7
  }

  if (windowWidth < WIDTH) {
    WIDTH = windowWidth
  }

  createCanvas(WIDTH, HEIGHT).parent('sketch-canvas')
  // Starts in the middle

  frameRate(30)
  viz = createGraphics(WIDTH, HEIGHT)
  sketch = createGraphics(WIDTH, HEIGHT)
  sketch.background(bgColor)
}

var offsetX = 0
function draw () {
  if (state < STATE_AUDIO) {
    viz.background(bgColor)

    viz.textSize(20)
    viz.fill(300)
    viz.text('Preparing stuff', WIDTH / 2 - 60, HEIGHT / 2)
    image(viz, 0, 0, WIDTH, HEIGHT)
    return
  }

  if (state < STATE_DRAW) {
    viz.background(bgColor)

    viz.textSize(20)
    viz.fill(300)
    viz.text('Scribble, quibble, dribble, you know what to do. Hit spacebar when you’re done.', WIDTH / 2 - 300, HEIGHT / 2)
    image(viz, 0, 0, WIDTH, HEIGHT)
    return
  }

  viz.background(150)

  if (playback) {
    createLines(offsetX)
    offsetX++
  }

  if (offsetX >= WIDTH) { offsetX = 0; repeating = true }

  image(sketch, 0, 0)
  image(viz, offsetX - 5, 0, 5, HEIGHT)
}

function touchStarted () {
  playback = false
  if (Tone.context.state === 'suspended') Tone.context.resume()
}

function touchEnded () {
  playback = true
}

function touchMoved () {
  if (state < STATE_AUDIO) return

  state = STATE_DRAW

  if (tool === 0) {
    sketch.strokeWeight(5)
    sketch.stroke(200, 100, 0)
  } else if (tool === 2) {
    sketch.strokeWeight(5)
    sketch.stroke(50, 150, 100)
  } else {
    sketch.strokeWeight(10)
    sketch.stroke(bgColor)
  }

  sketch.line(mouseX, mouseY, pmouseX, pmouseY)
  offsetX = pmouseX
  playLine()

  return false
}

function getPixel (y) {
  return sketch.get(offsetX, y)
}

function lightPixel (y) {
  viz.stroke(100, 200, 0)
  viz.fill(100, 200, 0)
  viz.line(offsetX, y, offsetX, y + 100)
  viz.updatePixels()
}

var pencil = document.querySelector('#toolbox__pencil')
var pencil2 = document.querySelector('#toolbox__pencil-2')
var eraser = document.querySelector('#toolbox__eraser')

var tool = 0 // 0 = pen, 1 = eraser


pencil.onclick = function (e) {
  tool = 0
  eraser.classList.remove('toolbox__item--selected')
  pencil2.classList.remove('toolbox__item--selected')
  pencil.classList.add('toolbox__item--selected')
}

pencil2.onclick = function (e) {
  tool = 2
  eraser.classList.remove('toolbox__item--selected')
  pencil.classList.remove('toolbox__item--selected')
  pencil2.classList.add('toolbox__item--selected')
}

eraser.onclick = function (e) {
  tool = 1
  eraser.classList.add('toolbox__item--selected')
  pencil.classList.remove('toolbox__item--selected')
  pencil2.classList.remove('toolbox__item--selected')
}
