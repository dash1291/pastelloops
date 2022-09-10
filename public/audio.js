const TEMPO = 120;
const MIN_OCTAVE = 2;
const MAX_OCTAVE = 5;

const isPlaying = false;

Tone.Transport.bpm.value = TEMPO;

const score = [];

const synth3 = new Tone.PolySynth(5, Tone.Synth, {
  oscillator: {
    type: "sine",
    partials: [1, 0.2, 0.01],
  },
  envelope: {
    attack: 0.5,
    decay: 0.5,
    sustain: 4,
    release: 5,
  },
});

const synth4 = new Tone.PolySynth(5, Tone.Synth, {
  oscillator: {
    type: "sawtooth",
  },
  envelope: {
    //"attackCurve" : 'exponential',
    decayCurve: "linear",
    attack: 0.2,
    decay: 1,
    sustain: 2,
    release: 2,
  },
});

/*var synth4 = SampleLibrary.load({
  instruments: 'piano',
  baseUrl: 'https://nbrosowsky.github.io/tonejs-instruments/samples/'
})*/

Tone.Buffer.on("load", function () {
  state = STATE_AUDIO;
});
function createSampler(interpolation) {
  let urls = {};
  [48, 52, 56, 60, 64, 68, 72].forEach((pitch) => {
    urls[pitch] = `/sounds/Marimba1_Classic_Clarinet_Combi/${interpolation}_${pitch}.mp3`;
  });

  return new Tone.PolySynth(4, Tone.Sampler(urls));
}

function createSampler2(interpolation) {
  let urls = {};
  urls[60] = `gansounds/${interpolation}.wav`;

  return new Tone.Sampler(urls);
}
var instruments = [];
let reverb = new Tone.Reverb({ decay: 2, wet: 0.3 });
reverb.generate();
reverb.connect(Tone.context.destination);

let lpf = new Tone.Filter(16000 / 3, "lowpass").connect(reverb);

for (let i = 13; i >= 0; i--) {
  let newInst = createSampler2(i);
  newInst.connect(lpf);
  instruments.push({
    synth: newInst,
    duration: "0:2",
  });
}

state = STATE_AUDIO;

// synth3 = makeSynth()
var gain4 = new Tone.Gain(0.1);
synth4.connect(gain4);

var gain3 = new Tone.Gain(0.2);
synth3.connect(gain3);

var pan3 = new Tone.Panner(0);

//var reverb = new Tone.Freeverb(0.7)

gain3.connect(pan3);
gain4.connect(pan3);

pan3.toMaster();

// reverb.toMaster()

