/* ══════════════════════════════════════════════════════════════
   GREAT EAGLE DESIGNS — Cookie / analytics consent
   ────────────────────────────────────────────────────────────
   Microsoft Clarity records sessions and sets cookies, so it must
   NOT run until the visitor consents. This module:
     • loads Clarity immediately if consent was already granted
     • otherwise shows a small banner (Accept / Decline)
     • remembers the choice in localStorage (no cookie itself)
   Vercel Web Analytics is cookieless and is loaded separately; it
   is not gated here.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEY = 'ged:consent';           // 'granted' | 'denied'
  var CLARITY_ID = 'yinapwzkcu';

  function getChoice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setChoice(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  /* The official Clarity loader — only ever called after consent. */
  function loadClarity() {
    if (window.__gedClarityLoaded) return;
    window.__gedClarityLoaded = true;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function buildBanner() {
    var bar = document.createElement('div');
    bar.className = 'ged-consent';
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-live', 'polite');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.innerHTML =
      '<p class="ged-consent-text">We use privacy-first analytics on this site. ' +
      'We\u2019d also like to use <strong>Microsoft Clarity</strong>, which sets cookies and records anonymized usage, ' +
      'to improve your experience. Do you consent?</p>' +
      '<div class="ged-consent-actions">' +
        '<button type="button" class="ged-consent-btn ged-consent-decline">Decline</button>' +
        '<button type="button" class="ged-consent-btn ged-consent-accept">Accept</button>' +
      '</div>';
    document.body.appendChild(bar);
    // Fade/slide in next frame.
    requestAnimationFrame(function () { bar.classList.add('on'); });

    function dismiss() {
      bar.classList.remove('on');
      setTimeout(function () { if (bar.parentNode) bar.parentNode.removeChild(bar); }, 350);
    }
    bar.querySelector('.ged-consent-accept').addEventListener('click', function () {
      setChoice('granted'); dismiss(); loadClarity();
    });
    bar.querySelector('.ged-consent-decline').addEventListener('click', function () {
      setChoice('denied'); dismiss();
    });
  }

  function start() {
    var choice = getChoice();
    if (choice === 'granted') { loadClarity(); return; }   // returning consenter
    if (choice === 'denied') { return; }                    // respect prior decline
    buildBanner();                                          // first visit → ask
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
