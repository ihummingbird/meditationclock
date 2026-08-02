window.ActiveTheme = {
    els: {},
    circumference: 0,

    settingsConfig: {
        tint: {
            type: 'palette',
            label: 'Moonlight',
            default: 45,
            options: [45, 220, 330, 160, 10, 280]
        },
        glow: {
            type: 'range',
            label: 'Moon Glow',
            default: 60,
            min: 20,
            max: 100,
            displaySuffix: '%'
        },
        stars: {
            type: 'select',
            label: 'Starfield',
            default: 'dense',
            options: [
                { value: 'sparse', text: 'Sparse' },
                { value: 'dense', text: 'Dense' },
                { value: 'full', text: 'Full Sky' }
            ]
        },
        scale: {
            type: 'range',
            label: 'Size',
            default: 100,
            min: 60,
            max: 130,
            displaySuffix: '%'
        }
    },

    init: function (stage, settings) {
        this.circumference = 2 * Math.PI * 480;
        const s = settings || {};

        stage.innerHTML = `
            <div class="mf-stage" id="mf-root">
                <div class="mf-sky">
                    <div class="mf-stars" id="mf-stars"></div>
                    <div class="mf-nebula"></div>
                    <div class="mf-shooting mf-shooting-1"></div>
                    <div class="mf-shooting mf-shooting-2"></div>
                    <div class="mf-shooting mf-shooting-3"></div>
                </div>

                <div class="mf-moon" id="mf-moon">
                    <div class="mf-moon-disc"></div>
                    <div class="mf-halo mf-halo-1"></div>
                    <div class="mf-halo mf-halo-2"></div>
                </div>

                <div class="mf-card" id="mf-card">
                    <div class="mf-sec-arc">
                        <svg viewBox="0 0 1000 1000">
                            <circle class="mf-arc-track" cx="500" cy="500" r="480" />
                            <circle class="mf-arc-fill" id="mf-arc" cx="500" cy="500" r="480"
                                stroke-dasharray="${this.circumference}"
                                stroke-dashoffset="${this.circumference}" />
                        </svg>
                    </div>
                    <div class="mf-time">
                        <span class="mf-hours" id="mf-h">00</span>
                        <span class="mf-sep"></span>
                        <span class="mf-minutes" id="mf-m">00</span>
                    </div>
                    <div class="mf-seconds"><span id="mf-s">00</span></div>
                    <div class="mf-date" id="mf-date">LOADING</div>
                </div>

                <div class="mf-hills">
                    <div class="mf-hill mf-hill-1"></div>
                    <div class="mf-hill mf-hill-2"></div>
                    <div class="mf-hill mf-hill-3"></div>
                </div>
            </div>
        `;

        this.els = {
            stage: stage.querySelector('.mf-stage'),
            h: document.getElementById('mf-h'),
            m: document.getElementById('mf-m'),
            s: document.getElementById('mf-s'),
            date: document.getElementById('mf-date'),
            arc: document.getElementById('mf-arc'),
            stars: document.getElementById('mf-stars'),
            moon: document.getElementById('mf-moon')
        };

        this.applyTint(s.tint ?? this.settingsConfig.tint.default);
        this.applyGlow(s.glow ?? this.settingsConfig.glow.default);
        this.applyScale(s.scale ?? this.settingsConfig.scale.default);
        this.createStars(s.stars ?? this.settingsConfig.stars.default);
    },

    createStars: function (density) {
        if (!this.els.stars) return;
        this.els.stars.innerHTML = '';
        const counts = { sparse: 60, dense: 140, full: 230 };
        const count = counts[density] || 140;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'mf-star';
            star.style.left = (Math.random() * 100) + '%';
            star.style.top = (Math.random() * 100) + '%';
            const size = 0.8 + Math.random() * 2.2;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.setProperty('--mf-d', (2.5 + Math.random() * 5).toFixed(2) + 's');
            star.style.setProperty('--mf-delay', (Math.random() * 9).toFixed(2) + 's');
            if (Math.random() > 0.75) star.classList.add('mf-star-bright');
            frag.appendChild(star);
        }
        this.els.stars.appendChild(frag);
    },

    update: function (t) {
        if (!this.els.h) return;
        this.els.h.innerText = t.h;
        this.els.m.innerText = t.m;
        this.els.s.innerText = t.s;

        const secNum = parseInt(t.s, 10);
        const offset = this.circumference - (secNum / 60) * this.circumference;
        this.els.arc.style.strokeDashoffset = offset;

        const now = new Date();
        this.els.date.textContent = now.toLocaleDateString('en-US', {
            weekday: 'short', month: 'long', day: 'numeric'
        }).toUpperCase();
    },

    applyTint: function (val) {
        const h = Number(val);
        const el = this.els.stage;
        if (!el) return;
        el.style.setProperty('--mf-moon', `hsl(${h}, 55%, 88%)`);
        el.style.setProperty('--mf-crater', `hsl(${h}, 40%, 74%)`);
        el.style.setProperty('--mf-glow', `hsl(${h}, 80%, 78%)`);
    },

    applyGlow: function (val) {
        const el = this.els.stage;
        if (el) el.style.setProperty('--mf-glow-i', val / 100);
    },

    applyScale: function (val) {
        const el = document.getElementById('mf-moon');
        if (el) el.style.transform = `translate(-50%, -50%) scale(${val / 100})`;
    },

    onSettingsChange: function (key, val) {
        if (key === 'tint') this.applyTint(val);
        if (key === 'glow') this.applyGlow(val);
        if (key === 'stars') this.createStars(val);
        if (key === 'scale') this.applyScale(val);
    },

    destroy: function () {
        const el = this.els.stage;
        if (el) {
            ['--mf-moon', '--mf-crater', '--mf-glow', '--mf-glow-i'].forEach(
                v => el.style.removeProperty(v)
            );
        }
        this.els = {};
    }
};
