const constraints = { audio: true, video: false };
let analyser, input;
let microphoneAllowed = false;
let playing = false;
let lastBeat = false;
let count = -4;

function startPlaying() {
    // Get the current time
    let now = Date.now();

    // Wait until the next second to start playing
    let nextSecond = 1000 - (now % 1000);

    setTimeout(function() {
        playing = true;
        drawBeat();
        requestAnimationFrame(animate);
    }, nextSecond);
}

function animate() {
    if(playing) {
        let now = Date.now();

        // Only draw one beat per second
        if(now - lastBeat > 1000) {
            drawBeat();
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

    lastBeat = Date.now();
}

function drawWaveform() {
    //
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
    $('.start').on('click', function() {
        startPlaying();
        /*
        if(microphoneAllowed) {
            startPlaying();
        } else {
            audioContext = new AudioContext();

            navigator.mediaDevices.getUserMedia(constraints)
            .then(microphoneSuccess)
            .catch(microphoneError);
        }
        */
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
