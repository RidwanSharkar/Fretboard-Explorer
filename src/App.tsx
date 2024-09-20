// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Fretboard from './components/Fretboard';
import { constructFretboard, possibleChord } from './utils/fretboardUtils';
import { GuitarNote, ChordPosition } from './models/Note';
import { chordFormulas } from './utils/chordUtils';
import { playNote } from './utils/midiUtils';
import Header from '../public/Background.jpg';  // Adjust this path based on where the image is saved


/*=====================================================================================================================*/
const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
const keys = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];
/*const intervals = ['R', 'm2', 'M2', 'm3', 'M3', 'P4', 'T', 'P5', 'm6', 'M6', 'm7', 'M7'];*/
/*=====================================================================================================================*/

const App: React.FC = () => 
{
    const [fretboard ] = useState<GuitarNote[][]>(() => constructFretboard(6, 16));
    const [activeNotes, setActiveNotes] = useState<{ note: string; interval: string }[]>([]);
    const [selectedKey, setSelectedKey] = useState('C');
    const [selectedChord, setSelectedChord] = useState<{ root: string; type: keyof typeof chordFormulas } | null>(null);
    const [includeSeventh, setIncludeSeventh] = useState(false);
    const [includeNinth, setIncludeNinth] = useState(false);
    const [isMinorKey, setIsMinorKey] = useState(false);
    const [currentChordIndex, setCurrentChordIndex] = useState(-1);
    const [validChords, setValidChords] = useState<ChordPosition[][]>([]);
    const [highlightAll, setHighlightAll] = useState(false);
    const toggleHighlightAll = () => {setHighlightAll(!highlightAll);};
    const [activePositions, setActivePositions] = useState<ChordPosition[]>([]);
    const clearActivePositions = () => {setActivePositions([]);};
    const [isPlayable, setIsPlayable] = useState(false); // MIDI

    const [isProgressionPlaying, setIsProgressionPlaying] = useState(false); //depreciated


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

    const updateChordNotes = useCallback((root: string, type: keyof typeof chordFormulas, includeSeventh: boolean, includeNinth: boolean) => {
        const rootIndex = notes.indexOf(root);
        const baseIntervals = chordFormulas[type].map((interval, index) => ({
            note: notes[(rootIndex + interval) % 12],
            interval: ['R', '3rd', '5th'][index % 3]}));
        const additionalIntervals = [];
        if (includeSeventh) {
            const flatSeventh = shouldUseFlatSeventh(root, type, includeSeventh, selectedKey, isMinorKey) ? 10 : 11;
            additionalIntervals.push({
                note: notes[(rootIndex + flatSeventh) % 12],
                interval: '7th'});}
        if (includeNinth) {
            additionalIntervals.push({
                note: notes[(rootIndex + 14) % 12],
                interval: '9th'});}
        setActiveNotes([...baseIntervals, ...additionalIntervals]);
    }, [ selectedKey, isMinorKey ]);
    
    /*=================================================================================================================*/
    
    const playChord = useCallback(() => {
        const sortedPositions = activePositions.sort((a, b) => a.string === b.string ? a.fret - b.fret : b.string - a.string);
        sortedPositions.forEach((pos, index) => {
            const staggerTime = index * 0.05; // stagger time for strumming
            playNote(pos.string, pos.fret, fretboard, '8n', staggerTime);});
    }, [activePositions, fretboard]);
    
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
        updateChordNotes(root, type, includeSeventh, includeNinth);

        const rootIndex = notes.indexOf(root);
        const noteNames = chordFormulas[type].map(interval => notes[(rootIndex + interval) % 12]);
        if (includeSeventh) {
            const flatSeventh = shouldUseFlatSeventh(root, type, includeSeventh, selectedKey, isMinorKey) ? 10 : 11;
            noteNames.push(notes[(rootIndex + flatSeventh) % 12]);}
        if (includeNinth) {
            noteNames.push(notes[(rootIndex + 14) % 12]);}

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
    }, [ fretboard, includeSeventh, includeNinth, selectedKey, isMinorKey, updateChordNotes ]);


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
        updateChordNotes(root, type, includeSeventh, includeNinth);
    }, [updateChordNotes, includeSeventh, includeNinth]);  

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

