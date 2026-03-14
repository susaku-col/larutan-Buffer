// ==========================================
// ChemBufferLab - Unified Quiz Logic
// File: js/quiz.js
// Supports: Evaluasi, Latihan, Firebase DB
// ==========================================

// --- 1. KONFIGURASI FIREBASE ---
// PENTING: Ganti dengan config proyek Firebase Anda!
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "nama-proyek-anda.firebaseapp.com",
  databaseURL: "https://nama-proyek-anda-default-rtdb.firebaseio.com", // WAJIB ADA
  projectId: "nama-proyek-anda",
  storageBucket: "nama-proyek-anda.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX"
};

// Inisialisasi Firebase (Hanya jika library firebase tersedia)
let database;
if (typeof firebase !== 'undefined') {
  try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log("Firebase Connected");
  } catch (e) {
    console.error("Firebase init error:", e);
  }
} else {
  console.warn("Library Firebase tidak ditemukan. Data akan disimpan lokal.");
}

// --- BANK SOAL ---
const questionsData = [
  {
    q: "Manakah pasangan senyawa berikut yang dapat membentuk larutan penyangga asam?",
    options: ["HCl dan NaCl", "CH₃COOH dan CH₃COONa", "NaOH dan NaCl", "H₂SO₄ dan Na₂SO₄"],
    answer: 1,
    level: "Level 1 - Konsep",
    explanation: "Larutan penyangga asam terdiri dari asam lemah (CH₃COOH) dan garamnya yang terhidrolisis basa (CH₃COONa)."
  },
  {
    q: "Fungsi utama larutan penyangga dalam sistem biologi, seperti darah, adalah...",
    options: ["Menambah jumlah oksigen", "Menjaga pH agar tetap konstan", "Meningkatkan tekanan osmosis", "Menetralkan semua basa yang masuk"],
    answer: 1,
    level: "Level 1 - Konsep",
    explanation: "Larutan penyangga berfungsi mempertahankan pH agar perubahan yang terjadi minimal, sangat vital bagi enzim dalam tubuh."
  },
  {
    q: "Rumus Henderson-Hasselbalch untuk larutan penyangga asam adalah...",
    options: ["pH = pKa - log [Garam]/[Asam]", "pH = pKa + log [Asam]/[Garam]", "pH = pKa + log [Garam]/[Asam]", "pH = 14 - pKb + log [Basa]/[Garam]"],
    answer: 2,
    level: "Level 2 - Rumus",
    explanation: "Rumus yang benar adalah pH = pKa + log ([Garam]/[Asam]) atau log ([Basa Konjugat]/[Asam])."
  },
  {
    q: "Jika ke dalam larutan penyangga asam (CH₃COOH + CH₃COONa) ditambahkan sedikit HCl, apa yang terjadi?",
    options: ["pH turun drastis", "pH naik drastis", "pH relatif tetap", "Larutan menjadi basa"],
    answer: 2,
    level: "Level 2 - Mekanisme",
    explanation: "Penambahan HCl akan dinetralkan oleh ion A- (CH3COO-). Reaksi: CH3COO- + H+ -> CH3COOH. Akibatnya pH relatif tetap."
  },
  {
    q: "Pasangan mana yang membentuk larutan penyangga basa?",
    options: ["NH₃ dan NH₄Cl", "CH₃COOH dan NaOH (reaksi sempurna)", "HCl dan NaOH (reaksi sempurna)", "HNO₃ dan KNO₃"],
    answer: 0,
    level: "Level 1 - Konsep",
    explanation: "Penyangga basa terdiri dari basa lemah (NH3) dan garamnya (NH4Cl)."
  },
  {
    q: "Sebuah larutan penyangga terdiri dari asam lemah HA dan garamnya NaA. Jika Ka asam tersebut 1.0 x 10⁻⁵ dan konsentrasi [HA] = [A⁻], berapakah pH larutan tersebut?",
    options: ["3", "5", "7", "9"],
    answer: 1,
    level: "Level 3 - Kalkulasi",
    explanation: "Jika [HA] = [A-], maka log(1) = 0. Sehingga pH = pKa = -log(10^-5) = 5."
  },
  {
    q: "Kapasitas penyangga (buffer capacity) menunjukkan...",
    options: ["Kecepatan reaksi penyangga", "Banyaknya asam atau basa kuat yang dapat ditambahkan tanpa mengubah pH secara signifikan", "Volume larutan penyangga", "Jumlah mol ion H⁺ dalam larutan"],
    answer: 1,
    level: "Level 2 - Konsep",
    explanation: "Kapasitas penyangga mengukur kemampuan larutan untuk menahan perubahan pH. Makin besar konsentrasi komponen, makin tinggi kapasitasnya."
  },
  {
    q: "Komponen aktif dalam sistem penyangga fosfat di dalam tubuh manusia adalah...",
    options: ["H₂CO₃ dan HCO₃⁻", "H₃PO₄ dan H₂PO₄⁻", "H₂PO₄⁻ dan HPO₄²⁻", "PO₄³⁻ dan HPO₄²⁻"],
    answer: 2,
    level: "Level 1 - Aplikasi",
    explanation: "Sistem penyangga fosfat dalam tubuh menggunakan pasangan H2PO4- (asam) dan HPO4^2- (basa konjugat)."
  },
  {
    q: "Penambahan sedikit NaOH ke dalam larutan penyangga asam akan menyebabkan reaksi...",
    options: [
      "Garam (A⁻) bereaksi dengan OH⁻",
      "Asam lemah (HA) bereaksi dengan OH⁻ membentuk A⁻ dan H₂O",
      "Asam lemah (HA) bereaksi dengan H⁺",
      "Tidak terjadi reaksi sama sekali"
    ],
    answer: 1,
    level: "Level 2 - Mekanisme",
    explanation: "NaOH (basa kuat) akan bereaksi dengan asam lemah HA. Reaksi: HA + OH- -> A- + H2O."
  },
  {
    q: "Mengapa air hujan biasanya memiliki pH sekitar 5.6, bukan 7.0?",
    options: ["Karena adanya gas CO₂ di atmosfer yang membentuk asam karbonat", "Karena adanya gas O₂", "Karena air hujan adalah larutan penyangga", "Karena adanya debu"],
    answer: 0,
    level: "Level 3 - Aplikasi",
    explanation: "CO2 di udara larut dalam air hujan membentuk asam karbonat (H2CO3) yang bersifat asam, menurunkan pH air hujan menjadi sekitar 5.6."
  }
];

