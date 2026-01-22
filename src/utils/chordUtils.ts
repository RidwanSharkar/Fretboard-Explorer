// src/utils/chordUtils.ts

export interface ChordInfo {
  root: string;
  type: ChordType;
}

export type IntervalType =
  | 'perfect unison' | 'minor 2nd' | 'major 2nd' | 'minor 3rd' | 'major 3rd'
  | 'perfect 4th' | 'tritone' | 'perfect 5th' | 'minor 6th' | 'major 6th'
  | 'minor 7th' | 'major 7th' | 'octave' | 'minor 9th' | 'major 9th';

export interface IntervalInfo {
  root: string;
  interval: IntervalType;
  semitones: number;
}
export const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

// Convert flat note names to sharp equivalents
const normalizeNote = (note: string): string => {
  const flatToSharp: { [key: string]: string } = {
    'Bb': 'A#', 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#',
    'bb': 'A#', 'db': 'C#', 'eb': 'D#', 'gb': 'F#', 'ab': 'G#' // lowercase too
  };
  return flatToSharp[note] || note;
};

export type ChordType = 'major' | 'minor' | 'dominant7' | 'diminished' | 'diminished7' | 'major7' | 'minor7' | 'minor9' | 'minoradd9' | 'major9' | 'majoradd9' | 'augmented' | 'sus2' | 'sus4' | 'major6' | 'minor6' | 'maj7no5' | '7no5' | '6no3' | '7sus4' | '13' | '13no5' | '13no11';

export interface ChordPosition {
  string: number;
  fret: number;
}

interface GuitarNote {
  string: number;
  fret: number;
  name: string;
}

export const chordFormulas: { [key in ChordType]: number[] } = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  augmented: [0, 4, 8],
  diminished: [0, 3, 6],

  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  diminished7: [0, 3, 6, 9],

  minor9: [0, 3, 7, 10, 2],
  minoradd9: [0, 3, 7, 2],
  major9: [0, 4, 7, 11, 2],
  majoradd9: [0, 4, 7, 2],

  sus2: [0, 2, 7],
  sus4: [0, 5, 7],

  // 6th chords (6th = 9 semitones from root)
  major6: [0, 4, 7, 9],
  minor6: [0, 3, 7, 9],

  // Chords with omitted notes
  maj7no5: [0, 4, 11], // major7 without perfect 5th
  '7no5': [0, 4, 10],   // dominant7 without perfect 5th
  '6no3': [0, 7, 9],    // 6th without major 3rd

  // Extended chords
  '7sus4': [0, 5, 7, 10], // dominant suspended 4th
  '13': [0, 4, 7, 10, 2, 5, 9],     // dominant 13th
  '13no5': [0, 4, 10, 2, 5, 9],     // 13th without 5th
  '13no11': [0, 4, 7, 10, 2, 9]     // 13th without 11th
};

// Interval names by semitone distance
const intervalNames: { [key: number]: IntervalType } = {
  0: 'perfect unison',
  1: 'minor 2nd',
  2: 'major 2nd',
  3: 'minor 3rd',
  4: 'major 3rd',
  5: 'perfect 4th',
  6: 'tritone',
  7: 'perfect 5th',
  8: 'minor 6th',
  9: 'major 6th',
  10: 'minor 7th',
  11: 'major 7th',
  12: 'octave',
  13: 'minor 9th',  // compound intervals
  14: 'major 9th'
};

// Find interval between two notes
export const findInterval = (noteNames: string[]): IntervalInfo | null => {
  if (noteNames.length !== 2) return null;

  const noteIndices = getNoteIndices(noteNames);
  if (noteIndices.length !== 2) return null;

  // Handle unison case
  if (noteIndices[0] === noteIndices[1]) {
    return {
      root: notes[noteIndices[0]],
      interval: 'perfect unison',
      semitones: 0
    };
  }

  // Use the first note as root (maintains user's intended direction)
  const rootIndex = noteIndices[0];
  const otherIndex = noteIndices[1];
  const interval = (otherIndex - rootIndex + 12) % 12;

  const intervalName = intervalNames[interval];
  if (intervalName) {
    return {
      root: notes[rootIndex],
      interval: intervalName,
      semitones: interval
    };
  }

  return null;
};

