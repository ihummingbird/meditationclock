window.ActiveTheme = {
    els: {},
    circumference: 0,

    settingsConfig: {
        tone: {
            type: 'palette',
            label: 'Sunset Tone',
            default: 32,
            options: [32, 18, 45, 8, 355, 60]
        },
        glow: {
            type: 'range',
            label: 'Sun Glow',
            default: 60,
            min: 20,
            max: 100,
            displaySuffix: '%'
        },
        ripple: {
            type: 'range',
            label: 'Horizon Ripple',
            default: 50,
            min: 0,
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
            <div class="gh-stage" id="gh-root">
                <div class="gh-sky">
                    <div class="gh-halo gh-halo-1"></div>
                    <div class="gh-halo gh-halo-2"></div>
                    <div class="gh-cloud gh-cloud-1"></div>
                    <div class="gh-cloud gh-cloud-2"></div>
                    <div class="gh-cloud gh-cloud-3"></div>
                </div>

                <div class="gh-sun">
                    <div class="gh-sun-disc"></div>
                    <div class="gh-sun-ring"></div>
                </div>

                <div class="gh-sea">
                    <div class="gh-glow-path"></div>
                    <div class="gh-ripple"></div>
                    <div class="gh-ripple"></div>
                    <div class="gh-ripple"></div>
                    <div class="gh-ripple"></div>
                </div>

                <div class="gh-card" id="gh-card">
                    <div class="gh-sec-arc">
                        <svg viewBox="0 0 1000 1000">
                            <circle class="gh-arc-track" cx="500" cy="500" r="480" />
                            <circle class="gh-arc-fill" id="gh-arc" cx="500" cy="500" r="480"
                                stroke-dasharray="${this.circumference}"
                                stroke-dashoffset="${this.circumference}" />
                        </svg>
                    </div>
                    <div class="gh-overline" id="gh-date">LOADING</div>
                    <div class="gh-time">
                        <span class="gh-hours" id="gh-h">00</span>
                        <span class="gh-colon">:</span>
                        <span class="gh-minutes" id="gh-m">00</span>
                    </div>
                    <div class="gh-seconds"><span id="gh-s">00</span></div>
                </div>
            </div>
        `;

        this.els = {
            stage: stage.querySelector('.gh-stage'),
            h: document.getElementById('gh-h'),
            m: document.getElementById('gh-m'),
            s: document.getElementById('gh-s'),
            date: document.getElementById('gh-date'),
            arc: document.getElementById('gh-arc')
        };

        this.applyTone(s.tone ?? this.settingsConfig.tone.default);
        this.applyGlow(s.glow ?? this.settingsConfig.glow.default);
        this.applyRipple(s.ripple ?? this.settingsConfig.ripple.default);
        this.applyScale(s.scale ?? this.settingsConfig.scale.default);
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
            weekday: 'long', month: 'long', day: 'numeric'
        }).toUpperCase();
    },

    applyTone: function (val) {
        const h = Number(val);
        const el = this.els.stage;
        if (!el) return;
        el.style.setProperty('--gh-sun', `hsl(${h}, 92%, 62%)`);
        el.style.setProperty('--gh-deep', `hsl(${h}, 75%, 38%)`);
        el.style.setProperty('--gh-mid', `hsl(${(h + 22) % 360}, 88%, 58%)`);
        el.style.setProperty('--gh-soft', `hsl(${(h + 40) % 360}, 92%, 78%)`);
        el.style.setProperty('--gh-accent', `hsl(${h}, 90%, 55%)`);
    },

    applyGlow: function (val) {
        const el = this.els.stage;
        if (el) el.style.setProperty('--gh-glow', val / 100);
    },

    applyRipple: function (val) {
        const el = this.els.stage;
        if (el) el.style.setProperty('--gh-ripple', val / 100);
    },

    applyScale: function (val) {
        const el = document.getElementById('gh-card');
        if (el) el.style.transform = `scale(${val / 100})`;
    },

    onSettingsChange: function (key, val) {
        if (key === 'tone') this.applyTone(val);
        if (key === 'glow') this.applyGlow(val);
        if (key === 'ripple') this.applyRipple(val);
        if (key === 'scale') this.applyScale(val);
    },

    destroy: function () {
        const el = this.els.stage;
        if (el) {
            ['--gh-sun', '--gh-deep', '--gh-mid', '--gh-soft', '--gh-accent', '--gh-glow', '--gh-ripple'].forEach(
                v => el.style.removeProperty(v)
            );
        }
        this.els = {};
    }
};
