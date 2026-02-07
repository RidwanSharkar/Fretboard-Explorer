# Chord Progression Generation Feature

## Overview

The Fretboard Explorer now includes an intelligent **Chord Progression Generation** feature that creates musically coherent 3-4 chord progressions based on any selected chord.

## How It Works

### User Flow

#### Method 1: Using Chord Buttons
1. **Select a Key** - Choose any key from the Circle of Fifths (major or minor)
2. **Select a Chord** - Click on any chord button (I, ii, iii, IV, V, vi, vii°)
3. **Find Chord** - Optional: Click "Find" to see the chord on the fretboard
4. **Generate Progression** - Click the **"GEN"** button to generate a complementary chord progression
5. **Listen & Learn** - The progression plays automatically, highlighting each chord as it plays
6. **Replay** - Click on the displayed progression panel to replay it

#### Method 2: Using Fret Selection (Manual Chord Identification)
1. **Enter Selection Mode** - Click the "Select" button (crosshair icon) to enable fret selection
2. **Pick Frets** - Click on individual frets to build your chord (up to 6 notes, one per string)
3. **Chord Recognition** - The app automatically identifies the chord you've selected
4. **Generate Progression** - Click the **"GEN"** button to create a progression based on your identified chord
5. **Listen & Replay** - The progression plays, and you can replay it by clicking the progression panel

**Both methods work seamlessly** - the progression generator intelligently adapts to any chord source!

## Features

### Dual Input Methods

The progression generator works with **two different chord input methods**:

1. **Pre-defined Chord Buttons** - Use the diatonic chord buttons (I, ii, iii, etc.) from any key
2. **Manual Fret Selection** - Build and identify chords by clicking on individual frets

This flexibility means you can:
- Generate progressions from standard diatonic chords in any key
- Create progressions from any voicing you discover on the fretboard
- Experiment with non-standard chord shapes and still get musical progressions
- Learn chord theory by seeing how unusual chords relate to other chords

### Smart Music Theory Integration

The progression generator uses advanced music theory to create progressions that:

- **Sound Professional** - Based on common progressions used in jazz, pop, rock, and classical music
- **Respect Chord Types** - Different logic for major, minor, diminished, augmented, suspended, and extended chords
- **Follow Harmonic Rules** - Uses functional harmony principles like dominant resolutions, circle progressions, and modal interchange

### Supported Progression Types

#### For Basic Major/Minor Chords:
- **Pop Progression (I-V-vi-IV)** - The classic "4 chords" used in countless hit songs
- **Jazz Turnaround (I-vi-ii-V)** - Smooth jazz progression with 7th chords
- **50s Progression (I-vi-IV-V)** - Doo-wop style progression
- **Circle Progression** - Descending circle of fifths

#### For Advanced Chord Types:
- **Dominant 7th Chords** → ii-V7-I resolution (jazz cadence)
- **Diminished Chords** → Chromatic passing chord progressions
- **Augmented Chords** → Transitional progressions
- **Suspended Chords** → Resolution progressions (sus → stable)
- **Extended Chords (9th, 11th, 13th)** → Modern jazz voicing progressions

### Visual Feedback

- **Progression Display Panel** - Shows the chord names with the progression name and description
- **Real-time Highlighting** - Currently playing chord is highlighted and scaled up
- **Fretboard Integration** - Each chord is displayed on the fretboard as it plays
- **Interactive Replay** - Click the progression panel to replay without regenerating

### Audio Features

- **Sequential Playback** - Chords play one after another with smooth timing (1.5 seconds per chord)
- **Strumming Effect** - Notes within each chord are staggered by 50ms for realistic guitar strumming
- **Professional Sound** - Uses Tone.js with PluckSynth, reverb, compression, and delay effects

### Advanced Voice Leading (NEW!)

The progression generator now uses sophisticated **voice leading optimization** to create musical progressions:

#### What is Voice Leading?
Voice leading is the art of smoothly connecting chords by minimizing finger movement and keeping notes in similar registers. Great musicians use this to make chord progressions sound natural and flowing.

#### How It Works:
1. **Selected Chord Position** - Your selected chord can appear at ANY position in the progression (1st, 2nd, 3rd, or 4th)
2. **Octave Awareness** - Finds chord voicings in similar octave ranges so they sound cohesive
3. **Fretboard Proximity** - Chooses voicings that are physically close together on the fretboard
4. **Minimal Movement** - Optimizes for the smallest finger movements between chords
5. **Common Tones** - Prefers voicings that share notes with adjacent chords

#### Benefits:
- ✅ **More Musical** - Progressions sound like a professional guitarist would play them
- ✅ **Easier to Play** - Chord changes require minimal hand movement
- ✅ **Better Listening Experience** - Similar octaves create harmonic coherence
- ✅ **Learn Real Techniques** - See how pros connect chords on the fretboard

#### Example:
Instead of jumping from fret 3 to fret 12 (awkward!), the system finds voicings that stay in the same area, like frets 5→7→8→5 (smooth!).

## Technical Implementation

### New Files Created

1. **`src/utils/progressionUtils.ts`**
   - Core progression generation logic
   - Music theory algorithms
   - Scale degree calculations
   - Chord relationship analysis
   - **NEW**: Selected chord can appear at any position in the progression

