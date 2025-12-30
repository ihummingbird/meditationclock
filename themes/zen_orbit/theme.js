window.ActiveTheme = {
    els: {},
    currentSettings: {},

    settingsConfig: {
        scale: {
            type: 'range',
            label: 'Dial Scale',
            default: 100,
            min: 70,
            max: 120,
            displaySuffix: '%'
        },
        glow: {
            type: 'range',
            label: 'Glow Intensity',
            default: 35,
            min: 0,
            max: 80,
            displaySuffix: '%'
        },
        ringWeight: {
            type: 'range',
            label: 'Ring Weight',
            default: 4,
            min: 2,
            max: 10,
            displaySuffix: 'px'
        },
        orbitSpeed: {
            type: 'range',
            label: 'Orbit Speed',
            default: 14,
            min: 8,
            max: 28,
            displaySuffix: 's'
        },
        palette: {
            type: 'palette',
            label: 'Accent Palette',
            default: '#7fe0d5',
            options: ['#7fe0d5', '#f38ba0', '#ffd966', '#7f8dff', '#8df6c5', '#ffb3ff']
        },
        layout: {
            type: 'select',
            label: 'Layout Mode',
            default: 'full',
            options: [
                { value: 'full', text: 'Full' },
                { value: 'minimal', text: 'Minimal' }
            ]
        }
    },

    init(stage, settings) {
        // ... (existing HTML injection) ...
        stage.innerHTML = `
            <div class="zen-stage">
                <div class="zen-gradient"></div>
                <div class="zen-shell">
                    <div class="zen-core">
                        <div class="orbit primary"></div>
                        <div class="orbit secondary"></div>
                        <div class="zen-content">
                            <div class="time-stack">
                                <div class="hours">00</div>
                                <div class="minutes">00</div>
                                <div class="seconds">00</div>
                            </div>
                            <div class="footer-info">
                                <div class="date-line">MON • JAN 01</div>
                                <div class="zone-pill">UTC</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.els = {
            hours: stage.querySelector('.hours'),
            minutes: stage.querySelector('.minutes'),
            seconds: stage.querySelector('.seconds'),
            date: stage.querySelector('.date-line'),
            zone: stage.querySelector('.zone-pill'),
            shell: stage.querySelector('.zen-shell'),
            orbit1: stage.querySelector('.orbit.primary'),
            orbit2: stage.querySelector('.orbit.secondary')
        };

        this.currentSettings = {
            scale: settings.scale ?? this.settingsConfig.scale.default,
            glow: settings.glow ?? this.settingsConfig.glow.default,
            ringWeight: settings.ringWeight ?? this.settingsConfig.ringWeight.default,
            // orbitSpeed property is kept for CSS storage but not used for rotation anymore
            orbitSpeed: settings.orbitSpeed ?? this.settingsConfig.orbitSpeed.default,
            palette: settings.palette ?? this.settingsConfig.palette.default,
            layout: settings.layout ?? this.settingsConfig.layout.default
        };

        this.applySettings();
        this.animate(); // Start the loop
    },

    // ... (applySettings and deriveSecondary remain the same) ...
    applySettings() {
        const root = document.documentElement;
        const s = this.currentSettings;

        root.style.setProperty('--zo-scale', (s.scale / 100).toString());
        root.style.setProperty('--zo-glow', `${s.glow}%`);
        root.style.setProperty('--zo-ring-weight', `${s.ringWeight}px`);
        root.style.setProperty('--zo-orbit-speed', `${s.orbitSpeed}s`);
        root.style.setProperty('--zo-accent', s.palette);

        // Derive a secondary color automatically
        const secondary = this.deriveSecondary(s.palette);
        root.style.setProperty('--zo-secondary', secondary);

        this.els.shell.dataset.layout = s.layout;
    },

    deriveSecondary(color) {
        const map = {
            '#7fe0d5': '#b385ff',
            '#f38ba0': '#ffa9f0',
            '#ffd966': '#ff8e53',
            '#7f8dff': '#7ce0ff',
            '#8df6c5': '#67c5ff',
            '#ffb3ff': '#96a8ff'
        };
        return map[color] || '#b385ff';
    },

    update(time) {
        this.els.hours.textContent = time.h;
        this.els.minutes.textContent = time.m;
        this.els.seconds.textContent = time.s;

        const now = new Date();
        const weekday = now.toLocaleString('en', { weekday: 'short' }).toUpperCase();
        const month = now.toLocaleString('en', { month: 'short' }).toUpperCase();
        const dateNum = String(now.getDate()).padStart(2, '0');
        this.els.date.textContent = `${weekday} • ${month} ${dateNum}`;

        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
        this.els.zone.textContent = zone.toUpperCase();
    },

    animate() {
        // Stop if elements are gone (theme switched)
        if (!this.els.orbit1) return;

        const now = new Date();
        const ms = now.getMilliseconds();
        const s = now.getSeconds() + (ms / 1000);
        const m = now.getMinutes() + (s / 60);

        // Outer Ring: Seconds (Smooth)
        const sDeg = s * 6;

        // Inner Ring: Minutes (Smooth)
        const mDeg = m * 6;

        this.els.orbit1.style.transform = `rotate(${sDeg}deg)`;
        this.els.orbit2.style.transform = `rotate(${mDeg}deg)`;

        this.animationId = requestAnimationFrame(() => this.animate());
    },

    onSettingsChange(key, val) {
        if (key === 'scale' || key === 'glow' || key === 'ringWeight' || key === 'orbitSpeed') {
            this.currentSettings[key] = Number(val);
        } else {
            this.currentSettings[key] = val;
        }
        this.applySettings();
    },

    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.els = {};
    }
};