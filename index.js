const constraints = { audio: true, video: false };

navigator.mediaDevices.getUserMedia(constraints)
.then(function(stream) {
    console.log('got the stream!!');
})
.catch(function(error) {
    console.log('got an erorr!', error)
});
