const Engine = {
    API_URL: 'https://script.google.com/macros/s/AKfycbwHCfHaBJFXXyvASFf5x5Iy0OCiQLD38hsW4_gOGiWdiJPIURBcFovTVvDN7qShd6R5AA/exec',

    themes: [
        { id: 'simple', name: 'Simple Digital' },
        { id: 'breathe', name: '☆ Deep Breathing' },
        { id: 'ios', name: '☆ Standby Mode' },
        { id: 'analog', name: '☆ Analog Standby' },
        { id: 'lcd', name: 'Retro LCD' },
        { id: 'industrial_digital_clock', name: 'Industrial Clock' },
        { id: 'cyberpunk_digital', name: '☆ Cyberpunk' },
        { id: 'ethereal_tides', name: '☆ Ethereal Tides' },
        { id: 'astral_tides', name: '☆ Astral Tides' },
        { id: 'mail', name: 'Nostalgia' },
        { id: 'circular', name: '☆ Circular' },
        { id: 'auroras_glass', name: '☆ Auroras Glass' },
        { id: 'zen_orbit', name: '☆ Zen Orbit' },
        { id: 'machinarium', name: '☆ Machinarium' },
        { id: 'solstice_prism', name: 'Solstice Prism' },
        { id: 'horizon_loom', name: 'Horizon Loom' },
        { id: 'chronos_gyre', name: 'Chronos Gyre' },
        { id: 'celestial_chronos', name: 'Celestial' },
        { id: 'the_board', name: '☆ The Board' }
    ],
    state: { activeThemeId: 'simple', themeSettings: {} },
    session: { active: false, finished: false, startTime: null, elapsed: 0 },
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
        sessionText: document.getElementById('session-status-text'),
        
        controlsRow: document.getElementById('controls-row'),
        syncGroup: document.getElementById('sync-group'),
        userInput: document.getElementById('user-input'),
        syncBtn: document.getElementById('btn-sync'),
        syncMsg: document.getElementById('sync-msg')
    },

    init: function () {
        this.loadState();
        this.initListeners();
        this.buildLibraryUI();
        this.loadTheme(this.state.activeThemeId);
        this.startClock();
        
        const savedUser = localStorage.getItem('meditation_user');
        if (savedUser) this.dom.userInput.value = savedUser;

        this.initSecretFeatures();
        this.initScrollIndicators(); // <--- Added this back
    },

    initListeners: function () {
        document.getElementById('btn-library').onclick = () => this.toggleDrawer('library');
        document.getElementById('btn-close-library').onclick = () => this.closeDrawers();
        document.getElementById('btn-settings').onclick = () => this.toggleDrawer('settings');
        document.getElementById('btn-close-settings').onclick = () => this.closeDrawers();
        
        // Fullscreen Buttons
        this.dom.btnFullscreen.onclick = () => this.enterFullscreen();
        this.dom.btnExitFs.onclick = () => this.exitFullscreen();

        // FIX: Listen for browser fullscreen changes (Escape key, etc.)
        ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(
            eventType => document.addEventListener(eventType, () => this.handleFullscreenChange(), false)
        );

        this.dom.sessionHandle.onclick = () => {
            this.dom.sessionPanel.classList.toggle('active');
            this.closeDrawers();
        };

        this.dom.sessionBtn.onclick = () => this.handleSessionClick();
        this.dom.syncBtn.onclick = () => this.uploadSession();
    },

    // FIX: Add this function to handle the class removal
    handleFullscreenChange: function () {
        const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
        if (!isFullscreen) {
            document.body.classList.remove('fullscreen-mode');
        } else {
            document.body.classList.add('fullscreen-mode');
        }
    },

    // --- SCROLL INDICATOR LOGIC ---
    initScrollIndicators: function () {
        const grid = this.dom.themeGrid;
        const drawer = this.dom.libraryDrawer;

        if (!grid || !drawer) return;

        // Create the element if it doesn't exist
        let indicator = document.getElementById('lib-scroll-ind');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'lib-scroll-ind';
            indicator.className = 'scroll-indicator';
            indicator.innerHTML = '&#8964;'; // Chevron Down
            drawer.appendChild(indicator);
        }

        // The update function
        this.updateScrollIndicator = () => {
            const scrollTop = grid.scrollTop;
            const scrollHeight = grid.scrollHeight;
            const clientHeight = grid.clientHeight;
            
            // Show if content is taller than container AND we aren't at the bottom
            const isScrollable = scrollHeight > clientHeight;
            const notAtBottom = scrollTop + clientHeight < scrollHeight - 10;

            if (isScrollable && notAtBottom) {
                indicator.style.opacity = '1';
            } else {
                indicator.style.opacity = '0';
            }
        };

        grid.onscroll = this.updateScrollIndicator;
        window.addEventListener('resize', this.updateScrollIndicator);
        
        // Initial check
        setTimeout(this.updateScrollIndicator, 200);
    },

    handleSessionClick: function () {
        const s = this.session;
        if (!s.active && !s.finished) {
            // --- 1. START SESSION ---
            s.active = true; s.startTime = Date.now();
            
            // UI Updates
            this.dom.sessionBtn.innerText = "STOP SESSION";
            this.dom.sessionBtn.classList.add('stop-mode');
            this.dom.sessionHandle.classList.add('meditating');
            this.dom.sessionText.innerText = "IN PROGRESS";
            
            // RESET LAYOUT: Ensure we are in "Big Button" mode
            this.dom.controlsRow.classList.remove('sync-layout'); 
            this.dom.sessionTimer.classList.remove('finished');
            
            setTimeout(() => this.dom.sessionPanel.classList.remove('active'), 500);
            return;
        }
        
        if (s.active) {
            // --- 2. FINISH SESSION ---
            s.active = false; s.finished = true;
            s.elapsed = Date.now() - s.startTime;
            
            // UI Updates
            this.dom.sessionBtn.innerText = "NEW SESSION";
            this.dom.sessionBtn.classList.remove('stop-mode');
            this.dom.sessionHandle.classList.remove('meditating');
            this.dom.sessionText.innerText = "SESSION FINISHED";
            this.dom.sessionTimer.classList.add('finished');
            
            // TRIGGER MORPH: Shrink button, reveal inputs
            this.dom.controlsRow.classList.add('sync-layout'); 
            return;
        }
        
        if (s.finished) {
            // --- 3. RESET ---
            s.finished = false; s.elapsed = 0; s.startTime = null;
            
            // UI Updates
            this.dom.sessionBtn.innerText = "BEGIN MEDITATION";
            this.dom.sessionTimer.innerText = "00:00:00";
            this.dom.sessionTimer.classList.remove('finished');
            this.dom.sessionText.innerText = "START SESSION";
            
            // REVERT MORPH: Hide inputs, big button
            this.dom.controlsRow.classList.remove('sync-layout');
            return;
        }
    },

    uploadSession: function () {
        const user = this.dom.userInput.value.trim() || 'ANONYMOUS';
        localStorage.setItem('meditation_user', user);
        this.dom.syncBtn.innerText = "...";
        fetch(this.API_URL, {
            method: 'POST', mode: 'no-cors',
            body: JSON.stringify({ username: user, duration: Math.floor(this.session.elapsed / 1000) })
        }).then(() => {
            this.dom.syncBtn.innerText = "✓";
            this.dom.syncMsg.innerText = "Session Saved";
            this.dom.syncMsg.style.color = "var(--success)";
            setTimeout(() => {
                this.dom.syncBtn.innerText = "SYNC ☁";
                this.dom.syncMsg.innerText = "";
            }, 3000);
        });
    },

    loadTheme: function (themeId) {
        if (this.currentThemeObj?.destroy) this.currentThemeObj.destroy();
        this.state.activeThemeId = themeId;
        this.saveState();
        this.dom.cssLink.href = `themes/${themeId}/theme.css`;
        const old = document.getElementById('theme-script');
        if (old) old.remove();
        const sc = document.createElement('script');
        sc.src = `themes/${themeId}/theme.js`; sc.id = 'theme-script';
        sc.onload = () => {
            if (window.ActiveTheme) {
                this.currentThemeObj = window.ActiveTheme;
                const saved = this.state.themeSettings[themeId] || {};
                this.currentThemeObj.init(this.dom.stage, saved);
                this.buildSettingsUI(themeId);
            }
        };
        document.body.appendChild(sc);
    },

    buildSettingsUI: function (themeId) {
        const container = this.dom.settingsContent;
        container.innerHTML = '';
        const config = this.currentThemeObj?.settingsConfig;
        if (!config) {
            container.innerHTML = '<div style="opacity:0.3; font-size:10px; text-transform:uppercase;">No Configuration</div>';
            return;
        }

        for (const [key, setting] of Object.entries(config)) {
            const wrapper = document.createElement('div');
            wrapper.className = 'setting-item';
            const currentVal = this.state.themeSettings[themeId]?.[key] || setting.default;

            const labelRow = document.createElement('div');
            labelRow.className = 'setting-label';
            labelRow.innerHTML = `<span>${setting.label}</span> <span style="color:white">${currentVal}${setting.displaySuffix || ''}</span>`;
            wrapper.appendChild(labelRow);

            if (setting.type === 'range') {
                const slider = document.createElement('input');
                slider.type = 'range'; slider.min = setting.min; slider.max = setting.max;
                slider.value = currentVal;
                slider.oninput = (e) => {
                    labelRow.children[1].innerText = `${e.target.value}${setting.displaySuffix || ''}`;
                    this.updateSetting(themeId, key, e.target.value);
                };
                wrapper.appendChild(slider);
            } else if (setting.type === 'palette') {
                const grid = document.createElement('div');
                grid.className = 'palette-grid';
                setting.options.forEach(colorVal => {
                    const swatch = document.createElement('div');
                    swatch.className = `color-swatch ${colorVal === currentVal ? 'active' : ''}`;
                    
                    // FIX: Handle raw Hue numbers (like '220') by converting to HSL for display
                    if (!isNaN(colorVal)) {
                        swatch.style.backgroundColor = `hsl(${colorVal}, 70%, 60%)`;
                    } else {
                        swatch.style.backgroundColor = colorVal;
                    }
                    
                    swatch.onclick = () => {
                        this.updateSetting(themeId, key, colorVal);
                        this.buildSettingsUI(themeId);
                    };
                    grid.appendChild(swatch);
                });
                wrapper.appendChild(grid);

                
            } else if (setting.type === 'select') {
                const label = document.createElement('div');
                

                const select = document.createElement('select');
                select.className = 'setting-select'; // We will style this class next

                setting.options.forEach(opt => {
                    const option = document.createElement('option');
                    option.value = opt.value;
                    option.innerText = opt.text;
                    
                    const currentVal = this.state.themeSettings[themeId]?.[key] || setting.default;
                    if (opt.value == currentVal) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                });

                select.onchange = (e) => {
                    this.updateSetting(themeId, key, e.target.value);
                };
                wrapper.appendChild(select);
            }
            // ^^^^ --- END OF NEW BLOCK --- ^^^^

            container.appendChild(wrapper);
        }
    },

    buildLibraryUI: function () {
        const container = this.dom.themeGrid; container.innerHTML = '';
        this.themes.forEach(t => {
            const tile = document.createElement('div');
            tile.className = `theme-tile ${t.id === this.state.activeThemeId ? 'active' : ''}`;
            tile.innerHTML = `<span>${t.name}</span>`;
            tile.onclick = () => { this.loadTheme(t.id); this.buildLibraryUI(); };
            container.appendChild(tile);
        });
        
        // Trigger scroll update after building so the arrow appears if needed
        setTimeout(() => {
            if(this.updateScrollIndicator) this.updateScrollIndicator();
        }, 100);
    },

    updateSetting: function (themeId, key, value) {
        if (!this.state.themeSettings[themeId]) this.state.themeSettings[themeId] = {};
        this.state.themeSettings[themeId][key] = value;
        this.saveState();
        if (this.currentThemeObj.onSettingsChange) {
            this.currentThemeObj.onSettingsChange(key, value);
        }
    },

    toggleDrawer: function (type) {
        const lib = this.dom.libraryDrawer, set = this.dom.settingsDrawer;
        if (type === 'library') { lib.classList.add('active'); set.classList.remove('active'); }
        else { set.classList.add('active'); lib.classList.remove('active'); }
        this.dom.sessionPanel.classList.remove('active');
    },

    closeDrawers: function () {
        this.dom.libraryDrawer.classList.remove('active');
        this.dom.settingsDrawer.classList.remove('active');
    },

    enterFullscreen: function () {
        if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
        document.body.classList.add('fullscreen-mode');
        this.closeDrawers();
    },

    exitFullscreen: function () { if (document.exitFullscreen) document.exitFullscreen(); },

    formatTime: function (ms) {
        const s = Math.floor(ms / 1000);
        return [Math.floor(s/3600), Math.floor((s%3600)/60), s%60].map(v => String(v).padStart(2,'0')).join(':');
    },

    startClock: function () { setInterval(() => this.tick(), 1000); },

    tick: function () {
        const now = new Date();
        this.currentThemeObj?.update({
            h: String(now.getHours()).padStart(2, '0'),
            m: String(now.getMinutes()).padStart(2, '0'),
            s: String(now.getSeconds()).padStart(2, '0')
        });
        if (this.session.active) this.dom.sessionTimer.innerText = this.formatTime(Date.now() - this.session.startTime);
    },

    saveState: function () { localStorage.setItem('meditation_os_state', JSON.stringify(this.state)); },
    loadState: function () {
        const s = localStorage.getItem('meditation_os_state');
        if (s) this.state = { ...this.state, ...JSON.parse(s) };
    },

    initSecretFeatures: function () {
        const modal = document.getElementById('secret-modal');
        const btnClose = document.getElementById('btn-close-secret');
        const btnSubmit = document.getElementById('btn-secret-submit');
        const inputUser = document.getElementById('secret-username');
        const inputDuration = document.getElementById('secret-duration');
        const msg = document.getElementById('secret-msg');

        if (!modal) return;

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey && e.shiftKey && (e.key === 'm' || e.key === 'M')) {
                e.preventDefault();
                this.openSecretModal();
            }
        });

        if (this.dom.userInput) {
            this.dom.userInput.addEventListener('input', (e) => {
                if (e.target.value.toUpperCase() === 'MANUALINPUT') {
                    e.target.value = localStorage.getItem('meditation_user') || '';
                    this.openSecretModal();
                }
            });
        }

        btnClose.onclick = () => modal.classList.remove('active');
        btnSubmit.onclick = () => {
            const user = inputUser.value.trim() || 'ANONYMOUS';
            const mins = parseInt(inputDuration.value);
            if (!mins || mins <= 0) { msg.innerText = "INVALID DURATION"; return; }
            
            msg.innerText = "UPLOADING...";
            fetch(this.API_URL, {
                method: 'POST', mode: 'no-cors',
                body: JSON.stringify({ username: user, duration: (mins * 60) + 1 })
            }).then(() => {
                msg.innerText = "SAVED ✓";
                setTimeout(() => modal.classList.remove('active'), 1000);
            });
        };
    },

    openSecretModal: function () {
        const modal = document.getElementById('secret-modal');
        if (modal) {
            modal.classList.add('active');
            const savedUser = localStorage.getItem('meditation_user');
            if (savedUser) document.getElementById('secret-username').value = savedUser;
        }
    }
};


Engine.init();
