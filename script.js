const enterBtn = document.getElementById('enter-btn');
const music = document.getElementById('thai-music');
const narration = document.getElementById('narration');

enterBtn.addEventListener('click', () => {
    // 1. Switch Sections
    document.getElementById('splash').classList.remove('active');
    document.getElementById('narrative').classList.add('active', 'fade-in');

    // 2. Start Audio (Browsers allow it now because of the click)
    music.volume = 0.3;
    music.play();
    narration.play();

    // 3. Narrative Timeline
    setTimeout(() => {
        document.getElementById('narrator-text').classList.add('hidden');
        document.getElementById('chef-pete').classList.remove('hidden');
    }, 8000); // Wait for history narration to finish

    setTimeout(() => {
        document.getElementById('narrative').classList.remove('active');
        document.getElementById('menu').classList.remove('hidden');
        document.getElementById('menu').classList.add('active');
    }, 12000); // Reveal menu after Chef Intro
});

// Menu Selection Logic
let selection = { protein: null, spice: null };

document.querySelectorAll('.opt-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const type = e.target.getAttribute('data-type');
        const val = e.target.innerText;

        // Toggle Active Class
        document.querySelectorAll(`.opt-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        // Update Selection
        if (type === 'protein') selection.protein = val;
        if (type === 'spice') selection.spice = val;

        // Update Summary if both are selected
        if (selection.protein && selection.spice) {
            document.getElementById('order-summary').classList.remove('hidden');
            document.getElementById('final-dish-text').innerText = 
                `Your ${selection.protein} Pad Krapow is being prepared at Level ${selection.spice}!`;
            
            // Logic to change image could go here:
            // document.getElementById('dish-img').src = `images/${selection.protein}-${selection.spice}.jpg`;
        }
    });
});
