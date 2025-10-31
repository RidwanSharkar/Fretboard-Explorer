# Fretboard Explorer
Interactive react app designed for guitarists who want to explore music theory and chords along with their corresponding finger-positions across the fretboard.

**LINK: https://ridwansharkar.github.io/Fretboard-Explorer/**

## Overview:

- The program takes user input for a chord, key, or chord progression and computes all possible fingerings across the fretboard.

- MIDI integration allows users to hear the exact chord displayed on the screen.

![Fretboardx](https://github.com/user-attachments/assets/c3515850-8987-48e9-89f7-4e2d84e0c55b)

---

## Usage: 
- Row 1 chord name buttons will display all the notes across the fretboard that the chord consists of. At this point, the user may specify chord qualities such as including 7th or 9th notes before pressing the 'Find' button in the right-hand column.   

- Row 2 buttons under the chord names will play a random chord of the key's scale degree to explore quick relationships, while the 'Next', 'Prev', and 'Play' buttons on the right-hand column may be used to manually search a chord shape or voicing.

![image](https://github.com/user-attachments/assets/44774bcd-434e-4faf-bea0-37ddf467547b)

---

## Design:

- An array of all of the notes in the western scale [A, A#, B, C, C#, D, D#, E, F, F#, G, G#] are iterated through to extract the correct notes from the appropriate chord formula. For instance, the C Major chord consists of 1-3-5, or C-E-G, and will be highlighted upon user selection.

- Each chord belongs to a set of chords: [ I ii iii IV V VI Vii ] that form a 'key', all twelve of which are implemented as buttons on the Circle of Fifths for the user to explore.

- Once chord notes are displayed, an algorithm will determine which combinations of these available notes within the selected chord can be considered a "valid chord", meaning that they are actually physically playable on the guitar in real life. This involves eliminating the possibility of more than one note per string, or that no 2 notes be 5 frets apart (for instance, depending on the length of your fingers). Various chord customization parameters, such as "no open notes", or "don't skip strings" are available as well.

![image](https://github.com/user-attachments/assets/ae259107-9a44-4978-a5e8-812b6b81cd02)
