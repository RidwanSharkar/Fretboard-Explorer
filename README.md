**Fretboard Explorer**

________________________________________________________________________________________________________________


![image](https://github.com/user-attachments/assets/a525c10c-324b-4832-bb84-d2d52cb60875)

________________________________________________________________________________________________________________

OVERVIEW:

• Fretboard Explorer is designed for guitarists who want to explore music theory and chord progressions, and their corresponding finger-positions across the fretboard.

• The program takes user input for a chord, key, or chord progression and computes all possible fingerings across the fretboard.

• Users can specify detailed chord qualities including major, minor, diminished, augmented, and extended chords such as 7th, 9th, and more.

• Fretboard supports specification of chord criteria (e.g. skipping strings for voicing) or modifications to match user preferences for finger patterns.

• MIDI integration allows users to hear the exact chord displayed on the screen and throughout the generated chord progression. Randomly generated chord progressions that the user likes can be saved for future use.

![image](https://github.com/user-attachments/assets/8d7e77fb-0a6b-46e4-a4fd-fe15c00a5eca)

________________________________________________________________________________________________________________

[IMPLEMENTATION 1] INTRACTIVE FRETBOARD FOR MUSIC THEORY EXPLORATION

• An array of all of the notes in the western scale [A, A#, B, C, C#, D, D#, E, F, F#, G, G#] are iterated through to extract the correct notes from the appropriate chord formula. For instance, the C Major chord consists of 1-3-5, or C-E-G, and will be highlighted upon user selection.

• Each chord belongs to a set of chords: [ I ii iii IV V VI Vii ] that form a 'key', all twelve of which are implemented as buttons on the Circle of Fifths for the user to explore.

• Once chord notes are displayed, an algorithm will determine which combinations of these available notes within the selected chord can be considered a "valid chord", meaning that they are actually physically playable on the guitar in real life. This involves eliminating the possibility of more than one note per string, or that no 2 notes be 5 frets apart (for instance, depending on the length of your fingers). Various chord customization parameters, such as "no open notes", or "don't skip strings" are available as well.
