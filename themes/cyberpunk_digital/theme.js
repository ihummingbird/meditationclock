window.ActiveTheme = {
    els: {},

    settingsConfig: {
        // 1. ADDED ZOOM SLIDER
        zoom: {
            type: 'range',
            label: 'Scale Size',
            default: 100,
            min: 50,
            max: 150,
            displaySuffix: '%'
        },
        accentColor: {
            type: 'palette',
            label: 'Accent',
            default: '#7cf9ff',
            options: ['#7cf9ff', '#ff8bff', '#7dff7a', '#ffd062', '#ffffff']
        }
    },

    init(stage, savedSettings = {}) {
        this.destroy(); 
        this.injectLink('https://fonts.googleapis.com/css2?family=Audiowide&display=swap');

        stage.innerHTML = this.template();
        this.cache(stage);

        const accent = savedSettings.accentColor || '#7cf9ff';
        const zoom = savedSettings.zoom || 100;
        
        this.applyAccent(accent);
        this.applyZoom(zoom);
    },

    update() {
        if (!this.els.time) return;

        const now = new Date();
        let h = now.getHours();
        const m = now.getMinutes();
        const s = now.getSeconds();
        const isPM = h >= 12;

        if (h > 12) h -= 12;
        if (h === 0) h = 12;

        this.els.time.textContent = `${h}:${String(m).padStart(2, '0')}`;
        this.els.seconds.textContent = String(s).padStart(2, '0');
        this.els.am.classList.toggle('active', !isPM);
        this.els.pm.classList.toggle('active', isPM);

        const days = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        const fullMonths = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

        this.els.shortDate.textContent = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]}`;
        this.els.fullDate.textContent = `${fullMonths[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        
        this.els.status.textContent = this.statusPhrases[now.getSeconds() % this.statusPhrases.length];
    },

    onSettingsChange(key, val) {
        if (key === 'accentColor') this.applyAccent(val);
        if (key === 'zoom') this.applyZoom(val);
    },

    destroy() {
        const link = document.getElementById('theme-font-link');
        if (link) link.remove();
        this.els = {};
    },

    injectLink(href) {
        if (document.getElementById('theme-font-link')) return;
        const link = document.createElement('link');
        link.id = 'theme-font-link';
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    },

    cache(stage) {
        this.els = {
            bg: stage.querySelector('#theme-bg'), // Cache background for color updates
            scaler: stage.querySelector('#lcd-scaler'), // Cache Scaler
            container: stage.querySelector('.lcd-container'), // Cache Container
            time: stage.querySelector('#lcd-time'),
            seconds: stage.querySelector('#lcd-seconds'),
            am: stage.querySelector('#lcd-am'),
            pm: stage.querySelector('#lcd-pm'),
            shortDate: stage.querySelector('#lcd-short-date'),
            fullDate: stage.querySelector('#lcd-full-date'),
            status: stage.querySelector('#holo-status')
        };
    },

    applyZoom(val) {
        if (this.els.scaler) {
            this.els.scaler.style.transform = `scale(${val / 100})`;
        }
    },

    applyAccent(color) {
        // Apply color to background elements
        if (this.els.bg) {
            this.els.bg.style.setProperty('--accent', color);
            this.els.bg.style.setProperty('--accent-glow', `${color}80`);
        }
        // Apply color to clock elements
        if (this.els.container) {
            this.els.container.style.setProperty('--accent', color);
            this.els.container.style.setProperty('--accent-glow', `${color}80`);
            this.els.container.style.setProperty('--accent-dim', `${color}40`);
        }
    },

    template() {
        return `
            <!-- 1. BACKGROUND LAYER -->
            <div id="theme-bg">
                <div class="grid-overlay"></div>
                <div class="scanline"></div>
            </div>

            <!-- 2. SCALABLE CLOCK LAYER -->
            <div id="lcd-root">
                <div id="lcd-aspect-box">
                    <div id="lcd-scaler">
                        <div class="lcd-container aurora">
                            <div class="top-left lcd-glow" id="holo-status">.</div>
                            <div class="top-right lcd-glow" id="lcd-full-date"></div>

                            <div class="clock-center lcd-glow">
                                <span id="lcd-time">--:--</span>
                                <div id="lcd-ampm">
                                    <div id="lcd-am" class="lcd-dim">AM</div>
                                    <div id="lcd-pm" class="lcd-dim">PM</div>
                                </div>
                            </div>

                            <div class="bottom-left lcd-glow" id="lcd-short-date"></div>
                            <div class="bottom-right lcd-glow">
                                <span id="lcd-seconds">00</span>
                                <div class="pulse-bar"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    statusPhrases: [
        '.', ' ',
    ]
};