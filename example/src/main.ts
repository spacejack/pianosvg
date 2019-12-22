import * as m from 'mithril'
import PianoSVG from '../../src'

// Key sizes
const WK_WIDTH = 40
const WK_HEIGHT = 200
const BK_WIDTH = 25
const BK_HEIGHT = 124

/** Piano wrapped in a Mithril component */
function Demo(): m.Component {
	// Mutable keyboard state object.
	// We do not need to add the overhead of re-creating
	// the key state array every render.
	const state = {
		// To render a traditional 88-key piano, we must skip the first
		// 33 MIDI ids (render as 'NOKEY')
		keys: Array.from({length: 33}, () => PianoSVG.KEYSTATE_NOKEY).concat(
			// These are the traditional 88 keys we want to render
			// Starting from 33/A1
			Array.from({length: 88}, () => PianoSVG.KEYSTATE_OFF)
		) as PianoSVG.KeyState[],
		bkWidth: BK_WIDTH,
		bkHeight: BK_HEIGHT,
		wkWidth: WK_WIDTH,
		wkHeight: WK_HEIGHT,
		// Since we skipped 33 drawable notes, we need to offset
		// to the left by that number of white key widths.
		x: -PianoSVG.wkCountToId(33) * WK_WIDTH
	}
	/** Will hold instance of PianoSVG */
	let pianoSvg: PianoSVG | undefined

	let noteId = ''

	/** Randomize the piano keys state */
	function randomize() {
		if (!pianoSvg) return
		for (let i = 33; i < state.keys.length; ++i) {
			const r = Math.random()
			state.keys[i] = r < 0.2 ? PianoSVG.KEYSTATE_NOKEY
				: r < 0.225 ? PianoSVG.KEYSTATE_ON
				: PianoSVG.KEYSTATE_OFF
		}
		pianoSvg.render(state)
		noteId = ''
	}

	/* Reset piano keys state */
	function reset() {
		if (!pianoSvg) return
		for (let i = 33; i < state.keys.length; ++i) {
			state.keys[i] = PianoSVG.KEYSTATE_OFF
		}
		pianoSvg.render(state)
		noteId = ''
	}

	/** A piano key was (possibly) clicked */
	function clickKey (e: Event) {
		const key = e.target
		if (key instanceof SVGElement) {
			noteId = key.dataset.noteid || ''
			if (noteId) {
				// Flip the state of this key then re-render the keyboard
				const i = Number(noteId)
				state.keys[i] = state.keys[i] === PianoSVG.KEYSTATE_ON
					? PianoSVG.KEYSTATE_OFF : PianoSVG.KEYSTATE_ON
				pianoSvg!.render(state)
			}
		}
	}

	return {
		view: () => m('demo',
			m('.piano-container', {
				// Note that while PianoSVG doesn't provide any event handling,
				// it's easy to add one click handler to this container that will
				// handle all clicks on piano key elements.
				onclick: clickKey,
				// Mithril's oncreate lifecycle hook, where we can grab
				// a reference to the container DOM node
				oncreate: v => {
					// Create an instance of PianoSVG
					pianoSvg = PianoSVG({
						classRoot: 'piano',
						classBKey: 'key-black',
						classWKey: 'key-white',
						classActive: 'key-active'
					})
					// Set a specific width & height based on our key sizes/count
					pianoSvg.element.style.width = `${(PianoSVG.wkCountToId(88) + 1) * state.wkWidth}px`
					pianoSvg.element.style.height = `${state.wkHeight}px`
					// Initial render of keyboard
					pianoSvg.render(state)
					// Show it in the page
					v.dom.appendChild(pianoSvg.element)
				},
				// Mithril's onremove lifecycle hook, where we can cleanup
				onremove: () => {
					if (pianoSvg != null) {
						pianoSvg.element.remove()
						pianoSvg = undefined
					}
				}
			}),
			m('p', 'MIDI Note ID: ' + noteId),
			m('p.buttons',
				m('button', {type: 'button', onclick: randomize}, 'Randomize'),
				m('button', {type: 'button', onclick: reset}, 'Reset')
			)
		)
	}
}

// Start the app
m.mount(document.getElementById('demo-app')!, Demo)