2. **`src/utils/voiceLeadingUtils.ts`** (NEW!)
   - Voice leading distance calculations
   - Chord center position analysis
   - Voicing optimization algorithms
   - Smooth progression path finding
   - Common tone detection

3. **Enhanced `src/utils/midiUtils.ts`**
   - Added `playProgression()` function for sequential chord playback
   - Supports callbacks for chord change events
   - Handles timing and synchronization

4. **Updated `src/App.tsx`**
   - New state management for progressions
   - `handleGenerateProgression()` - Main generation handler with voice leading
   - `handleReplayProgression()` - Replay functionality
   - Progression display UI component
   - Integration with voice leading optimization

### Key Functions

#### `generateUniversalProgression(selectedChord: ChordInfo): Progression`
Intelligently analyzes the selected chord type and generates an appropriate progression:
- Identifies chord characteristics (dominant, diminished, augmented, etc.)
- Applies music theory rules specific to that chord type
- **Places selected chord at optimal position** (can be 1st, 2nd, 3rd, or 4th)
- Returns a progression with name, description, chord sequence, and selected chord index

#### `generateProgressionVariants(selectedChord: ChordInfo): Progression[]`
Generates multiple progression options where the selected chord appears at different positions:
- Dominant chords → ii-V7-I, I-vi-ii-V7 (V7 at different positions)
- Major chords → I-vi-V-I, I-IV-V-I, I-V-vi-IV (as tonic or subdominant)
- Minor chords → i-VI-VII-i, I-V-vi-IV (as tonic or relative minor)
- Extended chords → Jazz voicing progressions

#### `optimizeProgressionVoicings(allChordVoicings, startingVoicing, preferredPosition): ChordPosition[][]`
Finds the smoothest path through a progression using voice leading:
- Parameter: `allChordVoicings` - All possible voicings for each chord
- Parameter: `startingVoicing` - Current voicing of selected chord (optional)
- Parameter: `preferredPosition` - Preferred fret area (optional)
- Returns: Optimized sequence of voicings with minimal movement

#### `calculateVoiceLeadingDistance(chord1, chord2): number`
Measures the "distance" between two chord voicings:
- Compares fret positions string-by-string
- Penalizes voices appearing/disappearing
- Lower score = smoother transition

#### `playProgression(chordsPositions, fretboard, duration, onChordChange, onComplete)`
Plays a sequence of chords with:
- Parameter: `chordsPositions` - Array of chord positions to play
- Parameter: `chordDuration` - Duration in seconds (default: 1.5s)
- Callback: `onChordChange` - Fired when each chord starts
- Callback: `onComplete` - Fired when progression finishes

### State Management

```typescript
const [generatedProgression, setGeneratedProgression] = useState<Progression | null>(null);
const [progressionPositions, setProgressionPositions] = useState<ChordPosition[][][]>([]);
const [currentProgressionChordIndex, setCurrentProgressionChordIndex] = useState(-1);
const [isProgressionPlaying, setIsProgressionPlaying] = useState(false);
```

## Music Theory Behind the Progressions

### Diatonic Progressions (Major Keys)
- **I-V-vi-IV** - Stable → Dominant → Relative minor → Subdominant
- **I-vi-ii-V** - Classic turnaround using all primary function chords
- **I-IV-V** - The three primary chords in any key

### Diatonic Progressions (Minor Keys)
- **i-VI-III-VII** - Modern minor progression (Aeolian mode)
- **i-iv-V7-i** - Minor key with dominant resolution
- **i-VII-VI-V** - Andalusian cadence (flamenco-inspired)

### Functional Harmony
- **Tonic (I/i)** - Home base, stable
- **Subdominant (IV/iv)** - Creates movement away from tonic
- **Dominant (V/V7)** - Creates tension, wants to resolve to tonic
- **Pre-dominant (ii)** - Prepares for the dominant

### Advanced Techniques
- **Secondary Dominants** - V7 of other scale degrees
- **Modal Interchange** - Borrowing chords from parallel modes
- **Chromatic Passing** - Using diminished chords between diatonic chords
- **Voice Leading** - Smooth movement between chord tones

## Future Enhancements (Potential)

- Multiple progression options (let user choose from 2-3 generated progressions)
- Adjustable tempo/speed
- Custom progression length (2, 4, 6, 8 chords)
- Save favorite progressions
- Export to MIDI
- Rhythm patterns (whole notes, quarter notes, syncopation)
- Key modulation within progressions
- Display scale degrees (Roman numerals) on progression display

## Usage Tips

1. **Experiment with Different Keys** - Each key has a unique color theme, try them all!
2. **Try All Chord Types** - The generator adapts to any chord type you select
3. **Use Extensions** - Add 7th, 9th, or 6th before generating for jazzy progressions
4. **Listen Carefully** - Notice how each chord flows naturally to the next
5. **Learn Patterns** - Pay attention to the progression names and descriptions to learn music theory

## Credits

- **Music Theory** - Based on classical, jazz, and popular music harmony principles
- **Audio Engine** - Powered by Tone.js
- **UI Integration** - Seamlessly integrated with existing Circle of Fifths interface

---

**Enjoy creating beautiful chord progressions!** 🎸🎵
