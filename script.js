import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const enterBtn = document.getElementById('enter-btn');
const videoContainer = document.getElementById('video-container');
const revealVideo = document.getElementById('reveal-video'); // The Beach Reveal
const webcam = document.getElementById("webcam");
const cursor = document.getElementById("virtual-cursor");

// We need to create a reference for the Chef Intro video
let chefIntroVideo; 

let handLandmarker;
let lastVideoTime = -1;

async function initMediaPipe() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1
    });
}
initMediaPipe();

// SEQUENCE START: Enter Button Clicked
enterBtn.addEventListener('click', () => {
    document.getElementById('bg-music').play();
    document.getElementById('door-container').classList.add('hidden');
    videoContainer.classList.remove('hidden');
    
    // Play the FIRST video (Beach Reveal)
    revealVideo.play();
});

// TRANSITION 1: Beach Reveal ends -> Start Chef Intro
revealVideo.onended = () => {
    // Change the video source to Chef Pete Intro
    revealVideo.src = "videos/chef-pete-intro.mp4";
    revealVideo.load();
    revealVideo.play();
    
    // Now change the event listener for the NEXT transition
    revealVideo.onended = () => {
        showMenu();
    };
};

// TRANSITION 2: Chef Intro ends -> Show Menu
function showMenu() {
    videoContainer.classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
    startCamera();
}

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        webcam.srcObject = stream;
        webcam.addEventListener("loadeddata", predict);
    });
}

// ... (Rest of your dishes and predict logic stays the same)
