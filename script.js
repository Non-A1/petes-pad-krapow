import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const enterBtn = document.getElementById('enter-btn');
const chefVideo = document.getElementById('chef-video');
const video = document.getElementById("webcam");
const cursor = document.getElementById("virtual-cursor");

let handLandmarker;
let lastVideoTime = -1;

// 1. Initialize MediaPipe
async function initMediaPipe() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1
    });
}
initMediaPipe();

// 2. Entrance Logic
enterBtn.addEventListener('click', () => {
    document.getElementById('door-container').classList.add('doors-open');
    document.getElementById('bg-music').play();
    
    setTimeout(() => {
        document.getElementById('door-container').classList.add('hidden');
        document.getElementById('video-container').classList.remove('hidden');
        chefVideo.play();
    }, 1800);
});

chefVideo.onended = () => {
    document.getElementById('video-container').classList.add('hidden');
    document.getElementById('menu').classList.remove('hidden');
    startCamera();
};

// 3. Hand Tracking
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}

async function predictWebcam() {
    if (video.currentTime !== lastVideoTime) {
        lastVideoTime = video.currentTime;
        const results = handLandmarker.detectForVideo(video, performance.now());
        
        if (results.landmarks && results.landmarks.length > 0) {
            const indexTip = results.landmarks[0][8]; // Index Finger
            const x = (1 - indexTip.x) * window.innerWidth;
            const y = indexTip.y * window.innerHeight;
            
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
            handleHover(x, y);
        }
    }
    window.requestAnimationFrame(predictWebcam);
}

// 4. Interaction & Menu Logic
let hoverTimer;
const dishData = {
    chicken: { img: 'images/chicken-pad-krapow.jpg', desc: 'Fresh Minced Chicken & Thai Holy Basil' },
    pork:    { img: 'images/pork-pad-krapow.jpg',    desc: 'Crispy Sizzled Pork Mince' },
    beef:    { img: 'images/beef-pad-krapow.jpg',    desc: 'Bold Beef Strips with High-Heat Sear' },
    tofu:    { img: 'images/tofu-pad-krapow.jpg',    desc: 'Golden Tofu with King Oyster Mushrooms' }
};

function handleHover(x, y) {
    const el = document.elementFromPoint(x, y);
    document.querySelectorAll('.menu-opt').forEach(btn => btn.classList.remove('hovering'));

    if (el && el.classList.contains('menu-opt')) {
        el.classList.add('hovering');
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => selectDish(el.getAttribute('data-val')), 1200);
    } else {
        clearTimeout(hoverTimer);
    }
}

function selectDish(protein) {
    const display = document.getElementById('display-area');
    document.getElementById('dish-image').src = dishData[protein].img;
    document.getElementById('dish-desc').innerText = dishData[protein].desc;
    display.classList.remove('hidden');
}
