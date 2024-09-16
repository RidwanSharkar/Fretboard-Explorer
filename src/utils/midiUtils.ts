// utils/midiUtils.ts

import * as Tone from 'tone';
import { GuitarNote } from '../models/Note';

export const playNote = (string: number, fret: number, fretboard: GuitarNote[][], duration: string = '2n', staggerTime: number = 0) => {
    const fullNote = getNoteFromPosition(string, fret, fretboard);
    const startTime = Tone.now() + staggerTime;
    synth.triggerAttackRelease(fullNote, duration, startTime);
};

const octaveMapping = [
  [4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5],  // String 1 (E)
  [3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5],  // String 2 (B)
  [3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],  // String 3 (G)
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4],  // String 4 (D)
  [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4],  // String 5 (A)
  [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3]   // String 6 (E)
];

// Update function to calculate note name including the correct octave from the mapping
const getNoteFromPosition = (string: number, fret: number, fretboard: GuitarNote[][]) => {
    const noteName = fretboard[string][fret].name;
    const octave = octaveMapping[string][fret]; // Retrieve the octave from the mapping
    return `${noteName}${octave}`;
};

const synth = new Tone.PluckSynth({
    attackNoise: 0.5,  
    dampening: 3500,   
    resonance: 0.98   
}).toDestination();

const reverb = new Tone.Reverb({
    decay: 12.0,   
    preDelay: 0.08
}).toDestination();
synth.connect(reverb);

const compressor = new Tone.Compressor({
    threshold: -25,
    ratio: 7,
    attack: 0.1,
    release: 0.35
}).toDestination();
synth.connect(compressor);


const delay = new Tone.FeedbackDelay("32n", 0.5).toDestination();
synth.connect(delay);

