# 🎸 Fretboard Explorer
*An interactive React application for guitarists to learn and explore music theory. Combining visual fretboard mapping, intelligent chord generation algorithms, and real-time MIDI playback, this tool helps musicians discover chord voicings, understand harmonic relationships, and master the guitar fretboard through an intuitive, color-coded interface based on the Circle of Fifths.*

**LINK: https://ridwansharkar.github.io/Fretboard-Explorer/**

## 📜 Overview:

**Fretboard Explorer** bridges the gap between music theory and practical guitar playing by algorithmically generating all physically playable chord fingerings for any chord in any key.

![Fretboardx](https://github.com/user-attachments/assets/
c3515850-8987-48e9-89f7-4e2d84e0c55b)

### Key Features:
- **🧮 Intelligent Chord Discovery:** Select any chord from the Circle of Fifths and instantly visualize all notes across the 6-string, 16-fret board. Advanced algorithms compute hundreds of valid fingering positions based on real-world playability constraints (finger stretch, fret spacing, string accessibility).

- **🎹 Real-Time MIDI Synthesis:** Hear exactly what you see. Powered by Tone.js, each chord voicing plays through a realistic guitar synthesizer with pluck dynamics, reverb, compression, and delay effects that mimic authentic guitar tone.

- **🎨 Music Theory Integration:** Built-in Circle of Fifths interface with 24 key signatures (12 major + 12 minor), dynamic color theming per key, intelligent 7th/9th chord logic, and scale degree relationships that help you understand harmonic progressions intuitively.

- **🪉 Advanced Chord Customization:** Toggle between standard triads, 7th chords, and 9th extensions. Navigate through multiple voicings with Next/Prev controls to find the perfect fingering for your playing style and song context.

- **🎼 Educational Design:** Color-coded notes, interval labeling, and visual feedback make complex music theory concepts accessible for beginners while providing powerful tools for advanced musicians exploring jazz voicings and extended harmonies.

### How It Works:
The application uses a backtracking algorithm to recursively search through all possible note combinations on the fretboard, validating each potential chord shape against ergonomic constraints. When you select "C Major 7", the system calculates the notes (C-E-G-B), finds every instance across the fretboard, then generates all valid 4-note combinations that a human hand can actually play—typically yielding 200-400 unique voicings to explore.

---

## Usage: 
- Row 1 chord name buttons will display all the notes across the fretboard that the chord consists of. At this point, the user may specify chord qualities such as including 7th or 9th notes before pressing the 'Find' button in the right-hand column.   

- Row 2 buttons under the chord names will play a random chord of the key's scale degree to explore quick relationships, while the 'Next', 'Prev', and 'Play' buttons on the right-hand column may be used to manually search a chord shape or voicing.

