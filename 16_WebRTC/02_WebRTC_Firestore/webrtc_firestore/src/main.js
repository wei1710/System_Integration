import './style.css'

// Import the functions you need from the SDKs you need
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAkoW7MNksybhtut-h5tcEqLxihBmoJVWs",
  authDomain: "webrtc-20a35.firebaseapp.com",
  projectId: "webrtc-20a35",
  storageBucket: "webrtc-20a35.firebasestorage.app",
  messagingSenderId: "806615866516",
  appId: "1:806615866516:web:d9e06f5c38d7c5bba0a881"
};

const app = firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

// Initialize Firebase
firestore.collection("webrtc");


//html elements

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");


//global state 
const GLOBAL_CALL_ID = "GLOBAL_CALL_ID";
let localStream;
let remoteStream;
let peerConnection;

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
      ],
    },
  ],
};

async function startCall() {
  // Firestore
  const callDocument = firestore.collection('calls').doc(GLOBAL_CALL_ID);
  const offerCandidates = callDocument.collection('offerCandidates');
  const answerCandidates = callDocument.collection('answerCandidates');

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
  localVideo.srcObject = localStream;

  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  peerConnection = new RTCPeerConnection(servers);

  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
  };

  peerConnection.onicecandidate = (event) => {
    event.candidate && offerCandidates.add(event.candidate.toJSON());
  };

  const offerDescription = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offerDescription);

  await callDocument.set({ offer: { sdp: offerDescription.sdp, type: offerDescription.type } });

  callDocument.onSnapshot((snapshot) => {
    const data = snapshot.data();
    if (!peerConnection.currentRemoteDescription && data?.answer) {
      const answerDescription = new RTCSessionDescription(data.answer);
      peerConnection.setRemoteDescription(answerDescription);
    }
  });

  answerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const candidate = new RTCIceCandidate(change.doc.data());
        if (peerConnection.remoteDescription) {
          peerConnection.addIceCandidate(candidate);
        }
      }
    });
  });
  
}

async function answerCall() {
  const callDocument = firestore.collection("calls").doc(GLOBAL_CALL_ID);
  const offerCandidates = callDocument.collection("offerCandidates");
  const answerCandidates = callDocument.collection("answerCandidates");

  peerConnection = new RTCPeerConnection(servers);

  peerConnection.onicecandidate = (event) => {
    event.candidate && answerCandidates.add(event.candidate.toJSON());
  };

  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;

  remoteStream = new MediaStream();
  remoteVideo.srcObject = remoteStream;

  localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

  peerConnection.ontrack = (event) => {
    event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
  };

  const callSnapshot = await callDocument.get();
  if (!callSnapshot.exists || !callSnapshot.data()?.offer) {
    console.error("No offer found.");
    return;
  }

  await peerConnection.setRemoteDescription(new RTCSessionDescription(callSnapshot.data().offer));

  const answerDescription = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answerDescription);
  await callDocument.update({ answer: { type: answerDescription.type, sdp: answerDescription.sdp } });

  offerCandidates.onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        peerConnection.addIceCandidate(new RTCIceCandidate(change.doc.data()));
      }
    });
  });
}

document.getElementById("start-call").addEventListener("click", startCall);
document.getElementById("answer-call").addEventListener("click", answerCall);