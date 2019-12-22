var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _DEFAULTS = {
        wkWidth: 16,
        wkHeight: 80,
        bkWidth: 16 * 0.7,
        bkHeight: 80 * 0.6,
        x: 0,
        y: 0
    };
    function PianoSVG(opts) {
        var options = __assign({}, opts);
        var svgContainer = createSvg('svg');
        if (options.classRoot) {
            svgContainer.classList.add(options.classRoot);
        }
        /** Group element for white keys */
        var gWhite = createSvg('g');
        if (options.classWGroup) {
            gWhite.classList.add(options.classWGroup);
        }
        /** Group element for black keys */
        var gBlack = createSvg('g');
        if (options.classBGroup) {
            gBlack.classList.add(options.classBGroup);
        }
        // Black keys drawn on top of white
        svgContainer.appendChild(gWhite);
        svgContainer.appendChild(gBlack);
        var keyElements = Array.from({ length: PianoSVG.NUM_NOTES }, function () { return null; });
        var state = __assign(__assign({}, _DEFAULTS), { keys: Array.from({ length: PianoSVG.NUM_NOTES }, function () { return PianoSVG.KEYSTATE_NOKEY; }) });
        /** Update local state with new values (if provided) */
        function updateState(s) {
            s.wkWidth != null && (state.wkWidth = s.wkWidth);
            s.wkHeight != null && (state.wkHeight = s.wkHeight);
            s.bkWidth != null && (state.bkWidth = s.bkWidth);
            s.bkHeight != null && (state.bkHeight = s.bkHeight);
            s.x != null && (state.x = s.x);
            s.y != null && (state.y = s.y);
        }
        /** Note id to x coordinate */
        function idToX(id) {
            var x = PianoSVG.wkCountToId(id);
            if (PianoSVG.NOTE_COLORS[id % 12] === 'w') {
                return x * state.wkWidth;
            }
            // Black key offset
            return x * state.wkWidth - state.bkWidth / 2;
        }
        /** Create a key SVG element */
        function createKeyEl(i, ks) {
            if (!ks) {
                throw new Error('Cannot create svg for non-renderable KeyState');
            }
            var color = PianoSVG.NOTE_COLORS[i % 12];
            var svg = createSvg('rect');
            var cls = color === 'b' ? options.classBKey : options.classWKey;
            if (cls) {
                svg.classList.add(cls);
            }
            if (ks === PianoSVG.KEYSTATE_ON && options.classActive) {
                svg.classList.add(options.classActive);
            }
            svg.setAttribute('x', String(state.x + idToX(i)));
            svg.setAttribute('y', String(state.y));
            svg.setAttribute('width', String(color === 'b' ? state.bkWidth : state.wkWidth));
            svg.setAttribute('height', String(color === 'b' ? state.bkHeight : state.wkHeight));
            svg.dataset.noteid = String(i);
            return svg;
        }
        /** Insert a new key element at the correct position in the DOM */
        function insertKeyElement(i, el) {
            if (keyElements[i]) {
                throw new Error('Already existing DOM Element for id: ' + i);
            }
            keyElements[i] = el;
            var color = PianoSVG.NOTE_COLORS[i % 12];
            var group = color === 'b' ? gBlack : gWhite;
            var nextId = nextExisting(i, state.keys);
            if (nextId != null) {
                var nextEl = keyElements[nextId];
                if (!nextEl) {
                    throw new Error('Element expected at ' + nextId);
                }
                group.insertBefore(el, nextEl);
            }
            else {
                group.appendChild(el);
            }
        }
        /** First or diff render */
        function render(s) {
            updateState(s);
            // Diff between s & state to render/patch
            var curKeys = s.keys;
            if (!curKeys) {
                return;
            }
            var oldKeys = state.keys;
            for (var i = 0; i < PianoSVG.NUM_NOTES; ++i) {
                if (curKeys[i] != oldKeys[i]) { // tslint:disable-line triple-equals
                    var ks = curKeys[i];
                    var kso = oldKeys[i];
                    var el = keyElements[i];
                    if (el) {
                        if (!ks) {
                            el.remove();
                            keyElements[i] = null;
                        }
                        if (ks === PianoSVG.KEYSTATE_ON || kso === PianoSVG.KEYSTATE_ON) {
                            if (options.classActive) {
                                el.classList.toggle(options.classActive);
                            }
                        }
                    }
                    else if (ks) {
                        insertKeyElement(i, createKeyEl(i, ks));
                    }
                    // Update this key state
                    oldKeys[i] = curKeys[i] || 0;
                }
            }
            // TODO: Handle position or size changes!
        }
        return {
            element: svgContainer,
            render: render
        };
    }
    (function (PianoSVG) {
        PianoSVG.KEYSTATE_NOKEY = 0;
        PianoSVG.KEYSTATE_OFF = 1;
        PianoSVG.KEYSTATE_ON = 2;
        PianoSVG.NOTE_COLORS = [
            'w', 'b', 'w', 'b', 'w', 'w', 'b', 'w', 'b', 'w', 'b', 'w'
        ];
        /** Number of MIDI notes, from 0-127 */
        PianoSVG.NUM_NOTES = 128;
        PianoSVG.DEFAULTS = _DEFAULTS;
        /** Count white keys included from 0 to id (not including id) */
        function wkCountToId(id) {
            if (!Number.isSafeInteger(id) || id < 0 || id >= PianoSVG.NUM_NOTES) {
                throw new Error('Invalid id for count: ' + id);
            }
            var x = 0;
            for (var i = 0; i < id; ++i) {
                if (PianoSVG.NOTE_COLORS[i % 12] === 'w') {
                    ++x;
                }
            }
            return x;
        }
        PianoSVG.wkCountToId = wkCountToId;
    })(PianoSVG || (PianoSVG = {}));
    exports.default = PianoSVG;
    // Internal helpers
    /** Find the next existing key of same color */
    function nextExisting(id, keys) {
        var color = PianoSVG.NOTE_COLORS[id % 12];
        for (var i = id + 1; i < PianoSVG.NUM_NOTES; ++i) {
            if (keys[i] && PianoSVG.NOTE_COLORS[i % 12] === color) {
                return i;
            }
        }
        return undefined;
    }
    function createSvg(tag) {
        return document.createElementNS('http://www.w3.org/2000/svg', tag);
    }
});
