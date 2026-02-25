// Import required libraries
const io = require('socket.io-client');

// Initialize Socket.IO client
const socket = io('http://localhost:3000');

// Create a new WebRTC peer connection
const peerConnection = new RTCPeerConnection();

// Handle ice candidates
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        // Send the ice candidate to the remote peer
        socket.emit('ice-candidate', event.candidate);
    }
};

// Handle remote stream
peerConnection.ontrack = (event) => {
    const remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = event.streams[0];
};

// Join a room
const joinRoom = (roomId) => {
    socket.emit('join', roomId);
};

// Create offer
socket.on('join', async (data) => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
});

// Handle offer
socket.on('offer', async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

// Handle answer
socket.on('answer', (answer) => {
    peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Handle incoming ice candidates
socket.on('ice-candidate', (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Call joinRoom with the desired room ID
joinRoom('myRoom');