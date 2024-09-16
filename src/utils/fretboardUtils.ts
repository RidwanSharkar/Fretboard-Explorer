// utils/fretboardUtils.ts
import { GuitarNote, ChordPosition } from '../models/Note';


export const constructFretboard = (strings: number, frets: number): GuitarNote[][] => {
  const notes: string[] = ['E', 'B', 'G', 'D', 'A', 'E']; // Standard tuning for a 6-string guitar
  const semitones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const fretboard: GuitarNote[][] = [];

  for (let string = 0; string < strings; string++) {
    fretboard[string] = [];
    let noteIndex = semitones.indexOf(notes[string]);
    for (let fret = 0; fret < frets; fret++) {
      fretboard[string].push({
        string,
        fret,
        name: semitones[(noteIndex + fret) % 12]
      });
    }
  }
  return fretboard;
};

/*============================================================================================================================================*/

export const possibleChord = (fretboard: GuitarNote[][], formula: string[]): ChordPosition[][] => {
  const validChords: ChordPosition[][] = [];
  const frets: number[] = [-1, -1, -1, -1, -1, -1];
  findChords(fretboard, formula, formula.length, frets, 0, validChords);
  return validChords;
};

function findChords(
  fretboard: GuitarNote[][],
  formula: string[],
  length: number,
  frets: number[],
  noteIndex: number,
  validChords: ChordPosition[][]
) {
  if (noteIndex === length) {
    const chord = frets.map((fret, string) => ({ string, fret })).filter(pos => pos.fret !== -1);
    if (chord.length === length) {
      validChords.push(chord);
    }
    return;
  }

  for (let string = 0; string < 6; string++) {
    for (let fret = 0; fret < fretboard[string].length; fret++) {
      if (fretboard[string][fret].name === formula[noteIndex] && frets[string] === -1) {
        if (isValidChordPosition(frets, string, fret)) {
          frets[string] = fret;
          findChords(fretboard, formula, length, frets, noteIndex + 1, validChords);
          frets[string] = -1; // backtrack
        }
      }
    }
  }
}

function isValidChordPosition(frets: number[], currentString: number, currentFret: number): boolean {
  let maxString = -1;
  let minString = 6;
  for (let i = 0; i < 6; i++) {
    if (frets[i] !== -1) {
      maxString = Math.max(maxString, i);
      minString = Math.min(minString, i);
    }
  }

  // String distance
  if (maxString - minString > 3 || currentString - minString > 3 || maxString - currentString > 3) {
    return false;
  }

  // Fret distance
  for (let i = 0; i < 6; i++) {
    if (frets[i] !== -1 && Math.abs(currentFret - frets[i]) > 3) {
      return false;
    }
  }

  return true;
}

