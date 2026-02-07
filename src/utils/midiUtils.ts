// utils/midiUtils.ts

import * as Tone from 'tone';
import { GuitarNote, ChordPosition } from '../models/Note';

export const playNote = (string: number, fret: number, fretboard: GuitarNote[][], duration: string = '2n', staggerTime: number = 0) => {
    const fullNote = getNoteFromPosition(string, fret, fretboard);
    const startTime = Tone.now() + staggerTime;
    synth.triggerAttackRelease(fullNote, duration, startTime);
};

/**
 * Play a progression of chords sequentially
 * @param chordsPositions - Array of chord positions to play
 * @param fretboard - The fretboard data
 * @param chordDuration - Duration of each chord in seconds (default: 1.5s)
 * @param onChordChange - Callback when each chord starts playing
 * @param onComplete - Callback when progression completes
 */
export const playProgression = async (
    chordsPositions: ChordPosition[][],
    fretboard: GuitarNote[][],
    chordDuration: number = 1.5,
    onChordChange?: (chordIndex: number) => void,
    onComplete?: () => void
) => {
    await Tone.start(); // Ensure Tone.js is started
    
    for (let i = 0; i < chordsPositions.length; i++) {
        const chordPositions = chordsPositions[i];
        
        // Notify which chord is currently playing
        if (onChordChange) {
            onChordChange(i);
        }
        
        // Sort positions for strumming effect (low to high string)
        const sortedPositions = chordPositions.sort((a, b) => 
            a.string === b.string ? a.fret - b.fret : b.string - a.string
        );
        
        // Play each note in the chord with stagger
        sortedPositions.forEach((pos, index) => {
            const staggerTime = index * 0.05; // 50ms stagger between notes
            playNote(pos.string, pos.fret, fretboard, '8n', staggerTime);
        });
        
        // Wait for chord duration before playing next chord
        await new Promise(resolve => setTimeout(resolve, chordDuration * 1000));
    }
    
    // Notify completion
    if (onComplete) {
        onComplete();
    }
};

const octaveMapping = [
  [4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],  // String 1 (E)
  [3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5],  // String 2 (B)
  [3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],  // String 3 (G)
  [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4],  // String 4 (D)
  [2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4],  // String 5 (A)
  [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]   // String 6 (E)
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