// ==================================================
// STATE VARIABEL
// ==================================================
// Untuk Evaluasi
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeLeft = 15 * 60;
let studentInfo = { name: "", class: "" };

// Untuk Latihan
let latihanQuestions = [];
let currentLatihanIndex = 0;
let latihanScore = 0;

// ==================================================
// FUNGSI UTAMA (DIPANGGIL DARI HTML)
// ==================================================

// 1. Inisialisasi Latihan (latihan.html)
window.initLatihan = function() {
  // Acak soal dan ambil 5
  latihanQuestions = [...questionsData].sort(() => Math.random() - 0.5).slice(0, 5);
  currentLatihanIndex = 0;
  latihanScore = 0;
  
  const totalQ = document.getElementById('total-questions');
  if(totalQ) totalQ.textContent = latihanQuestions.length;
  
  const scoreEl = document.getElementById('quiz-score');
  if(scoreEl) scoreEl.textContent = 0;
  
  renderLatihanQuestion();
};

// 2. Inisialisasi Evaluasi (evaluasi.html)
window.checkLogin = function() {
  const nameInput = document.getElementById('student-name').value.trim();
  const classInput = document.getElementById('student-class').value.trim();

  if (!nameInput || !classInput) {
    alert("Harap isi nama dan kelas!");
    return;
  }

  studentInfo.name = nameInput;
  studentInfo.class = classInput;
  
  // Simpan nama untuk referensi game/overlay lain
  localStorage.setItem('current_student_name', nameInput);

  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('pre-test-info').classList.remove('hidden');
};

window.startEvaluation = function() {
  document.getElementById('pre-test-info').classList.add('hidden');
  document.getElementById('test-area').classList.remove('hidden');
  
  currentQuestionIndex = 0;
  userAnswers = new Array(questionsData.length).fill(null);
  timeLeft = 15 * 60;
  
  renderEvaluationQuestion();
  startTimer();
};

