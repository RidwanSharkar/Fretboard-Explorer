// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Fretboard from './components/Fretboard';
import { constructFretboard, possibleChord } from './utils/fretboardUtils';
import { GuitarNote, ChordPosition } from './models/Note';
import { chordFormulas, recognizeChord, RecognitionResult } from './utils/chordUtils';
import { playNote, playProgression } from './utils/midiUtils';
import { generateUniversalProgression, ChordInfo, Progression } from './utils/progressionUtils';
import { optimizeProgressionVoicings, getChordCenterPosition } from './utils/voiceLeadingUtils';
import Header from '/CircleOfFifths.jpg';
import SelectIcon from '/select.svg';
import FindIcon from '/find.svg';
import ArrowLeftIcon from '/arrow-left.svg';


/*=====================================================================================================================*/
const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
/*const intervals = ['R', 'm2', 'M2', 'm3', 'M3', 'P4', 'T', 'P5', 'm6', 'M6', 'm7', 'M7'];*/
/*=====================================================================================================================*/

const App: React.FC = () => 
{
    const [fretboard ] = useState<GuitarNote[][]>(() => constructFretboard(6, 18));
    const [activeNotes, setActiveNotes] = useState<{ note: string; interval: string }[]>([]);
    const [selectedKey, setSelectedKey] = useState('C');
    const [selectedChord, setSelectedChord] = useState<{ root: string; type: keyof typeof chordFormulas } | null>(null);
    const [includeSeventh, setIncludeSeventh] = useState(false);
    const [includeNinth, setIncludeNinth] = useState(false);
    const [includeSixth, setIncludeSixth] = useState(false);
    const [isMinorKey, setIsMinorKey] = useState(false);
    const [currentChordIndex, setCurrentChordIndex] = useState(-1);
    const [validChords, setValidChords] = useState<ChordPosition[][]>([]);
    const [highlightAll, setHighlightAll] = useState(false);
    const toggleHighlightAll = () => {setHighlightAll(!highlightAll);};
    const toggleCircleOfFifths = () => {setIsCircleOfFifthsExpanded(!isCircleOfFifthsExpanded);};
    const toggleFretSelectionMode = () => {
        const newMode = !isFretSelectionMode;
        setIsFretSelectionMode(newMode);
        if (newMode) {
            // Entering fret selection mode - clear chord selections
            setIsPlayable(false);
            clearActivePositions();
            setSelectedChord(null);
            setActiveNotes([]);
            setValidChords([]);
            setCurrentChordIndex(-1);
            // Clear progression
            setGeneratedProgression(null);
            setProgressionPositions([]);
            setCurrentProgressionChordIndex(-1);
            setIsProgressionPlaying(false);
            setSavedSelectedFrets([]); // Clear saved frets
        } else {
            // Exiting fret selection mode
            setSelectedFrets([]);
            setSavedSelectedFrets([]); // Clear saved frets
        }
    };
    const [activePositions, setActivePositions] = useState<ChordPosition[]>([]);
    const clearActivePositions = () => {setActivePositions([]);};
    const [isPlayable, setIsPlayable] = useState(false); // MIDI

    const [isProgressionPlaying, setIsProgressionPlaying] = useState(false);
    const [isCircleOfFifthsExpanded, setIsCircleOfFifthsExpanded] = useState(true);
    const [isFretSelectionMode, setIsFretSelectionMode] = useState(false);
    const [selectedFrets, setSelectedFrets] = useState<ChordPosition[]>([]);
    const [recognizedChord, setRecognizedChord] = useState<RecognitionResult>(null);
    
    // Chord Progression Generation State
    const [generatedProgression, setGeneratedProgression] = useState<Progression | null>(null);
    const [progressionPositions, setProgressionPositions] = useState<ChordPosition[][][]>([]);
    const [currentProgressionChordIndex, setCurrentProgressionChordIndex] = useState(-1);
    const [savedSelectedFrets, setSavedSelectedFrets] = useState<ChordPosition[]>([]); // Store selected frets during progression playback


/*=====================================================================================================================*/

    const shouldUseFlatSeventh = (root: string, type: keyof typeof chordFormulas, includeSeventh: boolean, selectedKey: string, isMinorKey: boolean) => {
        const rootIndex = notes.indexOf(root);
        const fifthDegreeIndex = (notes.indexOf(selectedKey) + 7) % 12; // V degree in major 
        const seventhDegreeIndex = (notes.indexOf(selectedKey) + 10) % 12; // VII degree in minor
        return (type === 'minor7' || type === 'dominant7' || type === 'diminished7') ||
            (includeSeventh && (
                (type === 'major' && ((!isMinorKey && notes[rootIndex] === notes[fifthDegreeIndex]) ||
                    (isMinorKey && notes[rootIndex] === notes[seventhDegreeIndex]))) || (type === 'minor' || type === 'diminished')));
    };

    /*=================================================================================================================*/

    const getIntervalLabel = (interval: number): string => {
        const intervalMap: { [key: number]: string } = {
            0: 'R',
            1: '♭9',
            2: '2nd',
            3: '♭3rd',
            4: '3rd',
            5: '4th',
            6: '♭5th',
            7: '5th',
            8: '#5th',
            9: '6th',
            10: '♭7th',
            11: '7th',
            14: '9th'
        };
        return intervalMap[interval] || interval.toString();
    };

    const updateChordNotes = useCallback((root: string, type: keyof typeof chordFormulas, includeSeventh: boolean, includeNinth: boolean, includeSixth: boolean) => {
        const rootIndex = notes.indexOf(root);
        const baseIntervals = chordFormulas[type].map((interval) => ({
            note: notes[(rootIndex + interval) % 12],
            interval: getIntervalLabel(interval)}));
        const additionalIntervals = [];
        if (includeSeventh) {
            const flatSeventh = shouldUseFlatSeventh(root, type, includeSeventh, selectedKey, isMinorKey) ? 10 : 11;
            additionalIntervals.push({
                note: notes[(rootIndex + flatSeventh) % 12],
                interval: getIntervalLabel(flatSeventh)});}
        if (includeNinth) {
            additionalIntervals.push({
                note: notes[(rootIndex + 14) % 12],
                interval: getIntervalLabel(14)});}
        if (includeSixth) {
            additionalIntervals.push({
                note: notes[(rootIndex + 9) % 12],
                interval: getIntervalLabel(9)});}
        setActiveNotes([...baseIntervals, ...additionalIntervals]);
    }, [ selectedKey, isMinorKey, includeSeventh, includeNinth, includeSixth ]);
    
    /*=================================================================================================================*/
    
    const playChord = useCallback(() => {
        // Prevent playback during progression generation/playback
        if (isProgressionPlaying) return;
        
        const positionsToPlay = isFretSelectionMode ? selectedFrets : activePositions;
        if (positionsToPlay.length === 0) return; // Don't play empty chords
        
        const sortedPositions = positionsToPlay.sort((a, b) => a.string === b.string ? a.fret - b.fret : b.string - a.string);
        sortedPositions.forEach((pos, index) => {
            const staggerTime = index * 0.05; // stagger time for strumming
            playNote(pos.string, pos.fret, fretboard, '8n', staggerTime);});
    }, [activePositions, selectedFrets, isFretSelectionMode, fretboard, isProgressionPlaying]);
    
    /*=================================================================================================================*/
    
    const findAndHighlightChord = useCallback(() => {
        if (!selectedChord) {
            console.log("No chord selected.");
            return;
        }
        const rootIndex = notes.indexOf(selectedChord.root);
        const noteNames = chordFormulas[selectedChord.type].map(interval => notes[(rootIndex + interval) % 12]);
        
        if (includeSeventh) {
            const flatSeventh = shouldUseFlatSeventh(selectedChord.root, selectedChord.type, includeSeventh, selectedKey, isMinorKey) ? 10 : 11;
            noteNames.push(notes[(rootIndex + flatSeventh) % 12]);}
        if (includeNinth) {
            noteNames.push(notes[(rootIndex + 14) % 12]);}
        if (includeSixth) {
            noteNames.push(notes[(rootIndex + 9) % 12]);}

        if (validChords.length === 0 || currentChordIndex === -1) {
            const newValidChords = possibleChord(fretboard, noteNames);
            if (newValidChords.length > 0) {
                setValidChords(newValidChords);
                setCurrentChordIndex(0);
                setActiveNotes([]);
                setActivePositions(newValidChords[0]);
                setIsPlayable(true);
            }
            else {
                console.log("No valid chords found.");
                setIsPlayable(false);}
                setActiveNotes([]);
        }
        else {
            const nextIndex = (currentChordIndex + 1) % validChords.length;  // Cycle if repeat click
            setCurrentChordIndex(nextIndex);
            setActivePositions(validChords[nextIndex]);
        }
    }, [selectedChord, fretboard, includeSeventh, includeNinth, currentChordIndex, validChords, selectedKey, isMinorKey ]);

/*=====================================================================================================================*/

    const playRandomChordFromKey = useCallback((root: string, type: keyof typeof chordFormulas) => {
        setSelectedChord({ root, type });
        updateChordNotes(root, type, includeSeventh, includeNinth, includeSixth);

        const rootIndex = notes.indexOf(root);
        const noteNames = chordFormulas[type].map(interval => notes[(rootIndex + interval) % 12]);
        if (includeSeventh) {
            const flatSeventh = shouldUseFlatSeventh(root, type, includeSeventh, selectedKey, isMinorKey) ? 10 : 11;
            noteNames.push(notes[(rootIndex + flatSeventh) % 12]);}
        if (includeNinth) {
            noteNames.push(notes[(rootIndex + 14) % 12]);}
        if (includeSixth) {
            noteNames.push(notes[(rootIndex + 9) % 12]);}

        const newValidChords = possibleChord(fretboard, noteNames);
        if (newValidChords.length > 0) {
            setValidChords(newValidChords);
            const randomIndex = Math.floor(Math.random() * newValidChords.length); 
            setCurrentChordIndex(randomIndex);
            setActiveNotes([]);
            setActivePositions(newValidChords[randomIndex]);
    
            setActiveNotes(newValidChords[randomIndex].map(pos => ({
                note: fretboard[pos.string][pos.fret].name,
                interval: '' })));
            setIsPlayable(true);
        }
        else {
            console.log("No valid chords found.");
            setIsPlayable(false);}
            setActiveNotes([]);
    }, [ fretboard, includeSeventh, includeNinth, includeSixth, selectedKey, isMinorKey, updateChordNotes ]);


    const handleChordSelection = useCallback((root: string, type: keyof typeof chordFormulas) =>
    {
        //resetToggles();
        setIsPlayable(false);
        clearActivePositions();
        setIsProgressionPlaying(false);
        setSelectedChord({ root, type });
        setActiveNotes([]);
        setValidChords([]); // Clearing "Find"
        setCurrentChordIndex(-1);
        setIsFretSelectionMode(false); // Exit fret selection mode when selecting chords
        setSelectedFrets([]); // Clear selected frets
        // Clear progression when new chord is selected
        setGeneratedProgression(null);
        setProgressionPositions([]);
        setCurrentProgressionChordIndex(-1);
        setSavedSelectedFrets([]); // Clear saved frets
        updateChordNotes(root, type, includeSeventh, includeNinth, includeSixth);
    }, [updateChordNotes, includeSeventh, includeNinth, includeSixth]);

    const handleFretClick = useCallback((string: number, fret: number) => {
        // Clear progression when frets change
        setGeneratedProgression(null);
        setProgressionPositions([]);
        setCurrentProgressionChordIndex(-1);
        setIsProgressionPlaying(false);
        setSavedSelectedFrets([]); // Clear saved frets when manually changing selection
        
        setSelectedFrets(prevSelected => {
            const existingIndex = prevSelected.findIndex(pos => pos.string === string && pos.fret === fret);
            if (existingIndex >= 0) {
                // Remove the fret if already selected
                return prevSelected.filter((_, index) => index !== existingIndex);
            } else {
                // Add the fret if not selected, but only if we haven't reached the limit and there's no fret on the same string
                if (prevSelected.length >= 6) return prevSelected;
                if (prevSelected.some(pos => pos.string === string)) return prevSelected;
                return [...prevSelected, { string, fret }];
            }
        });
    }, []);

    /*=================================================================================================================*/

    const renderRandomChordButtons = () => {
        const rootIndex = notes.indexOf(selectedKey);
        const pattern = isMinorKey ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
        const types = isMinorKey ? ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major']
                                 : ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
        const degreeLabels = isMinorKey ? ['i', 'iiº', 'III', 'iv', 'v', 'VI', 'VII'] 
                                        : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiº']; 
        return (
                <div className="chord-and-play-buttons">
                <div className="play-buttons">
                    {pattern.map((shift, index) => {
                        const chordRoot = notes[(rootIndex + shift) % 12];
                        const type = types[index];
                        return (
                            <button key={`play-${index}`} 
                                onClick={() => playRandomChordFromKey(chordRoot, type as keyof typeof chordFormulas)}>
                                {degreeLabels[index]}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

/*=================================================================================================================*/

    const cycleChords = (direction: 'next' | 'prev') => {
        if (validChords.length > 0) {
            const newIndex = direction === 'next'
                ? (currentChordIndex + 1) % validChords.length
                : (currentChordIndex - 1 + validChords.length) % validChords.length;
            setCurrentChordIndex(newIndex);
            setActivePositions(validChords[newIndex]);
        }
    };

    const changeChordType = (type: keyof typeof chordFormulas) => {
        if (selectedChord) {
            // Reset extension toggles when switching to special chord types
            if (type === 'dominant7' || type === 'sus2' || type === 'sus4') {
                setIncludeSeventh(false);
                setIncludeNinth(false);
                setIncludeSixth(false);
            }
            setIsPlayable(false); // Prevent auto-playback on type change
            setValidChords([]); // Clear valid chords to prevent conflicts
            setCurrentChordIndex(-1);
            // Clear progression when chord type changes
            setGeneratedProgression(null);
            setProgressionPositions([]);
            setCurrentProgressionChordIndex(-1);
            setIsProgressionPlaying(false);
            setSelectedChord({ root: selectedChord.root, type });
        }
    };

    /*=================================================================================================================*/
    // CHORD PROGRESSION GENERATION
    /*=================================================================================================================*/

    const handleReplayProgression = useCallback(async () => {
        if (!generatedProgression || progressionPositions.length === 0 || isProgressionPlaying) return;

        // Capture frets to save before clearing (use savedSelectedFrets if selectedFrets was already cleared)
        const fretsToSave = selectedFrets.length > 0 ? [...selectedFrets] : [...savedSelectedFrets];
        
        // Save and temporarily hide selected frets if in fret selection mode
        if (isFretSelectionMode && fretsToSave.length > 0) {
            setSavedSelectedFrets(fretsToSave);
            setSelectedFrets([]); // Hide selected frets during playback
        }

        setIsProgressionPlaying(true);
        setCurrentProgressionChordIndex(0);

        const flattenedPositions = progressionPositions.map(pos => pos[0]);
        
        await playProgression(
            flattenedPositions,
            fretboard,
            1.5,
            (chordIndex) => {
                setCurrentProgressionChordIndex(chordIndex);
                if (progressionPositions[chordIndex]) {
                    setActivePositions(progressionPositions[chordIndex][0]);
                }
            },
            () => {
                setIsProgressionPlaying(false);
                setCurrentProgressionChordIndex(-1);
                // Restore original positions based on mode
                if (isFretSelectionMode && fretsToSave.length > 0) {
                    setSelectedFrets(fretsToSave); // Restore selected frets
                    setActivePositions(fretsToSave);
                } else if (validChords.length > 0 && currentChordIndex >= 0) {
                    setActivePositions(validChords[currentChordIndex]);
                }
            }
        );
    }, [generatedProgression, progressionPositions, isProgressionPlaying, fretboard, validChords, currentChordIndex, isFretSelectionMode, selectedFrets, savedSelectedFrets]);

    const handleGenerateProgression = useCallback(async () => {
        if (isProgressionPlaying) return;

        // Determine chord source and current voicing
        let chordInfo: ChordInfo | null = null;
        let currentVoicing: ChordPosition[] | undefined;
        let preferredPosition: number | undefined;

        // In fret selection mode, use savedSelectedFrets if selectedFrets was cleared by a previous progression
        const effectiveFrets = (isFretSelectionMode && selectedFrets.length === 0 && savedSelectedFrets.length > 0) 
            ? savedSelectedFrets 
            : selectedFrets;

        if (isFretSelectionMode && recognizedChord && 'type' in recognizedChord) {
            // Use recognized chord from fret selection mode
            chordInfo = {
                root: recognizedChord.root,
                type: recognizedChord.type as any
            };
            currentVoicing = effectiveFrets;
            if (effectiveFrets.length > 0) {
                preferredPosition = getChordCenterPosition(effectiveFrets);
            }
        } else if (selectedChord) {
            // Use chord from chord buttons
            chordInfo = {
                root: selectedChord.root,
                type: selectedChord.type as any
            };
            // Only use a voicing anchor if the user explicitly found a chord via "Find"
            // (validChords is populated). Don't use activePositions here because it may be
            // a stale leftover from the last progression's final chord.
            if (validChords.length > 0 && currentChordIndex >= 0) {
                currentVoicing = validChords[currentChordIndex];
                preferredPosition = getChordCenterPosition(currentVoicing);
            }
        }

        if (!chordInfo) return;

        // Generate progression (selected chord can be at any position)
        const progression = generateUniversalProgression(chordInfo);
        setGeneratedProgression(progression);

        // Determine if we should use 4-note chords throughout the progression
        // This happens when:
        // 1. Any toggle buttons are active (7th, 9th, 6th)
        // 2. The user manually selected 4 or more frets in fret selection mode
        // 3. The chord type itself already includes extensions (major7, dominant7, etc.)
        const shouldUseExtendedVoicings = includeSeventh || includeNinth || includeSixth || 
            (isFretSelectionMode && effectiveFrets.length >= 4);

        // Find ALL possible voicings for each chord in the progression
        const allProgressionVoicings: ChordPosition[][][] = [];
        
        for (const chord of progression.chords) {
            const rootIndex = notes.indexOf(chord.root);
            const noteNames = chordFormulas[chord.type as keyof typeof chordFormulas].map(
                interval => notes[(rootIndex + interval) % 12]
            );
            
            // Add extensions if any toggles are active OR if user manually selected 4+ frets
            if (shouldUseExtendedVoicings) {
                // If includeSeventh is explicitly toggled, use that
                // Otherwise, if we're inferring extensions from fret count, add a 7th
                if (includeSeventh || (isFretSelectionMode && effectiveFrets.length >= 4 && !includeNinth && !includeSixth)) {
                    const flatSeventh = shouldUseFlatSeventh(chord.root, chord.type as keyof typeof chordFormulas, true, selectedKey, isMinorKey) ? 10 : 11;
                    if (!noteNames.includes(notes[(rootIndex + flatSeventh) % 12])) {
                        noteNames.push(notes[(rootIndex + flatSeventh) % 12]);
                    }
                }
                if (includeNinth) {
                    if (!noteNames.includes(notes[(rootIndex + 14) % 12])) {
                        noteNames.push(notes[(rootIndex + 14) % 12]);
                    }
                }
                if (includeSixth) {
                    if (!noteNames.includes(notes[(rootIndex + 9) % 12])) {
                        noteNames.push(notes[(rootIndex + 9) % 12]);
                    }
                }
            }
            
            const validChordPositions = possibleChord(fretboard, noteNames);
            
            if (validChordPositions.length > 0) {
                // Keep all voicings for voice leading optimization
                allProgressionVoicings.push(validChordPositions);
            } else {
                console.warn(`No valid positions found for ${chord.root} ${chord.type}`);
                // Use fallback - just play the root note
                allProgressionVoicings.push([[{ string: 5, fret: rootIndex }]]);
            }
        }

        // Use voice leading optimization to find smooth chord transitions
        let optimizedVoicings: ChordPosition[][];
        
        if (progression.selectedChordIndex !== undefined && currentVoicing) {
            // If we know which chord is the selected one, use its current voicing
            // Build the progression around it
            const beforeChords = allProgressionVoicings.slice(0, progression.selectedChordIndex);
            const afterChords = allProgressionVoicings.slice(progression.selectedChordIndex + 1);
            
            // Optimize chords before the selected chord (working backwards)
            const beforeOptimized: ChordPosition[][] = [];
            if (beforeChords.length > 0) {
                let workingVoicing = currentVoicing;
                for (let i = beforeChords.length - 1; i >= 0; i--) {
                    const voicings = beforeChords[i];
                    let bestVoicing = voicings[0];
                    let bestDistance = Infinity;
                    
                    for (const voicing of voicings) {
                        const centerDist = Math.abs(
                            getChordCenterPosition(voicing) - getChordCenterPosition(workingVoicing)
                        );
                        if (centerDist < bestDistance) {
                            bestDistance = centerDist;
                            bestVoicing = voicing;
                        }
                    }
                    beforeOptimized.unshift(bestVoicing);
                    workingVoicing = bestVoicing;
                }
            }
            
            // Optimize chords after the selected chord (working forwards)
            const afterOptimized = afterChords.length > 0
                ? optimizeProgressionVoicings(afterChords, currentVoicing)
                : [];
            
            optimizedVoicings = [...beforeOptimized, currentVoicing, ...afterOptimized];
        } else {
            // No specific selected chord position, optimize the whole progression
            optimizedVoicings = optimizeProgressionVoicings(
                allProgressionVoicings,
                currentVoicing,
                preferredPosition
            );
        }

        // Store as the required format
        const allProgressionPositions = optimizedVoicings.map(voicing => [voicing]);
        setProgressionPositions(allProgressionPositions);

        // Save selected frets for later restoration (capture before clearing)
        const fretsToSave = effectiveFrets.length > 0 ? [...effectiveFrets] : [];
        
        // Save and temporarily hide selected frets if in fret selection mode
        if (isFretSelectionMode && fretsToSave.length > 0) {
            setSavedSelectedFrets(fretsToSave);
            setSelectedFrets([]); // Hide selected frets during playback
        }

        // Play the progression
        setIsProgressionPlaying(true);
        setCurrentProgressionChordIndex(0);
        
        await playProgression(
            optimizedVoicings,
            fretboard,
            1.5, // 1.5 seconds per chord
            (chordIndex) => {
                setCurrentProgressionChordIndex(chordIndex);
                // Update active positions to show current chord
                if (optimizedVoicings[chordIndex]) {
                    setActivePositions(optimizedVoicings[chordIndex]);
                }
            },
            () => {
                setIsProgressionPlaying(false);
                setCurrentProgressionChordIndex(-1);
                // Restore original positions based on mode
                if (isFretSelectionMode && fretsToSave.length > 0) {
                    setSelectedFrets(fretsToSave); // Restore selected frets
                    setActivePositions(fretsToSave);
                } else if (validChords.length > 0 && currentChordIndex >= 0) {
                    setActivePositions(validChords[currentChordIndex]);
                }
            }
        );
    }, [selectedChord, recognizedChord, isFretSelectionMode, selectedFrets, activePositions, fretboard, isProgressionPlaying, validChords, currentChordIndex, savedSelectedFrets, includeSeventh, includeNinth, includeSixth, selectedKey, isMinorKey]); 

/* MOVE ---- #eac37e ----FRAME COLOR*/
interface Theme {
    backgroundColor: string;
    buttonColor: string;
    hoverColor: string;
    fretboardColor: string;
  }
  
  interface KeyThemes {
    major: Theme;
    minor: Theme;
  }

  const themes: Record<string, KeyThemes> = {
    A: {
        major: { backgroundColor: '#A2250F', buttonColor: '#F48668', hoverColor: '#FFE0B2', fretboardColor: '#ffd7b5'  },
        minor: { backgroundColor: '#451414', buttonColor: '#D85E5E', hoverColor: '#fcab8e', fretboardColor: '#E6B0AA'  }
    },
    'A#': {
        major: { backgroundColor: '#51282c', buttonColor: '#E7717D', hoverColor: '#fcab8e', fretboardColor: '#eacaca'  },
        minor: { backgroundColor: '#C76509', buttonColor: '#ffcd89', hoverColor: '#eac37e', fretboardColor: '#ffe8c9'  }
    },

    C: {
        major: { backgroundColor: '#14451A', buttonColor: '#3A9F52', hoverColor: '#8efc9e', fretboardColor: '#B7E6AA'  },
        minor: { backgroundColor: '#51282c', buttonColor: '#E7717D', hoverColor: '#8efc9e', fretboardColor: '#eacaca'  }
    },
    'C#': {
        major: { backgroundColor: '#0B6E4F', buttonColor: '#45CB85', hoverColor: '#8edfcf', fretboardColor: '#b1e8e0'  },
        minor: { backgroundColor: '#317478', buttonColor: '#30A7A7', hoverColor: '#8edfcf', fretboardColor: '#eacaca'  }
    },
    
    D: {
        major: { backgroundColor: '#2488CA', buttonColor: '#75c4ef', hoverColor: '#82d3ff', fretboardColor: '#b8ddf1'  },
        minor: { backgroundColor: '#1B4F72', buttonColor: '#4597ba', hoverColor: '#82d3ff', fretboardColor: '#b8ddf1'  }
    },
    'D#': {
        major: { backgroundColor: '#282c34', buttonColor: '#4597ba', hoverColor: '#77C3EC', fretboardColor: '#b8ddf1'  },
        minor: { backgroundColor: '#4D7EA8', buttonColor: '#77C3EC', hoverColor: '#8ec9fc', fretboardColor: '#b8ddf1'  }
    },

    E: {
        major: { backgroundColor: '#142945', buttonColor: '#4597ba', hoverColor: '#77C3EC', fretboardColor: '#b8ddf1'  },
        minor: { backgroundColor: '#003459', buttonColor: '#4597ba', hoverColor: '#82d3ff', fretboardColor: '#b8ddf1'  }
      },

    F: {
        major: { backgroundColor: '#39304A', buttonColor: '#B57EDC', hoverColor: '#e2c4f2', fretboardColor: '#D7BDE2'  },
        minor: { backgroundColor: '#482D54', buttonColor: '#B57EDC', hoverColor: '#e2c4f2', fretboardColor: '#D7BDE2' }
    },
    'F#': {
        major: { backgroundColor: '#52489C', buttonColor: '#AF7AC5', hoverColor: '#fc8efc', fretboardColor: '#D7BDE2'  },
        minor: { backgroundColor: '#7851A9', buttonColor: '#B57EDC', hoverColor: '#e2c4f2', fretboardColor: '#D7BDE2'  }
    },

    G: {
        major: { backgroundColor: '#441414', buttonColor: '#BF2B26', hoverColor: '#fc8e8e', fretboardColor: '#E6B0AA'  },
        minor: { backgroundColor: '#441414', buttonColor: '#e64949', hoverColor: '#fca7a7', fretboardColor: '#eacaca'  }
      },
    'G#': {
        major: { backgroundColor: '#C22624', buttonColor: '#F4A698', hoverColor: '#fc9e8e', fretboardColor: '#E6B0AA'  },
        minor: { backgroundColor: '#441414', buttonColor: '#e64949', hoverColor: '#fca7a7', fretboardColor: '#eacaca'  }
    },

    B: {
        major: { backgroundColor: '#51282c', buttonColor: '#E7717D', hoverColor: '#eac37e', fretboardColor: '#eacaca'  },
        minor: { backgroundColor: '#d1995c', buttonColor: '#f4c47c', hoverColor: '#eac37e', fretboardColor: '#ffe8c9'  }
    },
  };
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes.C.major);

    useEffect(() => {
        document.documentElement.style.setProperty('--background-color', currentTheme.backgroundColor);
        document.documentElement.style.setProperty('--button-color', currentTheme.buttonColor);
        document.documentElement.style.setProperty('--hover-color', currentTheme.hoverColor);
    }, [currentTheme]);


    const handleKeySelection = (key: string, isMinor: boolean) => {
        setIsPlayable(false);
        setSelectedChord(null);
        setSelectedKey(key);
        setIsMinorKey(isMinor);
        setCurrentTheme(themes[key][isMinor ? 'minor' : 'major']);
        resetToggles();
        setActiveNotes([]); 
        setActivePositions([]);
        // Clear progression when key changes
        setGeneratedProgression(null);
        setProgressionPositions([]);
        setCurrentProgressionChordIndex(-1);
        setIsProgressionPlaying(false);
        setSavedSelectedFrets([]); // Clear saved frets
    };

    const formatKeyForDisplay = (key: string): string => {
        const sharpToFlatMap: { [key: string]: string } = {
            'A#': 'B♭',
            'C#': 'D♭',
            'D#': 'E♭',
            'F#': 'G♭',
            'G#': 'A♭'
        };
        return sharpToFlatMap[key] || key;
    };

    const formatChordTypeForDisplay = (type: keyof typeof chordFormulas): string => {
        const typeMap: { [key: string]: string } = {
            'major': '',
            'minor': 'm',
            'dominant7': '7',
            '7b9': '7♭9',
            '7b9no5': '7♭9(no5)',
            '7#9': '7♯9',
            '7#9no5': '7♯9(no5)',
            '7b5': '7♭5',
            '7#5': '7♯5',
            'diminished': 'dim',
            'diminished7': 'dim7',
            'm7b5': 'm7♭5',
            'major7': 'maj7',
            'minor7': 'm7',
            'minor9': 'm9',
            'minoradd9': 'm(add9)',
            'minoradd11': 'm(add11)',
            'major9': 'maj9',
            'majoradd9': 'M(add9)',
            'majoradd11': 'M(add11)',
            'dominant9': '9',
            'dominant11': '11',
            'dominant11no5': '11(no5)',
            'augmented': 'aug',
            'sus2': 'sus2',
            'sus4': 'sus4',
            'major6': '6',
            'minor6': 'm6',
            'maj7no5': 'maj7(no5)',
            'minor7no5': 'm7(no5)',
            'maj9no5': 'maj9(no5)',
            'minor9no5': 'm9(no5)',
            '9no5': '9(no5)',
            '6/9no5': '6/9(no5)',
            '7no5': '7(no5)',
            '6no3': '6(no3)',
            '7sus4': '7sus4',
            '9sus4': '9sus4',
            'dominant13': '13',
            '13no5': '13(no5)',
            'minor11': 'm11',
            'minor11no3': 'm11(no3)',
            'minor11no5': 'm11(no5)',
            'maj9#11': 'maj9♯11',
            'maj9#11no5': 'maj9♯11(no5)',
            'maj7#11': 'maj7♯11',
            'maj7#11no5': 'maj7♯11(no5)',
            'maj13': 'maj13',
            'maj13no5': 'maj13(no5)',
            'minor13': 'm13',
            'minor13no5': 'm13(no5)'
        };
        return typeMap[type] || type;
    };

    const formatIntervalForDisplay = (interval: string): string => {
        const intervalMap: { [key: string]: string } = {
            'perfect unison': 'Unison',
            'minor 2nd': 'm2',
            'major 2nd': 'M2',
            'minor 3rd': 'm3',
            'major 3rd': 'M3',
            'perfect 4th': 'P4',
            'tritone': 'Tritone',
            'perfect 5th': 'P5',
            'minor 6th': 'm6',
            'major 6th': 'M6',
            'minor 7th': 'm7',
            'major 7th': 'M7',
            'octave': 'Octave',
            'minor 9th': 'm9',
            'major 9th': 'M9'
        };
        return intervalMap[interval] || interval;
    };

    const renderChordsForSelectedKey = () => {
        const rootIndex = notes.indexOf(selectedKey);
        const pattern = isMinorKey ? [0, 2, 3, 5, 7, 8, 10] : [0, 2, 4, 5, 7, 9, 11];
        const types = isMinorKey ? ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major']
                                 : ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
        //const degreeLabels = isMinorKey ? ['i', 'iiº', 'III', 'iv', 'v', 'VI', 'VII'] 
        //                                : ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'viiº'];     
        return (
            <div className="chord-container">
                <div className="chord-buttons">
                    {pattern.map((shift, index) => {
                        const chordRoot = notes[(rootIndex + shift) % 12];
                        const type = types[index];
                        const displayType = type === 'diminished' ? 'dim' : type;   // BUTTON TEXT CONVERT
                        const isSelectedChord = selectedChord && selectedChord.root === chordRoot && selectedChord.type === type;
                        return (
                            <button
                                className={`button ${isSelectedChord ? 'selected' : ''}`}
                                key={`${chordRoot}-${type}`}
                                onClick={() => handleChordSelection(chordRoot, type as keyof typeof chordFormulas)}>
                                {`${chordRoot} ${displayType}`}
                            </button>
                            
                        );
                    })}
                </div>
            </div>
        );
    };
    // <div className="chord-labels"> {degreeLabels.map(label => (<div className="label" key={label}>{label}</div>))} </div>
    /*=================================================================================================================*/    

    const resetToggles = () => {
        setIncludeSeventh(false);
        setIncludeNinth(false);
        setIncludeSixth(false);};
    const toggleSeventh = () => {
        setIncludeSeventh(prevSeventh => !prevSeventh);
        setIncludeNinth(false);
        setIncludeSixth(false);
        setIsPlayable(false); // Prevent auto-playback on toggle
        setValidChords([]); // Clear valid chords to prevent conflicts
        setCurrentChordIndex(-1);
        // Clear progression when toggle changes
        setGeneratedProgression(null);
        setProgressionPositions([]);
        setCurrentProgressionChordIndex(-1);
        setIsProgressionPlaying(false);
        // Reset to basic chord type when using extensions
        if (selectedChord && (selectedChord.type === 'dominant7' || selectedChord.type === 'sus2' || selectedChord.type === 'sus4')) {
            setSelectedChord({ root: selectedChord.root, type: 'major' });
        }
    };
    const toggleNinth = () => {
        setIncludeNinth(prevNinth => !prevNinth);
        setIncludeSeventh(false);
        setIncludeSixth(false);
        setIsPlayable(false); // Prevent auto-playback on toggle
        setValidChords([]); // Clear valid chords to prevent conflicts
        setCurrentChordIndex(-1);
        // Clear progression when toggle changes
        setGeneratedProgression(null);
        setProgressionPositions([]);
        setCurrentProgressionChordIndex(-1);
        setIsProgressionPlaying(false);
        // Reset to basic chord type when using extensions
        if (selectedChord && (selectedChord.type === 'dominant7' || selectedChord.type === 'sus2' || selectedChord.type === 'sus4')) {
            setSelectedChord({ root: selectedChord.root, type: 'major' });
        }
    };
    const toggleSixth = () => {
        setIncludeSixth(prevSixth => !prevSixth);
        setIncludeSeventh(false);
        setIncludeNinth(false);
        setIsPlayable(false); // Prevent auto-playback on toggle
        setValidChords([]); // Clear valid chords to prevent conflicts
        setCurrentChordIndex(-1);
        // Clear progression when toggle changes
        setGeneratedProgression(null);
        setProgressionPositions([]);
        setCurrentProgressionChordIndex(-1);
        setIsProgressionPlaying(false);
        // Reset to basic chord type when using extensions
        if (selectedChord && (selectedChord.type === 'dominant7' || selectedChord.type === 'sus2' || selectedChord.type === 'sus4')) {
            setSelectedChord({ root: selectedChord.root, type: 'major' });
        }
    };

    useEffect(() => {
        if (selectedChord) {
            updateChordNotes(selectedChord.root, selectedChord.type, includeSeventh, includeNinth, includeSixth);}
    }, [selectedChord, includeSeventh, includeNinth, includeSixth, updateChordNotes]);
    
    useEffect(() => {
        if (validChords.length > 0) {
            setActivePositions(validChords[currentChordIndex]);
            const activePositionsNotes = validChords[currentChordIndex].map(pos => {
                const note = fretboard[pos.string][pos.fret].name;
                return { note: note, interval: '' };
            });
    
            setActiveNotes(activePositionsNotes);
        }
    }, [validChords, currentChordIndex, fretboard]);
    
    useEffect(() => {
        if (isPlayable && !isProgressionPlaying) {
            playChord();
        }
    }, [activePositions, isPlayable, isProgressionPlaying, playChord ]);

    // Update recognized chord when selected frets change
    useEffect(() => {
        if (isFretSelectionMode && selectedFrets.length > 0) {
            const chord = recognizeChord(selectedFrets, fretboard);
            setRecognizedChord(chord);

            // Calculate intervals for recognized chord
            if (chord) {
                const rootIndex = notes.indexOf(chord.root);
                const activeNotesWithIntervals = selectedFrets.map(pos => {
                    const noteName = fretboard[pos.string][pos.fret].name;
                    const noteIndex = notes.indexOf(noteName);
                    const interval = (noteIndex - rootIndex + 12) % 12;
                    return {
                        note: noteName,
                        interval: getIntervalLabel(interval)
                    };
                });
                setActiveNotes(activeNotesWithIntervals);
            } else {
                setActiveNotes([]);
            }
        } else {
            setRecognizedChord(null);
            // Don't clear activeNotes here - they might be set by chord selection
        }
    }, [selectedFrets, isFretSelectionMode, fretboard, getIntervalLabel]);

    // Calculate and set scale factor for Circle of Fifths based on viewport height
    useEffect(() => {
        const calculateScale = () => {
            const baseHeight = 519; // Original scaled height in pixels
            const targetHeightVh = 45; // top half of screen
            const viewportHeight = window.innerHeight;
            const targetHeightPx = (targetHeightVh / 100) * viewportHeight;
            const scale = targetHeightPx / baseHeight;
            
            // Set CSS variable on document root
            document.documentElement.style.setProperty('--header-scale', scale.toString());
        };

        // Calculate on mount and resize
        calculateScale();
        window.addEventListener('resize', calculateScale);
        
        return () => {
            window.removeEventListener('resize', calculateScale);
        };
    }, []);
    

    /*=================================================================================================================*/

    //DISABLE ZOOM

/*
    useEffect(() => {
        const handleWheel = (event: WheelEvent) => {
          if (event.ctrlKey) {
            event.preventDefault();
          }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
          if (
            (event.ctrlKey && (event.key === '+' || event.key === '=' || event.key === '-')) || 
            event.metaKey
          ) {
            event.preventDefault();
          }
        };
        document.addEventListener('wheel', handleWheel, { passive: false });
        document.addEventListener('keydown', handleKeyDown);
        return () => {
          document.removeEventListener('wheel', handleWheel);
          document.removeEventListener('keydown', handleKeyDown);
        };
      }, []);
    */
      
      /*    FULL CONTROL INCASE FUTURE LOGIC CHANGE -> MOVE*** */
      const keyNeighbors: KeyNeighbors = {
        'C': {
          neighbors: [
            { key: 'F', degree: 'IV', isMinor: false },
            { key: 'G', degree: 'V', isMinor: false },
            { key: 'D', degree: 'ii', isMinor: true },
            { key: 'E', degree: 'iii', isMinor: true },
            { key: 'A', degree: 'vi', isMinor: true },
            { key: 'B', degree: 'vii°', isMinor: true }
            ],
        },
        'Am': {
            neighbors: [
              { key: 'B', degree: 'ii°', isMinor: true },
              { key: 'C', degree: 'III', isMinor: false },
              { key: 'D', degree: 'iv', isMinor: true },
              { key: 'E', degree: 'v', isMinor: true },
              { key: 'F', degree: 'VI', isMinor: false },
              { key: 'G', degree: 'VII', isMinor: false },
            ],
          },


        'G': {
            neighbors: [
              { key: 'C', degree: 'IV', isMinor: false },
              { key: 'D', degree: 'V', isMinor: false },
              { key: 'A', degree: 'ii', isMinor: true },
              { key: 'B', degree: 'iii', isMinor: true },
              { key: 'E', degree: 'vi', isMinor: true },
              { key: 'F#', degree: 'vii°', isMinor: true }
            ],
        },
        'Em': {
            neighbors: [
              { key: 'F#', degree: 'ii°', isMinor: true },
              { key: 'G', degree: 'III', isMinor: false },
              { key: 'A', degree: 'iv', isMinor: true },
              { key: 'B', degree: 'v', isMinor: true },
              { key: 'C', degree: 'VI', isMinor: false },
              { key: 'D', degree: 'VII', isMinor: false },
            ],
        },


        'D': {
            neighbors: [
                { key: 'G', degree: 'IV', isMinor: false },
                { key: 'A', degree: 'V', isMinor: false },
                { key: 'E', degree: 'ii', isMinor: true },
                { key: 'F#', degree: 'iii', isMinor: true },
                { key: 'B', degree: 'vi', isMinor: true },
                { key: 'C#', degree: 'vii°', isMinor: true }
            ],
        },
        'Bm': {
            neighbors: [
              { key: 'C#', degree: 'ii°', isMinor: true },
              { key: 'D', degree: 'III', isMinor: false },
              { key: 'E', degree: 'iv', isMinor: true },
              { key: 'F#', degree: 'v', isMinor: true },
              { key: 'G', degree: 'VI', isMinor: false },
              { key: 'A', degree: 'VII', isMinor: false },
            ],
        },
        
        'A': {
            neighbors: [
                { key: 'D', degree: 'IV', isMinor: false },
                { key: 'E', degree: 'V', isMinor: false },
                { key: 'B', degree: 'ii', isMinor: true },
                { key: 'C#', degree: 'iii', isMinor: true },
                { key: 'F#', degree: 'vi', isMinor: true },
                { key: 'C#', degree: 'vi', isMinor: true },
                { key: 'G#', degree: 'vii°', isMinor: true }
            ],
        },
        'F#m': {
            neighbors: [
              { key: 'G#', degree: 'ii°', isMinor: true },
              { key: 'A', degree: 'III', isMinor: false },
              { key: 'B', degree: 'iv', isMinor: true },
              { key: 'C#', degree: 'v', isMinor: true },
              { key: 'D', degree: 'VI', isMinor: false },
              { key: 'E', degree: 'VII', isMinor: false },
            ],
        },


        'E': {
            neighbors: [
                { key: 'A', degree: 'IV', isMinor: false },
                { key: 'B', degree: 'V', isMinor: false },
                { key: 'F#', degree: 'ii', isMinor: true },
                { key: 'G#', degree: 'iii', isMinor: true },
                { key: 'C#', degree: 'vi', isMinor: true },
                { key: 'D#', degree: 'vii°', isMinor: true }
            ],
        },
        'C#m': {
            neighbors: [
              { key: 'D#', degree: 'ii°', isMinor: true },
              { key: 'E', degree: 'III', isMinor: false },
              { key: 'F#', degree: 'iv', isMinor: true },
              { key: 'G#', degree: 'v', isMinor: true },
              { key: 'A', degree: 'VI', isMinor: false },
              { key: 'B', degree: 'VII', isMinor: false },
            ],
        },


        'B': {
            neighbors: [
                { key: 'E', degree: 'IV', isMinor: false },
                { key: 'F#', degree: 'V', isMinor: false },
                { key: 'C#', degree: 'ii', isMinor: true },
                { key: 'D#', degree: 'iii', isMinor: true },
                { key: 'G#', degree: 'vi', isMinor: true },
                { key: 'A#', degree: 'vii°', isMinor: true }
            ],
        },
        'G#m': {
            neighbors: [
              { key: 'A#', degree: 'ii°', isMinor: true },
              { key: 'B', degree: 'III', isMinor: false },
              { key: 'C#', degree: 'iv', isMinor: true },
              { key: 'D#', degree: 'v', isMinor: true },
              { key: 'E', degree: 'VI', isMinor: false },
              { key: 'F#', degree: 'VII', isMinor: false },
            ],
        },


        'F#': {
            neighbors: [
                { key: 'B', degree: 'IV', isMinor: false },
                { key: 'C#', degree: 'V', isMinor: false },
                { key: 'G#', degree: 'ii', isMinor: true },
                { key: 'A#', degree: 'iii', isMinor: true },
                { key: 'D#', degree: 'vi', isMinor: true },
                { key: 'F', degree: 'vii°', isMinor: true }
            ],
        },
        'D#m': {
            neighbors: [
              { key: 'F', degree: 'ii°', isMinor: true },
              { key: 'F#', degree: 'III', isMinor: false },
              { key: 'G#', degree: 'iv', isMinor: true },
              { key: 'A#', degree: 'v', isMinor: true },
              { key: 'B', degree: 'VI', isMinor: false },
              { key: 'C#', degree: 'VII', isMinor: false },
            ],
        },


        'C#': {
            neighbors: [
              { key: 'F#', degree: 'IV', isMinor: false },
              { key: 'G#', degree: 'V', isMinor: false },
              { key: 'D#', degree: 'ii', isMinor: true },
              { key: 'F', degree: 'iii', isMinor: true },
              { key: 'A#', degree: 'vi', isMinor: true },
              { key: 'C', degree: 'vii°', isMinor: true }
            ],
          },
        'A#m': {
            neighbors: [
              { key: 'C', degree: 'ii°', isMinor: true },
              { key: 'C#', degree: 'III', isMinor: false },
              { key: 'D#', degree: 'iv', isMinor: true },
              { key: 'F', degree: 'v', isMinor: true },
              { key: 'F#', degree: 'VI', isMinor: false },
              { key: 'G#', degree: 'VII', isMinor: false },
            ],
        },

        'G#': {
            neighbors: [
                { key: 'C#', degree: 'IV', isMinor: false },
                { key: 'D#', degree: 'V', isMinor: false },
                { key: 'A#', degree: 'ii', isMinor: true },
                { key: 'C', degree: 'iii', isMinor: true },
                { key: 'F', degree: 'vi', isMinor: true },
                { key: 'G', degree: 'vii°', isMinor: true }
            ],
        },
        'Fm': {
            neighbors: [
              { key: 'G', degree: 'ii°', isMinor: true },
              { key: 'G#', degree: 'III', isMinor: false },
              { key: 'A#', degree: 'iv', isMinor: true },
              { key: 'C', degree: 'v', isMinor: true },
              { key: 'C#', degree: 'VI', isMinor: false },
              { key: 'D#', degree: 'VII', isMinor: false },
            ],
        },

        'D#': {
            neighbors: [
                { key: 'G#', degree: 'IV', isMinor: false },
                { key: 'A#', degree: 'V', isMinor: false },
                { key: 'F', degree: 'ii', isMinor: true },
                { key: 'G', degree: 'iii', isMinor: true },
                { key: 'C', degree: 'vi', isMinor: true },
                { key: 'D', degree: 'vii°', isMinor: true }
            ],
        },
        'Cm': {
            neighbors: [
              { key: 'D', degree: 'ii°', isMinor: true },
              { key: 'D#', degree: 'III', isMinor: false },
              { key: 'F', degree: 'iv', isMinor: true },
              { key: 'G', degree: 'v', isMinor: true },
              { key: 'G#', degree: 'VI', isMinor: false },
              { key: 'A#', degree: 'VII', isMinor: false },
            ],
        },


        'A#': {
        neighbors: [
            { key: 'D#', degree: 'IV', isMinor: false },
            { key: 'F', degree: 'V', isMinor: false },
            { key: 'C', degree: 'ii', isMinor: true },
            { key: 'D', degree: 'iii', isMinor: true },
            { key: 'G', degree: 'vi', isMinor: true },
            { key: 'A', degree: 'vii°', isMinor: true }
            ],
        },
        'Gm': {
            neighbors: [
              { key: 'A', degree: 'ii°', isMinor: true },
              { key: 'A#', degree: 'III', isMinor: false },
              { key: 'C', degree: 'iv', isMinor: true },
              { key: 'D', degree: 'v', isMinor: true },
              { key: 'D#', degree: 'VI', isMinor: false },
              { key: 'F', degree: 'VII', isMinor: false },
            ],
        },


        'F': {
        neighbors: [
                { key: 'A#', degree: 'IV', isMinor: false },
                { key: 'C', degree: 'V', isMinor: false },
                { key: 'G', degree: 'ii', isMinor: true },
                { key: 'A', degree: 'iii', isMinor: true },
                { key: 'D', degree: 'vi', isMinor: true },
                { key: 'E', degree: 'vii°', isMinor: true }
            ],
        },
        'Dm': {
            neighbors: [
              { key: 'E', degree: 'ii°', isMinor: true },
              { key: 'F', degree: 'III', isMinor: false },
              { key: 'G', degree: 'iv', isMinor: true },
              { key: 'A', degree: 'v', isMinor: true },
              { key: 'A#', degree: 'VI', isMinor: false },
              { key: 'C', degree: 'VII', isMinor: false },
            ],
        },

      };


      /* Baseline hover types */
      const degreeToHoverLevel: { [degree: string]: number } = {
        'ii': 1,
        'ii°': 1,
        'iii': 2,
        'III': 4,
        'IV': 4,
        'iv': 2,
        'V': 4,
        'v': 2,
        'vi': 2,
        'VI': 5,
        'VII': 5,
        'vii°': 2,   
      };
      
      interface KeyNeighbor {
        key: string;
        degree: string;
        isMinor: boolean;
      }
      
      interface KeyNeighbors {
        [key: string]: {
          neighbors: KeyNeighbor[];
        };
      }
    
      const radiusMajor = 30.75;
      const radiusMinor = 19.75;
      
      return (
        <div className="fixed-viewport">
        <div className="App">
          <header className="App-header">
            {isCircleOfFifthsExpanded && (
              <div className="header-container">
                <div className="header-content-scaled">
                <img src={Header} alt="Header" className="header-image" />

                <div className="circle-container">
                {keys.map((key, index) => {
                const angleMajor = index * (360 / keys.length) - 90;
                const xMajor = radiusMajor * Math.cos(angleMajor * Math.PI / 180) * 0.695 - 0.25;
                const yMajor = radiusMajor * Math.sin(angleMajor * Math.PI / 180) * 1.1 + 0.8 ;
    
                const angleMinor = angleMajor - 90;
                const xMinor = radiusMinor * Math.cos(angleMinor * Math.PI / 180) * 0.58 - 0.18;
                const yMinor = radiusMinor * Math.sin(angleMinor * Math.PI / 180) * 0.9 + 0.6 ;
                
                
                const isSelectedMajor = selectedKey === key && !isMinorKey;
                const isSelectedMinor = selectedKey === key && isMinorKey;

                const selectedKeyFull = selectedKey + (isMinorKey ? 'm' : '');


                const neighborDataMajor = keyNeighbors[selectedKeyFull]?.neighbors.find(
                    (neighbor) => neighbor.key === key && !neighbor.isMinor);
                const neighborDataMinor = keyNeighbors[selectedKeyFull]?.neighbors.find(
                    (neighbor) => neighbor.key === key && neighbor.isMinor);

                // Major
                let hoverClassMajor = '';
                let degreeLabelMajor = '';

                if (neighborDataMajor) {
                    const hoverLevel = degreeToHoverLevel[neighborDataMajor.degree];
                    hoverClassMajor = `hover-effect-${hoverLevel}`;
                    degreeLabelMajor = neighborDataMajor.degree;
                }

                // Minor
                let hoverClassMinor = '';
                let degreeLabelMinor = '';

                if (neighborDataMinor) {
                    const hoverLevel = degreeToHoverLevel[neighborDataMinor.degree];
                    hoverClassMinor = `hover-effect-${hoverLevel}`;
                    degreeLabelMinor = neighborDataMinor.degree;
                }

                return (
                    <React.Fragment key={key}>
                    <button
                        className={`circle-button1 ${isSelectedMajor ? 'selected' : ''} ${hoverClassMajor}`}
                        style={{
                        left: `${50 + xMajor}%`,
                        top: `${50 + yMajor}%`,
                        width: '78px',
                        height: '78px',
                        }}
                        onClick={() => handleKeySelection(key, false)}
                    >
                        {/* Major Label Intervals */}
                        {degreeLabelMajor && (
                        <span className="degree-label major">{degreeLabelMajor}</span>
                        )}
                    </button>
                    <button
                        className={`circle-button2 ${isSelectedMinor ? 'selected' : ''} ${hoverClassMinor}`}
                        style={{
                        left: `${50 + xMinor}%`,
                        top: `${50 + yMinor}%`,
                        width: '40px',
                        height: '40px',
                        }}
                        onClick={() => handleKeySelection(key, true)}
                    >
                        {/* minor Label Intervals */}
                        {degreeLabelMinor && (
                        <span className="degree-label minor">{degreeLabelMinor}</span>
                        )}
                    </button>
                    </React.Fragment>
                );})}


                <div className="circle-text"></div>
                </div>
                </div>
              </div>
            )}

            <div className="fretboard-and-buttons-container">
                <div className={`toggle-circle-button ${isCircleOfFifthsExpanded ? 'toggle-circle-button--overlap' : ''}`}>
                    <button onClick={toggleCircleOfFifths} className="toggle-button">
                        {isCircleOfFifthsExpanded ? '▲' : '▼'}
                    </button>
                </div>
                {/* Hide key display when progression is active */}
                {!generatedProgression && (
                    <div className="key-display">
                        {isFretSelectionMode ? (
                            recognizedChord ? (
                                'type' in recognizedChord ? (
                                    <>Selected Chord: <span className="text-highlight">{formatKeyForDisplay(recognizedChord.root)}{formatChordTypeForDisplay(recognizedChord.type)}</span></>
                                ) : (
                                    <>Selected Interval: <span className="text-highlight">{formatKeyForDisplay(recognizedChord.root)} - {formatIntervalForDisplay(recognizedChord.interval)}</span></>
                                )
                            ) : (
                                <>Select frets to identify a chord</>
                            )
                        ) : (
                            <>Chords in the Key of <span className="text-highlight">{formatKeyForDisplay(selectedKey)} {isMinorKey ? 'Minor' : 'Major'}</span></>
                        )}
                    </div>
                )}

                {/* Progression Display */}
                {generatedProgression && (
                    <div 
                        className="progression-display" 
                        onClick={handleReplayProgression}
                        style={{
                            padding: '8px',
                            marginTop: '8px',
                            marginBottom: '10px',
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: '8px',
                            textAlign: 'center',
                            cursor: isProgressionPlaying ? 'default' : 'pointer',
                            opacity: isProgressionPlaying ? 0.8 : 1,
                            transition: 'all 0.2s ease'
                        }}
                        title={isProgressionPlaying ? 'Playing...' : 'Click to replay progression'}
                    >
                        <div style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.8 }}>
                            {generatedProgression.name} {!isProgressionPlaying && '▶︎'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            {generatedProgression.chords.map((chord, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '8px 12px',
                                        backgroundColor: currentProgressionChordIndex === index 
                                            ? 'var(--hover-color)' 
                                            : 'var(--button-color)',
                                        borderRadius: '4px',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        transform: currentProgressionChordIndex === index ? 'scale(1.1)' : 'scale(1)',
                                        color: currentProgressionChordIndex === index ? '#000' : 'inherit'
                                    }}
                                >
                                    {formatKeyForDisplay(chord.root)}{formatChordTypeForDisplay(chord.type as keyof typeof chordFormulas)}
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7, fontStyle: 'italic' }}>
                            {generatedProgression.description}
                        </div>
                    </div>
                )}


                {/* Chord Buttons and Navigation Controls */}
                <div className="chord-and-navigation-container">
                    <div className="left-controls">
                        <button onClick={toggleFretSelectionMode} className={`toggle-button ${isFretSelectionMode ? 'active' : ''}`} title="Select">
                            <img src={SelectIcon} alt="Select" className={isFretSelectionMode ? 'spinning-select-icon' : ''} style={{ width: '20px', height: '20px' }} />
                        </button>
                        <button onClick={playChord} disabled={!isPlayable && !(isFretSelectionMode && selectedFrets.length > 0)} className="toggle-button arrow-button" style={{ fontSize: '13px' }}>▶︎</button>
                    </div>
                    <div className="chord-section">
                        <div className="row">
                            {renderChordsForSelectedKey()}
                            {renderRandomChordButtons()}
                        </div>
                    </div>
                    <div className="right-controls">
                        <button onClick={() => cycleChords('prev')} disabled={validChords.length <= 1} className="toggle-button arrow-button">
                            <img src={ArrowLeftIcon} alt="Previous" style={{ width: '18px', height: '18px' }} />
                        </button>
                        <button onClick={findAndHighlightChord} disabled={!selectedChord} className="toggle-button" title="Find">
                            <img src={FindIcon} alt="Find" className={selectedChord ? 'spinning-find-icon' : ''} style={{ width: '20px', height: '20px' }} />
                        </button>
                        <button 
                            onClick={handleGenerateProgression} 
                            disabled={
                                isProgressionPlaying || 
                                (!selectedChord && !(isFretSelectionMode && recognizedChord && 'type' in recognizedChord))
                            }
                            className={`toggle-button ${isProgressionPlaying ? 'active' : ''}`}
                            title={
                                isFretSelectionMode 
                                    ? "Generate progression from selected chord" 
                                    : "Generate Progression"
                            }
                            style={{ fontSize: '11px', fontWeight: 'bold' }}
                        >
                            {isProgressionPlaying ? '♪' : 'GEN'}
                        </button>
                    </div>
                </div>

                {/* Fretboard and toggles container */}
                <div className="fretboard-container">
                    <Fretboard notes={fretboard} activeNotes={activeNotes} highlightAll={highlightAll} activePositions={activePositions} clearActivePositions={clearActivePositions} isProgressionPlaying={isProgressionPlaying}  currentTheme={currentTheme} isFretSelectionMode={isFretSelectionMode} selectedFrets={selectedFrets} onFretClick={handleFretClick} />
                    <div className="toggle-buttons">
                        <button onClick={toggleSeventh} className={`toggle-button ${includeSeventh ? 'active' : ''}`}>7th</button>
                        <button onClick={toggleNinth} className={`toggle-button ${includeNinth ? 'active' : ''}`}>9th</button>
                        <button onClick={toggleSixth} className={`toggle-button ${includeSixth ? 'active' : ''}`}>6th</button>
                        <button onClick={() => changeChordType('dominant7')} disabled={!selectedChord} className={`toggle-button ${selectedChord?.type === 'dominant7' ? 'active' : ''}`}>dom7</button>
                        <button onClick={() => changeChordType('sus2')} disabled={!selectedChord} className={`toggle-button ${selectedChord?.type === 'sus2' ? 'active' : ''}`}>sus2</button>
                        <button onClick={() => changeChordType('sus4')} disabled={!selectedChord} className={`toggle-button ${selectedChord?.type === 'sus4' ? 'active' : ''}`}>sus4</button>
                        <button onClick={toggleHighlightAll} className={`toggle-button ${highlightAll ? 'active' : ''}`}>All</button>
                    </div>
                </div>


                <div className="fret-labels">
                    {Array.from({ length: 18 }).map((_, index) => (  
                        <div className={`fret-label ${index === 13 ? 'fret-label-after-octave' : ''}`} key={index}>
                            {index === 0 ? '\u00A0' : index} 
                        </div>
                    ))}
                </div>

            </div>

            </header>
            </div>
        </div>
    );
};

export default App;