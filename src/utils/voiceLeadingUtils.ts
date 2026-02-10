import { ChordPosition } from '../models/Note';

/**
 * Calculate the distance between two chord positions (for voice leading)
 * Measures how far the fingers need to move between chords
 */
export function calculateVoiceLeadingDistance(
    chord1: ChordPosition[],
    chord2: ChordPosition[]
): number {
    if (chord1.length === 0 || chord2.length === 0) return Infinity;

    let totalDistance = 0;
    let comparedNotes = 0;

    // Compare positions on each string
    for (let string = 0; string < 6; string++) {
        const note1 = chord1.find(pos => pos.string === string);
        const note2 = chord2.find(pos => pos.string === string);

        if (note1 && note2) {
            // Both chords have a note on this string - measure fret distance
            totalDistance += Math.abs(note1.fret - note2.fret);
            comparedNotes++;
        } else if (note1 || note2) {
            // Only one chord has a note on this string - penalty
            totalDistance += 5; // Arbitrary penalty for voice appearing/disappearing
            comparedNotes++;
        }
    }

    return comparedNotes > 0 ? totalDistance / comparedNotes : Infinity;
}

/**
 * Check if a voicing is musically valid (has enough notes and reasonable span)
 */
export function isValidVoicing(voicing: ChordPosition[], minNotes: number = 2): boolean {
    if (voicing.length < minNotes) return false;
    
    // Check if notes are on different strings (not all on same string)
    const uniqueStrings = new Set(voicing.map(pos => pos.string));
    if (uniqueStrings.size < minNotes) return false;
    
    return true;
}

/**
 * Calculate the average fret position of a chord (its "center" on the fretboard)
 */
export function getChordCenterPosition(chord: ChordPosition[]): number {
    if (chord.length === 0) return 0;
    const totalFrets = chord.reduce((sum, pos) => sum + pos.fret, 0);
    return totalFrets / chord.length;
}

/**
 * Calculate the fret span of a chord (max fret - min fret)
 */
export function getChordFretSpan(chord: ChordPosition[]): number {
    if (chord.length === 0) return 0;
    const frets = chord.map(pos => pos.fret).filter(fret => fret > 0); // Exclude open strings
    if (frets.length === 0) return 0;
    return Math.max(...frets) - Math.min(...frets);
}

/**
 * Find the voicing from a list of possible voicings that is closest to a target position
 * This helps keep progressions in the same area of the fretboard
 */
export function findClosestVoicing(
    possibleVoicings: ChordPosition[][],
    targetPosition: number,
    maxSpan: number = 4
): ChordPosition[] {
    if (possibleVoicings.length === 0) return [];
    if (possibleVoicings.length === 1) return possibleVoicings[0];

    // Filter voicings with reasonable span
    const goodVoicings = possibleVoicings.filter(
        voicing => getChordFretSpan(voicing) <= maxSpan
    );

    const voicingsToConsider = goodVoicings.length > 0 ? goodVoicings : possibleVoicings;

    // Find voicing with center closest to target
    let bestVoicing = voicingsToConsider[0];
    let bestDistance = Math.abs(getChordCenterPosition(bestVoicing) - targetPosition);

    for (const voicing of voicingsToConsider.slice(1)) {
        const center = getChordCenterPosition(voicing);
        const distance = Math.abs(center - targetPosition);

        if (distance < bestDistance) {
            bestDistance = distance;
            bestVoicing = voicing;
        }
    }

    return bestVoicing;
}

/**
 * Find the smoothest path through a progression by selecting optimal voicings
 * This creates a musically coherent progression with minimal finger movement
 * NOW WITH BETTER FALLBACK HANDLING for sparse voicing sets
 * 
 * @param startingVoicing - Optional reference voicing to optimize FROM (not included in result)
 * @param preferredPosition - Optional preferred fret position for first chord
 */
