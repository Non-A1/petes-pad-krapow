import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const enterBtn = document.getElementById('enter-btn');
const revealVideo = document.getElementById('reveal-video');
const webcam = document.getElementById("webcam");
const cursor = document.getElementById("virtual-cursor");

let handLandmarker;
let lastVideoTime = -1;

// Initialize AI
async function initMediaPipe() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1
    });
}
initMediaPipe();

// Step 1: Click Enter -> Play Video
enterBtn.addEventListener('click', () => {
    document.getElementById('bg-music').play();
    document.getElementById('door-container').classList.add('hidden');
    document.getElementById('video-container').classList.remove('hidden');
    revealVideo.play();
});

// Step 2: Video Ends -> Show Menu
revealVideo.onended = () => {
    document.getElementById('video-container').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
    startCamera();
};

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        webcam.srcObject = stream;
        webcam.addEventListener("loadeddata", predict);
    });
}

const dishes = {
    chicken: { name: 'Chicken Pad Krapow', img: 'images/chicken-pad-krapow.jpg', desc: 'Street-style minced chicken with holy basil.' },
    pork:    { name: 'Pork Pad Krapow', img: 'images/pork-pad-krapow.jpg', desc: 'Savory pork mince with peppery basil notes.' },
    beef:    { name: 'Beef Pad Krapow', img: 'images/beef-pad-krapow.jpg', desc: 'Seared beef strips with a bold soy glaze.' },
    tofu:    { name: 'Tofu Pad Krapow', img: 'images/tofu-pad-krapow.jpg', desc: 'Crispy tofu and mushrooms for a classic vegetarian bite.' }
};

async function predict() {
    if (webcam.currentTime !== lastVideoTime) {
        lastVideoTime = webcam.currentTime;
        const results = handLandmarker.detectForVideo(webcam, performance.now());
        if (results.landmarks && results.landmarks.length > 0) {
            const tip = results.landmarks[0][8]; // Index finger
            const x = (1 - tip.x) * window.innerWidth;
            const y = tip.y * window.innerHeight;
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            
            const el = document.elementFromPoint(x, y);
            if (el && (el.classList.contains('menu-opt') || el.closest('.menu-opt'))) {
                const target = el.closest('.menu-opt');
                const val = target.getAttribute('data-val');
                updateDishDisplay(val);
            }
        }
    }
    window.requestAnimationFrame(predict);
}

function updateDishDisplay(val) {
    const area = document.getElementById('display-area');
    document.getElementById('dish-image').src = dishes[val].img;
    document.getElementById('selected-dish-title').innerText = dishes[val].name;
    document.getElementById('dish-desc').innerText = dishes[val].desc;
    area.classList.remove('hidden');
}
