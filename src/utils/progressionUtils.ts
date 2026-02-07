import { ChordType } from './chordUtils';

export interface ChordInfo {
  root: string;
  type: ChordType;
}

export interface Progression {
  chords: ChordInfo[];
  name: string;
  description: string;
  selectedChordIndex?: number; // Index of the originally selected chord in the progression
}

// Common progression patterns based on music theory
const PROGRESSION_PATTERNS = {
  // Major key progressions
  major: [
    {
      name: 'Pop Progression (I-V-vi-IV)',
      pattern: [0, 4, 5, 3], // Scale degrees
      types: ['major', 'major', 'minor', 'major'] as ChordType[],
      description: 'Classic pop/rock progression'
    },
    {
      name: 'Jazz Turnaround (I-vi-ii-V)',
      pattern: [0, 5, 1, 4],
      types: ['major7', 'minor7', 'minor7', 'dominant7'] as ChordType[],
      description: 'Classic jazz turnaround'
    },
    {
      name: 'Circle Progression (I-IV-vii°-iii-vi-ii-V-I)',
      pattern: [0, 3, 6, 2, 5, 1, 4],
      types: ['major', 'major', 'diminished', 'minor'] as ChordType[],
      description: 'Descending circle of fifths'
    },
    {
      name: '50s Progression (I-vi-IV-V)',
      pattern: [0, 5, 3, 4],
      types: ['major', 'minor', 'major', 'major'] as ChordType[],
      description: 'Classic 1950s doo-wop'
    }
  ],
  // Minor key progressions
  minor: [
    {
      name: 'Minor Pop (i-VI-III-VII)',
      pattern: [0, 5, 2, 6],
      types: ['minor', 'major', 'major', 'major'] as ChordType[],
      description: 'Modern minor key progression'
    },
    {
      name: 'Minor Jazz (i-iv-V7-i)',
      pattern: [0, 3, 4],
      types: ['minor7', 'minor7', 'dominant7'] as ChordType[],
      description: 'Minor key jazz cadence'
    },
    {
      name: 'Andalusian (i-VII-VI-V)',
      pattern: [0, 6, 5, 4],
      types: ['minor', 'major', 'major', 'major'] as ChordType[],
      description: 'Flamenco-style descending progression'
    },
    {
      name: 'Minor ii-V-i',
      pattern: [1, 4, 0],
      types: ['diminished', 'dominant7', 'minor'] as ChordType[],
      description: 'Minor key turnaround'
    }
  ]
};

// Secondary dominants and substitutions for advanced progressions (reserved for future use)
// const SECONDARY_DOMINANTS: { [key: number]: ChordType } = {
//   1: 'dominant7', // V7/ii
//   2: 'dominant7', // V7/iii
//   3: 'dominant7', // V7/IV
//   4: 'dominant7', // V7/V
//   5: 'dominant7', // V7/vi
// };

// Notes in chromatic order
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Major scale intervals (semitones from root)
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
// Natural minor scale intervals
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

/**
 * Normalize note name (convert flats to sharps)
 */
function normalizeNote(note: string): string {
  const flatToSharp: { [key: string]: string } = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  return flatToSharp[note] || note;
}

/**
 * Get note at a specific scale degree (0-6)
 * Scale degrees: 0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii
 */
function getNoteAtDegree(rootNote: string, degree: number, isMinor: boolean): string {
  const normalizedRoot = normalizeNote(rootNote);
  const rootIndex = CHROMATIC_NOTES.indexOf(normalizedRoot);
  
  if (rootIndex === -1) return rootNote;
  
  const scale = isMinor ? MINOR_SCALE : MAJOR_SCALE;
  const semitones = scale[degree % 7];
  const noteIndex = (rootIndex + semitones) % 12;
  
  return CHROMATIC_NOTES[noteIndex];
}

/**
 * Get note at a specific number of semitones from root
 */
function getNoteAtSemitones(rootNote: string, semitones: number): string {
  const normalizedRoot = normalizeNote(rootNote);
  const rootIndex = CHROMATIC_NOTES.indexOf(normalizedRoot);
  
  if (rootIndex === -1) return rootNote;
  
  const noteIndex = (rootIndex + semitones) % 12;
  return CHROMATIC_NOTES[noteIndex];
}

/**
 * Determine if a chord is likely in a major or minor context
 */