// Navigasi Latihan
window.nextQuestion = function() {
  currentLatihanIndex++;
  if (currentLatihanIndex < latihanQuestions.length) {
    renderLatihanQuestion();
  } else {
    // Selesai
    const card = document.getElementById('question-card');
    if(card) {
        card.innerHTML = `
          <div class="text-center py-10">
            <h3 class="font-display text-2xl font-bold mb-4 text-accent">Latihan Selesai!</h3>
            <p class="text-muted mb-6">Skor akhir kamu: <span class="text-white font-bold">${latihanScore}/${latihanQuestions.length}</span></p>
            <button onclick="initLatihan()" class="btn-primary px-6 py-3 rounded-xl text-white">Ulangi Latihan</button>
            <a href="evaluasi.html" class="block mt-4 text-sm text-accent hover:underline">Lanjut ke Evaluasi Formal</a>
          </div>
        `;
    }
    const feedback = document.getElementById('feedback-card');
    if(feedback) feedback.classList.add('hidden');
    
    const nextBtn = document.getElementById('next-btn');
    if(nextBtn) nextBtn.classList.add('hidden');
    
    const progress = document.getElementById('quiz-progress');
    if(progress) progress.style.width = '100%';
  }
};

// ==================================================
// RENDER LOGIC
// ==================================================

