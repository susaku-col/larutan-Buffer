// ==========================================
// ChemBufferLab - Unified Quiz Logic
// File: assets/js/quiz.js
// Ver: 3.1 Full (45 Bank, 15 Random, Absen)
// ==========================================

// --- 1. KONFIGURASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "nama-proyek-anda.firebaseapp.com",
  databaseURL: "https://nama-proyek-anda-default-rtdb.firebaseio.com",
  projectId: "nama-proyek-anda",
  storageBucket: "nama-proyek-anda.appspot.com",
  messagingSenderId: "XXXXXXXXXXXX",
  appId: "1:XXXXXXXXXXXX:web:XXXXXXXXXXXX"
};

let database;
if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log("Firebase Connected");
  } catch (e) { console.error("Firebase init error:", e); }
} else { console.warn("Library Firebase tidak ditemukan. Data disimpan lokal."); }

// --- BANK SOAL (45 SOAL) ---
// Komposisi: L1(8), L2(8), L3(8), L4(8), L5(7), L6(6) = 45 Soal
const questionBank = [
  // == LEVEL 1: MENGINGAT (8 Soal) ==
  { q: "Pasangan senyawa manakah yang merupakan komponen utama larutan penyangga asam?", options: ["Asam kuat dan Basa kuat", "Asam lemah dan Garamnya", "Basa lemah dan Asam kuat", "Garam netral dan Air"], answer: 1, level: "Level 1 - Mengingat", explanation: "Larutan penyangga asam terdiri dari asam lemah dan basa konjugatnya (garam)." },
  { q: "Pasangan senyawa berikut yang dapat membentuk larutan penyangga basa adalah...", options: ["NH3 dan HCl", "NH3 dan NH4Cl", "CH3COOH dan NaOH", "HCl dan NaCl"], answer: 1, level: "Level 1 - Mengingat", explanation: "Penyangga basa terdiri dari basa lemah (NH3) dan garamnya (NH4Cl)." },
  { q: "Rumus Henderson-Hasselbalch untuk larutan penyangga asam adalah...", options: ["pH = pKa - log [A-]/[HA]", "pH = pKa + log [A-]/[HA]", "pH = pKa + log [HA]/[A-]", "pOH = pKb + log [A-]/[HA]"], answer: 1, level: "Level 1 - Mengingat", explanation: "Rumus yang benar adalah pH = pKa + log ([Basakonjugat]/[Asam])." },
  { q: "Fungsi utama larutan penyangga dalam tubuh manusia adalah...", options: ["Menambah energi", "Menjaga kestabilan pH", "Meningkatkan tekanan darah", "Mengubah warna darah"], answer: 1, level: "Level 1 - Mengingat", explanation: "Buffer menjaga pH agar metabolisme tubuh berjalan normal." },
  { q: "Contoh larutan penyangga dalam darah manusia adalah sistem...", options: ["HCl/NaCl", "H2CO3/HCO3-", "CH3COOH/CH3COO-", "NH3/NH4+"], answer: 1, level: "Level 1 - Mengingat", explanation: "Sistem karbonat (H2CO3/HCO3-) adalah buffer utama dalam darah." },
  { q: "Jika ke dalam larutan penyangga ditambahkan sedikit air, maka pH larutan akan...", options: ["Naik signifikan", "Turun signifikan", "Tetap relatif konstan", "Menjadi netral"], answer: 2, level: "Level 1 - Mengingat", explanation: "Pengenceran tidak mengubah rasio mol asam dan basa, sehingga pH relatif tetap." },
  { q: "Kapasitas penyangga bergantung pada...", options: ["Warna larutan", "Suhu ruangan", "Konsentrasi total asam dan garam", "Volume wadah"], answer: 2, level: "Level 1 - Mengingat", explanation: "Semakin tinggi konsentrasi total komponen buffer, semakin tinggi kapasitasnya." },
  { q: "Garam yang dapat membentuk larutan penyangga jika dicampur dengan asam lemahnya adalah...", options: ["NaCl", "Na2SO4", "CH3COONa", "KNO3"], answer: 2, level: "Level 1 - Mengingat", explanation: "CH3COONa adalah garam dari asam lemah CH3COOH." },

  // == LEVEL 2: MEMAHAMI (8 Soal) ==
  { story: "Seorang siswa menambahkan sedikit HCl ke dalam larutan penyangga asam asetat.", q: "Mengapa pH larutan tersebut tidak berubah secara drastis?", options: ["HCl bereaksi dengan air", "Ion A- bereaksi dengan H+ dari HCl", "HCl menguap", "Asam asetat mengendap"], answer: 1, level: "Level 2 - Memahami", explanation: "Ion A- (basa konjugat) menetralkan H+ tambahan, menjaga pH." },
  { story: "Ketika NaOH ditambahkan ke dalam larutan penyangga asam.", q: "Reaksi apa yang terjadi?", options: ["NaOH bereaksi dengan air", "NaOH bereaksi dengan asam lemah (HA)", "NaOH bereaksi dengan garam (A-)", "Tidak ada reaksi"], answer: 1, level: "Level 2 - Memahami", explanation: "OH- dari NaOH akan dinetralkan oleh asam lemah (HA)." },
  { q: "Mengapa larutan HCl 0,1 M tidak dapat bertindak sebagai larutan penyangga?", options: ["Karena bersifat asam kuat", "Karena tidak memiliki pasangan asam-basa konjugat", "Karna harganya mahal", "Karena bersifat korosif"], answer: 1, level: "Level 2 - Memahami", explanation: "Buffer memerlukan pasangan asam lemah & basa konjugatnya (atau sebaliknya)." },
  { q: "Sifat larutan penyangga yang membedakannya dari larutan biasa adalah...", options: ["Warnanya tetap", "pH berubah drastis", "Dapat mempertahankan pH", "Rasanya asam"], answer: 2, level: "Level 2 - Memahami", explanation: "Kemampuan mempertahankan pH adalah sifat utama buffer." },
  { story: "Seseorang yang mengalami hiperventilasi (terlalu banyak menghembuskan CO2) menyebabkan kadar H2CO3 dalam darah turun.", q: "Apa dampaknya terhadap pH darah?", options: ["Turun (Asidosis)", "Naik (Alkalosis)", "Tetap", "Menjadi netral"], answer: 1, level: "Level 2 - Memahami", explanation: "Berkurangnya asam (H2CO3) menyebabkan pH naik (Alkalosis)." },
  { q: "Penambahan sedikit basa kuat ke dalam larutan penyangga basa akan menyebabkan...", options: ["pH naik tajam", "pH turun tajam", "pH relatif tetap", "Terjadi endapan"], answer: 2, level: "Level 2 - Memahami", explanation: "Buffer basa mampu menetralisir penambahan basa kuat melalui reaksi dengan garamnya." },
  { q: "Mengapa sistem buffer dalam darah sangat penting bagi manusia?", options: ["Untuk mencerna makanan", "Agar enzim dapat bekerja optimal", "Untuk menghasilkan sel darah", "Untuk mengatur suhu tubuh"], answer: 1, level: "Level 2 - Memahami", explanation: "Enzim sangat sensitif terhadap perubahan pH; buffer menjaga kondisi optimal." },
  { q: "Jika [Garam] > [Asam] dalam larutan penyangga asam, maka pH larutan akan...", options: ["Lebih kecil dari pKa", "Sama dengan pKa", "Lebih besar dari pKa", "Sama dengan 7"], answer: 2, level: "Level 2 - Memahami", explanation: "Jika [A-] > [HA], maka log([A-]/[HA]) positif, sehingga pH > pKa." },

  // == LEVEL 3: MENERAPKAN (8 Soal) ==
  { story: "Diketahui Ka asam asetat = 10^-5. Campuran CH3COOH 0.1 M dan CH3COONa 0.1 M.", q: "Berapakah pH larutan tersebut?", options: ["3", "5", "7", "9"], answer: 1, level: "Level 3 - Menerapkan", explanation: "Karena [A-]=[HA], maka pH = pKa + log 1 = pKa = 5." },
  { story: "Larutan penyangga dibuat dari 100 mL NH3 0.1 M dan 100 mL NH4Cl 0.1 M (Kb NH3 = 10^-5).", q: "Hitunglah pOH larutan!", options: ["3", "5", "7", "9"], answer: 1, level: "Level 3 - Menerapkan", explanation: "pOH = pKb + log([Garam]/[Basa]) = 5 + log(1) = 5." },
  { story: "Seorang teknisi membuat buffer dengan pH 9 menggunakan NH3 (pKb=5) dan NH4Cl.", q: "Berapa perbandingan [Garam] : [Basa] yang dibutuhkan?", options: ["1 : 1", "1 : 10", "10 : 1", "1 : 100"], answer: 1, level: "Level 3 - Menerapkan", explanation: "pOH = 14-9 = 5. Maka 5 = 5 + log(X). X=1. Tapi soal minta pH 9, bukan pOH 5. (Asumsi: perbandingan 1:1)." },
  { story: "Tentukan pH campuran HCN 0.1 M dan NaCN 0.2 M (Ka HCN = 10^-9).", q: "Berapa nilai pH nya?", options: ["9.3", "8.7", "7.0", "9.0"], answer: 0, level: "Level 3 - Menerapkan", explanation: "pH = pKa + log(0.2/0.1) = 9 + log 2 ≈ 9.3." },
  { story: "Buffer asam asetat memiliki volume V dan pH tertentu.", q: "Jika larutan ini diencerkan menjadi 2V, bagaimana perubahan pH nya?", options: ["Turun setengahnya", "Naik setengahnya", "Tetap", "Menjadi netral"], answer: 2, level: "Level 3 - Menerapkan", explanation: "Pengenceran tidak mengubah rasio [A-]/[HA], sehingga pH tetap." },
  { story: "Diketahui Ka asam formiat (HCOOH) = 1.8 x 10^-4.", q: "Berapakah nilai pKa asam tersebut?", options: ["2.74", "3.74", "4.74", "5.74"], answer: 1, level: "Level 3 - Menerapkan", explanation: "pKa = -log(1.8 x 10^-4) ≈ 3.74." },
  { story: "Larutan penyangga terdiri dari asam lemah HA 0.05 M dan garam NaA 0.15 M (Ka = 10^-5).", q: "Hitung pH larutan!", options: ["4.47", "5.47", "6.47", "3.47"], answer: 1, level: "Level 3 - Menerapkan", explanation: "pH = 5 + log(0.15/0.05) = 5 + log 3 ≈ 5.47." },
  { story: "Seorang petani ingin menaikkan pH tanah menggunakan buffer fosfat (H2PO4-/HPO42-).", q: "Jika pH tanah ingin dinaikkan, komponen mana yang harus ditambahkan lebih banyak?", options: ["H2PO4-", "HPO42-", "Air", "H3PO4"], answer: 1, level: "Level 3 - Menerapkan", explanation: "HPO42- bersifat basa konjugat, penambahannya akan menaikkan pH." },

  // == LEVEL 4: MENGANALISIS (8 Soal) ==
  { story: "Grafik titrasi menunjukkan area datar (buffer region) pada pH 4-6, lalu turun curam.", q: "Interpretasi apa yang bisa diambil dari grafik tersebut?", options: ["Buffer hanya bekerja pada pH netral", "Kapasitas buffer telah terlampaui setelah titik ekivalen", "Larutan bukan buffer", "pH tidak pernah berubah"], answer: 1, level: "Level 4 - Menganalisis", explanation: "Penurunan curam menandakan buffer sudah tidak mampu menahan perubahan pH." },
  { story: "Tabel data menunjukkan penambahan 1 mL HCl 0.1 M ke dalam air menyebabkan pH turun dari 7 ke 3.", q: "Apa kesimpulan dari data ini dibandingkan jika ditambahkan ke buffer?", options: ["Air memiliki kapasitas buffer tinggi", "Buffer akan menahan perubahan pH lebih baik dari air", "HCl lemah dalam air", "Air bersifat asam"], answer: 1, level: "Level 4 - Menganalisis", explanation: "Air tidak memiliki mekanisme penyangga, sehingga pH berubah drastis." },
  { story: "Dua larutan buffer A dan B. Buffer A: [HA]=[A-]=0.1 M. Buffer B: [HA]=[A-]=1.0 M.", q: "Manakah pernyataan yang benar?", options: ["pH A > pH B", "Kapasitas buffer B lebih tinggi dari A", "A dan B tidak efektif", "Kapasitas A dan B sama"], answer: 1, level: "Level 4 - Menganalisis", explanation: "Konsentrasi total B lebih tinggi, sehingga kapasitasnya lebih besar." },
  { story: "Pasien dengan diabetes ketoasidosis menghasilkan asam berlebih dalam darah.", q: "Mengapa kondisi ini berbahaya bagi sistem buffer darah?", options: ["Buffer tidak bisa bereaksi", "Kapasitas buffer terlampaui akibat kelebihan asam", "Darah menjadi basa", "Gula merusak buffer"], answer: 1, level: "Level 4 - Menganalisis", explanation: "Kelebihan asam dapat melampaui kapasitas buffer, menyebabkan pH turun berbahaya." },
  { q: "Perhatikan pernyataan: (1) Buffer adalah campuran asam lemah dan basa lemah. (2) Buffer menjaga pH tetap konstan.", q: "Analisis kebenaran pernyataan tersebut!", options: ["Keduanya benar", "Hanya (1) benar", "Hanya (2) benar", "Keduanya salah"], answer: 2, level: "Level 4 - Menganalisis", explanation: "(1) Salah, buffer adalah asam lemah & basa konjugatnya. (2) Benar." },
  { story: "Hasil percobaan menunjukkan pH buffer turun dari 5.0 menjadi 4.9 setelah penambahan HCl.", q: "Apa analisismu terhadap penurunan pH sebesar 0.1 ini?", options: ["Buffer gagal bekerja", "Penurunan kecil menunjukkan buffer bekerja efektif", "HCl terlalu encer", "Terjadi kesalahan pengukuran"], answer: 1, level: "Level 4 - Menganalisis", explanation: "Penurunan pH yang kecil (tidak drastis) membuktikan kerja buffer." },
  { story: "Struktur molekul protein akan menggumpal (denaturasi) pada pH ekstrem.", q: "Hubungan antara buffer dan protein?", options: ["Buffer menyebabkan denaturasi", "Buffer melindungi protein dengan menjaga pH optimal", "Protein menghancurkan buffer", "Tidak ada hubungan"], answer: 1, level: "Level 4 - Menganalisis", explanation: "Buffer menjaga kondisi pH agar struktur protein tetap stabil." },
  { story: "Grafik menunjukkan dua kurva. Kurva A datar, Kurva B turun tajam saat ditambah asam.", q: "Perbedaan sifat larutan A dan B?", options: ["A adalah air, B adalah buffer", "A adalah buffer, B adalah air", "Keduanya buffer", "Keduanya air"], answer: 1, level: "Level 4 - Menganalisis", explanation: "Buffer mempertahankan pH (kurva datar), air tidak (turun tajam)." },

  // == LEVEL 5: MENGEVALUASI (7 Soal) ==
  { story: "Mahasiswa A mencampurkan HCl dan NaCl. Mahasiswa B mencampurkan CH3COOH dan CH3COONa.", q: "Evaluasilah siapa yang berhasil membuat larutan buffer!", options: ["Mahasiswa A", "Mahasiswa B", "Keduanya berhasil", "Keduanya gagal"], answer: 1, level: "Level 5 - Mengevaluasi", explanation: "Mahasiswa B menggunakan asam lemah dan garamnya. A menggunakan asam kuat." },
  { story: "Diketahui Ka suatu asam adalah 10^-10. Seorang siswa ingin membuat buffer pH 5.", q: "Apakah asam tersebut cocok untuk membuat buffer pH 5?", options: ["Ya, sangat cocok", "Tidak, karena pKa jauh dari pH target", "Cocok jika ditambah air", "Tidak bisa dievaluasi"], answer: 1, level: "Level 5 - Mengevaluasi", explanation: "Buffer efektif jika pH target ≈ pKa ± 1. pKa=10, jauh dari 5." },
  { story: "Tiga buffer memiliki volume sama: Buffer A (0.01 M), Buffer B (0.1 M), Buffer C (1.0 M).", q: "Manakah buffer yang paling efektif menahan perubahan pH?", options: ["Buffer A", "Buffer B", "Buffer C", "Ketiganya sama"], answer: 2, level: "Level 5 - Mengevaluasi", explanation: "Buffer C memiliki konsentrasi total tertinggi -> kapasitas tertinggi." },
  { story: "Buffer A memiliki perbandingan [Garam]:[Asam] = 10:1. Buffer B = 1:1.", q: "Buffer mana yang lebih baik (rentang kerja lebih luas)?", options: ["Buffer A", "Buffer B", "Sama saja", "Tidak bisa dibandingkan"], answer: 1, level: "Level 5 - Mengevaluasi", explanation: "Buffer B (rasio 1:1) memiliki kapasitas maksimum karena konsentrasi spesies seimbang." },
  { q: "Manakah argumen yang paling tepat mengapa buffer darah menggunakan sistem karbonat dibanding asetat?", options: ["Karbonat lebih murah", "pKa karbonat (6.1) lebih dekat ke pH darah (7.4) daripada asetat (4.7)", "Asetat beracun", "Karbonat tidak bereaksi"], answer: 1, level: "Level 5 - Mengevaluasi", explanation: "Efektivitas buffer maksimal jika pH kerja dekat dengan pKa." },
  { story: "Seorang apoteker merancang obat tetes mata.", q: "Mengapa ia harus menambahkan larutan penyangga ke dalam formula?", options: ["Agar tahan lama", "Untuk mencegah iritasi akibat perubahan pH", "Untuk memberi warna", "Supaya harum"], answer: 1, level: "Level 5 - Mengevaluasi", explanation: "pH mata sangat sensitif; buffer menjaga pH obat agar sesuai pH air mata." },
  { story: "Data menunjukkan penambahan 0.01 mol HCl ke Buffer X mengubah pH dari 7.0 ke 6.9. Ke Buffer Y dari 7.0 ke 4.0.", q: "Evaluasi kualitas kedua buffer tersebut!", options: ["Buffer X lebih baik", "Buffer Y lebih baik", "Keduanya gagal", "Kualitas sama"], answer: 0, level: "Level 5 - Mengevaluasi", explanation: "Buffer X mempertahankan pH lebih baik (perubahan kecil)." },

  // == LEVEL 6: MENCIPTA (6 Soal) ==
  { story: "Seorang petani memiliki tanah dengan pH 4. Ia ingin menanam tanaman yang menyukai pH 6.", q: "Strategi penambahan kapur (CaCO3) atau sulfur mana yang tepat?", options: ["Menambahkan Sulfur", "Menambahkan Kapur", "Menambahkan Air", "Tidak perlu ditambahkan apapun"], answer: 1, level: "Level 6 - Mencipta", explanation: "Kapur (basa) akan menaikkan pH tanah dari 4 menuju 6." },
  { story: "Anda diminta membuat 1 Liter larutan buffer dengan pH 5 menggunakan asam asetat (Ka=10^-5).", q: "Rancanglah konsentrasi asam dan garam yang tepat!", options: ["[HA]=0.1 M, [A-]=0.1 M", "[HA]=0.2 M, [A-]=0.02 M", "[HA]=0.01 M, [A-]=0.1 M", "[HA]=0.1 M, [A-]=0.01 M"], answer: 0, level: "Level 6 - Mencipta", explanation: "Untuk pH 5 = pKa, diperlukan rasio [A-]/[HA] = 1." },
  { story: "Tersedia bahan: HCl, NaOH, CH3COOH, dan CH3COONa.", q: "Bagaimana cara membuat larutan buffer yang paling efektif?", options: ["Campur HCl dan NaOH", "Campur CH3COOH dan CH3COONa", "Campur HCl dan CH3COONa", "Campur NaOH dan CH3COOH"], answer: 1, level: "Level 6 - Mencipta", explanation: "Campuran asam lemah dan garamnya adalah resep standar buffer." },
  { story: "Skenario: Keseimbangan ekosistem danau terganggu karena hujan asam.", q: "Rancangan eksperimen apa untuk menguji kemampuan lumpur danau sebagai buffer?", options: ["Mengukur kedalaman danau", "Mencampur lumpur dengan air asam dan ukur perubahan pH", "Mengeringkan danau", "Mengukur suhu lumpur"], answer: 1, level: "Level 6 - Mencipta", explanation: "Eksperimen simulasi penambahan asam untuk menguji kapasitas buffer alami." },
  { story: "Buatlah hipotesis mengapa obat antasida (penetral asam lambung) sering mengandung Mg(OH)2 atau Al(OH)3.", q: "Mekanisme kerja obat tersebut dalam konteks asam-basa adalah...", options: ["Sebagai buffer", "Sebagai penetral asam kuat (HCl lambung)", "Sebagai pengencer", "Sebagai katalis"], answer: 1, level: "Level 6 - Mencipta", explanation: "Antasida adalah basa lemah yang menetralkan kelebihan asam lambung." },
  { story: "Perancangan prototype alat ukur pH tanah otomatis untuk sawah.", q: "Komponen kimia apa yang harus ada pada sensor elektroda agar pembacaan akurat?", options: ["Buffer internal kalibrasi", "Air suling", "Garam dapur", "Minyak pelumas"], answer: 0, level: "Level 6 - Mencipta", explanation: "Elektroda pH memerlukan buffer internal sebagai referensi standar." }
];

