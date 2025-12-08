const Engine = {
    // 1. REGISTRY
    themes: [
        { id: 'simple', name: 'Simple Digital' },
        { id: 'breathe', name: 'Deep Breathing' },
        { id: 'ios', name: 'Standby Mode' },
        { id: 'analog', name: 'Analog Standby' },
        { id: 'lcd', name: 'Retro LCD' },
        { id: 'lcd2', name: 'Retro LCD 2' },
        { id: 'lcd3', name: 'Retro LCD 3' },
        { id: 'lcd4', name: 'Retro LCD 4' },
        { id: 'another5', name: 'Retro LCD 5' },
        { id: 'analog6', name: 'Retro LCD 6' },
        { id: 'lcd7', name: 'Retro LCD 7' },
         // NEW  
    ],

    state: {
        activeThemeId: 'simple',
        themeSettings: {}
    },
    
    // Session State
    session: {
        active: false,
        finished: false,
        startTime: null,
        elapsed: 0
    },

    currentThemeObj: null,

    dom: {
        stage: document.getElementById('stage'),
        cssLink: document.getElementById('theme-stylesheet'),
        
        libraryDrawer: document.getElementById('library-drawer'),
        settingsDrawer: document.getElementById('settings-panel'),
        themeGrid: document.getElementById('theme-grid'),
        settingsContent: document.getElementById('settings-content'),
        
        btnFullscreen: document.getElementById('btn-fullscreen'),
        btnExitFs: document.getElementById('btn-exit-fs'),

        sessionHandle: document.getElementById('session-handle'),
        sessionPanel: document.getElementById('session-panel'),
        sessionTimer: document.getElementById('session-timer'),
        sessionBtn: document.getElementById('btn-session-toggle'),
        sessionText: document.getElementById('session-status-text')
    },

    init: function() {
        this.loadState();
        
        // Listeners
        document.getElementById('btn-library').addEventListener('click', () => this.toggleDrawer('library'));
        document.getElementById('btn-close-library').addEventListener('click', () => this.closeDrawers());

        document.getElementById('btn-settings').addEventListener('click', () => this.toggleDrawer('settings'));
        document.getElementById('btn-close-settings').addEventListener('click', () => this.closeDrawers());

        this.dom.btnFullscreen.addEventListener('click', () => this.enterFullscreen());
        this.dom.btnExitFs.addEventListener('click', () => this.exitFullscreen());
        
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(
            eventType => document.addEventListener(eventType, () => this.handleFullscreenChange(), false)
        );

        this.dom.sessionHandle.addEventListener('click', () => {
            this.dom.sessionPanel.classList.toggle('active');
            this.closeDrawers();
        });

        this.dom.sessionBtn.addEventListener('click', () => {
            this.handleSessionClick();
        });

        this.buildLibraryUI();
        this.loadTheme(this.state.activeThemeId);
        this.startClock();
    },

    handleSessionClick: function() {
        const s = this.session;
        if (!s.active && !s.finished) {
            s.active = true;
            s.startTime = Date.now();
            this.dom.sessionBtn.innerText = "Stop Session";
            this.dom.sessionBtn.classList.add('stop-mode');
            this.dom.sessionHandle.classList.add('meditating');
            this.dom.sessionText.innerText = "In Progress";
            this.dom.sessionTimer.classList.remove('finished');
            setTimeout(() => { this.dom.sessionPanel.classList.remove('active'); }, 500);
            return;
        }
        if (s.active) {
            s.active = false;
            s.finished = true;
            s.elapsed = Date.now() - s.startTime;
            this.dom.sessionBtn.innerText = "Start New Session";
            this.dom.sessionBtn.classList.remove('stop-mode');
            this.dom.sessionHandle.classList.remove('meditating');
            this.dom.sessionText.innerText = "Session Complete";
            this.dom.sessionTimer.classList.add('finished');
            this.dom.sessionTimer.innerText = this.formatTime(s.elapsed);
            return;
        }
        if (s.finished) {
            s.finished = false;
            s.elapsed = 0;
            s.startTime = null;
            this.dom.sessionBtn.innerText = "Begin Meditation";
            this.dom.sessionTimer.innerText = "00:00:00";
            this.dom.sessionTimer.classList.remove('finished');
            this.dom.sessionText.innerText = "Start Session";
            return;
        }
    },
    
    enterFullscreen: function() {
        const elem = document.documentElement;
        const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
        document.body.classList.add('fullscreen-mode');
        this.closeDrawers();
        this.dom.sessionPanel.classList.remove('active');
        if (req) req.call(elem).catch(err => console.log("Fullscreen blocked:", err));
    },

    exitFullscreen: function() {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) exit.call(document);
        document.body.classList.remove('fullscreen-mode');
    },

    handleFullscreenChange: function() {
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (!isFullscreen) document.body.classList.remove('fullscreen-mode');
        else document.body.classList.add('fullscreen-mode');
    },

    formatTime: function(ms) {
        const totalSecs = Math.floor(ms / 1000);
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        const pad = (n) => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    },

    toggleDrawer: function(type) {
        if (type === 'library') {
            this.dom.libraryDrawer.classList.add('active');
            this.dom.settingsDrawer.classList.remove('active');
        } else {
            this.dom.settingsDrawer.classList.add('active');
            this.dom.libraryDrawer.classList.remove('active');
        }
        this.dom.sessionPanel.classList.remove('active');
    },

    closeDrawers: function() {
        this.dom.libraryDrawer.classList.remove('active');
        this.dom.settingsDrawer.classList.remove('active');
    },

    buildLibraryUI: function() {
        const container = this.dom.themeGrid;
        container.innerHTML = ''; 
        this.themes.forEach(theme => {
            const tile = document.createElement('div');
            tile.className = 'theme-tile';
            if (theme.id === this.state.activeThemeId) tile.classList.add('active');

            const text = document.createElement('span');
            text.className = 'tile-text';
            text.innerText = theme.name;
            const dot = document.createElement('div');
            dot.className = 'tile-dot';
            
            tile.appendChild(text);
            tile.appendChild(dot);
            tile.addEventListener('click', () => {
                this.loadTheme(theme.id);
                this.buildLibraryUI(); 
            });
            container.appendChild(tile);
        });
    },

    loadTheme: function(themeId) {
        if (this.currentThemeObj && this.currentThemeObj.destroy) this.currentThemeObj.destroy();
        this.state.activeThemeId = themeId;
        this.saveState();
        this.dom.cssLink.href = `themes/${themeId}/theme.css`;
        const oldScript = document.getElementById('theme-script');
        if (oldScript) oldScript.remove();
        const script = document.createElement('script');
        script.src = `themes/${themeId}/theme.js`;
        script.id = 'theme-script';
        script.onload = () => {
            if (window.ActiveTheme) {
                this.currentThemeObj = window.ActiveTheme;
                const saved = this.state.themeSettings[themeId] || {};
                this.currentThemeObj.init(this.dom.stage, saved);
                this.buildSettingsUI(themeId);
                this.tick();
            }
        };
        document.body.appendChild(script);
    },

    // --- UPGRADED SETTINGS BUILDER (RANGE + PALETTE + DROPDOWN) ---
    buildSettingsUI: function(themeId) {
        const container = this.dom.settingsContent;
        container.innerHTML = '';

        if (!this.currentThemeObj || !this.currentThemeObj.settingsConfig) {
            container.innerHTML = '<div style="color:#444; font-size:10px; text-transform:uppercase;">No Configuration</div>';
            return;
        }

        const config = this.currentThemeObj.settingsConfig;

        for (const [key, setting] of Object.entries(config)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'setting-item';

            // TYPE: RANGE (Slider)
            if (setting.type === 'range') {
                const labelRow = document.createElement('div');
                labelRow.style.display = 'flex';
                labelRow.style.justifyContent = 'space-between';
                labelRow.style.marginBottom = '10px';

                const label = document.createElement('span');
                label.className = 'setting-label';
                label.style.marginBottom = '0';
                label.innerText = setting.label;
                
                const valIndicator = document.createElement('span');
                valIndicator.className = 'setting-label';
                valIndicator.style.color = 'white';
                
                const currentVal = this.state.themeSettings[themeId]?.[key] || setting.default;
                const suffix = setting.displaySuffix || '';
                valIndicator.innerText = `${currentVal}${suffix}`;

                labelRow.appendChild(label);
                labelRow.appendChild(valIndicator);
                wrapper.appendChild(labelRow);

                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = setting.min;
                slider.max = setting.max;
                slider.value = currentVal;
                
                slider.oninput = (e) => {
                    valIndicator.innerText = `${e.target.value}${suffix}`;
                    this.updateSetting(themeId, key, e.target.value);
                };
                wrapper.appendChild(slider);
            }

            // TYPE: PALETTE (Color Circles)
            else if (setting.type === 'palette') {
                const label = document.createElement('span');
                label.className = 'setting-label';
                label.innerText = setting.label;
                wrapper.appendChild(label);

                const grid = document.createElement('div');
                grid.className = 'palette-grid';
                
                setting.options.forEach(color => {
                    const swatch = document.createElement('div');
                    swatch.className = 'color-swatch';
                    swatch.style.backgroundColor = color;
                    
                    const currentVal = this.state.themeSettings[themeId]?.[key] || setting.default;
                    if (color === currentVal) swatch.classList.add('active');

                    swatch.onclick = () => {
                        this.updateSetting(themeId, key, color);
                        this.buildSettingsUI(themeId); // Rebuild to update border
                    };
                    grid.appendChild(swatch);
                });
                wrapper.appendChild(grid);
            }

            // TYPE: DROPDOWN (New Select Logic)
            else if (setting.type === 'select') {
                const label = document.createElement('span');
                label.className = 'setting-label';
                label.innerText = setting.label;
                wrapper.appendChild(label);

                const select = document.createElement('select');
                select.className = 'setting-select'; // We will style this in CSS
                
                setting.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.innerText = opt.text;
                    if (opt.value == (this.state.themeSettings[themeId]?.[key] || setting.default)) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });

                select.onchange = (e) => {
                    this.updateSetting(themeId, key, e.target.value);
                };
                wrapper.appendChild(select);
            }

            container.appendChild(wrapper);
        }
    },

    updateSetting: function(themeId, key, value) {
        if (!this.state.themeSettings[themeId]) this.state.themeSettings[themeId] = {};
        this.state.themeSettings[themeId][key] = value;
        this.saveState();
        if (this.currentThemeObj.onSettingsChange) this.currentThemeObj.onSettingsChange(key, value);
    },

    saveState: function() {
        localStorage.setItem('meditation_os_state', JSON.stringify(this.state));
    },

    loadState: function() {
        const saved = localStorage.getItem('meditation_os_state');
        if (saved) this.state = { ...this.state, ...JSON.parse(saved) };
    },

    startClock: function() { setInterval(() => this.tick(), 1000); },

    tick: function() {
        if (this.currentThemeObj) {
            const now = new Date();
            this.currentThemeObj.update({
                h: String(now.getHours()).padStart(2, '0'),
                m: String(now.getMinutes()).padStart(2, '0'),
                s: String(now.getSeconds()).padStart(2, '0')
            });
        }
        if (this.session.active) {
            const diff = Date.now() - this.session.startTime;
            this.dom.sessionTimer.innerText = this.formatTime(diff);
        }
    }
};

Engine.init();