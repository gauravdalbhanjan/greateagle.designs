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

  /* Whether the scroll-pinned engines (walkthrough / decisions / gradient)
     should run. We DON'T use GED.isTouch here: it flags any touch-CAPABLE
     device (incl. mouse-driven laptops with a touchscreen), which would
     wrongly drop those machines to the "reveal all at once" fallback. Instead
     we pin whenever a FINE pointer (mouse/trackpad) is available at desktop
     width with motion allowed — hybrid laptops keep the pinned reveal, while
     pure touch phones/tablets get the swipe/static fallback. */
  function canPinScroll() {
    if (window.GED && window.GED.reduceMotion) return false;
    if (!window.matchMedia('(min-width: 861px)').matches) return false;
    // Prefer a real fine pointer; fall back to "not coarse-only" for old browsers.
    const fine = window.matchMedia('(any-pointer: fine), (pointer: fine)').matches;
    const coarseOnly = window.matchMedia('(any-pointer: coarse)').matches && !fine;
    return fine || !coarseOnly;
  }

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

  /* 3.5 Scroll-driven 3D product story mount (Sous Chef only).
     Emits a container that assets/sous-chef-3d.js hydrates into a pinned
     WebGL story (phone Act 1 → handoff → device 7-beat). The heavy lifting
     lives in that module; here we only render the mount + skeleton + the
     reduced-motion / no-JS fallback image so the page is meaningful before
     (or without) the 3D engine. */
  S.story3d = d => {
    if (!d.story3d) return '';
    const s = d.story3d;
    const fallback = s.fallback || (d.hero && d.hero.img) || '';
    return '<section id="souschef-3d-mount" class="cs-3d"' +
      ' data-phone="' + esc(s.phone || '') + '"' +
      ' data-device="' + esc(s.device || '') + '"' +
      ' data-device-full="' + esc(s.deviceFull || '') + '">' +
      '<div class="cs-3d-fallback">' +
        (fallback ? '<img src="' + esc(fallback) + '" alt="' + esc((d.hero && d.hero.alt) || 'Sous Chef device') + '" />' : '') +
      '</div>' +
    '</section>';
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

  /* 7. Problem — numbered steps (default), OR a research-note board of
     sticky-card artifacts when d.problem.notes is provided.
     notes form: [{ text: "...", tone: "keep" | undefined }]  (tone "keep"
     highlights a strength to preserve/build on). */
  S.problem = d => {
    if (!d.problem) return '';
    const p = d.problem;
    if (p.notes && p.notes.length) {
      return '<section class="cs-section reveal">' +
        '<div class="cs-num">The Problem</div>' +
        '<h2 class="cs-h2">' + rich(p.title || 'What we found on the ground') + '</h2>' +
        (p.lead ? '<p class="cs-lead">' + rich(p.lead) + '</p>' : '') +
        '<div class="cs-notes">' + p.notes.map((nt, i) => {
          const note = (typeof nt === 'string') ? { text: nt } : nt;
          const tone = note.tone === 'keep' ? ' cs-note--keep' : '';
          return '<div class="cs-note' + tone + '" style="--n:' + i + '">' +
            (note.tone === 'keep' ? '<span class="cs-note-flag">Strength to keep</span>' : '') +
            '<p>' + rich(note.text) + '</p></div>';
        }).join('') + '</div>' +
      '</section>';
    }
    return stepsSection('The Problem', p.title || 'What was breaking down', p.lead, p.points, p.quote);
  };

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

  /* 9. Process — numbered steps (default). When d.process.deck is provided,
     the section becomes a two-column layout: the step copy on the left, and
     a scroll-driven stacked photo deck on the right (research / ideation /
     sketch artifacts) styled like the About "outside of work" stack — each
     card comes up from below-center, the previous ones blur back, and every
     card carries its own accent-colour glow. The deck is advanced by the
     pinning engine (see initPinning → deck sync). */
  function processDeck(deck) {
    if (!deck || !deck.length) return '';
    var cards = deck.map(function (m, i) {
      var media = (typeof m === 'string') ? { img: m } : m;
      return '<figure class="cs-deck-card" data-i="' + i + '">' +
        mediaTag(media) +
        (media.caption ? '<figcaption>' + rich(media.caption) + '</figcaption>' : '') +
      '</figure>';
    }).join('');
    return '<div class="cs-deck" data-deck aria-label="Process artifacts">' + cards + '</div>';
  }
  S.process = d => {
    if (!d.process) return '';
    var p = d.process;
    if (p.deck && p.deck.length) {
      var steps = (p.steps || []).map(function (s) {
        var inner = (typeof s === 'string')
          ? '<div class="cs-step-body">' + rich(s) + '</div>'
          : (s.title ? '<div class="cs-step-title">' + rich(s.title) + '</div>' : '') +
            (s.body ? '<div class="cs-step-body">' + rich(s.body) + '</div>' : '');
        return '<li class="pin-step">' + inner + '</li>';
      }).join('');
      return '<section class="cs-section cs-process-split" data-pin>' +
        '<div class="cs-num">Process</div>' +
        '<h2 class="cs-h2">' + rich(p.title || 'How we got there') + '</h2>' +
        (p.lead ? '<p class="cs-lead">' + rich(p.lead) + '</p>' : '') +
        '<div class="cs-process-grid">' +
          '<div class="cs-process-copy"><ol class="cs-steps">' + steps + '</ol>' +
            '<div class="pin-dots"></div></div>' +
          processDeck(p.deck) +
        '</div>' +
      '</section>';
    }
    return stepsSection('Process', p.title || 'How we got there', p.lead, p.steps, p.quote);
  };

  /* Minimal line icons — single-stroke, currentColor, matching the site's
     SVG language (fill:none; stroke; round joins). Keyed by name. */
  const FG_ICONS = {
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/>',
    coffee: '<path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8z"/><path d="M17 9h2.5a2.5 2.5 0 0 1 0 5H17"/><path d="M7 2v2M11 2v2"/>',
    group: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 6a3 3 0 0 1 0 6M21 20a6 6 0 0 0-4-5.7"/>',
    presentation: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M12 16v4M8 21l4-3 4 3"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/><path d="M9 3v10l3-2 3 2V3"/>',
    headphones: '<path d="M4 14a8 8 0 0 1 16 0"/><rect x="2.5" y="14" width="4" height="7" rx="2"/><rect x="17.5" y="14" width="4" height="7" rx="2"/>',
    moon: '<path d="M21 12.8A8 8 0 1 1 11.2 3a6 6 0 0 0 9.8 9.8z"/>',
    desk: '<rect x="3" y="5" width="18" height="10" rx="1"/><path d="M12 15v3M8 21h8M2 11h20"/>'
  };
  function fgIcon(name) {
    const inner = FG_ICONS[name] || FG_ICONS.desk;
    return '<svg class="fg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }

  /* 9.5 The Focus Gradient — full-bleed, icon-based, scroll-driven zoning.
     A full-viewport background gradient shifts warm/bright (loud) → mid →
     cool/calm (quiet) across three beats as the pinned section scrolls;
     sparse line icons for each beat fade in/out with their zone. One line
     of framing copy at the start. Crossfades in/out with neighbours via the
     extended --fg range. Reduced-motion / touch → static mid-tone + all icons. */
  S.gradient = d => {
    if (!d.gradient || !d.gradient.beats || !d.gradient.beats.length) return '';
    const g = d.gradient;
    const n = g.beats.length;
    // Sparse, well-spaced icon anchor positions across the full screen, per beat.
    const POS = [
      // Beat 1 (loud) — spread across the upper/left field
      [ {x:16,y:26}, {x:74,y:20}, {x:44,y:64} ],
      // Beat 2 (transition) — calmer, centred
      [ {x:30,y:34}, {x:66,y:60} ],
      // Beat 3 (quiet) — sparse, lower/right, more breathing room
      [ {x:22,y:58}, {x:78,y:30}, {x:52,y:72} ]
    ];
    const beat = (b, bi) => {
      const spaces = (b.spaces || []).map((s, si) => {
        const p = (POS[bi] && POS[bi][si]) || { x: 20 + si * 26, y: 40 };
        return '<div class="fg-icon-node" style="left:' + p.x + '%;top:' + p.y + '%">' +
          fgIcon(s.icon) +
          '<span class="fg-icon-label">' + esc(s.label) + '</span>' +
        '</div>';
      }).join('');
      return '<div class="fg-beat" data-beat="' + bi + '"' + (bi === 0 ? ' data-on' : '') + '>' + spaces + '</div>';
    };
    const dots = g.beats.map((_, i) => '<span class="fg-dot' + (i === 0 ? ' active' : '') + '"></span>').join('');
    return '<section class="cs-section cs-gradient" data-gradient data-steps="' + n + '">' +
      '<div class="fg-bg" aria-hidden="true"></div>' +
      '<div class="fg-inner">' +
        (g.framing ? '<div class="fg-framing">' + rich(g.framing) + '</div>' : '') +
        '<div class="fg-beats">' + g.beats.map(beat).join('') + '</div>' +
        '<div class="fg-dots">' + dots + '</div>' +
      '</div>' +
    '</section>';
  };

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

  /* 12. Gallery — flat grid, OR grouped into sub-categories with sub-headers.
     Grouped form: d.gallery = [{ group: "Ideation", items: [ {img,caption,wide}, ... ] }, ...]
     Flat form:    d.gallery = [ {img,caption,wide}, ... ]  (unchanged) */
  function galleryGrid(items) {
    return '<div class="cs-gallery">' + items.map(g =>
      '<figure' + (g.wide ? ' class="span-2"' : '') + '>' + mediaTag(g) +
        (g.caption ? '<figcaption>' + rich(g.caption) + '</figcaption>' : '') + '</figure>'
    ).join('') + '</div>';
  }
  S.gallery = d => {
    if (!d.gallery || !d.gallery.length) return '';
    const grouped = d.gallery[0] && d.gallery[0].group && d.gallery[0].items;
    const title = d.galleryTitle || 'Final screens &amp; artifacts';

    if (grouped) {
      // Each group is a simple masonry-style collage grid with its sub-header.
      const groups = d.gallery.map(grp =>
        '<div class="cs-gallery-group">' +
          '<h3 class="cs-gallery-subhead">' + rich(grp.group) + '</h3>' +
          '<div class="cs-collage">' + (grp.items || []).map(g =>
            '<figure' + (g.wide ? ' class="span-2"' : '') + '>' + mediaTag(g) +
              (g.caption ? '<figcaption>' + rich(g.caption) + '</figcaption>' : '') + '</figure>'
          ).join('') + '</div>' +
        '</div>'
      ).join('');
      return '<section class="cs-section reveal">' +
        '<div class="cs-num">Gallery</div><h2 class="cs-h2">' + rich(title) + '</h2>' +
        groups +
      '</section>';
    }

    return '<section class="cs-section reveal">' +
      '<div class="cs-num">Gallery</div><h2 class="cs-h2">' + rich(title) + '</h2>' +
      galleryGrid(d.gallery) +
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
    process: 'process', gradient: 'focus gradient', walkthrough: 'solution', decisions: 'design decisions',
    gallery: 'screens', impact: 'impact', reflection: 'reflection'
  };

  /* ─── Render in canonical order ───────────────────────────────── */
  function render(d) {
    const root = document.getElementById('cs-root');
    if (!root || !d) return;
    document.title = (d.title && d.title.headline ? d.title.headline.replace(/[*\[\]]/g, '') : d.name) + ' — Gaurav Dalbhanjan';

    // Section render order + their nav keys (some produce no nav entry).
    const order = [
      ['hook', S.hook], ['title', S.title], ['hero', S.hero], ['story3d', S.story3d], ['metrics', S.metrics],
      ['snapshot', S.snapshot], ['context', S.context], ['problem', S.problem],
      ['shift', S.shift], ['process', S.process], ['gradient', S.gradient],
      ['walkthrough', S.walkthrough],
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
    initGradient();
    initTouchSteps();
  }

  /* ─── SOLUTION WALKTHROUGH ENGINE (static frame, swap on scroll) ──
     The stage stays pinned; scrolling advances the active step which
     swaps the visible image + copy. Reversible. On touch/reduced-motion
     it degrades to a simple stacked reveal of each step. */
  function initWalk() {
    const sections = Array.from(document.querySelectorAll('section[data-walk]'));
    if (!sections.length) return;

    const canPin = canPinScroll();

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

  /* ─── THE FOCUS GRADIENT ENGINE (scroll = walking deeper in) ──────
     Pins the gradient stage and, as the track scrolls, drives:
       • --fg (0..1) on the stage → ambient colour + blur + noise shift
       • the active beat (entrance → transition → deep)
       • the depth dots + noise meter
     On touch / reduced-motion it does nothing — CSS shows a static
     3-column gradient graphic (no scroll-jacking). */
  function initGradient() {
    const sections = Array.from(document.querySelectorAll('section[data-gradient]'));
    if (!sections.length) return;

    const canPin = canPinScroll();
    if (!canPin) return; // CSS static fallback

    document.documentElement.classList.add('fg-on');

    sections.forEach(section => {
      const beats = Array.from(section.querySelectorAll('.fg-beat'));
      const dots = Array.from(section.querySelectorAll('.fg-dot'));
      const bg = section.querySelector('.fg-bg');
      const n = beats.length;
      if (n < 2 || !bg) return;

      // Track layout: a lead-IN band (crossfade from the previous section's
      // tone), the beats themselves, and a lead-OUT band (crossfade into the
      // next section's tone). Bands give the blended, no-hard-cut feel.
      const leadIn = 0.55, perBeat = 1.1, leadOut = 0.55;
      const span = leadIn + n * perBeat + leadOut;
      const track = document.createElement('div');
      track.className = 'pin-track fg-track';
      section.parentNode.insertBefore(track, section);
      track.appendChild(section);
      section.classList.add('fg-stage-pin');   // own sticky class (not .pin-stage)
      track.style.height = (span * 100) + 'vh';

      let curIdx = -1;
      let active = false;
      const onScroll = () => {
        const vh = window.innerHeight;
        const rect = track.getBoundingClientRect();
        const total = track.offsetHeight - vh;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const prog = total > 0 ? scrolled / total : 0;              // 0..1 whole track

        // The fixed full-screen layers are only shown while this section is
        // actually filling the viewport (its track spans top→bottom).
        const isActive = rect.top <= 1 && rect.bottom >= vh - 1;
        if (isActive !== active) { active = isActive; section.classList.toggle('fg-active', isActive); }

        // Map track progress to a beat-space value in [-1 .. n] where the
        // [0..n] window holds the beats and the negative / >n tails are the
        // crossfade bands with neighbours.
        const inFrac = leadIn / span;
        const outFrac = leadOut / span;
        const beatsFrac = 1 - inFrac - outFrac;
        // fg drives the background tone 0 (loud) → 1 (quiet), with soft
        // over-scroll at both ends so entry/exit blend rather than snap.
        let depth;
        if (prog < inFrac) depth = (prog / inFrac) * 0 - (1 - prog / inFrac) * 0.28; // enter: from -0.28 → 0
        else if (prog > 1 - outFrac) depth = 1 + ((prog - (1 - outFrac)) / outFrac) * 0.28; // exit: 1 → 1.28
        else depth = (prog - inFrac) / beatsFrac;                    // 0..1 across beats
        bg.style.setProperty('--fg', depth.toFixed(4));

        // Active beat only within the beats window; tails show nearest beat.
        const clamped = Math.min(Math.max(depth, 0), 0.9999);
        const idx = Math.min(n - 1, Math.floor(clamped * n + 1e-6));
        if (idx !== curIdx) {
          curIdx = idx;
          beats.forEach((b, i) => b.toggleAttribute('data-on', i === idx));
          dots.forEach((dt, i) => dt.classList.toggle('active', i === idx));
        }
      };

      const scroll = window.GED && window.GED.scroll;
      if (scroll && scroll.onScroll) scroll.onScroll(onScroll);
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', () => {
        track.style.height = (span * 100) + 'vh';
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

    const canPin = canPinScroll();

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

      // Optional scroll-driven photo deck on the right (Process section).
      const deckEl = section.querySelector('[data-deck]');
      const deckCards = deckEl ? Array.from(deckEl.querySelectorAll('.cs-deck-card')) : [];
      const GLOWS = [
        'rgba(255,42,0,0.55)', 'rgba(255,150,0,0.5)', 'rgba(56,210,0,0.45)',
        'rgba(0,198,255,0.5)', 'rgba(180,0,255,0.5)', 'rgba(255,0,120,0.5)',
        'rgba(0,220,180,0.5)', 'rgba(255,210,0,0.5)'
      ];
      deckCards.forEach((c, i) => c.style.setProperty('--glow', GLOWS[i % GLOWS.length]));

      pins.push({ track, section, steps, dots, perStep, leadOut, maxIdx: 0, deckCards, deckTop: -1 });
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
        // One active dot = the current step (matches every other dot engine
        // on the site — walkthrough, gradient, touch). Revealed steps stay
        // revealed, but only the dot for the current step is lit.
        p.dots.forEach((d, i) => d.classList.toggle('active', i === idx));

        // Scroll-driven photo deck: map the step-progress across all cards.
        if (p.deckCards && p.deckCards.length) {
          const dc = p.deckCards.length;
          const topIdx = Math.min(dc - 1, Math.floor(stepProg * dc + 1e-6));
          if (topIdx !== p.deckTop) { p.deckTop = topIdx; layoutDeck(p.deckCards, topIdx); }
        }
      }
    };

    // Stack the deck like the About "outside of work" cards: the current card
    // sits on top (front, glowing); cards below it recede + blur; cards not yet
    // reached wait just below, ready to rise up into place as you scroll.
    function layoutDeck(cards, top) {
      const VISIBLE = 4;
      // Cards are anchored at top:50%/left:50%, so every transform starts by
      // pulling back to its own center (-50%,-50%), then applies the stack.
      const C = 'translate(-50%,-50%) ';
      cards.forEach((el, i) => {
        const depth = i - top;                 // 0 = front, <0 = passed, >0 = waiting
        if (depth === 0) {
          el.style.transform = C + 'translate(0,0) scale(1)';
          el.style.filter = 'none';
          el.style.opacity = '1';
          el.style.zIndex = String(cards.length + 10);
          el.classList.add('top');
        } else if (depth < 0) {
          // Already passed: recede up/back, blurred, tinted by its own glow.
          const d = Math.min(-depth, VISIBLE);
          el.style.transform = C + 'translate(' + (-d * 5) + '%,' + (-d * 10) + '%) scale(' + (1 - d * 0.06) + ')';
          el.style.filter = 'blur(' + (d * 1.6) + 'px)';
          el.style.opacity = String(-depth <= VISIBLE ? (0.8 - d * 0.14) : 0);
          el.style.zIndex = String(cards.length - d);
          el.classList.remove('top');
        } else {
          // Not yet reached: parked just below-center, ready to rise up.
          el.style.transform = C + 'translate(0, 18%) scale(0.96)';
          el.style.filter = 'blur(3px)';
          el.style.opacity = '0';
          el.style.zIndex = '1';
          el.classList.remove('top');
        }
      });
    }

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
    // Only run the swipe/step fallback when the scroll-pinned engines are NOT
    // active (pure touch, narrow, or reduced-motion). On hybrid laptops that
    // are touch-CAPABLE but pin via a fine pointer, the pinned engine owns
    // these sections — running both would double-drive them.
    if (canPinScroll()) return;
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
