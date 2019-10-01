import React from 'react';
//import './App.css';

import ScaleSelector from './ScaleSelector'

class Toolbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState()
  }

  getInitialState() {
    return {
      tempo: window.Tone.Transport.bpm.value
    };
  }

  setTempo(value) {
    window.Tone.Transport.bpm.value = value
    this.setState({ tempo: value })
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
        <div class="spaced">::scale customizer</div>
      </div>
    )
  }
}

export default Toolbox;
