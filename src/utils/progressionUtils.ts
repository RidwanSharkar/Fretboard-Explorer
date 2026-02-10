import { ChordType } from './chordUtils';

export interface ChordInfo {
  root: string;
  type: ChordType;
}

// Progression intent: how the progression should be used musically
export type ProgressionIntent = 'loop' | 'phrase' | 'turnaround' | 'cinematic' | 'vamp';

export interface Progression {
  chords: ChordInfo[];
  name: string;
  description: string;
  selectedChordIndex?: number; // Index of the originally selected chord in the progression
  intent?: ProgressionIntent; // Musical intent of the progression
  minLength?: number; // Minimum recommended length
  maxLength?: number; // Maximum recommended length
}

// Common progression patterns based on music theory
const PROGRESSION_PATTERNS = {
  // Major key progressions
  major: [
    {
      name: 'Pop Progression (I-V-vi-IV)',
      pattern: [0, 4, 5, 3], // Scale degrees
      types: ['major', 'major', 'minor', 'major'] as ChordType[],
      description: 'Classic pop/rock progression'
    },
    {
      name: 'Jazz Turnaround (I-vi-ii-V)',
      pattern: [0, 5, 1, 4],
      types: ['major7', 'minor7', 'minor7', 'dominant7'] as ChordType[],
      description: 'Classic jazz turnaround'
    },
    {
      name: 'Circle Progression (I-IV-vii°-iii-vi-ii-V-I)',
      pattern: [0, 3, 6, 2, 5, 1, 4],
      types: ['major', 'major', 'diminished', 'minor'] as ChordType[],
      description: 'Descending circle of fifths'
    },
    {
      name: '50s Progression (I-vi-IV-V)',
      pattern: [0, 5, 3, 4],
      types: ['major', 'minor', 'major', 'major'] as ChordType[],
      description: 'Classic 1950s doo-wop'
    }
  ],
  // Major key with borrowed chords
  majorBorrowed: [
    {
      name: 'Borrowed ♭VII (I-♭VII-IV-I)',
      pattern: [0, 6, 3, 0],
      types: ['major', 'major', 'major', 'major'] as ChordType[],
      alterations: [0, -1, 0, 0], // ♭VII is flattened
      description: 'Rock anthem progression with borrowed ♭VII'
    },
    {
      name: 'Borrowed iv (I-iv-I)',
      pattern: [0, 3, 0],
      types: ['major', 'minor', 'major'] as ChordType[],
      alterations: [0, 0, 0], // iv is minor instead of major
      description: 'Emotional minor iv in major key'
    },
    {
      name: 'Borrowed ♭VI-♭VII (I-♭VI-♭VII-I)',
      pattern: [0, 5, 6, 0],
      types: ['major', 'major', 'major', 'major'] as ChordType[],
      alterations: [0, -1, -1, 0],
      description: 'Epic cinematic progression'
    },
    {
      name: 'Mixed Borrowed (I-iv-♭VII-I)',
      pattern: [0, 3, 6, 0],
      types: ['major', 'minor', 'major', 'major'] as ChordType[],
      alterations: [0, 0, -1, 0],
      description: 'Modern pop with modal interchange'
    }
  ],
  // Minor key progressions
  minor: [
    {
      name: 'Minor Pop (i-VI-III-VII)',
      pattern: [0, 5, 2, 6],
      types: ['minor', 'major', 'major', 'major'] as ChordType[],
      description: 'Modern minor key progression'
    },
    {
      name: 'Minor Jazz (i-iv-V7-i)',
      pattern: [0, 3, 4],
      types: ['minor7', 'minor7', 'dominant7'] as ChordType[],
      description: 'Minor key jazz cadence'
    },
    {
      name: 'Andalusian (i-VII-VI-V)',
      pattern: [0, 6, 5, 4],
      types: ['minor', 'major', 'major', 'major'] as ChordType[],
      description: 'Flamenco-style descending progression'
    },
    {
      name: 'Minor ii-V-i',
      pattern: [1, 4, 0],
      types: ['diminished', 'dominant7', 'minor'] as ChordType[],
      description: 'Minor key turnaround'
    }
  ],
  // Minor key with borrowed chords
  minorBorrowed: [
    {
      name: 'Borrowed IV-V (i-IV-V)',
      pattern: [0, 3, 4],
      types: ['minor', 'major', 'major'] as ChordType[],
      alterations: [0, 0, 0], // IV and V are major (from major scale)
      description: 'Bright resolution with major IV and V'
    },
    {
      name: 'Borrowed I (i-I-♭VII)',
      pattern: [0, 0, 6],
      types: ['minor', 'major', 'major'] as ChordType[],
      alterations: [0, 0, 0], // I is major (Picardy third)
      description: 'Minor to major tonic shift'
    },
    {
      name: 'Mixed IV-V (i-IV-V-i)',
      pattern: [0, 3, 4, 0],
      types: ['minor', 'major', 'major', 'minor'] as ChordType[],
      alterations: [0, 0, 0, 0],
      description: 'Classic borrowed major subdominant and dominant'
    }
  ],
  // Secondary dominant progressions
  secondaryDominants: [
    {
      name: 'Secondary to vi (I-V7/vi-vi)',
      pattern: [0, -1, 5], // -1 indicates secondary dominant
      types: ['major', 'dominant7', 'minor'] as ChordType[],
      secondaryTarget: [null, 5, null], // V7 targets vi
      description: 'Tonicization of the relative minor'
    },
    {
      name: 'Secondary Chain (ii-V7/V-V-I)',
      pattern: [1, -1, 4, 0],
      types: ['minor7', 'dominant7', 'major', 'major'] as ChordType[],
      secondaryTarget: [null, 4, null, null], // V7/V targets V
      description: 'Double dominant resolution'
    },
    {
      name: 'Jazz ii-V with Secondary (I-V7/ii-ii-V-I)',
      pattern: [0, -1, 1, 4, 0],
      types: ['major7', 'dominant7', 'minor7', 'dominant7', 'major7'] as ChordType[],
      secondaryTarget: [null, 1, null, null, null], // V7/ii targets ii
      description: 'Enhanced turnaround with secondary dominant'
    },
    {
      name: 'Secondary to ii (I-V7/ii-ii-V)',
      pattern: [0, -1, 1, 4],
      types: ['major', 'dominant7', 'minor', 'major'] as ChordType[],
      secondaryTarget: [null, 1, null, null],
      description: 'Common secondary dominant approach'
    }
  ],
  // Modal progressions
  dorian: [
    {
      name: 'Dorian Vamp (i-IV)',
      pattern: [0, 3],
      types: ['minor7', 'major7'] as ChordType[],
      description: 'Characteristic Dorian sound - minor with major IV'
    },
    {
      name: 'Dorian Groove (i-IV-i-v)',
      pattern: [0, 3, 0, 4],
      types: ['minor7', 'major7', 'minor7', 'minor7'] as ChordType[],
      description: 'Funk/jazz Dorian progression'
    }
  ],
  mixolydian: [
    {
      name: 'Mixolydian Rock (I-♭VII-IV)',
      pattern: [0, 6, 3],
      types: ['major', 'major', 'major'] as ChordType[],
      description: 'Classic rock sound with ♭VII'
    },
    {
      name: 'Mixolydian Jam (I-♭VII-IV-I)',
      pattern: [0, 6, 3, 0],
      types: ['major7', 'major7', 'major7', 'major7'] as ChordType[],
      description: 'Extended Mixolydian vamp'
    }
  ],
  lydian: [
    {
      name: 'Lydian Bright (I-II)',
      pattern: [0, 1],
      types: ['major7', 'major7'] as ChordType[],
      description: 'Bright, dreamy Lydian sound'
    },
    {
      name: 'Lydian Ascent (I-II-V)',
      pattern: [0, 1, 4],
      types: ['major7', 'major7', 'major7'] as ChordType[],
      description: 'Film score favorite progression'
    }
  ],
  phrygian: [
    {
      name: 'Phrygian Dark (i-♭II)',
      pattern: [0, 1],
      types: ['minor', 'major'] as ChordType[],
      description: 'Spanish/metal characteristic sound'
    },
    {
      name: 'Phrygian Cadence (i-♭II-i)',
      pattern: [0, 1, 0],
      types: ['minor7', 'major7', 'minor7'] as ChordType[],
      description: 'Traditional Phrygian cadence'
    }
  ],
  // Tritone substitutions
  tritoneSubstitutions: [
    {
      name: 'Tritone Sub (ii-♭II7-I)',
      pattern: [1, -2, 0], // -2 indicates tritone sub
      types: ['minor7', 'dominant7', 'major7'] as ChordType[],
      tritoneSubTarget: [null, 4, null], // ♭II7 is tritone sub of V7
      description: 'Jazz tritone substitution of V7'
    },
    {
      name: 'Tritone Approach (I-♭II7-I)',
      pattern: [0, -2, 0],
      types: ['major7', 'dominant7', 'major7'] as ChordType[],
      tritoneSubTarget: [null, 4, null],
      description: 'Chromatic approach with tritone sub'
    },
    {
      name: 'Tritone Chain (iii-♭III7-ii-V)',
      pattern: [2, -2, 1, 4],
      types: ['minor7', 'dominant7', 'minor7', 'dominant7'] as ChordType[],
      tritoneSubTarget: [null, 1, null, null], // ♭III7 is tritone sub of V7/ii
      description: 'Multiple tritone substitutions'
    },
    {
      name: 'Tritone Resolution (vi-♭II7-I)',
      pattern: [5, -2, 0],
      types: ['minor7', 'dominant7', 'major7'] as ChordType[],
      tritoneSubTarget: [null, 4, null],
      description: 'Smooth tritone resolution'
    }
  ],
  // Blues progressions
  blues: [
    {
      name: '12-Bar Blues (I7-IV7-I7-V7)',
      pattern: [0, 3, 0, 4],
      types: ['dominant7', 'dominant7', 'dominant7', 'dominant7'] as ChordType[],
      description: 'Classic 12-bar blues progression'
    },
    {
      name: 'Quick Change Blues (I7-IV7-I7)',
      pattern: [0, 3, 0],
      types: ['dominant7', 'dominant7', 'dominant7'] as ChordType[],
      description: 'Blues with quick IV change'
    },
    {
      name: 'Minor Blues (i7-iv7-V7)',
      pattern: [0, 3, 4],
      types: ['minor7', 'minor7', 'dominant7'] as ChordType[],
      isMinorBlues: true,
      description: 'Minor blues progression'
    },
    {
      name: 'Blues Turnaround (I7-VI7-ii7-V7)',
      pattern: [0, 5, 1, 4],
      types: ['dominant7', 'dominant7', 'minor7', 'dominant7'] as ChordType[],
      description: 'Blues turnaround with chromatic movement'
    }
  ],
  // Gospel and Neo-Soul progressions
  gospel: [
    {
      name: 'Gospel Run (I-iii-vi-ii-V)',
      pattern: [0, 2, 5, 1, 4],
      types: ['major7', 'minor7', 'minor7', 'minor7', 'dominant7'] as ChordType[],
      description: 'Smooth gospel chord progression'
    },
    {
      name: 'Neo-Soul Color (I-♭III-IV-iv)',
      pattern: [0, 2, 3, 3],
      types: ['major9', 'major7', 'major9', 'minor9'] as ChordType[],
      alterations: [0, -1, 0, 0], // ♭III is borrowed
      description: 'Rich neo-soul harmony'
    },
    {
      name: 'Gospel Subdominant (IV-iv-I)',
      pattern: [3, 3, 0],
      types: ['major9', 'minor9', 'major9'] as ChordType[],
      alterations: [0, 0, 0], // iv is borrowed minor
      description: 'Emotional IV to iv movement'
    },
    {
      name: 'Gospel Extended (I-iii7-vi9-IV-V)',
      pattern: [0, 2, 5, 3, 4],
      types: ['major9', 'minor7', 'minor9', 'major9', 'dominant9'] as ChordType[],
      description: 'Extended gospel voicings'
    }
  ],
  // Pedal tone progressions (bass stays constant)
  pedalTone: [
    {
      name: 'Major Pedal (I-V/I-IV/I-I)',
      pattern: [0, 4, 3, 0],
      types: ['major', 'major', 'major', 'major'] as ChordType[],
      pedalTone: 0, // Bass stays on root
      description: 'Harmony over tonic pedal point'
    },
    {
      name: 'Minor Pedal (i-♭VII/i-IV/i)',
      pattern: [0, 6, 3],
      types: ['minor', 'major', 'major'] as ChordType[],
      pedalTone: 0,
      isMinorPedal: true,
      description: 'Minor key pedal tone progression'
    },
    {
      name: 'Drone Progression (I-ii/I-iii/I-IV/I)',
      pattern: [0, 1, 2, 3],
      types: ['major', 'minor', 'minor', 'major'] as ChordType[],
      pedalTone: 0,
      description: 'Ascending harmony over tonic drone'
    }
  ],
  // Descending bass line progressions
  descendingBass: [
    {
      name: 'Descending Major (I-Imaj7-I7-IV)',
      pattern: [0, 0, 0, 3],
      types: ['major', 'major7', 'dominant7', 'major'] as ChordType[],
      description: 'Classic descending bass line (chromatic)'
    },
    {
      name: 'Descending Minor (i-i(maj7)-i7-iv)',
      pattern: [0, 0, 0, 3],
      types: ['minor', 'minor', 'minor7', 'minor'] as ChordType[],
      isMinorDescending: true,
      description: 'Minor key descending bass'
    },
    {
      name: 'Jazz Descent (Imaj7-I7-IVmaj7-iv7)',
      pattern: [0, 0, 3, 3],
      types: ['major7', 'dominant7', 'major7', 'minor7'] as ChordType[],
      description: 'Jazz ballad descending line'
    }
  ],
  // Non-resolving loop progressions
  loopProgressions: [
    {
      name: 'Emotional Loop (vi-IV-I-V)',
      pattern: [5, 3, 0, 4],
      types: ['minor', 'major', 'major', 'major'] as ChordType[],
      description: 'Popular non-resolving loop'
    },
    {
      name: 'Minor Loop (i-VII-VI-VII)',
      pattern: [0, 6, 5, 6],
      types: ['minor', 'major', 'major', 'major'] as ChordType[],
      isMinorLoop: true,
      description: 'Dark looping progression'
    },
    {
      name: 'EDM Loop (I-V-IV-V)',
      pattern: [0, 4, 3, 4],
      types: ['major', 'major', 'major', 'major'] as ChordType[],
      description: 'Modern EDM loop without resolution'
    },
    {
      name: 'Ambient Loop (IV-I-V-vi)',
      pattern: [3, 0, 4, 5],
      types: ['major', 'major', 'major', 'minor'] as ChordType[],
      description: 'Atmospheric loop progression'
    }
  ],
  // ===== PHRASE PROGRESSIONS (5-8 chords) =====
  // These create narrative arcs instead of loops
  
  // Circle of Fifths progressions (7-8 chords)
  circleOfFifths: [
    {
      name: 'Full Circle of Fifths (I-IV-vii°-iii-vi-ii-V-I)',
      pattern: [0, 3, 6, 2, 5, 1, 4, 0],
      types: ['major7', 'major7', 'm7b5', 'minor7', 'minor7', 'minor7', 'dominant7', 'major7'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Complete descending circle of fifths'
    },
    {
      name: 'Jazz Circle (iii-vi-ii-V-I)',
      pattern: [2, 5, 1, 4, 0],
      types: ['minor7', 'minor7', 'minor7', 'dominant7', 'major7'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Last 5 chords of circle - feels complete'
    },
    {
      name: 'Extended Circle (vi-ii-V-I-IV-vii°-iii)',
      pattern: [5, 1, 4, 0, 3, 6, 2],
      types: ['minor7', 'minor7', 'dominant7', 'major7', 'major7', 'm7b5', 'minor7'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Circle segment with modulation potential'
    }
  ],
  // Extended turnarounds (5-6 chords)
  extendedTurnarounds: [
    {
      name: 'Extended Turnaround (I-iii-vi-ii-V-I)',
      pattern: [0, 2, 5, 1, 4, 0],
      types: ['major7', 'minor7', 'minor7', 'minor7', 'dominant7', 'major7'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Gospel/musical theater favorite'
    },
    {
      name: 'Pop Extended (I-V/vi-vi-IV-V-I)',
      pattern: [0, -1, 5, 3, 4, 0],
      types: ['major', 'dominant7', 'minor', 'major', 'major', 'major'] as ChordType[],
      secondaryTarget: [null, 5, null, null, null, null],
      intent: 'phrase' as const,
      description: 'Modern pop with secondary dominant'
    },
    {
      name: 'Gospel Walkup (I-iii7-vi9-ii7-V9-I)',
      pattern: [0, 2, 5, 1, 4, 0],
      types: ['major9', 'minor7', 'minor9', 'minor7', 'dominant9', 'major9'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Rich gospel harmony with extensions'
    },
    {
      name: 'Anime OST (I-vi-IV-ii-V-I)',
      pattern: [0, 5, 3, 1, 4, 0],
      types: ['major', 'minor', 'major', 'minor', 'major', 'major'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Feels inevitable and emotional'
    }
  ],
  // Extended descending bass lines (5-6 chords)
  extendedDescendingBass: [
    {
      name: 'Extended Descent (I-Imaj7-I7-IV-iv-I)',
      pattern: [0, 0, 0, 3, 3, 0],
      types: ['major', 'major7', 'dominant7', 'major', 'minor', 'major'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Classic chromatic descent with borrowed iv'
    },
    {
      name: 'Minor Extended (i-i(maj7)-i7-iv-V-i)',
      pattern: [0, 0, 0, 3, 4, 0],
      types: ['minor', 'minor', 'minor7', 'minor', 'major', 'minor'] as ChordType[],
      isMinorDescending: true,
      intent: 'phrase' as const,
      description: 'Minor descent with authentic cadence'
    },
    {
      name: 'Jazz Extended (Imaj7-I7-IVmaj7-iv7-iii7-vi7)',
      pattern: [0, 0, 3, 3, 2, 5],
      types: ['major7', 'dominant7', 'major7', 'minor7', 'minor7', 'minor7'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Jazz ballad with continuous motion'
    }
  ],
  // Extended blues (6-8 chords)
  extendedBlues: [
    {
      name: '12-Bar Blues Compressed (I7-IV7-I7-I7-IV7-IV7-I7-V7)',
      pattern: [0, 3, 0, 0, 3, 3, 0, 4],
      types: ['dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7', 'dominant7'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Full 12-bar blues in progression form'
    },
    {
      name: 'Blues Walkdown (I7-IV7-I7-VI7-ii7-V7)',
      pattern: [0, 3, 0, 5, 1, 4],
      types: ['dominant7', 'dominant7', 'dominant7', 'dominant7', 'minor7', 'dominant7'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Blues with chromatic walkdown'
    },
    {
      name: 'Extended Minor Blues (i7-iv7-i7-V7-iv7-i7-V7)',
      pattern: [0, 3, 0, 4, 3, 0, 4],
      types: ['minor7', 'minor7', 'minor7', 'dominant7', 'minor7', 'minor7', 'dominant7'] as ChordType[],
      isMinorBlues: true,
      intent: 'phrase' as const,
      description: 'Extended minor blues form'
    }
  ],
  // Gospel/Neo-soul walkups (5-7 chords)
  gospelWalkups: [
    {
      name: 'Full Gospel Run (I-iii-vi-ii-V-I)',
      pattern: [0, 2, 5, 1, 4, 0],
      types: ['major9', 'minor7', 'minor9', 'minor7', 'dominant9', 'major9'] as ChordType[],
      intent: 'phrase' as const,
      description: 'Complete gospel walkup with 9ths'
    },
    {
      name: 'Neo-Soul Extended (I-♭III-IV-iv-I)',
      pattern: [0, 2, 3, 3, 0],
      types: ['major9', 'major7', 'major9', 'minor9', 'major9'] as ChordType[],
      alterations: [0, -1, 0, 0, 0],
      intent: 'phrase' as const,
      description: 'Rich neo-soul with borrowed ♭III'
    },
    {
      name: 'Gospel Phrase (IV-iv-I-iii-vi-ii-V)',
      pattern: [3, 3, 0, 2, 5, 1, 4],
      types: ['major9', 'minor9', 'major9', 'minor7', 'minor9', 'minor7', 'dominant9'] as ChordType[],
      alterations: [0, 0, 0, 0, 0, 0, 0],
      intent: 'phrase' as const,
      description: 'Extended gospel phrase'
    },
    {
      name: 'Modern Gospel (I-vi-♭III-IV-iv-V-I)',
      pattern: [0, 5, 2, 3, 3, 4, 0],
      types: ['major9', 'minor9', 'major7', 'major9', 'minor9', 'dominant13', 'major9'] as ChordType[],
      alterations: [0, 0, -1, 0, 0, 0, 0],
      intent: 'phrase' as const,
      description: 'Modern R&B/gospel arc'
    }
  ],
  // Modal phrase progressions (5 chords)
  modalPhrases: [
    {
      name: 'Dorian Phrase (i-IV-i-v-IV)',
      pattern: [0, 3, 0, 4, 3],
      types: ['minor7', 'major7', 'minor7', 'minor7', 'major7'] as ChordType[],
      mode: 'dorian' as const,
      intent: 'phrase' as const,
      description: 'Dorian with natural resolution'
    },
    {
      name: 'Mixolydian Jam (I-♭VII-IV-I-♭VII)',
      pattern: [0, 6, 3, 0, 6],
      types: ['major7', 'major7', 'major7', 'major7', 'major7'] as ChordType[],
      mode: 'mixolydian' as const,
      intent: 'phrase' as const,
      description: 'Funk/jam band staple'
    },
    {
      name: 'Lydian Arc (I-II-V-IV-I)',
      pattern: [0, 1, 4, 3, 0],
      types: ['major7', 'major7', 'major7', 'major7', 'major7'] as ChordType[],
      mode: 'lydian' as const,
      intent: 'phrase' as const,
      description: 'Bright, cinematic Lydian phrase'
    },
    {
      name: 'Phrygian Phrase (i-♭II-♭VII-♭VI-i)',
      pattern: [0, 1, 6, 5, 0],
      types: ['minor7', 'major7', 'major7', 'major7', 'minor7'] as ChordType[],
      mode: 'phrygian' as const,
      intent: 'phrase' as const,
      description: 'Dark Spanish/metal arc'
    }
  ],
  // Cinematic/score-style progressions (6-8 chords)
  cinematicPhrases: [
    {
      name: 'Epic Minor (i-VI-III-VII-iv-V-i)',
      pattern: [0, 5, 2, 6, 3, 4, 0],
      types: ['minor', 'major', 'major', 'major', 'minor', 'major', 'minor'] as ChordType[],
      intent: 'cinematic' as const,
      description: 'Long emotional arc with delayed resolution'
    },
    {
      name: 'Cinematic Major (I-vi-IV-I-♭VII-IV-V)',
      pattern: [0, 5, 3, 0, 6, 3, 4],
      types: ['major', 'minor', 'major', 'major', 'major', 'major', 'major'] as ChordType[],
      alterations: [0, 0, 0, 0, -1, 0, 0],
      intent: 'cinematic' as const,
      description: 'Film score progression with borrowed ♭VII'
    },
    {
      name: 'Trailer Music (i-♭VII-♭VI-V-iv-i)',
      pattern: [0, 6, 5, 4, 3, 0],
      types: ['minor', 'major', 'major', 'major', 'minor', 'minor'] as ChordType[],
      intent: 'cinematic' as const,
      description: 'Powerful trailer-style progression'
    },
    {
      name: 'Ambient Score (IV-I-vi-iii-IV-V-I)',
      pattern: [3, 0, 5, 2, 3, 4, 0],
      types: ['major', 'major', 'minor', 'minor', 'major', 'major', 'major'] as ChordType[],
      intent: 'cinematic' as const,
      description: 'Floating, atmospheric progression'
    },
    {
      name: 'Heroic Arc (I-V-vi-IV-I-♭VII-I)',
      pattern: [0, 4, 5, 3, 0, 6, 0],
      types: ['major', 'major', 'minor', 'major', 'major', 'major', 'major'] as ChordType[],
      alterations: [0, 0, 0, 0, 0, -1, 0],
      intent: 'cinematic' as const,
      description: 'Triumphant journey and return'
    }
  ]
};

// Secondary dominants and borrowed chords are now implemented directly in PROGRESSION_PATTERNS
/* These interfaces document the structure for reference
interface SecondaryDominant {
  degree: number;           // Scale degree being tonicized
  semitoneOffset: number;   // Semitones from root to secondary dominant root
  type: ChordType;
  symbol: string;           // Roman numeral notation
}

interface BorrowedChord {
  degree: number;           // Scale degree in original key
  alteration: number;       // Semitone alteration (-1 for flat, +1 for sharp)
  type: ChordType;
  fromMode: Mode;
  description: string;
} */

// Notes in chromatic order
const CHROMATIC_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Scale intervals (semitones from root)
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];          // Ionian
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];          // Aeolian (natural minor)
const DORIAN_SCALE = [0, 2, 3, 5, 7, 9, 10];         // Dorian mode
const PHRYGIAN_SCALE = [0, 1, 3, 5, 7, 8, 10];       // Phrygian mode
const LYDIAN_SCALE = [0, 2, 4, 6, 7, 9, 11];         // Lydian mode
const MIXOLYDIAN_SCALE = [0, 2, 4, 5, 7, 9, 10];     // Mixolydian mode

export type Mode = 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian';

// Map mode to scale intervals
const MODE_SCALES: { [key in Mode]: number[] } = {
  major: MAJOR_SCALE,
  minor: MINOR_SCALE,
  dorian: DORIAN_SCALE,
  phrygian: PHRYGIAN_SCALE,
  lydian: LYDIAN_SCALE,
  mixolydian: MIXOLYDIAN_SCALE
};

/**
 * Normalize note name (convert flats to sharps)
 */
function normalizeNote(note: string): string {
  const flatToSharp: { [key: string]: string } = {
    'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#'
  };
  return flatToSharp[note] || note;
}

/**
 * Get note at a specific scale degree (0-6)
 * Scale degrees: 0=I, 1=ii, 2=iii, 3=IV, 4=V, 5=vi, 6=vii
 */
function getNoteAtDegree(rootNote: string, degree: number, isMinor: boolean): string {
  const normalizedRoot = normalizeNote(rootNote);
  const rootIndex = CHROMATIC_NOTES.indexOf(normalizedRoot);
  
  if (rootIndex === -1) return rootNote;
  
  const scale = isMinor ? MINOR_SCALE : MAJOR_SCALE;
  const semitones = scale[degree % 7];
  const noteIndex = (rootIndex + semitones) % 12;
  
  return CHROMATIC_NOTES[noteIndex];
}

/**
 * Get note at a specific scale degree with mode support
 */
function getNoteAtDegreeInMode(rootNote: string, degree: number, mode: Mode): string {
  const normalizedRoot = normalizeNote(rootNote);
  const rootIndex = CHROMATIC_NOTES.indexOf(normalizedRoot);
  
  if (rootIndex === -1) return rootNote;
  
  const scale = MODE_SCALES[mode];
  const semitones = scale[degree % 7];
  const noteIndex = (rootIndex + semitones) % 12;
  
  return CHROMATIC_NOTES[noteIndex];
}

/**
 * Get note with alteration (for borrowed chords)
 */
function getNoteWithAlteration(rootNote: string, degree: number, alteration: number, mode: Mode): string {
  const baseNote = getNoteAtDegreeInMode(rootNote, degree, mode);
  if (alteration === 0) return baseNote;
  
  const baseIndex = CHROMATIC_NOTES.indexOf(baseNote);
  if (baseIndex === -1) return baseNote;
  
  const alteredIndex = (baseIndex + alteration + 12) % 12;
  return CHROMATIC_NOTES[alteredIndex];
}

/**
 * Get note at a specific number of semitones from root
 */
function getNoteAtSemitones(rootNote: string, semitones: number): string {
  const normalizedRoot = normalizeNote(rootNote);
  const rootIndex = CHROMATIC_NOTES.indexOf(normalizedRoot);
  
  if (rootIndex === -1) return rootNote;
  
  const noteIndex = (rootIndex + semitones) % 12;
  return CHROMATIC_NOTES[noteIndex];
}

/**
 * Determine if a chord is likely in a major or minor context
 */
function determineKeyContext(chord: ChordInfo): { isMinor: boolean; key: string; mode: Mode } {
  const minorChordTypes: ChordType[] = ['minor', 'minor7', 'minor9', 'minor11', 'minor13'];
  const isMinor = minorChordTypes.includes(chord.type);
  
  return {
    isMinor,
    key: chord.root,
    mode: isMinor ? 'minor' : 'major'
  };
}

/**
 * Build a chord from a progression pattern with support for alterations, secondary dominants, and tritone subs
 */
function buildChordFromPattern(
  rootNote: string,
  degree: number,
  type: ChordType,
  mode: Mode,
  alteration: number = 0,
  isSecondary: boolean = false,
  secondaryTarget: number | null = null,
  isTritoneSubstitution: boolean = false,
  tritoneSubTarget: number | null = null
): ChordInfo {
  let chordRoot: string;
  
  if (isTritoneSubstitution && tritoneSubTarget !== null) {
    // Tritone substitution: find the original dominant, then move +6 semitones (tritone away)
    const targetNote = getNoteAtDegreeInMode(rootNote, tritoneSubTarget, mode);
    const targetIndex = CHROMATIC_NOTES.indexOf(targetNote);
    const dominantIndex = (targetIndex + 7) % 12; // Original dominant (up a P5)
    const tritoneIndex = (dominantIndex + 6) % 12; // Tritone away (+6 semitones)
    chordRoot = CHROMATIC_NOTES[tritoneIndex];
  } else if (isSecondary && secondaryTarget !== null) {
    // Secondary dominant: find the target note and go up a P5 (7 semitones)
    const targetNote = getNoteAtDegreeInMode(rootNote, secondaryTarget, mode);
    const targetIndex = CHROMATIC_NOTES.indexOf(targetNote);
    const dominantIndex = (targetIndex + 7) % 12; // Up a perfect 5th
    chordRoot = CHROMATIC_NOTES[dominantIndex];
  } else {
    // Regular chord with possible alteration
    chordRoot = getNoteWithAlteration(rootNote, degree, alteration, mode);
  }
  
  return { root: chordRoot, type };
}

/**
 * Generate a complementary chord progression based on the selected chord
 * Randomly selects from all available progression types including 5-8 chord phrases
 */
export function generateChordProgression(selectedChord: ChordInfo, complexity: 'simple' | 'jazz' = 'simple'): Progression {
  const context = determineKeyContext(selectedChord);
  
  // Build complete pattern pool based on complexity
  const basicPatterns = [
    ...(context.isMinor ? PROGRESSION_PATTERNS.minor : PROGRESSION_PATTERNS.major),
    ...(context.isMinor ? PROGRESSION_PATTERNS.minorBorrowed : PROGRESSION_PATTERNS.majorBorrowed),
    ...PROGRESSION_PATTERNS.loopProgressions,
  ];
  
  const intermediatePatterns = [
    ...PROGRESSION_PATTERNS.blues,
    ...PROGRESSION_PATTERNS.gospel,
    ...PROGRESSION_PATTERNS.pedalTone,
    ...PROGRESSION_PATTERNS.descendingBass,
    // Add modal vamps (shorter 2-3 chord modal patterns)
    ...(context.isMinor ? [...PROGRESSION_PATTERNS.dorian, ...PROGRESSION_PATTERNS.phrygian] 
                        : [...PROGRESSION_PATTERNS.mixolydian, ...PROGRESSION_PATTERNS.lydian]),
  ];
  
  const advancedPatterns = [
    ...PROGRESSION_PATTERNS.secondaryDominants,
    ...PROGRESSION_PATTERNS.tritoneSubstitutions,
    ...PROGRESSION_PATTERNS.extendedTurnarounds,
    ...PROGRESSION_PATTERNS.circleOfFifths,
  ];
  
  const phrasePatterns = [
    ...PROGRESSION_PATTERNS.gospelWalkups,
    ...PROGRESSION_PATTERNS.extendedBlues,
    ...PROGRESSION_PATTERNS.extendedDescendingBass,
    ...PROGRESSION_PATTERNS.modalPhrases,
    ...PROGRESSION_PATTERNS.cinematicPhrases,
  ];
  
  // Select pattern pool based on complexity
  let patternPool;
  if (complexity === 'jazz') {
    // Jazz gets everything, weighted toward advanced and phrase progressions
    patternPool = [
      ...basicPatterns,
      ...intermediatePatterns,
      ...advancedPatterns,
      ...advancedPatterns, // Double weight for advanced
      ...phrasePatterns,
      ...phrasePatterns, // Double weight for phrases
    ];
  } else {
    // Simple gets basic + intermediate + some phrases for variety
    patternPool = [
      ...basicPatterns,
      ...basicPatterns, // Double weight for basic
      ...intermediatePatterns,
      ...phrasePatterns.slice(0, Math.ceil(phrasePatterns.length / 2)), // Half of phrase patterns
    ];
  }
  
  // Randomly select a pattern
  const randomIndex = Math.floor(Math.random() * patternPool.length);
  const chosenPattern = patternPool[randomIndex];
  
  // Generate chords based on pattern type
  const chords: ChordInfo[] = chosenPattern.pattern.map((degree, index) => {
    const alteration = (chosenPattern as any).alterations?.[index] || 0;
    const isSecondary = degree === -1;
    const secondaryTarget = (chosenPattern as any).secondaryTarget?.[index] || null;
    const isTritone = degree === -2;
    const tritoneTarget = (chosenPattern as any).tritoneSubTarget?.[index] || null;
    const actualDegree = (isSecondary || isTritone) ? 0 : degree;
    const modalMode = (chosenPattern as any).mode || context.mode;
    const isMinorBlues = (chosenPattern as any).isMinorBlues || false;
    const isMinorDescending = (chosenPattern as any).isMinorDescending || false;
    const isMinorPedal = (chosenPattern as any).isMinorPedal || false;
    const isMinorLoop = (chosenPattern as any).isMinorLoop || false;
    
    // Determine mode for this chord
    let effectiveMode = context.mode;
    if (modalMode !== context.mode) {
      effectiveMode = modalMode;
    } else if (isMinorBlues || isMinorDescending || isMinorPedal || isMinorLoop) {
      effectiveMode = 'minor';
    }
    
    return buildChordFromPattern(
      context.key,
      actualDegree,
      chosenPattern.types[index],
      effectiveMode,
      alteration,
      isSecondary,
      secondaryTarget,
      isTritone,
      tritoneTarget
    );
  });
  
  // For loops/vamps, keep 3-4 chords. For phrases/cinematic, use full length (5-8 chords)
  const intent = (chosenPattern as any).intent || 'loop';
  const progressionLength = (intent === 'loop' || intent === 'vamp' || intent === 'turnaround') 
    ? Math.min(4, chords.length) 
    : chords.length; // Use full length for phrases and cinematic
  
  return {
    chords: chords.slice(0, progressionLength),
    name: chosenPattern.name,
    description: chosenPattern.description,
    intent: intent,
    minLength: (chosenPattern as any).minLength,
    maxLength: (chosenPattern as any).maxLength
  };
}

/**
 * Generate multiple progression options
 */
export function generateProgressionOptions(selectedChord: ChordInfo): Progression[] {
  const context = determineKeyContext(selectedChord);
  const progressions: Progression[] = [];
  
  // Basic progressions
  const basicPatterns = context.isMinor ? PROGRESSION_PATTERNS.minor : PROGRESSION_PATTERNS.major;
  basicPatterns.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const root = getNoteAtDegree(context.key, degree, context.isMinor);
      const type = pattern.types[index] || pattern.types[0];
      return { root, type };
    });
    
    const progressionLength = Math.min(4, chords.length);
    progressions.push({
      chords: chords.slice(0, progressionLength),
      name: pattern.name,
      description: pattern.description,
      intent: 'loop'
    });
  });
  
  // Borrowed chord progressions
  const borrowedPatterns = context.isMinor ? PROGRESSION_PATTERNS.minorBorrowed : PROGRESSION_PATTERNS.majorBorrowed;
  borrowedPatterns.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const alteration = (pattern as any).alterations?.[index] || 0;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        context.mode,
        alteration,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords: chords.slice(0, 4),
      name: pattern.name,
      description: pattern.description,
      intent: 'loop'
    });
  });
  
  // Modal progressions (add some variety)
  if (!context.isMinor) {
    // Add Mixolydian progressions to major keys
    PROGRESSION_PATTERNS.mixolydian.forEach(pattern => {
      const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
        return buildChordFromPattern(
          context.key,
          degree,
          pattern.types[index],
          'mixolydian',
          0,
          false,
          null,
          false,
          null
        );
      });
      
      progressions.push({
        chords,
        name: pattern.name,
        description: pattern.description,
        intent: 'vamp'
      });
    });
    
    // Add Lydian progressions
    PROGRESSION_PATTERNS.lydian.forEach(pattern => {
      const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
        return buildChordFromPattern(
          context.key,
          degree,
          pattern.types[index],
          'lydian',
          0,
          false,
          null,
          false,
          null
        );
      });
      
      progressions.push({
        chords,
        name: pattern.name,
        description: pattern.description,
        intent: 'vamp'
      });
    });
  } else {
    // Add Dorian progressions to minor keys
    PROGRESSION_PATTERNS.dorian.forEach(pattern => {
      const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
        return buildChordFromPattern(
          context.key,
          degree,
          pattern.types[index],
          'dorian',
          0,
          false,
          null,
          false,
          null
        );
      });
      
      progressions.push({
        chords,
        name: pattern.name,
        description: pattern.description,
        intent: 'vamp'
      });
    });
    
    // Add Phrygian progressions
    PROGRESSION_PATTERNS.phrygian.forEach(pattern => {
      const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
        return buildChordFromPattern(
          context.key,
          degree,
          pattern.types[index],
          'phrygian',
          0,
          false,
          null,
          false,
          null
        );
      });
      
      progressions.push({
        chords,
        name: pattern.name,
        description: pattern.description,
        intent: 'vamp'
      });
    });
  }
  
  // Secondary dominant progressions
  PROGRESSION_PATTERNS.secondaryDominants.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const isSecondary = degree === -1;
      const secondaryTarget = (pattern as any).secondaryTarget?.[index] || null;
      const actualDegree = isSecondary ? 0 : degree; // Placeholder, will be computed
      
      return buildChordFromPattern(
        context.key,
        actualDegree,
        pattern.types[index],
        context.mode,
        0,
        isSecondary,
        secondaryTarget,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'turnaround'
    });
  });
  
  // Tritone substitution progressions
  PROGRESSION_PATTERNS.tritoneSubstitutions.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const isTritone = degree === -2;
      const tritoneTarget = (pattern as any).tritoneSubTarget?.[index] || null;
      const actualDegree = isTritone ? 0 : degree;
      
      return buildChordFromPattern(
        context.key,
        actualDegree,
        pattern.types[index],
        context.mode,
        0,
        false,
        null,
        isTritone,
        tritoneTarget
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'turnaround'
    });
  });
  
  // Blues progressions
  PROGRESSION_PATTERNS.blues.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const isMinorBlues = (pattern as any).isMinorBlues || false;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        isMinorBlues ? 'minor' : context.mode,
        0,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'loop'
    });
  });
  
  // Gospel and neo-soul progressions
  PROGRESSION_PATTERNS.gospel.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const alteration = (pattern as any).alterations?.[index] || 0;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        context.mode,
        alteration,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'loop'
    });
  });
  
  // Pedal tone progressions
  PROGRESSION_PATTERNS.pedalTone.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const isMinorPedal = (pattern as any).isMinorPedal || false;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        isMinorPedal ? 'minor' : context.mode,
        0,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'vamp'
    });
  });
  
  // Descending bass line progressions
  PROGRESSION_PATTERNS.descendingBass.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const isMinorDescending = (pattern as any).isMinorDescending || false;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        isMinorDescending ? 'minor' : context.mode,
        0,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'loop'
    });
  });
  
  // Non-resolving loop progressions
  PROGRESSION_PATTERNS.loopProgressions.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const isMinorLoop = (pattern as any).isMinorLoop || false;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        isMinorLoop ? 'minor' : context.mode,
        0,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'loop'
    });
  });
  
  // ===== PHRASE PROGRESSIONS (5-8 chords) =====
  
  // Circle of Fifths progressions
  PROGRESSION_PATTERNS.circleOfFifths.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        context.mode,
        0,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'phrase',
      minLength: 5,
      maxLength: 8
    });
  });
  
  // Extended turnarounds
  PROGRESSION_PATTERNS.extendedTurnarounds.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const isSecondary = degree === -1;
      const secondaryTarget = (pattern as any).secondaryTarget?.[index] || null;
      const actualDegree = isSecondary ? 0 : degree;
      
      return buildChordFromPattern(
        context.key,
        actualDegree,
        pattern.types[index],
        context.mode,
        0,
        isSecondary,
        secondaryTarget,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'turnaround',
      minLength: 5,
      maxLength: 6
    });
  });
  
  // Extended descending bass lines
  PROGRESSION_PATTERNS.extendedDescendingBass.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const isMinorDescending = (pattern as any).isMinorDescending || false;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        isMinorDescending ? 'minor' : context.mode,
        0,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'phrase',
      minLength: 5,
      maxLength: 6
    });
  });
  
  // Extended blues progressions
  PROGRESSION_PATTERNS.extendedBlues.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const isMinorBlues = (pattern as any).isMinorBlues || false;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        isMinorBlues ? 'minor' : context.mode,
        0,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'phrase',
      minLength: 6,
      maxLength: 8
    });
  });
  
  // Gospel/Neo-soul walkups
  PROGRESSION_PATTERNS.gospelWalkups.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const alteration = (pattern as any).alterations?.[index] || 0;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        context.mode,
        alteration,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'phrase',
      minLength: 5,
      maxLength: 7
    });
  });
  
  // Modal phrase progressions
  PROGRESSION_PATTERNS.modalPhrases.forEach(pattern => {
    const modalMode = (pattern as any).mode || context.mode;
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        modalMode,
        0,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'phrase',
      minLength: 5,
      maxLength: 5
    });
  });
  
  // Cinematic phrase progressions
  PROGRESSION_PATTERNS.cinematicPhrases.forEach(pattern => {
    const chords: ChordInfo[] = pattern.pattern.map((degree, index) => {
      const alteration = (pattern as any).alterations?.[index] || 0;
      return buildChordFromPattern(
        context.key,
        degree,
        pattern.types[index],
        context.mode,
        alteration,
        false,
        null,
        false,
        null
      );
    });
    
    progressions.push({
      chords,
      name: pattern.name,
      description: pattern.description,
      intent: 'cinematic',
      minLength: 6,
      maxLength: 8
    });
  });
  
  return progressions;
}

