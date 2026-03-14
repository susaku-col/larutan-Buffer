// js/simulasi.js

// === STATE VARIABEL ===
let chem = {
    type: 'acetate',
    pKa: 4.74,
    mol_HA: 0.1, // Mol Asam Lemah
    mol_A: 0.1,  // Mol Basa Konjugat
    mol_H: 0,    // Mol Ion H+ bebas (kelebihan)
    mol_OH: 0,   // Mol Ion OH- bebas (kelebihan)
    volume: 100, // Volume larutan (mL)
    pH: 7.0
};

let particles = [];
let canvas, ctx;
let chart;
let history = [];
let volumeAdded = 0;

// === INISIALISASI ===
window.onload = function() {
    canvas = document.getElementById('labCanvas');
    ctx = canvas.getContext('2d');
    
    // Setup Canvas Size
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Init Chart
    initChart();

    // Init Simulation
    resetSimulation();
    animate();
};

function resizeCanvas() {
    let rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height; // Sesuai container
}

// === LOGIKA KIMIA ===

function updateChemistry() {
    // 1. Hitung Konsentrasi (Molaritas)
    let totalVol_L = (chem.volume + volumeAdded) / 1000; // konversi mL ke L
    
    // Hindari pembagian nol
    if(totalVol_L === 0) totalVol_L = 0.1;

    let conc_HA = chem.mol_HA / totalVol_L;
    let conc_A = chem.mol_A / totalVol_L;

    // 2. Hitung pH menggunakan Henderson-Hasselbalch
    // pH = pKa + log([A-]/[HA])
    
    // Logika Buffer:
    // Jika masih ada HA dan A, gunakan rumus buffer
    if (chem.mol_HA > 0 && chem.mol_A > 0) {
        chem.pH = chem.pKa + Math.log10(conc_A / conc_HA);
    } 
    // Jika A- habis (kelebihan H+ kuat)
    else if (chem.mol_A <= 0) {
        let excess_H = Math.abs(chem.mol_A) + chem.mol_H; // H+ sisa dari reaksi + H+ awal
        let conc_H_excess = excess_H / totalVol_L;
        chem.pH = -Math.log10(conc_H_excess);
    }
    // Jika HA habis (kelebihan OH- kuat)
    else if (chem.mol_HA <= 0) {
        let excess_OH = Math.abs(chem.mol_HA) + chem.mol_OH;
        let conc_OH_excess = excess_OH / totalVol_L;
        let pOH = -Math.log10(conc_OH_excess);
        chem.pH = 14 - pOH;
    }

    // Clamp pH values
    chem.pH = Math.max(0, Math.min(14, chem.pH));

    // Update UI
    document.getElementById('ph-display').innerText = chem.pH.toFixed(2);
    document.getElementById('vol-added').innerText = volumeAdded.toFixed(1);
    
    // Update Chart
    addDataPoint();
}

function addReagent(type) {
    let addedMol = 0.005; // Jumlah mol yang ditambahkan per klik (setara 0.5 mL 1M)
    volumeAdded += 1; // Tambah volume total

    if (type === 'acid') {
        // HCl -> H+ + Cl-
        // Reaksi: H+ + A- -> HA
        if (chem.mol_A > 0) {
            let reacted = Math.min(addedMol, chem.mol_A);
            chem.mol_A -= reacted;
            chem.mol_HA += reacted;
            // Sisa H+ jika A- habis
            chem.mol_H += (addedMol - reacted); 
        } else {
            chem.mol_H += addedMol;
        }
        
        // Visual: Tambah partikel H+
        createParticles('H', 3);

    } else if (type === 'base') {
        // NaOH -> Na+ + OH-
        // Reaksi: OH- + HA -> A- + H2O
        if (chem.mol_HA > 0) {
            let reacted = Math.min(addedMol, chem.mol_HA);
            chem.mol_HA -= reacted;
            chem.mol_A += reacted;
            // Sisa OH- jika HA habis
            chem.mol_OH += (addedMol - reacted);
        } else {
            chem.mol_OH += addedMol;
        }

        // Visual: Tambah partikel OH-
        createParticles('OH', 3);
    }

    updateChemistry();
    updateParticleCounts();
}

function updateInitConc() {
    // Hanya dipanggil saat slider diubah saat reset/setup awal
    // Logika di sini bisa diabaikan jika kita menganggap resetSimulation() yang mengatur
}

function resetSimulation() {
    // Reset State
    volumeAdded = 0;
    chem.type = document.getElementById('buffer-type').value;
    
    if(chem.type === 'acetate') chem.pKa = 4.74;
    else chem.pKa = 9.25; // Amonia

    // Ambil nilai slider
    let cHA = parseFloat(document.getElementById('conc-ha').value);
    let cA = parseFloat(document.getElementById('conc-a').value);
    
    // Anggap volume awal 100mL -> mol = M * 0.1 L
    chem.mol_HA = cHA * 0.1;
    chem.mol_A = cA * 0.1;
    chem.mol_H = 0;
    chem.mol_OH = 0;

    // Update UI Slider labels
    document.getElementById('val-ha').innerText = cHA.toFixed(2) + " M";
    document.getElementById('val-a').innerText = cA.toFixed(2) + " M";

    // Reset Particles
    particles = [];
    initializeParticles();

    // Reset Chart
    history = [];
    if(chart) chart.data.labels = []; 
    if(chart) chart.data.datasets[0].data = [];
    if(chart) chart.update();

    updateChemistry();
    updateParticleCounts();
}

// === SISTEM PARTIKEL (VISUAL) ===

