// Fretboard.ts
import { GuitarNote } from './Note';

export interface Fretboard {
  strings: number;
  frets: number;
  notes: GuitarNote[][];
}