/**
 * Determine if a chord type should use extended voicings (7ths, 9ths, etc.)
 */
function shouldUseExtensions(chordType: ChordType): boolean {
  return chordType.includes('7') || 
         chordType.includes('9') || 
         chordType.includes('11') || 
         chordType.includes('13') ||
         chordType.includes('6');
}

/**
 * Get appropriate chord type for a scale degree based on the selected chord's extensions
 */
function getChordTypeForDegree(
  degree: number, 
  isMinorKey: boolean, 
  useExtensions: boolean
): ChordType {
  // Scale degree chord qualities
  if (isMinorKey) {
    // Natural minor: i, ii°, III, iv, v, VI, VII
    const qualities = ['minor', 'diminished', 'major', 'minor', 'minor', 'major', 'major'];
    const baseType = qualities[degree] as ChordType;
    
    if (useExtensions) {
      if (baseType === 'minor') return 'minor7';
      if (baseType === 'major') return 'major7';
      if (baseType === 'diminished') return 'diminished7';
    }
    return baseType;
  } else {
    // Major: I, ii, iii, IV, V, vi, vii°
    const qualities = ['major', 'minor', 'minor', 'major', 'major', 'minor', 'diminished'];
    const baseType = qualities[degree] as ChordType;
    
    if (useExtensions) {
      if (baseType === 'minor') return 'minor7';
      if (baseType === 'major' && degree !== 4) return 'major7'; // I, IV get maj7
      if (baseType === 'major' && degree === 4) return 'dominant7'; // V gets dom7
      if (baseType === 'diminished') return 'm7b5'; // vii° gets half-diminished
    }
    return baseType;
  }
}

