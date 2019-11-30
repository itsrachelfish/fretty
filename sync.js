const constraints = { audio: true, video: false };
const audioContext = new AudioContext();

let width, height, eighth;
let canvas, canvasContext;
let playing = false;
let count = -3;
let offset = -1;

let fps = 60;
let now;
var then = Date.now();
let interval = 1000/fps;
let delta;
let input = null;
let analyser = null;

function initialize() {
    eighth = width / 8;
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
    if(playing) {
        requestAnimationFrame(animate);

        now = Date.now();
        delta = now - then;

        if(delta > interval) {
            slide();
            drawBeats();
            drawWaveform();

            then = now - (delta % interval);
        }
    }
}

function slide() {
    // We want the measures to move at a rate of one beat per second
    // Each measure is an eighth of the screen
    // Every frame we have to move one eighth of the screen width divided by the number of frames per second
    const distance = eighth / fps;
    const imageData = canvasContext.getImageData(distance, 0, canvasContext.canvas.width - distance, canvasContext.canvas.height);
    canvasContext.putImageData(imageData, 0, 0);
    canvasContext.clearRect(canvasContext.canvas.width - distance, 0, distance, canvasContext.canvas.height);

    offset += distance;
}

function drawBeats() {
    if(offset > eighth) {
        let position = width - 1;

        canvasContext.beginPath();
        canvasContext.moveTo(position, 0);
        canvasContext.lineTo(position, height);
        canvasContext.stroke();

        offset = 0;
        count++;

        $('.count').text(count.toString());
    }
}

function drawWaveform() {
    const audioData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(audioData);

    const volume = averageVolume(audioData) * 10;
    const centerWidth = width / 2;
    const centerHeight = height / 2;

    // Draw a box at the center of the screen
    canvasContext.fillRect(centerWidth, centerHeight - 1, 3, volume);
    canvasContext.fillRect(centerWidth, centerHeight + 1, 3, volume * -1);
}


function microphoneSuccess(stream) {
    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    input = audioContext.createMediaStreamSource(stream);
    input.connect(analyser);
}

function microphoneError(error) {
    console.error('Oh no...', error);
}

function averageVolume(array) {
    const length = array.length;
    let volume = 0;

    for(let i = 0; i < length; i++) {
        volume += array[i];
    }

    // Return the avarag
    return volume / length;
}

$(document).ready(() => {
    canvas = $('canvas').el[0];
    canvasContext = canvas.getContext("2d");

    width = canvas.offsetWidth;
    height = canvas.offsetHeight;

    canvasContext.canvas.width = width;
    canvasContext.canvas.height = height;

    navigator.mediaDevices.getUserMedia(constraints)
    .then(microphoneSuccess)
    .catch(microphoneError);

    initialize();

    $('.start').on('click', function() {
        playing = true;
        requestAnimationFrame(animate);
    });

    $('.stop').on('click', function() {
        playing = false;
        cancelAnimationFrame(animate);
    });

    $('.reset').on('click', function() {
        count = -3;
        offset = -1;

        $('.count').text(count.toString());
        initialize();
    });
});
