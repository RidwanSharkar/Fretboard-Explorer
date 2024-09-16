// utils/progressionUtils.ts

import { chordFormulas, ChordType } from './chordUtils';

export type ChordProgression = {
    root: string;
    type: ChordType;
    numeral: RomanNumeral;
};
 
export type ScaleType = 'major' | 'minor';
export type RomanNumeral = 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI' | 'VII' | 'i' | 'ii' | 'iii' | 'iv' | 'v' | 'vi' | 'vii' | 'ii°' | 'vii°';
const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];

const chordProgressionRules: Record<ScaleType, Partial<Record<RomanNumeral, RomanNumeral[]>>> = {
    major: {
        'I': ['ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
        'ii': ['V', 'vii°'],
        'iii': ['vi', 'IV'],
        'IV': ['ii', 'V', 'vii°'],
        'V': ['I', 'vii°', 'vi'], // added 'vi'
        'vi': ['IV'],             // removed 'ii'
        'vii°': ['I', 'vi', 'V']  // added 'V'
    },

    minor: {
        'i': ['ii°', 'III', 'iv', 'V', 'VI', 'VII', 'vii°'],
        'ii°': ['V', 'vii°'],
        'III': ['iv', 'ii°', 'VI'],
        'iv': ['ii°', 'V', 'vii°'],
        'V': ['i', 'vii°', 'VI'],
        'VI': ['iv', 'ii°'],
        'vii°': ['i', 'VI', 'V'],
        'VII': ['III', 'iv', 'ii°']
    }
};

/* Old Expanded to Melodic Minor:
    minor: {
        'i': ['ii°', 'III', 'iv', 'v', 'VI', 'VII'],
        'ii°': ['v', 'VII'],
        'III': ['iv', 'ii°', 'VI'],
        'iv': ['ii°', 'V', 'VII'], // 'V' for harmonic minor only
        'v': ['VI', 'i', 'vii°'], // 'v' melodic minor  remove 'vii°'
        'V': ['i', 'vii°'],
        'VI': ['iv', 'ii°'],
        'vii°': ['i', 'VI'],
        'VII': ['III', 'iv', 'ii°']
    } */


export function generateChordProgressions(isMinorKey: boolean, selectedKey: string): { root: string; type: keyof typeof chordFormulas }[]
{
    let progression = [];
    do {
        progression = generateChordProgression(isMinorKey, selectedKey);
    } while (progression.length < 4 || progression.length > 7); // filter range
    return progression;
}

export function generateChordProgression(isMinorKey: boolean, selectedKey: string): ChordProgression[] {
    const scaleType: ScaleType = isMinorKey ? 'minor' : 'major';
    const rules = chordProgressionRules[scaleType];
    const startingOptions: RomanNumeral[] = isMinorKey ? ['i', 'ii°'] : ['I', 'ii'];                // removed 'VI'     :||: 'vi', 'iii'
    const endingOptions: RomanNumeral[] = isMinorKey ? ['VII', 'III', 'iv'] : ['I', 'V', 'IV'];     // removed 'i', 'v' :||: 

    let currentChord: RomanNumeral = startingOptions[Math.floor(Math.random() * startingOptions.length)];

    let progression: ChordProgression[] = [{
        ...getChordFromRomanNumeral(currentChord, selectedKey, notes, isMinorKey),
        numeral: currentChord
    }];

    while (progression.length < 3 || !endingOptions.includes(currentChord)) {
        const possibleNextChords = rules[currentChord];
        if (possibleNextChords && possibleNextChords.length > 0) {
            currentChord = possibleNextChords[Math.floor(Math.random() * possibleNextChords.length)];
            progression.push({
                ...getChordFromRomanNumeral(currentChord, selectedKey, notes, isMinorKey),
                numeral: currentChord
            });
        } else {
            break;
        }
    }

    if (!endingOptions.includes(currentChord)) {
        currentChord = endingOptions[Math.floor(Math.random() * endingOptions.length)];
        const { root, type } = getChordFromRomanNumeral(currentChord, selectedKey, notes, isMinorKey);
        progression.push({ root, type, numeral: currentChord });
    }

    return progression;
}

const romanNumeralToChordType: Record<RomanNumeral, keyof typeof chordFormulas> = {
        'i': 'minor',
        'ii°': 'diminished',
        'III': 'major',
        'iv': 'minor',
        'v': 'minor',
        'VI': 'major',
        'VII': 'major',
        'I': 'major',
        'ii': 'minor',
        'iii': 'minor',
        'IV': 'major',
        'V': 'major',
        'vi': 'minor',
        'vii°': 'diminished',
        // Unused but req
        'II': 'major',
        'vii': 'diminished'
};


function getChordFromRomanNumeral(numeral: RomanNumeral, selectedKey: string, notes: string[], isMinorKey: boolean): ChordProgression {
    const chordType = romanNumeralToChordType[numeral];
    const rootIndex = notes.indexOf(selectedKey);

    let interval: number;
    switch (numeral.toUpperCase().replace('°', '')) {
        case 'I':
            interval = 0;
            break;
        case 'II':
            interval = 2;
            break;
        case 'III':
            interval = isMinorKey ? 3 : 4;
            break;
        case 'IV':
            interval = 5;
            break;
        case 'V':
            interval = 7;
            break;
        case 'VI':
            interval = isMinorKey ? 8 : 9;
            break;
        case 'VII':
            interval = isMinorKey ? 10 : 11;
            break;
        default:
            interval = 0;  // Default interval for unrecognized numerals or custom handling
    }

    const chordRoot = notes[(rootIndex + interval) % 12];
    return {
        root: chordRoot,
        type: chordType,
        numeral : numeral // Include the numeral in the return type
    };
}


