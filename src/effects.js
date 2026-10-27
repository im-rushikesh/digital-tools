/**
 * Digital Tools - Dribbble-Grade 3D Visual Effects, Web Audio & Interactive Motion Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initHeaderScrollState();
  initCustomCursor();
  initHero3DCanvas();
  init3DCardTilt();
  initSpotlightCards();
  initScrollReveal();
  initCounters();
  initRippleEffect();
  initBackToTop();
  initInteractiveCopyToast();
  initInteractivePumpSimulator();
  initAppMockupTabs();
  initInteractiveAccordions();
  initAudioSystem();
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
   3. DRIBBLE-STYLE SMOOTH CUSTOM CURSOR
---------------------------------------------------- */
function initCustomCursor() {
  // Only for desktop with fine pointer
  if (!window.matchMedia('(pointer: fine)').matches) return;

  let dot = document.getElementById('cursor-dot');
  let ring = document.getElementById('cursor-ring');

  if (!dot) {
    dot = document.createElement('div');
    dot.id = 'cursor-dot';
    document.body.appendChild(dot);
  }
  if (!ring) {
    ring = document.createElement('div');
    ring.id = 'cursor-ring';
    document.body.appendChild(ring);
  }

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }, { passive: true });

  // Smooth lerp loop for the outer trailing ring
  function renderCursor() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderCursor);
  }
  renderCursor();

  // Hover expansion on interactive elements
  const interactiveSelector = 'a, button, input, select, textarea, .card-3d, [role="button"], .cursor-pointer';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.add('cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      ring.classList.remove('cursor-hover');
    }
  });
}

