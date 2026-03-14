// ==========================================
// ChemBufferLab - Buffer Defender Game
// File: js/game.js
// ==========================================

// --- KONFIGURASI GAME ---
const CONFIG = {
  pH_SAFE_MIN: 4.0,
  pH_SAFE_MAX: 10.0,
  pH_START: 7.0,
  pH_IMPACT: 0.15,       // Perubahan pH per ion yang lolos
  ION_BASE_SPEED: 2.0,
  SPAWN_RATE_INIT: 90,   // Frame delay antar spawn (awal)
  POINTS_PER_KILL: 10,
  LEVEL_UP_SCORE: 150,   // Skor yang dibutuhkan untuk naik level
  PARTICLE_COUNT: 10     // Jumlah partikel saat ledakan
};

// --- STATE GAME ---
let canvas, ctx;
let width, height;
let ions = [];
let particles = [];
let score = 0;
let level = 1;
let currentPH = CONFIG.pH_START;
let isRunning = false;
let spawnTimer = 0;
let animationId;

// --- INISIALISASI ---
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Event listener untuk klik (Desktop & Mobile)
  canvas.addEventListener('click', handleInteraction);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Mencegah scroll saat bermain
    const touch = e.touches[0];
    handleInteraction({ clientX: touch.clientX, clientY: touch.clientY });
  }, {passive: false});
  
  // Reset tampilan awal
  resetStats();
  
  // Mulai render loop (hanya background awal)
  renderBackground();
});

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  canvas.width = width;
  canvas.height = height;
}

// --- LOGIKA UTAMA ---

window.startGame = function() {
  // Reset state
  ions = [];
  particles = [];
  score = 0;
  level = 1;
  currentPH = CONFIG.pH_START;
  spawnTimer = 0;
  isRunning = true;
  
  // Sembunyikan overlay
  document.getElementById('gameOverlay').style.display = 'none';
  document.getElementById('finalScoreDisplay').classList.add('hidden');
  
  updateUI();
  
  // Batalkan animasi sebelumnya jika ada
  if (animationId) cancelAnimationFrame(animationId);
  
  gameLoop();
};

function gameOver() {
  isRunning = false;
  
  // Tampilkan overlay
  const overlay = document.getElementById('gameOverlay');
  overlay.style.display = 'flex';
  
  // Update skor akhir
  const finalScoreEl = document.getElementById('finalScoreDisplay');
  finalScoreEl.classList.remove('hidden');
  document.getElementById('finalScore').textContent = score;
  
  // Ubah pesan tombol
  const btn = overlay.querySelector('button');
  btn.textContent = 'Main Lagi';
  
  // Simpan skor (opsional, jika ingin masuk dashboard)
  saveGameScore(score);
}

function gameLoop() {
  if (!isRunning) return;

  // 1. Clear Canvas & Draw Background
  renderBackground();

  // 2. Spawn Ion
  spawnTimer++;
  // Spawn rate bertambah cepat seiring level
  const spawnDelay = Math.max(20, CONFIG.SPAWN_RATE_INIT - (level * 8)); 
  
  if (spawnTimer >= spawnDelay) {
    spawnIon();
    spawnTimer = 0;
  }

  // 3. Update & Draw Ion
  for (let i = ions.length - 1; i >= 0; i--) {
    const ion = ions[i];
    ion.update();
    ion.draw();

    // Jika ion mencapai bawah (larutan)
    if (ion.y > height) {
      // Ubah pH
      if (ion.type === 'H') currentPH -= CONFIG.pH_IMPACT;
      else currentPH += CONFIG.pH_IMPACT;
      
      ions.splice(i, 1);
      
      // Cek Game Over
      if (currentPH < CONFIG.pH_SAFE_MIN || currentPH > CONFIG.pH_SAFE_MAX) {
        gameOver();
        return;
      }
      updateUI();
    }
  }

  // 4. Update & Draw Partikel Efek
  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].draw();
    if (particles[i].life <= 0) particles.splice(i, 1);
  }

  // 5. Cek Level Up
  checkLevelUp();

  animationId = requestAnimationFrame(gameLoop);
}

// --- OBJEK GAME ---

class Ion {
  constructor() {
    this.type = Math.random() > 0.5 ? 'H' : 'OH';
    this.x = Math.random() * (width - 60) + 30; // Padding samping
    this.y = -30;
    this.radius = 18 + Math.random() * 6;
    this.speed = CONFIG.ION_BASE_SPEED + (level * 0.4) + (Math.random() * 1);
    this.wobble = Math.random() * Math.PI * 2;
    
    // Visual
    this.color = this.type === 'H' ? '#ef4444' : '#3b82f6'; // Merah / Biru
    this.symbol = this.type === 'H' ? 'H⁺' : 'OH⁻';
  }

  update() {
    this.y += this.speed;
    // Gerak sedikit ke kanan/kiri (wobble)
    this.wobble += 0.05;
    this.x += Math.sin(this.wobble) * 0.5;
    
    // Pastikan tetap di dalam layar horizontal
    if (this.x < 20) this.x = 20;
    if (this.x > width - 20) this.x = width - 20;
  }

  draw() {
    ctx.save();
    
    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    
    // Circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    
    // Text Symbol
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${this.radius}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.symbol, this.x, this.y);
    
