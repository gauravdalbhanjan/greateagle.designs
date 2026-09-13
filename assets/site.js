/* ══════════════════════════════════════════════════════════════
   GREAT EAGLE DESIGNS — Shared site behaviour
   Theme toggle · Liquid glass · Scroll reveal
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const html = document.documentElement;

  /* ─── THEME ─────────────────────────────────────────────────── */
  // Apply saved/preferred theme immediately (prevents flash of wrong theme).
  function applyInitialTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) html.setAttribute('data-theme', saved);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches)
      html.setAttribute('data-theme', 'dark');
    else
      html.setAttribute('data-theme', 'light');
  }

  // Wire the toggle button — runs after DOM is ready so the button exists.
  function initThemeToggle() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      buildLiquidGlass();
    });
  }

  /* ─── LIQUID GLASS FILTER ───────────────────────────────────── */
  const squircle = x => Math.pow(1 - Math.pow(1 - x, 4), 0.25);

  function calcProfile(thick, bezel, ior, S) {
    S = S || 128;
    const eta = 1 / ior;
    const refract = (nx, ny) => {
      const k = 1 - eta * eta * (1 - ny * ny);
      if (k < 0) return null;
      const sq = Math.sqrt(k);
      return [-(eta * ny + sq) * nx, eta - (eta * ny + sq) * ny];
    };
    const p = new Float64Array(S);
    for (let i = 0; i < S; i++) {
      const x = i / S, y = squircle(x);
      const dx = x < 1 ? 0.0001 : -0.0001;
      const d = (squircle(x + dx) - y) / dx;
      const mag = Math.sqrt(d * d + 1);
      const r = refract(-d / mag, -1 / mag);
      p[i] = r ? r[0] * ((y * bezel + thick) / r[1]) : 0;
    }
    return p;
  }

  function dispMap(w, h, radius, bezel, profile, maxD) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    const img = ctx.createImageData(w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) { d[i] = 128; d[i+1] = 128; d[i+2] = 0; d[i+3] = 255; }
    const r = radius, rSq = r*r, r1Sq = (r+1)**2, rBSq = Math.max(r-bezel,0)**2;
    const wB = w-r*2, hB = h-r*2, S = profile.length;
    for (let y1 = 0; y1 < h; y1++) {
      for (let x1 = 0; x1 < w; x1++) {
        const x = x1 < r ? x1-r : x1 >= w-r ? x1-r-wB : 0;
        const y = y1 < r ? y1-r : y1 >= h-r ? y1-r-hB : 0;
        const dSq = x*x+y*y;
        if (dSq > r1Sq || dSq < rBSq) continue;
        const dist = Math.sqrt(dSq);
        const op = dSq < rSq ? 1 : 1-(dist-Math.sqrt(rSq))/(Math.sqrt(r1Sq)-Math.sqrt(rSq));
        if (op <= 0 || dist === 0) continue;
        const cos = x/dist, sin = y/dist;
        const bi = Math.min(((r-dist)/bezel*S)|0, S-1);
        const disp = profile[bi] || 0;
        const idx = (y1*w+x1)*4;
        d[idx]   = (128 + (-cos*disp/maxD)*127*op+0.5)|0;
        d[idx+1] = (128 + (-sin*disp/maxD)*127*op+0.5)|0;
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL();
  }

  function buildLiquidGlass() {
    const defs = document.getElementById('lg-defs');
    if (!defs) return;
    const W = 400, H = 400, radius = 60, bezel = 40;
    const profile = calcProfile(80, bezel, 2.5, 128);
    const maxD = Math.max(...Array.from(profile).map(Math.abs)) || 1;
    const url = dispMap(W, H, radius, bezel, profile, maxD);
    defs.innerHTML =
      '<filter id="lg-filter" x="0%" y="0%" width="100%" height="100%">' +
      '<feGaussianBlur in="SourceGraphic" stdDeviation="0.4" result="b"/>' +
      '<feImage href="' + url + '" x="0" y="0" width="' + W + '" height="' + H + '" result="m"/>' +
      '<feDisplacementMap in="b" in2="m" scale="' + (maxD * 1.0) + '" xChannelSelector="R" yChannelSelector="G" result="d"/>' +
      '<feColorMatrix in="d" type="saturate" values="3"/>' +
      '</filter>';
  }

  /* ─── SCROLL REVEAL ─────────────────────────────────────────── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible')); return; }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
  }

  /* ─── SOFT / SMOOTH SCROLL (native, zero-lag) ─────────────────
     We do NOT hijack the wheel — a JS rAF loop always trails input
     and reads as "weighty/laggy". Instead we rely on the browser's
     own hardware-accelerated scrolling (naturally smooth/inertial,
     no lag) plus CSS `scroll-behavior: smooth` for anchor jumps.
     We still expose GED.scroll and emit native scroll events so the
     pinning engine and progress bar stay in sync.
  ──────────────────────────────────────────────────────────────── */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches ||
                  ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

  const Scroll = {
    enabled: false,
    current: 0,
    subs: [],
    onScroll(fn) { this.subs.push(fn); return () => { this.subs = this.subs.filter(s => s !== fn); }; },
    emit() { for (const fn of this.subs) fn(this.current); }
  };

  function initSmoothScroll() {
    // Touch / reduced-motion: use native scroll, just mirror position.
    if (reduceMotion || isTouch) {
      window.addEventListener('scroll', () => { Scroll.current = window.scrollY; Scroll.emit(); }, { passive: true });
      Scroll.glideTo = (y) => window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      Scroll.current = window.scrollY; Scroll.emit();
      return;
    }

    Scroll.enabled = true;
    Scroll.current = window.scrollY;

    // Velocity-based momentum: wheel input pushes velocity, which decays
    // each frame. Feels soft — scrolling continues briefly then eases to a
    // stop — without the trailing-target lag of a lerp-to-target model.
    let velocity = 0;
    let pos = window.scrollY;
    let running = false;
    const FRICTION = 0.82;     // higher = longer glide (0..1)
    const IMPULSE = 0.093;     // how much a wheel notch adds to velocity (3x slower)
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    function frame() {
      pos += velocity;
      const max = maxScroll();
      if (pos < 0) { pos = 0; velocity = 0; }
      else if (pos > max) { pos = max; velocity = 0; }
      velocity *= FRICTION;
      window.scrollTo(0, pos);
      Scroll.current = pos;
      Scroll.emit();
      if (Math.abs(velocity) > 0.15) {
        requestAnimationFrame(frame);
      } else {
        velocity = 0; running = false;
      }
    }
    function kick() { if (!running) { running = true; requestAnimationFrame(frame); } }

    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY * (e.deltaMode === 1 ? 24 : 1);
      velocity += delta * IMPULSE;
      // clamp velocity so a fast flick doesn't rocket past everything
      const cap = window.innerHeight * 0.9;
      velocity = Math.max(-cap, Math.min(cap, velocity));
      kick();
    }, { passive: false });

    // Keyboard + anchor jumps: animate pos directly via a short glide.
    function glideTo(targetY) {
      targetY = Math.max(0, Math.min(targetY, maxScroll()));
      velocity = 0;
      const start = pos, dist = targetY - start, dur = 520;
      let t0 = null;
      function step(t) {
        if (t0 === null) t0 = t;
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        pos = start + dist * eased;
        window.scrollTo(0, pos);
        Scroll.current = pos; Scroll.emit();
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    window.addEventListener('keydown', (e) => {
      // Never hijack keys while typing in a field or editable element,
      // and don't scroll the page while the search overlay is open.
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      if (document.documentElement.classList.contains('ged-lock')) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const vh = window.innerHeight;
      const map = { PageDown: 0.9, PageUp: -0.9, ' ': 0.9, ArrowDown: 0.12, ArrowUp: -0.12 };
      if (e.key === 'Home') { e.preventDefault(); glideTo(0); }
      else if (e.key === 'End') { e.preventDefault(); glideTo(maxScroll()); }
      else if (e.key in map) { e.preventDefault(); glideTo(pos + map[e.key] * vh); }
    });

    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      glideTo(t.getBoundingClientRect().top + window.scrollY - 80);
    });

    // Keep pos synced if the browser scrolls by other means (e.g. find-in-page)
    window.addEventListener('scroll', () => {
      if (!running) { pos = window.scrollY; Scroll.current = pos; Scroll.emit(); }
    }, { passive: true });

    // Expose the eased glide so other modules (sidebar nav) can fast-forward.
    Scroll.glideTo = glideTo;
    Scroll.emit();
  }

  /* ─── INIT ──────────────────────────────────────────────────── */
  // Theme attribute set ASAP to avoid flash of wrong theme.
  applyInitialTheme();
  window.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    buildLiquidGlass();
    initReveal();
    initSmoothScroll();
  });

  // Shared API for other modules (case-study pinning, progress bars)
  window.GED = {
    buildLiquidGlass: buildLiquidGlass,
    scroll: Scroll,
    reduceMotion: reduceMotion,
    isTouch: isTouch
  };
  window.expose = { buildLiquidGlass };
})();
