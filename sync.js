let width, height;
let canvas, canvasContext;
let playing = false;
let count = 0;
let delta = -1;

function initialize() {
    let eighth = width / 8;
    canvasContext.clearRect(0, 0, width, height);

    for(let beat = 4; beat <= 8; beat++) {
        let position = (beat * eighth) - 1;

        canvasContext.beginPath();
        canvasContext.moveTo(position, 0);
        canvasContext.lineTo(position, height);
        canvasContext.stroke();
    }
}

function animate() {
    slide();
    drawBeats();
    drawWaveform();

    if(playing) {
        requestAnimationFrame(animate);
    }
}

function slide() {
    let imageData = canvasContext.getImageData(1, 0, canvasContext.canvas.width-1, canvasContext.canvas.height);
    canvasContext.putImageData(imageData, 0, 0);
    canvasContext.clearRect(canvasContext.canvas.width-1, 0, 1, canvasContext.canvas.height);

    delta++;
}

function drawBeats() {
    let eighth = width / 8;

    if(delta > eighth) {
        let position = width - 1;

        canvasContext.beginPath();
        canvasContext.moveTo(position, 0);
        canvasContext.lineTo(position, height);
        canvasContext.stroke();

        delta = 0;
    }
}

function drawWaveform() {

}

$(document).ready(() => {
    canvas = $('canvas').el[0];
    canvasContext = canvas.getContext("2d");

    width = canvas.offsetWidth;
    height = canvas.offsetHeight;

    canvasContext.canvas.width = width;
    canvasContext.canvas.height = height;

    initialize();

    $('.start').on('click', function() {
        playing = true;
        requestAnimationFrame(animate);
    });

    $('.stop').on('click', function() {
        playing = false;
    });

    $('.reset').on('click', function() {
        count = 0;
        delta = -1;

        $('.count').text(count.toString());
        initialize();
    });
});
