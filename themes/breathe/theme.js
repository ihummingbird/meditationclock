window.ActiveTheme = {
    els: {},

    init: function(stage) {
        // Totally different HTML structure!
        stage.innerHTML = `
            <div class="breathe-container">
                <div id="instruction-text">Breathe In</div>
                <div class="tiny-clock">
                    <span id="tiny-time">00:00</span>
                </div>
            </div>
        `;

        this.els.text = document.getElementById('instruction-text');
        this.els.time = document.getElementById('tiny-time');
    },

    update: function(timeData) {
        // 1. Update the tiny clock at the bottom
        this.els.time.innerText = `${timeData.h}:${timeData.m}`;

        // 2. Custom Logic: Breathe In (Even seconds) / Breathe Out (Odd seconds)
        // Note: Real box breathing is 4-4-4-4, but this is just a demo.
        if (timeData.s % 2 === 0) {
            this.els.text.innerText = "Inhale";
            this.els.text.style.transform = "scale(1.5)";
            this.els.text.style.color = "#a8d5a2"; // Greenish
        } else {
            this.els.text.innerText = "Exhale";
            this.els.text.style.transform = "scale(1.0)";
            this.els.text.style.color = "#888"; // Grey
        }
    },

    destroy: function() {
        this.els = {};
    }
};