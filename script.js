import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const enterBtn = document.getElementById('enter-btn');
const mainVideo = document.getElementById('main-video');
const displayContainer = document.getElementById('image-display-container');
const webcam = document.getElementById("webcam");
const cursor = document.getElementById("virtual-cursor");

let handLandmarker;
let lastVideoTime = -1;

// CONCEPT: MAP IDs TO PICTURE PATHS
const dishAssets = {
    chicken: { name: "Chicken Pad Krapow", path: "images/chicken.jpg" },
    pork:    { name: "Pork Pad Krapow", path: "images/pork.jpg" },
    beef:    { name: "Beef Pad Krapow", path: "images/beef.jpg" },
    tofu:    { name: "Tofu Pad Krapow", path: "images/tofu.jpg" }
};

async function initAI() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1
    });
}
initAI();

// STEP: CINEMATIC CHAIN
enterBtn.addEventListener('click', () => {
    document.getElementById('bg-music').play();
    document.getElementById('door-container').classList.add('hidden');
    document.getElementById('video-container').classList.remove('hidden');
    mainVideo.play();
});

mainVideo.onended = () => {
    if (mainVideo.src.includes('thai-beach-reveal.mp4')) {
        mainVideo.src = "videos/chef-pete-intro.mp4";
        mainVideo.load();
        mainVideo.play();
    } else {
        document.getElementById('video-container').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        startCamera();
    }
};

// CONCEPT: THE MASTER SELECT FUNCTION (Clear and Display)
function masterSelect(key) {
    const data = dishAssets[key];
    if (!data) return;

    // Clear
    displayContainer.innerHTML = "";

    // Display
    const img = document.createElement("img");
    img.src = data.path;
    img.alt = data.name;

    const title = document.createElement("h2");
    title.innerText = data.name;
    title.className = "glow-text";

    displayContainer.appendChild(img);
    displayContainer.appendChild(title);
}

// ENABLE CLICKS for Desktop Mouse users
document.querySelectorAll('.menu-opt').forEach(item => {
    item.addEventListener('click', () => masterSelect(item.getAttribute('data-val')));
});

// GESTURE INITIALIZATION
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        webcam.srcObject = stream;
        webcam.addEventListener("loadeddata", predict);
    });
}

async function predict() {
    if (webcam.currentTime !== lastVideoTime) {
        lastVideoTime = webcam.currentTime;
        const results = handLandmarker.detectForVideo(webcam, performance.now());
        
        if (results.landmarks && results.landmarks.length > 0) {
            const tip = results.landmarks[0][8]; // Index finger tip
            const x = (1 - tip.x) * window.innerWidth;
            const y = tip.y * window.innerHeight;
            
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            
            const elementUnderCursor = document.elementFromPoint(x, y);
            document.querySelectorAll('.menu-opt').forEach(li => li.classList.remove('hovering'));
            
            if (elementUnderCursor && elementUnderCursor.classList.contains('menu-opt')) {
                elementUnderCursor.classList.add('hovering');
                masterSelect(elementUnderCursor.getAttribute('data-val'));
            }
        }
    }
    window.requestAnimationFrame(predict);
}
