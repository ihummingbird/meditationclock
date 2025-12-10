window.ActiveTheme = {
    els: {},
    state: {},

    settingsConfig: {
        scale: {
            type: 'range',
            label: 'Scale',
            default: 100,
            min: 75,
            max: 120,
            displaySuffix: '%'
        },
        palette: {
            type: 'palette',
            label: 'Accent Palette',
            default: '#7cd7ff',
            options: ['#7cd7ff', '#ff9ed1', '#ffd479', '#8dd4ff', '#9dffda', '#ffb4ff']
        },
        grain: {
            type: 'range',
            label: 'Grain Strength',
            default: 18,
            min: 0,
            max: 40,
            displaySuffix: '%'
        },
        speed: {
            type: 'range',
            label: 'Scan Speed',
            default: 22,
            min: 12,
            max: 40,
            displaySuffix: 's'
        },
        glow: {
            type: 'range',
            label: 'Light Band',
            default: 60,
            min: 0,
            max: 100,
            displaySuffix: '%'
        },
        layout: {
            type: 'select',
            label: 'Layout',
            default: 'split',
            options: [
                { value: 'split', text: 'Split' },
                { value: 'stack', text: 'Stacked' }
            ]
        },
        accent: {
            type: 'select',
            label: 'Accent Style',
            default: 'line',
            options: [
                { value: 'line', text: 'Line' },
                { value: 'orbit', text: 'Orbit' }
            ]
        }
    },

    init(stage, settings) {
        stage.innerHTML = `
            <div class="horizon-stage">
                <div class="sky-glow"></div>
                <div class="aurora-band"></div>
                <div class="scanline"></div>
                <div class="grain-layer"></div>
                <div class="safe-box">
                    <div class="horizon-panel" data-layout="split" data-accent="line">
                        <div class="panel-overlay"></div>
                        <div class="light-band"></div>
                        <div class="loom-grid">
                            <div class="time-block">
                                <div class="time-main">
                                    <span class="hh">00</span>
                                    <span class="colon">:</span>
                                    <span class="mm">00</span>
                                </div>
                                <div class="seconds-pill"><span class="ss">00</span></div>
                            </div>
                            <div class="info-block">
                                <div class="date-line">MON / JAN 01</div>
                                <div class="mantra">FLOAT</div>
                                <div class="progress-wrap">
                                    <div class="progress-label">DAYLIGHT RATIO</div>
                                    <div class="progress-bar"><span class="fill"></span></div>
                                </div>
                                <div class="ticker">
                                    <span class="zone">UTC</span>
                                    <span class="phase">DAWN</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.els = {
            hh: stage.querySelector('.hh'),
            mm: stage.querySelector('.mm'),
            colon: stage.querySelector('.colon'),
            ss: stage.querySelector('.ss'),
            date: stage.querySelector('.date-line'),
            mantra: stage.querySelector('.mantra'),
            fill: stage.querySelector('.progress-bar .fill'),
            zone: stage.querySelector('.zone'),
            phase: stage.querySelector('.phase'),
            panel: stage.querySelector('.horizon-panel')
        };

        this.state = {
            scale: settings.scale ?? this.settingsConfig.scale.default,
            palette: settings.palette ?? this.settingsConfig.palette.default,
            grain: settings.grain ?? this.settingsConfig.grain.default,
            speed: settings.speed ?? this.settingsConfig.speed.default,
            glow: settings.glow ?? this.settingsConfig.glow.default,
            layout: settings.layout ?? this.settingsConfig.layout.default,
            accent: settings.accent ?? this.settingsConfig.accent.default
        };

        this.applySettings();
    },

    applySettings() {
        const root = document.documentElement;
        const s = this.state;

        root.style.setProperty('--hl-scale', (s.scale / 100).toString());
        root.style.setProperty('--hl-grain', (s.grain / 100).toString());
        root.style.setProperty('--hl-scan-speed', `${s.speed}s`);
        root.style.setProperty('--hl-band', (s.glow / 100).toString());

        root.style.setProperty('--hl-accent', s.palette);
        const { accent2, accent3 } = this.derivePalette(s.palette);
        root.style.setProperty('--hl-accent2', accent2);
        root.style.setProperty('--hl-accent3', accent3);

        if (this.els.panel) {
            this.els.panel.dataset.layout = s.layout;
            this.els.panel.dataset.accent = s.accent;
        }
    },

    derivePalette(color) {
        const table = {
            '#7cd7ff': { accent2: '#ff9ed1', accent3: '#ffd579' },
            '#ff9ed1': { accent2: '#7cd7ff', accent3: '#ffb48a' },
            '#ffd479': { accent2: '#ff8c6b', accent3: '#8ecbff' },
            '#8dd4ff': { accent2: '#b799ff', accent3: '#ffd88b' },
            '#9dffda': { accent2: '#7ec7ff', accent3: '#ffc9fb' },
            '#ffb4ff': { accent2: '#9ad8ff', accent3: '#ffd479' }
        };
        return table[color] || table['#7cd7ff'];
    },

    update(time) {
        if (!this.els.hh) return;

        this.els.hh.textContent = time.h;
        this.els.mm.textContent = time.m;
        this.els.ss.textContent = time.s;
        this.els.colon.style.opacity = (parseInt(time.s, 10) % 2 === 0) ? 1 : 0.2;

        const now = new Date();
        const weekday = now.toLocaleString('en', { weekday: 'short' }).toUpperCase();
        const month = now.toLocaleString('en', { month: 'short' }).toUpperCase();
        const day = String(now.getDate()).padStart(2, '0');
        this.els.date.textContent = `${weekday} / ${month} ${day}`;

        const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
        this.els.zone.textContent = zone.toUpperCase();

        const cues = ['FLOAT', 'LISTEN', 'CENTER', 'EXHALE', 'DRIFT', 'SOFTEN'];
        this.els.mantra.textContent = cues[now.getMinutes() % cues.length];

        const secondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const pct = (secondsToday / 86400) * 100;
        this.els.fill.style.width = `${pct}%`;

        const phases = ['DAWN','MIDDAY','DUSK','NIGHT'];
        const phaseIndex = Math.floor((secondsToday / 86400) * phases.length) % phases.length;
        this.els.phase.textContent = phases[phaseIndex];
    },

    onSettingsChange(key, value) {
        if (['scale','grain','speed','glow'].includes(key)) {
            this.state[key] = Number(value);
        } else {
            this.state[key] = value;
        }
        this.applySettings();
    },

    destroy() {
        this.els = {};
    }
};