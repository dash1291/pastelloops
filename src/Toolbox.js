import React from 'react';
//import './App.css';

import ScaleSelector from './ScaleSelector'
import { Keyboard, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';


class Toolbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState()
  }

  getInitialState() {
    return {
      tempo: window.Tone.Transport.bpm.value,
      activeNotes: []
    };
  }

  setTempo(value) {
    window.Tone.Transport.bpm.value = value
    this.setState({ tempo: value })
  }

  setActiveNote(note) {
    let activeNotes = [...this.state.activeNotes]

    if (activeNotes.filter(n => n === note).length > 1) {
      activeNotes.filter(n => n === note).forEach(n => activeNotes.splice(activeNotes.indexOf(n), 1))
    } else {
      activeNotes.push(note)
      activeNotes.push(note)
    }
    //activeNotes.push(note)
    activeNotes = activeNotes.sort()

    this.setState({
      ...this.state,
      activeNotes: activeNotes.sort()
    })

    activeNotes =  [...new Set(activeNotes)]
    let activeIntervals = activeNotes.map(n => n - activeNotes[0]);
    window.modeIntervals['customScale'] = activeIntervals;
    let rootNote = window.Tone.Frequency(activeNotes[0], 'midi').toNote().replace(/\d+/, '');
    window.switchArpegge(rootNote, 'customScale')
  }

  renderKeyboard() {
    const firstNote = MidiNumbers.fromNote('C0');
    const lastNote = MidiNumbers.fromNote('B1');

    return (
      <Keyboard
        noteRange={{ first: firstNote, last: lastNote }}
        onPlayNoteInput={(note) => this.setActiveNote(note)}
        onStopNoteInput={() => {}}
        activeNotes={this.state.activeNotes}
        width={220}

      />
    );
  }

  render() {
    return (
      <div class="toolbox">
        <div class="spaced">
          <input type="range" name="tempo" 
            min="20" max="200" defaultValue={this.state.tempo} step="10" onChange={(e) => this.setTempo(e.target.value)}/>
          <label for="tempo">Tempo</label>
        </div>
        <div class="spaced toolbox">
          ::octave range selector
        </div>
        <div class="spaced toolbox">
          ::Sound options here
        </div>
        <ScaleSelector/>
        <div class="spaced">
          { this.renderKeyboard() }
        </div>
      </div>
    )
  }
}

export default Toolbox;
