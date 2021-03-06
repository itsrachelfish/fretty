const constraints = { audio: true, video: false };

let canvas, canvasContext, audioContext;
let count = -3;
let beats = [];
let waveform = [];
let microphoneAllowed = false;
let tempo = 1;

function initialize() {
    canvas = $('canvas').el[0];
    canvasContext = canvas.getContext("2d");
    canvasContext.canvas.width = canvas.offsetWidth;
    canvasContext.canvas.height = canvas.offsetHeight;

    // Clear out any previous data
    beats = [];
    waveform = [];

    let eighth = canvas.width / 8;
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    for(let beat = 1; beat <= 8; beat++) {
        let position = beat * eighth;

        beats.push({
            x: position,
        });
    }

    MainLoop.setBegin(input).setUpdate(update).setDraw(draw).setEnd(done);
}

function input() {
    const audioData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(audioData);

    const volume = averageVolume(audioData) * 10;

    waveform.push({
        x: (canvas.width / 2) + (4 * tempo),
        y: (canvas.height / 2) - (volume / 2),
        volume: volume,
    });

    // Determine how many slices there are in half of the screen size
    const spaceAvailable = Math.floor((canvas.width / 2) / (4 * tempo));

    if(waveform.length >= spaceAvailable) {
        waveform = waveform.slice(waveform.length - spaceAvailable);
    }
}

function update(delta) {
    // Determine the distance we should move based on the tempo
    let distance = ((canvas.width / 8) / 1000) * tempo;

    beats.forEach(function(beat, index) {
        let newPosition = beat.x - (distance * delta);

        // The beats have to wrap around once they reach the edge of the screen
        if(newPosition <= 0) {
            newPosition = canvas.width + newPosition;
            count++;
        }

        beats[index] = {
            x: newPosition,
        };
    });

    waveform.forEach(function(slice, index) {
        waveform[index].x = slice.x - (distance * delta);
    });
}

function draw() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);

    // Loop through the waveform and draw it
    canvasContext.beginPath();
    let reverseWaveform = [];

    waveform.forEach(function(slice, index) {
        if(index === 1) {
            canvasContext.moveTo(slice.x, slice.y);
        }

        canvasContext.lineTo(slice.x, slice.y);
        reverseWaveform.unshift(slice);
    });

    // Draw the bottom half of the waveform
    reverseWaveform.forEach(function(slice, index) {
        canvasContext.lineTo(slice.x, slice.y + slice.volume);
    });

    canvasContext.fillStyle = "#dd9896";
    canvasContext.fill();

    // Loop through beats and draw them
    beats.forEach(function(beat) {
        canvasContext.beginPath();
        canvasContext.moveTo(beat.x, 0);
        canvasContext.lineTo(beat.x, canvas.height);
        canvasContext.stroke();
    });
}

function done(fps) {
    $('.fps').text(Math.round(fps).toString());
    $('.count').text(count.toString());
}

function microphoneSuccess(stream) {
    analyser = audioContext.createAnalyser();
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

function startPlaying() {
    // Get the current time
    let now = Date.now();

    // Wait until the next second to start playing
    let nextSecond = 1000 - (now % 1000);

    setTimeout(function() {
        MainLoop.start();
    }, nextSecond);
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
    initialize();
    draw();

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
        MainLoop.stop();
    });

    $('.reset').on('click', function() {
        count = -3;

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
