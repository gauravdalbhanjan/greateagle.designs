/* ══════════════════════════════════════════════════════════════
   GREAT EAGLE DESIGNS — Contact form + "Book a session" scheduler
   ────────────────────────────────────────────────────────────
   Plain JS, no framework. Both open in a native <dialog> pop-up.

   CONTACT  Native form that posts to the owner's Google Form
            (formResponse endpoint). No iframe, no Google UI.
   BOOKING  30-minute slots. Availability comes from /api/availability,
            which returns ONLY busy start/end times (Google Calendar
            free/busy). Event titles and details never reach the browser.
            Booking goes to /api/book, which re-checks the slot and sends
            a Google Calendar invite with a Meet link.

   Open from markup:  <a href="…" data-open="contact">  /  data-open="booking"
   Open from JS:      GED.openContact()  /  GED.openBooking()
   Inline contact:    <div data-contact-inline></div>  (contact page)
   Footers get a "Book a session" link added automatically.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__gedConnect) return;
  window.__gedConnect = true;

  /* ── Config ── */
  var FORM = {
    action: 'https://docs.google.com/forms/d/e/1FAIpQLSfOhmnRTQPWCJD1Ap2Tc6l4QF_egXtNlvplqjMkVk4ZcobOHg/formResponse',
    name: 'entry.489847802',      // "Your name" (optional)
    email: 'entry.1685473788',    // "Your email" (required)
    message: 'entry.1010457726'   // "Type your message" (required)
  };
  // Fallback schedule, used only by the local demo. The live values come
  // from /api/availability so the server stays the source of truth.
  var DEMO_CFG = { tz: 'America/Los_Angeles', days: [1, 2, 3, 4, 5], startHour: 8, endHour: 18, slotMinutes: 30, minNoticeHours: 12, horizonDays: 14 };
  var MAX_MSG = 2000;

  var script = document.currentScript;
  var BASE = (script && script.src) ? script.src.replace(/assets\/connect\.js.*$/, '') : '/';
  var IS_LOCAL = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);

  // Load the stylesheet once.
  (function () {
    var l = document.createElement('link');
    l.rel = 'stylesheet'; l.href = BASE + 'assets/connect.css';
    document.head.appendChild(l);
  })();

  var ICON = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ── Dialog shell (native <dialog>: focus trap, Esc, backdrop) ── */
  function makeDialog(id, label) {
    var d = document.getElementById(id);
    if (d) return d;
    d = el('<dialog class="gc-dialog" id="' + id + '" aria-label="' + esc(label) + '">' +
      '<div class="gc-panel"><button type="button" class="gc-x" aria-label="Close">' + ICON.x + '</button>' +
      '<div class="gc-body"></div></div></dialog>');
    document.body.appendChild(d);
    d.querySelector('.gc-x').addEventListener('click', function () { d.close(); });
    // Click on the backdrop (outside the panel) closes.
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () {
      var h = document.documentElement;
      h.classList.remove('gc-lock');
      if (d._addedLock) { h.classList.remove('ged-lock'); d._addedLock = false; }
      if (d._return) { try { d._return.focus(); } catch (e) {} }
    });
    return d;
  }
  function openDialog(d, opener) {
    d._return = opener || document.activeElement;
    var h = document.documentElement;
    h.classList.add('gc-lock');
    // site.js eases the wheel into page scroll unless <html> has ged-lock.
    // Add it while a pop-up is open (only remove it later if we added it).
    if (!h.classList.contains('ged-lock')) { h.classList.add('ged-lock'); d._addedLock = true; }
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
  }

  function clearOnInput(form) {
    form.addEventListener('input', function (e) {
      var f = e.target; if (f.getAttribute('aria-invalid') !== 'true') return;
      f.setAttribute('aria-invalid', 'false');
      var p = document.getElementById((f.getAttribute('aria-describedby') || '').split(' ')[0]); if (p) p.textContent = '';
    });
  }

  /* ══════════════════ CONTACT ══════════════════ */
  function contactFormHTML(idp) {
    return '<form class="gc-form" novalidate>' +
      '<div class="gc-field"><label for="' + idp + '-name">Your name <span class="gc-opt">(optional)</span></label>' +
        '<input id="' + idp + '-name" name="name" type="text" autocomplete="name" maxlength="80" /></div>' +
      '<div class="gc-field"><label for="' + idp + '-email">Your email</label>' +
        '<input id="' + idp + '-email" name="email" type="email" autocomplete="email" maxlength="120" required aria-describedby="' + idp + '-email-err" />' +
        '<p class="gc-err" id="' + idp + '-email-err" aria-live="polite"></p></div>' +
      '<div class="gc-field"><label for="' + idp + '-msg">Your message</label>' +
        '<textarea id="' + idp + '-msg" name="message" rows="5" maxlength="' + MAX_MSG + '" required aria-describedby="' + idp + '-msg-err ' + idp + '-msg-count"></textarea>' +
        '<div class="gc-row"><p class="gc-err" id="' + idp + '-msg-err" aria-live="polite"></p><span class="gc-count" id="' + idp + '-msg-count">0 / ' + MAX_MSG + '</span></div></div>' +
      // Honeypot: hidden from people and assistive tech; bots fill it.
      '<div class="gc-hp" aria-hidden="true"><label>Leave empty<input name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>' +
      '<p class="gc-status" role="status" aria-live="polite"></p>' +
      '<button type="submit" class="gc-btn gc-btn--primary">Send message</button>' +
      '<p class="gc-fine">Sent through Google Forms. Your details are used only to reply to you.</p>' +
    '</form>';
  }
  function wireContact(form, onDone) {
    var email = form.querySelector('[name="email"]'), msg = form.querySelector('[name="message"]');
    var count = form.querySelector('.gc-count'), status = form.querySelector('.gc-status'), btn = form.querySelector('button[type="submit"]');
    msg.addEventListener('input', function () { count.textContent = msg.value.length + ' / ' + MAX_MSG; });
    clearOnInput(form);
    function err(input, text) {
      var p = document.getElementById(input.getAttribute('aria-describedby').split(' ')[0]);
      p.textContent = text || ''; input.setAttribute('aria-invalid', text ? 'true' : 'false');
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      if (!EMAIL_RE.test(email.value.trim())) { err(email, 'Enter a valid email so I can reply.'); ok = false; } else err(email, '');
      if (!msg.value.trim()) { err(msg, 'Write a short message.'); ok = false; } else err(msg, '');
      if (!ok) { (form.querySelector('[aria-invalid="true"]') || email).focus(); return; }
      if (form.elements['website'].value) { done(); return; }             // bot: pretend success, send nothing
      btn.disabled = true; btn.textContent = 'Sending…'; status.textContent = '';
      var body = new URLSearchParams();
      body.append(FORM.name, form.elements['name'].value.trim());
      body.append(FORM.email, email.value.trim());
      body.append(FORM.message, msg.value.trim());
      // Google Forms has no CORS headers: no-cors gives an opaque response.
      // A resolved fetch means the request reached Google.
      fetch(FORM.action, { method: 'POST', mode: 'no-cors', body: body })
        .then(done)
        .catch(function () {
          btn.disabled = false; btn.textContent = 'Send message';
          status.textContent = 'Couldn\u2019t send. Check your connection and try again.';
          status.classList.add('is-error');
        });
      function done() {
        var to = esc(email.value.trim());
        form.outerHTML = '<div class="gc-done" tabindex="-1">' + '<span class="gc-done-ico">' + ICON.check + '</span>' +
          '<h3>Message sent</h3><p>Thanks. I\u2019ll reply to <strong>' + to + '</strong>.</p></div>';
        if (onDone) onDone();
      }
    });
  }
  var contactN = 0;
  function openContact(opener) {
    var d = makeDialog('gcContact', 'Contact');
    var body = d.querySelector('.gc-body');
    var idp = 'gcc' + (++contactN);
    body.innerHTML = '<p class="gc-eyebrow">Contact</p><h2 class="gc-title">Let\u2019s talk</h2>' +
      '<p class="gc-lead">Send a message and I\u2019ll get back to you. Prefer a call? ' +
      '<button type="button" class="gc-link" data-open="booking">Book a session</button>.</p>' + contactFormHTML(idp);
    wireContact(body.querySelector('form'), function () { var x = body.querySelector('.gc-done'); if (x) x.focus(); });
    openDialog(d, opener);
    var first = body.querySelector('input[name="name"]'); if (first) first.focus();
  }

  /* ══════════════════ BOOKING ══════════════════ */
  // Time-zone helpers (no libraries): offset of `tz` at instant `date`, in minutes.
  function tzOffset(date, tz) {
    var p = {}; new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    return (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second) - date.getTime()) / 60000;
  }
  function zoned(y, m, d, h, mi, tz) {   // wall-clock time in tz → Date
    var guess = Date.UTC(y, m, d, h, mi), t = guess - tzOffset(new Date(guess), tz) * 60000;
    var o2 = tzOffset(new Date(t), tz); return new Date(guess - o2 * 60000);
  }
  function ymdIn(date, tz) {
    var p = {}; new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    return { y: +p.year, m: +p.month - 1, d: +p.day };
  }
  // All candidate slots inside working hours, as { start, end } Dates.
  function buildSlots(cfg, now) {
    var out = [], today = ymdIn(now, cfg.tz), earliest = now.getTime() + cfg.minNoticeHours * 3600000;
    for (var i = 0; i <= cfg.horizonDays; i++) {
      var day = new Date(Date.UTC(today.y, today.m, today.d + i));
      if (cfg.days.indexOf(day.getUTCDay()) < 0) continue;
      for (var mins = cfg.startHour * 60; mins + cfg.slotMinutes <= cfg.endHour * 60; mins += cfg.slotMinutes) {
        var s = zoned(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), Math.floor(mins / 60), mins % 60, cfg.tz);
        out.push({ start: s, end: new Date(s.getTime() + cfg.slotMinutes * 60000), past: s.getTime() < earliest });
      }
    }
    return out;
  }
  function overlaps(slot, busy) {
    for (var i = 0; i < busy.length; i++) if (slot.start < busy[i].end && slot.end > busy[i].start) return true;
    return false;
  }
  // Demo-only busy blocks (local preview, no Google connection).
  function demoBusy(cfg, now) {
    var slots = buildSlots(cfg, now), busy = [], seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var i = 0; i < slots.length; i++) if (rnd() < 0.08) { var len = 1 + Math.floor(rnd() * 4); busy.push({ start: slots[i].start, end: new Date(slots[i].start.getTime() + len * cfg.slotMinutes * 60000) }); i += len; }
    return busy;
  }

  var VIEWER_TZ = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
  var fmtTime = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
  var fmtLong = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  function localKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function tzLabel(tz) {
    try { return new Intl.DateTimeFormat(undefined, { timeZone: tz, timeZoneName: 'short' }).formatToParts(new Date()).filter(function (p) { return p.type === 'timeZoneName'; })[0].value; } catch (e) { return tz; }
  }

  function fetchAvailability() {
    var now = new Date();
    return fetch(BASE + 'api/availability', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (j) {
        return { demo: false, cfg: j.config, busy: (j.busy || []).map(function (b) { return { start: new Date(b.start), end: new Date(b.end) }; }), now: now };
      })
      .catch(function (e) {
        if (IS_LOCAL) return { demo: true, cfg: DEMO_CFG, busy: demoBusy(DEMO_CFG, now), now: now };
        throw e;
      });
  }

  function openBooking(opener) {
    var d = makeDialog('gcBooking', 'Book a session');
    d.classList.add('gc-dialog--wide');
    var body = d.querySelector('.gc-body');
    var state = { data: null, days: {}, keys: [], sel: null, month: null, min: null, max: null };
    body.innerHTML = head() + '<div class="gc-sched" aria-busy="true"><p class="gc-loading">Loading availability\u2026</p></div>';
    openDialog(d, opener);

    function head() {
      return '<p class="gc-eyebrow">Book a session</p><h2 class="gc-title">30-minute video call</h2>' +
        '<p class="gc-lead">Pick a day, then a time. Times are in <strong>your time zone (' + esc(tzLabel(VIEWER_TZ)) + ')</strong>.</p>';
    }
    function dayKey(dt) { return dt.getFullYear() + '-' + (dt.getMonth() + 1) + '-' + dt.getDate(); }
    function freeCount(k) { var x = state.days[k]; return x ? x.slots.filter(function (s) { return !s.past && !s.busy; }).length : 0; }

    fetchAvailability().then(function (data) {
      state.data = data;
      buildSlots(data.cfg, data.now).forEach(function (s) {
        s.busy = overlaps(s, data.busy);
        var k = dayKey(s.start);
        (state.days[k] = state.days[k] || { date: new Date(s.start.getFullYear(), s.start.getMonth(), s.start.getDate()), slots: [] }).slots.push(s);
      });
      state.keys = Object.keys(state.days).filter(function (k) { return state.days[k].slots.some(function (s) { return !s.past; }); })
        .sort(function (a, b) { return state.days[a].date - state.days[b].date; });
      if (!state.keys.length) return renderEmpty('No free slots in the next two weeks.');
      state.min = state.days[state.keys[0]].date;
      state.max = state.days[state.keys[state.keys.length - 1]].date;
      var first = state.keys.filter(function (k) { return freeCount(k); })[0];
      if (!first) return renderEmpty('No free slots in the next two weeks.');
      state.sel = first;
      state.month = new Date(state.days[first].date.getFullYear(), state.days[first].date.getMonth(), 1);
      renderShell();
    }).catch(function () { renderEmpty('Online booking isn\u2019t available right now.'); });

    function renderEmpty(msg) {
      body.innerHTML = head() + '<div class="gc-empty"><p>' + esc(msg) + '</p>' +
        '<button type="button" class="gc-btn gc-btn--primary" data-open="contact">Send a message instead</button></div>';
    }

    /* ── Layout: month calendar (left) + day panel (right) ── */
    function renderShell() {
      body.innerHTML = head() +
        (state.data.demo ? '<p class="gc-demo" role="note"><strong>Demo data.</strong> Local preview only: Google Calendar isn\u2019t connected here, so these busy blocks are made up.</p>' : '') +
        '<div class="gc-book"><div class="gc-cal"></div><div class="gc-side"></div></div>';
      renderCalendar(); renderTimes();
    }

    var fmtMonth = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' });
    var fmtWd = new Intl.DateTimeFormat(undefined, { weekday: 'narrow' });
    var fmtWdLong = new Intl.DateTimeFormat(undefined, { weekday: 'long' });
    function renderCalendar(focusKey) {
      var cal = body.querySelector('.gc-cal'), m = state.month;
      var minM = new Date(state.min.getFullYear(), state.min.getMonth(), 1), maxM = new Date(state.max.getFullYear(), state.max.getMonth(), 1);
      var lead = new Date(m.getFullYear(), m.getMonth(), 1).getDay();
      var dim = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
      var todayK = dayKey(new Date());
      var heads = '', cells = '';
      for (var w = 0; w < 7; w++) { var wd = new Date(2024, 0, 7 + w); heads += '<span class="gc-wd" title="' + esc(fmtWdLong.format(wd)) + '" aria-hidden="true">' + esc(fmtWd.format(wd)) + '</span>'; }
      for (var i = 0; i < lead; i++) cells += '<span class="gc-cell" aria-hidden="true"></span>';
      for (var dd = 1; dd <= dim; dd++) {
        var dt = new Date(m.getFullYear(), m.getMonth(), dd), k = dayKey(dt), n = freeCount(k);
        var cls = 'gc-dbtn' + (k === state.sel ? ' is-sel' : '') + (k === todayK ? ' is-today' : '') + (n ? ' is-avail' : '');
        cells += '<span class="gc-cell"><button type="button" class="' + cls + '" data-k="' + k + '"' +
          ' aria-label="' + esc(fmtLong.format(dt)) + (n ? ', ' + n + ' free slot' + (n > 1 ? 's' : '') : ', unavailable') + '"' +
          (k === state.sel ? ' aria-pressed="true"' : ' aria-pressed="false"') +
          (n ? '' : ' disabled') + ' tabindex="' + (k === state.sel ? '0' : '-1') + '">' + dd + '</button></span>';
      }
      cal.innerHTML =
        '<div class="gc-cal-h"><h3 class="gc-cal-t" aria-live="polite">' + esc(fmtMonth.format(m)) + '</h3>' +
          '<button type="button" class="gc-nav" data-m="-1" aria-label="Previous month"' + (m > minM ? '' : ' disabled') + '>' + ICON.back + '</button>' +
          '<button type="button" class="gc-nav" data-m="1" aria-label="Next month"' + (m < maxM ? '' : ' disabled') + '>' + ICON.next + '</button></div>' +
        '<div class="gc-wds">' + heads + '</div>' +
        '<div class="gc-days" role="group" aria-label="' + esc(fmtMonth.format(m)) + '">' + cells + '</div>';
      // If the selected day isn't in this month, let the first available day take focus.
      if (!cal.querySelector('.gc-dbtn[tabindex="0"]')) { var fa = cal.querySelector('.gc-dbtn:not([disabled])'); if (fa) fa.tabIndex = 0; }
      cal.querySelectorAll('.gc-nav').forEach(function (b) {
        b.addEventListener('click', function () { state.month = new Date(m.getFullYear(), m.getMonth() + (+b.dataset.m), 1); renderCalendar(); var n2 = body.querySelector('.gc-nav[data-m="' + b.dataset.m + '"]'); if (n2 && !n2.disabled) n2.focus(); });
      });
      var btns = Array.prototype.slice.call(cal.querySelectorAll('.gc-dbtn'));
      btns.forEach(function (b, idx) {
        b.addEventListener('click', function () { selectDay(b.dataset.k); });
        b.addEventListener('keydown', function (e) {
          var step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
          if (!step) return;
          e.preventDefault();
          for (var j = idx + step; j >= 0 && j < btns.length; j += step) if (!btns[j].disabled) { btns[j].focus(); return; }
        });
      });
      if (focusKey) { var f = cal.querySelector('.gc-dbtn[data-k="' + focusKey + '"]'); if (f) f.focus(); }
    }
    function selectDay(k) { state.sel = k; renderCalendar(k); renderTimes(); }

    /* ── Right panel: times for the selected day (busy shown as generic blocks) ── */
    function renderTimes() {
      var side = body.querySelector('.gc-side'), day = state.days[state.sel];
      var items = [], sl = day.slots, i = 0;
      while (i < sl.length) {
        var s = sl[i];
        if (s.past) { i++; continue; }
        if (s.busy) {
          var j = i; while (j + 1 < sl.length && sl[j + 1].busy && !sl[j + 1].past) j++;
          items.push('<li class="gc-busy" style="--u:' + (j - i + 1) + '"><span>Busy</span><span class="gc-sr"> ' + esc(fmtTime.format(s.start)) + ' to ' + esc(fmtTime.format(sl[j].end)) + '</span></li>');
          i = j + 1;
        } else { items.push('<li><button type="button" class="gc-slot" data-t="' + s.start.getTime() + '">' + esc(fmtTime.format(s.start)) + '</button></li>'); i++; }
      }
      side.innerHTML = '<h3 class="gc-side-h">' + esc(fmtLong.format(day.date)) + '</h3>' +
        '<p class="gc-side-s">' + freeCount(state.sel) + ' free \u00b7 30 minutes each</p>' +
        '<ul class="gc-times" aria-label="Times on ' + esc(fmtLong.format(day.date)) + '">' + items.join('') + '</ul>';
      side.querySelectorAll('.gc-slot').forEach(function (b) { b.addEventListener('click', function () { renderDetails(+b.dataset.t); }); });
    }

    function renderDetails(t) {
      var cfg = state.data.cfg, s = new Date(t), e = new Date(t + cfg.slotMinutes * 60000);
      var when = fmtLong.format(s) + ' \u00b7 ' + fmtTime.format(s) + '\u2013' + fmtTime.format(e);
      var side = body.querySelector('.gc-side');
      side.innerHTML =
        '<div class="gc-pick"><span class="gc-pick-ico">' + ICON.cal + '</span><div><strong>' + esc(when) + '</strong>' +
        '<span>' + esc(tzLabel(VIEWER_TZ)) + ' \u00b7 Google Meet</span></div>' +
        '<button type="button" class="gc-btn gc-btn--ghost gc-change">Change</button></div>' +
        '<form class="gc-form" novalidate>' +
          '<div class="gc-field"><label for="gcb-name">Your name</label><input id="gcb-name" name="name" type="text" autocomplete="name" maxlength="80" required aria-describedby="gcb-name-err" /><p class="gc-err" id="gcb-name-err" aria-live="polite"></p></div>' +
          '<div class="gc-field"><label for="gcb-email">Your email</label><input id="gcb-email" name="email" type="email" autocomplete="email" maxlength="120" required aria-describedby="gcb-email-err" /><p class="gc-err" id="gcb-email-err" aria-live="polite"></p></div>' +
          '<div class="gc-field"><label for="gcb-topic">What would you like to talk about? <span class="gc-opt">(optional)</span></label><textarea id="gcb-topic" name="topic" rows="3" maxlength="500"></textarea></div>' +
          '<div class="gc-hp" aria-hidden="true"><label>Leave empty<input name="website" type="text" tabindex="-1" autocomplete="off" /></label></div>' +
          '<p class="gc-status" role="status" aria-live="polite"></p>' +
          '<button type="submit" class="gc-btn gc-btn--primary">Confirm booking</button>' +
          '<p class="gc-fine">You\u2019ll get a Google Calendar invite with a Meet link at this email.</p>' +
        '</form>';
      side.querySelector('.gc-change').addEventListener('click', function () { renderTimes(); var x = side.querySelector('.gc-slot[data-t="' + t + '"]'); if (x) x.focus(); });
      var form = side.querySelector('form'), status = form.querySelector('.gc-status'), btn = form.querySelector('button[type="submit"]');
      clearOnInput(form);
      form.elements['name'].focus();
      form.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var ok = true;
        function err(input, text) { document.getElementById(input.getAttribute('aria-describedby')).textContent = text || ''; input.setAttribute('aria-invalid', text ? 'true' : 'false'); if (text) ok = false; }
        err(form.elements['name'], form.elements['name'].value.trim() ? '' : 'Add your name.');
        err(form.elements['email'], EMAIL_RE.test(form.elements['email'].value.trim()) ? '' : 'Enter a valid email for the invite.');
        if (!ok) { form.querySelector('[aria-invalid="true"]').focus(); return; }
        if (state.data.demo) { showBooked(form.elements['email'].value.trim(), when, true); return; }
        btn.disabled = true; btn.textContent = 'Booking\u2026'; status.textContent = ''; status.classList.remove('is-error');
        fetch(BASE + 'api/book', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ start: s.toISOString(), name: form.elements['name'].value.trim(), email: form.elements['email'].value.trim(), topic: form.elements['topic'].value.trim(), website: form.elements['website'].value, tz: VIEWER_TZ })
        }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, status: r.status, j: j }; }); })
          .then(function (res) {
            if (res.ok) { showBooked(form.elements['email'].value.trim(), when, false); return; }
            btn.disabled = false; btn.textContent = 'Confirm booking'; status.classList.add('is-error');
            status.textContent = res.status === 409 ? 'That slot was just taken. Please pick another.' : (res.j && res.j.error) || 'Couldn\u2019t book this slot. Please try again.';
          })
          .catch(function () { btn.disabled = false; btn.textContent = 'Confirm booking'; status.classList.add('is-error'); status.textContent = 'Couldn\u2019t reach the booking service. Check your connection and try again.'; });
      });
    }
    function showBooked(email, when, demo) {
      body.innerHTML = '<div class="gc-done" tabindex="-1"><span class="gc-done-ico">' + ICON.check + '</span>' +
        '<h3>' + (demo ? 'Demo: not booked' : 'You\u2019re booked') + '</h3>' +
        '<p><strong>' + esc(when) + '</strong></p>' +
        '<p>' + (demo ? 'In the live site, a Google Calendar invite with a Meet link would go to ' : 'A Google Calendar invite with a Meet link is on its way to ') + '<strong>' + esc(email) + '</strong>.</p></div>';
      body.querySelector('.gc-done').focus();
    }
  }

  /* ── Delegated openers + footer links ── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-open="contact"],[data-open="booking"]');
    if (!t) return;
    e.preventDefault();
    var open = document.querySelector('dialog.gc-dialog[open]');
    if (open) open.close();
    if (t.dataset.open === 'contact') openContact(t); else openBooking(t);
  });

  function addFooterLinks() {
    // Inner pages: <ul class="footer-links"> ; homepage: #footerConnect ul.
    document.querySelectorAll('footer .footer-links, #footerConnect ul').forEach(function (ul) {
      if (ul.querySelector('[data-open="booking"]')) return;
      var li = document.createElement('li');
      li.innerHTML = '<a href="' + BASE + 'home/contact.html#book" data-open="booking">Book a session</a>';
      ul.appendChild(li);
    });
  }
  function mountInline() {
    document.querySelectorAll('[data-contact-inline]').forEach(function (host, i) {
      if (host.querySelector('form')) return;
      host.innerHTML = contactFormHTML('gci' + i);
      wireContact(host.querySelector('form'), function () { var x = host.querySelector('.gc-done'); if (x) x.focus(); });
    });
    if (location.hash === '#book') openBooking();
  }
  window.addEventListener('hashchange', function () { if (location.hash === '#book' && !document.querySelector('#gcBooking[open]')) openBooking(); });
  function start() { addFooterLinks(); mountInline(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.GED = window.GED || {};
  window.GED.openContact = function () { openContact(); };
  window.GED.openBooking = function () { openBooking(); };
})();
