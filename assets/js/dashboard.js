// ==========================================
// ChemBufferLab - Teacher Dashboard Logic
// File: js/dashboard.js
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});

function loadDashboardData() {
    // 1. Ambil data dari LocalStorage
    // Data Evaluasi disimpan oleh quiz.js dengan key 'chembufferlab_history'
    const evalHistory = JSON.parse(localStorage.getItem('chembufferlab_history') || '[]');
    
    // Data Game (Opsional, jika dimodifikasi untuk menyimpan score)
    const gameHistory = JSON.parse(localStorage.getItem('chembufferlab_game_history') || '[]');

    // 2. Hitung Statistik
    const stats = calculateStats(evalHistory);
    renderStats(stats);

    // 3. Render Tabel
    renderTable(evalHistory, gameHistory);
}

function calculateStats(data) {
    if (data.length === 0) {
        return { total: 0, avg: 0, high: 0, low: 0 };
    }

    const scores = data.map(d => d.Nilai);
    const total = data.length; // Jumlah attempt, bukan unique siswa untuk simplicitas
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = (sum / total).toFixed(1);
    const high = Math.max(...scores);
    const low = Math.min(...scores);

    return { total, avg, high, low };
}

function renderStats(stats) {
    // Update Card Stats
    document.querySelector('.grid-cols-1.md\\:grid-cols-4').innerHTML = `
        <div class="bg-card p-6 rounded-2xl border border-border">
            <div class="text-sm text-muted mb-1">Total Siswa Test</div>
            <div class="text-3xl font-display font-bold text-white">${stats.total}</div>
        </div>
        <div class="bg-card p-6 rounded-2xl border border-border">
            <div class="text-sm text-muted mb-1">Rata-rata Nilai</div>
            <div class="text-3xl font-display font-bold text-accent">${stats.avg}</div>
        </div>
        <div class="bg-card p-6 rounded-2xl border border-border">
            <div class="text-sm text-muted mb-1">Tertinggi</div>
            <div class="text-3xl font-display font-bold text-green-400">${stats.high}</div>
        </div>
        <div class="bg-card p-6 rounded-2xl border border-border">
            <div class="text-sm text-muted mb-1">Terendah</div>
            <div class="text-3xl font-display font-bold text-red-400">${stats.low}</div>
        </div>
    `;
}

function renderTable(evalData, gameData) {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = ''; // Clear dummy data

    if (evalData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-8 text-center text-muted">
                    Belum ada data siswa yang mengerjakan evaluasi.
                </td>
            </tr>
        `;
        return;
    }

    // Karena game.js sebelumnya tidak menyimpan nama, kita petakan berdasarkan Nama di Evaluasi
    // Asumsi: 1 nama = 1 siswa. Kita tampilkan data evaluasi terbaru per nama.
    
    // Balik array agar yang terbaru di atas
    const sortedData = [...evalData].reverse();

    sortedData.forEach(student => {
        const score = student.Nilai;
        const status = getStatus(score);
        
        // Cek apakah ada data game untuk nama ini (jika sudah diimplementasikan)
        // Untuk sekarang, kita isi default atau cek sederhana
        const gameScore = localStorage.getItem(`game_score_${student.Nama}`) || '-'; 
        
        // Logika sederhana: Materi & Latihan dianggap selesai jika sudah ikut evaluasi
        // (Ini bisa dikembangkan lebih lanjut dengan tracking progress terpisah)
        
        const row = document.createElement('tr');
        row.className = 'border-b border-border hover:bg-slate-800 transition-colors';
        
        row.innerHTML = `
            <td class="p-4 font-medium">
                ${student.Nama} <br>
                <span class="text-xs text-muted">${student.Kelas}</span>
            </td>
            <td class="p-4 text-center">
                <span class="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">Selesai</span>
            </td>
            <td class="p-4 text-center text-muted">-</td> <!-- Latihan belum tercatat -->
            <td class="p-4 text-center">${gameScore}</td>
            <td class="p-4 text-center font-bold ${score >= 70 ? 'text-accent' : 'text-red-400'}">${score}</td>
            <td class="p-4 text-center">
                <span class="px-2 py-1 rounded-full text-xs ${status.class}">${status.text}</span>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

function getStatus(score) {
    if (score >= 90) return { text: "Sangat Baik", class: "bg-primary/20 text-primary" };
    if (score >= 70) return { text: "Lulus", class: "bg-accent/20 text-accent" };
    if (score >= 50) return { text: "Cukup", class: "bg-yellow-500/20 text-yellow-400" };
    return { text: "Perlu Remedial", class: "bg-red-500/20 text-red-400" };
}