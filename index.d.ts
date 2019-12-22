/**
 * SVG Piano Keyboard renderer
 */
interface PianoSVG {
    /** Root DOM Element of PianoSVG */
    element: SVGElement;
    /** Render keys using the provided state */
    render(state: PianoSVG.State): void;
}
declare function PianoSVG(opts?: PianoSVG.Options): PianoSVG;
declare namespace PianoSVG {
    type KeyState = 0 | 1 | 2 | undefined;
    const KEYSTATE_NOKEY = 0;
    const KEYSTATE_OFF = 1;
    const KEYSTATE_ON = 2;
    type KeyColor = 'b' | 'w';
    const NOTE_COLORS: KeyColor[];
    /** Number of MIDI notes, from 0-127 */
    const NUM_NOTES = 128;
    interface Options {
        /** CSS class for root element */
        classRoot?: string;
        /** CSS class for black keys group element */
        classBGroup?: string;
        /** CSS class for white keys group element */
        classWGroup?: string;
        /** CSS class for black key elements */
        classBKey?: string;
        /** CSS class for white key elements */
        classWKey?: string;
        /** CSS class for active key elements */
        classActive?: string;
    }
    interface State {
        /** State of keys indexed by MIDI id 0-127 */
        keys?: ArrayLike<KeyState>;
        /** Black key width */
        bkWidth?: number;
        /** Black key height */
        bkHeight?: number;
        /** White key width */
        wkWidth?: number;
        /** White key height */
        wkHeight?: number;
        /** X drawing offset from 0 */
        x?: number;
        /** Y drawing offset from 0 */
        y?: number;
    }
    interface Defaults {
        wkWidth: number;
        wkHeight: number;
        bkWidth: number;
        bkHeight: number;
        x: number;
        y: number;
    }
    const DEFAULTS: Readonly<Defaults>;
    /** Count white keys included from 0 to id (not including id) */
    function wkCountToId(id: number): number;
}
export default PianoSVG;