// Get unique notes from fret positions
export const getNotesFromPositions = (positions: ChordPosition[], fretboard: GuitarNote[][]): string[] => {
  const noteSet = new Set<string>();
  positions.forEach(pos => {
    if (fretboard[pos.string] && fretboard[pos.string][pos.fret]) {
      noteSet.add(fretboard[pos.string][pos.fret].name);
    }
  });
  return Array.from(noteSet);
};

// Convert note names to chromatic indices (0-11)
const getNoteIndices = (noteNames: string[]): number[] => {
  return noteNames.map(note => {
    const normalized = normalizeNote(note);
    return notes.indexOf(normalized);
  }).filter(index => index !== -1);
};

// Calculate intervals from a given root
const getIntervalsFromRoot = (noteIndices: number[], rootIndex: number): number[] => {
  return noteIndices
    .filter(index => index !== -1)
    .map(index => (index - rootIndex + 12) % 12)
    .sort((a, b) => a - b);
};

// Check if array a is a subset of array b
const isSubset = (subset: number[], superset: number[]): boolean => {
  return subset.every(note => superset.includes(note));
};

// Chord types that can have notes omitted (subset matching allowed)
// Order matters: more specific types first
const subsetChordTypes: ChordType[] = ['7no5', 'maj7no5', '6no3'];

// Find chord that matches the given notes
export const findMatchingChord = (noteNames: string[]): { root: string; type: ChordType } | null => {
  if (noteNames.length < 2) return null;

  const noteIndices = getNoteIndices(noteNames);
  if (noteIndices.length < 2) return null;

  // Remove duplicates and sort
  const uniqueIndices = Array.from(new Set(noteIndices)).sort((a, b) => a - b);

  // Try each note as potential root
  for (const potentialRoot of uniqueIndices) {
    const intervals = getIntervalsFromRoot(uniqueIndices, potentialRoot);

    // First pass: exact matches for all chord types
    for (const [chordType, formula] of Object.entries(chordFormulas) as [ChordType, number[]][]) {
      // Sort both arrays for comparison
      const sortedFormula = [...formula].sort((a, b) => a - b);
      const sortedIntervals = [...intervals].sort((a, b) => a - b);

      if (arraysEqual(sortedFormula, sortedIntervals)) {
        return { root: notes[potentialRoot], type: chordType };
      }
    }

    // Second pass: subset matches for chords that can have omitted notes
    for (const chordType of subsetChordTypes) {
      const formula = chordFormulas[chordType];
      const sortedFormula = [...formula].sort((a, b) => a - b);
      const sortedIntervals = [...intervals].sort((a, b) => a - b);

      if (isSubset(sortedIntervals, sortedFormula)) {
        return { root: notes[potentialRoot], type: chordType };
      }
    }
  }

  return null;
};

// Helper function to compare arrays
const arraysEqual = (a: number[], b: number[]): boolean => {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};

// Union type for chord or interval recognition
export type RecognitionResult = ({ root: string; type: ChordType } | IntervalInfo) | null;

// Main chord/interval recognition function
export const recognizeChord = (positions: ChordPosition[], fretboard: GuitarNote[][]): RecognitionResult => {
  if (positions.length === 0) return null;

  const noteNames = getNotesFromPositions(positions, fretboard);

  if (noteNames.length === 2) {
    // For exactly 2 notes, show interval
    return findInterval(noteNames);
  } else if (noteNames.length > 2) {
    // For 3+ notes, try chord recognition first
    const chord = findMatchingChord(noteNames);
    return chord;
  }

  return null;
};
