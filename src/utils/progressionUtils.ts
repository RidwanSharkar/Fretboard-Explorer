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
 * Determine if a chord type should use extended voicings (7ths, 9ths, etc.)
 */
function shouldUseExtensions(chordType: ChordType): boolean {
  return chordType.includes('7') || 
         chordType.includes('9') || 
         chordType.includes('11') || 
         chordType.includes('13') ||
         chordType.includes('6');
}

/**
 * Get appropriate chord type for a scale degree based on the selected chord's extensions
 */
function getChordTypeForDegree(
  degree: number, 
  isMinorKey: boolean, 
  useExtensions: boolean
): ChordType {
  // Scale degree chord qualities
  if (isMinorKey) {
    // Natural minor: i, ii°, III, iv, v, VI, VII
    const qualities = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
    const baseType = qualities[degree] as ChordType;
    
    if (useExtensions) {
      if (baseType === 'minor') return 'minor7';
      if (baseType === 'major') return 'major7';
      if (baseType === 'diminished') return 'diminished7';
    }
    return baseType;
  } else {
    // Major: I, ii, iii, IV, V, vi, vii°
    const qualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
    const baseType = qualities[degree] as ChordType;
    
    if (useExtensions) {
      if (baseType === 'minor') return 'minor7';
      if (baseType === 'major' && degree !== 4) return 'major7'; // I, IV get maj7
      if (baseType === 'major' && degree === 4) return 'dominant7'; // V gets dom7
      if (baseType === 'diminished') return 'm7b5'; // vii° gets half-diminished
    }
    return baseType;
  }
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
  
  // Check if selected chord uses extensions (7ths, 9ths, etc.)
  const useExtensions = shouldUseExtensions(selectedChord.type);

  if (isDominant) {
    // V7 can appear in different positions
    // For a dominant chord, find its tonic (up a P4/down a P5 = +5 semitones in chromatic)
    const tonicRoot = getNoteAtSemitones(normalizedRoot, 5);
    
    // Dominant chords are already extended, so use true for extensions
    const domUseExtensions = true;
    
    // Classic ii-V7-I (V7 in middle)
    progressions.push({
      chords: [
        { root: getNoteAtDegree(tonicRoot, 1, false), type: getChordTypeForDegree(1, false, domUseExtensions) }, // ii7
        selectedChord,                                                   // V7
        { root: tonicRoot, type: getChordTypeForDegree(0, false, domUseExtensions) }  // Imaj7
      ],
      name: 'ii-V7-I Turnaround',
      description: 'Classic jazz cadence',
      selectedChordIndex: 1
    });

    // I-vi-ii-V7 (V7 at end)
    progressions.push({
      chords: [
        { root: tonicRoot, type: getChordTypeForDegree(0, false, domUseExtensions) },                             // Imaj7
        { root: getNoteAtDegree(tonicRoot, 5, false), type: getChordTypeForDegree(5, false, domUseExtensions) },  // vi7
        { root: getNoteAtDegree(tonicRoot, 1, false), type: getChordTypeForDegree(1, false, domUseExtensions) },  // ii7
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
        { root: prevRoot, type: useExtensions ? 'major7' : 'major' },
        selectedChord,
        { root: nextRoot, type: useExtensions ? 'minor7' : 'minor' }
      ],
      name: 'Chromatic Passing',
      description: 'Diminished connects chromatically',
      selectedChordIndex: 1
    });

  } else if (isMajor) {
    // Major chord - various positions in progressions
    
    // 1. I-V-vi-IV (Pop progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) },  // V
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, useExtensions) },  // vi
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) }   // IV
      ],
      name: 'I-V-vi-IV',
      description: 'Popular progression',
      selectedChordIndex: 0
    });

    // 2. I-vi-IV-V (50s progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, useExtensions) },  // vi
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) },  // IV
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-vi-IV-V',
      description: 'Classic 1950s progression',
      selectedChordIndex: 0
    });

    // 3. I-IV-I-V (Rock progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) },  // IV
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-IV-I-V',
      description: 'Rock/blues progression',
      selectedChordIndex: 0
    });

    // 4. I-vi-ii-V (Jazz turnaround)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, useExtensions) },  // vi
        { root: getNoteAtDegree(normalizedRoot, 1, false), type: getChordTypeForDegree(1, false, useExtensions) },  // ii
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-vi-ii-V',
      description: 'Jazz turnaround',
      selectedChordIndex: 0
    });

    // 5. I-IV-V-I (Classic rock)
    const tonicRoot = getNoteAtSemitones(normalizedRoot, 7);
    progressions.push({
      chords: [
        { root: tonicRoot, type: getChordTypeForDegree(0, false, useExtensions) },                         // I
        selectedChord,                                                                                      // IV
        { root: getNoteAtDegree(tonicRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) },  // V
        { root: tonicRoot, type: getChordTypeForDegree(0, false, useExtensions) }                          // I
      ],
      name: 'I-IV-V-I',
      description: 'Classic subdominant movement',
      selectedChordIndex: 1
    });

    // 6. I-iii-IV-V (Ascending progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 2, false), type: getChordTypeForDegree(2, false, useExtensions) },  // iii
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) },  // IV
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-iii-IV-V',
      description: 'Ascending progression',
      selectedChordIndex: 0
    });

  } else if (isMinor) {
    // Minor chord progressions

    // 1. i-VI-VII-i (Natural minor)
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 5, true), type: getChordTypeForDegree(5, true, useExtensions) },  // VI
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) },  // VII
        selectedChord                                                   // i
      ],
      name: 'i-VI-VII-i',
      description: 'Minor key progression',
      selectedChordIndex: 0
    });

    // 2. Andalusian cadence - i-VII-VI-V
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) },  // VII
        { root: getNoteAtDegree(normalizedRoot, 5, true), type: getChordTypeForDegree(5, true, useExtensions) },  // VI
        { root: getNoteAtDegree(normalizedRoot, 4, true), type: getChordTypeForDegree(4, true, useExtensions) }   // V
      ],
      name: 'Andalusian (i-VII-VI-V)',
      description: 'Flamenco-style descending progression',
      selectedChordIndex: 0
    });

    // 3. Minor pop - i-VI-III-VII
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 5, true), type: getChordTypeForDegree(5, true, useExtensions) },  // VI
        { root: getNoteAtDegree(normalizedRoot, 2, true), type: getChordTypeForDegree(2, true, useExtensions) },  // III
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) }   // VII
      ],
      name: 'Minor Pop (i-VI-III-VII)',
      description: 'Modern minor key progression',
      selectedChordIndex: 0
    });

    // 4. Minor jazz - i-iv-V7-i (V7 always uses dominant7 for resolution)
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 3, true), type: getChordTypeForDegree(3, true, useExtensions) },  // iv
        { root: getNoteAtDegree(normalizedRoot, 4, true), type: 'dominant7' },  // V7 (always dom7)
        selectedChord                                                   // i
      ],
      name: 'Minor Jazz (i-iv-V7-i)',
      description: 'Minor key jazz cadence',
      selectedChordIndex: 0
    });

    // 5. i-iv-VII-III (Dorian progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 3, true), type: getChordTypeForDegree(3, true, useExtensions) },  // iv
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) },  // VII
        { root: getNoteAtDegree(normalizedRoot, 2, true), type: getChordTypeForDegree(2, true, useExtensions) }   // III
      ],
      name: 'i-iv-VII-III',
      description: 'Dorian minor progression',
      selectedChordIndex: 0
    });

    // 6. As vi in major key (relative major is up a minor 3rd = 3 semitones)
    const majorKeyRoot = getNoteAtSemitones(normalizedRoot, 3);
    progressions.push({
      chords: [
        { root: majorKeyRoot, type: getChordTypeForDegree(0, false, useExtensions) },                          // I
        { root: getNoteAtDegree(majorKeyRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) },  // V
        selectedChord,                                                                                          // vi
        { root: getNoteAtDegree(majorKeyRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) }   // IV
      ],
      name: 'I-V-vi-IV',
      description: 'Minor as relative vi',
      selectedChordIndex: 2
    });

  } else if (isExtended || selectedChord.type.includes('7')) {
    // Extended/7th chords - always use extensions
    const extUseExtensions = true;
    progressions.push({
      chords: [
        selectedChord,                                                  // I (or whatever the selected chord is)
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, extUseExtensions) },  // vi7
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, extUseExtensions) },  // V7
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
