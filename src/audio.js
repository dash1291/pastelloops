import Tone from 'tone'

import constants from './src/constants'

var isPlaying = false

var synth3 = null
var synth4 = null

Tone.Transport.bpm.value = 120

function createInstruments() {
  synth3 = new Tone.PolySynth(5, Tone.Synth, {
    oscillator: {
      type: 'custom',
      partials: [0.2, 0.2, 0.01]
    },
    'envelope': {
      // "attackCurve" : 'linear',
      'attack': 0.5,
      'decay': 0.5,
      'sustain': 0.5,
      'release': 0.5
    }
  })

  synth4 = SampleLibrary.load({
    instruments: 'piano',
    baseUrl: 'https://nbrosowsky.github.io/tonejs-instruments/samples/'
  })

  return [
    synth3,
    synth4
  ]
}

Tone.Buffer.on('load', function () {
  state = constants.STATE_AUDIO
})

state = constants.STATE_AUDIO

// synth3 = makeSynth()
var gain4 = new Tone.Gain(1)
synth4.connect(gain4)

var gain3 = new Tone.Gain(0.2)
synth3.connect(gain3)

var pan3 = new Tone.Panner(0)

var reverb = new Tone.Freeverb(0.7)

gain3.connect(pan3)
gain4.connect(pan3)

pan3.toMaster()

// reverb.toMaster()

var playingNotes = {}
var stepSize, arpegge

playback = true

function playLine () {
  let playedNotes = []

  for (var i = 0; i < arpegge.length; i++) {
    var offsetY = (i) * stepSize
    const note = arpegge[i]

    if (playingNotes[note] === true) {
      playedNotes.push(note)
      continue
    }

    let pixel = null

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
}

function setupPlayback() {
  if (playback) {
    Tone.transport.schedulerepeat(function () {
      playline()
    }, '8n', '1m')
  }

  setinterval(function () {
    if (Tone.context.state === 'suspended') tone.context.resume()
  }, 1000)

  Tone.Transport.start('+0.1')
}
