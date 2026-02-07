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
 */
export function optimizeProgressionVoicings(
    allChordVoicings: ChordPosition[][][],
    startingVoicing?: ChordPosition[],
    preferredPosition?: number
): ChordPosition[][] {
    if (allChordVoicings.length === 0) return [];
    if (allChordVoicings.length === 1) {
        return [allChordVoicings[0][0] || []];
    }

    const selectedVoicings: ChordPosition[][] = [];
    
    // Determine starting point
    let currentVoicing: ChordPosition[];
    
    if (startingVoicing) {
        // Use provided starting voicing
        currentVoicing = startingVoicing;
        selectedVoicings.push(currentVoicing);
    } else if (preferredPosition !== undefined) {
        // Start with voicing closest to preferred position
        currentVoicing = findClosestVoicing(allChordVoicings[0], preferredPosition);
        selectedVoicings.push(currentVoicing);
    } else {
        // Start with first available voicing
        currentVoicing = allChordVoicings[0][0];
        selectedVoicings.push(currentVoicing);
    }

    // For each subsequent chord, find the voicing with best voice leading
    for (let i = startingVoicing ? 0 : 1; i < allChordVoicings.length; i++) {
        if (startingVoicing && i === 0) continue; // Skip first if we already have starting voicing
        
        const possibleVoicings = allChordVoicings[i];
        
        if (possibleVoicings.length === 0) {
            selectedVoicings.push([]);
            continue;
        }

        // Find voicing with minimal voice leading distance from current voicing
        let bestVoicing = possibleVoicings[0];
        let bestScore = Infinity;

        for (const voicing of possibleVoicings) {
            // Calculate voice leading distance
            const vlDistance = calculateVoiceLeadingDistance(currentVoicing, voicing);
            
            // Prefer voicings with smaller span
            const spanPenalty = getChordFretSpan(voicing) * 0.2;
            
            // Prefer voicings near the current position
            const centerDistance = Math.abs(
                getChordCenterPosition(voicing) - getChordCenterPosition(currentVoicing)
            ) * 0.3;
            
            const totalScore = vlDistance + spanPenalty + centerDistance;

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
