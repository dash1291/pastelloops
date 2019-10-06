import React from 'react';
//import './App.css';

import { Slider, Icon, Checkbox, Button, InputNumber, Row, Col, Tooltip} from 'antd'

import ScaleSelector from './ScaleSelector'
import { Keyboard, KeyboardShortcuts, MidiNumbers } from 'react-piano';
import 'react-piano/dist/styles.css';


class Toolbox extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getInitialState()
  }

  componentDidMount() {
    window.onpastelinstrumentchange = (instrument) => {
      this.setState({
        ...this.state,
        instrument,
        volume: window.instruments[instrument].synth.volume.value
      })
    }
  }

  getInitialState() {
    return {
      tempo: window.Tone.Transport.bpm.value,
      activeNotes: [],
      playback: false,
      instrument: window.currentInstrument,
      volume: window.instruments[window.currentInstrument].synth.volume.value,
      scaleRoot: window.scaleRoot,
      scaleType: window.scaleType,
    };
  }

  setTempo(value) {
    window.Tone.Transport.bpm.value = value
    this.setState({ tempo: value })
  }

  setInstrument(instrument) {
    this.setState({
      ...this.state,
      instrument,
      volume: window.instruments[instrument].synth.volume.value
    })
    window.currentInstrument = instrument
  }

  setVolume(val) {
    window.instruments[this.state.instrument].synth.volume.value = val

		this.setState({
			...this.state,
			volume: val
    })
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

  selectEraser() {
    window.tool = 3
  }

  clearCanvas() {
    window.score = []
    window.clearCanvas()
  }

  togglePlayback() {
    this.setState({
      ...this.state,
      playback: !this.state.playback
    })

    window.togglePlayback(!this.state.playback)
  }

  setScale(root, type) {
    this.setState({
      ...this.state,
      scaleRoot: root,
      scaleType: type
    })
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

	renderInstrument() {
    let hsl = window.getHSLFromScale(window.scaleRoot, window.scaleType);
    let bgColor = `hsla(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%, ${hsl[3]})`

    return (
			<Row class="instrument">
        <Col span={4}>
          <i style={{
            'backgroundColor': bgColor
          }}
          class="instrument-preview">
          </i>
        </Col>
        <Col span={8}>
          Texture
          <Slider
            min={1}
            max={14}
            onChange={(val) => this.setInstrument(val - 1)}
            value={this.state.instrument}
            step={1}
            tooltipVisible={false}
          />
        </Col>
        <Col span={8}>
          Volume
          <Slider
            min={-10}
            max={10}
            onChange={(val) => this.setVolume(val)}
            value={this.state.volume}
            step={0.5}
          />
        </Col>
			</Row>
		)
	}

  render() {
    return (
      <div className="toolbox">
        <div className="spaced">
          <Row type="flex" align="middle">
            <Col span={5}>
              <Tooltip placement="top" title={!this.state.playback ? 'Turn playback on' : 'Stop playback'}>
                <Button shape="circle" size="large" type="primary" className="playback-toggle" checked={this.state.playback} onClick={(e) => this.togglePlayback()}>
                  { this.state.playback ? (
                    <Icon type="pause-circle" theme="filled" style={{ fontSize: '24px'}}/>
                  ) : (
                    <Icon type="caret-right" theme="filled" style={{ fontSize: '24px'}}/>
                  )}
                </Button>
              </Tooltip>
            </Col>
            <Col span={3}>
              <Tooltip placement="top" title={'Erase sections'}>
                <Button size="large" shape="circle" icon="scissor" onClick={this.selectEraser}/>
              </Tooltip>
            </Col>
            <Col span={3}>
              <Tooltip placement="top" title={'Clear canvas'}>
                <Button size="large" type="danger" shape="circle" icon="delete" onClick={this.clearCanvas}/>
              </Tooltip>
            </Col>
          </Row>
          
        </div>
        <div className="spaced">
          <Row>
            <Col span={12}>
              <span>Tempo</span>
              <Slider
                min={20}
                max={200}
                onChange={(val) => this.setTempo(val)}
                value={this.state.tempo}
                step={5}
              />
            </Col>
            <Col span={2}>
              <InputNumber
                min={20}
                max={200}
                style={{ marginLeft: 16 }}
                value={this.state.tempo}
                onChange={(val) => this.setTempo(val)}
              />
            </Col>
          </Row>
        </div>
        <div class="spaced clearing">
          { this.renderInstrument() }
        </div>
        <div className="spaced">
          { window.semiTones.map(st => <span class="scale-legend">{ st.length === 1 ? st + ' ' : st }</span>) }
          <ScaleSelector onScaleChange={(root, type) => this.setScale(root, type)}/>
        </div>
        
        <div className="spaced">
          <span>Build your scale</span>
          { this.renderKeyboard() }
        </div>
      </div>
    )
  }
}

export default Toolbox;
