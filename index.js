const constraints = { audio: true, video: false };
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
const width = 800;
const height = 800;
let source, canvas, canvasContext;

function microphoneSuccess(stream) {
    source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    canvas = $('canvas').el[0];
    canvasContext = canvas.getContext("2d");

    analyser.fftSize = 2048;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    draw(bufferLength, dataArray);
}

function microphoneError(error) {
    console.error('Oh no...', error);
}

function draw(bufferLength, dataArray) {
    analyser.getByteTimeDomainData(dataArray);

    canvasContext.fillStyle = '#fff';
    canvasContext.fillRect(0, 0, width, height);
    canvasContext.lineWidth = 2;
    canvasContext.strokeStyle = '#000';

    canvasContext.beginPath();
    var sliceWidth = width / bufferLength;
    var x = 0;

    for(var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128;
        var y = v * height / 2;

        if(i === 0) {
            canvasContext.moveTo(x, y);
        } else {
            canvasContext.lineTo(x, y);
        }

        x += sliceWidth;
    };

    canvasContext.lineTo(canvas.width, canvas.height / 2);
    canvasContext.stroke();

    requestAnimationFrame(() => {
        draw(bufferLength, dataArray);
    });
}

$(document).ready(() => {
    navigator.mediaDevices.getUserMedia(constraints)
    .then(microphoneSuccess)
    .catch(microphoneError);
});
