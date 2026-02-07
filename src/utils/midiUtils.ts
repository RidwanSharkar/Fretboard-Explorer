// utils/midiUtils.ts

import * as Tone from 'tone';
import { GuitarNote, ChordPosition } from '../models/Note';

// Create note-to-URL mapping
const baseUrl = `${window.location.origin}${import.meta.env.BASE_URL}acoustic/`.replace(/\/+/g, '/').replace(':/', '://');
console.log("🎸 Loading guitar samples from:", baseUrl);

// All note names we need to load (using music notation with #)
const noteNames = [
    "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2",
    "C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3",
    "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4",
    "C5", "C#5", "D5", "D#5", "E5", "F5", "F#5", "G5", "G#5", "A5"
];

// Helper function to convert note name to filename (# -> sharp for file system)
const createNoteUrl = (noteName: string): string => {
    const fileName = noteName.replace(/#/g, 'sharp');
    return `${baseUrl}${fileName}.mp3`;
};

const noteUrls: { [key: string]: string } = {};
noteNames.forEach(note => {
    noteUrls[note] = createNoteUrl(note);
});

console.log("🎸 Sample file mappings:");
console.log("  A4  -> A4.mp3");
console.log("  A#4 -> Asharp4.mp3");
console.log("  C#5 -> Csharp5.mp3");

// Use Tone.Players and preload all samples immediately
const players = new Tone.Players(noteUrls).toDestination();

console.log(`🎸 Created Tone.Players with ${Object.keys(noteUrls).length} samples`);

// Track loading progress
let loadedCount = 0;
const totalCount = Object.keys(noteUrls).length;
let allSamplesLoaded = false;

// Monitor loading progress
const checkLoaded = setInterval(() => {
    let currentLoaded = 0;
    const stillLoading: string[] = [];
    
    for (const noteName of noteNames) {
        if (players.has(noteName)) {
            const player = players.player(noteName);
            if (player.loaded) {
                currentLoaded++;
            } else {
                stillLoading.push(noteName);
            }
        }
    }
    
    if (currentLoaded !== loadedCount) {
        loadedCount = currentLoaded;
        console.log(`🎸 Loading samples: ${loadedCount}/${totalCount}`);
        
        if (stillLoading.length > 0 && stillLoading.length <= 5) {
            console.log("   Still loading:", stillLoading.join(", "));
        }
    }
    
    if (loadedCount === totalCount && !allSamplesLoaded) {
        allSamplesLoaded = true;
        console.log("✓✓✓ All 42 guitar samples loaded successfully! ✓✓✓");
        console.log("🎸 Ready to play!");
        clearInterval(checkLoaded);
    }
}, 500);

// Add effects to the players for a richer sound
const reverb = new Tone.Reverb({
    decay: 2.5,
    preDelay: 0.01
}).toDestination();

const compressor = new Tone.Compressor({
    threshold: -20,
    ratio: 3,
    attack: 0.05,
    release: 0.1
}).toDestination();

players.connect(reverb);
players.connect(compressor);

// Fallback synth in case samples fail to load
const fallbackSynth = new Tone.PluckSynth({
    attackNoise: 0.5,  
    dampening: 3500,   
    resonance: 0.98   
}).toDestination();

// MIDI mode synth - the original PluckSynth with effects
const midiSynth = new Tone.PluckSynth({
    attackNoise: 0.5,  
    dampening: 3500,   
    resonance: 0.98   
}).toDestination();

const midiReverb = new Tone.Reverb({
    decay: 12.0,   
    preDelay: 0.08
}).toDestination();
midiSynth.connect(midiReverb);

const midiCompressor = new Tone.Compressor({
    threshold: -25,
    ratio: 7,
    attack: 0.1,
    release: 0.35
}).toDestination();
midiSynth.connect(midiCompressor);

const midiDelay = new Tone.FeedbackDelay("32n", 0.5).toDestination();
midiSynth.connect(midiDelay);

// Function to stop all currently playing notes
export const stopAllNotes = () => {
    players.stopAll();
    // Also stop the fallback synth if it's playing
    fallbackSynth.triggerRelease();
};

export const playNote = (string: number, fret: number, fretboard: GuitarNote[][], duration: string = '2n', staggerTime: number = 0, stopPrevious: boolean = false, useMidiMode: boolean = false) => {
    // Stop all previous notes if this is the start of a new chord
    if (stopPrevious && staggerTime === 0) {
        stopAllNotes();
    }
    
    const fullNote = getNoteFromPosition(string, fret, fretboard);
    const startTime = Tone.now() + staggerTime;
    
    // Ensure Tone.js audio context is started (usually requires user interaction)
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    
    // If MIDI mode is enabled, use the MIDI synth
    if (useMidiMode) {
        midiSynth.triggerAttackRelease(fullNote, duration, startTime);
        return;
    }
    
    // Try to use samples if loaded
    if (players.has(fullNote)) {
        try {
            const player = players.player(fullNote);
            
            // Check if this specific player is loaded
            if (player.loaded) {
                player.start(startTime);
                return; // Success!
            } else {
                console.warn(`⏳ Note ${fullNote} still loading...`);
            }
        } catch (error) {
            console.warn(`⚠️ Error playing ${fullNote}:`, error);
        }
    }
    
    // Fallback to synth
    fallbackSynth.triggerAttackRelease(fullNote, duration, startTime);
};

/**
 * Play a progression of chords sequentially
 * @param chordsPositions - Array of chord positions to play
 * @param fretboard - The fretboard data
 * @param chordDuration - Duration of each chord in seconds (default: 1.5s)
 * @param onChordChange - Callback when each chord starts playing
 * @param onComplete - Callback when progression completes
 * @param useMidiMode - Whether to use MIDI synth instead of samples
 */
export const playProgression = async (
    chordsPositions: ChordPosition[][],
    fretboard: GuitarNote[][],
    chordDuration: number = 1.5,
    onChordChange?: (chordIndex: number) => void,
    onComplete?: () => void,
    useMidiMode: boolean = false
) => {
    await Tone.start(); // Ensure Tone.js is started
    
    for (let i = 0; i < chordsPositions.length; i++) {
        const chordPositions = chordsPositions[i];
        
        // Stop all previous notes before starting new chord
        stopAllNotes();
        
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
            playNote(pos.string, pos.fret, fretboard, '8n', staggerTime, false, useMidiMode);
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

