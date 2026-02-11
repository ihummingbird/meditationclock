window.ActiveTheme = {
    els: {},
    orbs: [],           // Store orb elements
    activeAnims: [],    // Store running animations so we can safely stop them
    speedMs: 40000,     // Default speed (40s)

    settingsConfig: {
        palette: {
            type: 'palette', label: 'Atmosphere', default: '220',
            options: ['220', '280', '340', '160', '30']
        },
        speed: {
            type: 'range', label: 'Flow Speed', default: 40,
            min: 5, max: 40, displaySuffix: 's'
        },
        scale: {
            type: 'range', label: 'Text Size', default: 100,
            min: 70, max: 130, displaySuffix: '%'
        }
    },

    init(stage, settings) {
        stage.innerHTML = `
            <div class="tides-stage">
                <svg class="svg-filter">
                    <defs>
                        <filter id="et-goo">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="20" result="blur" />
                            <feColorMatrix in="blur" mode="matrix" values="
                                1 0 0 0 0  
                                0 1 0 0 0  
                                0 0 1 0 0  
                                0 0 0 18 -7" result="goo" />
                            <feBlend in="SourceGraphic" in2="goo" />
                        </filter>
                    </defs>
                </svg>

                <div class="liquid-container">
                    <div class="orb"></div>
                    <div class="orb"></div>
                    <div class="orb"></div>
                    <div class="orb"></div>
                    <div class="orb"></div>
                    <div class="orb"></div>
                    <div class="orb"></div>
                    
                </div>

                <div class="tides-content">
                    <div class="time-wrapper">
                        <div class="main-time">00:00</div>
                    </div>
                    <div class="meta-row">
                        <span class="date">LOADING</span>
                        <div class="orb-pill"></div>
                        <span class="seconds">00</span>
                    </div>
                </div>
            </div>
        `;

        this.els = {
            time: stage.querySelector('.main-time'),
            date: stage.querySelector('.date'),
            sec: stage.querySelector('.seconds')
        };
        
        // Grab the orbs
        this.orbs = Array.from(stage.querySelectorAll('.orb'));

        const s = settings;
        this.applySettings(s.palette ?? '220', s.speed ?? 20, s.scale ?? 100);

        // Start the infinite random animation loop for each orb
        this.orbs.forEach((orb, index) => {
            // Set their starting point as 0,0
            orb.dataset.x = 0;
            orb.dataset.y = 0;
            orb.dataset.scale = 1;

            // Stagger their initial start times so they immediately look organic
            setTimeout(() => {
                this.floatOrb(orb);
            }, index * 1500); 
        });
    },

    // --- THE MAGIC WANDERING ALGORITHM ---
    floatOrb(orb) {
        // Stop if the theme was closed/destroyed
        if (!this.orbs.length) return;

        // Get where the orb is right now
        const currentX = parseFloat(orb.dataset.x);
        const currentY = parseFloat(orb.dataset.y);
        const currentScale = parseFloat(orb.dataset.scale);

        // Generate a completely new random destination
        // They will wander anywhere from -40vmin to +40vmin from their anchor
        const nextX = (Math.random() - 0.5) * 80; 
        const nextY = (Math.random() - 0.5) * 80;
        
        // Slight random pulsing effect
        const nextScale = 0.85 + (Math.random() * 0.4); 

        // Add ±20% randomness to the duration so the orbs fall completely out of sync
        const randomizedDuration = this.speedMs * (0.8 + Math.random() * 0.4);

        // Animate from current exact point to the new point using WAAPI
        const anim = orb.animate([
            { transform: `translate(${currentX}vmin, ${currentY}vmin) scale(${currentScale})` },
            { transform: `translate(${nextX}vmin, ${nextY}vmin) scale(${nextScale})` }
        ], {
            duration: randomizedDuration,
            easing: 'ease-in-out', // Gives it that fluid deceleration at waypoints
            fill: 'forwards'
        });

        // Save the new coordinates so the next cycle starts exactly where this one ends
        orb.dataset.x = nextX;
        orb.dataset.y = nextY;
        orb.dataset.scale = nextScale;

        this.activeAnims.push(anim);

        // When it reaches the coordinate, instantly assign a new one
        anim.onfinish = () => {
            // Clean up old animation reference to prevent memory leaks
            this.activeAnims = this.activeAnims.filter(a => a !== anim);
            this.floatOrb(orb); 
        };
    },

    update(time) {
        this.els.time.textContent = `${time.h}:${time.m}`;
        this.els.sec.textContent = time.s;

        const now = new Date();
        const str = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        this.els.date.textContent = str;
    },

    applySettings(hue, speed, scale) {
        const r = document.documentElement;
        r.style.setProperty('--et-hue', hue);
        this.speedMs = speed * 1000; // Convert slider seconds to milliseconds
        r.style.setProperty('--et-scale', scale / 100);
    },

    onSettingsChange(key, val) {
        const r = document.documentElement;
        if (key === 'palette') r.style.setProperty('--et-hue', val);
        
        if (key === 'speed') {
            this.speedMs = val * 1000;
            // Note: Currently moving orbs will finish their current trip at the old speed, 
            // then adopt the new speed for the next trip. This prevents jarring mid-air jumps!
        }
        
        if (key === 'scale') r.style.setProperty('--et-scale', val / 100);
    },

    destroy() {
        // Clean up DOM references
        this.els = {};
        this.orbs = [];
        
        // Cancel all active JavaScript animations so they stop calculating in the background
        this.activeAnims.forEach(anim => anim.cancel());
        this.activeAnims = [];
    }
};