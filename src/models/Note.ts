// Note.ts

export interface GuitarNote {
  string: number;
  fret: number;
  name: string;
}

export class ChordNode {
  chord: { string: number; fret: number }[]; 
  next: ChordNode | null = null;

  constructor(chord: { string: number; fret: number }[]) {
    this.chord = chord;
  }
}

export interface ChordPosition {
  string: number;
  fret: number;
}