var semiTones = ["A", "A#", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#"];

function getHSLFromScale(root, scale, instrument) {
  let scaleIdx = Object.keys(modeIntervals).indexOf(scale);
  let h = semiTones.indexOf(root) * 30 + (scaleIdx / Object.keys(modeIntervals).length) * 30;
  return [
    h,
    100 - (currentInstrument / instruments.length) * 60,
    30 + (scaleIdx / Object.keys(modeIntervals).length) * 60,
    0.95,
  ];
}

var playingNotes = {};
var stepSize, arpegge;

function playNote(x, y, instrumentIdx) {
  if (y > HEIGHT) return;

  let positionInScroll = Math.floor(y / (HEIGHT / arpegge.length));
  let note = positionInScroll;
  let instrument = instruments[instrumentIdx];
  instrument.synth.triggerAttackRelease(arpegge[note], instrument.duration);
}

function addToScore(x, y, instrument) {
  if (y > HEIGHT) return;

  let positionInScroll = Math.floor(y / (HEIGHT / arpegge.length));
  let note = positionInScroll;
  //console.log(y)
  /*for (var i = 0; i < score.length; i++) {
    if (score[i].note === note && score[i].instrument === instrument) {
      if ((x - score[i].end <= 5) && (x - score[i].end >= 0)) {
        score[i].offset += 5;
        return
      }
    }
  }*/

  let currentTime = (x / WIDTH) * Tone.Time(MEASURES).toTicks();

  score.push({
    instrument,
    offset: currentTime,
    end: Tone.Time("@4n").toSeconds(),
    note: arpegge[note],
    y,
    x,
  });
}

function removeFromScore(coords, size) {
  coords.forEach((xy) => {
    const scoreItemsToRemove = score.filter(
      ({ x, y }) => Math.abs(x - xy[0]) <= size && Math.abs(y - xy[1]) <= size
    );

    scoreItemsToRemove.map((s) => score.splice(score.indexOf(s), 1));
  });
}

function getTriad(root, type) {
  const triad = [];

  const rootIdx = semiTones.indexOf(root);
  triad.push(root);

  let i;
  if (type === "major") {
    i = rootIdx + 4;
  } else {
    i = rootIdx + 3; // minor
  }

  if (i <= 11) {
    triad.push(semiTones[i]);
  } else {
    triad.push(semiTones[i - 12]);
  }

  i = rootIdx + 7;
  if (i <= 11) {
    triad.push(semiTones[i]);
  } else {
    triad.push(semiTones[i - 12]);
  }
  return triad;
}

function switchArpeggeOld(arp, type) {
  const newArpegge = [];
  const triad = getTriad(arp, type);

  for (let i = 1; i <= 5; i++) {
    newArpegge.push(triad[0] + i);
    newArpegge.push(triad[1] + i);
    newArpegge.push(triad[2] + i);
  }

  arpegge = newArpegge;
  stepSize = HEIGHT / arpegge.length;
  playingNotes = {};
}

const modeIntervals = {
  minorScale: [0, 2, 3, 5, 7, 8, 10],
  minorPentatonic: [0, 3, 5, 7, 10],
  majorScale: [0, 2, 4, 5, 7, 9, 11],
  majorChord: [0, 4, 7],
  majorNinth: [0, 4, 7, 11, 14],
  minorChord: [0, 3, 7],
  maj7Chord: [0, 4, 7, 11],
  min7Chord: [0, 3, 7, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  myxolydian: [0, 2, 4, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  locrian: [0, 1, 3, 5, 6, 8, 10],
};

let scaleRoot = "A";
let scaleType = "majorScale";

function switchArpegge(arp, type) {
  let newArpegge = [];
  const intervals = modeIntervals[type];

  for (let i = MIN_OCTAVE; i <= MAX_OCTAVE; i++) {
    newArpegge = newArpegge.concat(
      Tone.Frequency(arp + i)
        .harmonize(intervals)
        .map((f) => f.toNote())
    );
  }

  arpegge = newArpegge.reverse();
  stepSize = HEIGHT / arpegge.length;
  playingNotes = {};
  scaleRoot = arp;
  scaleType = type;
}

switchArpegge("A", "majorScale");

const triadEl = document.querySelector(".triad");
const typeEl = document.querySelector(".type");

document.on = () => {
  triadEl.onchange = (e) => {
    const triad = triadEl.value;
    const type = typeEl.value;

    switchArpegge(triad, type);
  };

  typeEl.onchange = (e) => {
    const triad = triadEl.value;
    const type = typeEl.value;

    switchArpegge(triad, type);
  };
};

playback = false;
const noteSequence = [];
let playingYs = [];

function playLine() {
  let playedNotes = [];
  playingYs = [];
  for (let i = 0; i < score.length; i++) {
    let scoreItem = score[i];

    let currentTime = Tone.Transport.getTicksAtTime() % Tone.Time(MEASURES).toTicks();

    //   console.log(Math.abs(currentTime - scoreItem.offset))
    ////    console.log(currentTime)
    if (
      Math.abs(currentTime - scoreItem.offset) < Tone.Time("8n").toTicks() &&
      !playingNotes[scoreItem.note]
    ) {
      let noteLength = Math.ceil((scoreItem.end - scoreItem.offset) / 5);

      playingNotes[scoreItem.note] = true;
      instruments[scoreItem.instrument].synth.triggerAttackRelease(
        scoreItem.note,
        instruments[scoreItem.instrument].duration
      );
      playingYs.push(scoreItem.y);
      //scoreItem.isPlaying = true
      Tone.Transport.scheduleOnce(() => {
        playingNotes[scoreItem.note] = false;
      }, "+0:1");
    }
  }
}

let lastInstrument = currentInstrument;
let lastPositionX = canvasMouseX;
let lastPositionY = canvasMouseY;

Tone.Transport.scheduleRepeat(
  () => {
    if (playback || canvasMouseX > WIDTH || canvasMouseY > HEIGHT) {
      playLine();
    } else {
      if (touchStartedTs > 0 || tool > 0) return;

      if (
        canvasMouseX === lastPositionX &&
        canvasMouseY === lastPositionY &&
        lastInstrument === currentInstrument
      ) {
      } else {
        playNote(canvasMouseX, canvasMouseY, currentInstrument);
      }
      lastPositionX = canvasMouseX;
      lastPositionY = canvasMouseY;
      lastInstrument = currentInstrument;
    }
  },
  "8n",
  "+0:1"
);

setInterval(() => {
  if (Tone.context.state === "suspended") Tone.context.resume();
}, 1000);

Tone.Transport.start("+0.1");
