window.ActiveTheme = {
    els: {},

    settingsConfig: {
        palette: {
            type: 'palette',
            label: 'Energy Source',
            default: '#ffd700', // Gold
            options: [
                '#ffd700', // Gold
                '#00ffff', // Cyan
                '#ff0055', // Crimson
                '#00ff66', // Matrix
                '#ffffff'  // Pure
            ]
        },
        speed: {
            type: 'range',
            label: 'Rotation Speed',
            default: 20,
            min: 5,
            max: 60,
            displaySuffix: 's'
        },
        scale: {
            type: 'range',
            label: 'Machine Size',
            default: 100,
            min: 50,
            max: 150,
            displaySuffix: '%'
        }
    },

    init(stage, settings) {
        stage.innerHTML = `
            <div class="gyre-stage">
                <div class="starfield"></div>
                
                <div class="machine-core">
                    <div class="ring ring-1"></div>
                    <div class="ring ring-2"></div>
                    <div class="ring ring-3"></div>
                    <div class="ring ring-4"></div>
                    
                    <div class="hud-interface">
                        <div class="time-display">00:00:00</div>
                        <div class="date-display">CHRONOS</div>
                    </div>
                </div>
            </div>
        `;

        this.els = {
            time: stage.querySelector('.time-display'),
            date: stage.querySelector('.date-display')
        };

        const s = settings;
        this.applySettings(s.palette ?? '#ffd700', s.speed ?? 20, s.scale ?? 100);
    },

    update(time) {
        this.els.time.textContent = `${time.h}:${time.m}:${time.s}`;

        // Dynamic "Tech" decoration for date
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
        this.els.date.textContent = `sys.${now.getFullYear()} // ${dateStr}`;
    },

    applySettings(color, speed, scale) {
        const r = document.documentElement;
        r.style.setProperty('--cg-color', color);

        // Derive secondary color
        const secondary = (color === '#ffd700') ? '#0ff' : '#fff';
        // Simple logic: if Gold, use Cyan acccent. Else white.
        // Actually let's just make secondary color a contrast or variation.

        r.style.setProperty('--cg-speed', `${speed}s`);
        r.style.setProperty('--cg-scale', scale / 100);
    },

    onSettingsChange(key, val) {
        const r = document.documentElement;
        if (key === 'palette') r.style.setProperty('--cg-color', val);
        if (key === 'speed') r.style.setProperty('--cg-speed', `${val}s`);
        if (key === 'scale') r.style.setProperty('--cg-scale', val / 100);
    },

    destroy() {
        this.els = {};
    }
};
