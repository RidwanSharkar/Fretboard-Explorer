import React from 'react';
import { ChordPosition } from '../models/Note';
import './TabPopup.css';

interface TabPopupProps {
  chordPositions: ChordPosition[][];
  chordNames: string[];
  onClose: () => void;
}

const TabPopup: React.FC<TabPopupProps> = ({ chordPositions, chordNames, onClose }) => {
  // Convert chord positions to tab format
  const generateTab = () => {
    const numStrings = 6;
    const strings = ['e', 'B', 'G', 'D', 'A', 'E']; // Standard tuning (high to low)
    
    // Initialize tab lines for each string
    const tabLines: string[][] = Array.from({ length: numStrings }, () => []);
    
    // Process each chord
    chordPositions.forEach((chord, chordIndex) => {
      // Create an array to hold fret numbers for each string
      const frets: (string | null)[] = Array(numStrings).fill(null);
      
      // Fill in the fret numbers from the chord positions
      chord.forEach(pos => {
        const stringIndex = numStrings - 1 - pos.string; // Convert to 0-indexed from bottom
        frets[stringIndex] = pos.fret.toString();
      });
      
      // Find the maximum width needed for this chord (at least 2 characters)
      const maxWidth = Math.max(
        ...frets.map(f => (f === null ? 1 : f.length)),
        2
      );
      
      // Add each string's fret to the tab lines
      frets.forEach((fret, stringIndex) => {
        if (fret === null) {
          // For strings not played, use dashes
          tabLines[stringIndex].push('-'.repeat(maxWidth));
        } else {
          // Center the fret number with dashes
          const padding = maxWidth - fret.length;
          const leftPad = Math.floor(padding / 2);
          const rightPad = padding - leftPad;
          tabLines[stringIndex].push('-'.repeat(leftPad) + fret + '-'.repeat(rightPad));
        }
      });
      
      // Add separator between chords (except after the last one)
      if (chordIndex < chordPositions.length - 1) {
        tabLines.forEach(line => {
          line.push('--');
        });
      }
    });
    
    // Build the final tab string with proper formatting
    const tabString = tabLines.map((line, index) => {
      const stringName = strings[index];
      return `${stringName}|${line.join('')}|`;
    }).join('\n');
    
    return tabString;
  };
  
  const tabString = generateTab();
  
  // Copy to clipboard function
  const handleCopy = () => {
    navigator.clipboard.writeText(tabString);
    alert('Tab copied to clipboard!');
  };
  
  return (
    <div className="tab-popup-overlay" onClick={onClose}>
      <div className="tab-popup-container" onClick={(e) => e.stopPropagation()}>
        <div className="tab-popup-header">
          <h2>Guitar Tab</h2>
          <button className="tab-popup-close" onClick={onClose}>✕</button>
        </div>
        
        <div className="tab-popup-chord-names">
          {chordNames.map((name, index) => (
            <span key={index} className="tab-chord-name">
              {name}
            </span>
          ))}
        </div>
        
        <div className="tab-popup-content">
          <pre className="tab-display">{tabString}</pre>
        </div>
        
        <div className="tab-popup-footer">
          <button className="tab-copy-button" onClick={handleCopy}>
            Copy to Clipboard
          </button>
          <p className="tab-instruction">Screenshot this tab for your records!</p>
        </div>
      </div>
    </div>
  );
};

export default TabPopup;
