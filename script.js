import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

const enterBtn = document.getElementById('enter-btn');
const mainVideo = document.getElementById('main-video');
const videoContainer = document.getElementById('video-container');
const menuSection = document.getElementById('menu');
const webcam = document.getElementById("webcam");
const cursor = document.getElementById("virtual-cursor");

let handLandmarker;
let lastVideoTime = -1;

// 1. Load MediaPipe first
async function initAI() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, delegate: "GPU" },
        runningMode: "VIDEO", numHands: 1
    });
}
initAI();

// 2. Start Video Sequence
enterBtn.addEventListener('click', () => {
    document.getElementById('bg-music').play();
    document.getElementById('door-container').classList.add('hidden');
    videoContainer.classList.remove('hidden');
    mainVideo.play();
});

// 3. Chain Videos: Beach Reveal -> Chef Intro
mainVideo.onended = () => {
    if (mainVideo.src.includes('thai-beach-reveal.mp4')) {
        mainVideo.src = "videos/chef-pete-intro.mp4";
        mainVideo.load();
        mainVideo.play();
    } else {
        // After Chef Intro ends
        videoContainer.classList.add('hidden');
        menuSection.classList.remove('hidden');
        startCamera();
    }
};

// 4. Gesture Menu Logic
function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        webcam.srcObject = stream;
        webcam.addEventListener("loadeddata", predict);
    });
}

const dishes = {
    chicken: { name: 'Chicken Pad Krapow', img: 'images/chicken-pad-krapow.jpg', desc: 'Spicy minced chicken with holy basil.' },
    pork:    { name: 'Pork Pad Krapow', img: 'images/pork-pad-krapow.jpg', desc: 'Authentic pork mince with peppery notes.' },
    beef:    { name: 'Beef Pad Krapow', img: 'images/beef-pad-krapow.jpg', desc: 'Wok-seared beef strips.' },
    tofu:    { name: 'Tofu Pad Krapow', img: 'images/tofu-pad-krapow.jpg', desc: 'Golden tofu with king oyster mushrooms.' }
};

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
                const val = el.getAttribute('data-val');
                document.getElementById('dish-image').src = dishes[val].img;
                document.getElementById('selected-dish-title').innerText = dishes[val].name;
                document.getElementById('dish-desc').innerText = dishes[val].desc;
                document.getElementById('display-area').classList.remove('hidden');
            }
        }
    }
    window.requestAnimationFrame(predict);
}
