/* ══════════════════════════════════════════════════════════════
   GREAT EAGLE DESIGNS — Shared sticky search header + overlay menu
   Self-injects the header pill + full-screen overlay, then wires all
   behaviour. Works on the landing page and every case-study page.

   Path-aware: pages under /home/ set   window.GED_BASE = '../'   before
   loading this script, so logo + result links resolve correctly.
   Requires GEDSearch (assets/search-data.js) to be loaded first.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var BASE = window.GED_BASE || '';               // '' at root, '../' under /home/
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* result-link hrefs point at case-study pages; prefix with BASE so they
     work from any page depth. Records that already point elsewhere (mailto,
     tel, http, ../) are left untouched. */
  function fixHref(href) {
    if (!href) return href;
    if (/^(mailto:|tel:|https?:|\.\.\/|#)/.test(href)) return href;
    return BASE + href;
  }

  /* ── Inject markup once ──────────────────────────────────────── */
  if (!document.getElementById('gedOverlay')) {
    var logo = BASE + 'assets/logo/greateagledesigns.png';
    var home = BASE + 'index.html';
    var header = document.createElement('header');
    header.className = 'ged-header glass liquid-glass';
    header.id = 'gedHeader';
    header.innerHTML =
      '<a href="' + home + '" class="ged-logo-bubble ged-tip" data-tip="Home" aria-label="Home">' +
        '<img src="' + logo + '" alt="" class="ged-logo" /></a>' +
      '<button class="icon-btn ged-header-theme ged-tip" data-tip="Switch mode" id="themeToggle" aria-label="Switch mode">' +
        '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' +
        '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' +
      '</button>' +
      '<button class="ged-search-btn ged-tip" data-tip="Got questions?" id="gedSearchOpen" aria-label="Open menu">' +
        '<span class="ged-btn-label" id="gedBtnLabel">Menu</span><span class="ged-btn-caret" aria-hidden="true"></span>' +
      '</button>';

    var overlay = document.createElement('div');
    overlay.className = 'ged-overlay';
    overlay.id = 'gedOverlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="ged-backdrop" id="gedBackdrop"></div>' +
      '<div class="ged-panel glass ged-panel--glassy" role="dialog" aria-modal="true" aria-label="Search and navigation">' +
        '<div class="ged-panel-top">' +
          '<a href="' + home + '" class="ged-brand ged-brand--panel ged-tip" data-tip="Home" aria-label="Home">' +
            '<span class="ged-logo-bubble"><img src="' + logo + '" alt="" class="ged-logo" /></span>' +
            '<span class="ged-name">Gaurav <span>Dalbhanjan</span></span></a>' +
          '<div class="ged-search-wrap" id="gedSearchWrap">' +
            '<input type="text" class="ged-search-input" id="gedSearchInput" placeholder="" autocomplete="off" spellcheck="false" />' +
            '<button class="ged-zap" id="gedZap" aria-label="AI-powered search" data-tip="AI-powered search">' +
              '<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z"/></svg></button>' +
            '<button class="ged-close-x ged-tip ged-tip--left" data-tip="Close" id="gedClose" aria-label="Close">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
          '</div>' +
        '</div>' +
        '<div class="ged-panel-body">' +
          '<nav class="ged-sidenav" id="gedSideNav">' +
            '<button class="ged-nav-item" data-view="work">Work</button>' +
            '<button class="ged-nav-item" data-view="about">About</button>' +
            '<button class="ged-nav-item" data-view="blog">Blog</button>' +
            '<button class="ged-nav-item" data-view="contact">Contact</button>' +
          '</nav>' +
          '<div class="ged-content" id="gedContent"></div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(header);
    document.body.appendChild(overlay);
  }

  /* ── Wire behaviour ──────────────────────────────────────────── */
  var overlay = document.getElementById('gedOverlay');
  if (!overlay || typeof GEDSearch === 'undefined') return;
  var openBtn = document.getElementById('gedSearchOpen');
  var closeBtn = document.getElementById('gedClose');
  var backdrop = document.getElementById('gedBackdrop');
  var input = document.getElementById('gedSearchInput');
  var wrap = document.getElementById('gedSearchWrap');
  var zap = document.getElementById('gedZap');
  var content = document.getElementById('gedContent');
  var sideNav = document.getElementById('gedSideNav');
  var panel = overlay.querySelector('.ged-panel');
  var navItems = Array.prototype.slice.call(sideNav.querySelectorAll('.ged-nav-item'));
  var aiOn = true, currentView = 'work';   // AI search ON by default

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#%&*';
  function scrambleAll(root) {
    /* Instant load — no scramble/typewriter animation (text is already in the
       node). Kept as a no-op so existing call sites don't break. */
    return;
  }

  var ICONS = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 11 11 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11 11 0 0 0 .56 3.5 1 1 0 0 1-.25 1z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21H19v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.48v-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.9 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.48A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/></svg>'
  };

  function sc(text) { var t = esc(text); return ' data-scramble="' + t + '">' + t; }
  function chipRow(chips) {
    if (!chips || !chips.length) return '';
    return '<div class="ged-chips">' + chips.map(function (c) { return '<span class="ged-chip"' + sc(c) + '</span>'; }).join('') + '</div>';
  }
  function projectCard(r) {
    var href = r.href ? fixHref(r.href) : '';
    var tag = href ? 'a' : 'div', h = href ? ' href="' + href + '"' : '';
    return '<' + tag + ' class="ged-card"' + h + '><h4' + sc(r.title) + '</h4>' +
      (r.desc ? '<p' + sc(r.desc) + '</p>' : '') + chipRow(r.chips) + '</' + tag + '>';
  }
  function twoCols(records, heading) {
    var left = [], right = [];
    records.forEach(function (r, i) { (i % 2 === 0 ? left : right).push(r); });
    function col(arr) {
      return '<div class="ged-col">' + (heading ? '<div class="ged-heading">' + heading + '</div>' : '') +
        arr.map(projectCard).join('') + '</div>';
    }
    return '<div class="ged-cols">' + col(left) + col(right) + '</div>';
  }
  /* Rich project card (Figma 393-8554): image window on top (full, no crop),
     title, categories line, short summary, one accent metric pill, tag chips. */
  function richProjectCard(r) {
    var href = r.href ? fixHref(r.href) : '';
    var tag = href ? 'a' : 'div', h = href ? ' href="' + href + '"' : '';
    var img = r.img ? '<div class="ged-pc-media"><img src="' + fixHref(r.img) + '" alt="" loading="lazy" /></div>' : '';
    var cats = (r.cats && r.cats.length) ? '<div class="ged-pc-cats">' + esc(r.cats.join(' \u00b7 ')) + '</div>' : '';
    var summary = r.desc ? '<p class="ged-pc-summary">' + esc(r.desc) + '</p>' : '';
    var metric = r.metric ? '<div class="ged-pc-metric">' + esc(r.metric) + '</div>' : '';
    var tags = (r.cats && r.cats.length) ?
      '<div class="ged-pc-tags">' + r.cats.map(function (c) { return '<span class="ged-pc-tag">' + esc(c) + '</span>'; }).join('') + '</div>' : '';
    return '<' + tag + ' class="ged-pc"' + h + '>' + img +
      '<div class="ged-pc-body">' +
        '<h4 class="ged-pc-title">' + esc(r.title) + '</h4>' +
        cats + summary + metric + tags +
      '</div></' + tag + '>';
  }
  function renderWork(records) {
    var recs = records || GEDSearch.all('work');
    if (!recs.length) return '<div class="ged-empty">No projects match that.</div>';
    // Rich image cards laid out in the same two-column grid as before.
    return '<div class="ged-heading">Projects</div>' +
      '<div class="ged-pc-grid">' + recs.map(richProjectCard).join('') + '</div>';
  }
  function renderAbout(records) {
    var recs = records || GEDSearch.all('about');
    if (!recs.length) return '<div class="ged-empty">Nothing here matches that.</div>';
    return '<div class="ged-view-label">About Gaurav</div>' + twoCols(recs, '');
  }
  function renderBlog(records) {
    var recs = records || GEDSearch.all('blog');
    if (!recs.length) return '<div class="ged-empty">No posts match that.</div>';
    return '<div class="ged-view-label">Blog — <em>Design perspectives, research notes, and the occasional deep dive.</em></div>' +
      '<div class="ged-cols"><div class="ged-col">' + recs.map(projectCard).join('') + '</div><div class="ged-col"></div></div>';
  }
  function renderContact(records) {
    var recs = records || GEDSearch.all('contact');
    var lines = recs.filter(function (r) { return r.kind === 'line'; });
    var infos = recs.filter(function (r) { return r.kind === 'info'; });
    var linesHtml = lines.map(function (r) {
      var ext = /^https?:/.test(r.href) ? ' target="_blank" rel="noopener noreferrer"' : '';
      return '<a class="ged-line" href="' + r.href + '"' + ext + '>' + (ICONS[r.icon] || '') + esc(r.title) + '</a>';
    }).join('');
    var infoHtml = infos.map(function (r) {
      return '<div class="ged-card"><h4>' + esc(r.title) + '</h4><p style="margin:0">' + esc(r.desc) + '</p></div>';
    }).join('');
    var gmail = "https://mail.google.com/mail/?view=cm&fs=1&to=gaurav.dalbhanjan@gmail.com&su=Let's%20talk";
    return '<h3 class="ged-contact-title">Let\'s Create <span>Possibilities!</span></h3>' +
      '<div class="ged-cols">' +
        '<div class="ged-col">' +
          '<div class="ged-card"><h4>Lines</h4>' +
          '<div style="display:flex;flex-wrap:wrap;margin-top:6px">' + linesHtml + '</div></div>' +
          '<div class="ged-card"><h4>Contact</h4>' +
            '<p style="margin:0 0 12px">Open to work &middot; Seattle, WA &middot; Mon\u2013Fri, 8am\u20136pm PT.</p>' +
            '<div style="display:flex;flex-wrap:wrap">' +
              '<a class="ged-line" href="' + gmail + '" target="_blank" rel="noopener noreferrer">' + ICONS.mail + 'Email me</a>' +
              '<a class="ged-line" href="tel:+17373289917">' + ICONS.phone + 'Call</a>' +
            '</div></div>' +
        '</div>' +
        '<div class="ged-col">' + infoHtml + '</div>' +
      '</div>';
  }
  var RENDER = { work: renderWork, about: renderAbout, blog: renderBlog, contact: renderContact };

  function setView(view, records) {
    currentView = view;
    navItems.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === view); });
    content.innerHTML = RENDER[view](records || null);
    content.scrollTop = 0;
    scrambleAll(content);
  }
  /* Light inline markup: **bold** → <strong>. */
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
  /* Prose → bullet points when it reads as a list (sentence-per-point). */
  function answerBody(text) {
    if (!text) return '';
    var parts = text.split(/(?<=[.!?])\s+(?=[A-Z0-9"'])/).map(function (s) { return s.trim(); }).filter(Boolean);
    if (parts.length >= 3) {
      var lead = parts.shift();
      return '<p>' + rich(lead) + '</p><ul class="ged-answer-list">' +
        parts.map(function (p) { return '<li>' + rich(p) + '</li>'; }).join('') + '</ul>';
    }
    return '<p>' + rich(text) + '</p>';
  }
  /* Synthesized AI answer card (shown when the zap AI-search is on). */
  function answerCard(ans, q) {
    var chips = (ans.chips || []).map(function (c) { return '<span class="ged-chip">' + esc(c) + '</span>'; }).join('');
    return '<div class="ged-answer">' +
      '<div class="ged-answer-head"><span class="ged-answer-badge">\u26A1 AI answer</span>' +
        '<span class="ged-answer-q">' + esc(q) + '</span></div>' +
      '<h4>' + rich(ans.title) + '</h4>' + answerBody(ans.answer) +
      (chips ? '<div class="ged-chips" style="margin-top:12px">' + chips + '</div>' : '') +
    '</div>';
  }
  /* Relevant project image cards beneath the AI answer (Google + AI feel). */
  function answerCards(ids) {
    if (!ids || !ids.length || typeof GEDSearch === 'undefined') return '';
    var recs = ids.map(function (id) {
      return GEDSearch.RECORDS.filter(function (r) { return r.id === id; })[0];
    }).filter(Boolean);
    if (!recs.length) return '';
    return '<div class="ged-answer-cards">' + recs.map(richProjectCard).join('') + '</div>';
  }
  /* Categorized results — matched records grouped by section, bold names + bullets. */
  var CAT_LABELS = { work: 'Projects', about: 'About Gaurav', blog: 'Writing', contact: 'Get in touch' };
  var CAT_ORDER = ['work', 'about', 'blog', 'contact'];
  function categorizedResults(grouped) {
    if (!grouped) return '';
    var blocks = CAT_ORDER.filter(function (c) { return grouped[c] && grouped[c].length; }).map(function (c) {
      var rows = grouped[c].map(function (r) {
        var line = r.desc || (r.chips ? r.chips.join(' \u00b7 ') : '');
        var href = r.href ? fixHref(r.href) : '';
        var tag = href ? 'a' : 'div', h = href ? ' href="' + href + '"' : '';
        return '<li class="ged-res-item"><' + tag + ' class="ged-res-link"' + h + '>' +
          '<strong>' + esc(r.title) + '</strong>' + (line ? '<span>' + esc(line) + '</span>' : '') +
          '</' + tag + '></li>';
      }).join('');
      return '<div class="ged-res-group"><div class="ged-res-cat">' + (CAT_LABELS[c] || c) + '</div>' +
        '<ul class="ged-res-list">' + rows + '</ul></div>';
    }).join('');
    return blocks ? '<div class="ged-results-cats">' + blocks + '</div>' : '';
  }
  /* Friendly empty state with clickable suggestion chips. */
  var SUGGESTIONS = ['Who is Gaurav?', 'Design philosophy', 'Tell me about OPEX', 'Can he do hardware?', 'What\u2019s your impact?', 'Design systems'];
  function emptyWithSuggestions() {
    var chips = SUGGESTIONS.map(function (s) {
      return '<button class="ged-chip ged-suggest" data-suggest="' + esc(s) + '">' + esc(s) + '</button>';
    }).join('');
    return '<div class="ged-empty">' +
      '<p>Woah! That\u2019s new \u2014 I\u2019m still learning and trying to get better. Why don\u2019t you try one of these:</p>' +
      '<div class="ged-suggest-row">' + chips + '</div>' +
    '</div>';
  }
  function runSearch() {
    var q = input.value.trim();
    if (!q) { setView(currentView); return; }
    var res = GEDSearch.query(q);
    // AI mode → lead with a synthesized answer, then the matching results.
    if (aiOn) {
      var ans = GEDSearch.answer(q);
      if (!ans && res.isEmpty) {
        content.innerHTML = emptyWithSuggestions();
        return;
      }
      var view = res.isEmpty ? 'work' : res.best;
      currentView = view;
      navItems.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === view); });
      content.innerHTML = (ans ? answerCard(ans, q) : '') +
        (ans ? answerCards(ans.cards) : '') +
        categorizedResults(res.grouped);
      content.scrollTop = 0;
      return;
    }
    if (res.isEmpty) { content.innerHTML = emptyWithSuggestions(); return; }
    setView(res.best, res.grouped[res.best]);
  }

  var savedScrollY = 0;
  function open(view) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    setAI(true);                              // AI on by default → border effect right away
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = (-savedScrollY) + 'px';
    document.documentElement.classList.add('ged-lock');
    document.body.classList.add('ged-lock');
    panel.classList.remove('expand');
    // Start the height (+body) early so the two overlap into one continuous flow.
    var delay = reduceMotion ? 0 : 120;
    setTimeout(function () { panel.classList.add('expand'); setView(view || 'work'); }, delay);
    setTimeout(function () { input.focus(); }, (reduceMotion ? 0 : 900) + 60);
    phStart();
  }
  function close() {
    phStop();
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    panel.classList.remove('expand');
    document.documentElement.classList.remove('ged-lock');
    document.body.classList.remove('ged-lock');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
    input.value = '';
    setAI(true);                              // keep AI on for next open
  }
  function setAI(on) {
    aiOn = on;
    wrap.classList.toggle('ai-on', on);
    zap.setAttribute('data-tip', on ? 'AI search on — ask a question' : 'AI-powered search');
  }

  openBtn.addEventListener('click', function () { open('work'); });

  /* ── Menu button label cycle: types Chat → Search → Menu with a visible
     caret, holds 5s, backspaces, retypes the next. 2s after a label finishes
     typing, a light "shine" sweeps across the button edge. ── */
  (function () {
    var labelEl = document.getElementById('gedBtnLabel');
    if (!labelEl || reduceMotion) return;
    // Guard: the landing page ships its OWN inline copy of this cycler; don't
    // run a second one on the same button (that double-types "SearchMenu").
    if (openBtn.dataset.labelCycle) return;
    openBtn.dataset.labelCycle = '1';
    var labels = ['Chat', 'Search', 'Menu'];
    var li = 0, timers = [];
    function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
    function shine() {
      openBtn.classList.remove('ged-shine');
      // reflow so the animation can retrigger
      void openBtn.offsetWidth;
      openBtn.classList.add('ged-shine');
    }
    function type(text, pos) {
      openBtn.classList.remove('ged-shine');
      if (pos > text.length) {
        later(shine, 2000);                 // shine 2s after the label lands
        later(function () { erase(text, text.length); }, 5000);  // hold 5s
        return;
      }
      labelEl.textContent = text.slice(0, pos);
      later(function () { type(text, pos + 1); }, 90);
    }
    function erase(text, pos) {
      openBtn.classList.remove('ged-shine');
      if (pos < 0) { li = (li + 1) % labels.length; later(function () { type(labels[li], 0); }, 220); return; }
      labelEl.textContent = text.slice(0, pos);
      later(function () { erase(text, pos - 1); }, 45);
    }
    // Start from the current "Menu" label already shown → begin the cycle.
    labelEl.textContent = '';
    later(function () { type(labels[li], 0); }, 400);
  })();

  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
  zap.addEventListener('click', function () { setAI(!aiOn); input.focus(); if (input.value.trim()) runSearch(); });
  navItems.forEach(function (b) { b.addEventListener('click', function () { input.value = ''; setView(b.getAttribute('data-view')); }); });
  var deb;
  input.addEventListener('input', function () { clearTimeout(deb); deb = setTimeout(runSearch, 160); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { clearTimeout(deb); runSearch(); } });
  /* Clicking a suggestion chip fills the input and triggers a search. */
  content.addEventListener('click', function (e) {
    var btn = e.target.closest('.ged-suggest');
    if (!btn) return;
    input.value = btn.getAttribute('data-suggest');
    clearTimeout(deb);
    runSearch();
    input.focus();
  });

  /* ── Typewriter placeholder: rotates phrases, types/erases letter by letter.
     Pauses while the user has text in the input; restarts on clear/open. ── */
  var phPhrases = ['Ask me anything', 'What did Gaurav design?', 'What tools is Gaurav familiar with?'];
  var phIdx = 0, phTimer = null;
  function phType(text, pos, cb) {
    if (!overlay.classList.contains('open') || input.value) { phTimer = null; return; }
    if (pos > text.length) { phTimer = setTimeout(function () { phErase(text, text.length, cb); }, 2000); return; }
    input.placeholder = text.slice(0, pos);
    phTimer = setTimeout(function () { phType(text, pos + 1, cb); }, 55);
  }
  function phErase(text, pos, cb) {
    if (!overlay.classList.contains('open') || input.value) { phTimer = null; return; }
    if (pos < 0) { cb(); return; }
    input.placeholder = text.slice(0, pos);
    phTimer = setTimeout(function () { phErase(text, pos - 1, cb); }, 30);
  }
  function phNext() {
    phType(phPhrases[phIdx], 0, function () {
      phIdx = (phIdx + 1) % phPhrases.length;
      phTimer = setTimeout(phNext, 300);
    });
  }
  function phStart() { phStop(); phIdx = 0; input.placeholder = ''; phTimer = setTimeout(phNext, 600); }
  function phStop() { if (phTimer) { clearTimeout(phTimer); phTimer = null; } input.placeholder = ''; }
  // Resume the cycle when the user clears the input (empty → restart).
  input.addEventListener('input', function () { if (!input.value && !phTimer) phStart(); });

  /* Theme toggle. On case-study pages there are TWO #themeToggle elements —
     the hidden legacy <nav> button and this injected header button — so a
     global getElementById would resolve to the hidden one and the visible
     toggle would do nothing. Query WITHIN the injected header (and fall back
     to any others) so the real, visible button is always wired. */
  function toggleTheme() {
    var htmlEl = document.documentElement;
    var next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    if (typeof buildLiquidGlass === 'function') { try { buildLiquidGlass(); } catch (e) {} }
    if (window.GED && typeof window.GED.buildLiquidGlass === 'function') { try { window.GED.buildLiquidGlass(); } catch (e) {} }
  }
  var headerThemeBtn = header.querySelector('#themeToggle, .ged-header-theme');
  if (headerThemeBtn) headerThemeBtn.addEventListener('click', toggleTheme);
})();
