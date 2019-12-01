const constraints = { audio: true, video: false };

let width, height, eighth;
let canvas, canvasContext, audioContext;
let playing = false;
let count = -3;
let offset = -1;

let fps = 60;
let then = Date.now();
let interval = 1000/fps;
let delta;
let input = null;
let analyser = null;
let tempo = 1;
let microphoneAllowed = false;

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

function startPlaying() {
    // Get the current time
    let now = Date.now();

    // Wait until the next second to start playing
    let nextSecond = 1000 - (now % 1000);

    setTimeout(function() {
        playing = true;
        requestAnimationFrame(animate);
    }, nextSecond);
}

function animate() {
    if(playing) {
        requestAnimationFrame(animate);

        let now = Date.now();
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
    // We want the measures to move at a rate of the tempo
    // Each measure is an eighth of the screen
    // Every frame we have to move one eighth of the screen width divided by the number of frames per second times the tempo
    const distance = (eighth / fps) * tempo;
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
    canvasContext.fillRect(centerWidth, centerHeight - 1, 3 * tempo, volume);
    canvasContext.fillRect(centerWidth, centerHeight + 1, 3 * tempo, volume * -1);
}


function microphoneSuccess(stream) {
    analyser = audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;

    input = audioContext.createMediaStreamSource(stream);
    input.connect(analyser);

    microphoneAllowed = true;

    startPlaying();
}

function microphoneError(error) {
    microphoneAllowed = false;
    console.error('Oh no...', error);
}

function averageVolume(array) {
    const length = array.length;
    let volume = 0;

    for(let i = 0; i < length; i++) {
        volume += array[i];
    }

    return volume / length;
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
        if(microphoneAllowed) {
            startPlaying();
        } else {
            audioContext = new AudioContext();

            navigator.mediaDevices.getUserMedia(constraints)
            .then(microphoneSuccess)
            .catch(microphoneError);
        }
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

    $('input.tempo').on('input', function() {
        const beatsPerMinute = $(this).value();

        // Divide the tempo by 60 to get the number of beats per minute
        tempo = beatsPerMinute / 60;
        $('span.tempo').text(beatsPerMinute);
    });
});
