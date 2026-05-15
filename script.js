import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const enterBtn = document.getElementById('enter-btn');
const mainVideo = document.getElementById('main-video');
const displayContainer = document.getElementById('image-display-container');
const webcam = document.getElementById("webcam");
const cursor = document.getElementById("virtual-cursor");

let handLandmarker;
let lastVideoTime = -1;

const dishData = {
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

function masterSelect(key) {
    const dish = dishData[key];
    if (!dish) return;
    displayContainer.innerHTML = `<img src="${dish.path}" alt="${dish.name}"><h2 class="glow-text">${dish.name}</h2>`;
}

document.querySelectorAll('.menu-opt').forEach(item => {
    item.addEventListener('click', () => masterSelect(item.getAttribute('data-val')));
});

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
            const tip = results.landmarks[0][8];
            const x = (1 - tip.x) * window.innerWidth;
            const y = tip.y * window.innerHeight;
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            const el = document.elementFromPoint(x, y);
            document.querySelectorAll('.menu-opt').forEach(b => b.classList.remove('hovering'));
            if (el && el.classList.contains('menu-opt')) {
                el.classList.add('hovering');
                masterSelect(el.getAttribute('data-val'));
            }
        }
    }
    window.requestAnimationFrame(predict);
}
