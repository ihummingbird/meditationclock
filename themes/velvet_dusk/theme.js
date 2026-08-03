window.ActiveTheme = {
    els: {},
    settings: {},
    lastTime: null,

    /* ── Moods: each maps to a full dusk palette ─────────── */
    MOODS: {
        ocean: {
            bgTop: '#0e2038', bgBottom: '#050b16',
            horizon: 'rgba(88, 168, 255, 0.5)', horizon2: 'rgba(255,255,255,0.12)',
            accent: '#8ecbff', glow: 'rgba(120, 190, 255, 0.32)', ink: '#060d18'
        },
        plum: {
            bgTop: '#3a2035', bgBottom: '#140a12',
            horizon: 'rgba(255, 170, 210, 0.38)', horizon2: 'rgba(255,255,255,0.09)',
            accent: '#f0b8d0', glow: 'rgba(240, 150, 190, 0.3)', ink: '#0f0710'
        },
        olive: {
            bgTop: '#232a15', bgBottom: '#0b0e07',
            horizon: 'rgba(200, 220, 120, 0.35)', horizon2: 'rgba(255,255,255,0.1)',
            accent: '#d8e29a', glow: 'rgba(190, 205, 110, 0.28)', ink: '#0a0d06'
        },
        midnight: {
            bgTop: '#131a33', bgBottom: '#060810',
            horizon: 'rgba(140, 130, 255, 0.4)', horizon2: 'rgba(255,255,255,0.08)',
            accent: '#b9b2ff', glow: 'rgba(150, 140, 255, 0.3)', ink: '#080a14'
        },
        rose: {
            bgTop: '#3a1f28', bgBottom: '#160a0f',
            horizon: 'rgba(255, 140, 160, 0.42)', horizon2: 'rgba(255,255,255,0.1)',
            accent: '#ffb3c2', glow: 'rgba(255, 130, 155, 0.3)', ink: '#120609'
        },
        amber: {
            bgTop: '#33281a', bgBottom: '#120e08',
            horizon: 'rgba(255, 200, 120, 0.42)', horizon2: 'rgba(255,255,255,0.1)',
            accent: '#ffd28a', glow: 'rgba(255, 190, 110, 0.3)', ink: '#120d07'
        }
    },

    FONTS: {
        montserrat: { family: "'Montserrat', 'Inter', -apple-system, sans-serif", weight: 300 },
        inter: { family: "'Inter', 'Helvetica Neue', Arial, sans-serif", weight: 200 },
        mono: { family: "'JetBrains Mono', 'Courier New', monospace", weight: 400 },
        serif: { family: "'Cormorant Garamond', 'Georgia', serif", weight: 400 },
        audiowide: { family: "'Audiowide', 'Inter', sans-serif", weight: 400 }
    },

    settingsConfig: {
        mood: {
            type: 'select',
            label: 'Dusk Mood',
            default: 'ocean',
            options: [
                { value: 'ocean', text: 'Ocean Blue' },
                { value: 'plum', text: 'Plum Dusk (photo)' },
                { value: 'olive', text: 'Olive Grove' },
                { value: 'midnight', text: 'Midnight Violet' },
                { value: 'rose', text: 'Rose Ember' },
                { value: 'amber', text: 'Golden Amber' }
            ]
        },
        font: {
            type: 'select',
            label: 'Typeface',
            default: 'montserrat',
            options: [
                { value: 'montserrat', text: 'Montserrat (Light)' },
                { value: 'inter', text: 'Inter (Thin)' },
                { value: 'serif', text: 'Cormorant (Serif)' },
                { value: 'mono', text: 'JetBrains Mono' },
                { value: 'audiowide', text: 'Audiowide' }
            ]
        },
        format: {
            type: 'select',
            label: 'Format',
            default: '24h',
            options: [
                { value: '24h', text: '24 Hour' },
                { value: '12h', text: '12 Hour' }
            ]
        },
        seconds: {
            type: 'select',
            label: 'Seconds',
            default: 'show',
            options: [
                { value: 'show', text: 'Show' },
                { value: 'hide', text: 'Hidden' }
            ]
        },
        date: {
            type: 'select',
            label: 'Date',
            default: 'show',
            options: [
                { value: 'show', text: 'Show' },
                { value: 'hide', text: 'Hidden' }
            ]
        },
        blink: {
            type: 'select',
            label: 'Blinking Colon',
            default: 'on',
            options: [
                { value: 'on', text: 'On' },
                { value: 'off', text: 'Off' }
            ]
        },
        dots: {
            type: 'select',
            label: 'Edge Dots',
            default: 'show',
            options: [
                { value: 'show', text: 'Show' },
                { value: 'hide', text: 'Hidden' }
            ]
        },
        dust: {
            type: 'select',
            label: 'Dust Motes',
            default: 'on',
            options: [
                { value: 'on', text: 'On' },
                { value: 'off', text: 'Off' }
            ]
        },
        glow: {
            type: 'range',
            label: 'Glow Intensity',
            default: 100,
            min: 0,
            max: 200,
            displaySuffix: '%'
        },
        size: {
            type: 'range',
            label: 'Scale',
            default: 100,
            min: 70,
            max: 140,
            displaySuffix: '%'
        }
    },

    init: function (stage, settings) {
        const s = settings || {};
        this.settings = {};
        for (const [key, cfg] of Object.entries(this.settingsConfig)) {
            this.settings[key] = s[key] !== undefined ? s[key] : cfg.default;
        }

        stage.innerHTML = `
            <div class="vd-root" id="vd-root">
                <div class="vd-halo"></div>
                <div class="vd-silhouette"></div>
                <div class="vd-dustfield" id="vd-dustfield"></div>
                <div class="vd-center">
                    <div class="vd-time">
                        <span id="vd-h">00</span>
                        <span class="vd-colon" id="vd-colon"></span>
                        <span id="vd-m">00</span>
                    </div>
                    <div class="vd-secs" id="vd-secs">00</div>
                    <div class="vd-date" id="vd-date"></div>
                </div>
                <div class="vd-dots">
                    <span></span>
                    <span class="mid"></span>
                    <span></span>
                </div>
            </div>
        `;

        this.els = {
            root: stage.querySelector('#vd-root'),
            h: document.getElementById('vd-h'),
            m: document.getElementById('vd-m'),
            colon: document.getElementById('vd-colon'),
            secs: document.getElementById('vd-secs'),
            date: document.getElementById('vd-date'),
            dustfield: document.getElementById('vd-dustfield')
        };

        this.applyAll();
        this.spawnDust();
        this.update({ h: '00', m: '00', s: '00' });
    },

    applyAll: function () {
        const root = this.els.root;
        if (!root) return;
        const s = this.settings;
        const m = this.MOODS[s.mood] || this.MOODS.ocean;
        const f = this.FONTS[s.font] || this.FONTS.montserrat;

        root.style.setProperty('--vd-bg-top', m.bgTop);
        root.style.setProperty('--vd-bg-bottom', m.bgBottom);
        root.style.setProperty('--vd-horizon', m.horizon);
        root.style.setProperty('--vd-horizon-2', m.horizon2);
        root.style.setProperty('--vd-accent', m.accent);
        root.style.setProperty('--vd-accent-glow', m.glow);
        root.style.setProperty('--vd-ink', m.ink);
        root.style.setProperty('--vd-font', f.family);
        root.style.setProperty('--vd-weight', f.weight);
        root.style.setProperty('--vd-glow', s.glow / 100);
        root.style.setProperty('--vd-scale', s.size / 100);

        root.classList.toggle('vd-no-blink', s.blink !== 'on');
        root.classList.toggle('vd-hide-secs', s.seconds !== 'show');
        root.classList.toggle('vd-hide-date', s.date !== 'show');
        root.classList.toggle('vd-hide-dots', s.dots !== 'show');
        root.classList.toggle('vd-hide-dust', s.dust !== 'on');
    },

    spawnDust: function () {
        const field = this.els.dustfield;
        if (!field) return;
        field.innerHTML = '';
        const count = window.innerWidth < 480 ? 10 : 16;
        for (let i = 0; i < count; i++) {
            const mote = document.createElement('span');
            mote.className = 'vd-dust';
            const size = (2 + Math.random() * 3.5).toFixed(1);
            const x = Math.random() * 100;
            const y = (18 + Math.random() * 70).toFixed(1);
            const driftX = ((Math.random() * 2 - 1) * 60).toFixed(0) + 'px';
            const dur = (9 + Math.random() * 9).toFixed(1);
            const delay = (-Math.random() * 18).toFixed(1);
            mote.style.cssText = `left:${x}%;top:${y}%;width:${size}px;height:${size}px;` +
                `--vd-drift-x:${driftX};animation-duration:${dur}s;animation-delay:${delay}s;`;
            field.appendChild(mote);
        }
    },

    update: function (t) {
        if (!this.els.h) return;
        this.lastTime = t;
        const s = this.settings;

        const hh = parseInt(t.h, 10) || 0;
        if (s.format === '12h' && hh < 24) {
            this.els.h.innerText = String(hh % 12 || 12);
        } else {
            this.els.h.innerText = String(hh).padStart(2, '0');
        }
        this.els.m.innerText = t.m;

        if (s.blink === 'on') {
            const sec = parseInt(t.s, 10) || 0;
            this.els.colon.style.opacity = (sec % 2 === 0) ? 1 : 0.15;
        }

        if (s.seconds === 'show') this.els.secs.innerText = t.s;
        if (s.date === 'show') {
            this.els.date.innerText = new Date().toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
            }).toUpperCase();
        }
    },

    onSettingsChange: function (key, val) {
        this.settings[key] = val;
        this.applyAll();
        if (key === 'dust') this.spawnDust();
        if (this.lastTime) this.update(this.lastTime);
    },

    destroy: function () {
        const root = this.els.root;
        if (root) {
            [
                '--vd-bg-top', '--vd-bg-bottom', '--vd-horizon', '--vd-horizon-2',
                '--vd-accent', '--vd-accent-glow', '--vd-ink', '--vd-font',
                '--vd-weight', '--vd-glow', '--vd-scale'
            ].forEach(v => root.style.removeProperty(v));
        }
        this.els = {};
        this.settings = {};
        this.lastTime = null;
    }
};
