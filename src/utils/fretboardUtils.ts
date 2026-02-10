// utils/fretboardUtils.ts
import { GuitarNote, ChordPosition } from '../models/Note';


export const constructFretboard = (strings: number, frets: number): GuitarNote[][] => {
  const notes: string[] = ['E', 'B', 'G', 'D', 'A', 'E']; // Standard tuning for a 6-string guitar
  const semitones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const fretboard: GuitarNote[][] = [];

  for (let string = 0; string < strings; string++) {
    fretboard[string] = [];
    const noteIndex = semitones.indexOf(notes[string]);
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

export const possibleChord = (fretboard: GuitarNote[][], formula: string[], allowPartial: boolean = false): ChordPosition[][] => {
  const validChords: ChordPosition[][] = [];
  const frets: number[] = [-1, -1, -1, -1, -1, -1];
  
  // For chords with 5+ notes, also allow finding 3-4 note voicings
  const minNotes = allowPartial || formula.length >= 5 ? Math.max(3, Math.min(4, formula.length - 1)) : formula.length;
  
  findChords(fretboard, formula, formula.length, frets, 0, validChords, minNotes);
  return validChords;
};

function findChords(
  fretboard: GuitarNote[][],
  formula: string[],
  length: number,
  frets: number[],
  noteIndex: number,
  validChords: ChordPosition[][],
  minNotes: number = -1
) {
  // Use formula length as minimum if not specified
  const requiredNotes = minNotes > 0 ? minNotes : length;
  
  if (noteIndex === length) {
    const chord = frets.map((fret, string) => ({ string, fret })).filter(pos => pos.fret !== -1);
    // Accept chord if it has enough notes (allows partial voicings for extended chords)
    if (chord.length >= requiredNotes && chord.length <= 6) {
      validChords.push(chord);
    }
    return;
  }

  for (let string = 0; string < 6; string++) {
    for (let fret = 0; fret < fretboard[string].length; fret++) {
      if (fretboard[string][fret].name === formula[noteIndex] && frets[string] === -1) {
        if (isValidChordPosition(frets, string, fret)) {
          frets[string] = fret;
          findChords(fretboard, formula, length, frets, noteIndex + 1, validChords, minNotes);
          frets[string] = -1; // backtrack
        }
      }
    }
  }
  
  // For partial voicings: also try skipping this note if we have enough notes already
  if (minNotes > 0 && minNotes < length) {
    const currentNotes = frets.filter(f => f !== -1).length;
    // If we could potentially reach minNotes by skipping this note, try it
    const remainingNotes = length - noteIndex - 1;
    if (currentNotes + remainingNotes >= minNotes) {
      findChords(fretboard, formula, length, frets, noteIndex + 1, validChords, minNotes);
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

