// *** CONFIGURATION ***
const API_URL = 'https://script.google.com/macros/s/AKfycbwHCfHaBJFXXyvASFf5x5Iy0OCiQLD38hsW4_gOGiWdiJPIURBcFovTVvDN7qShd6R5AA/exec'; 

// DOM Elements
const dom = {
    username: document.getElementById('username-display'),
    rank: document.getElementById('rank-badge'),
    search: document.getElementById('user-search'),
    history: document.getElementById('history-list'),
    profileCard: document.querySelector('.profile-card'),
    btnDaily: document.getElementById('btn-daily'),
    btnHourly: document.getElementById('btn-hourly')
};

// App State
let currentUser = localStorage.getItem('meditation_user') || 'HUMMINGBIRD';
let rawData = [];
let myMainChart = null;
let myDistChart = null;
let myDurationChart = null; // New Chart
let distMode = 'daily';
let currentThemeColor = '#666';

// Init
dom.username.innerText = currentUser;
setupEventListeners();
fetchData();

function setupEventListeners() {
    dom.username.addEventListener('click', () => {
        dom.username.style.display = 'none';
        dom.search.style.display = 'block';
        dom.search.value = currentUser;
        dom.search.focus();
    });
    dom.search.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') confirmSearch();
    });
    dom.search.addEventListener('blur', () => confirmSearch());

    dom.btnDaily.addEventListener('click', () => {
        distMode = 'daily';
        updateToggleUI();
        const sessions = filterSessions();
        renderDistChart(sessions);
    });

    dom.btnHourly.addEventListener('click', () => {
        distMode = 'hourly';
        updateToggleUI();
        const sessions = filterSessions();
        renderDistChart(sessions);
    });
}

function updateToggleUI() {
    if(distMode === 'daily') {
        dom.btnDaily.classList.add('active');
        dom.btnHourly.classList.remove('active');
    } else {
        dom.btnHourly.classList.add('active');
        dom.btnDaily.classList.remove('active');
    }
}

function confirmSearch() {
    const val = dom.search.value.trim().toUpperCase();
    if(val && val !== currentUser) {
        currentUser = val;
        localStorage.setItem('meditation_user', currentUser);
        dom.username.innerText = currentUser;
        renderDashboard(); 
    }
    dom.search.style.display = 'none';
    dom.username.style.display = 'block';
}

function fetchData() {
    console.log("Fetching data...");
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            rawData = data;
            renderDashboard();
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            dom.history.innerHTML = '<div style="text-align:center; padding:20px;">Error Loading Data</div>';
        });
}

function filterSessions() {
    if(!rawData || rawData.length === 0) return [];
    return rawData.filter(row => {
        if (!row[1]) return false; 
        return row[1].toString().toUpperCase() === currentUser.toUpperCase();
    });
}

function renderDashboard() {
    const mySessions = filterSessions();
    if(mySessions.length === 0) return;

    // METRICS
    const totalCount = mySessions.length;
    const totalSeconds = mySessions.reduce((acc, row) => acc + Number(row[2]), 0);
    const hours = (totalSeconds / 3600).toFixed(1);
    
    // RANK
    let rank = "NOVICE";
    currentThemeColor = "#666"; 
    
    if(hours > 5)   { rank = "APPRENTICE"; currentThemeColor = "#fff"; }
    if(hours > 20)  { rank = "ADEPT";      currentThemeColor = "#4caf50"; } 
    if(hours > 50)  { rank = "EXPERT";     currentThemeColor = "#00bcd4"; } 
    if(hours > 100) { rank = "MASTER";     currentThemeColor = "#a855f7"; } 
    if(hours > 500) { rank = "ZEN LEGEND"; currentThemeColor = "#ff9800"; } 

    // STREAK 
    const uniqueDays = [...new Set(mySessions.map(row => new Date(row[0]).toDateString()))].length;

    // UPDATE DOM
    document.getElementById('total-hours').innerText = hours;
    document.getElementById('total-sessions').innerText = totalCount;
    let avgMins = 0;
    if(totalCount > 0) avgMins = Math.floor((totalSeconds / totalCount) / 60);
    document.getElementById('avg-time').innerText = avgMins + "m";
    document.getElementById('longest-streak').innerText = uniqueDays; 
    
    dom.rank.innerText = rank;
    dom.rank.style.color = currentThemeColor;
    dom.profileCard.style.borderColor = currentThemeColor;

    renderMainChart(mySessions, currentThemeColor);
    renderDistChart(mySessions);
    renderDurationChart(mySessions); // NEW CHART CALL
    renderHistory(mySessions);
}

