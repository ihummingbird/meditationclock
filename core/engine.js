const Engine = {
    // 1. REGISTRY
    themes: [
        { id: 'simple', name: 'Simple Digital' },
        { id: 'breathe', name: 'Deep Breathing' }
    ],

    state: {
        activeThemeId: 'simple',
        themeSettings: {}
    },
    
    currentThemeObj: null,

    dom: {
        stage: document.getElementById('stage'),
        cssLink: document.getElementById('theme-stylesheet'),
        
        // Drawers
        libraryDrawer: document.getElementById('library-drawer'),
        settingsDrawer: document.getElementById('settings-panel'),
        themeGrid: document.getElementById('theme-grid'),
        settingsContent: document.getElementById('settings-content'),
        
        // Buttons
        btnFullscreen: document.getElementById('btn-fullscreen'),
        btnExitFs: document.getElementById('btn-exit-fs')
    },

    init: function() {
        this.loadState();
        
        // --- NAVIGATION LISTENERS ---
        document.getElementById('btn-library').addEventListener('click', () => this.toggleDrawer('library'));
        document.getElementById('btn-close-library').addEventListener('click', () => this.closeDrawers());

        document.getElementById('btn-settings').addEventListener('click', () => this.toggleDrawer('settings'));
        document.getElementById('btn-close-settings').addEventListener('click', () => this.closeDrawers());

        // --- FULLSCREEN LISTENERS ---
        this.dom.btnFullscreen.addEventListener('click', () => this.enterFullscreen());
        this.dom.btnExitFs.addEventListener('click', () => this.exitFullscreen());

        // Listen for "ESC" key or native browser exit
        document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
                this.exitFullscreenUI();
            }
        });

        // --- APP START ---
        this.buildLibraryUI();
        this.loadTheme(this.state.activeThemeId);
        this.startClock();
    },

    // --- FULLSCREEN LOGIC ---
    enterFullscreen: function() {
        // 1. Request Browser Native Fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
        
        // 2. Update UI (Hide Nav, Show Exit Button)
        document.body.classList.add('fullscreen-mode');
        this.closeDrawers(); // Ensure drawers are closed
    },

    exitFullscreen: function() {
        // 1. Exit Browser Native Fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
        // UI update happens automatically via the 'fullscreenchange' event listener above
    },

    // Helper to restore UI
    exitFullscreenUI: function() {
        document.body.classList.remove('fullscreen-mode');
    },

    // --- DRAWER LOGIC ---
    toggleDrawer: function(type) {
        if (type === 'library') {
            this.dom.libraryDrawer.classList.add('active');
            this.dom.settingsDrawer.classList.remove('active');
        } else {
            this.dom.settingsDrawer.classList.add('active');
            this.dom.libraryDrawer.classList.remove('active');
        }
    },

    closeDrawers: function() {
        this.dom.libraryDrawer.classList.remove('active');
        this.dom.settingsDrawer.classList.remove('active');
    },

    // --- LIBRARY BUILDER (Sleek List) ---
    buildLibraryUI: function() {
        const container = this.dom.themeGrid;
        container.innerHTML = ''; 

        this.themes.forEach(theme => {
            const tile = document.createElement('div');
            tile.className = 'theme-tile';
            
            if (theme.id === this.state.activeThemeId) {
                tile.classList.add('active');
            }

            const text = document.createElement('span');
            text.className = 'tile-text';
            text.innerText = theme.name;
            
            tile.appendChild(text);

            tile.addEventListener('click', () => {
                this.loadTheme(theme.id);
                this.buildLibraryUI(); 
            });

            container.appendChild(tile);
        });
    },

    // --- CORE ENGINE ---
    loadTheme: function(themeId) {
        if (this.currentThemeObj && this.currentThemeObj.destroy) {
            this.currentThemeObj.destroy();
        }

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

    buildSettingsUI: function(themeId) {
        const container = this.dom.settingsContent;
        container.innerHTML = '';

        if (!this.currentThemeObj || !this.currentThemeObj.settingsConfig) {
            container.innerHTML = '<div style="color:#444; font-size:10px; text-transform:uppercase;">No Configuration</div>';
            return;
        }

        const config = this.currentThemeObj.settingsConfig;

        for (const [key, setting] of Object.entries(config)) {
            if (setting.type === 'range') {
                const wrapper = document.createElement('div');
                wrapper.className = 'setting-item';

                const label = document.createElement('span');
                label.className = 'setting-label';
                label.innerText = setting.label;
                wrapper.appendChild(label);

                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = setting.min;
                slider.max = setting.max;
                slider.value = this.state.themeSettings[themeId]?.[key] || setting.default;
                
                slider.oninput = (e) => {
                    this.updateSetting(themeId, key, e.target.value);
                };
                wrapper.appendChild(slider);
                container.appendChild(wrapper);
            }
        }
    },

    updateSetting: function(themeId, key, value) {
        if (!this.state.themeSettings[themeId]) this.state.themeSettings[themeId] = {};
        this.state.themeSettings[themeId][key] = value;
        this.saveState();
        
        if (this.currentThemeObj.onSettingsChange) {
            this.currentThemeObj.onSettingsChange(key, value);
        }
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
    }
};

Engine.init();