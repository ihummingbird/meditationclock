window.ActiveTheme = {
    els: {},
    circumference: 0,

    settingsConfig: {
        hue: {
            type: 'palette',
            label: 'Aurora',
            default: 175,
            options: [175, 145, 285, 320, 195, 225]
        },
        speed: {
            type: 'range',
            label: 'Flow Speed',
            default: 50,
            min: 10,
            max: 100,
            displaySuffix: '%'
        },
        glow: {
            type: 'range',
            label: 'Aurora Intensity',
            default: 60,
            min: 20,
            max: 100,
            displaySuffix: '%'
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
            <div class="aw-stage" id="aw-root">
                <div class="aw-sky">
                    <div class="aw-stars" id="aw-stars"></div>
                    <div class="aw-aurora aw-aurora-1"></div>
                    <div class="aw-aurora aw-aurora-2"></div>
                    <div class="aw-aurora aw-aurora-3"></div>
                    <div class="aw-aurora aw-aurora-4"></div>
                    <div class="aw-landscape">
                        <div class="aw-mountain aw-mountain-1"></div>
                        <div class="aw-mountain aw-mountain-2"></div>
                        <div class="aw-mountain aw-mountain-3"></div>
                    </div>
                </div>

                <div class="aw-capsule" id="aw-capsule">
                    <div class="aw-sec-arc">
                        <svg viewBox="0 0 1000 1000">
                            <circle class="aw-arc-track" cx="500" cy="500" r="480" />
                            <circle class="aw-arc-fill" id="aw-arc" cx="500" cy="500" r="480"
                                stroke-dasharray="${this.circumference}"
                                stroke-dashoffset="${this.circumference}" />
                        </svg>
                    </div>
                    <div class="aw-time">
                        <span class="aw-hours" id="aw-h">00</span>
                        <span class="aw-sep"></span>
                        <span class="aw-minutes" id="aw-m">00</span>
                    </div>
                    <div class="aw-seconds"><span id="aw-s">00</span></div>
                    <div class="aw-date" id="aw-date">LOADING</div>
                </div>
            </div>
        `;

        this.els = {
            stage: stage.querySelector('.aw-stage'),
            h: document.getElementById('aw-h'),
            m: document.getElementById('aw-m'),
            s: document.getElementById('aw-s'),
            date: document.getElementById('aw-date'),
            arc: document.getElementById('aw-arc'),
            stars: document.getElementById('aw-stars')
        };

        this.applyHue(s.hue ?? this.settingsConfig.hue.default);
        this.applySpeed(s.speed ?? this.settingsConfig.speed.default);
        this.applyGlow(s.glow ?? this.settingsConfig.glow.default);
        this.applyScale(s.scale ?? this.settingsConfig.scale.default);
        this.createStars();
    },

    createStars: function () {
        if (!this.els.stars) return;
        this.els.stars.innerHTML = '';
        const frag = document.createDocumentFragment();
        const count = 90;
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'aw-star';
            star.style.left = (Math.random() * 100) + '%';
            star.style.top = (Math.random() * 72) + '%';
            const size = 1 + Math.random() * 2.2;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            star.style.setProperty('--aw-d', (3 + Math.random() * 5).toFixed(2) + 's');
            star.style.setProperty('--aw-delay', (Math.random() * 8).toFixed(2) + 's');
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
            weekday: 'short', month: 'short', day: 'numeric'
        });
    },

    applyHue: function (val) {
        const h = Number(val);
        const el = this.els.stage;
        if (!el) return;
        el.style.setProperty('--aw-a1', `hsl(${h}, 85%, 62%)`);
        el.style.setProperty('--aw-a2', `hsl(${(h + 55) % 360}, 85%, 58%)`);
        el.style.setProperty('--aw-a3', `hsl(${(h + 110) % 360}, 80%, 55%)`);
        el.style.setProperty('--aw-glow', `hsl(${h}, 90%, 72%)`);
    },

    applySpeed: function (val) {
        const el = this.els.stage;
        if (el) el.style.setProperty('--aw-speed', val / 50);
    },

    applyGlow: function (val) {
        const el = this.els.stage;
        if (el) el.style.setProperty('--aw-glow-i', val / 100);
    },

    applyScale: function (val) {
        const el = document.getElementById('aw-capsule');
        if (el) el.style.transform = `translate(-50%, -50%) scale(${val / 100})`;
    },

    onSettingsChange: function (key, val) {
        if (key === 'hue') this.applyHue(val);
        if (key === 'speed') this.applySpeed(val);
        if (key === 'glow') this.applyGlow(val);
        if (key === 'scale') this.applyScale(val);
    },

    destroy: function () {
        const el = this.els.stage;
        if (el) {
            ['--aw-a1', '--aw-a2', '--aw-a3', '--aw-glow', '--aw-speed', '--aw-glow-i'].forEach(
                v => el.style.removeProperty(v)
            );
        }
        this.els = {};
    }
};
