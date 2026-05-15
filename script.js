import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

// --- ELEMENT SELECTORS ---
const enterBtn = document.getElementById('enter-btn');
const mainVideo = document.getElementById('main-video');
const bgMusic = document.getElementById('bg-music');
const chefVoice = document.getElementById('chef-voiceover');
const displayContainer = document.getElementById('image-display-container');
const webcam = document.getElementById("webcam");
const cursor = document.getElementById("virtual-cursor");

let handLandmarker;
let lastVideoTime = -1;

// --- DATA: DISH MAPPING ---
const dishData = {
    chicken: { name: "Chicken Pad Krapow", path: "images/chicken.jpg" },
    pork:    { name: "Pork Pad Krapow", path: "images/pork.jpg" },
    beef:    { name: "Beef Pad Krapow", path: "images/beef.jpg" },
    tofu:    { name: "Tofu Pad Krapow", path: "images/tofu.jpg" }
};

// --- AI INITIALIZATION ---
async function initAI() {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { 
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`, 
            delegate: "GPU" 
        },
        runningMode: "VIDEO", 
        numHands: 1
    });
}
initAI();

// --- STAGE 1: ENTRANCE ---
enterBtn.addEventListener('click', () => {
    // Start ambient music at a comfortable level
    bgMusic.volume = 0.4; 
    bgMusic.play();
    
    document.getElementById('door-container').classList.add('hidden');
    document.getElementById('video-container').classList.remove('hidden');
    mainVideo.play();
});

// --- STAGE 2: CINEMATIC SEQUENCING ---
mainVideo.onended = () => {
    if (mainVideo.src.includes('thai-beach-reveal.mp4')) {
        mainVideo.src = "videos/chef-pete-intro.mp4";
        mainVideo.load();
        mainVideo.play();
    } else {
        // Transition to Menu Stage
        document.getElementById('video-container').classList.add('hidden');
        document.getElementById('menu').classList.remove('hidden');
        
        // TRIGGER AUDIO OVERLAY
        playChefIntro(); 
        
        startCamera();
    }
};

// --- AUDIO MIXING (THE "DUCKING" LOGIC) ---
function playChefIntro() {
    // 1. "Duck" the background music so the voice is clear
    bgMusic.volume = 0.15; 
    
    // 2. Play the Chef Pete voiceover
    chefVoice.play();
    
    // 3. Restore background music volume once the story ends
    chefVoice.onended = () => {
        // Fade back up smoothly over 2 seconds
        let fadeUp = setInterval(() => {
            if (bgMusic.volume < 0.4) {
                bgMusic.volume += 0.05;
            } else {
                clearInterval(fadeUp);
            }
        }, 200);
    };
}

// --- INTERACTIVE MENU LOGIC ---
function masterSelect(key) {
    const dish = dishData[key];
    if (!dish) return;
    displayContainer.innerHTML = `
        <img src="${dish.path}" alt="${dish.name}">
        <h2 style="color:var(--thai-yellow); font-size:1.4rem; margin-top:10px;">${dish.name}</h2>
    `;
}

// Enable standard clicks for desktop users
document.querySelectorAll('.menu-opt').forEach(item => {
    item.addEventListener('click', () => masterSelect(item.getAttribute('data-val')));
});

// --- AI GESTURE LOGIC ---
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
