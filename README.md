# 🎸 Fretboard Explorer v3.0
*An interactive React application for guitarists to learn and explore music theory. Combining visual fretboard mapping, intelligent chord generation algorithms, and real-time MIDI playback, this tool helps musicians discover chord voicings, understand harmonic relationships, and master the guitar fretboard through an intuitive, color-coded interface based on the Circle of Fifths.*

**LINK: https://ridwansharkar.github.io/Fretboard-Explorer/**

## 📜 Overview:

**Fretboard Explorer** bridges the gap between music theory and practical guitar playing by algorithmically generating all physically playable chord fingerings for any chord in any key.

![Fretboardx](https://github.com/user-attachments/assets/c3515850-8987-48e9-89f7-4e2d84e0c55b)

### Key Features:
- **🧮 Intelligent Chord Discovery:** Select any chord from the Circle of Fifths and instantly visualize all notes across the 6-string, 16-fret board. Advanced algorithms compute hundreds of valid fingering positions based on real-world playability constraints (finger stretch, fret spacing, string accessibility).

- **🔍 Manual Fret Selection & Chord Recognition:** Click individual frets to build your own chords. The app automatically identifies the chord you've created and highlights all instances of those notes across the entire fretboard.

- **🔄 Chord Progression Generator:** Generate musically sophisticated progressions ranging from simple 3-4 chord loops to complex 5-8 chord phrases. Includes 70+ progression types spanning multiple genres and styles:
  - **Modal Progressions:** Dorian, Phrygian, Lydian, Mixolydian
  - **Borrowed Chords:** Modal interchange from parallel major/minor keys
  - **Secondary Dominants:** V7/ii, V7/V, and other tonicizations
  - **Tritone Substitutions:** Jazz harmony with ♭II7 dominant substitutes
  - **Blues Forms:** 12-bar blues, minor blues, blues turnarounds
  - **Gospel/Neo-Soul:** Rich extended voicings with 9ths and 13ths
  - **Cinematic Progressions:** Epic 6-8 chord arcs for film/trailer music
  - Features advanced voice leading algorithms that optimize smooth transitions across all chord changes

- **🎹 Real-Time MIDI Synthesis:** Hear exactly what you see. Powered by Tone.js, each chord voicing plays through a realistic guitar synthesizer with pluck dynamics, reverb, compression, and delay effects that mimic authentic guitar tone.

- **🎼 Music Theory Integration:** Built-in Circle of Fifths interface with 24 key signatures (12 major + 12 minor), dynamic color theming per key, intelligent 7th/9th chord logic, and scale degree relationships that help you understand harmonic progressions intuitively.

- **🪉 Advanced Chord Customization:** Toggle between standard triads, 7th chords, and 9th extensions. Navigate through multiple voicings with Next/Prev controls to find the perfect fingering for your playing style and song context.

- **🎨 Educational Design:** Color-coded notes, interval labeling, and visual feedback make complex music theory concepts accessible for beginners while providing powerful tools for advanced musicians exploring jazz voicings and extended harmonies.

- **💾 Tab Saving & Export:** Save your generated progressions as guitar tablature. The "Save Tab" button captures your entire progression with proper fret numbers, making it easy to reference and practice later.

### How It Works:
The application uses a backtracking algorithm to recursively search through all possible note combinations on the fretboard, validating each potential chord shape against ergonomic constraints. When you select "C Major 7", the system calculates the notes (C-E-G-B), finds every instance across the fretboard, then generates all valid 4-note combinations that a human hand can actually play—typically yielding 200-400 unique voicings to explore.

---

## Using Controls: 
- **Chord Discovery (Row 1):** Click any chord name button to display all its notes across the fretboard. You can specify chord qualities (7th/9th) before pressing **'Find'** to generate all playable voicings. Row 2 buttons under the chord names will play a random chord of the key's scale degree to explore quick 
relationships.

- **Manual Selection:** Click the **'Select'** button (crosshair icon) to enter manual mode. Click individual frets to build a chord; the app will automatically identify it and find its notes everywhere on the board.

- **Progression Generator:** Click the **'GEN'** button after selecting any chord to create a musical progression. The system generates progressions ranging from simple 3-4 chord loops to sophisticated 5-8 chord phrases, including:
  - Modal progressions (Dorian, Mixolydian, Lydian, Phrygian)
  - Borrowed chords and modal interchange
  - Secondary dominants and tritone substitutions
  - Blues, gospel, and cinematic progressions
  - All optimized for smooth voice leading with minimal finger movement

- **Save Progressions:** Click the **'Save Tab'** button after generating a progression to capture the tablature. The system exports the entire chord sequence with fret numbers for easy reference.

- **Navigation & Playback:** Use **'Next'** and **'Prev'** arrows to explore different voicings of a chord. Click the progression display panel to replay a generated sequence.

- **Key Exploration (Row 2):** Buttons under the chord names play random chords from the current key's scale degrees to help you explore harmonic relationships. 

![image](https://github.com/user-attachments/assets/44774bcd-434e-4faf-bea0-37ddf467547b)

---

## Basic Design:

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

### 5. Manual Chord Identification
When a user selects frets manually, the system identifies the chord by:
1. Collecting all unique note names from the selected frets.
2. Testing these notes against every possible root (A-G#) and chord formula (Major, Minor, 7th, etc.).
3. Calculating a "match score" based on how many notes from the formula are present.
4. If multiple matches occur, the most musically logical one is selected (preferring simpler triads or standard extensions).

### 6. Advanced Chord Progression System
The progression generator implements professional music theory with 70+ progression templates across multiple categories:

**Progression Types & Musical Intent:**
```typescript
type ProgressionIntent = 'loop' | 'phrase' | 'turnaround' | 'cinematic' | 'vamp';

// Loops (3-4 chords): Designed for repetition
// Phrases (5-8 chords): Create narrative arcs with delayed resolution
// Turnarounds: Focus on returning to tonic
// Cinematic: Epic emotional journeys
// Vamps: Stateful 2-chord patterns
```

**Advanced Harmonic Techniques:**

1. **Modal Progressions:**
   - Dorian: `i-IV-i-v` (funk, jazz)
   - Mixolydian: `I-♭VII-IV` (rock, jam bands)
   - Lydian: `I-II-V` (bright, film scores)
   - Phrygian: `i-♭II-i` (Spanish, metal)

2. **Borrowed Chords (Modal Interchange):**
   ```typescript
   // Major borrowing from minor:
   'I-♭VII-IV-I'  // Epic rock progression
   'I-iv-I'       // Emotional minor subdominant
   'I-♭VI-♭VII-I' // Cinematic progression
   
   // Minor borrowing from major:
   'i-IV-V'       // Bright resolution
   'i-I-♭VII'     // Picardy third variation
   ```

3. **Secondary Dominants:**
   ```typescript
   'I-V7/vi-vi'     // Tonicization of relative minor
   'ii-V7/V-V-I'    // Double dominant (V of V)
   'I-V7/ii-ii-V-I' // Enhanced jazz turnaround
   ```

4. **Tritone Substitutions:**
   ```typescript
   'ii-♭II7-I'      // Jazz tritone sub (replaces V7)
   'I-♭II7-I'       // Chromatic approach
   // Tritone = +6 semitones, maintains dominant7 quality
   ```

5. **Blues Progressions:**
   ```typescript
   'I7-IV7-I7-V7'          // 12-bar blues
   'i7-iv7-V7'             // Minor blues
   'I7-VI7-ii7-V7'         // Blues turnaround
   ```

6. **Gospel & Neo-Soul:**
   ```typescript
   'I-iii-vi-ii-V-I'       // Classic gospel run with 9ths
   'I-♭III-IV-iv'          // Neo-soul color
   'IV-iv-I-iii-vi-ii-V'   // Extended gospel phrase
   ```

7. **Cinematic Progressions (6-8 chords):**
   ```typescript
   'i-VI-III-VII-iv-V-i'   // Epic minor arc
   'I-V-vi-IV-I-♭VII-I'    // Heroic journey
   'i-♭VII-♭VI-V-iv-i'     // Trailer music
   ```

**Intelligent Pattern Selection:**
```typescript
// Weighted selection based on complexity level
if (complexity === 'jazz') {
  // Jazz mode: Advanced + phrase progressions (2x weight)
  pool = [...basic, ...advanced, ...advanced, ...phrases, ...phrases];
} else {
  // Simple mode: Basic patterns + half of phrase progressions
  pool = [...basic, ...basic, ...intermediate, ...halfPhrases];
}

// Random selection with 70% chord-positioned, 30% pattern-based
const progression = Math.random() < 0.7 
  ? selectWithChordPosition(selectedChord)
  : generateFromPattern(selectedChord, complexity);
```

**Voice Leading Optimization:**
The system implements sophisticated voice leading algorithms that work across 3-8 chord progressions:

```typescript
// Multi-factor scoring for optimal chord transitions
function optimizeVoicings(chords[][]): ChordPosition[][] {
  for each chord:
    score = voiceLeadingDistance    // Finger movement (primary)
          + spanPenalty * 0.2       // Playability (prefer 3-4 fret span)
          + centerDistance * 0.3    // Position consistency
          + fullnessBonus           // Prefer 3-4 note voicings
          - commonTones * 2;        // Reward held notes
  
  return pathWithMinimalTotalDistance;
}
```

**Fallback Strategies:**
When complex chords (9ths, 11ths, 13ths) can't be fully voiced:
```typescript
1. Try full chord with extensions (5-6 notes)
2. Try base triad (root-3rd-5th)
3. Generate intelligent fallback:
   - Simple triad on middle strings
   - Power chord (root + 5th)
   - Single root note (rare)
4. Prefer fuller voicings (3-4 notes) over sparse ones
```

This creates smooth, professional-sounding progressions that stay in playable positions while maintaining harmonic complexity.

---

## Music Theory Implementation:

### Comprehensive Harmonic System
The app implements professional-level music theory across multiple dimensions:

**Scale Systems:**
```typescript
// 6 complete modal scales
MAJOR_SCALE      = [0, 2, 4, 5, 7, 9, 11];    // Ionian
MINOR_SCALE      = [0, 2, 3, 5, 7, 8, 10];    // Aeolian
DORIAN_SCALE     = [0, 2, 3, 5, 7, 9, 10];    // Dorian
PHRYGIAN_SCALE   = [0, 1, 3, 5, 7, 8, 10];    // Phrygian
LYDIAN_SCALE     = [0, 2, 4, 6, 7, 9, 11];    // Lydian
MIXOLYDIAN_SCALE = [0, 2, 4, 5, 7, 9, 10];    // Mixolydian
```

**Chord Quality Logic:**
- **Diatonic Chords:** Automatically applies correct quality per scale degree
  - Major: I, ii, iii, IV, V, vi, vii°
  - Minor: i, ii°, III, iv, v, VI, VII
- **Modal Chords:** Adjusts qualities based on modal scale intervals
  - Dorian: i, ii, III, IV, v, vi°, VII
  - Mixolydian: I, ii, iii°, IV, v, vi, VII
- **Borrowed Chords:** Applies alterations from parallel modes
  - `♭VII, ♭VI, ♭III` from minor to major
  - `IV, V, I` from major to minor

### Dynamic 7th/9th/13th Extension Logic
The app intelligently determines chord extensions based on context:

- **Dominant 7ths:** Automatically applied to V chords (always flatted 7th)
- **Major 7ths:** Applied to I and IV chords in major keys
- **Minor 7ths:** Applied to ii, iii, vi chords and all minor key chords
- **Extended Voicings:** 9ths, 11ths, 13ths applied to gospel/jazz progressions
- **Context-aware:** The same root note uses different extensions depending on:
  - Key context (major vs minor)
  - Modal context (Dorian vs Aeolian)
  - Progression type (blues, gospel, jazz)

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

## Audio System:

### Multi-Instrument Synthesis Engine
The app offers three distinct audio options for different sonic experiences:

#### 1. **Pluck Synth (Tone.js)**
Real-time synthesized guitar tone with layered audio processing:

**Signal Chain:**
```
PluckSynth → Reverb → Compressor → Delay → Output
    ↓          ↓          ↓          ↓
  Attack    Room        Dynamic    Echo
  Noise     Space       Range      Effect
```

**Features:**
- **String Simulation:** Karplus-Strong synthesis with attack noise and natural dampening
- **Dynamic Effects:** Reverb (room space), compression (dynamic range), delay (echo)
- **Chord Strumming:** Notes staggered by 50ms for realistic strumming
- **Real-time Synthesis:** Instant playback with no loading time

### Audio Architecture
**Octave Mapping:**
```typescript
// Each string/fret position maps to correct MIDI octave
string 0 (E high): E4-E5 range
string 1 (B):      B3-B4 range
string 2 (G):      G3-G4 range
string 3 (D):      D3-D4 range
string 4 (A):      A2-A3 range
string 5 (E low):  E2-E3 range
```

**Playback System:**
- **Sample Loading:** Tone.js Sampler loads audio files on demand
- **Fallback Logic:** If samples fail to load, falls back to PluckSynth
- **Chord Strumming:** 50ms stagger between notes for realistic arpeggiation
- **Progression Playback:** 600ms per chord with smooth transitions

---

## Code Organization:

```
src/
├── components/
│   ├── Fretboard.tsx       # Visual fretboard renderer with note highlighting
│   ├── TabPopup.tsx        # Tab export popup for saving progressions
│   └── Chord.tsx           # Chord display component (legacy)
├── models/
│   ├── Note.ts             # TypeScript interfaces for GuitarNote, ChordPosition
│   ├── Chord.ts            # Chord data model
│   └── Fretboard.ts        # Fretboard data model
├── utils/
│   ├── chordUtils.ts       # Chord formulas, intervals, and chord recognition
│   ├── fretboardUtils.ts   # Fretboard generation + intelligent chord finding
│   │                       # Now supports partial voicings for extended chords
│   ├── progressionUtils.ts # Advanced progression generation (70+ templates)
│   │                       # Modes, borrowed chords, secondary dominants,
│   │                       # tritone subs, blues, gospel, cinematic progressions
│   ├── voiceLeadingUtils.ts # Sophisticated voice leading optimization
│   │                        # Handles 3-8 chord progressions with fallback strategies
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
