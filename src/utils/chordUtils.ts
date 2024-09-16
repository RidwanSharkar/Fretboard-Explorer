// src/utils/chordUtils.ts

import { Chord } from '../models/Chord';
import { GuitarNote } from '../models/Note';

export interface ChordInfo {
  root: string;
  type: ChordType;
}
export const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

export type ChordType = 'major' | 'minor' | 'dominant7' | 'diminished' | 'diminished7' | 'major7' | 'minor7' | 'minor9' | 'minoradd9' | 'major9' | 'majoradd9' | 'augmented';

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
  majoradd9: [0, 4, 7, 2]
};

export const generateChordPositions = (chord: Chord, fretboard: GuitarNote[][]): GuitarNote[] => {
  const notePositions: GuitarNote[] = [];
  return notePositions;
};

