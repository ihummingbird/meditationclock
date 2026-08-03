window.ActiveTheme = {
    els: {},
    settings: {},

    settingsConfig: {
        city: {
            type: 'select',
            label: 'Location',
            default: 'auto',
            options: [
                { value: 'auto', text: 'Auto (timezone)' },
                { value: 'São Paulo', text: 'São Paulo' },
                { value: 'Tokyo', text: 'Tokyo' },
                { value: 'Paris', text: 'Paris' },
                { value: 'London', text: 'London' },
                { value: 'New York', text: 'New York' },
                { value: 'Los Angeles', text: 'Los Angeles' },
                { value: 'Sydney', text: 'Sydney' },
                { value: 'Mumbai', text: 'Mumbai' },
                { value: 'Dubai', text: 'Dubai' },
                { value: 'Berlin', text: 'Berlin' },
                { value: 'Tehran', text: 'Tehran' },
                { value: 'Cairo', text: 'Cairo' },
                { value: 'Reykjavík', text: 'Reykjavík' }
            ]
        },
        condition: {
            type: 'select',
            label: 'Condition',
            default: 'auto',
            options: [
                { value: 'auto', text: 'Auto (day / night)' },
                { value: 'clear', text: 'Clear' },
                { value: 'partly', text: 'Partly Cloudy' },
                { value: 'rain', text: 'Rain' },
                { value: 'fog', text: 'Fog' },
                { value: 'snow', text: 'Snow' }
            ]
        },
        rain: {
            type: 'select',
            label: 'Chance of Rain',
            default: 'auto',
            options: [
                { value: 'auto', text: 'Auto (daily)' },
                { value: '10', text: '10%' },
                { value: '30', text: '30%' },
                { value: '50', text: '50%' },
                { value: '70', text: '70%' },
                { value: '90', text: '90%' }
            ]
        },
        sun: {
            type: 'palette',
            label: 'Sun Tone',
            default: '#FFD54F',
            options: ['#FFD54F', '#FFB300', '#FF8A65', '#FFF59D', '#FF6F61', '#E1E8F0']
        },
        attribution: {
            type: 'select',
            label: 'Attribution',
            default: 'yes',
            options: [
                { value: 'yes', text: 'Show' },
                { value: 'no', text: 'Hide' }
            ]
        },
        size: {
            type: 'range',
            label: 'Scale',
            default: 100,
            min: 75,
            max: 130,
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
            <div class="sw-root" id="sw-root">
                <div class="sw-widget">
                    <div class="sw-icon">
                        <div class="sw-sun" id="sw-sun">
                            <div class="sw-sun-disc"></div>
                            <div class="sw-sun-rays"></div>
                        </div>
                        <div class="sw-moon" id="sw-moon"></div>
                    </div>

                    <div class="sw-mid">
                        <div class="sw-loc">
                            <span id="sw-city">Home</span>
                            <svg class="sw-xhair" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                stroke-width="1.6" stroke-linecap="round">
                                <circle cx="12" cy="12" r="3.4"/>
                                <line x1="12" y1="1.5" x2="12" y2="5"/>
                                <line x1="12" y1="19" x2="12" y2="22.5"/>
                                <line x1="1.5" y1="12" x2="5" y2="12"/>
                                <line x1="19" y1="12" x2="22.5" y2="12"/>
                            </svg>
                        </div>
                        <div class="sw-cond" id="sw-cond">Clear</div>
                        <div class="sw-rain" id="sw-rain">Chance of rain: 30%</div>
                        <div class="sw-attr" id="sw-attr">Powered by WeatherAPI.com</div>
                    </div>

                    <div class="sw-temp">
                        <div class="sw-time">
                            <span id="sw-h">00</span>
                            <span class="sw-dot" id="sw-dot"></span>
                            <span id="sw-m">00</span>
                        </div>
                        <div class="sw-subs">
                            <div class="sw-sub" id="sw-up">↑ 00°</div>
                            <div class="sw-sub" id="sw-down">↓ 00°</div>
                        </div>
                    </div>
                </div>

                <div class="sw-dots">
                    <span></span><span class="active"></span><span></span>
                </div>
            </div>
        `;

        this.els = {
            root: stage.querySelector('#sw-root'),
            h: document.getElementById('sw-h'),
            m: document.getElementById('sw-m'),
            dot: document.getElementById('sw-dot'),
            up: document.getElementById('sw-up'),
            down: document.getElementById('sw-down'),
            city: document.getElementById('sw-city'),
            cond: document.getElementById('sw-cond'),
            rain: document.getElementById('sw-rain'),
            attr: document.getElementById('sw-attr')
        };

        this.applyCity(this.settings.city);
        this.applySunTone(this.settings.sun);
        this.applyAttribution(this.settings.attribution);
        this.applyScale(this.settings.size);
        this.applyRain(this.settings.rain);
        this.applyCondition();
    },

    autoCity: function () {
        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (!tz || tz === 'UTC' || !tz.includes('/')) return 'Home';
            return tz.split('/').pop().replace(/_/g, ' ');
        } catch (e) {
            return 'Home';
        }
    },

    applyCity: function (val) {
        if (!this.els.city) return;
        if (val && val !== 'auto') {
            this.els.city.innerText = val;
        } else {
            this.els.city.innerText = this.autoCity();
        }
    },

    applySunTone: function (val) {
        const root = this.els.root;
        if (!root) return;
        root.style.setProperty('--sw-sun', val);
        root.style.setProperty('--sw-sun-glow', val + '40');
    },

    applyAttribution: function (val) {
        if (this.els.attr) this.els.attr.style.display = (val === 'no') ? 'none' : '';
    },

    applyScale: function (val) {
        const root = this.els.root;
        if (root) root.style.setProperty('--sw-scale', (val / 100));
    },

    applyRain: function (val) {
        if (!this.els.rain) return;
        let chance;
        if (val === 'auto') {
            const now = new Date();
            const start = Date.UTC(now.getFullYear(), 0, 0);
            const doy = Math.floor((now - start) / 86400000);
            chance = (doy * 37 + now.getMonth() * 13 + now.getDate()) % 91;
        } else {
            chance = parseInt(val, 10);
        }
        this.els.rain.innerText = 'Chance of rain: ' + chance + '%';
    },

    applyCondition: function () {
        if (!this.els.cond) return;
        const c = this.settings.condition;
        const now = new Date();
        const hour = now.getHours();
        const isDay = hour >= 6 && hour < 18;

        let text;
        if (c === 'auto') {
            text = isDay ? 'Clear' : 'Clear Night';
        } else {
            const map = { clear: 'Clear', partly: 'Partly Cloudy', rain: 'Rain', fog: 'Fog', snow: 'Snow' };
            text = map[c] || 'Clear';
        }
        this.els.cond.innerText = text;

        // Swap sun ↔ moon with the night
        const showSun = isDay;
        this.els.root.classList.toggle('sw-night', !showSun);
    },

    update: function (t) {
        if (!this.els.h) return;
        this.els.h.innerText = t.h;
        this.els.m.innerText = t.m;

        const sec = parseInt(t.s, 10) || 0;
        // The °-dot blinks like a clock colon
        this.els.dot.style.opacity = (sec % 2 === 0) ? 1 : 0.15;
        this.els.up.innerText = '↑ ' + String(sec).padStart(2, '0') + '°';
        this.els.down.innerText = '↓ ' + String(59 - sec).padStart(2, '0') + '°';

        // Keep day/night state and condition text fresh (cheap class toggle)
        this.applyCondition();
    },

    onSettingsChange: function (key, val) {
        this.settings[key] = val;
        if (key === 'city') this.applyCity(val);
        if (key === 'condition') this.applyCondition();
        if (key === 'rain') this.applyRain(val);
        if (key === 'sun') this.applySunTone(val);
        if (key === 'attribution') this.applyAttribution(val);
        if (key === 'size') this.applyScale(val);
    },

    destroy: function () {
        const root = this.els.root;
        if (root) {
            ['--sw-sun', '--sw-sun-glow', '--sw-scale'].forEach(v => root.style.removeProperty(v));
        }
        this.els = {};
        this.settings = {};
    }
};
