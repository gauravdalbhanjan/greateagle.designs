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
      '<button class="ged-search-btn ged-tip" data-tip="Got questions?" id="gedSearchOpen" aria-label="Open search">Search</button>';

    var overlay = document.createElement('div');
    overlay.className = 'ged-overlay';
    overlay.id = 'gedOverlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="ged-backdrop" id="gedBackdrop"></div>' +
      '<div class="ged-panel glass" role="dialog" aria-modal="true" aria-label="Search and navigation">' +
        '<div class="ged-panel-top">' +
          '<a href="' + home + '" class="ged-brand ged-brand--panel ged-tip" data-tip="Home" aria-label="Home">' +
            '<span class="ged-logo-bubble"><img src="' + logo + '" alt="" class="ged-logo" /></span>' +
            '<span class="ged-name">Gaurav <span>Dalbhanjan</span></span></a>' +
          '<div class="ged-search-wrap" id="gedSearchWrap">' +
            '<input type="text" class="ged-search-input" id="gedSearchInput" placeholder="Search" autocomplete="off" spellcheck="false" />' +
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
  var aiOn = false, currentView = 'work';

  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#%&*';
  function scrambleAll(root) {
    if (reduceMotion) return;
    var els = root.querySelectorAll('[data-scramble]');
    Array.prototype.forEach.call(els, function (el, idx) {
      var finalText = el.getAttribute('data-scramble');
      var len = finalText.length, frame = 0;
      var settleStart = Math.floor(idx * 0.4);
      var perFrame = Math.max(1, Math.ceil(len / 12));
      var totalFrames = settleStart + Math.ceil(len / perFrame) + 2;
      var timer = setInterval(function () {
        var locked = (frame - settleStart) * perFrame, out = '';
        for (var i = 0; i < len; i++) {
          var ch = finalText[i];
          if (ch === ' ' || ch === '\u00a0') { out += ch; continue; }
          out += (i < locked) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        el.textContent = out; frame++;
        if (frame >= totalFrames) { el.textContent = finalText; clearInterval(timer); }
      }, 30);
    });
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
  function renderWork(records) {
    var recs = records || GEDSearch.all('work');
    if (!recs.length) return '<div class="ged-empty">No projects match that.</div>';
    return twoCols(recs, 'Projects');
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
  /* Synthesized AI answer card (shown when the zap AI-search is on). */
  function answerCard(ans, q) {
    var chips = (ans.chips || []).map(function (c) { return '<span class="ged-chip">' + esc(c) + '</span>'; }).join('');
    return '<div class="ged-answer">' +
      '<div class="ged-answer-head"><span class="ged-answer-badge">\u26A1 AI answer</span>' +
        '<span class="ged-answer-q">' + esc(q) + '</span></div>' +
      '<h4>' + esc(ans.title) + '</h4>' +
      '<p>' + esc(ans.answer) + '</p>' +
      (chips ? '<div class="ged-chips" style="margin-top:12px">' + chips + '</div>' : '') +
    '</div>';
  }
  function runSearch() {
    var q = input.value.trim();
    if (!q) { setView(currentView); return; }
    var res = GEDSearch.query(q);
    // AI mode → lead with a synthesized answer, then the matching results.
    if (aiOn) {
      var ans = GEDSearch.answer(q);
      var body = ans ? answerCard(ans, q) : '';
      var view = res.isEmpty ? 'work' : res.best;
      var cards = res.isEmpty ? '' : RENDER[view](res.grouped[view]);
      if (!ans && res.isEmpty) {
        content.innerHTML = '<div class="ged-empty">I couldn\u2019t find that. Try asking about projects, skills, impact, experience, or how to get in touch.</div>';
        return;
      }
      currentView = view;
      navItems.forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-view') === view); });
      content.innerHTML = body + cards;
      content.scrollTop = 0;
      scrambleAll(content);
      return;
    }
    if (res.isEmpty) { content.innerHTML = '<div class="ged-empty">No results for "' + esc(q) + '". Try: projects, dashboard, about, contact, blog…</div>'; return; }
    setView(res.best, res.grouped[res.best]);
  }

  var savedScrollY = 0;
  function open(view) {
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.top = (-savedScrollY) + 'px';
    document.documentElement.classList.add('ged-lock');
    document.body.classList.add('ged-lock');
    panel.classList.remove('expand');
    var delay = reduceMotion ? 0 : 600;
    setTimeout(function () { panel.classList.add('expand'); setView(view || 'work'); }, delay);
    setTimeout(function () { input.focus(); }, delay + 160);
  }
  function close() {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    panel.classList.remove('expand');
    document.documentElement.classList.remove('ged-lock');
    document.body.classList.remove('ged-lock');
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
    input.value = '';
    setAI(false);
  }
  function setAI(on) {
    aiOn = on;
    wrap.classList.toggle('ai-on', on);
    zap.setAttribute('data-tip', on ? 'AI search on — ask a question' : 'AI-powered search');
  }

  openBtn.addEventListener('click', function () { open('work'); });
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
  zap.addEventListener('click', function () { setAI(!aiOn); input.focus(); if (input.value.trim()) runSearch(); });
  navItems.forEach(function (b) { b.addEventListener('click', function () { input.value = ''; setView(b.getAttribute('data-view')); }); });
  var deb;
  input.addEventListener('input', function () { clearTimeout(deb); deb = setTimeout(runSearch, 160); });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { clearTimeout(deb); runSearch(); } });

  /* Theme toggle (the injected header owns #themeToggle). */
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var htmlEl = document.documentElement;
    var next = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();
