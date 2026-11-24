/* ══════════════════════════════════════════════════════════════
   GREAT EAGLE DESIGNS — Microsoft Clarity, cookie-free mode
   ────────────────────────────────────────────────────────────
   No consent banner. Clarity loads for every visitor and is told,
   through its Consent API v2, that cookie storage is DENIED. Per
   Microsoft's docs, Clarity then runs in no-consent mode: it sets
   no cookies (and deletes any it set earlier), assigns a unique ID
   per page view, and still records sessions, clicks and heatmaps.
   It cannot link one visitor across pages or return visits.
   Docs: learn.microsoft.com/clarity/setup-and-installation/clarity-consent-api-v2
   Also set Clarity → Settings → Setup → Cookies: OFF in the dashboard.
   Vercel Web Analytics (cookieless) is loaded separately on each page.
   (File keeps its old name because every page already loads it.)
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var CLARITY_ID = 'yinapwzkcu';
  if (window.__gedClarityLoaded) return;
  window.__gedClarityLoaded = true;

  // The old banner stored the visitor's choice here; it is no longer used.
  try { localStorage.removeItem('ged:consent'); } catch (e) {}

  // Official Clarity loader (queues calls until the tag script arrives).
  (function (c, l, a, r, i, t, y) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
    y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);

  // Cookie-free: deny ad and analytics storage for every visitor.
  window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' });
})();
