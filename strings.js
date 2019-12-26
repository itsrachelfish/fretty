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

const dots = [
    3, 5, 7, 9, 12, 15, 17
];

function generateDots() {
    let string = $('.string.template').el[0].cloneNode();
    let width = 8;

    for(let count = 0; count <= 19; count++) {
        let note = $('.note.template').el[0].cloneNode();
        $(note).removeClass('template');

        if(count > 0) {
            $(note).style({'width': `${width}%`});
            width -= 6 / 19;


            if(dots.indexOf(count) !== -1) {
                if(count === 12) {
                    $(note).text('● ●');
                } else {
                    $(note).text('●');
                }
            }
        }

        $(string).append(note);
    }

    $(string).removeClass('template');
    $('.notes').append(string);
}

function generateNotes(startingNote) {
    let string = $('.string.template').el[0].cloneNode();
    let width = 8;

    for(let count = 0; count <= 19; count++) {
        let note = $('.note.template').el[0].cloneNode();
        let currentNote = (notes.indexOf(startingNote) + count) % notes.length;

        $(note).removeClass('template');
        $(note).text(notes[currentNote]);
        $(note).attr('note', notes[currentNote]);

        if(count > 0) {
            $(note).style({'width': `${width}%`});
            width -= 6 / 19;
        }

        $(string).append(note);
    }

    $(string).removeClass('template');
    $('.notes').append(string);
}

$(document).ready(() => {
    generateDots();

    strings.forEach((string) => {
        console.log('generating', string);
        generateNotes(string);
    });

    $('.note').on('mouseenter', function() {
        let note = $(this).attr('note');

        $('.note').removeClass('hover');
        $(`[note=${note}]`).addClass('hover');
    });

    $('.note').on('mouseleave', function() {
        $('.note').removeClass('hover');
    });

    $('.note').on('click', function() {
        let note = $(this).attr('note');

        if($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $(this).addClass('active');
        }
    });
});
