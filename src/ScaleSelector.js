import React from 'react';
//import './App.css';
import ReactTooltip from 'react-tooltip'

const semiTones = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#']

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
	locrian: [0, 1, 3, 5, 6, 8, 10]
}

class ScaleSelector extends React.Component {
	getHSLFromScale(root, scale) {
		let scaleIdx = Object.keys(modeIntervals).indexOf(scale)
		let h = semiTones.indexOf(root) * 30 + (scaleIdx / Object.keys(modeIntervals).length) * 30
		return [h, 100, 20 + (scaleIdx / Object.keys(modeIntervals).length) * 70];
	}
	selectScale(root, scale) {
		window.switchArpegge(root, scale);
	}

	renderScale(scale) {
		return (
			<div class="scale">
				{
					semiTones.map(root => {
						const hsl = this.getHSLFromScale(root, scale)
						
						return (
							<i
								data-tip={`${root} ${scale}`}
								onClick={() => this.selectScale(root, scale)}
								class="scale-icon" style={{
									backgroundColor: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`
								}}
							/>
						)
					})
				}
				<span class="scale-legend scale-type">{ scale } </span>
			</div>
		)
	}

  render() {
    return (
			<div class="scale-selector">
				<ReactTooltip />
				{ Object.keys(modeIntervals).map(scale => this.renderScale(scale)) }
			</div>
		)
  }
}
export default ScaleSelector;
