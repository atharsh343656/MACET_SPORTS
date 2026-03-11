// Authentication
function login() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (user === "macetsports" && pass === "MACET9616") {
        sessionStorage.setItem("isAdmin", "true");
        window.location = "admin.html";
    } else {
        alert("Invalid Credentials. Please try again.");
    }
}

function logout() {
    sessionStorage.removeItem("isAdmin");
    window.location = "login.html";
}

// Data Management
function getScores() {
    return {
        blue: Number(localStorage.getItem("blue")) || 0,
        red: Number(localStorage.getItem("red")) || 0,
        green: Number(localStorage.getItem("green")) || 0,
        yellow: Number(localStorage.getItem("yellow")) || 0
    };
}

function updateScore() {
    let blue = document.getElementById("blue").value;
    let red = document.getElementById("red").value;
    let green = document.getElementById("green").value;
    let yellow = document.getElementById("yellow").value;

    localStorage.setItem("blue", blue);
    localStorage.setItem("red", red);
    localStorage.setItem("green", green);
    localStorage.setItem("yellow", yellow);

    // Provide visual feedback
    const btn = document.querySelector('.submit-scores');
    const originalText = btn.innerText;
    btn.innerText = "✓ Saved Successfully";
    btn.style.background = "#22c55e"; // Success green
    
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = ""; // Restore default
    }, 2000);

    // Update preview if available
    if(document.getElementById("leaderboard")) {
        showLeaderboard();
    }
}

// UI Updates
function showLeaderboard() {
    const scores = getScores();
    
    let houses = [
        { id: 'blue', name: "Blue House", score: scores.blue, colorClass: "blue" },
        { id: 'red', name: "Red House", score: scores.red, colorClass: "red" },
        { id: 'green', name: "Green House", score: scores.green, colorClass: "green" },
        { id: 'yellow', name: "Yellow House", score: scores.yellow, colorClass: "yellow" }
    ];

    // Sort descending
    houses.sort((a, b) => b.score - a.score);

    let boardHTML = "";
    houses.forEach((h, index) => {
        boardHTML += `
            <div class="house-card ${h.colorClass}">
                <div class="house-info">
                    <span class="house-rank">#${index + 1}</span>
                    <span class="house-name">${h.name}</span>
                </div>
                <div class="house-score">${h.score} <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5)">PTS</span></div>
            </div>
        `;
    });

    const leaderboardEl = document.getElementById("leaderboard");
    if (leaderboardEl) {
        leaderboardEl.innerHTML = boardHTML;
    }
}

// Global Chart instance
let scoreChartInstance = null;

function initChart() {
    const ctx = document.getElementById('scoreChart');
    if (!ctx) return;

    const scores = getScores();

    // Chart.js global defaults
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    scoreChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Blue House', 'Red House', 'Green House', 'Yellow House'],
            datasets: [{
                label: 'Points',
                data: [scores.blue, scores.red, scores.green, scores.yellow],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',
                    'rgba(239, 68, 68, 0.7)',
                    'rgba(34, 197, 94, 0.7)',
                    'rgba(234, 179, 8, 0.7)'
                ],
                borderColor: [
                    '#3b82f6',
                    '#ef4444',
                    '#22c55e',
                    '#eab308'
                ],
                borderWidth: 1,
                borderRadius: 6,
                hoverBackgroundColor: [
                    '#3b82f6',
                    '#ef4444',
                    '#22c55e',
                    '#eab308'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 14, family: "'Outfit', sans-serif" },
                    bodyFont: { size: 14, family: "'Outfit', sans-serif", weight: 'bold' },
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return context.raw + ' Points';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        font: { size: 12 }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: { size: 12, weight: '600' }
                    }
                }
            },
            animation: {
                duration: 500,
                easing: 'easeOutQuart'
            }
        }
    });
}

function updateChart() {
    if (!scoreChartInstance) return;
    
    const scores = getScores();
    scoreChartInstance.data.datasets[0].data = [
        scores.blue, 
        scores.red, 
        scores.green, 
        scores.yellow
    ];
    scoreChartInstance.update();
}

// --- NEW EVENTS LOGIC ---
const NUM_EVENTS = 35;

function getEventsData() {
    let stored = localStorage.getItem('sportsEvents');
    if (stored) {
        return JSON.parse(stored);
    }
    // Initialize 35 events if not found
    return Array.from({length: NUM_EVENTS}, (_, i) => ({
        id: i + 1,
        name: `Event ${i + 1}`,
        positions: { 1: '', 2: '', 3: '', 4: '' }
    }));
}

function renderEvents() {
    const container = document.getElementById('eventsContainer');
    if (!container) return;
    
    const events = getEventsData();
    let html = '';
    
    events.forEach(ev => {
        html += `
            <div class="event-card">
                <div class="event-header">${ev.name}</div>
                <div class="event-positions">
                    ${[1, 2, 3, 4].map(pos => {
                        let houseClass = ev.positions[pos] ? ev.positions[pos] + '-house-text' : 'unassigned';
                        let houseLabel = ev.positions[pos] ? ev.positions[pos].charAt(0).toUpperCase() + ev.positions[pos].slice(1) : 'TBD';
                        return `
                        <div class="event-position">
                            <span class="pos-badge pos-${pos}">${pos}${getOrdinal(pos)}</span>
                            <span class="pos-house ${houseClass}">${houseLabel}</span>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return (s[(v - 20) % 10] || s[v] || s[0]);
}

function renderAdminEvents() {
    const container = document.getElementById('adminEventsContainer');
    if (!container) return;
    
    const events = getEventsData();
    const houses = [
        {value: '', label: 'Select House...'},
        {value: 'blue', label: 'Blue House'},
        {value: 'red', label: 'Red House'},
        {value: 'green', label: 'Green House'},
        {value: 'yellow', label: 'Yellow House'}
    ];
    
    let html = '';
    events.forEach(ev => {
        html += `
            <div class="admin-event-row" data-id="${ev.id}">
                <div class="admin-event-name">
                    <input type="text" class="event-name-input" value="${ev.name}" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0.5rem; border-radius: 4px; font-family: inherit; font-size: inherit; font-weight: 600; width: 100%; box-sizing: border-box;">
                </div>
                <div class="admin-event-selects">
                    ${[1, 2, 3, 4].map(pos => `
                        <div class="select-group">
                            <label>${pos}${getOrdinal(pos)}</label>
                            <select class="pos-select" data-pos="${pos}">
                                ${houses.map(h => `<option value="${h.value}" ${ev.positions[pos] === h.value ? 'selected' : ''}>${h.label}</option>`).join('')}
                            </select>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function saveAdminEvents() {
    const rows = document.querySelectorAll('.admin-event-row');
    if (rows.length === 0) return;
    
    let events = [];
    rows.forEach(row => {
        const id = parseInt(row.getAttribute('data-id'));
        const nameInput = row.querySelector('.event-name-input');
        const name = nameInput ? nameInput.value : row.querySelector('.admin-event-name').innerText;
        let positions = { 1: '', 2: '', 3: '', 4: '' };
        
        row.querySelectorAll('.pos-select').forEach(select => {
            const pos = select.getAttribute('data-pos');
            positions[pos] = select.value;
        });
        
        events.push({ id, name, positions });
    });
    
    localStorage.setItem('sportsEvents', JSON.stringify(events));
    
    const btns = document.querySelectorAll('.submit-scores');
    btns.forEach(btn => {
        const originalText = btn.innerText;
        btn.innerText = "✓ Saved Events";
        btn.style.background = "#22c55e"; 
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = ""; 
        }, 2000);
    });
}
