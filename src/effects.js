/**
 * Digital Tools - 3D Visual Effects, Motion Engine & Interactive Micro-Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initHeaderScrollState();
  initHero3DCanvas();
  init3DCardTilt();
  initSpotlightCards();
  initScrollReveal();
  initCounters();
  initRippleEffect();
  initBackToTop();
  initInteractiveCopyToast();
});

/* ----------------------------------------------------
   1. SCROLL PROGRESS BAR
---------------------------------------------------- */
function initScrollProgress() {
  let bar = document.getElementById('scroll-progress-bar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'scroll-progress-bar';
    document.body.appendChild(bar);
  }

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = `${progress}%`;
  };

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

/* ----------------------------------------------------
   2. HEADER SCROLL GLASS STATE
---------------------------------------------------- */
function initHeaderScrollState() {
  const header = document.querySelector('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ----------------------------------------------------
   3. 3D HERO CANVAS (Perspective Particle Constellation)
---------------------------------------------------- */
function initHero3DCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = canvas.parentElement.offsetWidth || window.innerWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight || 600);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 12000), 75);

  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  // Particle Class with 3D coordinates (x, y, z)
  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = (Math.random() - 0.5) * width * 1.2;
      this.y = (Math.random() - 0.5) * height * 1.2;
      this.z = initial ? Math.random() * 800 : 800;
      this.vz = 0.6 + Math.random() * 0.8;
      this.baseRadius = 1.2 + Math.random() * 2;
      this.color = Math.random() > 0.3 ? '#4fdbc8' : '#7bd8b1';
      this.pulseSpeed = 0.02 + Math.random() * 0.03;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
      this.z -= this.vz;
      if (this.z <= 10) {
        this.reset(false);
      }
      this.pulse += this.pulseSpeed;
    }

    getProjected(focalLength, cx, cy, tiltX, tiltY) {
      // 3D rotation based on mouse tilt
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      const cosY = Math.cos(tiltY);
      const sinY = Math.sin(tiltY);

      // Rotate around Y
      let x1 = this.x * cosY + this.z * sinY;
      let z1 = -this.x * sinY + this.z * cosY;

      // Rotate around X
      let y2 = this.y * cosX - z1 * sinX;
      let z2 = this.y * sinX + z1 * cosX;

      const scale = focalLength / (focalLength + z2);
      const px = x1 * scale + cx;
      const py = y2 * scale + cy;
      const alpha = Math.min(Math.max((1 - z2 / 900) * 0.8, 0), 1);
      const radius = Math.max(this.baseRadius * scale * (1 + Math.sin(this.pulse) * 0.25), 0.5);

      return { x: px, y: py, scale, alpha, radius, z: z2 };
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  const resize = () => {
    if (!canvas.parentElement) return;
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  };

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      targetTiltY = ((mouseX - width / 2) / (width / 2)) * 0.25;
      targetTiltX = -((mouseY - height / 2) / (height / 2)) * 0.25;
    }
  }, { passive: true });

  let animationId;
  const focalLength = 400;

  function render() {
    ctx.clearRect(0, 0, width, height);

    currentTiltX += (targetTiltX - currentTiltX) * 0.05;
    currentTiltY += (targetTiltY - currentTiltY) * 0.05;

    const cx = width / 2;
    const cy = height / 2;

    const projectedPoints = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update();
      const proj = p.getProjected(focalLength, cx, cy, currentTiltX, currentTiltY);
      if (proj.scale > 0 && proj.x >= -50 && proj.x <= width + 50 && proj.y >= -50 && proj.y <= height + 50) {
        projectedPoints.push({ proj, p });
      }
    }

    // Draw connecting lines between nearby points in 3D
    ctx.lineWidth = 0.75;
    for (let i = 0; i < projectedPoints.length; i++) {
      for (let j = i + 1; j < projectedPoints.length; j++) {
        const p1 = projectedPoints[i].proj;
        const p2 = projectedPoints[j].proj;
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 110) {
          const lineAlpha = (1 - dist / 110) * Math.min(p1.alpha, p2.alpha) * 0.45;
          ctx.strokeStyle = `rgba(79, 219, 200, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    // Draw points with glowing halo
    for (let i = 0; i < projectedPoints.length; i++) {
      const { proj, p } = projectedPoints[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = proj.alpha;

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      // Soft glow
      if (proj.radius > 1.8) {
        ctx.fillStyle = 'rgba(79, 219, 200, 0.2)';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;

    animationId = requestAnimationFrame(render);
  }

  render();
}

/* ----------------------------------------------------
   4. 3D CARD TILT ON MOUSE MOVE
---------------------------------------------------- */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.card-3d');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) return; // Skip on mobile touch to avoid jitter

  cards.forEach((card) => {
    let bounds;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.2s ease';
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = mouseX / bounds.width - 0.5;
      const yPct = mouseY / bounds.height - 0.5;

      const rotateX = -yPct * 12; // tilt max 12 deg
      const rotateY = xPct * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    };

    const onMouseLeave = () => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.4s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

/* ----------------------------------------------------
   5. SPOTLIGHT CARDS (Linear / Vercel style radial glow)
---------------------------------------------------- */
function initSpotlightCards() {
  const cards = document.querySelectorAll('.spotlight-card');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ----------------------------------------------------
   6. SCROLL REVEAL ANIMATIONS
---------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if (!revealElements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ----------------------------------------------------
   7. ANIMATED STAT COUNTERS
---------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-counter-target]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  counters.forEach((c) => observer.observe(c));

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter-target') || '0');
    const suffix = el.getAttribute('data-counter-suffix') || '';
    const prefix = el.getAttribute('data-counter-prefix') || '';
    const decimals = parseInt(el.getAttribute('data-counter-decimals') || '0', 10);
    const duration = 1800; // ms
    const startTime = performance.now();

    function updateCount(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = target * easeOut;

      el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
      }
    }

    requestAnimationFrame(updateCount);
  }
}

/* ----------------------------------------------------
   8. CLICK RIPPLE WAVE EFFECT
---------------------------------------------------- */
function initRippleEffect() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.ripple-surface, .btn-shimmer, a.bg-primary-container, button');
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.classList.add('ripple-wave');

    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    target.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

/* ----------------------------------------------------
   9. FLOATING BACK TO TOP BUTTON
---------------------------------------------------- */
function initBackToTop() {
  let btn = document.getElementById('back-to-top');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.setAttribute('type', 'button');
    btn.innerHTML = `
      <span class="material-symbols-outlined text-[24px]">keyboard_arrow_up</span>
    `;
    document.body.appendChild(btn);
  }

  const toggleVisibility = () => {
    if (window.scrollY > 350) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  };

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();
}

/* ----------------------------------------------------
   10. INTERACTIVE TOAST NOTIFICATIONS
---------------------------------------------------- */
function initInteractiveCopyToast() {
  let toast = document.getElementById('interactive-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'interactive-toast';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-primary text-[18px]">verified</span>
      <span id="toast-message">Copied to clipboard</span>
    `;
    document.body.appendChild(toast);
  }

  let timeoutId;
  window.showToast = (message) => {
    const msgEl = document.getElementById('toast-message');
    if (msgEl) msgEl.textContent = message;
    toast.classList.add('show');
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  };

  // Wire automatic copy on elements with [data-copy]
  document.addEventListener('click', (e) => {
    const copyTarget = e.target.closest('[data-copy]');
    if (copyTarget) {
      const textToCopy = copyTarget.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          window.showToast(`Copied: ${textToCopy}`);
        }).catch(() => {
          window.showToast('Copied to clipboard');
        });
      }
    }
  });
}