/* MOVE */
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
        major: { backgroundColor: '#51282c', buttonColor: '#E7717D', hoverColor: '#4CAF50', fretboardColor: '#eacaca'  },
        minor: { backgroundColor: '#ffcd89', buttonColor: '#ff9e44', hoverColor: '#ff811b', fretboardColor: '#ffe8c9'  }
    },
    'A#': {
        major: { backgroundColor: '#51282c', buttonColor: '#E7717D', hoverColor: '#4CAF50', fretboardColor: '#eacaca'  },
        minor: { backgroundColor: '#ffcd89', buttonColor: '#ff9e44', hoverColor: '#ff811b', fretboardColor: '#ffe8c9'  }
    },

    C: {
        major: { backgroundColor: '#04814f', buttonColor: '#54bc6c', hoverColor: '#7cccac', fretboardColor: '#ade3b6'  },
        minor: { backgroundColor: '#51282c', buttonColor: '#E7717D', hoverColor: '#fca7a7', fretboardColor: '#eacaca'  }
    },
    'C#': {
        major: { backgroundColor: '#224d29', buttonColor: '#4fb45e', hoverColor: '#8efc9e', fretboardColor: '#ade3b6'  },
        minor: { backgroundColor: '#51282c', buttonColor: '#E7717D', hoverColor: '#fca7a7', fretboardColor: '#eacaca'  }
    },
    
    D: {
        major: { backgroundColor: '#282c34', buttonColor: '#4597ba', hoverColor: '#77C3EC', fretboardColor: '#D6EAF8'  },
        minor: { backgroundColor: '#5899d1', buttonColor: '#66beff', hoverColor: '#b1e5f2', fretboardColor: '#b8ddf1'  }
    },
    'D#': {
        major: { backgroundColor: '#282c34', buttonColor: '#4597ba', hoverColor: '#77C3EC', fretboardColor: '#b8ddf1'  },
        minor: { backgroundColor: '#5DADE2', buttonColor: '#75c4ef', hoverColor: '#82d3ff', fretboardColor: '#b8ddf1'  }
    },

    E: {
        major: { backgroundColor: '#282c34', buttonColor: '#4597ba', hoverColor: '#77C3EC', fretboardColor: '#b8ddf1'  },
        minor: { backgroundColor: '#1B4F72', buttonColor: '#4597ba', hoverColor: '#82d3ff', fretboardColor: '#b8ddf1'  }
      },

    F: {
        major: { backgroundColor: '#7851A9', buttonColor: '#B57EDC', hoverColor: '#e2c4f2', fretboardColor: '#D7BDE2'  },
        minor: { backgroundColor: '#6A0DAD', buttonColor: '#B57EDC', hoverColor: '#e2c4f2', fretboardColor: '#D7BDE2' }
    },
    'F#': {
        major: { backgroundColor: '#76448A', buttonColor: '#AF7AC5', hoverColor: '#D7BDE2', fretboardColor: '#D7BDE2'  },
        minor: { backgroundColor: '#1B4F72', buttonColor: '#4597ba', hoverColor: '#82d3ff', fretboardColor: '#F5EEF8'  }
    },

    G: {
        major: { backgroundColor: '#441414', buttonColor: '#e64949', hoverColor: '#F1948A', fretboardColor: '#E6B0AA'  },
        minor: { backgroundColor: '#441414', buttonColor: '#e64949', hoverColor: '#fca7a7', fretboardColor: '#eacaca'  }
      },
    'G#': {
        major: { backgroundColor: '#441414', buttonColor: '#e64949', hoverColor: '#fca7a7', fretboardColor: '#E6B0AA'  },
        minor: { backgroundColor: '#441414', buttonColor: '#e64949', hoverColor: '#fca7a7', fretboardColor: '#eacaca'  }
    },

    B: {
        major: { backgroundColor: '#51282c', buttonColor: '#E7717D', hoverColor: '#4CAF50', fretboardColor: '#eacaca'  },
        minor: { backgroundColor: '#ffcd89', buttonColor: '#ff9e44', hoverColor: '#ff811b', fretboardColor: '#ffe8c9'  }
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
        setIncludeNinth(false);};
    const toggleSeventh = () => {
        setIncludeSeventh(prevSeventh => !prevSeventh);
        setIncludeNinth(false);};
    const toggleNinth = () => {
        setIncludeNinth(prevNinth => !prevNinth);
        setIncludeSeventh(false);};

    useEffect(() => {
        if (selectedChord) {
            updateChordNotes(selectedChord.root, selectedChord.type, includeSeventh, includeNinth);}
    }, [selectedChord, includeSeventh, includeNinth, updateChordNotes]);
    
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
        if (isPlayable) {
            playChord();
        }
    }, [activePositions, isPlayable, playChord ]);
    

    /*=================================================================================================================*/


    const radiusMajor = 178.5;
    const radiusMinor = 100;
    const elliptical = 1.025;
    
    return (
        <div className="App">
            <header className="App-header">
            <div className="header-container">
            <div className="header-image-container">
                <img src={Header} alt="Header" className="header-image" />
            </div>

            <div className="circle-container">
                {keys.map((key, index) => {
                    const angleMajor = index * (360 / keys.length) - 90;
                    const xMajor = radiusMajor * Math.cos(angleMajor * Math.PI / 180) * elliptical;
                    const yMajor = radiusMajor * Math.sin(angleMajor * Math.PI / 180);
                    const isSelectedMajor = selectedKey === key && !isMinorKey;
                    const angleMinor = angleMajor - 90; 
                    const xMinor = radiusMinor * Math.cos(angleMinor * Math.PI / 180) * 1.03 + 1;
                    const yMinor = radiusMinor * Math.sin(angleMinor * Math.PI / 180) - 1;
                    const isSelectedMinor = selectedKey === key && isMinorKey;
        return (
            <React.Fragment key={key}>
                <button
                    className={`circle-button1 ${isSelectedMajor ? 'selected' : ''}`}
                    style={{ transform: `translate(${xMajor}px, ${yMajor}px)` }}
                    onClick={() => handleKeySelection(key, false)}
                >
                    
                </button>
                <button
                    className={`circle-button2 minor ${isSelectedMinor ? 'selected' : ''}`}
                    style={{ transform: `translate(${xMinor}px, ${yMinor}px)` }}
                    onClick={() => handleKeySelection(key, true)}
                >
                    
                </button>
            </React.Fragment>);})}


                <div className="circle-text"></div>
                </div>
                </div>

                <div className="key-display">
                    Chords in the Key of <span className="text-highlight">{selectedKey} {isMinorKey ? 'Minor' : 'Major'}</span>
                </div>


                {/* Chord Buttons */}
                <div className = "row">
                    {renderChordsForSelectedKey()}
                    {renderRandomChordButtons()}
                </div>

                {/* Fretboard and toggles container */}
                <div className="fretboard-container">
                    <Fretboard notes={fretboard} activeNotes={activeNotes} highlightAll={highlightAll} activePositions={activePositions} clearActivePositions={clearActivePositions} isProgressionPlaying={isProgressionPlaying}  currentTheme={currentTheme}  />
                    <div className="toggle-buttons">
                        <button onClick={toggleSeventh} className={`toggle-button ${includeSeventh ? 'active' : ''}`}>7th</button>
                        <button onClick={toggleNinth} className={`toggle-button ${includeNinth ? 'active' : ''}`}>9th</button>
                        <button onClick={toggleHighlightAll} className={`toggle-button ${highlightAll ? 'active' : ''}`}>All</button>
                        <button onClick={findAndHighlightChord} disabled={!selectedChord} className="toggle-button">Find</button>
                        <button onClick={() => cycleChords('prev')} disabled={validChords.length <= 1} className="toggle-button">Prev</button>
                        <button onClick={() => cycleChords('next')} disabled={validChords.length <= 1} className="toggle-button">Next</button> 
                        <button onClick={playChord} disabled={!isPlayable} className="toggle-button">Play</button>
                    </div>
                </div>


                <div className="fret-labels">
                    {Array.from({ length: 16 }).map((_, index) => (  
                        <div className="fret-label" key={index}>
                            {index === 0 ? '\u00A0' : index}  {/* Inserts a non-breaking space for the 0 fret */}
                        </div>
                    ))}
                </div>


            </header>
        </div>
    );
};

export default App;