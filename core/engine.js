const Engine = {
    // 1. REGISTRY
    // The 'id' MUST be exactly the name of the folder in /themes/
    themes: [
        { 
            id: 'simple', 
            name: 'Simple Digital'
        },
        { 
            id: 'breathe', 
            name: 'Deep Breathing'
        }
    ],

    state: {
        activeThemeId: 'simple',
        themeSettings: {}
    },
    
    currentThemeObj: null,

    dom: {
        stage: document.getElementById('stage'),
        cssLink: document.getElementById('theme-stylesheet'),
        
        libraryDrawer: document.getElementById('library-drawer'),
        settingsDrawer: document.getElementById('settings-panel'),
        themeGrid: document.getElementById('theme-grid'),
        settingsContent: document.getElementById('settings-content')
    },

    init: function() {
        this.loadState();
        
        // Listeners
        document.getElementById('btn-library').addEventListener('click', () => {
            this.dom.libraryDrawer.classList.add('active');
            this.dom.settingsDrawer.classList.remove('active');
        });
        document.getElementById('btn-close-library').addEventListener('click', () => {
            this.dom.libraryDrawer.classList.remove('active');
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            this.dom.settingsDrawer.classList.add('active');
            this.dom.libraryDrawer.classList.remove('active');
        });
        document.getElementById('btn-close-settings').addEventListener('click', () => {
            this.dom.settingsDrawer.classList.remove('active');
        });

        // Build the new List UI
        this.buildLibraryUI();
        
        // Load default
        this.loadTheme(this.state.activeThemeId);
        this.startClock();
    },

    // --- NEW LIST BUILDER (Sleek Tiles) ---
    buildLibraryUI: function() {
        const container = this.dom.themeGrid;
        container.innerHTML = ''; 

        this.themes.forEach(theme => {
            // Create the Tile container
            const tile = document.createElement('div');
            tile.className = 'theme-tile';
            
            // Check if this is the active theme
            if (theme.id === this.state.activeThemeId) {
                tile.classList.add('active');
            }

            // Tile Text
            const text = document.createElement('span');
            text.className = 'tile-text';
            text.innerText = theme.name;
            
            // Active Dot Indicator
            const dot = document.createElement('div');
            dot.className = 'tile-dot';

            tile.appendChild(text);
            tile.appendChild(dot);

            // Click Logic
            tile.addEventListener('click', () => {
                this.loadTheme(theme.id);
                this.buildLibraryUI(); // Re-render list to update borders
            });

            container.appendChild(tile);
        });
    },

    loadTheme: function(themeId) {
        if (this.currentThemeObj && this.currentThemeObj.destroy) {
            this.currentThemeObj.destroy();
        }

        this.state.activeThemeId = themeId;
        this.saveState();
        
        // Path construction: themes/FOLDER_NAME/theme.css
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