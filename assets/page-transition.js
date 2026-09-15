/* ══════════════════════════════════════════════════════════════
   GREAT EAGLE DESIGNS — Immersive project route transition
   ────────────────────────────────────────────────────────────
   Clicking a Selected Work card should feel like one continuous
   push deeper into the screen — never an instant page jump, never
   a flash of the bare destination nav.

   Target ~700ms, in one eased gesture:
     0–280ms   clicked card clones + zooms forward; a frosted-glass
               overlay (blur + warm accent tint) builds; grid dims
     280–350ms peak frost — the handoff point; navigate here
     350–700ms destination content starts slightly small + frosted
               and zooms IN to full size as the frost clears

   Flash-free: the destination is gated hidden from its FIRST paint
   by a tiny inline <head> snippet (adds html.ptx-arriving before
   anything renders). This module then reveals + plays the zoom-in
   once the case study content is actually in the DOM.

   Slow loads hold at the frosted handoff and extend only that hold.
   Fast loads are never slowed. prefers-reduced-motion → instant nav.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HANDOFF_KEY = 'ged:ptx';   // sessionStorage flag between pages
  var COVER_MS = 170;            // card zoom + frost build (matches CSS)
  var PEAK_MS = 30;              // brief fully-frosted hold before nav (~200ms out)

  function isPlainClick(e) {
    return !(e.defaultPrevented || e.button !== 0 ||
      e.metaKey || e.ctrlKey || e.shiftKey || e.altKey);
  }

  /* ─────────────────────────────────────────────────────────────
     OUTGOING — grid page.
     ───────────────────────────────────────────────────────────── */
  function initOutgoing() {
    var grid = document.getElementById('workList');
    if (!grid) return;

    var busy = false;

    grid.addEventListener('click', function (e) {
      var card = e.target.closest && e.target.closest('a.wp-card');
      if (!card || !grid.contains(card)) return;
      if (!isPlainClick(e)) return;

      var href = card.getAttribute('href');
      if (!href || href.charAt(0) === '#' || card.target === '_blank') return;

      // Reduced motion: keep the current instant/direct navigation.
      if (REDUCE) return;

      e.preventDefault();
      if (busy) return;
      busy = true;

      try { sessionStorage.setItem(HANDOFF_KEY, '1'); } catch (err) {}
      zoomAndGo(card, href);
    });
  }

  function zoomAndGo(card, href) {
    var rect = card.getBoundingClientRect();
    var img = card.querySelector('img');

    // Clone the card fixed over its current box so the grid can dim
    // behind it while the clone scales forward from exactly where it sits.
    var clone = document.createElement('div');
    clone.className = 'ptx-clone';
    clone.style.top = rect.top + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';

    if (img) {
      var cImg = document.createElement('img');
      cImg.src = img.currentSrc || img.src;
      cImg.alt = '';
      clone.appendChild(cImg);
    }

    var veil = document.createElement('div');
    veil.className = 'ptx-veil';
    var frost = document.createElement('div');
    frost.className = 'ptx-frost';

    document.body.appendChild(veil);
    document.body.appendChild(clone);
    document.body.appendChild(frost);

    // How far to scale so the card visually rushes toward the viewer and
    // fills the frame. Based on the card's size vs the viewport.
    var scale = Math.max(
      window.innerWidth / Math.max(rect.width, 1),
      window.innerHeight / Math.max(rect.height, 1)
    ) * 1.12;
    if (!isFinite(scale) || scale < 1.1) scale = 1.6;

    // Force layout so the transition animates from the start box.
    /* eslint-disable no-unused-expressions */
    clone.getBoundingClientRect();
    /* eslint-enable no-unused-expressions */

    // Phase 1: push the card forward, dim the grid, build the frost.
    requestAnimationFrame(function () {
      veil.classList.add('ptx-on');
      clone.style.transform = 'scale(' + scale.toFixed(3) + ')';
      clone.style.borderRadius = '0px';
      frost.classList.add('ptx-peak');
    });

    // Phase 2: at peak frost, navigate. The destination page picks up
    // the same forward motion (its content zooms IN to full size).
    setTimeout(function () {
      window.location.href = href;
    }, COVER_MS + PEAK_MS);
  }

  /* ─────────────────────────────────────────────────────────────
     INCOMING — destination page. The inline head snippet has already
     added html.ptx-arriving (body hidden). Reveal + zoom-in once the
     case study content is present.
     ───────────────────────────────────────────────────────────── */
  function initIncoming() {
    var html = document.documentElement;
    if (!html.classList.contains('ptx-arriving')) return;

    if (REDUCE) {
      html.classList.remove('ptx-arriving');
      return;
    }

    // A soft warm wash over the blurred page that fades away with the blur.
    var wash = document.createElement('div');
    wash.className = 'ptx-arrive-wash';
    wash.setAttribute('aria-hidden', 'true');
    function addWash() {
      if (document.body && !wash.parentNode) document.body.appendChild(wash);
    }
    if (document.body) addWash();
    else document.addEventListener('DOMContentLoaded', addWash);

    whenContentReady(function () {
      // Retire scroll-reveal for this arrival so NOTHING rises up from below
      // as the blur clears — the blur-to-focus IS the entrance. Run twice to
      // catch any just-injected (data-driven) content.
      settleAllReveals();
      requestAnimationFrame(settleAllReveals);

      // The page is already painted BLURRED (real content, from first frame).
      // Fade the blur off → it sharpens into focus in place.
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          html.classList.add('ptx-resolve');   // body blur → 0, wash fades
          setTimeout(function () {
            html.classList.remove('ptx-arriving', 'ptx-resolve');
            if (wash.parentNode) wash.parentNode.removeChild(wash);
          }, 300);
        });
      });
    });
  }

  /* Permanently settle scroll-reveal for a transition arrival: mark every
     .reveal as .visible + .ptx-settled so its IntersectionObserver never
     animates a rise-up. This is done for the WHOLE page (not just the first
     viewport) because on data-driven case studies the content lives inside
     the scaled #cs-root — a CSS transform on that ancestor throws off the
     observer's viewport math, so elements it "sees" later would slide up
     right as the frost clears. Since the portal zoom IS the entrance, we
     retire scroll-reveal entirely for this one arrival. (Normal page loads
     are untouched — this only runs when arriving via the transition.) */
  function settleAllReveals() {
    var sel = '.reveal, [class*="reveal-delay"]';
    var nodes = document.querySelectorAll(sel);
    Array.prototype.forEach.call(nodes, function (el) {
      el.classList.add('ptx-settled', 'visible');
    });
  }

  /* Resolve only once the destination content is actually painted, so the
     zoom-in reveals real content — never a half-built page. Slow renders
     just hold the frost longer; fast ones resolve as soon as they can. */
  function whenContentReady(cb) {
    var done = false;
    function finish() { if (!done) { done = true; cb(); } }

    // Hold the blur until every image in the FIRST viewport has decoded, so
    // the blur clears on a fully-painted first screen — no region (like the
    // before/after compare window) popping in after the blur is gone. A
    // short cap means a slow image extends the frost only briefly.
    function awaitAboveFoldMedia() {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var margin = vh * 0.25;
      var imgs = Array.prototype.filter.call(
        document.querySelectorAll('img'),
        function (img) {
          if (img.complete) return false;
          var top = img.getBoundingClientRect().top;
          return top < vh + margin;      // only what will be visible on arrival
        }
      );
      if (!imgs.length) { finish(); return; }

      var pending = imgs.length;
      function one() { if (--pending <= 0) finish(); }
      imgs.forEach(function (img) {
        var settle = function () { img.removeEventListener('load', settle); img.removeEventListener('error', settle); one(); };
        img.addEventListener('load', settle, { once: true });
        img.addEventListener('error', settle, { once: true });
      });
      // Per-batch cap: don't wait more than ~450ms on stubborn images.
      setTimeout(finish, 450);
    }

    function check() {
      var root = document.getElementById('cs-root') ||
                 document.querySelector('main');

      if (root) {
        // Content-bearing region: wait for real child nodes first…
        if (root.children && root.children.length > 0) {
          // …then let one frame lay it out so getBoundingClientRect is valid,
          // and await the above-the-fold images before clearing the blur.
          requestAnimationFrame(awaitAboveFoldMedia);
          return;
        }
        requestAnimationFrame(check); // not filled yet — poll (slow loads)
        return;
      }

      // No content region (static pages): images exist at parse time, so
      // await above-the-fold media once the DOM is parsed.
      if (document.readyState !== 'loading') {
        requestAnimationFrame(awaitAboveFoldMedia);
        return;
      }
      requestAnimationFrame(check);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', check);
    } else {
      check();
    }

    // Absolute safety net: never trap the page blurred.
    setTimeout(finish, 4000);
  }

  /* ─── Boot ──────────────────────────────────────────────────── */
  initIncoming();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOutgoing);
  } else {
    initOutgoing();
  }

  // bfcache restore (back button): strip any lingering transition state.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      var html = document.documentElement;
      html.classList.remove('ptx-arriving', 'ptx-resolve');
      var stale = document.querySelectorAll('.ptx-clone, .ptx-frost, .ptx-veil, .ptx-arrive-wash');
      Array.prototype.forEach.call(stale, function (n) {
        if (n.parentNode) n.parentNode.removeChild(n);
      });
      try { sessionStorage.removeItem(HANDOFF_KEY); } catch (err) {}
    }
  });
})();
