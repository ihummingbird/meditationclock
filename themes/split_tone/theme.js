window.ActiveTheme = {
    els: {},
    settings: {},
    lastTime: null,

    settingsConfig: {
        angle: {
            type: 'range',
            label: 'Split Angle',
            default: 135,
            min: 90,
            max: 150,
            displaySuffix: '°'
        },
        dark: {
            type: 'palette',
            label: 'Dark Side',
            default: '#000000',
            options: ['#000000', '#0b0f1a', '#1a1f2e', '#2b1a2e', '#0f1f1a', '#330f0f']
        },
        light: {
            type: 'palette',
            label: 'Light Side',
            default: '#ffffff',
            options: ['#ffffff', '#f4f1ea', '#e8f4ff', '#fff4d6', '#eafff0', '#ffe9e9']
        },
        font: {
            type: 'select',
            label: 'Typeface',
            default: 'inter',
            options: [
                { value: 'inter', text: 'Inter (Heavy)' },
                { value: 'audiowide', text: 'Audiowide' },
                { value: 'mono', text: 'JetBrains Mono' }
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
            default: 'hide',
            options: [
                { value: 'hide', text: 'Hidden' },
                { value: 'show', text: 'Show' }
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
        size: {
            type: 'range',
            label: 'Scale',
            default: 100,
            min: 60,
            max: 150,
            displaySuffix: '%'
        }
    },

    FONTS: {
        inter: { family: "'Inter', 'Helvetica Neue', Arial, sans-serif", weight: 800 },
        audiowide: { family: "'Audiowide', 'Inter', sans-serif", weight: 400 },
        mono: { family: "'JetBrains Mono', 'Courier New', monospace", weight: 700 }
    },

    init: function (stage, settings) {
        const s = settings || {};
        this.settings = {};
        for (const [key, cfg] of Object.entries(this.settingsConfig)) {
            this.settings[key] = s[key] !== undefined ? s[key] : cfg.default;
        }

        stage.innerHTML = `
            <div class="sb-root" id="sb-root">
                <div class="sb-center">
                    <div class="sb-time">
                        <span class="sb-num" id="sb-h">00</span>
                        <span class="sb-colon" id="sb-colon"></span>
                        <span class="sb-num" id="sb-m">00</span>
                    </div>
                    <div class="sb-secs" id="sb-secs">00</div>
                    <div class="sb-date" id="sb-date"></div>
                </div>
                <div class="sb-dots">
                    <span></span>
                    <span class="mid"></span>
                    <span></span>
                </div>
            </div>
        `;

        this.els = {
            root: stage.querySelector('#sb-root'),
            h: document.getElementById('sb-h'),
            m: document.getElementById('sb-m'),
            colon: document.getElementById('sb-colon'),
            secs: document.getElementById('sb-secs'),
            date: document.getElementById('sb-date')
        };

        this.applyAll();
        this.update({ h: '00', m: '00', s: '00' });
    },

    applyAll: function () {
        const root = this.els.root;
        if (!root) return;
        const s = this.settings;

        root.style.setProperty('--sb-angle', s.angle + 'deg');
        root.style.setProperty('--sb-dark', s.dark);
        root.style.setProperty('--sb-light', s.light);
        root.style.setProperty('--sb-size', s.size / 100);

        const f = this.FONTS[s.font] || this.FONTS.inter;
        root.style.setProperty('--sb-font', f.family);
        root.style.setProperty('--sb-weight', f.weight);

        root.classList.toggle('sb-no-blink', s.blink !== 'on');
        root.classList.toggle('sb-hide-secs', s.seconds !== 'show');
        root.classList.toggle('sb-hide-date', s.date !== 'show');
        root.classList.toggle('sb-hide-dots', s.dots !== 'show');
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
            this.els.colon.style.opacity = (sec % 2 === 0) ? 1 : 0.12;
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
        if (this.lastTime) this.update(this.lastTime);
    },

    destroy: function () {
        const root = this.els.root;
        if (root) {
            ['--sb-angle', '--sb-dark', '--sb-light', '--sb-size', '--sb-font', '--sb-weight']
                .forEach(v => root.style.removeProperty(v));
        }
        this.els = {};
        this.settings = {};
        this.lastTime = null;
    }
};
