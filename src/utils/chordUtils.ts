// src/utils/chordUtils.ts

export interface ChordInfo {
  root: string;
  type: ChordType;
}
export const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

export type ChordType = 'major' | 'minor' | 'dominant7' | 'diminished' | 'diminished7' | 'major7' | 'minor7' | 'minor9' | 'minoradd9' | 'major9' | 'majoradd9' | 'augmented' | 'sus2' | 'sus4';

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
  sus4: [0, 5, 7]
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
  return noteNames.map(note => notes.indexOf(note)).filter(index => index !== -1);
};

// Calculate intervals from a given root
const getIntervalsFromRoot = (noteIndices: number[], rootIndex: number): number[] => {
  return noteIndices
    .filter(index => index !== -1)
    .map(index => (index - rootIndex + 12) % 12)
    .sort((a, b) => a - b);
};

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

    // Try each chord type
    for (const [chordType, formula] of Object.entries(chordFormulas) as [ChordType, number[]][]) {
      // Sort both arrays for comparison
      const sortedFormula = [...formula].sort((a, b) => a - b);
      const sortedIntervals = [...intervals].sort((a, b) => a - b);

      if (arraysEqual(sortedFormula, sortedIntervals)) {
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

// Main chord recognition function
export const recognizeChord = (positions: ChordPosition[], fretboard: GuitarNote[][]): { root: string; type: ChordType } | null => {
  if (positions.length === 0) return null;

  const noteNames = getNotesFromPositions(positions, fretboard);
  if (noteNames.length < 2) return null; // Need at least 2 notes for a chord

  return findMatchingChord(noteNames);
};
