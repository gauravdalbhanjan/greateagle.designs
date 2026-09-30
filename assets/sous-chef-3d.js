/* ══════════════════════════════════════════════════════════════
   SOUS CHEF — scroll-driven 3D product story  (ES module)
   ────────────────────────────────────────────────────────────
   One pinned WebGL section tells the whole story on scroll:

     Act 1  (0–40%)  phone: grocery → scan → dish suggestion
     Handoff(40–50%) phone recedes, device scales in (cross-fade)
     Act 2  (50–100%) device: establish → base → stand → projector
                      (DOF) → explode → reassemble + colour → hero+stats

   Progress (0..1 across the pinned track) interpolates rotation,
   camera, depth-of-field focus, explode amount, overlays, colour.

   • Phone loads first so Act 1 plays immediately; the (Draco) device
     model lazy-loads in the background during Act 1.
   • prefers-reduced-motion / no-WebGL → static hero image fallback
     (the section is left in normal flow, image shown).
   • Touch → static drag-to-rotate hero + working colour selector,
     no scroll-jacking (matches the site's pinned-scroll fallback).
   ══════════════════════════════════════════════════════════════ */

const MOUNT_ID = 'souschef-3d-mount';
const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const COARSE = window.matchMedia('(any-pointer: coarse)').matches &&
               !window.matchMedia('(any-pointer: fine), (pointer: fine)').matches;
const NARROW = !window.matchMedia('(min-width: 861px)').matches;

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

/* Colour finishes — each swaps body + accent (charging base + right-side cap). */
const FINISHES = [
  { name: 'Peach',       body: '#F0C29A', accent: '#B07A5C' },
  { name: 'Grey Purple', body: '#A99098', accent: '#7C6670' },
  { name: 'Royal Blue',  body: '#3D4E6B', accent: '#1E2A47' },
  { name: 'Olive Green', body: '#5E9B7C', accent: '#2C4A38' },
  { name: 'Black & Grey', body: '#1C1C1E', accent: '#9B9B9D' }
];

const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0';
const DRACO = 'https://www.gstatic.com/draco/versioned/decoders/1.5.6/';

let mount = null;
let _tries = 0;

/* The mount is rendered by case-study.js (on DOMContentLoaded). Wait for it,
   then choose the right path. Give up after ~3s if it never appears. */
function start() {
  mount = document.getElementById(MOUNT_ID);
  if (!mount) { if (_tries++ < 180) requestAnimationFrame(start); return; }

  // Only load the heavy WebGL story on desktop, motion-ok, WebGL-capable.
  if (webglOK() && !REDUCE && !COARSE && !NARROW) {
    boot().catch(err => console.warn('[sous-chef-3d] disabled:', err));
  } else if (webglOK() && (COARSE || NARROW) && !REDUCE) {
    // Touch / narrow: static drag-to-rotate viewer, no scroll-jacking.
    bootStatic().catch(err => console.warn('[sous-chef-3d] static viewer off:', err));
  }
  // else: leave the static hero fallback image in place (reduced-motion / no WebGL).
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(start));
} else {
  requestAnimationFrame(start);
}

async function imports() {
  const THREE = await import(CDN + '/build/three.module.js');
  const { GLTFLoader } = await import(CDN + '/examples/jsm/loaders/GLTFLoader.js');
  const { DRACOLoader } = await import(CDN + '/examples/jsm/loaders/DRACOLoader.js');
  const { OrbitControls } = await import(CDN + '/examples/jsm/controls/OrbitControls.js');
  return { THREE, GLTFLoader, DRACOLoader, OrbitControls };
}

function makeLoader(THREE, GLTFLoader, DRACOLoader) {
  const draco = new DRACOLoader();
  draco.setDecoderPath(DRACO);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  return loader;
}

/* Common scene setup shared by the full story and the static viewer. */
function makeScene(THREE, stage) {
  const canvas = document.createElement('canvas');
  canvas.className = 'cs-3d-canvas';
  stage.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 100);
  camera.position.set(0, 0.2, 5);

  // Warm three-point-ish lighting.
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xfff2e8, 2.1); key.position.set(3, 4, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xff6a2a, 1.1); rim.position.set(-4, 2, -3); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xbfd0ff, 0.6); fill.position.set(-2, -1, 3); scene.add(fill);

  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);
  return { renderer, scene, camera, canvas, resize };
}