export function optimizeProgressionVoicings(
    allChordVoicings: ChordPosition[][][],
    startingVoicing?: ChordPosition[],
    preferredPosition?: number
): ChordPosition[][] {
    if (allChordVoicings.length === 0) return [];
    
    // Filter out invalid voicings (empty or too sparse)
    const validChordVoicings = allChordVoicings.map(voicings => {
        const valid = voicings.filter(v => isValidVoicing(v, 2));
        // If no valid voicings, keep the best attempt (at least 1 note)
        return valid.length > 0 ? valid : voicings.filter(v => v.length > 0);
    });
    
    if (validChordVoicings.length === 1) {
        return [validChordVoicings[0][0] || []];
    }

    const selectedVoicings: ChordPosition[][] = [];
    
    // Determine starting point for voice leading reference
    let currentVoicing: ChordPosition[];
    let startFromFirstChord = false;
    
    if (startingVoicing && startingVoicing.length > 0) {
        // Use provided starting voicing as reference (not included in result)
        currentVoicing = startingVoicing;
        startFromFirstChord = true;
    } else if (preferredPosition !== undefined && validChordVoicings[0].length > 0) {
        // Start with voicing closest to preferred position
        currentVoicing = findClosestVoicing(validChordVoicings[0], preferredPosition, 5); // Allow wider span
        selectedVoicings.push(currentVoicing);
    } else if (validChordVoicings[0].length > 0) {
        // Start with first available voicing - prefer fuller voicings
        const firstChordOptions = validChordVoicings[0];
        currentVoicing = firstChordOptions.sort((a, b) => b.length - a.length)[0];
        selectedVoicings.push(currentVoicing);
    } else {
        // Last resort: empty voicing
        currentVoicing = [];
        selectedVoicings.push(currentVoicing);
    }

    // For each chord, find the voicing with best voice leading
    const startIndex = startFromFirstChord ? 0 : 1;
    for (let i = startIndex; i < validChordVoicings.length; i++) {
        const possibleVoicings = validChordVoicings[i];
        
        if (possibleVoicings.length === 0) {
            // No voicings available - keep empty
            selectedVoicings.push([]);
            continue;
        }

        // Prefer voicings with more notes (fuller chords)
        const fullerVoicings = possibleVoicings.filter(v => v.length >= 3);
        const voicingsToConsider = fullerVoicings.length > 0 ? fullerVoicings : possibleVoicings;

        // Find voicing with minimal voice leading distance from current voicing
        let bestVoicing = voicingsToConsider[0];
        let bestScore = Infinity;

        for (const voicing of voicingsToConsider) {
            // Skip if current voicing is empty (no reference point)
            if (currentVoicing.length === 0) {
                // Just pick the fullest voicing in a reasonable position
                const noteCount = voicing.length;
                const span = getChordFretSpan(voicing);
                const score = -noteCount * 10 + span; // Prefer more notes, smaller span
                
                if (score < bestScore) {
                    bestScore = score;
                    bestVoicing = voicing;
                }
                continue;
            }
            
            // Calculate voice leading distance
            const vlDistance = calculateVoiceLeadingDistance(currentVoicing, voicing);
            
            // Prefer voicings with smaller span (more playable)
            const spanPenalty = getChordFretSpan(voicing) * 0.2;
            
            // Prefer voicings near the current position
            const centerDistance = Math.abs(
                getChordCenterPosition(voicing) - getChordCenterPosition(currentVoicing)
            ) * 0.3;
            
            // Prefer fuller voicings (more notes)
            const fullnessBonus = (voicing.length >= 3 ? -1 : 0) + (voicing.length >= 4 ? -1 : 0);
            
            const totalScore = vlDistance + spanPenalty + centerDistance + fullnessBonus;

            if (totalScore < bestScore) {
                bestScore = totalScore;
                bestVoicing = voicing;
            }
        }

        selectedVoicings.push(bestVoicing);
        currentVoicing = bestVoicing;
    }

    return selectedVoicings;
}

/**
 * Score how well two chords connect (lower is better)
 * Considers voice leading, common tones, and fret proximity
 */
export function scoreChordConnection(
    chord1: ChordPosition[],
    chord2: ChordPosition[]
): number {
    if (chord1.length === 0 || chord2.length === 0) return 100;

    // Voice leading distance (primary factor)
    const vlDistance = calculateVoiceLeadingDistance(chord1, chord2);
    
    // Common tones (shared fret positions reduce score)
    let commonTones = 0;
    for (const pos1 of chord1) {
        if (chord2.some(pos2 => pos2.string === pos1.string && pos2.fret === pos1.fret)) {
            commonTones++;
        }
    }
    const commonToneBonus = commonTones * -2; // Negative = better score
    
    // Position jump (how far apart are the chord centers)
    const positionJump = Math.abs(
        getChordCenterPosition(chord1) - getChordCenterPosition(chord2)
    );
    
    return vlDistance + commonToneBonus + (positionJump * 0.5);
}