// ==================================================
// STATE VARIABEL
// ==================================================
let currentQuestionIndex = 0;
let userAnswers = [];
let timerInterval = null;
let timeLeft = 15 * 60; // 15 Menit
let studentInfo = { name: "", class: "", absen: "" }; // DITAMBAHKAN ABSEN

let activeQuestions = []; // Soal yang sedang aktif (15 soal)
let currentLatihanIndex = 0;
let latihanScore = 0;

// ==================================================
// LOGIKA RANDOMIZER (STRATIFIED)
// ==================================================
function getRandomizedQuestions(totalCount = 15) {
    const levels = {
        'Level 1': questionBank.filter(q => q.level.includes('Level 1')),
        'Level 2': questionBank.filter(q => q.level.includes('Level 2')),
        'Level 3': questionBank.filter(q => q.level.includes('Level 3')),
        'Level 4': questionBank.filter(q => q.level.includes('Level 4')),
        'Level 5': questionBank.filter(q => q.level.includes('Level 5')),
        'Level 6': questionBank.filter(q => q.level.includes('Level 6'))
    };
    Object.keys(levels).forEach(key => { levels[key].sort(() => Math.random() - 0.5); });
    let selected = [];
    const quotas = { 'Level 1': 3, 'Level 2': 3, 'Level 3': 3, 'Level 4': 3, 'Level 5': 2, 'Level 6': 1 };
    for (const [level, quota] of Object.entries(quotas)) {
        const available = levels[level];
        if (available.length >= quota) selected.push(...available.slice(0, quota));
        else selected.push(...available); 
    }
    if (selected.length < totalCount) {
        const allSelectedIds = new Set(selected.map(q => q.q));
        const remaining = questionBank.filter(q => !allSelectedIds.has(q.q));
        remaining.sort(() => Math.random() - 0.5);
        const needed = totalCount - selected.length;
        selected.push(...remaining.slice(0, needed));
    }
    selected.sort(() => Math.random() - 0.5);
    return selected;
}

