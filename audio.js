var isPlaying = false

Tone.Transport.bpm.value = 120

var score = [];

var synth3 = new Tone.PolySynth(5, Tone.Synth, {
  oscillator: {
    type: 'sine',
    partials: [1, 0.2, 0.01]
  },
  'envelope': {
    // "attackCurve" : 'linear',
    'attack': 0.5,
    'decay': 0.5,
    'sustain': 4,
    'release': 5
  }
})

var synth4 = new Tone.PolySynth(5, Tone.Synth, {
  oscillator: {
    type: 'sawtooth',
    //partials: [1, 0.2, 0.01]
  },
  'envelope': {
    //"attackCurve" : 'exponential',
    "decayCurve": 'linear',
    'attack': 0.05,
    'decay': 1,
    'sustain': 2,
    'release': 2
  }
})
/*var synth4 = SampleLibrary.load({
  instruments: 'piano',
  baseUrl: 'https://nbrosowsky.github.io/tonejs-instruments/samples/'
})*/

Tone.Buffer.on('load', function () {
  state = STATE_AUDIO
})

var instruments = [
  { synth: synth3, duration: '0:2' }, 
  { synth: synth4, duration: '0:2' }
]

state = STATE_AUDIO

// synth3 = makeSynth()
var gain4 = new Tone.Gain(0.1)
synth4.connect(gain4)

var gain3 = new Tone.Gain(0.2)
synth3.connect(gain3)

var pan3 = new Tone.Panner(0)

//var reverb = new Tone.Freeverb(0.7)

gain3.connect(pan3)
gain4.connect(pan3)

pan3.toMaster()

// reverb.toMaster()

var semiTones = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

var minor = [
  semiTones[0],
  semiTones[3],
  semiTones[7]
]

var major = [
  semiTones[0],
  semiTones[4],
  semiTones[7]
]

var playingNotes = {}
var stepSize, arpegge

function addToScore(x, y, instrument) {
  if (y > HEIGHT) return

  let positionInScroll = Math.floor(y / (HEIGHT / (arpegge.length)))
  let note = positionInScroll
  //console.log(y)
  for (var i = 0; i < score.length; i++) {
    if (score[i].note === note && score[i].instrument === instrument) {
      if ((x - score[i].end <= 5) && (x - score[i].end >= 0)) {
        score[i].offset += 5;
        return
      }
    }
  }

  score.push({
    instrument: instrument,
    offset: x,
    end: x + 5,
    note: note
  })
}

function getTriad (root, type) {
  var triad = []

  var rootIdx = semiTones.indexOf(root)
  triad.push(root)

  var i
  if (type === 'major') {
    i = rootIdx + 4
  } else {
    i = rootIdx + 3 // minor
  }

  if (i <= 11) {
    triad.push(semiTones[i])
  } else {
    triad.push(semiTones[i - 12])
  }

  i = rootIdx + 7
  if (i <= 11) {
    triad.push(semiTones[i])
  } else {
    triad.push(semiTones[i - 12])
  }
  return triad
}

function switchArpeggeOld (arp, type) {
  var newArpegge = []
  var triad = getTriad(arp, type)

  for (var i = 1; i <= 5; i++) {

    newArpegge.push(triad[0] + i)
    newArpegge.push(triad[1] + i)
    newArpegge.push(triad[2] + i)
  }

  arpegge = newArpegge
  stepSize = HEIGHT / arpegge.length
  playingNotes = {}
}

const modeIntervals = {
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  myxolydian: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10]
}

function switchArpegge (arp, type) {
  var newArpegge = []
  var intervals = modeIntervals[type]

  for (var i = 2; i < 5; i++) {
    newArpegge = newArpegge.concat(Tone.Frequency(arp + i).harmonize(intervals).map(function (f) { return f.toNote() }))
  }

  arpegge = newArpegge
  stepSize = HEIGHT / arpegge.length
  playingNotes = {}
}

switchArpegge('A', 'major')

var triadEl = document.querySelector('#triad')
var typeEl = document.querySelector('#type')

triadEl.onchange = function (e) {
  var triad = triadEl.value
  var type = typeEl.value

  switchArpegge(triad, type)
}

typeEl.onchange = function (e) {
  var triad = triadEl.value
  var type = typeEl.value

  switchArpegge(triad, type)
}

playback = true

var noteSequence = []

function playLine () {
  let playedNotes = []

  for (var i = 0; i < score.length; i++) {
    let scoreItem = score[i]
    
    if (offsetX >= scoreItem.offset && offsetX <= scoreItem.end && !playingNotes[scoreItem.note]) {
      let noteLength = Math.ceil((scoreItem.end - scoreItem.offset) / 5)
      console.log(noteLength)
      playingNotes[scoreItem.note] = true
      instruments[scoreItem.instrument].synth.triggerAttackRelease(arpegge[scoreItem.note], '0:2')
      scoreItem.isPlaying = true
      Tone.Transport.scheduleOnce(function () {
        playingNotes[scoreItem.note] = false
      }, '+0:2')
    }
  }
  /*
  for (var i = 0; i < arpegge.length; i++) {
    var offsetY = (i) * stepSize
    const note = arpegge[i]

    if (playingNotes[note] === true) {
      playedNotes.push(note)
      continue
    }

    for (var y = offsetY; y < offsetY + stepSize; y += 5) {
      pixel = getPixel(y)
      if (pixel + '' === '200,100,0,255') {
        synth3.triggerAttackRelease(arpegge[i], '0:1')
        playingNotes[note] = true

        playedNotes.push(note)
        Tone.Transport.scheduleOnce(function () { playingNotes[note] = false }, '+0:0:2')
        break
      }

      if (pixel + '' === '50,150,100,255') {
        synth4.triggerAttackRelease(arpegge[i], '0:1')
        playingNotes[note] = true

        Tone.Transport.scheduleOnce(function () { playingNotes[note] = false }, '+0:0:2')
        break
      }
    }
  }
  return playedNotes
  */
}

if (playback) {
  Tone.Transport.scheduleRepeat(function () {
    playLine()
  }, '8n', '1m')
}

setInterval(function () {
  if (Tone.context.state === 'suspended') Tone.context.resume()
}, 1000)

Tone.Transport.start('+0.1')
