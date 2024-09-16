// Chords.ts

import { GuitarNote } from './Note';

export interface Chord {
  root: string;
  formula: string[];
  positions?: GuitarNote[];   
}

