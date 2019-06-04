import React from 'react';
import logo from './logo.svg';
import './App.css';
import './audio.js';
import P5Wrapper from 'react-p5-wrapper';
import p5canvas from './canvas.js';

class App() {
  switchArpegge(arp, type) {
    const modeIntervals = {
      major: [0, 2, 4, 5, 7, 9, 11],
      dorian: [0, 2, 3, 5, 7, 9, 10],
      myxolydian: [0, 2, 4, 5, 7, 9, 10],
      phrygian: [0, 1, 3, 5, 7, 8, 10],
      lydian: [0, 2, 4, 6, 7, 9, 11],
      aeolian: [0, 2, 3, 5, 7, 8, 10],
      locrian: [0, 1, 3, 5, 6, 8, 10]
    }

    var newArpegge = []
    var intervals = modeIntervals[type]

    for (var i = 1; i <= 5; i++) {
      newArpegge = newArpegge.concat(Tone.Frequency(arp + i).harmonize(intervals).map(function (f) { return f.toNote() }))
    }

    arpegge = newArpegge
    stepSize = constants.HEIGHT / arpegge.length

    this.setState({
      ...this.state,
      arpegge: newArpegge,
      playingNotes: {}
    })
  }

  render () {
    return (
      <div className="App">
        <div id="sketch-canvas">
          <P5Wrapper sketch={p5canvas} />
        </div>
        <div class="spaced">
          <div class="spaced toolbox">
            <p>
              Select tool
            </p>
            <button
              id="toolbox__pencil"
              class="toolbox__item toolbox__item--selected"
              onClick={() => switchTool(0)}
            >
              Brush 1
            </button>
            <button
              id="toolbox__pencil-2"
              class="toolbox__item"
              onClick={() => switchTool(1)}
            >
              Brush 2
            </button>
            <button
              id="toolbox__eraser"
              class="toolbox__item"
              onClick={() => switchTool(2)}
            >
              Eraser
            </button>
          </div>
          <div class="spaced">
            <label for="triad">Select Scale</label>
            <select
              onChange={(e) => switchArpegge(e.value, this.state.scaleType)}
              id="triad"
            >
              <option value="A">A</option>
              <option value="A#">A#</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="C#">C#</option>
              <option value="D">D</option>
              <option value="D#">D#</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="F#">F#</option>
              <option value="G">G</option>
              <option value="G#">G#</option>
            </select>
            <select
              onChange={(e) => switchArpegge(this.state.scaleTone, e.value)}
              e.id="type"
            >
              <option value="major">Major</option>
              <option value="dorian">Dorian</option>
              <option value="phrygian">Phrygian</option>
              <option value="lydian">Lydian</option>
              <option value="myxolydian">Myxolydian</option>
              <option value="aeolian">Aeolian</option>
              <option value="locrian">Locrian</option>
            </select>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