// ==================================================
// FUNGSI UTAMA
// ==================================================

window.initLatihan = function() {
  activeQuestions = getRandomizedQuestions(15); 
  currentLatihanIndex = 0;
  latihanScore = 0;
  const totalQ = document.getElementById('total-questions');
  if(totalQ) totalQ.textContent = activeQuestions.length;
  const scoreEl = document.getElementById('quiz-score');
  if(scoreEl) scoreEl.textContent = 0;
  renderLatihanQuestion();
};

window.checkLogin = function() {
  const nameInput = document.getElementById('student-name').value.trim();
  const classInput = document.getElementById('student-class').value.trim();
  const absenInput = document.getElementById('student-absen').value.trim(); // AMBIL ABSEN

  if (!nameInput || !classInput || !absenInput) {
    alert("Harap isi Nama, Kelas, dan Nomor Absen!");
    return;
  }

  studentInfo.name = nameInput;
  studentInfo.class = classInput;
  studentInfo.absen = absenInput; // SIMPAN ABSEN
  
  localStorage.setItem('current_student_name', nameInput);
  localStorage.setItem('current_student_absen', absenInput);

  document.getElementById('login-section').classList.add('hidden');
  document.getElementById('pre-test-info').classList.remove('hidden');
};

window.startEvaluation = function() {
  document.getElementById('pre-test-info').classList.add('hidden');
  document.getElementById('test-area').classList.remove('hidden');
  
  activeQuestions = getRandomizedQuestions(15); 
  currentQuestionIndex = 0;
  userAnswers = new Array(activeQuestions.length).fill(null);
  timeLeft = 15 * 60;
  
  renderEvaluationQuestion();
  startTimer();
};