// --- Logika Render Latihan ---
function renderLatihanQuestion() {
  const q = latihanQuestions[currentLatihanIndex];
  
  const curQ = document.getElementById('current-question');
  if(curQ) curQ.textContent = currentLatihanIndex + 1;
  
  const lvl = document.getElementById('question-level');
  if(lvl) lvl.textContent = q.level;
  
  const txt = document.getElementById('question-text');
  if(txt) txt.textContent = q.q;
  
  const prog = document.getElementById('quiz-progress');
  if(prog) prog.style.width = ((currentLatihanIndex + 1) / latihanQuestions.length * 100) + '%';
  
  const container = document.getElementById('options-container');
  if(!container) return;
  container.innerHTML = '';
  
  const labels = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, idx) => {
    const div = document.createElement('div');
    div.className = 'quiz-option p-4 rounded-xl border border-border cursor-pointer hover:border-primary transition-colors';
    div.onclick = () => checkLatihanAnswer(idx);
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="w-8 h-8 rounded-lg bg-dark border border-border flex items-center justify-center font-bold text-sm">${labels[idx]}</span>
        <span>${opt}</span>
      </div>
    `;
    container.appendChild(div);
  });
  
  // Reset UI state
  const feedbackCard = document.getElementById('feedback-card');
  if(feedbackCard) feedbackCard.classList.add('hidden');
  
  const nextBtn = document.getElementById('next-btn');
  if(nextBtn) nextBtn.classList.add('hidden');
}

function checkLatihanAnswer(selectedIndex) {
  const q = latihanQuestions[currentLatihanIndex];
  const isCorrect = selectedIndex === q.answer;
  
  if (isCorrect) latihanScore++;
  
  const scoreEl = document.getElementById('quiz-score');
  if(scoreEl) scoreEl.textContent = latihanScore;
  
  // Update Option Styles
  const options = document.getElementById('options-container').children;
  for (let i = 0; i < options.length; i++) {
    options[i].onclick = null; // Disable click
    options[i].classList.remove('hover:border-primary');
    
    if (i === q.answer) {
      options[i].classList.add('correct');
    } else if (i === selectedIndex && !isCorrect) {
      options[i].classList.add('incorrect');
    }
  }
  
  // Show Feedback
  const feedbackCard = document.getElementById('feedback-card');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackText = document.getElementById('feedback-text');
  
  if(feedbackCard) {
      feedbackCard.classList.remove('hidden', 'bg-green-500/10', 'border-green-500/30', 'bg-red-500/10', 'border-red-500/30');
      
      if (isCorrect) {
        feedbackCard.classList.add('bg-green-500/10', 'border-green-500/30');
        if(feedbackIcon) {
            feedbackIcon.innerHTML = `<svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
            feedbackIcon.className = "w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20";
        }
        if(feedbackTitle) {
            feedbackTitle.textContent = "Benar!";
            feedbackTitle.className = "font-display font-semibold mb-2 text-green-400";
        }
      } else {
        feedbackCard.classList.add('bg-red-500/10', 'border-red-500/30');
        if(feedbackIcon) {
            feedbackIcon.innerHTML = `<svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
            feedbackIcon.className = "w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/20";
        }
        if(feedbackTitle) {
            feedbackTitle.textContent = "Kurang Tepat";
            feedbackTitle.className = "font-display font-semibold mb-2 text-red-400";
        }
      }
      
      if(feedbackText) feedbackText.textContent = q.explanation;
  }
  
  // Show Next Button
  const nextBtn = document.getElementById('next-btn');
  if(nextBtn) nextBtn.classList.remove('hidden');
}

// --- Logika Render Evaluasi ---
function renderEvaluationQuestion() {
  const qData = questionsData[currentQuestionIndex];
  
  const curEl = document.getElementById('eval-current');
  if(curEl) curEl.textContent = currentQuestionIndex + 1;
  
  const qEl = document.getElementById('eval-question-text');
  if(qEl) qEl.textContent = qData.q;

  const container = document.getElementById('eval-options-container');
  if(!container) return;
  container.innerHTML = '';
  
  const labels = ['A', 'B', 'C', 'D'];
  
  qData.options.forEach((opt, idx) => {
    const isSelected = userAnswers[currentQuestionIndex] === idx;
    const div = document.createElement('div');
    div.className = `quiz-option ${isSelected ? 'selected' : ''} flex items-center gap-3`;
    div.onclick = () => selectOption(idx);
    div.innerHTML = `
      <span class="w-8 h-8 rounded-lg ${isSelected ? 'bg-accent text-darker' : 'bg-dark border border-border'} flex items-center justify-center font-bold text-sm flex-shrink-0">${labels[idx]}</span>
      <span>${opt}</span>
    `;
    container.appendChild(div);
  });
  updateNavButtons();
}

function updateNavButtons() {
  const prevBtn = document.getElementById('eval-prev-btn');
  const nextBtn = document.getElementById('eval-next-btn');
  
  // Safety check if elements exist (they won't on latihan page)
  if (!prevBtn || !nextBtn) return;

  prevBtn.disabled = currentQuestionIndex === 0;
  
  if (currentQuestionIndex === questionsData.length - 1) {
    nextBtn.textContent = "Kumpulkan";
    nextBtn.onclick = () => { if(confirm("Yakin ingin mengumpulkan evaluasi?")) submitQuiz(); };
  } else {
    nextBtn.textContent = "Selanjutnya";
    nextBtn.onclick = nextEvalQuestion;
  }
}

window.selectOption = function(index) {
  userAnswers[currentQuestionIndex] = index;
  renderEvaluationQuestion();
};

window.nextEvalQuestion = function() {
  if (currentQuestionIndex < questionsData.length - 1) {
    currentQuestionIndex++;
    renderEvaluationQuestion();
  }
};

window.prevEvalQuestion = function() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderEvaluationQuestion();
  }
};

function startTimer() {
  const timerDisplay = document.getElementById('timer');
  if(!timerDisplay) return;
  
  if(timerInterval) clearInterval(timerInterval); // Clear existing
  
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Waktu habis!");
      submitQuiz();
      return;
    }
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft < 60) timerDisplay.classList.add('text-red-500');
  }, 1000);
}

function submitQuiz() {
  clearInterval(timerInterval);
  let score = 0;
  userAnswers.forEach((ans, idx) => {
    if (ans === questionsData[idx].answer) score++;
  });
  const finalScore = score * 10;
  
  // Simpan ke Firebase
  saveResult(studentInfo.name, studentInfo.class, finalScore, score, questionsData.length - score);
  
  document.getElementById('test-area').classList.add('hidden');
  document.getElementById('results-area').classList.remove('hidden');
  
  const resScore = document.getElementById('result-score');
  if(resScore) resScore.textContent = finalScore;
  
  const corCount = document.getElementById('correct-count');
  if(corCount) corCount.textContent = score;
  
  const wroCount = document.getElementById('wrong-count');
  if(wroCount) wroCount.textContent = questionsData.length - score;

  const circle = document.getElementById('result-circle');
  const title = document.getElementById('result-title');
  
  if (finalScore >= 70) {
    if(circle) circle.className = "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-500/20 border-4 border-green-500 text-green-400";
    if(title) title.textContent = "Selamat, Anda Lulus!";
  } else {
    if(circle) circle.className = "w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center bg-red-500/20 border-4 border-red-500 text-red-400";
    if(title) title.textContent = "Belum Lulus";
  }
}

window.reviewAnswers = function() {
  document.getElementById('results-area').classList.add('hidden');
  document.getElementById('test-area').classList.remove('hidden');
  currentQuestionIndex = 0;
  renderReviewMode();
}

function renderReviewMode() {
  const qData = questionsData[currentQuestionIndex];
  
  const curEl = document.getElementById('eval-current');
  if(curEl) curEl.textContent = currentQuestionIndex + 1;
  
  const qEl = document.getElementById('eval-question-text');
  if(qEl) qEl.textContent = qData.q;
  
  const container = document.getElementById('eval-options-container');
  if(!container) return;
  container.innerHTML = '';
  
  const labels = ['A', 'B', 'C', 'D'];

  qData.options.forEach((opt, idx) => {
    const isCorrect = idx === qData.answer;
    const isUserChoice = userAnswers[currentQuestionIndex] === idx;
    let colorClass = "bg-dark border-border";
    if (isCorrect) colorClass = "bg-green-500/10 border-green-500 text-green-400";
    else if (isUserChoice && !isCorrect) colorClass = "bg-red-500/10 border-red-500 text-red-400";

    const div = document.createElement('div');
    div.className = `quiz-option ${colorClass} border flex items-center gap-3 cursor-default`;
    div.innerHTML = `
      <span class="w-8 h-8 rounded-lg bg-dark/50 flex items-center justify-center font-bold text-sm flex-shrink-0 border ${isCorrect ? 'border-green-500 text-green-400' : 'border-border'}">${labels[idx]}</span>
      <span>${opt}</span>
      ${isCorrect ? '<span class="ml-auto text-xs font-bold text-green-400">JAWABAN BENAR</span>' : ''}
    `;
    container.appendChild(div);
  });

  const nextBtn = document.getElementById('eval-next-btn');
  const prevBtn = document.getElementById('eval-prev-btn');
  
  if(nextBtn) {
      nextBtn.textContent = "Selanjutnya";
      nextBtn.onclick = () => {
        if(currentQuestionIndex < questionsData.length - 1) { currentQuestionIndex++; renderReviewMode(); } 
        else { 
            document.getElementById('test-area').classList.add('hidden'); 
            document.getElementById('results-area').classList.remove('hidden'); 
        }
      };
  }
  
  if(prevBtn) {
      prevBtn.disabled = currentQuestionIndex === 0;
      prevBtn.onclick = () => { if(currentQuestionIndex > 0) { currentQuestionIndex--; renderReviewMode(); } };
  }
}

window.restartEvaluation = function() {
  document.getElementById('results-area').classList.add('hidden');
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('student-name').value = '';
  document.getElementById('student-class').value = '';
}

// ==================================================
// FUNGSI DATABASE (FIREBASE)
// ==================================================

function saveResult(name, kelas, score, correct, wrong) {
  const resultId = Date.now();
  const data = {
    Tanggal: new Date().toLocaleString('id-ID'),
    Nama: name,
    Kelas: kelas,
    Nilai: score,
    Benar: correct,
    Salah: wrong,
    Timestamp: resultId
  };

  if (database) {
    // Simpan ke Firebase
    database.ref('results/' + resultId).set(data)
      .then(() => console.log("Data tersimpan ke Cloud"))
      .catch(error => console.error("Gagal simpan ke Cloud:", error));
  } else {
    // Fallback ke LocalStorage jika Firebase tidak ada
    let history = JSON.parse(localStorage.getItem('chembufferlab_history') || '[]');
    history.push(data);
    localStorage.setItem('chembufferlab_history', JSON.stringify(history));
    console.log("Data tersimpan ke LocalStorage");
  }
}

window.exportToExcel = function() {
  // UI Loading
  const btn = document.querySelector('[onclick="exportToExcel()"]');
  const originalText = btn ? btn.innerHTML : 'Export Data';
  if(btn) {
      btn.innerHTML = "Mengambil data...";
      btn.disabled = true;
  }

  // Fungsi proses data
  const processData = (data) => {
    if (data.length === 0) {
      alert("Tidak ada data untuk diekspor.");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Evaluasi");
    XLSX.writeFile(wb, `Rekap_ChemBufferLab_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (database) {
      // Ambil dari Firebase
      database.ref('results').once('value')
        .then(snapshot => {
          if (!snapshot.exists()) {
            alert("Belum ada data siswa di Cloud.");
            return;
          }
          const data = [];
          snapshot.forEach(child => data.push(child.val()));
          processData(data);
        })
        .catch(error => {
          console.error(error);
          alert("Gagal mengambil data dari Cloud.");
        })
        .finally(() => {
            if(btn) {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
  } else {
      // Ambil dari LocalStorage
      const localData = JSON.parse(localStorage.getItem('chembufferlab_history') || '[]');
      processData(localData);
      if(btn) {
          btn.innerHTML = originalText;
          btn.disabled = false;
      }
  }
};