function determineKeyContext(chord: ChordInfo): { isMinor: boolean; key: string } {
  const minorChordTypes: ChordType[] = ['minor', 'minor7', 'minor9', 'minor11', 'minor13'];
  const isMinor = minorChordTypes.includes(chord.type);
  
  return {
    isMinor,
    key: chord.root
  };
}

/**
 * Generate a complementary chord progression based on the selected chord
 */
export function generateChordProgression(selectedChord: ChordInfo, complexity: 'simple' | 'jazz' = 'simple'): Progression {
  const context = determineKeyContext(selectedChord);
  const patterns = context.isMinor ? PROGRESSION_PATTERNS.minor : PROGRESSION_PATTERNS.major;
  
  // Choose pattern based on complexity and chord type
  let chosenPattern;
  
  if (complexity === 'jazz' || selectedChord.type.includes('7') || selectedChord.type.includes('9')) {
    // Use jazz progressions for complex chords
    chosenPattern = patterns.find(p => p.name.includes('Jazz')) || patterns[1];
  } else {
    // Use simpler progressions for basic chords
    chosenPattern = patterns[0];
  }
  
  // Generate chords based on pattern
  const chords: ChordInfo[] = chosenPattern.pattern.map((degree, index) => {
    const root = getNoteAtDegree(context.key, degree, context.isMinor);
    const type = chosenPattern.types[index] || chosenPattern.types[0];
    
    return { root, type };
  });
  
  // Take only 3-4 chords for the progression
  const progressionLength = Math.min(4, chords.length);
  
  return {
    chords: chords.slice(0, progressionLength),
    name: chosenPattern.name,
    description: chosenPattern.description
  };
}

/**
 * Generate multiple progression options
 */
export function generateProgressionOptions(selectedChord: ChordInfo): Progression[] {
  const context = determineKeyContext(selectedChord);
  const patterns = context.isMinor ? PROGRESSION_PATTERNS.minor : PROGRESSION_PATTERNS.major;
  
  return patterns.map(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const root = getNoteAtDegree(context.key, degree, context.isMinor);
      const type = pattern.types[index] || pattern.types[0];
      return { root, type };
    });
    
    // Take only 3-4 chords
    const progressionLength = Math.min(4, chords.length);
    
    return {
      chords: chords.slice(0, progressionLength),
      name: pattern.name,
      description: pattern.description
    };
  });
}

/**
 * Generate progression patterns where the selected chord can appear at different positions
 */