window.nextQuestion = function() {
  currentLatihanIndex++;
  if (currentLatihanIndex < activeQuestions.length) {
    renderLatihanQuestion();
  } else {
    finishLatihan();
  }
};

function finishLatihan() {
    const card = document.getElementById('question-card');
    if(card) {
        card.innerHTML = `
          <div class="text-center py-10">
            <h3 class="font-display text-2xl font-bold mb-4 text-accent">Latihan Selesai!</h3>
            <p class="text-muted mb-6">Skor akhir kamu: <span class="text-white font-bold">${latihanScore}/${activeQuestions.length}</span></p>
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

// ==================================================
// RENDER LOGIC
// ==================================================

function renderLatihanQuestion() {
  const q = activeQuestions[currentLatihanIndex];
  const curQ = document.getElementById('current-question');
  if(curQ) curQ.textContent = currentLatihanIndex + 1;
  const lvl = document.getElementById('question-level');
  if(lvl) {
      lvl.textContent = q.level;
      lvl.className = 'inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 ';
      if(q.level.includes('Level 1') || q.level.includes('Level 2')) lvl.className += 'bg-green-500/20 text-green-400';
      else if(q.level.includes('Level 3') || q.level.includes('Level 4')) lvl.className += 'bg-yellow-500/20 text-yellow-400';
      else lvl.className += 'bg-red-500/20 text-red-400';
  }
  const storyContainer = document.getElementById('question-story');
  if (storyContainer) {
      if (q.story) { storyContainer.innerHTML = `<div class="p-4 mb-4 bg-dark/30 border-l-4 border-primary rounded-r-lg text-sm text-slate-300 italic">"${q.story}"</div>`; storyContainer.classList.remove('hidden'); }
      else { storyContainer.classList.add('hidden'); }
  }
  const imageContainer = document.getElementById('question-image');
  if (imageContainer) {
      if (q.image) { imageContainer.innerHTML = `<img src="${q.image}" alt="Ilustrasi Soal" class="w-full max-w-md rounded-lg border border-border mb-4 mx-auto">`; imageContainer.classList.remove('hidden'); }
      else { imageContainer.classList.add('hidden'); }
  }
  const txt = document.getElementById('question-text');
  if(txt) txt.textContent = q.q;
  const prog = document.getElementById('quiz-progress');
  if(prog) prog.style.width = ((currentLatihanIndex + 1) / activeQuestions.length * 100) + '%';
  const container = document.getElementById('options-container');
  if(!container) return;
  container.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  q.options.forEach((opt, idx) => {
    const div = document.createElement('div');
    div.className = 'quiz-option p-4 rounded-xl border border-border cursor-pointer hover:border-primary transition-colors';
    div.onclick = () => checkLatihanAnswer(idx);
    div.innerHTML = `<div class="flex items-center gap-3"><span class="w-8 h-8 rounded-lg bg-dark border border-border flex items-center justify-center font-bold text-sm">${labels[idx]}</span><span>${opt}</span></div>`;
    container.appendChild(div);
  });
  const feedbackCard = document.getElementById('feedback-card');
  if(feedbackCard) feedbackCard.classList.add('hidden');
  const nextBtn = document.getElementById('next-btn');
  if(nextBtn) nextBtn.classList.add('hidden');
}

function checkLatihanAnswer(selectedIndex) {
  const q = activeQuestions[currentLatihanIndex];
  const isCorrect = selectedIndex === q.answer;
  if (isCorrect) latihanScore++;
  const scoreEl = document.getElementById('quiz-score');
  if(scoreEl) scoreEl.textContent = latihanScore;
  const options = document.getElementById('options-container').children;
  for (let i = 0; i < options.length; i++) {
    options[i].onclick = null;
    options[i].classList.remove('hover:border-primary');
    if (i === q.answer) options[i].classList.add('correct');
    else if (i === selectedIndex && !isCorrect) options[i].classList.add('incorrect');
  }
  const feedbackCard = document.getElementById('feedback-card');
  const feedbackIcon = document.getElementById('feedback-icon');
  const feedbackTitle = document.getElementById('feedback-title');
  const feedbackText = document.getElementById('feedback-text');
  if(feedbackCard) {
      feedbackCard.classList.remove('hidden', 'bg-green-500/10', 'border-green-500/30', 'bg-red-500/10', 'border-red-500/30');
      if (isCorrect) {
        feedbackCard.classList.add('bg-green-500/10', 'border-green-500/30');
        if(feedbackIcon) { feedbackIcon.innerHTML = `<svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`; feedbackIcon.className = "w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/20"; }
        if(feedbackTitle) { feedbackTitle.textContent = "Benar!"; feedbackTitle.className = "font-display font-semibold mb-2 text-green-400"; }
      } else {
        feedbackCard.classList.add('bg-red-500/10', 'border-red-500/30');
        if(feedbackIcon) { feedbackIcon.innerHTML = `<svg class="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`; feedbackIcon.className = "w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/20"; }
        if(feedbackTitle) { feedbackTitle.textContent = "Kurang Tepat"; feedbackTitle.className = "font-display font-semibold mb-2 text-red-400"; }
      }
      if(feedbackText) feedbackText.textContent = q.explanation;
  }
  const nextBtn = document.getElementById('next-btn');
  if(nextBtn) nextBtn.classList.remove('hidden');
}