/* ----------------------------------------------------
   4. 3D HERO CANVAS (Perspective Particle Constellation)
---------------------------------------------------- */
function initHero3DCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = canvas.parentElement.offsetWidth || window.innerWidth);
  let height = (canvas.height = canvas.parentElement.offsetHeight || 600);

  const particles = [];
  const particleCount = Math.min(Math.floor((width * height) / 11000), 85);

  let mouseX = width / 2;
  let mouseY = height / 2;
  let targetTiltX = 0;
  let targetTiltY = 0;
  let currentTiltX = 0;
  let currentTiltY = 0;

  class Particle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = (Math.random() - 0.5) * width * 1.3;
      this.y = (Math.random() - 0.5) * height * 1.3;
      this.z = initial ? Math.random() * 800 : 800;
      this.vz = 0.6 + Math.random() * 0.9;
      this.baseRadius = 1.2 + Math.random() * 2.2;
      this.color = Math.random() > 0.35 ? '#4fdbc8' : '#7bd8b1';
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
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      const cosY = Math.cos(tiltY);
      const sinY = Math.sin(tiltY);

      let x1 = this.x * cosY + this.z * sinY;
      let z1 = -this.x * sinY + this.z * cosY;

      let y2 = this.y * cosX - z1 * sinX;
      let z2 = this.y * sinX + z1 * cosX;

      const scale = focalLength / (focalLength + z2);
      const px = x1 * scale + cx;
      const py = y2 * scale + cy;
      const alpha = Math.min(Math.max((1 - z2 / 900) * 0.85, 0), 1);
      const radius = Math.max(this.baseRadius * scale * (1 + Math.sin(this.pulse) * 0.3), 0.5);

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
      targetTiltY = ((mouseX - width / 2) / (width / 2)) * 0.28;
      targetTiltX = -((mouseY - height / 2) / (height / 2)) * 0.28;
    }
  }, { passive: true });

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
      if (proj.scale > 0 && proj.x >= -60 && proj.x <= width + 60 && proj.y >= -60 && proj.y <= height + 60) {
        projectedPoints.push({ proj, p });
      }
    }

    ctx.lineWidth = 0.8;
    for (let i = 0; i < projectedPoints.length; i++) {
      for (let j = i + 1; j < projectedPoints.length; j++) {
        const p1 = projectedPoints[i].proj;
        const p2 = projectedPoints[j].proj;
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          const lineAlpha = (1 - dist / 120) * Math.min(p1.alpha, p2.alpha) * 0.5;
          ctx.strokeStyle = `rgba(79, 219, 200, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    for (let i = 0; i < projectedPoints.length; i++) {
      const { proj, p } = projectedPoints[i];
      ctx.fillStyle = p.color;
      ctx.globalAlpha = proj.alpha;

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      if (proj.radius > 1.6) {
        ctx.fillStyle = 'rgba(79, 219, 200, 0.25)';
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.radius * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(render);
  }

  render();
}

/* ----------------------------------------------------
   5. 3D CARD TILT ON MOUSE MOVE
---------------------------------------------------- */
function init3DCardTilt() {
  const cards = document.querySelectorAll('.card-3d');
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

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

      const rotateX = -yPct * 12;
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
   6. SPOTLIGHT CARDS (Linear / Vercel style radial glow)
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
   7. SCROLL REVEAL ANIMATIONS
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
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ----------------------------------------------------
   8. ANIMATED STAT COUNTERS
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
    const duration = 1800;
    const startTime = performance.now();

    function updateCount(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
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
   9. CLICK RIPPLE WAVE EFFECT
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

    if (window.playUiSound) window.playUiSound('click');

    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
}

/* ----------------------------------------------------
   10. FLOATING BACK TO TOP BUTTON
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
   11. INTERACTIVE TOAST NOTIFICATIONS
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

/* ----------------------------------------------------
   12. INTERACTIVE HARDWARE PUMP SIMULATOR
---------------------------------------------------- */
function initInteractivePumpSimulator() {
  const toggleBtn = document.getElementById('sim-pump-toggle');
  if (!toggleBtn) return;

  const statusBadge = document.getElementById('sim-status-badge');
  const statusDiode = document.getElementById('sim-status-diode');
  const statusText = document.getElementById('sim-status-text');
  const currentReadout = document.getElementById('sim-current-readout');
  const pressureReadout = document.getElementById('sim-pressure-readout');
  const flowReadout = document.getElementById('sim-flow-readout');
  const gaugePath = document.getElementById('sim-gauge-path');
  const logTerminal = document.getElementById('sim-terminal-log');

  let isPumpOn = false;

  const appendLog = (msg) => {
    if (!logTerminal) return;
    const time = new Date().toTimeString().split(' ')[0];
    const line = document.createElement('div');
    line.className = 'text-[11px] font-mono leading-tight';
    line.innerHTML = `<span class="text-on-surface-variant">[${time}]</span> ${msg}`;
    logTerminal.appendChild(line);
    logTerminal.scrollTop = logTerminal.scrollHeight;
    while (logTerminal.children.length > 5) {
      logTerminal.removeChild(logTerminal.firstChild);
    }
  };

  toggleBtn.addEventListener('click', () => {
    isPumpOn = !isPumpOn;

    if (isPumpOn) {
      toggleBtn.innerHTML = `
        <span class="material-symbols-outlined text-[18px]">stop_circle</span>
        <span>STOP PUMP RELAY</span>
      `;
      toggleBtn.className = 'w-full py-3 rounded-xl bg-error/20 hover:bg-error/30 text-error font-label-mono-sm text-xs uppercase font-bold transition-all border border-error/40 flex items-center justify-center gap-2 btn-shimmer';

      if (statusBadge) statusBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-container/20 text-primary font-label-mono-sm text-xs font-semibold border border-primary/30';
      if (statusDiode) statusDiode.className = 'w-2 h-2 rounded-full bg-primary animate-ping';
      if (statusText) statusText.textContent = 'MOTOR RUNNING // 415V';

      if (currentReadout) currentReadout.textContent = '14.2 A';
      if (pressureReadout) pressureReadout.textContent = '48 PSI';
      if (flowReadout) flowReadout.textContent = '180 LPM';
      if (gaugePath) gaugePath.style.strokeDashoffset = '70';

      appendLog('<span class="text-primary">RF_TX: RELAY_1 CLOSE (ACK: OK)</span>');
      appendLog('<span class="text-tertiary">3-PHASE BALANCED: 415V @ 14.2A</span>');
      window.showToast('Pump relay turned ON over 12km RF mesh!');
    } else {
      toggleBtn.innerHTML = `
        <span class="material-symbols-outlined text-[18px]">power_settings_new</span>
        <span>ACTIVATE PUMP OVER RF</span>
      `;
      toggleBtn.className = 'w-full py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-mono-sm text-xs uppercase font-bold transition-all shadow-lg flex items-center justify-center gap-2 btn-shimmer';

      if (statusBadge) statusBadge.className = 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-mono-sm text-xs font-semibold border border-slate-border';
      if (statusDiode) statusDiode.className = 'w-2 h-2 rounded-full bg-outline';
      if (statusText) statusText.textContent = 'STANDBY // 0V LOAD';

      if (currentReadout) currentReadout.textContent = '0.0 A';
      if (pressureReadout) pressureReadout.textContent = '0 PSI';
      if (flowReadout) flowReadout.textContent = '0 LPM';
      if (gaugePath) gaugePath.style.strokeDashoffset = '280';

      appendLog('<span class="text-on-surface-variant">RF_TX: RELAY_1 OPEN (SAFE STOP)</span>');
      window.showToast('Pump relay stopped safely.');
    }
  });
}

/* ----------------------------------------------------
   13. APP PHONE MOCKUP INTERACTIVE TABS
---------------------------------------------------- */
function initAppMockupTabs() {
  const tabBtns = document.querySelectorAll('.app-mockup-tab');
  const screenContent = document.getElementById('phone-screen-content');
  if (!tabBtns.length || !screenContent) return;

  const appScreens = {
    attendy: `
      <div class="h-full flex flex-col justify-between p-4 bg-gradient-to-b from-surface-container to-surface-container-lowest text-on-surface">
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-border/50">
            <span class="font-label-mono-sm text-[10px] text-primary">ATTENDY // GEOFENCE</span>
            <span class="px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary text-[9px] font-bold">100m LOCKED</span>
          </div>
          <div class="bg-surface-container-high/60 p-3 rounded-xl border border-slate-border/40 space-y-1">
            <span class="text-[10px] text-on-surface-variant font-mono">PUNCH-IN STATUS</span>
            <div class="text-sm font-bold text-on-surface flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span> 09:02 AM Verified
            </div>
            <span class="text-[9px] text-tertiary block">GPS accuracy &plusmn; 3 meters</span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div class="bg-surface-container-lowest p-2 rounded-lg border border-slate-border/30">
              <span class="text-on-surface-variant block">Work Shift</span>
              <span class="font-bold text-on-surface">Shift A (8 hrs)</span>
            </div>
            <div class="bg-surface-container-lowest p-2 rounded-lg border border-slate-border/30">
              <span class="text-on-surface-variant block">Days Worked</span>
              <span class="font-bold text-primary">24 / 26</span>
            </div>
          </div>
        </div>
        <div class="p-2.5 rounded-xl bg-primary-container text-on-primary-container text-center font-label-mono-sm text-xs font-bold shadow-md">
          GENERATE SALARY PDF
        </div>
      </div>
    `,
    callassistant: `
      <div class="h-full flex flex-col justify-between p-4 bg-gradient-to-b from-surface-container to-surface-container-lowest text-on-surface">
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-border/50">
            <span class="font-label-mono-sm text-[10px] text-tertiary">CALL ASSISTANT // AUTO</span>
            <span class="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold">ZERO DATA</span>
          </div>
          <div class="bg-surface-container-high/60 p-3 rounded-xl border border-slate-border/40 space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] text-on-surface-variant font-mono">INCOMING CALL FILTER</span>
              <span class="material-symbols-outlined text-primary text-[18px]">verified_user</span>
            </div>
            <div class="text-xs font-bold text-on-surface">Auto-Answer After 3s</div>
            <div class="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
              <div class="bg-tertiary h-full w-3/4"></div>
            </div>
          </div>
          <div class="p-2.5 rounded-lg bg-surface-container-lowest border border-slate-border/30 space-y-1 text-[10px]">
            <span class="text-on-surface-variant font-mono block">PRIVACY ASSURANCE</span>
            <span class="text-tertiary font-bold flex items-center gap-1">
              <span class="material-symbols-outlined text-[12px]">lock</span> 100% On-Device Telephony
            </span>
          </div>
        </div>
        <div class="p-2.5 rounded-xl bg-tertiary-container text-on-tertiary font-label-mono-sm text-xs font-bold text-center shadow-md">
          AUTO-ANSWER ACTIVE
        </div>
      </div>
    `,
    sudoku: `
      <div class="h-full flex flex-col justify-between p-4 bg-gradient-to-b from-surface-container to-surface-container-lowest text-on-surface">
        <div class="space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-slate-border/50">
            <span class="font-label-mono-sm text-[10px] text-secondary-fixed">SUDOKU MASTER PRO</span>
            <span class="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary-fixed text-[9px] font-bold">OFFLINE</span>
          </div>
          <div class="grid grid-cols-3 gap-1 bg-surface-container-high/60 p-2 rounded-xl border border-slate-border/40 text-center font-mono font-bold text-xs">
            <div class="p-2 bg-surface-container-lowest rounded text-primary">5</div>
            <div class="p-2 bg-surface-container-lowest rounded text-on-surface-variant">3</div>
            <div class="p-2 bg-surface-container-lowest rounded text-tertiary">7</div>
            <div class="p-2 bg-surface-container-lowest rounded text-on-surface-variant">6</div>
            <div class="p-2 bg-primary-container/20 text-primary rounded">1</div>
            <div class="p-2 bg-surface-container-lowest rounded text-on-surface-variant">9</div>
            <div class="p-2 bg-surface-container-lowest rounded text-on-surface-variant">4</div>
            <div class="p-2 bg-surface-container-lowest rounded text-tertiary">8</div>
            <div class="p-2 bg-surface-container-lowest rounded text-primary">2</div>
          </div>
          <div class="flex justify-between text-[10px] text-on-surface-variant font-mono">
            <span>Difficulty: Master</span>
            <span>Timer: 03:42</span>
          </div>
        </div>
        <div class="p-2.5 rounded-xl bg-surface-container-high border border-slate-border/50 text-center font-label-mono-sm text-xs font-bold text-primary shadow-sm">
          SOLVE INSTANTLY
        </div>
      </div>
    `
  };

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => {
        b.classList.remove('bg-primary-container', 'text-on-primary-container', 'font-bold');
        b.classList.add('bg-surface-container', 'text-on-surface-variant');
      });
      btn.classList.add('bg-primary-container', 'text-on-primary-container', 'font-bold');
      btn.classList.remove('bg-surface-container', 'text-on-surface-variant');

      const appKey = btn.getAttribute('data-app-preview') || 'attendy';
      if (appScreens[appKey]) {
        screenContent.style.opacity = '0';
        setTimeout(() => {
          screenContent.innerHTML = appScreens[appKey];
          screenContent.style.opacity = '1';
        }, 150);
      }
    });
  });
}

/* ----------------------------------------------------
   14. INTERACTIVE ACCORDIONS
---------------------------------------------------- */
function initInteractiveAccordions() {
  const items = document.querySelectorAll('.accordion-item');
  items.forEach((item) => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;
    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach((i) => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });
}

/* ----------------------------------------------------
   15. WEB AUDIO MICRO-INTERACTION SYNTH
---------------------------------------------------- */
function initAudioSystem() {
  let audioCtx = null;
  let isSoundEnabled = false;

  const toggleSoundBtn = document.getElementById('sound-toggle-btn');
  const soundIcon = document.getElementById('sound-toggle-icon');
  const soundLabel = document.getElementById('sound-toggle-label');

  const enableAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  };

  window.playUiSound = (type = 'click') => {
    if (!isSoundEnabled || !audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(250, audioCtx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      } else if (type === 'beep') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.06);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.06);
      }
    } catch (_) {}
  };

  if (toggleSoundBtn) {
    toggleSoundBtn.addEventListener('click', () => {
      enableAudio();
      isSoundEnabled = !isSoundEnabled;
      if (isSoundEnabled) {
        toggleSoundBtn.classList.add('text-primary', 'border-primary/40');
        if (soundIcon) soundIcon.textContent = 'volume_up';
        if (soundLabel) soundLabel.textContent = 'SFX: ON';
        window.playUiSound('beep');
        window.showToast('Interactive UI audio enabled');
      } else {
        toggleSoundBtn.classList.remove('text-primary', 'border-primary/40');
        if (soundIcon) soundIcon.textContent = 'volume_off';
        if (soundLabel) soundLabel.textContent = 'SFX: OFF';
      }
    });
  }
}
