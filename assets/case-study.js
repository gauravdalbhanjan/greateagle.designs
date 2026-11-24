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
    // h.plain renders the headline as a styled <p> (keeps the page's single h1
    // first in the heading outline); h.trust adds a short centred trust line.
    const hTag = h.plain ? 'p' : 'h2';
    return '<section class="cs-hook reveal">' +
      (h.label ? '<div class="eyebrow-pill cs-hook-label">' + esc(h.label) + '</div>' : '') +
      (h.headline ? '<' + hTag + ' class="cs-h2" style="max-width:720px;margin:0 auto 28px;">' + rich(h.headline) + '</' + hTag + '>' : '') +
      (h.trust ? '<p class="cs-hook-trust">' + rich(h.trust) + '</p>' : '') +
      (h.summary ? '<p class="cs-hook-summary">' + rich(h.summary) + '</p>' : '') +
      inner +
    '</section>';
  };

  /* 2. Title Block */
  S.title = d => {
    const t = d.title || {};
    return '<section class="cs-title-block reveal">' +
      '<h1>' + rich(t.headline || d.name) + '</h1>' +
      (t.subtitle ? '<div class="cs-subtitle">' + rich(t.subtitle) + '</div>' : '') +
      (t.client ? '<div class="cs-client"><strong>' + esc(t.client) + '</strong></div>' : '') +
      (t.summary ? '<p class="cs-title-summary">' + rich(t.summary) + '</p>' : '') +
      (t.tags ? '<div class="cs-tags">' + t.tags.map(x => '<span class="cs-tag">' + esc(x) + '</span>').join('') + '</div>' : '') +
      (t.result ? '<div class="cs-result-claim">' + rich(t.result) + '</div>' : '') +
    '</section>';
  };

  /* 3. Hero Media */
  S.hero = d => {
    if (!d.hero) return '';
    const hh = d.hero;
    // Optional composite hero: app screens in front of a faded backdrop image.
    // hh.backdrop = {img,alt}; hh.screens = [{img,alt,kind:'phone'|'tablet'}];
    // hh.actions = [{label,href,primary,external,icon:'arrow'|'down'}].
    if (hh.screens && hh.screens.length) {
      const scr = hh.screens.map(function (s, i) {
        return '<figure class="sc-hero-dev sc-hero-dev--' + esc(s.kind || 'phone') + '" style="--i:' + i + '">' +
          '<img src="' + esc(s.img) + '" alt="' + esc(s.alt || '') + '"' + (i === 0 ? ' fetchpriority="high"' : '') +
          ' width="' + (s.w || '') + '" height="' + (s.h || '') + '" /></figure>';
      }).join('');
      const DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7"/></svg>';
      const OUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>';
      const acts = (hh.actions || []).map(function (a) {
        return '<a class="btn ' + (a.primary ? 'btn-primary' : 'btn-ghost') + '" href="' + esc(a.href) + '"' +
          (a.external ? ' target="_blank" rel="noopener"' : '') + '>' + esc(a.label) +
          (a.external ? '<span class="sr-only"> (opens in a new tab)</span>' : '') +
          (a.icon === 'down' ? DOWN : (a.external ? OUT : ARROW)) + '</a>';
      }).join('');
      return '<div class="cs-hero-media sc-hero reveal">' +
        '<div class="sc-hero-stage">' +
          (hh.backdrop ? '<img class="sc-hero-back" src="' + esc(hh.backdrop.img) + '" alt="' + esc(hh.backdrop.alt || '') + '" />' : '') +
          scr +
        '</div>' +
        (hh.caption ? '<p class="sc-hero-cap">' + rich(hh.caption) + '</p>' : '') +
        (acts ? '<div class="sc-hero-actions">' + acts + '</div>' : '') +
      '</div>';
    }
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

  /* 3.8 Executive summary — STAR (Situation, Task, Action, Result). Renders a
     semantic 4-row structure near the top for a fast, scannable overview. */
  S.summary = d => {
    if (!d.summary || !d.summary.star) return '';
    const s = d.summary;
    return '<section class="cs-section cs-section--narrow cs-summary reveal">' +
      '<div class="cs-num">' + esc(s.title || 'Executive summary') + '</div>' +
      '<ol class="cs-star">' + s.star.map(function (r) {
        return '<li class="cs-star-row">' +
          '<span class="cs-star-k">' + esc(r.k) + '</span>' +
          '<p class="cs-star-b">' + rich(r.body) + '</p>' +
        '</li>';
      }).join('') + '</ol>' +
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

  /* Generic numbered-steps section (Problem, Process) — pinnable.
     When the steps carry `icon` fields, render a STATIC icon card/tile grid
     (Alexa-style) instead of the scroll-pinned numbered reveal. */
  function stepsSection(num, title, lead, steps, quote) {
    if (!steps || !steps.length) return '';
    const asTiles = steps.every(function (s) { return s && typeof s === 'object' && s.icon; });
    if (asTiles) {
      return '<section class="cs-section">' +
        '<div class="cs-num">' + esc(num) + '</div>' +
        '<h2 class="cs-h2">' + rich(title) + '</h2>' +
        (lead ? '<p class="cs-lead">' + rich(lead) + '</p>' : '') +
        iconCards(steps, steps.length >= 4 ? 3 : steps.length) +
        (quote ? quoteCard(quote) : '') +
      '</section>';
    }
    // data-accordion: on touch, each pin-step becomes a tap-to-expand row.
    return '<section class="cs-section cs-section--narrow" data-pin data-accordion>' +
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
      // Optional supporting photo gallery (grouped or flat), rendered as a
      // collage below the note board — reuses the gallery collage styling.
      let galleryHtml = '';
      if (p.gallery && p.gallery.length) {
        const grouped = p.gallery[0] && p.gallery[0].group && p.gallery[0].items;
        if (grouped) {
          galleryHtml = p.gallery.map(grp =>
            '<div class="cs-gallery-group">' +
              '<h3 class="cs-gallery-subhead">' + rich(grp.group) + '</h3>' +
              '<div class="cs-collage">' + (grp.items || []).map(g =>
                '<figure' + (g.wide ? ' class="span-2"' : '') + '>' + mediaTag(g) +
                  (g.caption ? '<figcaption>' + rich(g.caption) + '</figcaption>' : '') + '</figure>'
              ).join('') + '</div>' +
            '</div>'
          ).join('');
        } else {
          galleryHtml = '<div class="cs-collage">' + p.gallery.map(g =>
            '<figure' + (g.wide ? ' class="span-2"' : '') + '>' + mediaTag(g) +
              (g.caption ? '<figcaption>' + rich(g.caption) + '</figcaption>' : '') + '</figure>'
          ).join('') + '</div>';
        }
      }
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
        galleryHtml +
      '</section>';
    }
    return stepsSection(p.num || 'The Problem', p.title || 'What was breaking down', p.lead, p.points, p.quote);
  };

  /* 7.5 Legacy lookup workflow — scroll-driven reenactment (OPEX).
     A pinned stage recreates the old Cognos-style lookup: a wall of 4-digit
     CostPool IDs, copying one, pasting it into a query studio that takes ~30s,
     juggling tabs, and the resulting cognitive load. Beats advance on scroll
     (engine: initLegacyFlow). Recreated UI — deliberately retro, not a real
     screenshot. */
  S.legacyFlow = d => {
    if (!d.legacyFlow || !d.legacyFlow.beats) return '';
    const f = d.legacyFlow;
    const n = f.beats.length;
    const target = f.targetId || '';
    // Turn the dense ID string into spans, marking the target ID so it can be
    // highlighted/"copied" on the right beat.
    const idHtml = (f.ids || '').split(';').filter(Boolean).map(function (id) {
      const t = id.trim();
      const isTarget = t === target;
      return '<span class="lf-id' + (isTarget ? ' lf-id--target' : '') + '">' + esc(t) + '</span><span class="lf-sep">;</span>';
    }).join('');

    // Recreated legacy "query studio" object tree. Rows carry a drill-DEPTH
    // (data-drill 0..3): the engine reveals deeper rows as the manager drills
    // down through the folder names. A chevron marks expandable folders.
    const chev = '<span class="lf-chev">\u203A</span>';
    const tree =
      '<div class="lf-tree">' +
        '<div class="lf-tree-row lf-tree-root" data-drill="0">' + chev + '\uD83D\uDCC1 24 Total Compensation</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="1" style="--d:1">' + chev + '\uD83D\uDCC1 organization</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="2" style="--d:2">' + chev + '\uD83D\uDCC1 organization</div>' +
        '<div class="lf-tree-row lf-drillrow lf-tree-folder-100" data-drill="3" style="--d:3">' + chev + '\uD83D\uDCC1 100</div>' +
        '<div class="lf-tree-row lf-drillrow lf-tree-hit" data-drill="4" style="--d:4">\u25A4 101</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="4" style="--d:4">\u25A4 102</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="4" style="--d:4">\u25A4 103</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="3" style="--d:3">\u25A4 200</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="3" style="--d:3">\u25A4 300</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="3" style="--d:3">\u25A4 400</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="1" style="--d:1">\uD83D\uDCC1 Currency</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="1" style="--d:1">\uD83D\uDCC1 EmployeeList</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="1" style="--d:1">\uD83D\uDCC1 Month</div>' +
        '<div class="lf-tree-row lf-drillrow" data-drill="1" style="--d:1">\uD83D\uDCC1 Compensation</div>' +
      '</div>';
    const grid =
      '<div class="lf-grid">' +
        '<div class="lf-grid-search">' +
          '<span class="lf-grid-search-lbl">Search value:</span>' +
          '<span class="lf-grid-search-box"><span class="lf-typed"></span><span class="lf-caret2"></span></span>' +
          '<span class="lf-run">Run</span>' +
        '</div>' +
        '<div class="lf-grid-body">' +
          '<div class="lf-spinner" aria-hidden="true"><span></span></div>' +
          '<div class="lf-latency">Retrieving\u2026 <b class="lf-timer">0.0</b>s</div>' +
          '<table class="lf-table"><thead><tr><th>YTD Salary &amp; Bonus</th><th>Jan</th><th>Feb</th><th>Mar</th></tr></thead>' +
            '<tbody>' +
              '<tr><td>101</td><td>46,072</td><td>90,142</td><td>136,042</td></tr>' +
              '<tr><td>102</td><td>37,061</td><td>74,121</td><td>111,082</td></tr>' +
              '<tr><td>103</td><td>50,712</td><td>101,424</td><td>151,136</td></tr>' +
            '</tbody></table>' +
        '</div>' +
      '</div>';
    // ── App 1: the "Budget Planner" SOURCE screen the manager copies from.
    //    Dark navy header, Simulations breadcrumb, Inputs tab, the floating
    //    "Particular Values with changes" popover holding the ID wall, a data
    //    table, and the right-hand nav rail. This is where the copy happens. */
    const budgetApp =
      '<div class="lf-app lf-app--budget">' +
        '<div class="lf-bp-top"><span class="lf-bp-grid">\u2637</span><span class="lf-bp-brand">Budget Planner</span>' +
          '<span class="lf-bp-user">\u25CB username \u25BE</span></div>' +
        '<div class="lf-bp-body">' +
          '<div class="lf-bp-main">' +
            '<div class="lf-bp-crumb"><span>Simulations</span> \u203A <span>Sample Sim 1</span></div>' +
            '<div class="lf-bp-searchbar"><span class="lf-bp-searchtxt">RemovingVendor</span><span class="lf-bp-actions">Actions</span></div>' +
            '<div class="lf-bp-tabs"><span>Reports</span><span class="lf-bp-tab-on">Inputs</span><span>Results</span></div>' +
            '<div class="lf-bp-table">' +
              '<div class="lf-bp-tr lf-bp-th"><span>From</span><span>To</span><span>Code</span><span>ID</span><span>Owner</span><span>Type</span></div>' +
              '<div class="lf-bp-tr"><span>GRD-001</span><span>GRD-001</span><span>544</span><span>1000;103\u2026</span><span>John</span><span>To Product</span></div>' +
              '<div class="lf-bp-tr"><span>GRD-001</span><span>GRD-001</span><span>544</span><span>1171;117\u2026</span><span>John</span><span>To Product</span></div>' +
            '</div>' +
            // The floating popover with the dense ID list (source of the copy).
            '<div class="lf-bp-popover">' +
              '<div class="lf-bp-pop-hd">Particular Values with changes: <span class="lf-copied">Copied \u2713</span></div>' +
              '<div class="lf-ids">' + idHtml + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="lf-bp-nav">' +
            '<div class="lf-bp-nav-hd">Budget Planner</div>' +
            '<div class="lf-bp-nav-i">Home</div>' +
            '<div class="lf-bp-nav-i">Start New</div>' +
            '<div class="lf-bp-nav-i lf-bp-nav-on">History</div>' +
            '<div class="lf-bp-nav-i lf-bp-nav-sub">Simulations</div>' +
            '<div class="lf-bp-nav-i lf-bp-nav-sub">Change Requests</div>' +
            '<div class="lf-bp-nav-i">System Dictionary</div>' +
            '<div class="lf-bp-nav-i lf-bp-nav-sub">Cost Pool History</div>' +
            '<div class="lf-bp-nav-i lf-bp-nav-sub">Definitions</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ── App 2: the legacy Cognos query studio the ID gets pasted into.
    const cognosApp =
      '<div class="lf-app lf-app--cognos">' +
        '<div class="lf-menubar"><span>File</span><span>Edit</span><span>View</span><span>Settings</span><span>Run</span><span>Help</span></div>' +
        '<div class="lf-toolbar"></div>' +
        '<div class="lf-workspace">' +
          '<div class="lf-panel-lbl">Insertable Objects</div>' + tree + grid +
        '</div>' +
      '</div>';

    // A little stack of browser tabs (one per parallel search) for the "tabs" beat.
    const nTabs = f.tabs || 4;
    let tabsHtml = '';
    for (let i = 0; i < nTabs; i++) {
      tabsHtml += '<div class="lf-tab" style="--i:' + i + '"><span class="lf-tab-dot"></span>Query Studio \u2014 ' + (i + 1) + '<span class="lf-tab-spin"></span></div>';
    }

    const captions = f.beats.map(function (b, i) {
      return '<p class="lf-caption" data-beat="' + i + '">' + rich(b.caption) + '</p>';
    }).join('');
    const dots = f.beats.map(function (_, i) { return '<span class="pin-dot' + (i === 0 ? ' active' : '') + '"></span>'; }).join('');

    // Both apps live inside ONE screen/monitor bezel and cross-fade: the Budget
    // Planner shows first (copy the ID), then the Cognos studio slides in.
    return '<section class="cs-section cs-legacy" data-legacy data-beats="' + n + '"' +
        ' data-target="' + esc(target) + '" data-latency="' + (f.latencySeconds || 30) + '">' +
      '<div class="pin-dots cs-legacy-dots">' + dots + '</div>' +
      '<div class="cs-num">The Problem, felt</div>' +
      '<h2 class="cs-h2">' + rich(f.title || 'One number at a time') + '</h2>' +
      (f.lead ? '<p class="cs-lead">' + rich(f.lead) + '</p>' : '') +
      '<div class="lf-stage">' +
        '<div class="lf-cursor" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24"><path d="M5 3l14 8-6 1.5L15 20l-3 1-2.5-7L5 17z"/></svg>' +
          '<span class="lf-cursor-tag"></span>' +
        '</div>' +
        '<div class="lf-screen">' +
          '<div class="lf-screen-bar"><span class="lf-dots"><i></i><i></i><i></i></span>' +
            '<span class="lf-screen-title"></span></div>' +
          '<div class="lf-screen-view">' +
            '<div class="lf-tabs">' + tabsHtml + '</div>' +
            budgetApp + cognosApp +
          '</div>' +
        '</div>' +
        '<div class="lf-stand"></div><div class="lf-base"></div>' +
        '<div class="lf-load"><span class="lf-load-num">\u00d7' + (f.retrievalsPerCycle || 1000) + '</span> retrievals every cycle</div>' +
      '</div>' +
      '<div class="lf-captions">' + captions + '</div>' +
    '</section>';
  };

  /* 7.6 Problem, visualized — three recreated windows showing the SAME
     communication need implemented differently per product, then a reveal
     that collapses them to one intention. Static (no scroll engine). */
  S.problemViz = d => {
    if (!d.problemViz || !d.problemViz.windows) return '';
    const v = d.problemViz;
    const win = (w) => {
      let body = '';
      if (w.kind === 'field') {
        body = '<div class="pv-field"><label class="pv-field-lbl">' + esc(w.label || 'Comment') + '</label>' +
          '<div class="pv-field-box">' + esc(w.placeholder || '') + '</div>' +
          '<div class="pv-field-btn">Post</div></div>';
      } else if (w.kind === 'sheet') {
        const rows = (w.rows || []).map(function (r, i) {
          return '<div class="pv-sheet-row"><span class="pv-sheet-cell pv-sheet-rownum">' + (i + 1) + '</span>' +
            '<span class="pv-sheet-cell">GRD-00' + (i + 1) + '</span>' +
            '<span class="pv-sheet-cell pv-sheet-fb">' + esc(r) + '</span></div>';
        }).join('');
        body = '<div class="pv-sheet"><div class="pv-sheet-row pv-sheet-head">' +
          '<span class="pv-sheet-cell pv-sheet-rownum">#</span><span class="pv-sheet-cell">Item</span>' +
          '<span class="pv-sheet-cell pv-sheet-fb">' + esc(w.column || 'Feedback') + '</span></div>' + rows + '</div>';
      } else {
        const items = (w.items || []).map(function (it) {
          return '<div class="pv-thread-item"><span class="pv-thread-av">' + esc((it.who || '?').charAt(0)) + '</span>' +
            '<div class="pv-thread-bubble"><b>' + esc(it.who || '') + '</b><span>' + esc(it.text || '') + '</span></div></div>';
        }).join('');
        body = '<div class="pv-thread"><div class="pv-thread-hd">' + esc(w.heading || 'Comments') + '</div>' + items + '</div>';
      }
      return '<figure class="pv-win">' +
        '<div class="pv-win-bar"><span class="pv-win-dots"><i></i><i></i><i></i></span>' +
          '<span class="pv-win-app">' + esc(w.app || '') + '</span></div>' +
        '<div class="pv-win-body">' + body + '</div>' +
      '</figure>';
    };
    const windows = '<div class="pv-windows">' + v.windows.map(win).join('') +
      '<div class="pv-arrows" aria-hidden="true"><span>\u2198</span><span>\u2193</span><span>\u2199</span></div>' +
    '</div>';
    const reveal = '<div class="pv-reveal">' +
      '<span class="pv-reveal-lbl">' + esc(v.revealLabel || 'All of it is') + '</span>' +
      '<span class="pv-reveal-word">' + esc(v.revealWord || 'Communication') + '</span>' +
      (v.revealBody ? '<p class="pv-reveal-body">' + rich(v.revealBody) + '</p>' : '') +
    '</div>';
    return '<section class="cs-section cs-problemviz reveal">' +
      '<div class="cs-num">Context</div>' +
      '<h2 class="cs-h2">' + rich(v.title || 'The same need, different disguises') + '</h2>' +
      (v.lead ? '<p class="cs-lead">' + rich(v.lead) + '</p>' : '') +
      windows + reveal +
    '</section>';
  };

  /* 7.7 Design-system components — Comment Panel is one of many; list them all
     as chips (the highlighted one is the subject of this study). */
  S.components = d => {
    if (!d.components || !d.components.items) return '';
    const c = d.components;
    const hi = c.highlight || '';
    return '<section class="cs-section cs-components reveal">' +
      '<div class="cs-num">Systems contribution</div>' +
      '<h2 class="cs-h2">' + rich(c.title || 'One of a system I built with the team') + '</h2>' +
      (c.lead ? '<p class="cs-lead">' + rich(c.lead) + '</p>' : '') +
      '<div class="cs-comp-chips">' + c.items.map(function (it) {
        const on = it === hi ? ' cs-comp-chip--hi' : '';
        return '<span class="cs-comp-chip' + on + '">' + esc(it) + '</span>';
      }).join('') + '</div>' +
      (c.lead2 ? '<p class="cs-comp-note">' + rich(c.lead2) + '</p>' : '') +
    '</section>';
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
    // Optional multi-row form: s.rows = [{ icon, before, after }].
    if (s.rows && s.rows.length) {
      const AR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
      ba = '<ul class="sc-shift-rows">' + s.rows.map(function (r) {
        return '<li class="sc-shift-row reveal">' +
          '<div class="cs-ba-card before">' + (r.icon ? csIcon(r.icon) : '') + '<div class="ba-lbl">Before</div><div class="ba-val">' + rich(r.before) + '</div></div>' +
          '<div class="cs-ba-arrow">' + AR + '</div>' +
          '<div class="cs-ba-card after"><div class="ba-lbl">After</div><div class="ba-val">' + rich(r.after) + '</div></div>' +
        '</li>';
      }).join('') + '</ul>';
    }
    return '<section class="cs-section' + (s.rows ? '' : ' cs-section--narrow') + ' reveal">' +
      '<div class="cs-num">' + esc(s.num || 'The Shift') + '</div><h2 class="cs-h2">' + rich(s.title || 'The insight') + '</h2>' +
      (s.insight ? '<div class="cs-shift-insight">' + rich(s.insight) + '</div>' : '') + ba +
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
    // Static icon tiles when every step carries an icon. Any `deck` artifacts
    // render as a static collage below (no scroll engine).
    var stepsHaveIcons = (p.steps || []).length && p.steps.every(function (s) { return s && typeof s === 'object' && s.icon; });
    if (stepsHaveIcons) {
      var deckCollage = '';
      if (p.deck && p.deck.length) {
        deckCollage = '<div class="cs-collage cs-process-collage">' + p.deck.map(function (m) {
          var media = (typeof m === 'string') ? { img: m } : m;
          return '<figure' + (media.wide ? ' class="span-2"' : '') + '>' + mediaTag(media) +
            (media.caption ? '<figcaption>' + rich(media.caption) + '</figcaption>' : '') + '</figure>';
        }).join('') + '</div>';
      }
      return '<section class="cs-section">' +
        '<div class="cs-num">Process</div>' +
        '<h2 class="cs-h2">' + rich(p.title || 'How we got there') + '</h2>' +
        (p.lead ? '<p class="cs-lead">' + rich(p.lead) + '</p>' : '') +
        iconCards(p.steps, p.steps.length >= 4 ? 3 : p.steps.length) +
        deckCollage +
      '</section>';
    }
    if (p.deck && p.deck.length) {
      var steps = (p.steps || []).map(function (s) {
        var inner = (typeof s === 'string')
          ? '<div class="cs-step-body">' + rich(s) + '</div>'
          : (s.title ? '<div class="cs-step-title">' + rich(s.title) + '</div>' : '') +
            (s.body ? '<div class="cs-step-body">' + rich(s.body) + '</div>' : '');
        return '<li class="pin-step">' + inner + '</li>';
      }).join('');
      return '<section class="cs-section cs-process-split" data-pin data-accordion>' +
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
    desk: '<rect x="3" y="5" width="18" height="10" rx="1"/><path d="M12 15v3M8 21h8M2 11h20"/>',
    /* ── extended set for the info card/tile grids (Problem/Process/Decisions/Impact) ── */
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    tabs: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 11h18"/>',
    code: '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4"/>',
    eyeoff: '<path d="M3 3l18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.4 5.3A9.3 9.3 0 0 1 12 5c6 0 9 7 9 7a16 16 0 0 1-3 4M6.1 6.1A16 16 0 0 0 3 12s3 7 9 7a9 9 0 0 0 3-.5"/>',
    detective: '<circle cx="12" cy="9" r="3"/><path d="M4 20a8 8 0 0 1 16 0"/><path d="M8 4l2 2M16 4l-2 2"/>',
    route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h6a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h5"/>',
    cluster: '<circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="7" r="2.5"/><circle cx="12" cy="17" r="2.5"/><path d="M7.6 8l3 7M16.5 9l-3.2 6.2"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5M3 17l9 5 9-5"/>',
    tag: '<path d="M3 11l8-8 10 10-8 8z"/><circle cx="8" cy="8" r="1.4"/>',
    shield: '<path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>',
    traffic: '<rect x="8" y="2" width="8" height="20" rx="4"/><circle cx="12" cy="7" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="17" r="1.5"/>',
    stack: '<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="10" width="18" height="4" rx="1"/><rect x="3" y="16" width="18" height="4" rx="1"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/>',
    rocket: '<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2M9 11a8 8 0 0 1 8-8c2 0 3 1 3 3a8 8 0 0 1-8 8z"/><circle cx="14.5" cy="9.5" r="1.3"/><path d="M9 11l-3 1 2 2 1-3z"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>',
    gauge: '<path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-5"/><circle cx="12" cy="18" r="1" fill="currentColor"/>',
    map: '<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    plug: '<path d="M9 2v6M15 2v6M7 8h10v3a5 5 0 0 1-10 0z"/><path d="M12 16v6"/>',
    responsive: '<rect x="2" y="5" width="13" height="10" rx="1"/><rect x="16" y="8" width="6" height="11" rx="1"/><path d="M6 19h6"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-1 1.2-2-.5-1 .1-2 1.3-2H17a4 4 0 0 0 4-4c0-5-4-8-9-8z"/><circle cx="7.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="10" r="1"/>',
    doc: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4M9 13h6M9 17h6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4V5z"/><path d="M8 10h8M8 13h5"/>',
    swing: '<path d="M4 4h16M8 4v6M16 4v6M6 10h12l-1 5H7z"/><path d="M9 20l2-5M15 20l-2-5"/>',
    window: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 9h16M12 3v18"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    /* ── Sous Chef v2 additions (new keys only) ── */
    camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    box: '<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
    recipe: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    flame: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 1.5 2 2 2 0-2.5 0-4.5 1-7z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.5 12h11.5l2-8H6.2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    thermo: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0z"/><path d="M12 9v7"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    leaf: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15"/><path d="M5 19l8-8"/>',
    broom: '<path d="M14 3l-4 9"/><path d="M6 12h8l3 9H3z"/><path d="M9 16v5M13 16v5"/>',
    ban: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    device: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    send: '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>',
    sliders: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    filecheck: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/><path d="M9 14l2 2 4-4"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
    db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
    wifi: '<path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/>',
    split: '<path d="M6 3v6a6 6 0 0 0 6 6h0a6 6 0 0 1 6 6"/><path d="M18 3v6a6 6 0 0 1-6 6"/>',
    touch: '<path d="M9 11V5a2 2 0 0 1 4 0v6"/><path d="M13 9a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-.5A5.5 5.5 0 0 1 5 16l-1.5-3a1.8 1.8 0 0 1 3-1.8L9 14"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v11h14V10"/><path d="M10 21v-6h4v6"/>',
    hand: '<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6M11 10V4a1.5 1.5 0 0 1 3 0v6M14 10V5a1.5 1.5 0 0 1 3 0v8a7 7 0 0 1-7 7 6 6 0 0 1-5-3l-2-4a1.5 1.5 0 0 1 2.5-1.5L8 14"/>'
  };
  function fgIcon(name) {
    const inner = FG_ICONS[name] || FG_ICONS.desk;
    return '<svg class="fg-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  }
  /* A larger line icon in a rounded accent tile, for the static info-card grids. */
  function csIcon(name) {
    const inner = FG_ICONS[name] || FG_ICONS.doc;
    return '<span class="cs-card-ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg></span>';
  }
  /* Static icon card/tile grid (Alexa-style) — used for Problem / Process /
     Decisions / Impact when a data file opts in (d.tiles or per-item icons).
     Each item: { icon, title, body, meta?, foot? }. Renders a gentle .reveal
     fade instead of the scroll-pinned one-by-one engine. */
  function iconCards(items, cols) {
    return '<div class="cs-cards cs-cards--' + (cols || 3) + '">' + items.map(function (it) {
      return '<div class="cs-card reveal">' +
        csIcon(it.icon) +
        (it.meta ? '<div class="cs-card-meta">' + esc(it.meta) + '</div>' : '') +
        (it.title ? '<h3 class="cs-card-title">' + rich(it.title) + '</h3>' : '') +
        (it.body ? '<p class="cs-card-body">' + rich(it.body) + '</p>' : '') +
        (it.foot ? '<div class="cs-card-foot"><strong>Why not the obvious?</strong> ' + rich(it.foot) + '</div>' : '') +
      '</div>';
    }).join('') + '</div>';
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
    // Project-style CARDS (like the menu's project cards): each step is a card
    // with its media on top, then a numbered label, title and body. Static —
    // no scroll engine. Portrait media keeps a taller aspect ratio.
    const cards = w.steps.map((st, i) =>
      '<figure class="cs-walk-card reveal' + (w.portrait ? ' cs-walk-card--portrait' : '') + '">' +
        '<div class="cs-walk-card-media">' +
          (st.media ? mediaTag(st.media) : '<div class="cs-walk-ph"></div>') +
        '</div>' +
        '<figcaption class="cs-walk-card-body">' +
          '<span class="cs-walk-card-idx">Step ' + (i + 1) + ' / ' + n + '</span>' +
          '<h3>' + rich(st.title) + '</h3>' +
          (st.body ? '<p>' + rich(st.body) + '</p>' : '') +
        '</figcaption>' +
      '</figure>'
    ).join('');

    return '<section class="cs-section">' +
      '<div class="cs-num">Solution Walkthrough</div><h2 class="cs-h2">' + rich(w.title || 'A tour of the solution') + '</h2>' +
      '<div class="cs-walk-cards' + (w.portrait ? ' cs-walk-cards--portrait' : '') + '">' + cards + '</div>' +
    '</section>';
  };

  /* 11. Design Decisions */
  S.decisions = d => {
    if (!d.decisions || !d.decisions.length) return '';
    // Static icon tiles when every decision carries an icon.
    const asTiles = d.decisions.every(function (dc) { return dc && dc.icon; });
    if (asTiles) {
      return '<section class="cs-section">' +
        '<div class="cs-num">Design Decisions</div><h2 class="cs-h2">Why these choices, not the obvious ones</h2>' +
        iconCards(d.decisions.map(function (dc) {
          return { icon: dc.icon, title: dc.title, body: dc.body, foot: dc.whyNot };
        }), 2) +
      '</section>';
    }
    return '<section class="cs-section" data-pin data-accordion>' +
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

    return '<section class="cs-section reveal"' + (d.galleryId ? ' id="' + esc(d.galleryId) + '"' : '') + '>' +
      '<div class="cs-num">' + esc(d.galleryNum || 'Gallery') + '</div><h2 class="cs-h2">' + rich(title) + '</h2>' +
      (d.galleryLead ? '<p class="cs-lead">' + rich(d.galleryLead) + '</p>' : '') +
      galleryGrid(d.gallery) +
    '</section>';
  };

  /* 13. Impact, segmented */
  S.impact = d => {
    if (!d.impact || !d.impact.length) return '';
    // Static icon tiles when every impact row carries an icon. The segment
    // becomes the eyebrow (meta), the stat the headline title.
    const asTiles = d.impact.every(function (im) { return im && im.icon; });
    if (asTiles) {
      return '<section class="cs-section">' +
        '<div class="cs-num">' + esc(d.impactNum || 'Impact') + '</div><h2 class="cs-h2">' + rich(d.impactTitle || 'Where it moved the needle') + '</h2>' +
        '<div class="cs-cards cs-cards--' + (d.impactCols || 3) + '">' + d.impact.map(function (im) {
          return '<div class="cs-card cs-card--impact reveal">' +
            csIcon(im.icon) +
            '<div class="cs-card-meta">' + esc(im.segment) + '</div>' +
            (im.stat ? '<div class="cs-card-stat">' + rich(im.stat) + '</div>' : '') +
            '<p class="cs-card-body">' + rich(im.body) + '</p>' +
          '</div>';
        }).join('') + '</div>' +
        (d.impactQuote ? quoteCard(d.impactQuote) : '') +
      '</section>';
    }
    return '<section class="cs-section" data-pin data-accordion>' +
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
      '<div class="cs-num">' + (r.num ? esc(r.num) : 'Reflection &amp; Handoff') + '</div>' +
      (r.title ? '<h2 class="cs-h2">' + rich(r.title) + '</h2>' : '') +
      (r.principle ? '<div class="cs-principle glass"><div class="plbl">' + esc(r.principleLabel || 'Transferable principle') + '</div><p>' + rich(r.principle) + '</p></div>' : '') +
      (r.learned && r.learned.length ? '<div class="cs-future sc-learned"><h3>' + esc(r.learnedTitle || 'What I learned') + '</h3><ul>' +
        r.learned.map(f => '<li>' + rich(f) + '</li>').join('') + '</ul></div>' : '') +
      (r.future && r.future.length ? '<div class="cs-future"><h3>' + esc(r.futureTitle || "What's next") + '</h3><ul>' +
        r.future.map(f => '<li>' + rich(f) + '</li>').join('') + '</ul></div>' : '') +
      (d.next ? '<div class="cs-nextnav"><div><div class="np-label">Next project</div></div>' +
        '<a href="' + esc(d.next.href) + '">' + esc(d.next.label) + ' ' + ARROW + '</a></div>' : '') +
    '</section>';
  };

  /* ══ Layered-format sections (Sous Chef v2). Each is opt-in via its own data
     key and returns '' when absent, so other case studies are unaffected.
     Summary is always visible; detail sits in a native <details> disclosure
     (keyboard-operable, announced as expandable, collapsed by default). ══ */
  const CHEV = '<svg class="sc-more-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  function scMore(label, bodyHtml, cls) {
    if (!bodyHtml) return '';
    return '<details class="sc-more' + (cls ? ' ' + cls : '') + '"><summary><span class="sc-more-lbl">' + esc(label || 'Details') + '</span>' + CHEV + '</summary>' +
      '<div class="sc-more-body">' + bodyHtml + '</div></details>';
  }
  // Rich text that may be a string or an array of paragraphs.
  function scParas(v) {
    if (!v) return '';
    return (Array.isArray(v) ? v : [v]).map(function (p) { return '<p>' + rich(p) + '</p>'; }).join('');
  }
  function scHead(o, fallbackTitle) {
    return (o.num ? '<div class="cs-num">' + esc(o.num) + '</div>' : '') +
      '<h2 class="cs-h2">' + rich(o.title || fallbackTitle || '') + '</h2>' +
      (o.lead ? '<p class="cs-lead">' + rich(o.lead) + '</p>' : '');
  }
  function scOpen(id, cls) {
    return '<section class="cs-section sc-sec' + (cls ? ' ' + cls : '') + '"' + (id ? ' id="' + esc(id) + '"' : '') + '>';
  }

  /* 02 · At a glance — key numbers + snapshot + stack chips. */
  S.glance = d => {
    const g = d.glance; if (!g) return '';
    const nums = (g.metrics || []).map(function (m) {
      return '<div class="cs-metric glass"><div class="m-num">' + rich(m.num) + '</div><div class="m-lbl">' + rich(m.label) + '</div></div>';
    }).join('');
    const snap = g.snapshot ? Object.entries(g.snapshot).map(function (kv) {
      return '<div class="cs-snap-cell"><div class="k">' + esc(kv[0]) + '</div><div class="v">' + rich(kv[1]) + '</div></div>';
    }).join('') : '';
    const stack = (g.stack || []).map(function (s) { return '<li class="cs-comp-chip">' + esc(s) + '</li>'; }).join('');
    return scOpen(g.id, 'sc-glance') + scHead(g, 'At a glance') +
      (nums ? '<h3 class="sc-h3">' + esc(g.metricsTitle || 'Key numbers') + '</h3><div class="cs-metrics reveal">' + nums + '</div>' : '') +
      (snap ? '<h3 class="sc-h3">' + esc(g.snapshotTitle || 'Snapshot') + '</h3><div class="cs-snapshot reveal">' + snap + '</div>' : '') +
      (stack ? '<h3 class="sc-h3">' + esc(g.stackTitle || 'Stack') + '</h3><ul class="cs-comp-chips sc-chips reveal">' + stack + '</ul>' : '') +
    '</section>';
  };

  /* 05 · Principles — numbered icon cards. */
  S.principles = d => {
    const p = d.principles; if (!p || !p.items) return '';
    return scOpen(p.id, 'sc-principles') + scHead(p) +
      iconCards(p.items.map(function (it, i) {
        return { icon: it.icon, meta: (i < 9 ? '0' : '') + (i + 1), title: it.title, body: it.body };
      }), 3) +
    '</section>';
  };

  /* 06 · The product — nav chips, a screen strip, then feature cards with
     summary visible and the detail behind a disclosure. */
  S.features = d => {
    const f = d.features; if (!f || !f.items) return '';
    const nav = f.nav ? '<div class="sc-nav reveal"><span class="sc-nav-lbl">' + esc(f.nav.label || 'Navigation') + '</span>' +
      '<ul class="sc-chips">' + f.nav.items.map(function (n) { return '<li class="cs-comp-chip">' + esc(n) + '</li>'; }).join('') + '</ul>' +
      (f.nav.note ? '<p class="sc-nav-note">' + rich(f.nav.note) + '</p>' : '') + '</div>' : '';
    const strip = (f.screens && f.screens.length) ? '<ul class="sc-strip reveal" aria-label="App screens" tabindex="0">' + f.screens.map(function (s) {
      return '<li><figure class="sc-phone"><img src="' + esc(s.img) + '" alt="' + esc(s.alt) + '" loading="lazy" decoding="async" width="390" height="844" />' +
        '<figcaption>' + rich(s.label) + '</figcaption></figure></li>';
    }).join('') + '</ul>' : '';
    const cards = '<div class="cs-cards cs-cards--3 sc-feats">' + f.items.map(function (it, i) {
      return '<article class="cs-card sc-card reveal">' +
        '<div class="sc-card-top">' + csIcon(it.icon) + '<span class="cs-card-meta">' + (i < 9 ? '0' : '') + (i + 1) + '</span></div>' +
        '<h3 class="cs-card-title">' + rich(it.name) + '</h3>' +
        '<p class="cs-card-body">' + rich(it.summary) + '</p>' +
        scMore('Details', scParas(it.details)) +
      '</article>';
    }).join('') + '</div>';
    return scOpen(f.id, 'sc-features') + scHead(f) + nav + strip + cards + '</section>';
  };

  /* 07 · How it works — interactive architecture diagram (HTML/CSS + inline
     SVG connectors; no images, canvas or libraries). Driven entirely by
     d.architecture. The trust boundary (dashed) is the visual centre; amber
     connectors that cross it carry a "↗ leaves device" text tag. Every node
     is a focusable button that opens a three-line detail card. Behaviour
     lives in initArch(). Styles: .cs-arch namespace in case-study.css. */
  // Arrow glyph. Base points DOWN; CSS rotates per modifier/breakpoint:
  // --down, --up, --both, --flowx (right on wide screens, down when stacked).
  function archArrow(dir) {
    const heads = dir === 'both' ? '<path d="M7 7l5-5 5 5"/><path d="M7 25l5 5 5-5"/>' : '<path d="M7 25l5 5 5-5"/>';
    return '<span class="cs-arch-arrow cs-arch-arrow--' + dir + '" aria-hidden="true">' +
      '<svg viewBox="0 0 24 32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">' +
      '<path class="cs-arch-line" pathLength="1" d="M12 ' + (dir === 'both' ? '3' : '2') + 'v' + (dir === 'both' ? '26' : '27') + '"/>' + heads + '</svg></span>';
  }
  function archNode(n, cls, inner) {
    if (!n) return '';
    return '<button type="button" class="cs-arch-node' + (cls ? ' ' + cls : '') + '" data-node="' + esc(n.id) + '" aria-haspopup="dialog">' +
      (n.icon ? csIcon(n.icon) : '') +
      '<span class="cs-arch-nt"><span class="cs-arch-name">' + esc(n.name) + '</span>' +
      (n.sub ? '<span class="cs-arch-sub">' + rich(n.sub) + '</span>' : '') + (inner || '') + '</span></button>';
  }
  function archConn(dir, label, opts) {
    opts = opts || {};
    return '<div class="cs-arch-conn' + (opts.leave ? ' is-leave' : '') + (opts.cls ? ' ' + opts.cls : '') + '">' + archArrow(dir) +
      (label ? '<span class="cs-arch-lbl">' + rich(label) + '</span>' : '') +
      (opts.tag ? '<span class="cs-arch-tag">' + esc(opts.tag) + '</span>' : '') + '</div>';
  }
  S.architecture = d => {
    const a = d.architecture; if (!a || !a.device) return '';
    const dv = a.device, out = a.outside, sh = a.ship, bd = a.build, pk = a.parked;
    // Flatten every node for the detail-card lookup + the text description.
    const all = [];
    const push = (zone, n) => { if (n) all.push({ zone: zone, n: n }); };
    push('Outside the device', dv.you);
    push(dv.title, dv.screens); push(dv.title, dv.guardrails); (dv.guardrails.items || []).forEach(n => push(dv.title + ', guardrails', n));
    push(dv.title, dv.api); (dv.engines || []).forEach(n => push(dv.title + ', engines', n));
    push(dv.title, dv.storage); push(dv.title, dv.excel);
    (out.items || []).forEach(it => push(out.title, it.node));
    (sh.chain || []).forEach(n => push(sh.title, n));
    (bd.chain || []).forEach(n => Array.isArray(n) ? n.forEach(m => push(bd.title, m)) : push(bd.title, n));
    (pk.items || []).forEach(n => push(pk.title, n));
    const info = {};
    all.forEach(x => { info[x.n.id] = { name: x.n.name, zone: x.zone, what: x.n.what, rule: x.n.rule, test: x.n.test }; });

    const views = (a.views || []).map((v, i) =>
      '<button type="button" class="cs-arch-view" data-view="' + esc(v.id) + '" aria-pressed="' + (i === 0) + '">' + esc(v.label) + '</button>').join('');
    const legend = (a.legend || []).map(l =>
      '<li><span class="cs-arch-key cs-arch-key--' + esc(l.kind) + '" aria-hidden="true"></span>' + esc(l.label) + '</li>').join('');

    // ── Device zone: You (outside) → trust boundary → stacked layers.
    const chips = (dv.screens.chips || []).map(c => '<span class="cs-arch-chip">' + esc(c) + '</span>').join('');
    const pair = (downLbl, upLbl) => '<div class="cs-arch-pair">' + archConn('down', downLbl) + archConn('up', upLbl) + '</div>';
    const device =
      '<div class="cs-arch-zone cs-arch-zone--device" data-zone="device">' +
        '<div class="cs-arch-you">' + archNode(dv.you, 'cs-arch-node--you') + archConn('down', dv.youLink) + '</div>' +
        '<div class="cs-arch-boundary">' +
          '<div class="cs-arch-bhead"><h3 class="cs-arch-zt">' + esc(dv.title) + '</h3><p class="cs-arch-bnote">' + rich(dv.note) + '</p></div>' +
          '<div class="cs-arch-inner">' +
            archNode(dv.screens, 'cs-arch-node--wide', '<span class="cs-arch-chips">' + chips + '</span>') +
            pair('', dv.guardrails.returnLabel) +
            '<div class="cs-arch-band">' +
              archNode(dv.guardrails, 'cs-arch-node--band') +
              '<ul class="cs-arch-band-list">' + (dv.guardrails.items || []).map(n => '<li>' + archNode(n, 'cs-arch-node--chip') + '</li>').join('') + '</ul>' +
            '</div>' +
            pair('', dv.resultsLabel) +
            archNode(dv.api, 'cs-arch-node--api') +
            pair('', '') +
            '<ul class="cs-arch-engines">' + (dv.engines || []).map(n => '<li>' + archNode(n) + '</li>').join('') + '</ul>' +
            '<div class="cs-arch-links">' +
              archConn('up', dv.pantryLabel, { cls: 'cs-arch-link--match' }) +
              archConn('down', dv.confirmedLabel, { cls: 'cs-arch-link--ocr' }) +
            '</div>' +
            '<div class="cs-arch-store">' + archNode(dv.storage, 'cs-arch-node--store') + archConn('both', '', { cls: 'cs-arch-conn--side' }) + archNode(dv.excel) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ── Outside services: amber arrows leaving the boundary, each tagged.
    const outside =
      '<div class="cs-arch-zone cs-arch-zone--out" data-zone="out"><h3 class="cs-arch-zt">' + esc(out.title) + '</h3>' +
        '<ul class="cs-arch-outlist">' + (out.items || []).map(it =>
          '<li class="cs-arch-out">' + archConn('flowx', it.label, { leave: true, tag: out.tag }) + archNode(it.node, 'cs-arch-node--svc') + '</li>').join('') +
        '</ul></div>';

    // ── How it ships: vertical chain ending in the browser.
    const ship =
      '<div class="cs-arch-zone cs-arch-zone--ship" data-zone="ship"><h3 class="cs-arch-zt">' + esc(sh.title) + '</h3>' +
        '<ol class="cs-arch-chain cs-arch-chain--v">' + (sh.chain || []).map((n, i) =>
          '<li>' + (i ? archConn('down', (sh.links || [])[i - 1]) : '') + archNode(n) + '</li>').join('') + '</ol></div>';

    // ── Build time: horizontal chain on wide screens, vertical when stacked.
    const build =
      '<div class="cs-arch-zone cs-arch-zone--build" data-zone="build"><h3 class="cs-arch-zt">' + esc(bd.title) + '</h3>' +
        '<ol class="cs-arch-chain cs-arch-chain--x">' + (bd.chain || []).map((n, i) =>
          '<li>' + (i ? archConn('flowx', '') : '') +
            (Array.isArray(n) ? '<div class="cs-arch-group">' + n.map(m => archNode(m)).join('<span class="cs-arch-plus" aria-hidden="true">+</span>') + '</div>' : archNode(n)) +
          '</li>').join('') + '</ol>' +
        archConn('down', bd.into, { cls: 'cs-arch-conn--into' }) + '</div>';

    // ── Parked / future.
    const parked =
      '<div class="cs-arch-zone cs-arch-zone--parked" data-zone="parked"><h3 class="cs-arch-zt">' + esc(pk.title) + '</h3>' +
        '<ul class="cs-arch-parklist">' + (pk.items || []).map(n => '<li>' + archNode(n, 'cs-arch-node--parked') + '</li>').join('') + '</ul></div>';

    // ── Visually hidden text description: every node and every flow.
    const sr = '<ol class="cs-arch-sr">' +
      all.map(x => '<li>' + esc(x.zone) + ': ' + esc(x.n.name) + (x.n.sub ? ' (' + esc(x.n.sub.replace(/<[^>]+>/g, '')) + ')' : '') + '. ' + esc(x.n.what || '') + '</li>').join('') +
      (a.flows || []).map(f => '<li>' + esc(f) + '</li>').join('') + '</ol>';

    const diagram =
      '<div class="cs-arch reveal" data-arch data-view="' + esc((a.views && a.views[0] && a.views[0].id) || 'flow') + '">' +
        '<div class="cs-arch-bar">' +
          '<div class="cs-arch-views" role="group" aria-label="' + esc(a.viewsLabel || 'Diagram view') + '">' + views + '</div>' +
          '<ul class="cs-arch-legend" aria-label="Legend">' + legend + '</ul>' +
        '</div>' +
        '<p class="cs-arch-live cs-arch-sr" aria-live="polite"></p>' +
        '<div class="cs-arch-fig" role="figure" aria-label="' + esc(a.figLabel) + '">' + sr +
          '<div class="cs-arch-grid">' + build + ship + device + outside + parked + '</div>' +
          '<div class="cs-arch-card" role="dialog" aria-modal="false" aria-labelledby="cs-arch-card-t" hidden>' +
            '<button type="button" class="cs-arch-x" aria-label="Close details"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
            '<p class="cs-arch-card-z"></p><h4 class="cs-arch-card-t" id="cs-arch-card-t"></h4><dl class="cs-arch-card-dl"></dl>' +
          '</div>' +
          '<script type="application/json" class="cs-arch-data">' + JSON.stringify(info).replace(/</g, '\\u003c') + '</script>' +
        '</div>' +
      '</div>';
    const details = (a.details && a.details.length) ? '<h3 class="sc-h3">' + esc(a.detailsTitle || 'Details') + '</h3><div class="sc-acc-list">' +
      a.details.map(function (x) { return scMore(x.title, scParas(x.body), 'sc-more--row'); }).join('') + '</div>' : '';
    return scOpen(a.id, 'sc-architecture') +
      (a.num ? '<div class="cs-num">' + esc(a.num) + '</div>' : '') +
      '<h2 class="cs-h2">' + rich(a.title) + '</h2>' +
      (a.intro ? '<p class="cs-lead">' + rich(a.intro) + '</p>' : '') +
      diagram +
      (a.summary ? '<p class="cs-lead cs-arch-summary">' + rich(a.summary) + '</p>' : '') +
      details + '</section>';
  };

  /* 08–10 · Guardrails / Privacy / Security — card groups, summary + detail.
     Optional o.figure renders a phone screenshot beside the cards; optional
     o.callout renders a highlighted statement after them. */
  function scCardGroup(o, defId) {
    if (!o || !o.items) return '';
    const cols = o.cols || 3;
    const cards = '<div class="cs-cards cs-cards--' + cols + '">' + o.items.map(function (it) {
      return '<article class="cs-card sc-card reveal">' + csIcon(it.icon) +
        '<h3 class="cs-card-title">' + rich(it.title) + '</h3>' +
        '<p class="cs-card-body">' + rich(it.summary) + '</p>' +
        scMore('Details', scParas(it.details)) +
      '</article>';
    }).join('') + '</div>';
    const fig = o.figure ? '<figure class="sc-phone sc-side-fig reveal"><img src="' + esc(o.figure.img) + '" alt="' + esc(o.figure.alt) + '" loading="lazy" decoding="async" width="390" height="844" />' +
      (o.figure.caption ? '<figcaption>' + rich(o.figure.caption) + '</figcaption>' : '') + '</figure>' : '';
    const callout = o.callout ? '<div class="cs-principle glass sc-callout reveal">' + csIcon(o.callout.icon || 'shield') +
      '<p>' + rich(o.callout.text) + '</p></div>' : '';
    return scOpen(o.id || defId, 'sc-group') + scHead(o) +
      (fig ? '<div class="sc-split">' + fig + '<div class="sc-split-main">' + cards + '</div></div>' : cards) +
      callout + '</section>';
  }
  S.guardrails = d => scCardGroup(d.guardrails, 'guardrails');
  S.privacy = d => scCardGroup(d.privacy, 'privacy');
  S.security = d => scCardGroup(d.security, 'security');

  /* 11 · Decisions — featured callout + Was → Now → Why table. The first
     `visible` rows show; the rest sit behind a disclosure. */
  S.decisionsTable = d => {
    const t = d.decisionsTable; if (!t || !t.rows) return '';
    const cols = t.cols || ['Was', 'Now', 'Why'];
    const AR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    const table = function (rows, caption) {
      return '<table class="sc-dt"><caption class="sr-only">' + esc(caption) + '</caption><thead><tr>' +
        cols.map(function (c) { return '<th scope="col">' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        rows.map(function (r) {
          return '<tr><td data-label="' + esc(cols[0]) + '"><span class="sc-dt-was">' + rich(r[0]) + '</span></td>' +
            '<td data-label="' + esc(cols[1]) + '"><span class="sc-dt-now">' + AR + rich(r[1]) + '</span></td>' +
            '<td data-label="' + esc(cols[2]) + '">' + rich(r[2]) + '</td></tr>';
        }).join('') + '</tbody></table>';
    };
    const n = t.visible || t.rows.length;
    const first = t.rows.slice(0, n), rest = t.rows.slice(n);
    const callout = t.callout ? '<div class="cs-principle glass sc-feature-callout reveal"><div class="plbl">' + esc(t.callout.label || 'Featured') + '</div>' +
      '<p class="sc-fc-head">' + rich(t.callout.head) + '</p>' + scParas(t.callout.text) + '</div>' : '';
    return scOpen(t.id, 'sc-decisions') + scHead(t) + callout +
      '<div class="sc-dt-wrap reveal">' + table(first, (t.title || 'Decisions') + ', part 1') +
        (rest.length ? scMore('Show ' + rest.length + ' more decisions', table(rest, (t.title || 'Decisions') + ', part 2'), 'sc-more--wide') : '') +
      '</div></section>';
  };

  /* 12 · Trade-offs — honest cost list as icon cards. */
  S.tradeoffs = d => {
    const t = d.tradeoffs; if (!t || !t.items) return '';
    return scOpen(t.id, 'sc-tradeoffs') + scHead(t) + iconCards(t.items, 3) + '</section>';
  };

  /* 13 · Lite → Pro — two-column tier comparison. */
  S.tiers = d => {
    const t = d.tiers; if (!t || !t.lite || !t.pro) return '';
    const tier = function (x, cls, ico) {
      return '<article class="sc-tier ' + cls + ' reveal"><div class="sc-tier-head"><h3>' + esc(x.name) + '</h3>' +
        (x.badge ? '<span class="sc-badge">' + esc(x.badge) + '</span>' : '') + '</div>' +
        '<ul class="sc-tier-list">' + x.items.map(function (i) { return '<li>' + csIcon(ico) + '<span>' + rich(i) + '</span></li>'; }).join('') + '</ul></article>';
    };
    return scOpen(t.id, 'sc-tiers') + scHead(t) +
      '<div class="sc-tier-grid">' + tier(t.lite, 'sc-tier--lite', 'check') + tier(t.pro, 'sc-tier--pro', 'lock') + '</div>' +
      (t.summary ? '<p class="cs-lead sc-tier-sum reveal">' + rich(t.summary) + '</p>' : '') +
    '</section>';
  };

  /* 14 · Built for every screen — responsive points + device figures. */
  S.everyScreen = d => {
    const s = d.everyScreen; if (!s) return '';
    const figs = (s.figures || []).map(function (f) {
      return '<figure class="sc-es-fig sc-es-fig--' + esc(f.kind || 'tablet') + '"><img src="' + esc(f.img) + '" alt="' + esc(f.alt) + '" loading="lazy" decoding="async" width="' + (f.w || '') + '" height="' + (f.h || '') + '" />' +
        (f.caption ? '<figcaption>' + rich(f.caption) + '</figcaption>' : '') + '</figure>';
    }).join('');
    const pts = (s.points || []).map(function (p) {
      return '<li class="reveal">' + csIcon(p.icon) + '<p>' + rich(p.text) + '</p></li>';
    }).join('');
    return scOpen(s.id, 'sc-every') + scHead(s) +
      '<div class="sc-es"><div class="sc-es-figs reveal">' + figs + '</div><ul class="sc-es-pts">' + pts + '</ul></div>' +
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
    let order = [
      ['hook', S.hook], ['title', S.title], ['story3d', S.story3d], ['metrics', S.metrics],
      ['snapshot', S.snapshot], ['components', S.components],
      ['problemViz', S.problemViz], ['problem', S.problem], ['hero', S.hero],
      ['legacyFlow', S.legacyFlow],
      ['shift', S.shift], ['process', S.process], ['gradient', S.gradient],
      ['walkthrough', S.walkthrough],
      ['decisions', S.decisions], ['gallery', S.gallery], ['impact', S.impact],
      ['reflection', S.reflection],
      // Opt-in layered sections (render nothing unless their data key exists).
      ['glance', S.glance], ['principles', S.principles], ['features', S.features],
      ['architecture', S.architecture], ['guardrails', S.guardrails], ['privacy', S.privacy],
      ['security', S.security], ['decisionsTable', S.decisionsTable], ['tradeoffs', S.tradeoffs],
      ['tiers', S.tiers], ['everyScreen', S.everyScreen]
    ];
    // A data file may reorder sections for its own page via d.sectionOrder
    // (an array of section keys). Listed keys are emitted in that sequence
    // first; any sections not listed keep their default relative order after.
    if (Array.isArray(d.sectionOrder) && d.sectionOrder.length) {
      const byKey = new Map(order.map(pair => [pair[0], pair]));
      const seen = new Set();
      const reordered = [];
      d.sectionOrder.forEach(k => { if (byKey.has(k) && !seen.has(k)) { reordered.push(byKey.get(k)); seen.add(k); } });
      order.forEach(pair => { if (!seen.has(pair[0])) reordered.push(pair); });
      order = reordered;
    }

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
    initLegacyFlow();
    initTouchAccordions();
    initTouchSteps();
    initLightbox();
    initArch();
  }

  /* ─── ARCHITECTURE DIAGRAM (views, detail cards, arrow-key focus) ───
     No-op unless a [data-arch] diagram is on the page. */
  function initArch() {
    document.querySelectorAll('[data-arch]').forEach(function (root) {
      const fig = root.querySelector('.cs-arch-fig');
      const card = root.querySelector('.cs-arch-card');
      const live = root.querySelector('.cs-arch-live');
      let info = {};
      try { info = JSON.parse(root.querySelector('.cs-arch-data').textContent); } catch (e) {}
      const nodes = Array.from(root.querySelectorAll('.cs-arch-node'));
      let openFor = null;

      // View switcher (Data flow / What leaves your device / How it ships).
      root.querySelectorAll('.cs-arch-view').forEach(function (b) {
        b.addEventListener('click', function () {
          root.setAttribute('data-view', b.dataset.view);
          root.querySelectorAll('.cs-arch-view').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
          if (live) live.textContent = 'Showing: ' + b.textContent;
          if (openFor) closeCard(false);
        });
      });

      function place(btn) {
        const f = fig.getBoundingClientRect(), r = btn.getBoundingClientRect();
        const w = Math.min(320, f.width - 16);
        card.style.width = w + 'px';
        let left = r.left - f.left + r.width / 2 - w / 2;
        left = Math.max(8, Math.min(left, f.width - w - 8));
        card.style.left = left + 'px';
        const h = card.offsetHeight;
        let top = r.bottom - f.top + 8;
        if (top + h > f.height - 8 && r.top - f.top - h - 8 > 0) top = r.top - f.top - h - 8;   // flip above
        card.style.top = top + 'px';
      }
      function openCard(btn) {
        const d = info[btn.dataset.node]; if (!d) return;
        nodes.forEach(function (n) { n.setAttribute('aria-expanded', String(n === btn)); });
        card.querySelector('.cs-arch-card-z').textContent = d.zone || '';
        card.querySelector('.cs-arch-card-t').textContent = d.name || '';
        const rows = [['What it does', d.what], ['Key rule', d.rule], ['Test / source', d.test]].filter(function (r) { return r[1]; });
        card.querySelector('.cs-arch-card-dl').innerHTML = rows.map(function (r) {
          return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
        }).join('');
        card.hidden = false;
        openFor = btn;
        place(btn);
        card.querySelector('.cs-arch-x').focus({ preventScroll: true });
      }
      function closeCard(restore) {
        card.hidden = true;
        nodes.forEach(function (n) { n.removeAttribute('aria-expanded'); });
        const b = openFor; openFor = null;
        if (restore !== false && b) b.focus({ preventScroll: true });
      }

      nodes.forEach(function (btn, i) {
        btn.addEventListener('click', function (e) {
          e.stopPropagation();
          if (openFor === btn) closeCard(); else openCard(btn);
        });
        // Arrow keys move between nodes (DOM order); Home/End jump.
        btn.addEventListener('keydown', function (e) {
          let j = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = i + 1;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = i - 1;
          else if (e.key === 'Home') j = 0;
          else if (e.key === 'End') j = nodes.length - 1;
          if (j === null) return;
          e.preventDefault();
          nodes[(j + nodes.length) % nodes.length].focus();
        });
      });
      card.querySelector('.cs-arch-x').addEventListener('click', function () { closeCard(); });
      card.addEventListener('click', function (e) { e.stopPropagation(); });
      document.addEventListener('click', function () { if (openFor) closeCard(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openFor) { e.preventDefault(); closeCard(); } });
      window.addEventListener('resize', function () { if (openFor) place(openFor); }, { passive: true });
    });
  }

  /* ─── TOUCH ACCORDIONS ────────────────────────────────────────────
     On touch devices, [data-accordion] sections (Problem, Process, Design
     Decisions, Impact) become simple tap-to-expand rows: each card's title is
     a clickable header with a chevron; the rest collapses until tapped. The
     pinned scroll engine still drives these sections on desktop unchanged. */
  function initTouchAccordions() {
    const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    if (!touch) return;
    const secs = Array.from(document.querySelectorAll('section[data-accordion]'));
    if (!secs.length) return;

    // Per structure, the element used as the row TITLE; the rest becomes body.
    function splitCard(card) {
      // decision cards: <h3> title; impact cards: .seg + .big headline;
      // problem/process steps: .cs-step-title (may be absent → use body start).
      let titleEl = card.querySelector('.cs-step-title') || card.querySelector('h3');
      let titleHTML, bodyNodes;
      if (card.classList.contains('cs-impact-card')) {
        const seg = card.querySelector('.seg');
        const big = card.querySelector('.big');
        titleHTML = (seg ? seg.outerHTML : '') + (big ? '<span class="cs-acc-big">' + big.innerHTML + '</span>' : '');
        bodyNodes = Array.from(card.children).filter(n => n !== seg && n !== big);
      } else if (titleEl) {
        titleHTML = titleEl.innerHTML;
        bodyNodes = Array.from(card.children).filter(n => n !== titleEl);
      } else {
        // no explicit title — use the first line of the body as the title
        titleHTML = card.textContent.trim().split('. ')[0];
        bodyNodes = Array.from(card.children);
      }
      return { titleHTML, bodyNodes };
    }

    secs.forEach(section => {
      section.classList.add('cs-acc-on');
      // find the card list container + the cards
      const list = section.querySelector('.cs-steps, .cs-decisions, .cs-impact');
      if (!list) return;
      const cards = Array.from(list.children);
      if (cards.length < 1) return;
      list.classList.add('cs-acc-list');

      cards.forEach((card, i) => {
        const { titleHTML, bodyNodes } = splitCard(card);
        card.classList.add('cs-acc-item');
        card.innerHTML = '';
        const head = document.createElement('button');
        head.type = 'button';
        head.className = 'cs-acc-head';
        head.innerHTML = '<span class="cs-acc-title">' + titleHTML + '</span>' +
          '<span class="cs-acc-chev" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>';
        const body = document.createElement('div');
        body.className = 'cs-acc-body';
        const inner = document.createElement('div');
        inner.className = 'cs-acc-body-inner';
        bodyNodes.forEach(n => inner.appendChild(n));
        body.appendChild(inner);
        card.appendChild(head);
        card.appendChild(body);
        // steps/pin-reveal shouldn't hide these — force visible
        card.classList.add('in');
        head.addEventListener('click', () => {
          const open = card.classList.toggle('cs-acc-open');
          head.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        head.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ─── IMAGE LIGHTBOX ──────────────────────────────────────────────
     Click any content image (gallery, walkthrough, figures, deck) to open
     it enlarged in a centred popup with an accent-color glow. Delegated
     click handling covers images added dynamically. Close via the X, the
     backdrop, or Esc. The compare-slider images are excluded (they're a
     drag interaction, not a viewable still). */
  function initLightbox() {
    // Build the overlay once.
    let box = document.getElementById('cs-lightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'cs-lightbox';
      box.className = 'cs-lightbox';
      box.setAttribute('aria-hidden', 'true');
      box.innerHTML =
        '<div class="cs-lb-backdrop"></div>' +
        '<figure class="cs-lb-figure" role="dialog" aria-modal="true" aria-label="Image preview">' +
          '<button class="cs-lb-close" aria-label="Close">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
          '</button>' +
          '<img class="cs-lb-img" alt="" />' +
          '<figcaption class="cs-lb-cap"></figcaption>' +
        '</figure>';
      document.body.appendChild(box);
    }
    const lbImg = box.querySelector('.cs-lb-img');
    const lbCap = box.querySelector('.cs-lb-cap');

    function open(src, alt, caption) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      if (caption) { lbCap.textContent = caption; lbCap.style.display = ''; }
      else { lbCap.textContent = ''; lbCap.style.display = 'none'; }
      box.classList.add('on');
      box.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';   // lock scroll behind
    }
    function close() {
      box.classList.remove('on');
      box.setAttribute('aria-hidden', 'true');
      document.documentElement.style.overflow = '';
      // Clear the src after the fade so we don't keep the big image decoded.
      setTimeout(() => { if (!box.classList.contains('on')) lbImg.src = ''; }, 300);
    }

    // Delegated: any clickable content <img>, excluding the compare slider,
    // the lightbox's own image, and tiny UI icons/logos.
    document.addEventListener('click', e => {
      const img = e.target.closest('img');
      if (!img) return;
      if (box.contains(img)) return;                       // ignore the lightbox image itself
      if (img.closest('.compare-slider, #cmp, .ged-header, nav, .cs-lb-figure')) return;
      if (!img.closest('#cs-root')) return;                // only case-study content images
      e.preventDefault();
      // Prefer a caption from a sibling <figcaption> if present.
      const fig = img.closest('figure');
      const cap = fig ? fig.querySelector('figcaption') : null;
      open(img.currentSrc || img.src, img.alt, cap ? cap.textContent.trim() : '');
    });

    box.querySelector('.cs-lb-close').addEventListener('click', close);
    box.querySelector('.cs-lb-backdrop').addEventListener('click', close);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && box.classList.contains('on')) close(); });
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

      const perStep = 0.8, leadOut = 0.35;   // faster step reveal
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
      // the last step can breathe before the pin releases. Smaller perStep =
      // content reveals faster (less scrolling needed per step).
      const perStep = 0.62;
      const leadOut = 0.35;
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
        // Cumulative: every dot up to the current step lights orange as its
        // content loads (so earlier steps stay lit, not just the current one).
        p.dots.forEach((d, i) => d.classList.toggle('active', i <= idx));

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

  /* ─── LEGACY LOOKUP WORKFLOW ENGINE (OPEX) ────────────────────────
     Pins the recreated Cognos UI and scrubs a 5-beat reenactment off scroll:
       0 list   — the wall of IDs
       1 copy   — one ID highlights + "Copied ✓"
       2 search — the ID is typed into the query box, spinner + ~30s timer
       3 tabs   — parallel tabs stack in to keep pace
       4 load   — cognitive-load payoff (×1000 retrievals)
     The section carries a `lf-b0..lf-b4` class = current beat. The 30s timer
     is driven by scroll position within the "search" beat (scrubbable), not a
     real 30s wait. Touch / reduced-motion: no pin — show the final state. */
  function initLegacyFlow() {
    const sections = Array.from(document.querySelectorAll('section[data-legacy]'));
    if (!sections.length) return;

    function paint(section, beat, subProg) {
      const n = +section.getAttribute('data-beats') || 5;
      for (let i = 0; i < n; i++) section.classList.toggle('lf-b' + i, i === beat);
      section.classList.toggle('lf-copied-on', beat >= 1);
      section.classList.toggle('lf-searching', beat >= 2);
      section.classList.toggle('lf-tabs-on', beat >= 3);
      section.classList.toggle('lf-load-on', beat >= 4);
      // Which app fills the screen: Budget Planner (source) for the copy beats,
      // then the Cognos query studio once the ID is pasted in (beat >= 2).
      const onCognos = beat >= 2;
      section.classList.toggle('lf-on-cognos', onCognos);
      section.classList.toggle('lf-on-budget', !onCognos);
      const stitle = section.querySelector('.lf-screen-title');
      if (stitle) stitle.textContent = onCognos ? 'IBM Cognos Query Studio \u2014 CostPool lookup' : 'Budget Planner \u2014 Sample Sim 1';
      // Type the target ID progressively during the copy/search beats.
      const target = section.getAttribute('data-target') || '';
      const typed = section.querySelector('.lf-typed');
      if (typed) {
        let chars = 0;
        if (beat < 1) chars = 0;
        else if (beat === 1) chars = Math.round(subProg * target.length);
        else chars = target.length;
        typed.textContent = target.slice(0, chars);
      }
      // Latency timer ticks up across the "search" beat (scrubbable 0→latency).
      const timer = section.querySelector('.lf-timer');
      const latency = +section.getAttribute('data-latency') || 30;
      if (timer) {
        let secs = 0;
        if (beat < 2) secs = 0;
        else if (beat === 2) secs = subProg * latency;
        else secs = latency;
        timer.textContent = secs.toFixed(1);
      }
      // Drill-down: reveal deeper tree rows as the "load" beat progresses, so
      // the folder names expand one level at a time (100 → 101/102/103).
      // maxDrill grows 1..4 across beat 4; earlier beats keep the top level.
      let maxDrill;
      if (beat < 4) maxDrill = 1;                 // only top-level folders show
      else maxDrill = 1 + Math.min(3, Math.floor(subProg * 3 + 0.001) + 1);  // 2..4
      section.querySelectorAll('.lf-drillrow').forEach(function (row) {
        const dd = +row.getAttribute('data-drill') || 0;
        row.classList.toggle('lf-drill-in', dd <= maxDrill);
      });
      section.classList.toggle('lf-drilling', beat >= 4);

      // Mimic the mouse pointer moving through the workflow, one target per beat.
      let sel = null, tag = '';
      if (beat === 0) { sel = '.lf-ids'; tag = 'scanning\u2026'; }
      else if (beat === 1) { sel = '.lf-id--target'; tag = 'copy'; }
      else if (beat === 2) { sel = subProg < 0.6 ? '.lf-grid-search-box' : '.lf-run'; tag = subProg < 0.6 ? 'paste' : 'Run'; }
      else if (beat === 3) { sel = '.lf-tab'; tag = 'switch tabs'; }
      else { sel = maxDrill >= 4 ? '.lf-tree-hit' : '.lf-tree-folder-100'; tag = 'drill down'; }
      moveCursor(section, sel, tag);

      // Dots reflect the active beat cumulatively.
      const dots = Array.from(section.querySelectorAll('.cs-legacy-dots .pin-dot'));
      dots.forEach((dt, i) => dt.classList.toggle('active', i <= beat));
    }

    // Position the fake cursor over a target element (relative to .lf-stage).
    function moveCursor(section, sel, tag) {
      const cursor = section.querySelector('.lf-cursor');
      const stage = section.querySelector('.lf-stage');
      if (!cursor || !stage || !sel) return;
      const el = section.querySelector(sel);
      if (!el) { cursor.style.opacity = '0'; return; }
      const sr = stage.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      // Aim a little inside the target's top-left so the arrow tip lands on it.
      const x = (er.left - sr.left) + Math.min(er.width * 0.5, 40);
      const y = (er.top - sr.top) + Math.min(er.height * 0.5, 16);
      cursor.style.opacity = '1';
      cursor.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      const tagEl = cursor.querySelector('.lf-cursor-tag');
      if (tagEl) tagEl.textContent = tag || '';
    }

    // Touch / narrow: the pinned scrub can't run. Instead of a frozen stack,
    // AUTOPLAY the beats on a loop — a "GIF-like" reenactment that tells the
    // story on its own. Only plays while the section is on screen.
    if (!canPinScroll()) {
      const reduce = window.GED && window.GED.reduceMotion;
      if (reduce) {
        // True reduced-motion: keep the static, all-revealed stack (no motion).
        sections.forEach(s => { s.classList.add('lf-static'); paint(s, (+s.getAttribute('data-beats') || 5) - 1, 1); });
        return;
      }
      sections.forEach(section => {
        section.classList.add('lf-auto');
        const n = +section.getAttribute('data-beats') || 5;
        // Per-beat dwell (ms): give search (the 30s latency) a longer beat.
        const dwell = [1600, 1400, 2600, 1800, 2400];
        let raf = null, playing = false, t0 = 0, beat = 0;
        function frame(ts) {
          if (!t0) t0 = ts;
          const d = dwell[beat] || 1800;
          const sp = Math.min((ts - t0) / d, 1);
          paint(section, beat, sp);
          if (sp >= 1) {
            beat++; t0 = ts;
            if (beat >= n) {              // brief hold on the final frame, then loop
              beat = 0; t0 = ts + 900;
            }
          }
          if (playing) raf = requestAnimationFrame(frame);
        }
        function play() { if (playing) return; playing = true; t0 = 0; beat = 0; raf = requestAnimationFrame(frame); }
        function stop() { playing = false; if (raf) cancelAnimationFrame(raf); }
        paint(section, 0, 0);
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(function (es) {
            es.forEach(function (e) { if (e.isIntersecting) play(); else stop(); });
          }, { threshold: 0.35 });
          io.observe(section);
        } else { play(); }
      });
      return;
    }

    document.documentElement.classList.add('pin-on');
    const legacies = [];
    sections.forEach(section => {
      const n = +section.getAttribute('data-beats') || 5;
      const track = document.createElement('div');
      track.className = 'pin-track';
      section.parentNode.insertBefore(track, section);
      track.appendChild(section);
      section.classList.add('pin-stage');
      const perBeat = 0.85, leadOut = 0.4;   // scroll room per beat
      track.style.height = ((n * perBeat + leadOut) * 100) + 'vh';
      paint(section, 0, 0);
      legacies.push({ track, section, n, perBeat, leadOut });
    });

    const onScroll = () => {
      const vh = window.innerHeight;
      for (const L of legacies) {
        const rect = L.track.getBoundingClientRect();
        const total = L.track.offsetHeight - vh;
        const scrolled = Math.min(Math.max(-rect.top, 0), total);
        const prog = total > 0 ? scrolled / total : 0;         // 0..1 whole track
        const beatsFraction = (L.n * L.perBeat) / (L.n * L.perBeat + L.leadOut);
        const bp = Math.min(prog / beatsFraction, 1) * L.n;    // 0..n
        const beat = Math.min(L.n - 1, Math.floor(bp + 1e-6));
        const subProg = Math.min(Math.max(bp - beat, 0), 1);   // 0..1 within beat
        paint(L.section, beat, subProg);
      }
    };
    const scroll = window.GED && window.GED.scroll;
    if (scroll && scroll.onScroll) scroll.onScroll(onScroll); else window.addEventListener('scroll', onScroll, { passive: true });
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
      // Accordion sections handle their own touch UI — skip the arrow/step nav.
      if (section.hasAttribute('data-accordion')) return;
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
