const constraints = { audio: true, video: false };
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
let width, height;
let source, canvas, canvasContext;
let bufferLength, dataArray;
let rollingAverage = 0;
const averageData = [];
let strums = 0;
let timeout = false;

function microphoneSuccess(stream) {
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    canvas = $('canvas').el[0];
    canvasContext = canvas.getContext("2d");

    analyser.fftSize = 4096;
    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    draw();
}

function microphoneError(error) {
    console.error('Oh no...', error);
}

function averageVolume() {
    const length = dataArray.length;
    let values = 0;
    let i = 0;

    // Loop over the values of the array, and count them
    for (; i < length; i++) {
        values += dataArray[i];
    }

    // Return the avarag
    return values / length;
}

function getRollingAverage() {
    if(averageData.length > 10) {
        averageData.shift();
    }

    let total = 0;

    averageData.forEach(function(average) {
        total += average;
    });

    rollingAverage = total /  averageData.length;
}

function draw() {
//    analyser.getByteTimeDomainData(dataArray);
    analyser.getByteFrequencyData(dataArray);
    let currentAverage = averageVolume();

    if(currentAverage > rollingAverage + 5) {
        if(!timeout) {
            strums++;

            $('.average').text(strums.toString());

            timeout = setTimeout(function() {
                timeout = false;
            }, 200);
        }
    }

    averageData.push(currentAverage);
    getRollingAverage();

    canvasContext.fillStyle = '#fff';
    canvasContext.fillRect(0, 0, width, height);
    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = '#000';

    canvasContext.beginPath();
    var sliceWidth = width / bufferLength;
    var x = 0;

    for(var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128;
        var y = height - 10 - (v * height / 2);

        if(i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
    };

    canvasContext.lineTo(canvas.width, height);
    canvasContext.stroke();

    requestAnimationFrame(draw);
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

    $('.reset').on('click', function() {
        strums = 0;
        $('.average').text(strums.toString());
    });
});
