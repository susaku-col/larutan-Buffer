// ==========================================
// ChemBufferLab - Main JS
// File: js/main.js
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  initParticles();
  initMobileMenu();
  initRevealAnimations();
});

function initMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', () => menu.classList.toggle('hidden'));
  }
}

function initRevealAnimations() {
  // Simple reveal on load
  setTimeout(() => {
    document.querySelectorAll('.section-content').forEach(el => el.classList.add('visible'));
  }, 100);
}

function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  class Molecule {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 4 + 2;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.hue = Math.random() > 0.5 ? 180 : 160;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + this.hue + ', 70%, 60%, ' + this.opacity + ')';
      ctx.fill();
    }
  }
  
  for (let i = 0; i < 50; i++) particlesArray.push(new Molecule());
  
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    for (let i = 0; i < particlesArray.length; i++) {
      for (let j = i + 1; j < particlesArray.length; j++) {
        const dx = particlesArray[i].x - particlesArray[j].x;
        const dy = particlesArray[i].y - particlesArray[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(34, 211, 238, ' + (0.1 * (1 - distance / 150)) + ')';
          ctx.lineWidth = 1;
          ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
          ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
          ctx.stroke();
        }
      }
      particlesArray[i].update();
      particlesArray[i].draw();
    }
    
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(animate);
    }
  }
  animate();
}

// Hero Beaker Animation Logic (specific to index.html)
if (document.getElementById('hero-beaker')) {
  let heroPH = 7.0;
  let heroDir = 1;
  const heroLiquid = document.getElementById('hero-liquid');
  const heroDisplay = document.getElementById('hero-ph');
  
  function getPHColor(ph) {
    if (ph < 3) return 'linear-gradient(to top, #ef4444, #f87171)';
    if (ph < 5) return 'linear-gradient(to top, #f97316, #fb923c)';
    if (ph < 6) return 'linear-gradient(to top, #eab308, #facc15)';
    if (ph < 8) return 'linear-gradient(to top, #22c55e, #4ade80)';
    if (ph < 10) return 'linear-gradient(to top, #22d3ee, #67e8f9)';
    return 'linear-gradient(to top, #3b82f6, #60a5fa)';
  }
  
  setInterval(() => {
    heroPH += heroDir * 0.1;
    if (heroPH > 8) heroDir = -1;
    if (heroPH < 6) heroDir = 1;
    if(heroDisplay) heroDisplay.textContent = heroPH.toFixed(1);
    if(heroLiquid) heroLiquid.style.background = getPHColor(heroPH);
  }, 500);
}