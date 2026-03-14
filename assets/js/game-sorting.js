// ==========================================
// ChemBufferLab - Lab Sorting Game
// File: js/game-sorting.js
// ==========================================

// Data Senyawa
const compounds = [
  { id: 1, text: "CH₃COOH + CH₃COONa", category: "buffer-asam" },
  { id: 2, text: "NH₃ + NH₄Cl", category: "buffer-basa" },
  { id: 3, text: "HCl + NaCl", category: "bukan-buffer" },
  { id: 4, text: "H₂CO₃ + NaHCO₃", category: "buffer-asam" },
  { id: 5, text: "NaOH + NaCl", category: "bukan-buffer" },
  { id: 6, text: "C₅H₅N + C₅H₅NHCl", category: "buffer-basa" },
  { id: 7, text: "H₃PO₄ + NaH₂PO₄", category: "buffer-asam" },
  { id: 8, text: "CH₃COOH + NaOH (reaksi sempurna)", category: "bukan-buffer" },
  { id: 9, text: "C₆H₅NH₂ + C₆H₅NH₃Cl", category: "buffer-basa" },
  { id: 10, text: "H₂SO₄ + Na₂SO₄", category: "bukan-buffer" }
];

let score = 0;
let itemsLeft = 0;

document.addEventListener('DOMContentLoaded', () => {
  initGame();
});

function initGame() {
  score = 0;
  itemsLeft = compounds.length;
  
  const sourceTray = document.getElementById('source-tray');
  sourceTray.innerHTML = '';

  // Shuffle compounds
  const shuffled = [...compounds].sort(() => Math.random() - 0.5);
  
  document.getElementById('score').textContent = score;
  document.getElementById('items-left').textContent = itemsLeft;

  shuffled.forEach(item => {
    const el = document.createElement('div');
    el.className = 'bg-card p-3 rounded-lg border border-border text-sm font-medium text-center w-full sm:w-auto cursor-pointer hover:border-accent transition-colors select-none';
    el.setAttribute('draggable', true);
    el.setAttribute('data-id', item.id);
    el.setAttribute('data-category', item.category);
    el.textContent = item.text;
    
    // Desktop Drag Events
    el.addEventListener('dragstart', handleDragStart);
    el.addEventListener('dragend', handleDragEnd);
    
    // Mobile Touch Events
    el.addEventListener('touchstart', handleTouchStart, {passive: false});
    el.addEventListener('touchmove', handleTouchMove, {passive: false});
    el.addEventListener('touchend', handleTouchEnd);
    
    sourceTray.appendChild(el);
  });

  // Setup Drop Zones
  const zones = document.querySelectorAll('.drop-zone');
  zones.forEach(zone => {
    zone.addEventListener('dragover', handleDragOver);
    zone.addEventListener('dragleave', handleDragLeave);
    zone.addEventListener('drop', handleDrop);
    
    // Clear previous items in zones
    const container = zone.querySelector('div');
    if(container) container.innerHTML = '';
  });
}

// --- Desktop Logic ---

let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.getAttribute('data-id'));
}

function handleDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.drop-zone').forEach(zone => zone.classList.remove('drag-over'));
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');
}

function handleDragLeave(e) {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  
  if (draggedItem) {
    processDrop(this, draggedItem);
  }
}

// --- Mobile Touch Logic ---

let touchItem = null;
let touchClone = null;

function handleTouchStart(e) {
  e.preventDefault();
  touchItem = this;
  
  // Create visual clone
  touchClone = this.cloneNode(true);
  touchClone.style.position = 'absolute';
  touchClone.style.opacity = '0.8';
  touchClone.style.zIndex = '1000';
  touchClone.style.width = this.offsetWidth + 'px';
  touchClone.style.pointerEvents = 'none';
  touchClone.style.transform = 'scale(1.05)';
  document.body.appendChild(touchClone);
  
  const touch = e.touches[0];
  moveClone(touch);
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!touchClone) return;
  const touch = e.touches[0];
  moveClone(touch);
}

function handleTouchEnd(e) {
  if (!touchItem || !touchClone) return;
  
  const touch = e.changedTouches[0];
  touchClone.style.display = 'none';
  
  // Find element under the finger
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);
  
  // Find the closest drop-zone parent
  const zone = dropTarget.closest('.drop-zone');
  
  if (zone) {
    processDrop(zone, touchItem);
  }
  
  // Cleanup
  document.body.removeChild(touchClone);
  touchClone = null;
  touchItem = null;
}

function moveClone(touch) {
  touchClone.style.left = (touch.clientX - (touchItem.offsetWidth/2)) + 'px';
  touchClone.style.top = (touch.clientY - 20) + 'px';
}

// --- Core Logic ---

function processDrop(zone, item) {
  const itemCategory = item.getAttribute('data-category');
  const zoneCategory = zone.getAttribute('data-category');
  const itemText = item.textContent;

  if (itemCategory === zoneCategory) {
    // Correct
    score += 10;
    itemsLeft--;
    updateScore();
    
    // Remove from source
    if (item.parentElement.id === 'source-tray') {
      item.remove();
    }
    
    // Add to zone container
    const container = zone.querySelector('div');
    const newItem = document.createElement('div');
    newItem.className = 'bg-green-500/20 border border-green-500/30 text-green-400 p-2 rounded-lg text-xs text-center';
    newItem.textContent = itemText;
    container.appendChild(newItem);
    
    // Animation
    zone.classList.add('correct-drop');
    setTimeout(() => zone.classList.remove('correct-drop'), 500);
    
    checkWin();
  } else {
    // Wrong
    score = Math.max(0, score - 5);
    updateScore();
    
    // Animation
    zone.classList.add('wrong-drop');
    setTimeout(() => zone.classList.remove('wrong-drop'), 500);
    
    // Flash red on the item
    item.style.borderColor = '#ef4444';
    item.style.color = '#ef4444';
    setTimeout(() => {
        item.style.borderColor = '';
        item.style.color = '';
    }, 500);
  }
}

function updateScore() {
  document.getElementById('score').textContent = score;
  document.getElementById('items-left').textContent = itemsLeft;
}

function checkWin() {
  if (itemsLeft === 0) {
    setTimeout(() => {
      alert(`Selamat! Kamu berhasil mengelompokkan semua senyawa.\nSkor Akhir: ${score}`);
    }, 300);
  }
}

window.resetGame = function() {
  initGame();
}