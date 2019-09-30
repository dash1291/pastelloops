import React from 'react';
//import './App.css';

import ScaleSelector from './ScaleSelector'

function Toolbox() {
  return (
    <div class="toolbox">
      <div class="spaced toolbox">
        ::number of bars
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
  );
}

export default Toolbox;