/* Fit a loaded object to a target size + centre it; returns its box. */
function normalize(THREE, obj, targetSize) {
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const s = targetSize / maxDim;
  obj.scale.setScalar(s);
  obj.position.sub(center.multiplyScalar(s));
  return new THREE.Box3().setFromObject(obj);
}

/* ── Full scroll-driven story ──────────────────────────────────── */
async function boot() {
  const { THREE, GLTFLoader, DRACOLoader } = await imports();

  mount.classList.add('cs-3d--on');

  // Build track + sticky stage + overlays.
  const track = document.createElement('div'); track.className = 'cs-3d-track';
  track.style.height = '600vh';                 // 6 screens of scroll room
  const stage = document.createElement('div'); stage.className = 'cs-3d-stage';
  track.appendChild(stage);
  mount.appendChild(track);

  const loader = document.createElement('div');
  loader.className = 'cs-3d-loader';
  loader.innerHTML = '<div class="cs-3d-spin"></div><div class="cs-3d-loadlbl">Loading 3D…</div>';
  stage.appendChild(loader);

  const { renderer, scene, camera, resize } = makeScene(THREE, stage);

  // Overlays (copy beats, dots, colours, stats).
  const overlay = buildOverlay(stage);

  const gltf = makeLoader(THREE, GLTFLoader, DRACOLoader);

  // 1) Load the phone first → Act 1 can play immediately.
  const phoneRoot = new THREE.Group(); scene.add(phoneRoot);
  const deviceRoot = new THREE.Group(); scene.add(deviceRoot); deviceRoot.visible = false;

  const phoneGltf = await gltf.loadAsync(mount.dataset.phone);
  const phone = phoneGltf.scene;
  normalize(THREE, phone, 2.2);
  phoneRoot.add(phone);
  applyPhoneScreen(THREE, phone, '../assets/sous-chef/menu-tab.jpg');
  loader.classList.add('gone');

  // 2) Lazy-load the device (Draco) in the background during Act 1.
  let device = null, parts = null, colorTargets = null, deviceBox = null;
  gltf.loadAsync(mount.dataset.device).then(g => {
    device = g.scene;
    deviceBox = normalize(THREE, device, 2.6);
    deviceRoot.add(device);
    parts = groupParts(THREE, device);
    colorTargets = mapColorTargets(THREE, device);
    applyFinish(0);
  }).catch(e => console.warn('[sous-chef-3d] device load failed', e));

  // Phone screen textures per Act-1 beat.
  const screens = {
    grocery: texture(THREE, '../assets/sous-chef/inventory-tab.jpg'),
    scan:    texture(THREE, '../assets/sous-chef/routine-tab.jpg'),
    dish:    texture(THREE, '../assets/sous-chef/menu-tab.jpg')
  };
  let curScreen = 'dish';

  function setScreen(name) {
    if (name === curScreen || !screens[name]) return;
    curScreen = name;
    setPhoneScreenTexture(THREE, phone, screens[name]);
  }

  // Colour finish application.
  function applyFinish(i) {
    if (!colorTargets) return;
    const f = FINISHES[i];
    colorTargets.body.forEach(m => m.color.set(f.body));
    colorTargets.accent.forEach(m => m.color.set(f.accent));
    overlay.markSwatch(i);
  }
  overlay.onSwatch(applyFinish);

  // ── Scroll progress → story state ────────────────────────────
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const map = (v, a, b) => clamp((v - a) / (b - a), 0, 1);
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  let progress = 0;
  function computeProgress() {
    const rect = track.getBoundingClientRect();
    const total = track.offsetHeight - window.innerHeight;
    progress = clamp(-rect.top / (total || 1), 0, 1);
  }

  function apply() {
    const p = progress;

    // Phase gating.
    const inPhone = p < 0.40;
    const inHandoff = p >= 0.40 && p < 0.50;
    const inDevice = p >= 0.50;

    phoneRoot.visible = p < 0.52;
    deviceRoot.visible = !!device && p >= 0.40;

    // ---- ACT 1: phone (0–40%) ----
    if (phoneRoot.visible) {
      const idle = p * Math.PI * 2;
      // Beat screens + tilt.
      if (p < 0.13) { setScreen('grocery'); overlay.beat(0); phone.rotation.set(0, Math.sin(idle) * 0.15, 0); }
      else if (p < 0.26) { setScreen('scan'); overlay.beat(1); phone.rotation.set(-0.2, Math.sin(idle) * 0.1, 0.05); }
      else if (p < 0.40) { setScreen('dish'); overlay.beat(2); phone.rotation.set(0.25, -0.1, 0); }

      // Handoff: phone recedes up-left + shrinks.
      const h = map(p, 0.40, 0.50);
      const he = easeInOut(h);
      phoneRoot.position.set(lerp(0, -1.6, he), lerp(0, 1.0, he), lerp(0, -1.5, he));
      phoneRoot.scale.setScalar(lerp(1, 0.4, he));
      phoneRoot.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = 1 - he; } });
      if (inHandoff) overlay.beat(3); // "Now put the phone away."
    }

    // ---- ACT 2: device (50–100%) ----
    if (deviceRoot.visible && device) {
      const dEnter = map(p, 0.40, 0.52);
      deviceRoot.scale.setScalar(lerp(0.6, 1, easeInOut(dEnter)));
      device.traverse(o => { if (o.material) { o.material.transparent = true; o.material.opacity = clamp(dEnter, 0, 1); } });

      const d = map(p, 0.50, 1.0);   // 0..1 across the device act

      // Beat mapping within the device act.
      let rotY, focus, explode = 0;
      if (d < 0.20) {            // establish
        rotY = lerp(0, 0.4, d / 0.20); overlay.beat(4);
      } else if (d < 0.35) {     // base
        rotY = lerp(0.4, Math.PI * 0.6, map(d, 0.20, 0.35)); overlay.beat(5);
      } else if (d < 0.50) {     // stand
        rotY = lerp(Math.PI * 0.6, Math.PI, map(d, 0.35, 0.50)); overlay.beat(6);
      } else if (d < 0.62) {     // projector
        rotY = lerp(Math.PI, Math.PI * 2, map(d, 0.50, 0.62)); overlay.beat(7);
      } else if (d < 0.78) {     // explode
        rotY = Math.PI * 2 + map(d, 0.62, 0.78) * 0.4; explode = easeInOut(map(d, 0.62, 0.78)); overlay.beat(8);
      } else if (d < 0.90) {     // reassemble + colour
        rotY = Math.PI * 2 + 0.4; explode = 1 - easeInOut(map(d, 0.78, 0.90)); overlay.beat(9);
        overlay.showColors(map(d, 0.80, 0.86) > 0.4);
      } else {                   // hero + stats
        rotY = lerp(Math.PI * 2 + 0.4, Math.PI * 2 + 0.9, map(d, 0.90, 1.0)); overlay.beat(10);
        overlay.showColors(false);
        overlay.showStats(true);
      }
      if (d < 0.90) overlay.showStats(false);

      device.rotation.y = rotY;
      applyExplode(parts, explode);
      overlay.dot(deviceDot(d));
    } else {
      overlay.dot(-1);
    }

    if (inPhone) overlay.dot(phoneDot(p));
  }

  function loop() {
    computeProgress();
    apply();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  loop();
  window.addEventListener('resize', resize);
}

