import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const enterBtn = document.getElementById('enter-btn');
const revealVideo = document.getElementById('reveal-video');
const webcam = document.getElementById("webcam");
const cursor = document.getElementById("virtual-cursor");

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

// 1. Enter Button Sequence
enterBtn.addEventListener('click', () => {
    document.getElementById('bg-music').play();
    document.getElementById('door-container').classList.add('hidden');
    document.getElementById('video-container').classList.remove('hidden');
    revealVideo.play();
});

// 2. Video End -> Menu Reveal
revealVideo.onended = () => {
    document.getElementById('video-container').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
    startHandTracking();
};

function startHandTracking() {
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
            const tip = results.landmarks[0][8];
            const x = (1 - tip.x) * window.innerWidth;
            const y = tip.y * window.innerHeight;
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            checkSelection(x, y);
        }
    }
    window.requestAnimationFrame(predict);
}

const dishes = {
    chicken: { img: 'images/chicken-pad-krapow.jpg', desc: 'Minced Chicken with Holy Basil' },
    pork:    { img: 'images/pork-pad-krapow.jpg',    desc: 'Crispy Sizzled Pork Mince' },
    beef:    { img: 'images/beef-pad-krapow.jpg',    desc: 'Bold Beef Strips with High-Heat Sear' },
    tofu:    { img: 'images/tofu-pad-krapow.jpg',    desc: 'Golden Tofu with King Oyster Mushrooms' }
};

let hoverTimer;
function checkSelection(x, y) {
    const el = document.elementFromPoint(x, y);
    if (el && el.classList.contains('menu-opt')) {
        const protein = el.getAttribute('data-val');
        document.getElementById('dish-image').src = dishes[protein].img;
        document.getElementById('dish-desc').innerText = dishes[protein].desc;
        document.getElementById('display-area').classList.remove('hidden');
    }
}