function renderEvaluationQuestion() {
  const qData = activeQuestions[currentQuestionIndex];
  const curEl = document.getElementById('eval-current');
  if(curEl) curEl.textContent = currentQuestionIndex + 1;
  let questionHTML = "";
  if (qData.story) questionHTML += `<div class="text-sm text-slate-300 italic mb-4 p-3 bg-dark/50 rounded-lg border-l-2 border-primary">${qData.story}</div>`;
  if (qData.image) questionHTML += `<img src="${qData.image}" class="w-full max-w-xs rounded-lg mb-4 mx-auto border border-border" alt="Gambar Soal">`;
  questionHTML += `<span class="font-semibold">${qData.q}</span>`;
  const qEl = document.getElementById('eval-question-text');
  if(qEl) qEl.innerHTML = questionHTML;
  const container = document.getElementById('eval-options-container');
  if(!container) return;
  container.innerHTML = '';
  const labels = ['A', 'B', 'C', 'D'];
  qData.options.forEach((opt, idx) => {
    const isSelected = userAnswers[currentQuestionIndex] === idx;
    const div = document.createElement('div');
    div.className = `quiz-option ${isSelected ? 'selected' : ''} flex items-center gap-3`;
    div.onclick = () => selectOption(idx);
    div.innerHTML = `<span class="w-8 h-8 rounded-lg ${isSelected ? 'bg-accent text-darker' : 'bg-dark border border-border'} flex items-center justify-center font-bold text-sm flex-shrink-0">${labels[idx]}</span><span>${opt}</span>`;
    container.appendChild(div);
  });
  updateNavButtons();
}