// 1. MAIN CHART (Last 7 Days Trend)
function renderMainChart(sessions, themeColor) {
    const ctx = document.getElementById('activityChart');
    if(!ctx) return;
    
    const last7Days = [];
    const labels = [];
    
    for (let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        last7Days.push(d);
        labels.push(d.toLocaleDateString('en-US', { weekday: 'short' })); 
    }

    const dailyMinutes = last7Days.map(targetDate => {
        const matchSessions = sessions.filter(row => {
            const rowDate = new Date(row[0]); 
            return rowDate.toDateString() === targetDate.toDateString();
        });
        const seconds = matchSessions.reduce((acc, row) => acc + Number(row[2]), 0);
        return Math.floor(seconds / 60);
    });

    if(myMainChart) myMainChart.destroy();

    const context = ctx.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, themeColor); 
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    myMainChart = new Chart(context, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Minutes',
                data: dailyMinutes,
                backgroundColor: gradient,
                borderColor: themeColor,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHitRadius: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#222' }, ticks: { color: '#666' } },
                x: { grid: { display: false }, ticks: { color: '#666' } }
            }
        }
    });
}

// 2. DAILY / HOURLY DISTRIBUTION
function renderDistChart(sessions) {
    const ctx = document.getElementById('distChart');
    if(!ctx) return;

    let labels = [];
    let dataPoints = [];
    let labelString = "Total Minutes"; // Tooltip label

    if (distMode === 'daily') {
        // DAILY: Sum of Minutes
        labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        dataPoints = [0, 0, 0, 0, 0, 0, 0];

        sessions.forEach(row => {
            const date = new Date(row[0]);
            const dayIndex = (date.getDay() + 6) % 7; 
            const mins = Math.floor(Number(row[2])/60);
            dataPoints[dayIndex] += mins;
        });

    } else {
        // HOURLY: Percentage of Total Sessions (Habit Tracking)
        labelString = "% of Sessions";
        labels = Array.from({length:24}, (_, i) => i); // 0-23
        const counts = new Array(24).fill(0);
        const total = sessions.length;

        sessions.forEach(row => {
            const date = new Date(row[0]);
            const hour = date.getHours(); 
            counts[hour]++;
        });

        // Convert counts to percentages
        if(total > 0) {
            dataPoints = counts.map(c => ((c / total) * 100).toFixed(1));
        } else {
            dataPoints = counts;
        }
    }

    if(myDistChart) myDistChart.destroy();

    myDistChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: labelString,
                data: dataPoints,
                backgroundColor: currentThemeColor,
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { display: false }, 
                x: { 
                    grid: { display: false }, 
                    ticks: { 
                        color: '#666',
                        callback: function(val, index) {
                            if(distMode === 'daily') return this.getLabelForValue(val);
                            if(index % 4 === 0) return index + 'h';
                            return '';
                        }
                    } 
                }
            }
        }
    });
}

// 3. RECORD DURATION DISTRIBUTION (New!)
function renderDurationChart(sessions) {
    const ctx = document.getElementById('durationChart');
    if(!ctx) return;

    // Define Buckets
    // 0: < 5 mins
    // 1: 5 - 15 mins
    // 2: 15 - 45 mins
    // 3: 45 mins +
    const counts = [0, 0, 0, 0];
    const labels = ["< 5m", "5-15m", "15-45m", "45m+"];
    const total = sessions.length;

    sessions.forEach(row => {
        const mins = Number(row[2]) / 60;
        if (mins < 5) counts[0]++;
        else if (mins < 15) counts[1]++;
        else if (mins < 45) counts[2]++;
        else counts[3]++;
    });

    // Convert to Percentages
    const percentages = counts.map(c => total > 0 ? ((c / total) * 100).toFixed(1) : 0);

    if(myDurationChart) myDurationChart.destroy();

    myDurationChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: '% of Sessions',
                data: percentages,
                backgroundColor: currentThemeColor,
                borderRadius: 4,
                borderSkipped: false,
                barPercentage: 0.6 // Make bars slightly thinner
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y', // MAKES IT HORIZONTAL!
            plugins: { legend: { display: false } },
            scales: {
                x: { 
                    display: false, // Hide X axis (Percentage)
                    max: 100 
                }, 
                y: { 
                    grid: { display: false },
                    ticks: { 
                        color: '#888',
                        font: { size: 11, weight: 'bold' }
                    } 
                }
            }
        }
    });
}

// 4. HISTORY
function renderHistory(sessions) {
    dom.history.innerHTML = '';
    
    if(sessions.length === 0) {
        dom.history.innerHTML = '<div style="text-align:center; color:#444; margin-top:10px;">No sessions found.</div>';
        return;
    }

    // Show last 5
    [...sessions].reverse().slice(0, 5).forEach(row => {
        const div = document.createElement('div');
        div.className = 'history-item';
        
        const dateObj = new Date(row[0]); 
        const datePart = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timePart = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        const prettyString = `${datePart} • ${timePart}`;

        const mins = Math.floor(row[2]/60);
        const secs = row[2]%60;
        
        div.innerHTML = `
            <span class="date">${prettyString}</span>
            <span class="duration">${mins}m ${secs}s</span>
        `;
        dom.history.appendChild(div);
    });
}