class Particle {
    constructor(type, x, y) {
        this.type = type;
        this.x = x || Math.random() * canvas.width;
        this.y = y || Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = 6;
        this.life = 1000; // Long life for main components
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        
        // Warna berdasarkan tipe
        switch(this.type) {
            case 'HA': ctx.fillStyle = '#60a5fa'; break; // Biru (Asam Lemah)
            case 'A': ctx.fillStyle = '#4ade80'; break;  // Hijau (Basa Konjugat)
            case 'H': ctx.fillStyle = '#f87171'; break;  // Merah (H+)
            case 'OH': ctx.fillStyle = '#c084fc'; break; // Ungu (OH-)
        }
        
        ctx.fill();
        
        // Label
        ctx.fillStyle = '#000';
        ctx.font = 'bold 8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        let label = this.type === 'HA' ? 'HA' : (this.type === 'A' ? 'A-' : (this.type === 'OH' ? 'OH' : 'H+'));
        ctx.fillText(label, this.x, this.y);
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
}

function initializeParticles() {
    // Buat partikel awal berdasarkan mol
    // Skala: 1 partikel = 0.005 mol
    let countHA = Math.floor(chem.mol_HA / 0.005);
    let countA = Math.floor(chem.mol_A / 0.005);

    for(let i=0; i<countHA; i++) particles.push(new Particle('HA'));
    for(let i=0; i<countA; i++) particles.push(new Particle('A'));
}

function createParticles(type, count) {
    // Spawn dari atas (menunjukkan penambahan)
    for(let i=0; i<count; i++) {
        particles.push(new Particle(type, canvas.width/2 + (Math.random()*40-20), 50));
    }
}

function updateParticleCounts() {
    // Hapus partikel yang sudah bereaksi secara visual (sederhana: filter berlebih)
    // Untuk simulasi sederhana, kita biarkan partikel bergerak.
    // Update counter info saja.
    
    let countHA = particles.filter(p => p.type === 'HA').length;
    let countA = particles.filter(p => p.type === 'A').length;
    let countH = particles.filter(p => p.type === 'H').length;
    let countOH = particles.filter(p => p.type === 'OH').length;

    document.getElementById('count-ha').innerText = countHA;
    document.getElementById('count-a').innerText = countA;
    document.getElementById('count-h').innerText = countH;
    document.getElementById('count-oh').innerText = countOH;
}

// === RENDER LOOP ===

function animate() {
    requestAnimationFrame(animate);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Gambar Background Beaker (Gradient warna berdasarkan pH)
    drawBeakerBackground();

    // 2. Logika Reaksi Partikel Visual
    handleParticleCollisions();

    // 3. Update & Draw Particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });
}

function drawBeakerBackground() {
    // Warna berubah sesuai pH
    let gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    
    let color;
    if(chem.pH < 3) color = 'rgba(239, 68, 68, 0.2)'; // Merah
    else if(chem.pH < 6) color = 'rgba(249, 115, 22, 0.2)'; // Oranye
    else if(chem.pH < 8) color = 'rgba(34, 197, 94, 0.2)'; // Hijau
    else if(chem.pH < 11) color = 'rgba(34, 211, 238, 0.2)'; // Cyan
    else color = 'rgba(59, 130, 246, 0.3)'; // Biru

    // Gambar larutan
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gambar skala sederhana (garis gelas ukur)
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - 50);
    ctx.lineTo(20, 50);
    ctx.stroke();
}

function handleParticleCollisions() {
    // Logika reaksi visual sederhana
    // H + A -> HA
    // OH + HA -> A
    
    let hParticles = particles.filter(p => p.type === 'H');
    let ohParticles = particles.filter(p => p.type === 'OH');
    let aParticles = particles.filter(p => p.type === 'A');
    let haParticles = particles.filter(p => p.type === 'HA');

    // Reaksi 1: H+ menabrak A-
    for(let h of hParticles) {
        for(let a of aParticles) {
            let dx = h.x - a.x;
            let dy = h.y - a.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 15) {
                h.type = 'HA'; // Berubah jadi HA
                a.life = 0;    // A- hilang
            }
        }
    }

    // Reaksi 2: OH- menabrak HA
    for(let oh of ohParticles) {
        for(let ha of haParticles) {
            let dx = oh.x - ha.x;
            let dy = oh.y - ha.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < 15) {
                oh.type = 'A'; // Berubah jadi A-
                ha.life = 0;   // HA hilang
            }
        }
    }

    // Hapus partikel mati
    particles = particles.filter(p => p.life !== 0);
}

// === CHART.JS SETUP ===

function initChart() {
    const ctxChart = document.getElementById('titrationChart').getContext('2d');
    chart = new Chart(ctxChart, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'pH',
                data: [],
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                borderWidth: 2,
                pointRadius: 1,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { 
                    title: { display: true, text: 'Vol (mL)', color: '#94a3b8' },
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' }
                },
                y: { 
                    title: { display: true, text: 'pH', color: '#94a3b8' },
                    grid: { color: '#334155' },
                    ticks: { color: '#94a3b8' },
                    min: 0, max: 14
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function addDataPoint() {
    history.push(chem.pH);
    let vol = volumeAdded;
    
    // Update Chart Data
    // Jika history terlalu panjang, ambil sampel atau biarkan penuh
    chart.data.labels.push(vol.toFixed(0));
    chart.data.datasets[0].data.push(chem.pH);
    
    // Batasi jumlah data point agar tidak berat
    if(chart.data.labels.length > 50) {
        chart.data.labels.shift();
        chart.data.datasets[0].data.shift();
    }

    chart.update();
}