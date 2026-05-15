import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const enterBtn = document.getElementById('enter-btn');
const revealVideo = document.getElementById('reveal-video');
const webcam = document.getElementById("webcam");
const cursor = document.getElementById("virtual-cursor");

let handLandmarker;
let lastVideoTime = -1;

// 1. Initialize Hand Tracking
async function initMediaPipe() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1
    });
}
initMediaPipe();

// 2. Start Sequence
enterBtn.addEventListener('click', () => {
    document.getElementById('bg-music').play();
    document.getElementById('door-container').classList.add('hidden');
    document.getElementById('video-container').classList.remove('hidden');
    revealVideo.play();
});

// 3. Reveal Menu after Video
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

// 4. Dish Data & AI Logic
const dishes = {
    chicken: { name: 'Chicken Pad Krapow', img: 'images/chicken-pad-krapow.jpg', desc: 'Minced chicken with spicy holy basil.' },
    pork:    { name: 'Pork Pad Krapow', img: 'images/pork-pad-krapow.jpg', desc: 'Crispy pork mince with authentic herbs.' },
    beef:    { name: 'Beef Pad Krapow', img: 'images/beef-pad-krapow.jpg', desc: 'Bold beef strips seared at high heat.' },
    tofu:    { name: 'Tofu Pad Krapow', img: 'images/tofu-pad-krapow.jpg', desc: 'Golden tofu with king oyster mushrooms.' }
};

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
            
            checkMenuHover(x, y);
        }
    }
    window.requestAnimationFrame(predict);
}

function checkMenuHover(x, y) {
    const el = document.elementFromPoint(x, y);
    document.querySelectorAll('.menu-opt').forEach(btn => btn.classList.remove('hovering'));
    
    if (el && el.classList.contains('menu-opt')) {
        el.classList.add('hovering');
        const dish = el.getAttribute('data-val');
        
        // Show dish preview
        document.getElementById('dish-image').src = dishes[dish].img;
        document.getElementById('selected-dish-title').innerText = dishes[dish].name;
        document.getElementById('dish-desc').innerText = dishes[dish].desc;
        document.getElementById('display-area').classList.remove('hidden');
    }
}