/**
 * Generate progression patterns where the selected chord can appear at different positions
 */
function generateProgressionVariants(selectedChord: ChordInfo): Progression[] {
  const normalizedRoot = normalizeNote(selectedChord.root);
  const progressions: Progression[] = [];

  // Analyze chord type
  const isDominant = selectedChord.type.includes('dominant') || selectedChord.type === 'dominant7';
  const isDiminished = selectedChord.type.includes('diminished');
  const isExtended = selectedChord.type.includes('9') || selectedChord.type.includes('11') || selectedChord.type.includes('13');
  const isMajor = selectedChord.type === 'major' || selectedChord.type === 'major7';
  const isMinor = selectedChord.type === 'minor' || selectedChord.type === 'minor7';
  
  // Check if selected chord uses extensions (7ths, 9ths, etc.)
  const useExtensions = shouldUseExtensions(selectedChord.type);

  if (isDominant) {
    // V7 can appear in different positions
    // For a dominant chord, find its tonic (up a P4/down a P5 = +5 semitones in chromatic)
    const tonicRoot = getNoteAtSemitones(normalizedRoot, 5);
    
    // Dominant chords are already extended, so use true for extensions
    const domUseExtensions = true;
    
    // Classic ii-V7-I (V7 in middle)
    progressions.push({
      chords: [
        { root: getNoteAtDegree(tonicRoot, 1, false), type: getChordTypeForDegree(1, false, domUseExtensions) }, // ii7
        selectedChord,                                                   // V7
        { root: tonicRoot, type: getChordTypeForDegree(0, false, domUseExtensions) }  // Imaj7
      ],
      name: 'ii-V7-I Turnaround',
      description: 'Classic jazz cadence',
      selectedChordIndex: 1
    });

    // I-vi-ii-V7 (V7 at end)
    progressions.push({
      chords: [
        { root: tonicRoot, type: getChordTypeForDegree(0, false, domUseExtensions) },                             // Imaj7
        { root: getNoteAtDegree(tonicRoot, 5, false), type: getChordTypeForDegree(5, false, domUseExtensions) },  // vi7
        { root: getNoteAtDegree(tonicRoot, 1, false), type: getChordTypeForDegree(1, false, domUseExtensions) },  // ii7
        selectedChord                                                     // V7
      ],
      name: 'I-vi-ii-V7',
      description: 'Building tension to dominant',
      selectedChordIndex: 3
    });

  } else if (isDiminished) {
    // Diminished as passing chord (middle position)
    const rootIndex = CHROMATIC_NOTES.indexOf(normalizedRoot);
    const prevRoot = CHROMATIC_NOTES[(rootIndex - 1 + 12) % 12];
    const nextRoot = CHROMATIC_NOTES[(rootIndex + 1) % 12];

    progressions.push({
      chords: [
        { root: prevRoot, type: useExtensions ? 'major7' : 'major' },
        selectedChord,
        { root: nextRoot, type: useExtensions ? 'minor7' : 'minor' }
      ],
      name: 'Chromatic Passing',
      description: 'Diminished connects chromatically',
      selectedChordIndex: 1
    });

  } else if (isMajor) {
    // Major chord - various positions in progressions
    
    // 1. I-V-vi-IV (Pop progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) },  // V
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, useExtensions) },  // vi
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) }   // IV
      ],
      name: 'I-V-vi-IV',
      description: 'Popular progression',
      selectedChordIndex: 0
    });

    // NEW: Borrowed chord progressions for major keys
    // I-♭VII-IV (Mixolydian flavor)
    const flatSeven = buildChordFromPattern(normalizedRoot, 6, useExtensions ? 'major7' : 'major', 'major', -1, false, null, false, null);
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        flatSeven,                                                      // ♭VII
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) }   // IV
      ],
      name: 'I-♭VII-IV (Borrowed)',
      description: 'Rock anthem with borrowed ♭VII',
      selectedChordIndex: 0
    });

    // I-iv-I (Borrowed minor iv)
    const minorFour: ChordInfo = { root: getNoteAtDegree(normalizedRoot, 3, false), type: (useExtensions ? 'minor7' : 'minor') as ChordType };
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        minorFour,                                                      // iv (borrowed)
        selectedChord                                                   // I
      ],
      name: 'I-iv-I (Borrowed)',
      description: 'Emotional minor subdominant',
      selectedChordIndex: 0
    });

    // I-♭VI-♭VII-I (Epic progression)
    const flatSix = buildChordFromPattern(normalizedRoot, 5, useExtensions ? 'major7' : 'major', 'major', -1, false, null, false, null);
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        flatSix,                                                        // ♭VI
        flatSeven,                                                      // ♭VII
        selectedChord                                                   // I
      ],
      name: 'I-♭VI-♭VII-I (Borrowed)',
      description: 'Cinematic borrowed chord progression',
      selectedChordIndex: 0
    });

    // NEW: Secondary dominant progressions
    // I-V7/vi-vi
    const fiveOfSix = buildChordFromPattern(normalizedRoot, 0, 'dominant7', 'major', 0, true, 5, false, null);
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        fiveOfSix,                                                      // V7/vi
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, useExtensions) }   // vi
      ],
      name: 'I-V7/vi-vi (Secondary)',
      description: 'Tonicization of relative minor',
      selectedChordIndex: 0
    });

    // I-V7/ii-ii-V
    const fiveOfTwo = buildChordFromPattern(normalizedRoot, 0, 'dominant7', 'major', 0, true, 1, false, null);
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        fiveOfTwo,                                                      // V7/ii
        { root: getNoteAtDegree(normalizedRoot, 1, false), type: getChordTypeForDegree(1, false, useExtensions) },  // ii
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-V7/ii-ii-V (Secondary)',
      description: 'Enhanced turnaround',
      selectedChordIndex: 0
    });

    // NEW: Tritone substitution progressions
    // I-♭II7-I (Tritone sub of V7)
    const tritoneSub = buildChordFromPattern(normalizedRoot, 0, 'dominant7', 'major', 0, false, null, true, 4);
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        tritoneSub,                                                     // ♭II7 (tritone sub of V7)
        selectedChord                                                   // I
      ],
      name: 'I-♭II7-I (Tritone)',
      description: 'Jazz tritone substitution',
      selectedChordIndex: 0
    });

    // 2. I-vi-IV-V (50s progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, useExtensions) },  // vi
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) },  // IV
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-vi-IV-V',
      description: 'Classic 1950s progression',
      selectedChordIndex: 0
    });

    // 3. I-IV-I-V (Rock progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) },  // IV
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-IV-I-V',
      description: 'Rock/blues progression',
      selectedChordIndex: 0
    });

    // 4. I-vi-ii-V (Jazz turnaround)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, useExtensions) },  // vi
        { root: getNoteAtDegree(normalizedRoot, 1, false), type: getChordTypeForDegree(1, false, useExtensions) },  // ii
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-vi-ii-V',
      description: 'Jazz turnaround',
      selectedChordIndex: 0
    });

    // 5. I-IV-V-I (Classic rock)
    const tonicRoot = getNoteAtSemitones(normalizedRoot, 7);
    progressions.push({
      chords: [
        { root: tonicRoot, type: getChordTypeForDegree(0, false, useExtensions) },                         // I
        selectedChord,                                                                                      // IV
        { root: getNoteAtDegree(tonicRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) },  // V
        { root: tonicRoot, type: getChordTypeForDegree(0, false, useExtensions) }                          // I
      ],
      name: 'I-IV-V-I',
      description: 'Classic subdominant movement',
      selectedChordIndex: 1
    });

    // 6. I-iii-IV-V (Ascending progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 2, false), type: getChordTypeForDegree(2, false, useExtensions) },  // iii
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) },  // IV
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-iii-IV-V',
      description: 'Ascending progression',
      selectedChordIndex: 0
    });

    // NEW: Modal progressions for major chords
    // I-II-V (Lydian)
    const lydianTwo = buildChordFromPattern(normalizedRoot, 1, useExtensions ? 'major7' : 'major', 'lydian', 0, false, null, false, null);
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        lydianTwo,                                                      // II (Lydian)
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) }   // V
      ],
      name: 'I-II-V (Lydian)',
      description: 'Bright Lydian sound',
      selectedChordIndex: 0
    });

    // I-♭VII-IV-I (Mixolydian)
    const mixFlatSeven = buildChordFromPattern(normalizedRoot, 6, useExtensions ? 'major7' : 'major', 'mixolydian', 0, false, null, false, null);
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        mixFlatSeven,                                                   // ♭VII (Mixolydian)
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) },  // IV
        selectedChord                                                   // I
      ],
      name: 'I-♭VII-IV-I (Mixolydian)',
      description: 'Rock/jam modal progression',
      selectedChordIndex: 0
    });

    // NEW: Extended phrase progressions (5-6 chords)
    // Extended turnaround: I-iii-vi-ii-V-I
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 2, false), type: getChordTypeForDegree(2, false, useExtensions) },  // iii
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, useExtensions) },  // vi
        { root: getNoteAtDegree(normalizedRoot, 1, false), type: getChordTypeForDegree(1, false, useExtensions) },  // ii
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) },  // V
        selectedChord                                                   // I
      ],
      name: 'Extended Turnaround (I-iii-vi-ii-V-I)',
      description: 'Gospel/musical theater phrase',
      selectedChordIndex: 0,
      intent: 'phrase'
    });

    // Epic arc: I-V-vi-IV-I-♭VII-I
    const epicFlatSeven = buildChordFromPattern(normalizedRoot, 6, useExtensions ? 'major7' : 'major', 'major', -1, false, null, false, null);
    progressions.push({
      chords: [
        selectedChord,                                                  // I
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) },  // V
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, useExtensions) },  // vi
        { root: getNoteAtDegree(normalizedRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) },  // IV
        selectedChord,                                                  // I
        epicFlatSeven,                                                  // ♭VII
        selectedChord                                                   // I
      ],
      name: 'Heroic Arc (I-V-vi-IV-I-♭VII-I)',
      description: 'Triumphant cinematic journey',
      selectedChordIndex: 0,
      intent: 'cinematic'
    });

  } else if (isMinor) {
    // Minor chord progressions

    // 1. i-VI-VII-i (Natural minor)
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 5, true), type: getChordTypeForDegree(5, true, useExtensions) },  // VI
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) },  // VII
        selectedChord                                                   // i
      ],
      name: 'i-VI-VII-i',
      description: 'Minor key progression',
      selectedChordIndex: 0
    });

    // NEW: Borrowed chord progressions for minor keys
    // i-IV-V (Borrowed from major)
    const majorFour: ChordInfo = { root: getNoteAtDegree(normalizedRoot, 3, true), type: (useExtensions ? 'major7' : 'major') as ChordType };
    const majorFive: ChordInfo = { root: getNoteAtDegree(normalizedRoot, 4, true), type: (useExtensions ? 'dominant7' : 'major') as ChordType };
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        majorFour,                                                      // IV (borrowed from major)
        majorFive                                                       // V (borrowed from major)
      ],
      name: 'i-IV-V (Borrowed)',
      description: 'Bright resolution with borrowed major chords',
      selectedChordIndex: 0
    });

    // i-I-♭VII (Picardy third variation)
    const majorTonic: ChordInfo = { root: normalizedRoot, type: (useExtensions ? 'major7' : 'major') as ChordType };
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        majorTonic,                                                     // I (borrowed)
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) }   // ♭VII
      ],
      name: 'i-I-♭VII (Borrowed)',
      description: 'Minor-major tonic shift',
      selectedChordIndex: 0
    });

    // NEW: Modal minor progressions
    // i-IV-i (Dorian)
    const dorianFour = buildChordFromPattern(normalizedRoot, 3, useExtensions ? 'major7' : 'major', 'dorian', 0, false, null, false, null);
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        dorianFour,                                                     // IV (Dorian)
        selectedChord                                                   // i
      ],
      name: 'i-IV-i (Dorian)',
      description: 'Dorian mode characteristic progression',
      selectedChordIndex: 0
    });

    // i-♭II-i (Phrygian)
    const phrygianTwo = buildChordFromPattern(normalizedRoot, 1, useExtensions ? 'major7' : 'major', 'phrygian', 0, false, null, false, null);
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        phrygianTwo,                                                    // ♭II (Phrygian)
        selectedChord                                                   // i
      ],
      name: 'i-♭II-i (Phrygian)',
      description: 'Dark Spanish/metal sound',
      selectedChordIndex: 0
    });

    // NEW: Extended phrase progressions (5-7 chords) for minor
    // Epic minor arc: i-VI-III-VII-iv-V-i
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 5, true), type: getChordTypeForDegree(5, true, useExtensions) },  // VI
        { root: getNoteAtDegree(normalizedRoot, 2, true), type: getChordTypeForDegree(2, true, useExtensions) },  // III
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) },  // VII
        { root: getNoteAtDegree(normalizedRoot, 3, true), type: getChordTypeForDegree(3, true, useExtensions) },  // iv
        { root: getNoteAtDegree(normalizedRoot, 4, true), type: getChordTypeForDegree(4, true, useExtensions) },  // V
        selectedChord                                                   // i
      ],
      name: 'Epic Minor Arc (i-VI-III-VII-iv-V-i)',
      description: 'Long emotional arc with delayed resolution',
      selectedChordIndex: 0,
      intent: 'cinematic'
    });

    // Extended descending: i-i(maj7)-i7-iv-V-i
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: normalizedRoot, type: 'minor' as ChordType },          // i(maj7) - simplified
        { root: normalizedRoot, type: 'minor7' as ChordType },         // i7
        { root: getNoteAtDegree(normalizedRoot, 3, true), type: getChordTypeForDegree(3, true, useExtensions) },  // iv
        { root: getNoteAtDegree(normalizedRoot, 4, true), type: getChordTypeForDegree(4, true, useExtensions) },  // V
        selectedChord                                                   // i
      ],
      name: 'Extended Descent (i-i(maj7)-i7-iv-V-i)',
      description: 'Minor descent with authentic cadence',
      selectedChordIndex: 0,
      intent: 'phrase'
    });

    // 2. Andalusian cadence - i-VII-VI-V
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) },  // VII
        { root: getNoteAtDegree(normalizedRoot, 5, true), type: getChordTypeForDegree(5, true, useExtensions) },  // VI
        { root: getNoteAtDegree(normalizedRoot, 4, true), type: getChordTypeForDegree(4, true, useExtensions) }   // V
      ],
      name: 'Andalusian (i-VII-VI-V)',
      description: 'Flamenco-style descending progression',
      selectedChordIndex: 0
    });

    // 3. Minor pop - i-VI-III-VII
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 5, true), type: getChordTypeForDegree(5, true, useExtensions) },  // VI
        { root: getNoteAtDegree(normalizedRoot, 2, true), type: getChordTypeForDegree(2, true, useExtensions) },  // III
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) }   // VII
      ],
      name: 'Minor Pop (i-VI-III-VII)',
      description: 'Modern minor key progression',
      selectedChordIndex: 0
    });

    // 4. Minor jazz - i-iv-V7-i (V7 always uses dominant7 for resolution)
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 3, true), type: getChordTypeForDegree(3, true, useExtensions) },  // iv
        { root: getNoteAtDegree(normalizedRoot, 4, true), type: 'dominant7' },  // V7 (always dom7)
        selectedChord                                                   // i
      ],
      name: 'Minor Jazz (i-iv-V7-i)',
      description: 'Minor key jazz cadence',
      selectedChordIndex: 0
    });

    // 5. i-iv-VII-III (Dorian progression)
    progressions.push({
      chords: [
        selectedChord,                                                  // i
        { root: getNoteAtDegree(normalizedRoot, 3, true), type: getChordTypeForDegree(3, true, useExtensions) },  // iv
        { root: getNoteAtDegree(normalizedRoot, 6, true), type: getChordTypeForDegree(6, true, useExtensions) },  // VII
        { root: getNoteAtDegree(normalizedRoot, 2, true), type: getChordTypeForDegree(2, true, useExtensions) }   // III
      ],
      name: 'i-iv-VII-III',
      description: 'Dorian minor progression',
      selectedChordIndex: 0
    });

    // 6. As vi in major key (relative major is up a minor 3rd = 3 semitones)
    const majorKeyRoot = getNoteAtSemitones(normalizedRoot, 3);
    progressions.push({
      chords: [
        { root: majorKeyRoot, type: getChordTypeForDegree(0, false, useExtensions) },                          // I
        { root: getNoteAtDegree(majorKeyRoot, 4, false), type: getChordTypeForDegree(4, false, useExtensions) },  // V
        selectedChord,                                                                                          // vi
        { root: getNoteAtDegree(majorKeyRoot, 3, false), type: getChordTypeForDegree(3, false, useExtensions) }   // IV
      ],
      name: 'I-V-vi-IV',
      description: 'Minor as relative vi',
      selectedChordIndex: 2
    });

  } else if (isExtended || selectedChord.type.includes('7')) {
    // Extended/7th chords - always use extensions
    const extUseExtensions = true;
    progressions.push({
      chords: [
        selectedChord,                                                  // I (or whatever the selected chord is)
        { root: getNoteAtDegree(normalizedRoot, 5, false), type: getChordTypeForDegree(5, false, extUseExtensions) },  // vi7
        { root: getNoteAtDegree(normalizedRoot, 4, false), type: getChordTypeForDegree(4, false, extUseExtensions) },  // V7
        selectedChord                                                   // Back to selected chord
      ],
      name: 'Extended Harmony',
      description: 'Rich jazz voicings',
      selectedChordIndex: 0
    });
  }

  // Default fallback
  if (progressions.length === 0) {
    const prog = generateChordProgression(selectedChord, 'simple');
    prog.selectedChordIndex = 0;
    progressions.push(prog);
  }

  return progressions;
}