function deviceDot(d) { return d < 0.20 ? 3 : d < 0.35 ? 4 : d < 0.50 ? 5 : d < 0.62 ? 6 : d < 0.78 ? 7 : d < 0.90 ? 8 : 9; }
function phoneDot(p) { return p < 0.13 ? 0 : p < 0.26 ? 1 : p < 0.40 ? 2 : 3; }

/* Group the device meshes into explode clusters by node-name family. */
function groupParts(THREE, device) {
  const groups = { projector: [], battery: [], electronics: [], housing: [], other: [] };
  device.traverse(o => {
    if (!o.isMesh) return;
    o.userData.home = o.position.clone();
    const n = (o.name || o.parent?.name || '').toLowerCase();
    if (n.includes('wvga') || n.includes('pj_') || n.includes('lens') || n.includes('projector')) groups.projector.push(o);
    else if (n.includes('pila') || n.includes('li_po') || n.includes('batt')) groups.battery.push(o);
    else if (n.includes('arduino') || n.includes('leonardo')) groups.electronics.push(o);
    else if (n.includes('final chef') || n.includes('cover') || n.includes('case')) groups.housing.push(o);
    else groups.other.push(o);
  });
  return groups;
}

/* Drift clusters apart along axes by `amount` (0..1). */
function applyExplode(parts, amount) {
  if (!parts) return;
  const dirs = {
    projector: [0, 0.9, 0], battery: [-0.9, 0, 0], electronics: [0.9, 0, 0],
    housing: [0, -0.5, 0], other: [0, 0, 0.9]
  };
  Object.keys(parts).forEach(k => {
    const [dx, dy, dz] = dirs[k] || [0, 0, 0];
    parts[k].forEach(o => {
      const h = o.userData.home;
      o.position.set(h.x + dx * amount, h.y + dy * amount, h.z + dz * amount);
    });
  });
}