![image](https://github.com/user-attachments/assets/44774bcd-434e-4faf-bea0-37ddf467547b)

---

## Design:

- An array of all of the notes in the western scale [A, A#, B, C, C#, D, D#, E, F, F#, G, G#] are iterated through to extract the correct notes from the appropriate chord formula. For instance, the C Major chord consists of 1-3-5, or C-E-G, and will be highlighted upon user selection.

- Each chord belongs to a set of chords: [ I ii iii IV V VI Vii ] that form a 'key', all twelve of which are implemented as buttons on the Circle of Fifths for the user to explore.

- Once chord notes are displayed, an algorithm will determine which combinations of these available notes within the selected chord can be considered a "valid chord", meaning that they are actually physically playable on the guitar in real life. This involves eliminating the possibility of more than one note per string, or that no 2 notes be 5 frets apart (for instance, depending on the length of your fingers). Various chord customization parameters, such as "no open notes", or "don't skip strings" are available as well.

![image](https://github.com/user-attachments/assets/ae259107-9a44-4978-a5e8-812b6b81cd02)

---

## Technical Architecture:

### Tech Stack
- **Frontend Framework:** React 18.3+ with TypeScript for type-safe component development
- **Build Tool:** Vite for fast development and optimized production builds
- **Audio Engine:** Tone.js for MIDI synthesis and audio playback with realistic guitar effects
- **Styling:** Custom CSS with dynamic theming based on musical key selection
- **Deployment:** GitHub Pages for static site hosting

### Core Data Structures
```typescript
// Guitar fretboard represented as a 2D array
GuitarNote[][] = [
  [{ string: 0, fret: 0, name: 'E' }, ...],  // 6 strings
  ...                                          // 16 frets each
]

// Chord positions stored as coordinate arrays
ChordPosition[] = [
  { string: 0, fret: 3 },
  { string: 1, fret: 2 },
  ...
]
```

---

## Core Algorithms:

### 1. Fretboard Generation Algorithm
The fretboard is algorithmically constructed using standard guitar tuning (E-A-D-G-B-E) and chromatic scale mathematics:

```typescript
// Standard tuning array indexed by string
const notes = ['E', 'B', 'G', 'D', 'A', 'E'];  // High to Low
const semitones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// For each string, calculate note at each fret using modular arithmetic
fretboard[string][fret].name = semitones[(noteIndex + fret) % 12]
```

This creates a complete 6-string × 16-fret matrix where every position knows its string number, fret number, and note name.

### 2. Chord Formula System
Musical chords are defined by their interval patterns (semitone distances from the root note):

```typescript
chordFormulas = {
  major:      [0, 4, 7],      // Root, Major 3rd, Perfect 5th
  minor:      [0, 3, 7],      // Root, Minor 3rd, Perfect 5th
  major7:     [0, 4, 7, 11],  // + Major 7th
  minor7:     [0, 3, 7, 10],  // + Minor 7th
  dominant7:  [0, 4, 7, 10],  // Major triad + Minor 7th
  diminished: [0, 3, 6],      // Root, Minor 3rd, Diminished 5th
  // ... and more complex voicings
}
```

When a user selects C Major, the algorithm:
1. Finds C's position in the chromatic scale (index 3)
2. Applies the major formula [0, 4, 7]
3. Calculates: C (3+0), E (3+4), G (3+7) via modulo 12 arithmetic
4. Highlights all instances of C, E, and G across the entire fretboard

### 3. Chord Fingering Discovery (Backtracking Algorithm)
The most complex algorithm finds all physically playable chord voicings using recursive backtracking with validation constraints:

**Algorithm Flow:**
```
1. Start with empty fret array: [-1, -1, -1, -1, -1, -1]
2. For each note in chord formula:
   3. Try placing note on each string/fret combination
   4. Validate constraints:
      - No string used twice
      - Fret span ≤ 4 frets (playable by human hand)
      - String span ≤ 4 strings (reachable finger stretch)
   5. If valid, recurse to next note
   6. If all notes placed, save chord voicing
   7. Backtrack and try next possibility
```

**Validation Rules:**
```typescript
// Maximum fret distance between any two fingers
Math.abs(currentFret - otherFret) <= 3

// Maximum string distance to avoid awkward stretches  
Math.abs(maxString - minString) <= 3
```

This generates hundreds of valid voicings for complex chords (e.g., ~300+ for C Major 7), which users can cycle through with Next/Prev buttons.

### 4. Circle of Fifths Implementation
The Circle of Fifths is implemented as a key relationship graph with programmatically positioned buttons and dynamic hover states:

**Key Relationships:**
- Each key maintains a lookup table of related keys with their scale degrees
- Major/minor pairs are positioned using trigonometry (radius × cos/sin)
- Hover effects highlight related keys based on scale degree relationships (IV, V, ii, vi, etc.)

**Musical Logic:**
```typescript
// Calculate scale degrees for selected key
pattern = isMinor ? [0, 2, 3, 5, 7, 8, 10]    // Natural minor intervals
                  : [0, 2, 4, 5, 7, 9, 11]    // Major scale intervals

// Chord qualities per degree
types = isMinor ? ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major']
                : ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished']
```

---

## Music Theory Implementation:

### Dynamic 7th/9th Logic
The app intelligently determines whether to use major or minor 7ths based on music theory rules:

- **Dominant 7ths:** Automatically applied to V chords (always flatted 7th)
- **Major 7ths:** Applied to I and IV chords in major keys
- **Minor 7ths:** Applied to ii, iii, vi chords and all minor key chords
- **Context-aware:** The same root note uses different 7ths depending on key context

### Key-Based Color Theming
Each of the 12 major and 12 minor keys has a unique color palette that dynamically updates:
```typescript
themes = {
  'C': { 
    major: { backgroundColor: '#2e6938', buttonColor: '#54bc6c', ... },
    minor: { backgroundColor: '#51282c', buttonColor: '#E7717D', ... }
  },
  // ... 24 total key-specific themes
}
```

CSS variables are updated in real-time when keys change, creating a cohesive visual experience tied to musical mode.

---

## MIDI Audio System:

### Realistic Guitar Synthesis
Using Tone.js, the app creates authentic guitar sounds through layered audio processing:

**Signal Chain:**
```
PluckSynth → Reverb → Compressor → Delay → Output
    ↓          ↓          ↓          ↓
  Attack    Room        Dynamic    Echo
  Noise     Space       Range      Effect
```

**Audio Features:**
- **Pluck Synthesis:** Simulates string plucking with attack noise and dampening
- **Octave Mapping:** Each string/fret has the correct octave (E2 to E5 range)
- **Chord Strumming:** Notes are staggered by 50ms to mimic realistic strumming
- **Effects Chain:** Reverb, compression, and delay create depth and sustain

---

## Code Organization:

```
src/
├── components/
│   ├── Fretboard.tsx       # Visual fretboard renderer with note highlighting
│   └── Chord.tsx           # Chord display component (legacy)
├── models/
│   ├── Note.ts             # TypeScript interfaces for GuitarNote, ChordPosition
│   ├── Chord.ts            # Chord data model
│   └── Fretboard.ts        # Fretboard data model
├── utils/
│   ├── chordUtils.ts       # Chord formulas and music theory constants
│   ├── fretboardUtils.ts   # Fretboard generation + chord finding algorithms
│   └── midiUtils.ts        # Tone.js audio synthesis and playback
└── App.tsx                 # Main application logic and state management
```

### State Management Architecture
The app uses React's built-in state management with careful optimization:

- **useState:** For UI state (selected key, chord, toggles, active notes)
- **useEffect:** For side effects (updating notes when chord changes, auto-playing)
- **useCallback:** For memoizing expensive computations (chord finding, audio playback)

Key state variables:
```typescript
fretboard: GuitarNote[][]              // Static fretboard data
activeNotes: { note, interval }[]      // Currently highlighted notes
validChords: ChordPosition[][]         // All valid fingerings for current chord
currentChordIndex: number              // Which voicing is displayed
selectedKey: string                    // Current key (C, G, D, etc.)
isMinorKey: boolean                    // Major vs Minor mode
```

---

## ⚙️ Potential Future Enhancements

- **Chord Progressions:** Save and play common progressions (I-IV-V, ii-V-I, etc.) or reintroduce a Chord Progression Generator from Fretboard-2.0. 
- **Alternative Tunings:** Support for Drop D, DADGAD, Open G, etc.
- **Export Features:** Save chord diagrams as images or PDF
- **Mobile Optimization:** Touch-friendly interface for tablets/phones
- **Advanced Filters:** Filter chord voicings by position, difficulty, open strings
- **Recording:** Record and export chord progressions as MIDI or audio files
