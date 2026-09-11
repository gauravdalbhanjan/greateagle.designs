/* ══════════════════════════════════════════════════════════════
   INLINE EDIT MODE (dev only — loaded only when served by edit-server)
   Toggle with the pencil button (bottom-right). Click any text, edit
   inline, click away → the change is saved straight into the source
   file (data/<project>.js or the page's .html) via POST /__save.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // Only activate on the local edit server (port 4444) to avoid shipping.
  if (location.port !== '4444') return;

  var editing = false;

  // Which source file backs this page's dynamic content?
  function dataFile() {
    return (window.CASE_STUDY && window.CASE_STUDY.__file) || null;
  }
  function htmlFile() {
    // e.g. /home/opex-allocation.html  or  /index.html
    var p = location.pathname;
    if (p === '/' || p === '') return 'index.html';
    return p.replace(/^\/+/, '');
  }

  // Text-bearing selectors we allow editing (headings, paragraphs, list items,
  // tags, captions, step titles/bodies, quotes, labels).
  var SEL = [
    'h1', 'h2', 'h3', 'h4', 'p', 'li', 'blockquote', 'cite', 'figcaption',
    '.cs-tag', '.card-tag', '.case-tag', '.company-pill', '.eyebrow-pill',
    '.cs-step-title', '.cs-step-body', '.cs-num', '.m-lbl', '.m-num',
    '.card-title', '.card-desc', '.card-result', '.stat-label',
    '.cs-walk-copy h3', '.cs-walk-copy p', '.idx', '.seg', '.big',
    '.cs-side-v', '.hero-title', '.hero-sub', '.section-title'
  ].join(',');

  function editableEls() {
    var all = Array.prototype.slice.call(document.querySelectorAll(SEL));
    // Only leaf-ish text elements (skip ones that contain other editable blocks).
    return all.filter(function (el) {
      if (el.closest('#editToggle') || el.closest('#editToast')) return false;
      if (!el.textContent.trim()) return false;
      // skip if it has a child that is itself in the selector set (edit the child)
      return !el.querySelector(SEL);
    });
  }

  function post(payload) {
    return fetch('/__save', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.json(); });
  }

  function toast(msg, ok) {
    var t = document.getElementById('editToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'editToast';
      t.style.cssText = 'position:fixed;bottom:76px;right:20px;z-index:100000;font:600 12px system-ui;' +
        'padding:10px 16px;border-radius:100px;color:#fff;backdrop-filter:blur(8px);' +
        'transition:opacity .3s;pointer-events:none;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = ok ? 'rgba(20,150,60,0.9)' : 'rgba(200,40,0,0.92)';
    t.style.opacity = '1';
    clearTimeout(t._h);
    t._h = setTimeout(function () { t.style.opacity = '0'; }, 1800);
  }

  function bind(el) {
    el.dataset.editOrig = el.textContent;
    el.addEventListener('focus', function () { el.dataset.editOrig = el.textContent; });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
      if (e.key === 'Escape') { el.textContent = el.dataset.editOrig; el.blur(); }
    });
    el.addEventListener('blur', function () {
      var oldText = (el.dataset.editOrig || '').trim();
      var newText = el.textContent.trim();
      if (newText === oldText || !newText) { el.textContent = oldText; return; }
      var df = dataFile();
      var payload = df
        ? { target: 'data', dataFile: df, jsonPath: '(text-match)', oldText: oldText, newText: newText }
        : { target: 'html', htmlFile: htmlFile(), oldText: oldText, newText: newText };
      post(payload).then(function (res) {
        if (res.ok) { el.dataset.editOrig = newText; toast('Saved ✓', true); }
        else { toast('Save failed: ' + (res.error || '') , false); }
      }).catch(function () { toast('Server offline — run edit-server.js', false); });
    });
  }

  function setEditing(on) {
    editing = on;
    document.documentElement.classList.toggle('edit-on', on);
    editableEls().forEach(function (el) {
      el.contentEditable = on ? 'true' : 'false';
      el.spellcheck = false;
      if (on && !el._editBound) { bind(el); el._editBound = true; }
    });
    var btn = document.getElementById('editToggle');
    if (btn) btn.classList.toggle('active', on);
    toast(on ? 'Edit mode ON — click any text' : 'Edit mode off', true);
  }

  function buildUI() {
    var btn = document.createElement('button');
    btn.id = 'editToggle';
    btn.title = 'Toggle edit mode';
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:100000;width:48px;height:48px;' +
      'border-radius:50%;border:1px solid rgba(255,255,255,0.15);background:#111;color:#fff;cursor:pointer;' +
      'display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(0,0,0,0.35);';
    btn.addEventListener('click', function () { setEditing(!editing); });
    document.body.appendChild(btn);

    var style = document.createElement('style');
    style.textContent =
      '#editToggle.active{background:#FF2A00;border-color:#FF2A00;}' +
      'html.edit-on [contenteditable="true"]{outline:1px dashed rgba(255,42,0,0.5);outline-offset:3px;border-radius:3px;cursor:text;}' +
      'html.edit-on [contenteditable="true"]:hover{outline-color:#FF2A00;background:rgba(255,42,0,0.06);}' +
      'html.edit-on [contenteditable="true"]:focus{outline:2px solid #FF2A00;background:rgba(255,42,0,0.08);}';
    document.head.appendChild(style);
  }

  // Case-study pages render async; wait a beat, then build UI.
  function init() {
    buildUI();
  }
  if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', function () { setTimeout(init, 400); });
  else setTimeout(init, 400);
})();
