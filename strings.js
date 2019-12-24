const notes = [
    'A',
    'A♯',
    'B',
    'C',
    'C♯',
    'D',
    'D♯',
    'E',
    'F',
    'F♯',
    'G',
    'G♯',
];

// Standard tuning
// Todo - Make this dynamic
const strings = [
    'E',
    'A',
    'D',
    'G',
    'B',
    'E',
];

function generateNotes(startingNote) {
    let stringElement = $('.string.template').el[0].cloneNode();
    $(stringElement).append('<span class="note">' + startingNote + '</span>');

    for(let count = 1; count <= 24; count++) {
        let currentNote = (notes.indexOf(startingNote) + count) % notes.length;

        $(stringElement).append('<span class="note">' + notes[currentNote] + '</span>');
    }

    $(stringElement).removeClass('template');
    $('.notes').append(stringElement);
}

$(document).ready(() => {
    strings.forEach((string) => {
        console.log('generating', string);
        generateNotes(string);
    });
});
