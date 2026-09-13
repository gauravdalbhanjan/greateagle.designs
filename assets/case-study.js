/* ══════════════════════════════════════════════════════════════
   CASE STUDY RENDERER
   Consumes window.CASE_STUDY (per-project data) and renders the
   14-section template into #cs-root. Optional sections are skipped
   gracefully when their data key is absent.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Escape stray < > and stray & — but PRESERVE valid HTML entities the data
  // intentionally uses (e.g. &mdash; &ndash; &rarr; &amp; &#123;).
  const esc = s => String(s == null ? '' : s)
    .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Allow a limited inline accent markup: **bold** and [[accent]]
  const rich = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[\[(.+?)\]\]/g, '<span class="accent">$1</span>');

  const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

  function mediaTag(m, cls) {
    if (!m) return '';
    cls = cls || '';
    if (m.video) {
      return '<video class="' + cls + '" src="' + esc(m.video) + '" autoplay muted loop playsinline></video>';
    }
    return '<img class="' + cls + '" src="' + esc(m.img || m) + '" alt="' + esc(m.alt || '') + '" loading="lazy" />';
  }

  const S = {};

  /* 1. Interactive Hook */
  S.hook = d => {
    if (!d.hook) return '';
    const h = d.hook;
    let inner;
    if (h.interactive && h.before && h.after) {
      inner =
        '<div class="compare" id="cmp">' +
          '<div class="compare-pane compare-after">' + mediaTag(h.after) +
            '<span class="compare-tag compare-tag--after">' + esc(h.afterLabel || 'After') + '</span>' +
          '</div>' +
          '<div class="compare-pane compare-before" id="cmpBefore">' + mediaTag(h.before) +
            '<span class="compare-tag compare-tag--before">' + esc(h.beforeLabel || 'Before') + '</span>' +
          '</div>' +
          '<div class="compare-handle" id="cmpHandle"><div class="compare-knob">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8 7l-4 5 4 5M16 7l4 5-4 5"/></svg>' +
          '</div></div>' +
        '</div>';
    } else if (h.before && h.after) {
      inner =
        '<div class="compare-static">' +
          '<figure>' + mediaTag(h.before) + '<figcaption>' + esc(h.beforeLabel || 'Before') + '</figcaption></figure>' +
          '<figure>' + mediaTag(h.after) + '<figcaption>' + esc(h.afterLabel || 'After') + '</figcaption></figure>' +
        '</div>';
    } else {
      inner = '';
    }
    return '<section class="cs-hook reveal">' +
      (h.label ? '<div class="eyebrow-pill cs-hook-label">' + esc(h.label) + '</div>' : '') +
      (h.headline ? '<h2 class="cs-h2" style="max-width:720px;margin:0 auto 28px;">' + rich(h.headline) + '</h2>' : '') +
      inner +
    '</section>';
  };

  /* 2. Title Block */
  S.title = d => {
    const t = d.title || {};
    return '<section class="cs-title-block reveal">' +
      '<h1>' + rich(t.headline || d.name) + '</h1>' +
      (t.tags ? '<div class="cs-tags">' + t.tags.map(x => '<span class="cs-tag">' + esc(x) + '</span>').join('') + '</div>' : '') +
      (t.client ? '<div class="cs-client"><strong>' + esc(t.client) + '</strong></div>' : '') +
      (t.result ? '<div class="cs-result-claim">' + rich(t.result) + '</div>' : '') +
    '</section>';
  };

  /* 3. Hero Media */
  S.hero = d => {
    if (!d.hero) return '';
    return '<div class="cs-hero-media reveal">' + mediaTag(d.hero) +
      (d.hero.demo ? '<div class="cs-hero-demo"><a class="btn btn-primary btn-sm" href="' + esc(d.hero.demo) + '" target="_blank" rel="noopener">View Live Demo ' + ARROW + '</a></div>' : '') +
    '</div>';
  };

  /* 4. Key Metrics Band */
  S.metrics = d => {
    if (!d.metrics || !d.metrics.length) return '';
    return '<div class="cs-metrics reveal">' + d.metrics.map(m =>
      '<div class="cs-metric glass"><div class="m-num">' + rich(m.num) + '</div><div class="m-lbl">' + rich(m.label) + '</div></div>'
    ).join('') + '</div>';
  };

  /* 5. Case Snapshot */
  S.snapshot = d => {
    if (!d.snapshot) return '';
    const cells = Object.entries(d.snapshot);
    return '<section class="cs-section"><div class="cs-snapshot reveal">' +
      cells.map(([k, v]) => '<div class="cs-snap-cell"><div class="k">' + esc(k) + '</div><div class="v">' + rich(v) + '</div></div>').join('') +
    '</div></section>';
  };

  /* Generic numbered-steps section (Problem, Process) — pinnable */
  function stepsSection(num, title, lead, steps, quote) {
    if (!steps || !steps.length) return '';
    return '<section class="cs-section cs-section--narrow" data-pin>' +
      '<div class="cs-num">' + esc(num) + '</div>' +
      '<h2 class="cs-h2">' + rich(title) + '</h2>' +
      (lead ? '<p class="cs-lead">' + rich(lead) + '</p>' : '') +
      '<ol class="cs-steps">' + steps.map(s => {
        const inner = (typeof s === 'string')
          ? '<div class="cs-step-body">' + rich(s) + '</div>'
          : (s.title ? '<div class="cs-step-title">' + rich(s.title) + '</div>' : '') +
            (s.body ? '<div class="cs-step-body">' + rich(s.body) + '</div>' : '');
        return '<li class="pin-step">' + inner + '</li>';
      }).join('') + '</ol>' +
      (quote ? quoteCard(quote) : '') +
      '<div class="pin-dots"></div>' +
    '</section>';
  }

  function quoteCard(q) {
    if (!q) return '';
    return '<div class="cs-quote glass"><blockquote>' + esc(q.text) + '</blockquote>' +
      (q.cite ? '<cite>' + esc(q.cite) + '</cite>' : '') + '</div>';
  }

  /* 6. Context */
  S.context = d => {
    if (!d.context) return '';
    return '<section class="cs-section cs-section--narrow reveal">' +
      '<div class="cs-num">Context</div><h2 class="cs-h2">Why this problem existed</h2>' +
      '<p class="cs-lead">' + rich(d.context) + '</p>' +
    '</section>';
  };

  /* 7. Problem */
  S.problem = d => d.problem ? stepsSection('The Problem', d.problem.title || 'What was breaking down', d.problem.lead, d.problem.points, d.problem.quote) : '';

  /* 8. The Shift */
  S.shift = d => {
    if (!d.shift) return '';
    const s = d.shift;
    let ba = '';
    if (s.before && s.after) {
      ba = '<div class="cs-beforeafter">' +
        '<div class="cs-ba-card before"><div class="ba-lbl">Before</div><div class="ba-val">' + rich(s.before) + '</div></div>' +
        '<div class="cs-ba-arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></div>' +
        '<div class="cs-ba-card after"><div class="ba-lbl">After</div><div class="ba-val">' + rich(s.after) + '</div></div>' +
      '</div>';
    }
    return '<section class="cs-section cs-section--narrow reveal">' +
      '<div class="cs-num">The Shift</div><h2 class="cs-h2">' + rich(s.title || 'The insight') + '</h2>' +
      '<div class="cs-shift-insight">' + rich(s.insight) + '</div>' + ba +
    '</section>';
  };

  /* 9. Process */
  S.process = d => d.process ? stepsSection('Process', d.process.title || 'How we got there', d.process.lead, d.process.steps, d.process.quote) : '';

  /* 10. Solution Walkthrough */
  S.walkthrough = d => {
    if (!d.walkthrough || !d.walkthrough.steps) return '';
    const w = d.walkthrough;
    const n = w.steps.length;
    // Static-frame walkthrough: the media window + copy panel stay fixed while
    // scrolling swaps the ACTIVE step's image and text. Own engine (data-walk).
    const slides = w.steps.map((st, i) =>
      '<figure class="cs-walk-slide" data-slide="' + i + '"' + (i === 0 ? ' data-on' : '') + '>' +
        (st.media ? mediaTag(st.media) : '<div class="cs-walk-ph"></div>') +
      '</figure>'
    ).join('');
    const copies = w.steps.map((st, i) =>
      '<div class="cs-walk-copy" data-slide="' + i + '"' + (i === 0 ? ' data-on' : '') + '>' +
        '<div class="idx">Step ' + (i + 1) + ' / ' + n + '</div>' +
        '<h3>' + rich(st.title) + '</h3>' +
        (st.body ? '<p>' + rich(st.body) + '</p>' : '') +
      '</div>'
    ).join('');
    const dots = w.steps.map((_, i) => '<span class="pin-dot' + (i === 0 ? ' active' : '') + '"></span>').join('');

    return '<section class="cs-section cs-walk-section" data-walk data-steps="' + n + '">' +
      '<div class="pin-dots cs-walk-dots">' + dots + '</div>' +
      '<div class="cs-num">Solution Walkthrough</div><h2 class="cs-h2">' + rich(w.title || 'A tour of the solution') + '</h2>' +
      '<div class="cs-walk-stage' + (w.portrait ? ' cs-walk-stage--portrait' : '') + '">' +
        '<div class="cs-walk-frame' + (w.portrait ? ' cs-walk-frame--portrait' : '') + '">' + slides + '</div>' +
        '<div class="cs-walk-panel">' + copies + '</div>' +
      '</div>' +
    '</section>';
  };

  /* 11. Design Decisions */
  S.decisions = d => {
    if (!d.decisions || !d.decisions.length) return '';
    return '<section class="cs-section" data-pin>' +
      '<div class="cs-num">Design Decisions</div><h2 class="cs-h2">Why these choices, not the obvious ones</h2>' +
      '<div class="cs-decisions">' + d.decisions.map(dc =>
        '<div class="cs-decision pin-step"><h3>' + rich(dc.title) + '</h3><p>' + rich(dc.body) + '</p>' +
          (dc.whyNot ? '<div class="why-not"><strong>Why not the obvious?</strong> ' + rich(dc.whyNot) + '</div>' : '') + '</div>'
      ).join('') + '</div>' +
      '<div class="pin-dots"></div>' +
    '</section>';
  };

  /* 12. Gallery */
  S.gallery = d => {
    if (!d.gallery || !d.gallery.length) return '';
    return '<section class="cs-section reveal">' +
      '<div class="cs-num">Gallery</div><h2 class="cs-h2">Final screens &amp; artifacts</h2>' +
      '<div class="cs-gallery">' + d.gallery.map(g =>
        '<figure' + (g.wide ? ' class="span-2"' : '') + '>' + mediaTag(g) +
          (g.caption ? '<figcaption>' + rich(g.caption) + '</figcaption>' : '') + '</figure>'
      ).join('') + '</div>' +
    '</section>';
  };

  /* 13. Impact, segmented */
  S.impact = d => {
    if (!d.impact || !d.impact.length) return '';
    return '<section class="cs-section" data-pin>' +
      '<div class="cs-num">Impact</div><h2 class="cs-h2">Where it moved the needle</h2>' +
      '<div class="cs-impact">' + d.impact.map(im =>
        '<div class="cs-impact-card pin-step"><div class="seg">' + esc(im.segment) + '</div>' +
          (im.stat ? '<div class="big" data-count>' + rich(im.stat) + '</div>' : '') +
          '<p>' + rich(im.body) + '</p></div>'
      ).join('') + '</div>' +
      (d.impactQuote ? quoteCard(d.impactQuote) : '') +
      '<div class="pin-dots"></div>' +
    '</section>';
  };

  /* 14. Reflection & Handoff */
  S.reflection = d => {
    if (!d.reflection) return '';
    const r = d.reflection;
    return '<section class="cs-section cs-section--narrow reveal">' +
      '<div class="cs-num">Reflection &amp; Handoff</div>' +
      (r.principle ? '<div class="cs-principle glass"><div class="plbl">Transferable principle</div><p>' + rich(r.principle) + '</p></div>' : '') +
      (r.future && r.future.length ? '<div class="cs-future"><h3>' + esc(r.futureTitle || "What's next") + '</h3><ul>' +
        r.future.map(f => '<li>' + rich(f) + '</li>').join('') + '</ul></div>' : '') +
      (d.next ? '<div class="cs-nextnav"><div><div class="np-label">Next project</div></div>' +
        '<a href="' + esc(d.next.href) + '">' + esc(d.next.label) + ' ' + ARROW + '</a></div>' : '') +
    '</section>';
  };

  /* Short nav labels keyed by the section function name, for the sidebar. */
  const NAV_LABELS = {
    hook: 'overview', context: 'context', problem: 'problem', shift: 'the shift',
    process: 'process', walkthrough: 'solution', decisions: 'design decisions',
    gallery: 'screens', impact: 'impact', reflection: 'reflection'
  };

  /* ─── Render in canonical order ───────────────────────────────── */
  function render(d) {
    const root = document.getElementById('cs-root');
    if (!root || !d) return;
    document.title = (d.title && d.title.headline ? d.title.headline.replace(/[*\[\]]/g, '') : d.name) + ' — Gaurav Dalbhanjan';

    // Section render order + their nav keys (some produce no nav entry).
    const order = [
      ['hook', S.hook], ['title', S.title], ['hero', S.hero], ['metrics', S.metrics],
      ['snapshot', S.snapshot], ['context', S.context], ['problem', S.problem],
      ['shift', S.shift], ['process', S.process], ['walkthrough', S.walkthrough],
      ['decisions', S.decisions], ['gallery', S.gallery], ['impact', S.impact],
      ['reflection', S.reflection]
    ];

    const bodyHTML = order.map(([key, fn]) => {
      let html = fn(d);
      if (!html) return '';
      // Keep a stable id per section (useful for in-page anchors), no sidebar.
      if (NAV_LABELS[key]) {
        html = html.replace(/^(\s*<(?:section|div))/, '$1 id="sec-' + key + '"');
      }
      return html;
    }).join('');

    root.innerHTML = bodyHTML;

    initCompare();
    initReveal();
    initPinning();
    initWalk();
    initTouchSteps();
  }

  /* ─── SOLUTION WALKTHROUGH ENGINE (static frame, swap on scroll) ──
     The stage stays pinned; scrolling advances the active step which
     swaps the visible image + copy. Reversible. On touch/reduced-motion
     it degrades to a simple stacked reveal of each step. */
  function initWalk() {
    const sections = Array.from(document.querySelectorAll('section[data-walk]'));
    if (!sections.length) return;

    const canPin = !(window.GED && (window.GED.isTouch || window.GED.reduceMotion))
                   && window.matchMedia('(min-width: 861px)').matches;

    sections.forEach(section => {
      const slides = Array.from(section.querySelectorAll('.cs-walk-slide'));
      const copies = Array.from(section.querySelectorAll('.cs-walk-copy'));
      const dots = Array.from(section.querySelectorAll('.cs-walk-dots .pin-dot'));
      const n = slides.length;
      if (n < 2 || !canPin) return; // fallback: CSS shows all copies stacked

      const perStep = 1.1, leadOut = 0.4;
      const track = document.createElement('div');
      track.className = 'pin-track';
      section.parentNode.insertBefore(track, section);
      track.appendChild(section);
      section.classList.add('pin-stage');
      track.style.height = ((n * perStep + leadOut) * 100) + 'vh';

      const setActive = (idx) => {
        slides.forEach((s, i) => s.toggleAttribute('data-on', i === idx));
        copies.forEach((c, i) => c.toggleAttribute('data-on', i === idx));
        dots.forEach((dt, i) => dt.classList.toggle('active', i === idx));
      };

      const state = { idx: 0 };
      const onScroll = () => {
        const vh = window.innerHeight;
        const rect = track.getBoundingClientRect();
        const total = track.offsetHeight - vh;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const prog = total > 0 ? scrolled / total : 0;
        const stepsFraction = (n * perStep) / (n * perStep + leadOut);
        const stepProg = Math.min(prog / stepsFraction, 1);
        const idx = Math.min(n - 1, Math.floor(stepProg * n + 1e-6));
        if (idx !== state.idx) { state.idx = idx; setActive(idx); }
      };

      const scroll = window.GED && window.GED.scroll;
      if (scroll && scroll.onScroll) scroll.onScroll(onScroll);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', () => {
        track.style.height = ((n * perStep + leadOut) * 100) + 'vh';
        onScroll();
      });
      onScroll();
    });
  }

  /* ─── PINNED SCROLLYTELLING ENGINE ────────────────────────────
     For each [data-pin] section on desktop (motion-ok, non-touch):
       - wrap the section in a tall .pin-track
       - make the section itself the sticky .pin-stage
       - as the track scrolls, compute progress 0..1 and reveal the
         N .pin-step children one by one (once each; no replay)
     On touch / reduced-motion: no pinning — steps just reveal on
     scroll via IntersectionObserver (staggered by nth-child CSS).
  ──────────────────────────────────────────────────────────────── */
  const pins = [];

  function initPinning() {
    const sections = Array.from(document.querySelectorAll('section[data-pin]'));
    if (!sections.length) return;

    // Reduced motion: leave all steps visible, no animation, no pinning.
    if (window.GED && window.GED.reduceMotion) return;

    // JS is running — enable the hide-then-reveal behaviour for steps.
    document.documentElement.classList.add('js-motion');

    const canPin = !(window.GED && window.GED.isTouch)
                   && window.matchMedia('(min-width: 861px)').matches;

    if (!canPin) {
      // Fallback (touch / small screens): reveal each step group on scroll,
      // staggered by CSS nth-child — smooth, no scroll-jacking.
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.querySelectorAll('.pin-step').forEach(s => s.classList.add('in'));
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.2 });
      sections.forEach(s => obs.observe(s));
      return;
    }

    document.documentElement.classList.add('pin-on');

    sections.forEach(section => {
      const steps = Array.from(section.querySelectorAll('.pin-step'));
      if (steps.length < 2) { steps.forEach(s => s.classList.add('in')); return; }

      // Build track wrapper: track height gives us scroll room per step.
      const track = document.createElement('div');
      track.className = 'pin-track';
      section.parentNode.insertBefore(track, section);
      track.appendChild(section);
      section.classList.add('pin-stage');

      // Track height: scroll distance allotted per step + short lead-out so
      // the last step can breathe before the pin releases. Even room per step.
      const perStep = 1.1;
      const leadOut = 0.4;
      const trackVh = (steps.length * perStep + leadOut);
      track.style.height = (trackVh * 100) + 'vh';

      // Progress dots
      const dotsWrap = section.querySelector('.pin-dots');
      if (dotsWrap) {
        dotsWrap.innerHTML = steps.map((_, i) => '<span class="pin-dot"' + (i === 0 ? ' active' : '') + '></span>').join('');
      }
      const dots = dotsWrap ? Array.from(dotsWrap.children) : [];

      // step 0 visible from the start of the pin.
      steps[0].classList.add('in');
      dots.forEach((d, i) => d.classList.toggle('active', i === 0));

      pins.push({ track, section, steps, dots, perStep, leadOut, maxIdx: 0 });
    });

    // Drive all pins off the shared smooth-scroll position.
    const scroll = window.GED && window.GED.scroll;
    const onScroll = () => {
      const vh = window.innerHeight;
      for (const p of pins) {
        const rect = p.track.getBoundingClientRect();
        const n = p.steps.length;
        // Scrollable range within the track while the stage is pinned.
        const total = p.track.offsetHeight - vh;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const prog = total > 0 ? scrolled / total : 0;   // 0..1 across whole track

        // The steps consume the first (n*perStep) of the track; leadOut is tail.
        const stepsFraction = (n * p.perStep) / (n * p.perStep + p.leadOut);
        const stepProg = Math.min(prog / stepsFraction, 1);   // 0..1 across just the steps
        // Even segments: step i is active when stepProg is in [i/n, (i+1)/n).
        const idx = Math.min(n - 1, Math.floor(stepProg * n + 1e-6));

        // FORWARD-ONLY reveal: once a step is shown it STAYS shown. Scrolling
        // back up does not re-hide steps — reverse scroll simply moves through
        // sections normally. maxIdx tracks the furthest step ever reached.
        if (idx > p.maxIdx) {
          for (let i = p.maxIdx + 1; i <= idx; i++) {
            const step = p.steps[i];
            if (step && !step.classList.contains('in')) {
              const delay = (i - p.maxIdx - 1) * 70;
              if (delay) setTimeout(() => step.classList.add('in'), delay);
              else step.classList.add('in');
            }
          }
          p.maxIdx = idx;
          if (p.maxIdx >= n - 1) p.section.classList.add('steps-done');
        }
        // Active dot follows current scroll position (can move back for context),
        // but revealed steps never un-reveal.
        p.dots.forEach((d, i) => d.classList.toggle('active', i <= idx));
      }
    };

    if (scroll && scroll.onScroll) scroll.onScroll(onScroll);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
      // recompute track heights on resize
      pins.forEach(p => {
        const trackVh = (p.steps.length * p.perStep + p.leadOut);
        p.track.style.height = (trackVh * 100) + 'vh';
      });
      onScroll();
    });
    onScroll();
  }

  /* ─── TOUCH STEP NAVIGATION (phone / tablet) ──────────────────────
     On finger devices the pinned scroll engines don't run, so the
     step sections would just stack. Instead, show ONE step at a time
     and let the user swipe left/right (or tap the arrows) to move
     through them — the dots track the active step, same as desktop. */
  function initTouchSteps() {
    const isTouch = window.GED && window.GED.isTouch;
    if (!isTouch) return;

    // Walkthrough sections: swap slide+copy; pin sections: reveal steps.
    const walks = Array.from(document.querySelectorAll('section[data-walk]'));
    const pinSecs = Array.from(document.querySelectorAll('section[data-pin]'));

    function makeArrows(host) {
      const nav = document.createElement('div');
      nav.className = 'cs-swipe-nav';
      nav.innerHTML =
        '<button class="cs-swipe-btn cs-swipe-prev" aria-label="Previous"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
        '<span class="cs-swipe-count"></span>' +
        '<button class="cs-swipe-btn cs-swipe-next" aria-label="Next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>';
      host.appendChild(nav);
      return {
        prev: nav.querySelector('.cs-swipe-prev'),
        next: nav.querySelector('.cs-swipe-next'),
        count: nav.querySelector('.cs-swipe-count')
      };
    }

    function bindSwipe(el, onLeft, onRight) {
      let x0 = null, y0 = null;
      el.addEventListener('touchstart', e => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
      el.addEventListener('touchend', e => {
        if (x0 === null) return;
        const t = e.changedTouches[0];
        const dx = t.clientX - x0, dy = t.clientY - y0;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? onLeft() : onRight(); }
        x0 = y0 = null;
      }, { passive: true });
    }

    // ---- Walkthrough (data-walk): one slide+copy visible, swipe to change
    walks.forEach(section => {
      const slides = Array.from(section.querySelectorAll('.cs-walk-slide'));
      const copies = Array.from(section.querySelectorAll('.cs-walk-copy'));
      const dots = Array.from(section.querySelectorAll('.cs-walk-dots .pin-dot'));
      const n = slides.length;
      if (n < 2) return;
      section.classList.add('cs-touch-steps');
      let idx = 0;
      const arrows = makeArrows(section.querySelector('.cs-walk-stage') || section);
      const set = i => {
        idx = Math.max(0, Math.min(n - 1, i));
        slides.forEach((s, k) => s.toggleAttribute('data-on', k === idx));
        copies.forEach((c, k) => c.toggleAttribute('data-on', k === idx));
        dots.forEach((d, k) => d.classList.toggle('active', k === idx));
        arrows.count.textContent = (idx + 1) + ' / ' + n;
        arrows.prev.disabled = idx === 0; arrows.next.disabled = idx === n - 1;
      };
      arrows.prev.addEventListener('click', () => set(idx - 1));
      arrows.next.addEventListener('click', () => set(idx + 1));
      bindSwipe(section, () => set(idx + 1), () => set(idx - 1));
      set(0);
    });

    // ---- Pin sections (data-pin): reveal one step at a time, swipe to advance
    pinSecs.forEach(section => {
      const steps = Array.from(section.querySelectorAll('.pin-step'));
      const dotsWrap = section.querySelector('.pin-dots');
      const n = steps.length;
      if (n < 2) return;
      section.classList.add('cs-touch-steps');
      // build dots if the section doesn't already have them
      let dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.pin-dot')) : [];
      if (dotsWrap && dots.length !== n) {
        dotsWrap.innerHTML = steps.map((_, i) => '<span class="pin-dot"></span>').join('');
        dots = Array.from(dotsWrap.querySelectorAll('.pin-dot'));
      }
      let idx = 0;
      const arrows = makeArrows(section);
      const set = i => {
        idx = Math.max(0, Math.min(n - 1, i));
        steps.forEach((s, k) => s.classList.toggle('touch-on', k === idx));
        dots.forEach((d, k) => d.classList.toggle('active', k === idx));
        arrows.count.textContent = (idx + 1) + ' / ' + n;
        arrows.prev.disabled = idx === 0; arrows.next.disabled = idx === n - 1;
      };
      arrows.prev.addEventListener('click', () => set(idx - 1));
      arrows.next.addEventListener('click', () => set(idx + 1));
      bindSwipe(section, () => set(idx + 1), () => set(idx - 1));
      set(0);
    });
  }

  /* Before/after compare — mouse-position driven on desktop, draggable on touch.
     NOT coupled to scroll. On pointer devices, cursor X across the component
     sets the reveal in real time. On touch, drag the handle. */
  function initCompare() {
    const cmp = document.getElementById('cmp');
    if (!cmp) return;
    const before = document.getElementById('cmpBefore');
    const handle = document.getElementById('cmpHandle');
    const isTouch = (window.GED && window.GED.isTouch);

    // Vertical divider shutter: BEFORE sits on the left; the mouse X sets how
    // much of it is revealed (left → right), wiping across to expose AFTER.
    function setPos(clientX, ease, relTo) {
      const rect = (relTo || cmp).getBoundingClientRect();
      let pct = ((clientX - rect.left) / rect.width) * 100;
      pct = Math.max(0, Math.min(100, pct));
      before.style.transition = ease ? 'width 0.4s var(--hover-ease)' : 'none';
      handle.style.transition = ease ? 'left 0.4s var(--hover-ease)' : 'none';
      before.style.width = pct + '%';
      handle.style.left = pct + '%';
    }

    if (!isTouch) {
      // Desktop: reveal tracks the cursor X across the WHOLE hook section.
      const zone = cmp.closest('.cs-hook') || cmp;
      cmp.classList.add('compare--hover');
      zone.addEventListener('mousemove', e => setPos(e.clientX, false, zone));
      zone.addEventListener('mouseleave', () => {
        const rect = zone.getBoundingClientRect();
        setPos(rect.left + rect.width / 2, true, zone);
      });
    } else {
      // Touch: draggable handle (horizontal).
      let dragging = false;
      const down = e => { dragging = true; setPos((e.touches ? e.touches[0] : e).clientX, false); };
      const move = e => { if (dragging) setPos((e.touches ? e.touches[0] : e).clientX, false); };
      const up = () => { dragging = false; };
      cmp.addEventListener('touchstart', down, { passive: true });
      window.addEventListener('touchmove', move, { passive: true });
      window.addEventListener('touchend', up);
      cmp.addEventListener('mousedown', down);
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    }
  }

  /* Scroll reveal (local, mirrors site.js) */
  function initReveal() {
    const els = document.querySelectorAll('.reveal:not(.visible)');
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('visible')); return; }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
  }

  /* Scroll progress bar — synced to the (possibly eased) scroll position */
  function initProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    const update = () => {
      const h = document.documentElement;
      const denom = h.scrollHeight - h.clientHeight;
      const pos = window.scrollY;
      bar.style.width = (denom > 0 ? (pos / denom) * 100 : 0) + '%';
    };
    const scroll = window.GED && window.GED.scroll;
    if (scroll && scroll.onScroll) scroll.onScroll(update);
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  window.addEventListener('DOMContentLoaded', () => {
    render(window.CASE_STUDY);
    initProgress();
  });
})();
