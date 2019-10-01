var canvasMouseX, canvasMouseY;

var WIDTH = 1020
var HEIGHT = 600
var viz, sketch
var audioLoaded = false
const STATE_AUDIO = 0
const STATE_DRAW = 1
var state = -1
var repeating = false
var TOUCH_SHADE_INTERVAL = 200
var MEASURES = '14m'

function createLines (offsetX, offsetY) {
  viz.line(offsetX, 0, offsetX, HEIGHT)
}

var touchStartedTs = 0;
var currentInstrument = 0;
/*
const class Canvas {
  isSelected = false; // if selected for interaction as main canvas

  setup() {
    // change dimensions based on the isSelected or not
  }

  draw() {
    // keep drawing as usual in the desired dimensions
  }

  touchStarted() {
    if (!isSelected) return
  }

  touchEnded() {
    if (!isSelected) return
  }

  touchMoved() {
    if (!isSelected) return
  }
}
*/

function getThickness(currentInstrument) {
  return 10 + (currentInstrument) * 8
}

function getCurrentInstrument() {
  if (touchStartedTs === 0) return 0;
  let touchTimeElapsed = performance.now() - touchStartedTs;
  return Math.min(13, Math.floor(touchTimeElapsed / TOUCH_SHADE_INTERVAL));
}

var bgColor = '#352f44'
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

    viz.textSize(32)
    viz.fill(150)
    viz.text('Preparing stuff', WIDTH / 2 - 100, HEIGHT / 2)
    image(viz, 0, 0, WIDTH, HEIGHT)
    return
  }

  if (state < STATE_DRAW) {
    viz.background(bgColor)

    viz.textSize(32)
    viz.fill(150)
    viz.text('Draw something here', WIDTH / 2 - 150, HEIGHT / 2)
    image(viz, 0, 0, WIDTH, HEIGHT)
    return
  }

  viz.background(150)

  if (playback) {
    createLines(offsetX)
    let totalTime = Tone.Time(MEASURES).toTicks()
    offsetX = (WIDTH / totalTime) * (Tone.Transport.getTicksAtTime() % totalTime)

  }

  if (touchStartedTs > 0) {
    let newInstrument = getCurrentInstrument();
    if (newInstrument != currentInstrument) {
      currentInstrument = newInstrument;
      sketch.strokeWeight(getThickness(currentInstrument))
      sketch.colorMode(HSB)
      let hsl = getHSLFromScale(scaleRoot, scaleType);
      sketch.stroke(hsl[0], (1 - currentInstrument / instruments.length) * hsl[1], hsl[2] + noise(pmouseX, pmouseY) * 5)
      sketch.line(mouseX, mouseY, pmouseX, pmouseY)
    }
  }

  if (offsetX >= WIDTH) { }

  image(sketch, 0, 0)
  image(viz, offsetX - 5, 0, 5, HEIGHT)
  playingYs.forEach(y => {
    image(viz, 0, y, WIDTH, 2)
  })
}

function touchStarted (e) {
  playback = false
  if (Tone.context.state === 'suspended') Tone.context.resume()
  
  touchStartedTs = performance.now();
  
  state = STATE_DRAW

  canvasMouseX = pmouseX;
  canvasMouseY = pmouseY;

}

function touchEnded () {
  
  playback = true

  addToScore(pmouseX, pmouseY, currentInstrument);
  touchStartedTs = 0;
  Tone.Transport.ticks = (offsetX / WIDTH) * Tone.Time(MEASURES).toTicks()
}

function touchMoved () {
  if (state < STATE_AUDIO) return

  if (touchStartedTs != 0) {
    currentInstrument = getCurrentInstrument();
    touchStartedTs = 0;
  }

  if (tool === 0) {
    sketch.strokeWeight(getThickness(currentInstrument))
    sketch.colorMode(HSB)
    let hsl = getHSLFromScale(scaleRoot, scaleType);
    sketch.stroke(hsl[0], (1 - currentInstrument / instruments.length) * hsl[1], hsl[2] + noise(pmouseX, pmouseY) * 5)
    canvasMouseX = pmouseX;
    canvasMouseY = pmouseY;

    addToScore(pmouseX, pmouseY, currentInstrument)
  } else if (tool === 2) {
    sketch.strokeWeight(getThickness(currentInstrument))
    sketch.stroke(97, 111, 57, 100 + noise(pmouseX, pmouseY) * 155)
    
    addToScore(pmouseX, pmouseY, currentInstrument)
  } else {
    sketch.strokeWeight(25)
    sketch.stroke(bgColor)
    removeFromScore(mouseX, mouseY)
  }

  sketch.line(mouseX, mouseY, pmouseX, pmouseY)
  offsetX = pmouseX

  return false
}



var tool = 0 // 0 = pen, 1 = eraser
