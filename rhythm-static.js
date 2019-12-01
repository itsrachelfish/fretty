const constraints = { audio: true, video: false };
let analyser, input;
let microphoneAllowed = false;
let playing = false;
let count = -4;
let scheduledBeat = false;
let scheduledAverage = false;
let bars = [];
let volumes = [];
let then = Date.now();

function initialize() {
    // We only need half the screen width since the waveform is only drawn from the middle
    let width = $(window).width() / 2;

    // Divide it into 4 px chunks
    for(let i = 1; i < width; i += 5) {
        let wave = $('section.templates .wave').el[0].cloneNode();
        wave.style['transform'] = `translateX(${i}px)`;

        $('section.waveform').el[0].appendChild(wave);
        bars.unshift(wave);
    }
}

function inDuration(duration, callback) {
    // Get the current time
    let now = Date.now();

    // Wait until the start of the next duration
    let waitUntil = duration - (now % duration);

    return setTimeout(callback, waitUntil);
}

function startPlaying() {
    inDuration(1000, function() {
        playing = true;
        drawBeat();
        requestAnimationFrame(animate);
    });
}

function animate() {
    if(playing) {
        if(!scheduledBeat) {
            scheduledBeat = inDuration(1000, function() {
                drawBeat();
            });
        }

        let now = Date.now();

        if(now - then >= 1000 / bars.length) {
            getAverage();
        }

        requestAnimationFrame(animate);
    }
}


function drawBeat() {
    let bar = $('section.templates .bar').el[0].cloneNode();

    bar.addEventListener('animationend', function() {
        $(this).remove();
    });

    $('section.background').el[0].appendChild(bar);

    count++;
    $('.count').text(count.toString());

    scheduledBeat = false;
}

function getAverage() {
    const audioData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(audioData);

    const volume = averageVolume(audioData) * 10;
    volumes.unshift(volume);

    if(volumes.length > bars.length) {
        volumes.pop();
    }

    renderWaveform();
    then = Date.now();
}

function renderWaveform() {
    volumes.forEach(function(volume, index) {
        bars[index].style['height'] = `${volume}px`;
    });
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
        count = -4;

        $('.count').text(count.toString());
        initialize();
    });
});