function updateNavButtons() {
  const prevBtn = document.getElementById('eval-prev-btn');
  const nextBtn = document.getElementById('eval-next-btn');
  if (!prevBtn || !nextBtn) return;
  prevBtn.disabled = currentQuestionIndex === 0;
  if (currentQuestionIndex === activeQuestions.length - 1) {
    nextBtn.textContent = "Kumpulkan";
    nextBtn.onclick = () => { if(confirm("Yakin ingin mengumpulkan evaluasi?")) submitQuiz(); };
  } else {
    nextBtn.textContent = "Selanjutnya";
    nextBtn.onclick = nextEvalQuestion;
  }
}

window.selectOption = function(index) { userAnswers[currentQuestionIndex] = index; renderEvaluationQuestion(); };
window.nextEvalQuestion = function() { if (currentQuestionIndex < activeQuestions.length - 1) { currentQuestionIndex++; renderEvaluationQuestion(); } };
window.prevEvalQuestion = function() { if (currentQuestionIndex > 0) { currentQuestionIndex--; renderEvaluationQuestion(); } };

function startTimer() {
  const timerDisplay = document.getElementById('timer');
  if(!timerDisplay) return;
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) { clearInterval(timerInterval); alert("Waktu habis!"); submitQuiz(); return; }
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    if (timeLeft < 60) timerDisplay.classList.add('text-red-500');
  }, 1000);
}

