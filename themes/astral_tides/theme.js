class AstralTidesTheme {
    constructor() {
        this.timer = null;
        this.root = null;
    }

    init(stage, settings) {
        this.root = stage;
        // Create DOM Structure
        this.root.innerHTML = `
            <div id="astral-bg">
                <div class="nebula nebula-1"></div>
                <div class="nebula nebula-2"></div>
                <div class="particles-container" id="particles"></div>
            </div>
            <div id="clock-root">
                <div class="clock-face">
                    <div class="marker-ring" id="markers"></div>
                    <div class="center-point"></div>
                    <div class="hand hour-hand" id="hand-h"></div>
                    <div class="hand minute-hand" id="hand-m"></div>
                    <div class="hand second-hand" id="hand-s"></div>
                    <div class="date-display" id="date-display"></div>
                </div>
            </div>
        `;

        this.generateMarkers();
        this.generateParticles();
        this.startTick();
    }

    update(time) {
        // Engine calls this every second, but we use RAF for smoothness
        // We can use this to update date if needed
    }

    generateMarkers() {
        const container = document.getElementById('markers');
        for (let i = 0; i < 60; i++) {
            const el = document.createElement('div');
            el.className = `marker ${i % 5 === 0 ? 'major' : ''}`;
            // Fix rotation origin
            el.style.transform = `rotate(${i * 6}deg)`;
            el.innerHTML = '<div class="marker-dot"></div>';
            container.appendChild(el);
        }
    }

    generateParticles() {
        const container = document.getElementById('particles');
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const p = document.createElement('div');
            p.className = 'particle';

            // Randomize styling for bubble effect
            const size = Math.random() * 4 + 2;
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${Math.random() * 100}%`;

            // Random animation delay and duration
            p.style.animationDuration = `${Math.random() * 10 + 10}s`;
            p.style.animationDelay = `${Math.random() * 5}s`;

            container.appendChild(p);
        }
    }

    startTick() {
        const update = () => {
            const now = new Date();
            const h = now.getHours();
            const m = now.getMinutes();
            const s = now.getSeconds();
            const ms = now.getMilliseconds();

            // Smooth second hand including ms
            const sDeg = (s * 6) + (ms * 0.006);
            const mDeg = (m * 6) + (s * 0.1);
            const hDeg = ((h % 12) * 30) + (m * 0.5);

            const handH = document.getElementById('hand-h');
            const handM = document.getElementById('hand-m');
            const handS = document.getElementById('hand-s');

            if (handH) handH.style.transform = `translateX(-50%) rotate(${hDeg}deg)`;
            if (handM) handM.style.transform = `translateX(-50%) rotate(${mDeg}deg)`;
            if (handS) handS.style.transform = `translateX(-50%) rotate(${sDeg}deg)`;

            // Date
            const dateEl = document.getElementById('date-display');
            if (dateEl) {
                const options = { weekday: 'short', month: 'long', day: 'numeric' };
                if (dateEl.innerText !== now.toLocaleDateString('en-US', options)) {
                    dateEl.innerText = now.toLocaleDateString('en-US', options);
                }
            }

            this.timer = requestAnimationFrame(update);
        };
        update();
    }

    destroy() {
        if (this.timer) cancelAnimationFrame(this.timer);
        this.root.innerHTML = '';
    }
}

// Assign to global ActiveTheme for engine to pick up
window.ActiveTheme = new AstralTidesTheme();