/**
 * Create a basic fallback chord voicing when strict chord finding fails
 * Generates a simple triad or power chord shape that's always playable
 * 
 * @param noteNames - The notes that should be in the chord (at least root, 3rd, 5th)
 * @param fretboard - The fretboard data structure
 * @param targetPosition - Preferred fret position (defaults to open position)
 * @returns An array of basic chord voicings (usually 1-3 options)
 */
export function createFallbackVoicing(
    noteNames: string[],
    fretboard: any[][], // GuitarNote[][] but avoiding circular import
    targetPosition: number = 3
): ChordPosition[][] {
    if (noteNames.length === 0) return [];
    
    const root = noteNames[0];
    const voicings: ChordPosition[][] = [];
    
    // Strategy 1: Simple triad on middle strings (strings 2-4)
    // Try to find root, 3rd (or 2nd note), and 5th (or 3rd note) close together
    const searchRange = targetPosition <= 5 ? [0, 7] : [targetPosition - 3, targetPosition + 3];
    
    for (let baseFret = searchRange[0]; baseFret <= Math.min(searchRange[1], 12); baseFret++) {
        const positions: ChordPosition[] = [];
        
        // Try to build a chord starting from this fret
        // Look for root note
        for (let string = 3; string <= 5; string++) {
            if (baseFret < fretboard[string].length && fretboard[string][baseFret].name === root) {
                positions.push({ string, fret: baseFret });
                
                // Find other chord tones nearby
                for (let searchString = 0; searchString < 6; searchString++) {
                    if (searchString === string) continue;
                    
                    for (let fretOffset = -2; fretOffset <= 3; fretOffset++) {
                        const searchFret = baseFret + fretOffset;
                        if (searchFret >= 0 && searchFret < fretboard[searchString].length) {
                            const noteName = fretboard[searchString][searchFret].name;
                            if (noteNames.includes(noteName) && !positions.some(p => p.string === searchString)) {
                                positions.push({ string: searchString, fret: searchFret });
                                if (positions.length >= 3) break;
                            }
                        }
                    }
                    if (positions.length >= 3) break;
                }
                
                if (positions.length >= 2) {
                    voicings.push([...positions].sort((a, b) => b.string - a.string));
                }
                
                if (voicings.length >= 3) break;
            }
        }
        if (voicings.length >= 3) break;
    }
    
    // Strategy 2: Power chord (root + 5th) if we couldn't find a triad
    if (voicings.length === 0 && noteNames.length >= 2) {
        const fifth = noteNames.length >= 3 ? noteNames[2] : noteNames[1];
        
        for (let baseFret = 0; baseFret <= 12; baseFret++) {
            // Try strings 5-4, 4-3, or 3-2
            for (let rootString = 3; rootString <= 5; rootString++) {
                if (baseFret < fretboard[rootString].length && fretboard[rootString][baseFret].name === root) {
                    // Look for fifth on adjacent string
                    for (let fifthString = rootString - 2; fifthString <= rootString - 1; fifthString++) {
                        if (fifthString >= 0) {
                            for (let fifthFret = baseFret - 1; fifthFret <= baseFret + 3; fifthFret++) {
                                if (fifthFret >= 0 && fifthFret < fretboard[fifthString].length && 
                                    fretboard[fifthString][fifthFret].name === fifth) {
                                    voicings.push([
                                        { string: rootString, fret: baseFret },
                                        { string: fifthString, fret: fifthFret }
                                    ]);
                                    if (voicings.length >= 2) break;
                                }
                            }
                        }
                        if (voicings.length >= 2) break;
                    }
                }
                if (voicings.length >= 2) break;
            }
            if (voicings.length >= 2) break;
        }
    }
    
    // Strategy 3: Last resort - just play root note in a reasonable position
    if (voicings.length === 0) {
        const rootFret = Math.max(0, Math.min(targetPosition, 12));
        for (let string = 3; string <= 5; string++) {
            if (rootFret < fretboard[string].length && fretboard[string][rootFret].name === root) {
                voicings.push([{ string, fret: rootFret }]);
                break;
            }
        }
        
        // If still nothing, use open string or low frets
        if (voicings.length === 0) {
            for (let fret = 0; fret <= 5; fret++) {
                for (let string = 3; string <= 5; string++) {
                    if (fret < fretboard[string].length && fretboard[string][fret].name === root) {
                        voicings.push([{ string, fret }]);
                        break;
                    }
                }
                if (voicings.length > 0) break;
            }
        }
    }
    
    return voicings;
}