/**
 * Generate a progression that works with any chord type (advanced logic)
 * Now includes full pool of progressions including 5-8 chord phrases
 */
export function generateUniversalProgression(selectedChord: ChordInfo): Progression {
  // 70% chance: Use chord-positioned variants (selected chord appears in specific position)
  // 30% chance: Use pattern-based progressions (includes all phrase progressions)
  const useVariants = Math.random() < 0.7;
  
  if (useVariants) {
    // Use generateProgressionVariants (selected chord positioned in progression)
    const variants = generateProgressionVariants(selectedChord);
    const randomIndex = Math.floor(Math.random() * variants.length);
    const selectedProgression = variants[randomIndex];
    
    // Respect the intent - don't truncate phrase/cinematic progressions
    const intent = selectedProgression.intent || 'loop';
    
    // Only truncate for loops, vamps, and turnarounds
    if (intent === 'loop' || intent === 'vamp' || intent === 'turnaround') {
      return {
        ...selectedProgression,
        chords: selectedProgression.chords.slice(0, 4)
      };
    }
    
    return selectedProgression;
  } else {
    // Use pattern-based generation (includes all phrase progressions, 5-8 chords)
    // Randomly choose complexity to get variety
    const complexity = Math.random() < 0.5 ? 'simple' : 'jazz';
    const progression = generateChordProgression(selectedChord, complexity);
    
    // Don't set selectedChordIndex since chord may not appear in pattern-based progressions
    return progression;
  }
}