    ctx.restore();
  }
}

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.random() * 3 + 1;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 2;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.life = 1.0; // Opacity
    this.decay = Math.random() * 0.03 + 0.02;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.1; // Gravitasi
    this.life -= this.decay;
  }

  draw() {
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// --- MEKANIK GAME ---

function spawnIon() {
  ions.push(new Ion());
}

function handleInteraction(e) {
  if (!isRunning) return;

  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Cek tabrakan dengan ion ( dari atas ke bawah list untuk hit yang paling depan )
  for (let i = ions.length - 1; i >= 0; i--) {
    const ion = ions[i];
    const dist = Math.sqrt((clickX - ion.x) ** 2 + (clickY - ion.y) ** 2);

    if (dist < ion.radius + 15) { // +15px tolerance
      
      // Create visual feedback (neutralized text)
      createExplosion(ion.x, ion.y, ion.color);
      
      // Remove ion
      ions.splice(i, 1);
      
      // Add Score
      score += CONFIG.POINTS_PER_KILL * level;
      updateUI();
      
      break; // Hanya hit satu ion per klik
    }
  }
}

function createExplosion(x, y, color) {
  for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
    particles.push(new Particle(x, y, color));
  }
  
  // Tambah teks "Netral!" atau lainnya (opsional visual)
}

function checkLevelUp() {
  const nextLevelThreshold = level * CONFIG.LEVEL_UP_SCORE;
  if (score >= nextLevelThreshold) {
    level++;
    updateUI();
  }
}

// --- VISUAL & UI ---

function renderBackground() {
  // Warna background berubah perlahan berdasarkan pH
  let r, g, b;
  
  // Rentang warna:
  // pH 4 (Asam) -> Merah/Ungu gelap
  // pH 7 (Netral) -> Hijau/Biru gelap (Base)
  // pH 10 (Basa) -> Biru terang
  
  if (currentPH < 7) {
    // Asam (Kemerahan)
    const ratio = (7 - currentPH) / 3; 
    r = Math.floor(15 + ratio * 40);
    g = Math.floor(23 - ratio * 10);
    b = Math.floor(42 - ratio * 10);
  } else {
    // Basa (Kebiruan)
    const ratio = (currentPH - 7) / 3;
    r = Math.floor(15 - ratio * 5);
    g = Math.floor(23 + ratio * 10);
    b = Math.floor(42 + ratio * 30);
  }

  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
  ctx.fillRect(0, 0, width, height);
  
  // Tambah grid efek lab
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  for(let i = 0; i < width; i += 50) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }
  for(let i = 0; i < height; i += 50) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }
}

function updateUI() {
  // Update Skor & Level
  const scoreEl = document.getElementById('scoreDisplay');
  if(scoreEl) scoreEl.textContent = score;
  
  const levelEl = document.getElementById('levelDisplay');
  if(levelEl) levelEl.textContent = level;
  
  // Update pH Text
  const phDisplay = document.getElementById('currentPH');
  if(phDisplay) {
      phDisplay.textContent = currentPH.toFixed(2);
      
      // Warn text if danger
      if (currentPH < 5 || currentPH > 9) {
        phDisplay.classList.add('text-red-400');
        phDisplay.classList.remove('text-white');
      } else {
        phDisplay.classList.remove('text-red-400');
        phDisplay.classList.add('text-white');
      }
  }

  // Update pH Bar
  // pH range 0-14. Percent = pH/14. Position width.
  const percent = (currentPH / 14) * 100;
  const phBar = document.getElementById('phBar');
  if(phBar) phBar.style.width = `${percent}%`;
}

function resetStats() {
  const scoreEl = document.getElementById('scoreDisplay');
  if(scoreEl) scoreEl.textContent = '0';
  
  const levelEl = document.getElementById('levelDisplay');
  if(levelEl) levelEl.textContent = '1';
  
  const phDisplay = document.getElementById('currentPH');
  if(phDisplay) phDisplay.textContent = '7.00';
  
  const phBar = document.getElementById('phBar');
  if(phBar) phBar.style.width = '50%';
}

// --- HELPER ---

function saveGameScore(finalScore) {
  // Cek apakah ada nama siswa dari evaluasi sebelumnya
  let playerName = localStorage.getItem('current_student_name');
  
  if (!playerName) {
    // Jika tidak ada, minta input sederhana (opsional, bisa dihapus jika tidak ingin prompt)
    // playerName = prompt("Masukkan nama untuk menyimpan skor:");
    // if(!playerName) return; // Batal jika tidak input
    return; // Atau langsung return jika tidak ingin simpan tanpa nama
  }

  // Simpan ke history game (untuk dashboard)
  let gHistory = JSON.parse(localStorage.getItem('chembufferlab_game_history') || '[]');
  gHistory.push({
    name: playerName,
    score: finalScore,
    level: level,
    date: new Date().toLocaleString('id-ID')
  });
  localStorage.setItem('chembufferlab_game_history', JSON.stringify(gHistory));
  
  // Update highscore jika perlu
  const key = `game_score_${playerName}`;
  const currentHigh = localStorage.getItem(key) || 0;
  if (finalScore > currentHigh) {
    localStorage.setItem(key, finalScore);
  }
}