/* Map body vs accent materials. Heuristic: the charging BASE (lowest-Y mesh)
   and the right-side circular CAP (max-X mesh) are the accent; the rest of
   the visible housing is the body. Logs bboxes so the mapping can be tuned. */
function mapColorTargets(THREE, device) {
  const housing = [];
  device.traverse(o => {
    if (!o.isMesh) return;
    const n = (o.name || o.parent?.name || '').toLowerCase();
    if (n.includes('final chef') || n.includes('cover') || n.includes('case')) {
      const box = new THREE.Box3().setFromObject(o);
      const c = box.getCenter(new THREE.Vector3());
      housing.push({ mesh: o, cx: c.x, cy: c.y, material: o.material });
    }
  });
  if (!housing.length) return { body: [], accent: [] };

  // Log for tuning.
  try { console.info('[sous-chef-3d] housing parts:', housing.map(h => ({ name: h.mesh.name, cx: +h.cx.toFixed(2), cy: +h.cy.toFixed(2) }))); } catch (e) {}

  const minY = Math.min(...housing.map(h => h.cy));
  const maxX = Math.max(...housing.map(h => h.cx));
  const accent = [], body = [];
  housing.forEach(h => {
    const isBase = h.cy < minY + 0.15;             // charging base
    const isCap = h.cx > maxX - 0.12;              // right-side circular cap
    const mats = Array.isArray(h.material) ? h.material : [h.material];
    mats.forEach(m => { if (m && m.color) (isBase || isCap ? accent : body).push(m); });
  });
  // Ensure both buckets have something.
  if (!accent.length && body.length) accent.push(body[body.length - 1]);
  return { body, accent };
}

/* ── Phone screen texturing ────────────────────────────────────── */
function texture(THREE, url) {
  const t = new THREE.TextureLoader().load(url);
  t.colorSpace = THREE.SRGBColorSpace;
  t.flipY = false;
  return t;
}
/* Find the largest flat mesh (the screen) and swap its map. */
function applyPhoneScreen(THREE, phone, url) {
  const screen = findScreenMesh(THREE, phone);
  if (screen) { phone.userData.screen = screen; setPhoneScreenTexture(THREE, phone, texture(THREE, url)); }
}
function findScreenMesh(THREE, phone) {
  let best = null, bestArea = 0;
  phone.traverse(o => {
    if (!o.isMesh) return;
    const n = (o.name || '').toLowerCase();
    const box = new THREE.Box3().setFromObject(o);
    const s = box.getSize(new THREE.Vector3());
    const area = s.x * s.y;
    if (n.includes('screen') || n.includes('display') || n.includes('glass')) { best = o; bestArea = Infinity; }
    else if (area > bestArea) { best = o; bestArea = area; }
  });
  return best;
}
function setPhoneScreenTexture(THREE, phone, tex) {
  const screen = phone.userData.screen;
  if (!screen) return;
  const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
  screen.material = mat;
}

