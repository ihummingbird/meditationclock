window.ActiveTheme = {
    els: {},

    settingsConfig: {
        tintColor: {
            type: 'palette',
            label: 'LCD Color',
            default: '#00d5ff',
            options: ['#00d5ff', '#ff8000', '#ff0000', '#39ff14', '#ffffff']
        }
    },

    init(stage, savedSettings = {}) {
        this.destroy();
        this.injectFont(`
            @font-face {
                font-family: "DSEG7 Classic";
                font-style: normal;
                font-weight: 400;
                font-display: swap;
                src: url("https://cdn.jsdelivr.net/gh/keshikan/DSEG@v0.46/dist/DSEG7Classic-Regular.woff2") format("woff2"),
                     url("https://cdn.jsdelivr.net/gh/keshikan/DSEG@v0.46/dist/DSEG7Classic-Regular.woff") format("woff");
            }
        `);

        stage.innerHTML = this.template();
        this.cache(stage);
        this.applyColor(savedSettings.tintColor || '#00d5ff');
    },

    update() { this.updateClock(); },

    onSettingsChange(key, val) {
        if (key === 'tintColor') this.applyColor(val);
    },

    destroy() {
        document.getElementById('theme-font-style')?.remove();
        this.els = {};
    },

    /* helpers */
    cache(stage) {
        this.els = {
            container: stage.querySelector('.lcd-container'),
            time: stage.querySelector('#lcd-time'),
            seconds: stage.querySelector('#lcd-seconds'),
            am: stage.querySelector('#lcd-am'),
            pm: stage.querySelector('#lcd-pm'),
            shortDate: stage.querySelector('#lcd-short-date'),
            fullDate: stage.querySelector('#lcd-full-date')
        };
    },

    updateClock() {
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
    },

    applyColor(hex) {
        const glow = hex + '80';
        const dim = hex + '40';
        this.els.container?.style.setProperty('--lcd-color', hex);
        this.els.container?.style.setProperty('--lcd-glow', glow);
        this.els.container?.style.setProperty('--lcd-dim', dim);
    },

    injectFont(css) {
        const style = document.createElement('style');
        style.id = 'theme-font-style';
        style.textContent = css;
        document.head.appendChild(style);
    },

    template() {
        return `
            <div class="lcd-container segment">
                <div class="top-left lcd-glow">.</div>
                <div class="top-right lcd-glow" id="lcd-full-date"></div>
                <div class="clock-center lcd-glow">
                    <span id="lcd-time">9:00</span>
                    <div id="lcd-ampm">
                        <div id="lcd-am" class="lcd-dim">AM</div>
                        <div id="lcd-pm" class="lcd-dim">PM</div>
                    </div>
                </div>
                <div class="bottom-left lcd-glow" id="lcd-short-date"></div>
                <div class="bottom-right lcd-glow" id="lcd-seconds">00</div>
            </div>
        `;
    }
};