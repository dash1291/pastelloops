export default function PastelCanvas(
  state = -1,
  tool = 0
) {
  var x, y

  var WIDTH = 640
  var HEIGHT = 300
  var viz, sketch
  const STATE_AUDIO = 0
  const STATE_DRAW = 1
  var state = -1
  var bgColor = '#dbd8e3'

  var offsetX = 0

  const createLines = function(offsetX, offsetY) {
    viz.line(offsetX, 0, offsetX, HEIGHT)
  }

  function sketch(p) {
    p.setup = function() {
      p.cursor(CROSS)

      if (windowHeight < HEIGHT) {
        HEIGHT = windowHeight * 0.7
      }

      if (windowWidth < WIDTH) {
        WIDTH = windowWidth
      }

      p.createCanvas(WIDTH, HEIGHT).parent('sketch-canvas')
      // Starts in the middle

      frameRate(30)
      viz = p.createGraphics(WIDTH, HEIGHT)
      sketch = p.createGraphics(WIDTH, HEIGHT)
      sketch.background(bgColor)
    }

    p.draw = function() {
      if (state < STATE_AUDIO) {
        viz.background(bgColor)

        viz.textSize(32)
        viz.fill(150)
        viz.text('Preparing stuff', WIDTH / 2 - 100, HEIGHT / 2)
        p.image(viz, 0, 0, WIDTH, HEIGHT)
        return
      }

      if (state < STATE_DRAW) {
        viz.background(bgColor)

        viz.textSize(32)
        viz.fill(150)
        viz.text('Draw something here', WIDTH / 2 - 150, HEIGHT / 2)
        p.image(viz, 0, 0, WIDTH, HEIGHT)
        return
      }

      viz.background(150)

      if (playback) {
        createLines(offsetX)
        offsetX++
      }

      if (offsetX >= WIDTH) { offsetX = 0; repeating = true }

      p.image(sketch, 0, 0)
      p.image(viz, offsetX - 5, 0, 5, HEIGHT)
    }

    p.touchStarted = function() {
      playback = false
      if (Tone.context.state === 'suspended') Tone.context.resume()
    }

    p.touchEnded = function() {
      playback = true
    }

    p.touchMoved = function() {
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
  }

  function getPixel (y) {
    return sketch.get(offsetX, y)
  }

  return {
    sketch,
    get
  };
};