function generateProgressionVariants(selectedChord: ChordInfo): Progression[] {
  const normalizedRoot = normalizeNote(selectedChord.root);
  const progressions: Progression[] = [];

  // Analyze chord type
  const isDominant = selectedChord.type.includes('dominant') || selectedChord.type === 'dominant7';
  const isDiminished = selectedChord.type.includes('diminished');
  const isExtended = selectedChord.type.includes('9') || selectedChord.type.includes('11') || selectedChord.type.includes('13');
  const isMajor = selectedChord.type === 'major' || selectedChord.type === 'major7';
  const isMinor = selectedChord.type === 'minor' || selectedChord.type === 'minor7';

  if (isDominant) {
    // V7 can appear in different positions
    // For a dominant chord, find its tonic (up a P4/down a P5 = +5 semitones in chromatic)
    const tonicRoot = getNoteAtSemitones(normalizedRoot, 5);
    
    // Classic ii-V7-I (V7 in middle)
    // If V7 is the selected chord, we need ii and I relative to the tonic
    progressions.push({
      chords: [
        { root: getNoteAtDegree(tonicRoot, 1, false), type: 'minor7' }, // ii of tonic
        selectedChord,                                                   // V7
        { root: tonicRoot, type: 'major7' }                             // I (tonic)
      ],
      name: 'ii-V7-I Turnaround',
      description: 'Classic jazz cadence',
      selectedChordIndex: 1
    });

    // I-vi-ii-V7 (V7 at end)
    progressions.push({
      chords: [
        { root: tonicRoot, type: 'major7' },                             // I (tonic)
        { root: getNoteAtDegree(tonicRoot, 5, false), type: 'minor7' },  // vi of tonic
        { root: getNoteAtDegree(tonicRoot, 1, false), type: 'minor7' },  // ii of tonic
        selectedChord                                                     // V7
      ],
      name: 'I-vi-ii-V7',
      description: 'Building tension to dominant',
      selectedChordIndex: 3
    });

  } else if (isDiminished) {
    // Diminished as passing chord (middle position)
    const rootIndex = CHROMATIC_NOTES.indexOf(normalizedRoot);
    const prevRoot = CHROMATIC_NOTES[(rootIndex - 1 + 12) % 12];
    const nextRoot = CHROMATIC_NOTES[(rootIndex + 1) % 12];

    progressions.push({
      chords: [
        { root: prevRoot, type: 'major' },
        selectedChord,
        { root: nextRoot, type: 'minor' }
      ],
      name: 'Chromatic Passing',
      description: 'Diminished connects chromatically',
      selectedChordIndex: 1
    });

  } else if (isMajor) {
    // Major chord - various positions in progressions
    
    // As tonic (I) - first position
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: 'minor' },      // vi (scale degree 5)
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: 'dominant7' },  // V (scale degree 4)
        selectedChord                                                   // I
      ],
      name: 'I-vi-V-I',
      description: 'Returning home',
      selectedChordIndex: 0
    });

    // As IV - second position
    // If selected chord is IV, find I (down a P4 = -5 semitones / up a P5 = +7 semitones)
    const tonicRoot = getNoteAtSemitones(normalizedRoot, 7);
    progressions.push({
      chords: [
        { root: tonicRoot, type: 'major' },                             // I
        selectedChord,                                                  // IV
        { root: getNoteAtDegree(tonicRoot, 4, false), type: 'dominant7' },  // V (scale degree 4 of tonic)
        { root: tonicRoot, type: 'major' }                              // I
      ],
      name: 'I-IV-V-I',
      description: 'Classic subdominant movement',
      selectedChordIndex: 1
    });

    // Pop progression with major as I (THIS WAS THE BUG!)
    progressions.push({
      chords: [
        selectedChord,                                                  // I (scale degree 0)
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: 'major' },      // V (scale degree 4)
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: 'minor' },      // vi (scale degree 5)
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: 'major' }       // IV (scale degree 3)
      ],
      name: 'I-V-vi-IV',
      description: 'Popular progression',
      selectedChordIndex: 0
    });

  } else if (isMinor) {
    // Minor chord progressions

    // As i (tonic) in natural minor
    progressions.push({
      chords: [
        selectedChord,                                                  // i (minor tonic)
        { root: getNoteAtDegree(normalizedRoot, 5, true), type: 'major' },  // VI (scale degree 5 in minor)
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: 'major' },  // VII (scale degree 6 in minor)
        selectedChord                                                   // i
      ],
      name: 'i-VI-VII-i',
      description: 'Minor key progression',
      selectedChordIndex: 0
    });

    // As vi in major key (relative major is up a minor 3rd = 3 semitones)
    const majorKeyRoot = getNoteAtSemitones(normalizedRoot, 3);
    progressions.push({
      chords: [
        { root: majorKeyRoot, type: 'major' },                          // I (relative major)
        { root: getNoteAtDegree(majorKeyRoot, 4, false), type: 'major' },  // V (scale degree 4 in major)
        selectedChord,                                                  // vi (selected minor chord)
        { root: getNoteAtDegree(majorKeyRoot, 3, false), type: 'major' }   // IV (scale degree 3 in major)
      ],
      name: 'I-V-vi-IV',
      description: 'Minor as relative vi',
      selectedChordIndex: 2
    });

  } else if (isExtended || selectedChord.type.includes('7')) {
    // Extended/7th chords
    progressions.push({
      chords: [
        selectedChord,                                                  // I (or whatever the selected chord is)
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: 'minor7' },      // vi (scale degree 5)
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: 'dominant7' },   // V (scale degree 4)
        selectedChord                                                   // Back to selected chord
      ],
      name: 'Extended Harmony',
      description: 'Rich jazz voicings',
      selectedChordIndex: 0
    });
  }

  // Default fallback
  if (progressions.length === 0) {
    const prog = generateChordProgression(selectedChord, 'simple');
    prog.selectedChordIndex = 0;
    progressions.push(prog);
  }

  return progressions;
}

/**
 * Generate a progression that works with any chord type (advanced logic)
 * The selected chord can appear at any position in the progression
 */
export function generateUniversalProgression(selectedChord: ChordInfo): Progression {
  const variants = generateProgressionVariants(selectedChord);
  
  // Pick a random variant for variety
  const randomIndex = Math.floor(Math.random() * variants.length);
  const selectedProgression = variants[randomIndex];
  
  // Ensure it's 3-4 chords
  return {
    ...selectedProgression,
    chords: selectedProgression.chords.slice(0, 4)
  };
}