/* ── Overlay DOM (copy beats, dots, colours, stats) ────────────── */
function buildOverlay(stage) {
  const BEATS = [
    'Plan your list.',                                   // 0
    'Scan your receipt. Your pantry updates itself.',    // 1
    'Get suggestions from what you already have.',       // 2
    'Now put the phone away.',                           // 3 (handoff)
    'Cook without the guesswork.',                       // 4
    'Magnetic charging base — flush on any counter.',    // 5
    'Pop-out stand — angled for the whole kitchen.',     // 6
    'Built-in projector — guidance on your counter.',    // 7
    'Engineered from the inside out.',                   // 8
    'Choose your finish.',                               // 9
    'Bon appétit.'                                       // 10
  ];
  const copy = document.createElement('div'); copy.className = 'cs-3d-copy';
  const beatEls = BEATS.map((t, i) => {
    const el = document.createElement('div'); el.className = 'cs-3d-beat';
    el.innerHTML = '<h3>' + t + '</h3>';
    copy.appendChild(el); return el;
  });
  stage.appendChild(copy);

  const dotsWrap = document.createElement('div'); dotsWrap.className = 'cs-3d-dots';
  const dotEls = BEATS.map(() => { const d = document.createElement('span'); d.className = 'cs-3d-dot'; dotsWrap.appendChild(d); return d; });
  stage.appendChild(dotsWrap);

  const colors = document.createElement('div'); colors.className = 'cs-3d-colors';
  const swatchEls = FINISHES.map((f, i) => {
    const b = document.createElement('button');
    b.className = 'cs-3d-swatch'; b.style.background = f.body;
    b.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4), inset -8px 0 0 ' + f.accent;
    b.title = f.name; b.setAttribute('aria-label', f.name);
    colors.appendChild(b); return b;
  });
  stage.appendChild(colors);

  const stats = document.createElement('div'); stats.className = 'cs-3d-stats';
  stats.innerHTML =
    '<div class="cs-3d-stat"><div class="n">85%</div><div class="l">Successful pantry management</div></div>' +
    '<div class="cs-3d-stat"><div class="n">82%</div><div class="l">Success rate using the app</div></div>' +
    '<div class="cs-3d-stat"><div class="n">62%</div><div class="l">Higher sense of achievement</div></div>';
  stage.appendChild(stats);

  let curBeat = -1;
  return {
    beat(i) { if (i === curBeat) return; curBeat = i; beatEls.forEach((el, k) => el.classList.toggle('on', k === i)); },
    dot(i) { dotEls.forEach((el, k) => el.classList.toggle('active', k === i)); },
    showColors(on) { colors.classList.toggle('on', !!on); },
    showStats(on) { stats.classList.toggle('on', !!on); },
    onSwatch(cb) { swatchEls.forEach((b, i) => b.addEventListener('click', () => cb(i))); },
    markSwatch(i) { swatchEls.forEach((b, k) => b.classList.toggle('sel', k === i)); }
  };
}

/* ── Touch / narrow static viewer: drag-to-rotate + colour selector ── */
async function bootStatic() {
  const { THREE, GLTFLoader, DRACOLoader, OrbitControls } = await imports();
  mount.classList.add('cs-3d--on');

  const stage = document.createElement('div'); stage.className = 'cs-3d-stage';
  stage.style.position = 'relative'; stage.style.height = '70vh';
  mount.appendChild(stage);

  const loader = document.createElement('div');
  loader.className = 'cs-3d-loader';
  loader.innerHTML = '<div class="cs-3d-spin"></div><div class="cs-3d-loadlbl">Loading 3D…</div>';
  stage.appendChild(loader);

  const { renderer, scene, camera } = makeScene(THREE, stage);
  camera.position.set(0, 0.2, 4.5);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false; controls.enablePan = false; controls.autoRotate = true; controls.autoRotateSpeed = 1.2;

  const gltf = makeLoader(THREE, GLTFLoader, DRACOLoader);
  const g = await gltf.loadAsync(mount.dataset.device);
  const device = g.scene; normalize(THREE, device, 2.6); scene.add(device);
  const targets = mapColorTargets(THREE, device);
  loader.classList.add('gone');

  const overlay = buildOverlay(stage);
  overlay.showColors(true);
  overlay.onSwatch(i => {
    const f = FINISHES[i];
    targets.body.forEach(m => m.color.set(f.body));
    targets.accent.forEach(m => m.color.set(f.accent));
    overlay.markSwatch(i);
  });
  const hint = document.createElement('div'); hint.className = 'cs-3d-hint'; hint.textContent = 'Drag to rotate';
  stage.appendChild(hint);

  function loop() { controls.update(); renderer.render(scene, camera); requestAnimationFrame(loop); }
  loop();
}
