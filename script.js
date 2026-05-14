const enterBtn = document.getElementById('enter-btn');
const doorContainer = document.getElementById('door-container');
const videoContainer = document.getElementById('video-container');
const chefVideo = document.getElementById('chef-video');
const menuSection = document.getElementById('menu');

// 1. OPEN DOORS
enterBtn.addEventListener('click', () => {
    document.querySelector('.door-overlay').style.opacity = '0';
    doorContainer.classList.add('doors-open');
    
    // Wait for door animation, then start video
    setTimeout(() => {
        doorContainer.classList.add('hidden');
        videoContainer.classList.remove('hidden');
        chefVideo.play();
    }, 1500);
});

// 2. VIDEO ENDS -> SHOW MENU
chefVideo.onended = () => {
    videoContainer.classList.add('hidden');
    menuSection.classList.remove('hidden');
};

// 3. MENU IMAGE LOGIC
const dishData = {
    chicken: { img: 'images/chicken-pad-krapow.jpg', desc: 'Minced chicken sizzled with holy basil.' },
    pork:    { img: 'images/pork-pad-krapow.jpg',    desc: 'Classic pork mince with crispy edges.' },
    beef:    { img: 'images/beef-pad-krapow.jpg',    desc: 'Bold beef strips in a dark soy glaze.' },
    tofu:    { img: 'images/tofu-pad-krapow.jpg',    desc: 'Firm tofu and mushrooms with garden basil.' }
};

document.querySelectorAll('.menu-opt').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const protein = e.target.getAttribute('data-val');
        const display = document.getElementById('display-area');
        
        document.getElementById('dish-image').src = dishData[protein].img;
        document.getElementById('dish-desc').innerText = dishData[protein].desc;
        
        display.classList.remove('hidden');
    });
});