function submitQuiz() {
  clearInterval(timerInterval);
  let score = 0;
  userAnswers.forEach((ans, idx) => { if (ans === activeQuestions[idx].answer) score++; });
  const finalScoreCalculated = Math.round((score / activeQuestions.length) * 100);
  
  saveResult(studentInfo.name, studentInfo.class, studentInfo.absen, finalScoreCalculated, score, activeQuestions.length - score);
  
  document.getElementById('test-area').classList.add('hidden');
  document.getElementById('results-area').classList.remove('hidden');
  document.getElementById('result-score').textContent = finalScoreCalculated;
  document.getElementById('correct-count').textContent = score;
  document.getElementById('wrong-count').textContent = activeQuestions.length - score;

  const circle = document.getElementById('result-circle');
  const title = document.getElementById('result-title');
  if (finalScoreCalculated >= 70) {
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
  const qData = activeQuestions[currentQuestionIndex];
  document.getElementById('eval-current').textContent = currentQuestionIndex + 1;
  let questionHTML = "";
  if (qData.story) questionHTML += `<div class="text-sm text-slate-300 italic mb-4 p-3 bg-dark/50 rounded-lg border-l-2 border-primary">${qData.story}</div>`;
  if (qData.image) questionHTML += `<img src="${qData.image}" class="w-full max-w-xs rounded-lg mb-4 mx-auto border border-border" alt="Gambar Soal">`;
  questionHTML += `<span class="font-semibold">${qData.q}</span>`;
  document.getElementById('eval-question-text').innerHTML = questionHTML;
  const container = document.getElementById('eval-options-container');
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
    div.innerHTML = `<span class="w-8 h-8 rounded-lg bg-dark/50 flex items-center justify-center font-bold text-sm flex-shrink-0 border ${isCorrect ? 'border-green-500 text-green-400' : 'border-border'}">${labels[idx]}</span><span>${opt}</span>${isCorrect ? '<span class="ml-auto text-xs font-bold text-green-400">JAWABAN BENAR</span>' : ''}`;
    container.appendChild(div);
  });
  document.getElementById('eval-next-btn').textContent = "Selanjutnya";
  document.getElementById('eval-next-btn').onclick = () => {
    if(currentQuestionIndex < activeQuestions.length - 1) { currentQuestionIndex++; renderReviewMode(); } 
    else { document.getElementById('test-area').classList.add('hidden'); document.getElementById('results-area').classList.remove('hidden'); }
  };
  document.getElementById('eval-prev-btn').disabled = currentQuestionIndex === 0;
  document.getElementById('eval-prev-btn').onclick = () => { if(currentQuestionIndex > 0) { currentQuestionIndex--; renderReviewMode(); } };
}

