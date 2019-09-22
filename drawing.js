var x, y

var WIDTH = 1200
var HEIGHT = 600
var viz, sketch
var audioLoaded = false
const STATE_AUDIO = 0
const STATE_DRAW = 1
var state = -1
var repeating = false

function createLines (offsetX, offsetY) {
  viz.line(offsetX, 0, offsetX, HEIGHT)
}

var touchStartedTs = 0;
var currentInstrument = 0;

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
    offsetX++
  }

  if (touchStartedTs > 0) {
    let touchTimeElapsed = performance.now() - touchStartedTs;
    currentInstrument = Math.min(13, Math.floor(touchTimeElapsed / 100));
    sketch.strokeWeight(10 + (currentInstrument + 1) * 10)
    sketch.stroke(100 + (currentInstrument * 10), 131 + (currentInstrument * 5), 100 + (currentInstrument * 20), 100 + noise(pmouseX, pmouseY) * 155)
    sketch.line(mouseX, mouseY, pmouseX, pmouseY)
  }

  if (offsetX >= WIDTH) { offsetX = 0; repeating = true }

  image(sketch, 0, 0)
  image(viz, offsetX - 5, 0, 5, HEIGHT)
}

function touchStarted (e) {
  playback = false
  if (Tone.context.state === 'suspended') Tone.context.resume()
  
  touchStartedTs = performance.now();
  state = STATE_DRAW

}

function touchEnded () {
  playback = true

}

function touchMoved () {
  if (state < STATE_AUDIO) return

  if (touchStartedTs != 0) {
    let touchTimeElapsed = performance.now() - touchStartedTs;
    // create synth node with elapsed time  
    console.log(touchTimeElapsed)
    let synth3 = new Tone.PolySynth(5, Tone.Synth, {
      oscillator: {
        type: 'sawtooth',
        //partials: [1, 0.2, 0.01]
      },
      'envelope': {
        // "attackCurve" : 'linear',
        'attack': touchTimeElapsed/10,
        'decay': touchTimeElapsed/10,
        'sustain': touchTimeElapsed/100,
        'release': touchTimeElapsed / 10
      }
    });
    synth3.connect(gain3);

    instruments.push({
      synth: synth3,
      duration: '0:2'
    });
    currentInstrument = Math.min(13, Math.floor(touchTimeElapsed / 100));

    touchStartedTs = 0;
  }

  if (tool === 0) {
    sketch.strokeWeight(10 + (currentInstrument + 1) * 10)
    sketch.stroke(100 + (currentInstrument * 10), 131 + (currentInstrument * 5), 100 + (currentInstrument * 20), 100 + noise(pmouseX, pmouseY) * 155)
    addToScore(pmouseX, pmouseY, currentInstrument)
  } else if (tool === 2) {
    sketch.strokeWeight(10 + (currentInstrument + 1) * 10)
    sketch.stroke(97, 111, 57, 100 + noise(pmouseX, pmouseY) * 155)
    addToScore(pmouseX, pmouseY, currentInstrument)
  } else {
    sketch.strokeWeight(25)
    sketch.stroke(bgColor)
    removeFromScore(mouseX, mouseY)
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
