// components/Fretboard.tsx

import './Fretboard.css';
import { GuitarNote as Note, ChordPosition  } from '../models/Note';

interface FretboardProps {
  notes: Note[][];
  activeNotes: { note: string; interval: string }[];
  highlightAll: boolean;
  activePositions: ChordPosition[];
  clearActivePositions: () => void;
  isProgressionPlaying: boolean;
  currentTheme: { fretboardColor: string };
}

const noteColors: { [key: string]: string } = {
  C: '#93bb70',
  'C#': '#bcdfd0',
  D: '#7bb5c8',
  'D#': '#95b2d9',
  E: '#234b7e',
  F: '#A285bf',
  'F#': '#EFC3DF',
  G: '#c2586a',
  'G#': '#eea07d',
  A: '#d78438',
  'A#': '#ebd49e',
  B: '#e6d06f'
};

const Fretboard: React.FC<FretboardProps> = ({
  notes, activeNotes, highlightAll, activePositions, currentTheme }) => {

  const formatNoteName = (noteName: string): string => {
    const sharpToFlatMap: { [key: string]: string } = {
      'C#': 'C#/D♭',
      'D#': 'D#/E♭',
      'F#': 'F#/G♭',
      'G#': 'G#/A♭',
      'A#': 'A#/B♭'
    };
    return sharpToFlatMap[noteName] || noteName;
  };

  const isSharpOrFlat = (noteName: string): boolean => {
    return ['C#', 'D#', 'F#', 'G#', 'A#'].includes(noteName);
  };

  const isActive = (string: number, fret: number) => {
    if (highlightAll) {
      return true;
    }
    if (activePositions.length > 0) {
      return activePositions.some(pos => pos.string === string && pos.fret === fret);
    }
    return activeNotes.some(an => an.note === notes[string][fret].name);
  };

  return (
    <div className="fretboard">
      {notes.map((stringNotes, stringIndex) => (
        <div key={stringIndex} className="string">
          {stringNotes.map((note, fretIndex) => {
            const active = isActive(stringIndex, fretIndex);
            const activeDetail = activeNotes.find(an => an.note === note.name);
            return (
              <div
                key={fretIndex}
                className={`fret ${active ? 'active' : ''} ${fretIndex === 0 ? 'open-note' : ''} ${fretIndex === 12 ? 'octave-separator' : ''}`}

                style={{ backgroundColor: active ? noteColors[note.name] : currentTheme.fretboardColor }} // FRET BACKGROUND
              >
                <span className={`note ${isSharpOrFlat(note.name) ? 'note-sharp-flat' : ''}`}>
                  {formatNoteName(note.name)}
                </span>
                {active && (
                  <span className="note-label" style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '8px', color: '#fff', fontWeight: 'bold' }}>
                    {activeDetail ? activeDetail.interval : ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Fretboard;