import { Chord as ChordModel } from '../models/Chord';
import { GuitarNote } from '../models/Note';


interface ChordProps {
  chord: ChordModel;
  fretboard: GuitarNote[][];
  positions: GuitarNote[];  
}

export const Chord: React.FC<ChordProps> = ({ positions }) => {
  return (
    <div className="chord">
      {positions.map((note, index) => (
        <div key={index} className="note">
          String: {note.string}, Fret: {note.fret}, Note: {note.name}
        </div>
      ))}
    </div>
  );
};