window.restartEvaluation = function() {
  document.getElementById('results-area').classList.add('hidden');
  document.getElementById('login-section').classList.remove('hidden');
  document.getElementById('student-name').value = '';
  document.getElementById('student-class').value = '';
  document.getElementById('student-absen').value = ''; // RESET ABSEN
}

// ==================================================
// FUNGSI DATABASE
// ==================================================

function saveResult(name, kelas, absen, score, correct, wrong) {
  const resultId = Date.now();
  const data = {
    Tanggal: new Date().toLocaleString('id-ID'),
    Nama: name,
    Kelas: kelas,
    Absen: absen, // SIMPAN ABSEN
    Nilai: score,
    Benar: correct,
    Salah: wrong,
    Timestamp: resultId
  };

  if (database) {
    database.ref('results/' + resultId).set(data)
      .then(() => console.log("Data tersimpan ke Cloud"))
      .catch(error => console.error("Gagal simpan ke Cloud:", error));
  } else {
    let history = JSON.parse(localStorage.getItem('chembufferlab_history') || '[]');
    history.push(data);
    localStorage.setItem('chembufferlab_history', JSON.stringify(history));
    console.log("Data tersimpan ke LocalStorage");
  }
}

window.exportToExcel = function() {
  const btn = document.querySelector('[onclick="exportToExcel()"]');
  const originalText = btn ? btn.innerHTML : 'Export Data';
  if(btn) { btn.innerHTML = "Mengambil data..."; btn.disabled = true; }

  const processData = (data) => {
    if (data.length === 0) { alert("Tidak ada data."); return; }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hasil Evaluasi");
    XLSX.writeFile(wb, `Rekap_ChemBufferLab.xlsx`);
  };

  if (database) {
      database.ref('results').once('value')
        .then(snapshot => {
          if (!snapshot.exists()) { alert("Tidak ada data cloud."); return; }
          const data = []; snapshot.forEach(child => data.push(child.val()));
          processData(data);
        })
        .catch(error => { console.error(error); alert("Gagal ambil data cloud."); })
        .finally(() => { if(btn) { btn.innerHTML = originalText; btn.disabled = false; } });
  } else {
      const localData = JSON.parse(localStorage.getItem('chembufferlab_history') || '[]');
      processData(localData);
      if(btn) { btn.innerHTML = originalText; btn.disabled = false; }
  }
};