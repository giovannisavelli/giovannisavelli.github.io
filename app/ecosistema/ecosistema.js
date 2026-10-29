// Il mio ecosistema · diorama di come lavora Giovanni con l'IA (terza versione; le prime due sono in ecosistema-v1.js e -v2.js).
// Al centro il cervello centrale: una sfera meccanica di punti, come nell'header della pagina IA, legata con i cavi a
// postazioni, strumenti e progetti. Il lavoro parte da Giovanni, anche quando è sul divano col telefono.
// Il pulsante «Guarda un flusso di lavoro» fa partire una storia guidata: idea → confronto → brief → codice → immagine → consegna.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as audio from './suoni.js?v=2';

const box = document.getElementById('sceneBox');
const canvas = document.getElementById('scene');
const labelsEl = document.getElementById('labels');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = () => innerWidth <= 900;

const COL = { floor: 0x0e1716, pad: 0x132120, edge: 0x2f5246, green: 0x77e7b7, claude: 0xe9a27c, codex: 0xc9d6ff,
              gemini: 0xa99dff, amber: 0xf0d79c, ink: 0xedf3ef, ps: 0x5fb4ff, blender: 0xf3a64a, c4d: 0x6f8dff, client: 0xf6b6c8 };
const CSS = { green: '#77e7b7', claude: '#e9a27c', codex: '#c9d6ff', gemini: '#a99dff', amber: '#f0d79c', ink: '#edf3ef',
              ps: '#5fb4ff', blender: '#f3a64a', c4d: '#8ea6ff', mini: '#f4c9ae', client: '#f6b6c8' };

// ---------- scena, luci, telecamera ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const rig = new THREE.Group(); scene.add(rig);
scene.add(new THREE.HemisphereLight(0xcfe9de, 0x0a1110, 1.1));
const sun = new THREE.DirectionalLight(0xffffff, 1.55);
sun.position.set(10, 24, 8); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -31, right: 31, top: 31, bottom: -31, near: 1, far: 90 });
sun.shadow.bias = -.0006; sun.shadow.radius = 4;
scene.add(sun);

const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, -200, 400);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = .09;
controls.rotateSpeed = .9; controls.zoomSpeed = 1.1; controls.panSpeed = .9;
controls.minZoom = .55; controls.maxZoom = 6;
controls.minPolarAngle = .18; controls.maxPolarAngle = 1.42;
controls.screenSpacePanning = true;
const HOME = () => ({ target: small() ? new THREE.Vector3(.5, 0, -.5) : new THREE.Vector3(.4, 0, -.4), zoom: 1 });
function home() {
  const h = HOME();
  controls.target.copy(h.target);
  camera.position.copy(h.target).add(new THREE.Vector3(26, 23, 26));
  camera.zoom = h.zoom; camera.updateProjectionMatrix(); controls.update(); focus = null;
}
// ---------- regia: la telecamera segue il punto che si racconta ----------
// Un'inquadratura ha un bersaglio (fermo, oppure un oggetto che si muove), uno zoom e un'angolazione.
let focus = null;
const _sph = new THREE.Spherical(), _off2 = new THREE.Vector3(), _tg = new THREE.Vector3();
const TH0 = Math.PI / 4, PH0 = 1.01;                         // l'angolazione della vista iniziale
const ZS = 1.3;                                               // il mondo è più ampio del 30%: le inquadrature stringono altrettanto
function shot(target, zoom, theta = TH0, phi = PH0, speed = 2) {
  zoom *= ZS;
  focus = { get: typeof target === 'function' ? target : out => out.copy(target), zoom, theta, phi, speed };
}
// segue il punto di luce di un lampo: un dato che viaggia da un posto all'altro
const follow = (Bm, zoom, theta, phi) => shot(out => out.copy(Bm.dot.position), zoom, theta, phi, 3.4);
function stepFocus(dt) {
  if (!focus || !dt) return;
  const k = 1 - Math.exp(-dt * focus.speed);
  focus.get(_tg);
  _off2.subVectors(camera.position, controls.target); _sph.setFromVector3(_off2);
  let dth = focus.theta - _sph.theta; dth = Math.atan2(Math.sin(dth), Math.cos(dth));
  _sph.theta += dth * k; _sph.phi += (focus.phi - _sph.phi) * k;
  controls.target.lerp(_tg, k);
  camera.position.setFromSpherical(_sph).add(controls.target);
  camera.zoom += (focus.zoom - camera.zoom) * k; camera.updateProjectionMatrix();
}
controls.addEventListener('start', () => { focus = null; });

const clickables = [];
const mat = (color, emissive = 0, ei = 0) => new THREE.MeshStandardMaterial({ color, roughness: .78, metalness: .08, emissive, emissiveIntensity: ei });
const glowMat = (color, op) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
function mesh(geo, material, parent, x = 0, y = 0, z = 0, edges = COL.edge, edgeOp = .55) {
  const m = new THREE.Mesh(geo, material);
  m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
  if (edges !== null) m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({ color: edges, transparent: true, opacity: edgeOp })));
  parent.add(m); return m;
}
const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
function clickable(obj, key) { obj.traverse(o => { o.userData.key = key; }); clickables.push(obj); }
function pad(parent, s = 2.8) { return mesh(B(s, .16, s), mat(COL.pad), parent, 0, .08, 0, COL.edge, .9); }

mesh(B(55, .6, 47), mat(COL.floor), rig, 0, -.3, 0, COL.edge, .8);
const grid = new THREE.GridHelper(55, 55, COL.edge, 0x16241f);
grid.position.y = .005; grid.scale.z = 47 / 55; grid.material.transparent = true; grid.material.opacity = .5; rig.add(grid);

// ---------- etichette nel DOM ----------
const labels = [];
function label(obj, y, cls, html, color) {
  const el = document.createElement('div');
  el.className = 'lbl ' + (cls || '');
  if (color) el.style.setProperty('--c', color);
  el.innerHTML = html; labelsEl.appendChild(el);
  const L = { obj, y, el }; labels.push(L); return L;
}
const v3 = new THREE.Vector3();
function placeLabels() {
  const r = box.getBoundingClientRect();
  for (let i = labels.length - 1; i >= 0; i--) {
    const L = labels[i];
    if (!L.obj.parent) { L.el.remove(); labels.splice(i, 1); continue; }
    L.obj.getWorldPosition(v3); v3.y += L.y; v3.project(camera);
    L.el.classList.toggle('dim', !!story && !live.has(L.obj.userData.key));
    L.el.style.transform = `translate(${((v3.x + 1) / 2 * r.width).toFixed(1)}px, ${((1 - v3.y) / 2 * r.height).toFixed(1)}px) translate(-50%, -100%)`;
  }
}

// ---------- archi fissi e lampi fra due oggetti ----------
function arc(a, b, h, color = COL.edge, op = .8) {
  const mid = a.clone().add(b).multiplyScalar(.5); mid.y += h;
  const g = new THREE.BufferGeometry().setFromPoints(new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(32));
  const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color, dashSize: .3, gapSize: .2, transparent: true, opacity: op }));
  l.computeLineDistances(); rig.add(l); return l;
}
const beams = [];
const dotGeo = new THREE.SphereGeometry(.12, 10, 8);
function beam(getA, getB, color, life = 1.6, opts = {}) {
  if (opts.sound !== false) audio.play(opts.once ? 'whoosh' : 'pop', opts.once ? .7 : (Math.random() * 5 | 0), story ? .15 : .4);
  const n = 28, g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0 }));
  const dot = new THREE.Mesh(opts.big ? new THREE.BoxGeometry(.32, .4, .05) : dotGeo, new THREE.MeshBasicMaterial({ color, transparent: true }));
  line.frustumCulled = false; rig.add(line, dot);
  const Bm = { line, dot, getA, getB, life, t: 0, run: 0, n, h: opts.h ?? 1.8, both: opts.both, once: opts.once, onEnd: opts.onEnd, keep: opts.keep, op: opts.op ?? .9 };
  beams.push(Bm); return Bm;
}
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _m = new THREE.Vector3(), _p = new THREE.Vector3();
const bez = (s, out) => { const u = 1 - s; return out.set(u * u * _a.x + 2 * u * s * _m.x + s * s * _b.x, u * u * _a.y + 2 * u * s * _m.y + s * s * _b.y, u * u * _a.z + 2 * u * s * _m.z + s * s * _b.z); };
function stepBeams(dt) {
  for (let i = beams.length - 1; i >= 0; i--) {
    const Bm = beams[i]; Bm.t += dt; Bm.run += dt;           // run non si ferma mai: il punto continua a correre
    if (Bm.keep && Bm.keep()) Bm.t = Math.min(Bm.t, Bm.life * .5);
    const k = Bm.t / Bm.life;
    Bm.getA(_a); Bm.getB(_b);
    _m.copy(_a).add(_b).multiplyScalar(.5); _m.y += Bm.h + _a.distanceTo(_b) * .08;
    const pos = Bm.line.geometry.attributes.position;
    for (let j = 0; j < Bm.n; j++) { bez(j / (Bm.n - 1), _p); pos.setXYZ(j, _p.x, _p.y, _p.z); }
    pos.needsUpdate = true;
    const fade = Math.max(0, Math.min(1, k * 6, (1 - k) * 4));
    Bm.line.material.opacity = fade * Bm.op;
    // un lampo tenuto acceso (keep) congela il suo tempo per non spegnersi: il punto invece segue run
    let s = Bm.once ? Math.min(1, Bm.t / (Bm.life * .8)) : (Bm.run * 1.1) % 1; if (Bm.both && Math.floor(Bm.run * 1.1) % 2) s = 1 - s;
    if (Bm.once) s = s * s * (3 - 2 * s);
    bez(s, Bm.dot.position); Bm.dot.lookAt(camera.position);
    Bm.dot.material.opacity = fade;
    if (k >= 1) { rig.remove(Bm.line, Bm.dot); Bm.line.geometry.dispose(); Bm.line.material.dispose(); Bm.dot.material.dispose(); beams.splice(i, 1); if (Bm.once) audio.play('ding', 0, .2); Bm.onEnd && Bm.onEnd(); }
  }
}
const _off = new THREE.Vector3();
const at = (obj, y = 0) => out => rig.worldToLocal(obj.getWorldPosition(out).add(_off.set(0, y, 0)));

// ---------- il cervello centrale: sfera meccanica di punti appesa ai cavi, come nell'header ----------
// Quattro tralicci la tengono sospesa; altri cavi scendono a terra fino a postazioni e progetti.
// La sfera oscilla piano e i cavi la seguono: la scheda video li ricalcola a ogni fotogramma.
const BR = 1.55, BY = 4.8;
const brain = new THREE.Group(); rig.add(brain);
const ball = new THREE.Object3D(); ball.position.y = BY; ball.userData.key = 'brain'; rig.add(ball); ball.updateMatrix();
const floorGlow = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48), glowMat(COL.green, .09));
floorGlow.rotation.x = -Math.PI / 2; floorGlow.position.y = .02; brain.add(floorGlow);
const sonar = new THREE.Mesh(new THREE.RingGeometry(.96, 1, 96), glowMat(COL.green, .5));        // un'onda che parte da sotto la sfera
sonar.rotation.x = -Math.PI / 2; sonar.position.y = .03; brain.add(sonar);
const HUBS = [[.2, .9, .35], [.95, .1, .3], [-.85, .2, .45], [.25, -.4, .88], [-.3, -.8, -.5], [.4, .2, -.9], [-.2, .55, -.8], [.6, -.75, .1]].map(v => new THREE.Vector3(...v).normalize());
const SEAMS = [new THREE.Vector3(.3, 1, .1).normalize(), new THREE.Vector3(1, -.2, .6).normalize()];
const ptsPos = [], ptsN = [], ptsB = [], ptsK = [], ptsG = [], ptsT = [], ptsP2 = [], ptsP3 = [], ptsJ = [];
const ZERO = new THREE.Vector3(), _j = new THREE.Vector3();
function pt(p, n, b, k, g = 0, t = 0, p2 = ZERO, p3 = ZERO, j = ZERO) {
  ptsPos.push(p.x, p.y, p.z); ptsN.push(n.x, n.y, n.z); ptsB.push(b); ptsK.push(k); ptsG.push(g); ptsT.push(t);
  ptsP2.push(p2.x, p2.y, p2.z); ptsP3.push(p3.x, p3.y, p3.z); ptsJ.push(j.x, j.y, j.z);
}
const tv = new THREE.Vector3();
for (let i = 0, N = small() ? 11000 : 19000; i < N; i++) {
  tv.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
  const L = tv.length(); if (L > 1 || L < .1) { i--; continue; } tv.divideScalar(L);
  let b = .7 + Math.random() * .2, lift = 0, skip = false, g = 0;
  const hub = HUBS.find(h => tv.dot(h) > Math.cos(.4));
  if (hub) {
    const s = Math.acos(Math.min(1, tv.dot(hub))) / .4;
    const ring = [.16, .34, .54, .76, .96].some(r => Math.abs(s - r) < .035);
    if (ring) { b = 1.25; lift = .03; } else if (s < .1) { b = 1.1; lift = .05; g = 1; } else b *= .55;
  } else for (const sm of SEAMS) {
    const d = Math.abs(tv.dot(sm));
    if (d < .022) { skip = true; break; }
    if (d < .045) { b = 1.15; lift = .015; }
  }
  if (skip) continue;
  pt(tv.clone().multiplyScalar(BR * (1 + lift)), tv, b, 0, g);
}
// i cavi: a terra fino a postazioni e progetti, oppure in alto fino ai tralicci che reggono la sfera
const CABLES = [];
function updateCable(C) {
  C.curve.v0.copy(C.hub).multiplyScalar(BR).applyMatrix4(ball.matrix);
  C.curve.v1.copy(C.hub).applyQuaternion(ball.quaternion).multiplyScalar(1.6).add(C.curve.v0);
}
function cable(x, z, y = .06, up = false) {
  const end = new THREE.Vector3(x, y, z);
  const dir = up ? new THREE.Vector3(x, y - BY, z).normalize() : new THREE.Vector3(x, -1.2, z).normalize();
  let hub = HUBS[0], best = -2; for (const h of HUBS) { const d = h.dot(dir); if (d > best) { best = d; hub = h; } }
  const flat = new THREE.Vector3(x, 0, z).normalize();
  const p2 = up ? end.clone().lerp(new THREE.Vector3(0, BY, 0), .4).add(new THREE.Vector3(0, -1.3, 0)) : flat.clone().multiplyScalar(3.4).setY(.06);
  const p3 = up ? end : end.clone().sub(flat.clone().multiplyScalar(1.7));
  const C = { hub, curve: new THREE.CubicBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), p2, p3) };
  updateCable(C);
  const n = Math.round(C.curve.getLength() * (up ? 40 : 34));
  for (let i = 0; i < n; i++) {
    const t = Math.random();
    pt(ZERO, hub, (up ? .7 : .55) * (1 - t * .45), 1, 0, t, p2, p3, _j.set((Math.random() - .5) * .09, (Math.random() - .5) * .06, (Math.random() - .5) * .09));
  }
  CABLES.push(C); return C;
}
// i tralicci
const PYLONS = [-15, -62, 122, -133].map(d => {
  const a = d * Math.PI / 180, g = new THREE.Group(); g.position.set(Math.cos(a) * 6.8, 0, Math.sin(a) * 6.8); rig.add(g);
  mesh(B(.9, .2, .9), mat(COL.pad), g, 0, .1, 0, COL.edge, .9);
  mesh(B(.2, 7.7, .2), mat(0x1a2725), g, 0, 3.95, 0, COL.edge, .7);
  for (let y = 1.2; y < 7.5; y += 1.3) mesh(B(.42, .05, .42), mat(0x1a2725), g, 0, y, 0, COL.edge, .5);
  mesh(B(.5, .18, .5), mat(0x1a2725), g, 0, 7.85, 0, COL.green, .6);
  const lamp = mesh(new THREE.SphereGeometry(.09, 8, 6), new THREE.MeshBasicMaterial({ color: COL.green }), g, 0, 8.05, 0, null);
  clickable(g, 'brain');
  cable(g.position.x, g.position.z, 7.9, true);
  return { g, lamp };
});
// la rete del Ghost dentro la sfera
const netNodes = [];
while (netNodes.length < 16) { tv.set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1); if (tv.length() < .85) netNodes.push(tv.clone().multiplyScalar(BR * .82)); }
const netSeg = [];
netNodes.forEach((a, i) => netNodes.map((b, j) => [a.distanceTo(b), j]).sort((p, q) => p[0] - q[0]).slice(1, 3).forEach(([, j]) => netSeg.push(a, netNodes[j])));
const net = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(netSeg), new THREE.LineBasicMaterial({ color: COL.green, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }));
ball.add(net);
const nodeGeo = new THREE.SphereGeometry(.07, 8, 6), nodeMat = new THREE.MeshBasicMaterial({ color: COL.green });
netNodes.forEach(p => { const m = new THREE.Mesh(nodeGeo, nodeMat); m.position.copy(p); net.add(m); });
const pointsUniforms = { uPR: { value: renderer.getPixelRatio() }, uZoom: { value: 1 }, uLight: { value: new THREE.Vector3(-.4, .75, .5).normalize() },
                         uBall: { value: ball.matrix }, uBR: { value: BR } };
function buildBrainPoints() {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(ptsPos, 3));
  g.setAttribute('aN', new THREE.Float32BufferAttribute(ptsN, 3));
  g.setAttribute('aB', new THREE.Float32BufferAttribute(ptsB, 1));
  g.setAttribute('aK', new THREE.Float32BufferAttribute(ptsK, 1));
  g.setAttribute('aG', new THREE.Float32BufferAttribute(ptsG, 1));
  g.setAttribute('aT', new THREE.Float32BufferAttribute(ptsT, 1));
  g.setAttribute('aP2', new THREE.Float32BufferAttribute(ptsP2, 3));
  g.setAttribute('aP3', new THREE.Float32BufferAttribute(ptsP3, 3));
  g.setAttribute('aJ', new THREE.Float32BufferAttribute(ptsJ, 3));
  const P = new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: pointsUniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec3 aN, aP2, aP3, aJ; attribute float aB, aK, aG, aT;
      uniform float uPR, uZoom, uBR; uniform vec3 uLight; uniform mat4 uBall; varying float vA, vG;
      void main(){
        vec3 n = normalize(mat3(uBall) * aN), wp;
        if (aK < .5) wp = (uBall * vec4(position, 1.)).xyz;
        else {                                   // punto di un cavo: curva dalla presa sulla sfera all'ancoraggio
          vec3 p0 = (uBall * vec4(aN * uBR, 1.)).xyz, p1 = p0 + n * 1.6;
          float t = aT, u = 1. - t;
          wp = u * u * u * p0 + 3. * u * u * t * p1 + 3. * u * t * t * aP2 + t * t * t * aP3 + aJ;
        }
        float l = max(dot(n, uLight), 0.);
        vA = aB * mix(.06 + 1.15 * pow(l, 1.3), .8, step(.5, aK)); vG = aG;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(wp, 1.);
        gl_PointSize = uPR * pow(uZoom, .85) * 1.5; }`,
    fragmentShader: `varying float vA, vG; void main(){ vec2 d = gl_PointCoord - .5; if (dot(d, d) > .25) discard;
      gl_FragColor = vec4(mix(vec3(.93, .91, .86), vec3(.467, .906, .718) * 1.3, vG) * vA * .42, 1.); }` }));
  P.frustumCulled = false; rig.add(P);
}
const glow = new THREE.PointLight(COL.green, 14, 9, 2); ball.add(glow);
const hitBall = new THREE.Mesh(new THREE.SphereGeometry(BR, 16, 12), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
ball.add(hitBall);
clickable(brain, 'brain'); clickable(hitBall, 'brain');
label(ball, BR + .55, 'brain', '<b>Cervello centrale</b>Google Drive · memoria e Diario', CSS.green);
const BRAIN_TOP = out => out.copy(ball.position);
const packets = [];
const packetGeo = new THREE.SphereGeometry(.09, 8, 6);
function packet(C, reverse, color = COL.green) {
  const m = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({ color })); rig.add(m);
  packets.push({ m, curve: C.curve, t: 0, reverse, speed: 4 / C.curve.getLength() });
}

// ---------- postazioni ----------
const screenMats = { pc: [], mac: [] };
function screen(parent, w, h, x, y, z, ry, key) {
  const s = mesh(B(.06, h, w), mat(0x0d1614, COL.green, .05), parent, x, y, z, 0x4d7a6b, .8);
  s.rotation.y = ry; screenMats[key].push(s.material); return s;
}
const pc = new THREE.Group(); pc.position.set(-13, 0, 4.68); rig.add(pc);
mesh(B(1.8, .12, 3.6), mat(0x1b2a27), pc, 0, .95, 0);
for (const [x, z] of [[-.75, -1.6], [.75, -1.6], [-.75, 1.6], [.75, 1.6]]) mesh(B(.08, .9, .08), mat(0x1b2a27), pc, x, .45, z, null);
screen(pc, 1.55, .95, -.45, 1.62, 0, 0, 'pc');
screen(pc, 1.05, .72, -.3, 1.52, -1.25, -.45, 'pc');
screen(pc, 1.05, .72, -.3, 1.52, 1.25, .45, 'pc');
mesh(B(.9, 1.5, .5), mat(0x16221f, COL.green, .04), pc, -.2, .75, 2.4);
mesh(B(.5, .03, 1.1), mat(0x22322e), pc, .45, 1.03, 0, null);
clickable(pc, 'pc');
label(pc, 2.55, '', '<b>PC fisso</b>tre monitor · i programmi pesanti');

const mac = new THREE.Group(); mac.position.set(-13, 0, -5.72); rig.add(mac);
mesh(B(1.5, .1, 2.4), mat(0x1b2a27), mac, 0, .85, 0);
for (const [x, z] of [[-.6, -1.05], [.6, -1.05], [-.6, 1.05], [.6, 1.05]]) mesh(B(.07, .8, .07), mat(0x1b2a27), mac, x, .4, z, null);
mesh(B(.7, .04, 1), mat(0x9aa6a2), mac, .15, .92, 0, 0x4d7a6b);
const lid = screen(mac, 1, .66, -.2, 1.24, 0, 0, 'mac'); lid.rotation.z = .22;
clickable(mac, 'mac');
label(mac, 2.1, '', '<b>MacBook</b>stesso cervello, altra scrivania');
cable(pc.position.x, pc.position.z); cable(mac.position.x, mac.position.z);

// ---------- il divano: la pausa ----------
const sofa = new THREE.Group(); sofa.position.set(-18.2, 0, -14.95); rig.add(sofa);
mesh(B(5.2, .04, 5), mat(0x1a2421), sofa, 0, .02, 0, COL.edge, .6);                        // tappeto
mesh(B(2.8, .45, 1), mat(0x2d3b38), sofa, 0, .32, 1.2);                                    // seduta
mesh(B(2.8, .75, .3), mat(0x2d3b38), sofa, 0, .62, 1.75);                                  // schienale
mesh(B(.3, .6, 1.1), mat(0x2d3b38), sofa, -1.45, .4, 1.25); mesh(B(.3, .6, 1.1), mat(0x2d3b38), sofa, 1.45, .4, 1.25);
mesh(B(2.2, .5, .5), mat(0x161f1d), sofa, 0, .25, -1.7);                                   // mobile della TV
const tvScreen = mesh(B(2, 1.15, .07), mat(0x0a0f0e, 0x6fa8ff, .4), sofa, 0, 1.15, -1.75, 0x4d7a6b);
clickable(sofa, 'sofa');
label(sofa, 2.2, '', '<b>Pausa</b>divano, TV e telefono');
const SEAT = { pc: pc.position.clone().add(new THREE.Vector3(1.7, 0, 0)), mac: mac.position.clone().add(new THREE.Vector3(1.6, 0, 0)), sofa: sofa.position.clone().add(new THREE.Vector3(0, .28, 1.2)) };

// ---------- strumenti ----------
function tool(key, name, sub, x, z, css, build) {
  const g = new THREE.Group(); g.position.set(x, 0, z); rig.add(g);
  pad(g, 2.2); build(g);
  clickable(g, key);
  label(g, 2.25, 'agent', `<b>${name}</b>${sub}`, css);
  return g;
}
const ps = tool('ps', 'Photoshop', 'rifinitura · script da Claude', -17.55, 3.9, CSS.ps, g => {
  mesh(B(1.1, 1.1, 1.1), mat(0x0b1a2a, COL.ps, .35), g, 0, .75, 0, COL.ps, .9);
  mesh(B(1.14, .2, 1.14), mat(0x000000, COL.ps, 1.2), g, 0, 1, 0, null);
});
const blender = tool('blender', 'Blender', 'via MCP', -11.7, 11.18, CSS.blender, g => {
  mesh(new THREE.TorusGeometry(.5, .14, 12, 32), mat(0x2a1a08, COL.blender, .6), g, 0, 1, 0, null).rotation.x = -.6;
  mesh(new THREE.SphereGeometry(.26, 16, 12), mat(0x13202c, 0x7fb8ff, .5), g, 0, 1, 0, null);
});
const c4d = tool('c4d', 'Cinema 4D', 'via MCP', -6.5, 14.56, CSS.c4d, g => {
  mesh(new THREE.SphereGeometry(.55, 24, 16), mat(0x13235c, COL.c4d, .45), g, 0, 1, 0, null);
  mesh(new THREE.TorusGeometry(.6, .06, 8, 40), mat(0xe8eefc, 0xffffff, .4), g, 0, 1, 0, null).rotation.set(1.2, .3, 0);
});
const higgs = tool('higgs', 'Higgsfield', 'Nano Banana Pro · genera Giovanni', 7.8, -17.55, CSS.amber, g => {
  mesh(B(1.3, .9, .9), mat(0x221d10, COL.amber, .25), g, 0, .6, 0, COL.amber, .9);
  g.userData.sheet = mesh(B(.8, .03, .6), mat(0xf4efe0, COL.amber, .3), g, .1, 1.1, 0, null);
  g.userData.sheet.rotation.z = .25;
});
for (const T of [ps, blender, c4d]) arc(new THREE.Vector3(pc.position.x, .05, pc.position.z), new THREE.Vector3(T.position.x, .05, T.position.z), .9);
arc(new THREE.Vector3(higgs.position.x, .6, higgs.position.z), new THREE.Vector3(ps.position.x, .6, ps.position.z), 5, COL.amber, .25);   // l'immagine scelta va in Photoshop
const TOOLS = { ps, blender, c4d };
const TOOLCOL = { ps: COL.ps, blender: COL.blender, c4d: COL.c4d };
const TOOLTXT = { ps: 'Photoshop con uno script', blender: 'Blender via MCP', c4d: 'Cinema 4D via MCP' };

// ---------- online e cliente ----------
const online = new THREE.Group(); online.position.set(19.5, 0, -3.25); rig.add(online);
pad(online, 3);
const cloud = new THREE.Group(); cloud.position.y = 2.2; online.add(cloud);
for (const [x, y, r] of [[-.55, 0, .5], [.1, .22, .68], [.7, 0, .48], [0, -.12, .55]]) mesh(new THREE.SphereGeometry(r, 18, 14), mat(0xdfe9e4, COL.green, .35), cloud, x, y, 0, null);
mesh(B(.12, 1.5, .12), mat(0x1b2a27), online, 0, .9, 0, null);
clickable(online, 'online');
label(online, 3.3, 'brain', '<b>Online</b>GitHub Pages · Cloudflare', CSS.green);

const client = new THREE.Group(); client.position.set(0, 0, -22.1); rig.add(client);
pad(client, 2.6);
mesh(new THREE.CylinderGeometry(.34, .3, 1, 20), mat(0x3a2a30, COL.client, .25), client, 0, .66, 0, null);
mesh(new THREE.SphereGeometry(.27, 20, 16), mat(0x4a3540, COL.client, .3), client, 0, 1.42, 0, null);
mesh(B(.6, .4, .05), mat(0xf6e9ee, COL.client, .4), client, .75, 1.2, .3, null).rotation.y = -.5;   // la busta
clickable(client, 'client');
label(client, 2.1, 'agent', '<b>Cliente</b>riceve il lavoro finito', CSS.client);

// ---------- Giovanni ----------
const gio = new THREE.Group(); rig.add(gio); gio.position.copy(SEAT.pc);
mesh(new THREE.CylinderGeometry(.36, .3, 1.05, 20), mat(0xdbe7e1), gio, 0, .62, 0, null);
mesh(new THREE.SphereGeometry(.28, 20, 16), mat(0xe9efe9), gio, 0, 1.43, 0, null);
const gioPhone = mesh(B(.08, .3, .18), mat(0x0b1211, COL.gemini, 1.2), gio, .32, 1.05, .1, null); gioPhone.visible = false;
const gioRing = mesh(new THREE.RingGeometry(.5, .62, 40), new THREE.MeshBasicMaterial({ color: COL.green, transparent: true, opacity: .9, side: THREE.DoubleSide }), gio, 0, .03, 0, null);
gioRing.rotation.x = -Math.PI / 2; gioRing.castShadow = false;
const bulb = mesh(new THREE.IcosahedronGeometry(.26, 1), mat(0x3a2f10, COL.amber, 1.6), gio, 0, 2.15, 0, null); bulb.visible = false;
clickable(gio, 'gio');
const gioLbl = label(gio, 2.05, 'agent', '<b>Giovanni</b><span class="sub">chiede, corregge, approva</span><span class="chip" hidden></span>', CSS.green);
const gioSub = gioLbl.el.querySelector('.sub'), gioChip = gioLbl.el.querySelector('.chip');
const GIO = at(gio, 1.5);

// ---------- progetti: ognuno ha il suo oggetto, su una base con la corona di avanzamento ----------
function poly(pts, closed) { const out = []; for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) out.push(pts[i], pts[(i + 1) % pts.length]); return out; }
const R2 = (x0, y0, x1, y1) => poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], true);
const Ln = (x0, y0, x1, y1) => [[x0, y0], [x1, y1]];
const circ = (cx, cy, r, n = 14) => poly(Array.from({ length: n }, (_, i) => [cx + Math.cos(i / n * 6.283) * r, cy + Math.sin(i / n * 6.283) * r]), true);
const lineMat = (op = .85) => new THREE.LineBasicMaterial({ color: COL.green, transparent: true, opacity: op });
const lines = (segs, z = .01) => new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(segs.map(([x, y]) => new THREE.Vector3(x, y, z))), lineMat());
const PICTURE = [...poly([[-.85, -.58], [-.3, 0], [0, -.22], [.35, .16], [.85, -.28]]), ...circ(.45, .28, .1)];
const FACE = Math.PI / 4;                                   // rivolto verso la vista iniziale
const PROJECTS = [
  { key: 'sito', name: 'Sito dei corsi', tag: 'GitHub Pages', x: 11.05, z: -11.05, out: true, base: [1.45, 4, FACE],
    jobs: ["rifà l'header della pagina IA", 'prova la pagina sul telefono', 'prepara la pubblicazione'] },
  { key: 'sleep', name: 'Sleep Physics', tag: 'gioco per TikTok', x: 14.95, z: 0.65, base: [1.5, 8, 0],
    jobs: ['prepara la regia del nuovo video', 'prova un seed con la sfida Mystery', 'sistema i suoni ASMR delle sfere'] },
  { key: 'esercizi', name: 'Esercizi in aula', tag: 'Cloudflare · QR', x: 13.65, z: 8.45, out: true, base: [1.4, 40, 0],
    jobs: ['prova la frase a gruppi con 8 telefoni', 'aggiorna il Worker', 'scrive il brief del nuovo esercizio'] },
  { key: 'eidolon', name: 'Eidolon Noeima', tag: 'ritratti AI', x: 6.5, z: 14.95, tool: 'ps', gen: true, base: [1.45, 40, 0],
    jobs: ['scrive il prompt del nuovo ritratto', 'confronta il volto con il riferimento', 'rifinisce il ritratto in Photoshop'] },
  { key: 'makkelijk', name: 'Makkelijk', tag: 'foto di famiglia per un cliente', x: 23.5, z: 3, gen: true, base: [1.4, 6, 0],
    jobs: ['scrive le schede dei personaggi', 'prepara il prompt della foto di famiglia', 'controlla che la foto sembri spontanea'] },
  { key: 'italmanager', name: 'Italmanager · CROSSBAR', tag: 'carriera di Football Manager', x: 14.5, z: 18.5, gen: true, base: [1.5, 4, 0],
    jobs: ['scrive l’articolo della partita per CROSSBAR', 'prepara il prompt della copertina', 'disegna il bannerino della vittoria'] },
  { key: 'voce', name: 'Animazioni con voce', tag: 'voce clonata in locale', x: -1.95, z: 16.25, tool: 'blender', base: [1.35, 40, 0],
    jobs: ['genera la narrazione frase per frase', 'costruisce la scena in Blender'] },
  { key: 'clienti', name: 'Lavori per clienti', tag: 'codice e immagini', x: 1.95, z: -14.95, gen: true, base: [1.4, 6, 0],
    jobs: ['scrive il prompt per Nano Banana Pro', 'costruisce la pagina del cliente', 'confronta le varianti con le schede'] },
];
const BUILD = {
  // tre finestre del browser, una dietro l'altra, che si aprono a ventaglio quando si lavora
  sito(P, g) {
    const s = new THREE.Group(); s.position.y = 2.15; s.rotation.y = FACE; g.add(s);
    const W = [];
    for (let i = 0; i < 3; i++) {
      const w = new THREE.Group(); s.add(w);
      const sh = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.4), glowMat(COL.green, .06)); w.add(sh);
      const ln = lines([...R2(-1, -.7, 1, .7), ...Ln(-1, .45, 1, .45), ...(i === 0 ? [...R2(-.9, .52, -.82, .6), ...R2(-.76, .52, -.68, .6), ...Ln(-.7, .2, .7, .2), ...Ln(-.7, .05, .3, .05), ...R2(-.7, -.55, -.05, -.15), ...R2(.08, -.55, .7, -.15)] : [])]);
      w.add(ln); P.tint.push(sh.material, ln.material); W.push(w);
    }
    P.anim = (t, busy) => W.forEach((w, i) => { const f = busy ? .55 : .35; w.position.set(i * f * .5, i * .14 + Math.sin(t * 1.2 + i) * .05, -i * f); w.rotation.y = busy ? Math.sin(t * .8 + i) * .12 : 0; });
    P.topY = 3.1;
  },
  // Sleep Physics: una teca di vetro dove le sfere cadono e rimbalzano, come nel gioco
  sleep(P, g) {
    const box = new THREE.Mesh(B(1.7, 2.1, 1.7), glowMat(COL.green, .05)); box.position.y = 1.4; g.add(box);
    const frame = new THREE.LineSegments(new THREE.EdgesGeometry(B(1.7, 2.1, 1.7)), lineMat(.7)); frame.position.y = 1.4; g.add(frame);
    P.tint.push(box.material, frame.material);
    const COLS = [0xff8fa3, 0xffd166, 0x77e7b7, 0x7fb8ff, 0xc49bff, 0xffa36c];
    const balls = COLS.map((c, i) => {
      const r = .14 + (i % 3) * .06;
      const m = mesh(new THREE.SphereGeometry(r, 18, 14), mat(c, c, .35), g, (Math.random() - .5) * 1.1, .4 + Math.random() * 1.8, (Math.random() - .5) * 1.1, null);
      return { m, r, v: 0 };
    });
    let lt = 0;
    P.anim = (t, busy) => {
      const dt = Math.min(.05, Math.max(0, t - lt)); lt = t;
      balls.forEach(b => {
        b.v -= dt * (busy ? 9 : 4); b.m.position.y += b.v * dt;
        const floor = .38 + b.r;
        if (b.m.position.y < floor) { b.m.position.y = floor; b.v = Math.abs(b.v) * .62; if (b.v < .5) { b.m.position.y = 2.2; b.v = 0; b.m.position.x = (Math.random() - .5) * 1.1; b.m.position.z = (Math.random() - .5) * 1.1; } }
      });
    };
    P.topY = 2.9;
  },
  // un grande telefono col QR e i telefoni degli studenti che gli girano attorno
  esercizi(P, g) {
    const ph = new THREE.Group(); ph.position.y = 1.5; ph.rotation.y = FACE; g.add(ph);
    mesh(B(1, 1.9, .12), mat(0x111a19), ph, 0, 0, 0, COL.edge, .9);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(.86, 1.7), glowMat(COL.green, .1)); scr.position.z = .07; ph.add(scr);
    const qr = lines([...R2(-.3, .1, -.06, .34), ...R2(.06, .1, .3, .34), ...R2(-.3, -.26, -.06, -.02), ...R2(.08, -.18, .15, -.11), ...R2(.19, -.06, .27, .02), ...R2(.06, -.3, .3, -.24), ...Ln(-.2, -.6, .2, -.6)], .075);
    ph.add(qr); P.tint.push(scr.material, qr.material);
    const orbit = new THREE.Group(); orbit.position.y = 1.4; g.add(orbit);
    const minis = Array.from({ length: 7 }, () => mesh(B(.15, .28, .03), mat(0x111a19, COL.green, .4), orbit, 0, 0, 0, null));
    P.anim = (t, busy) => minis.forEach((m, i) => {
      const a = t * (busy ? 1.1 : .35) + i / 7 * 6.283;
      m.position.set(Math.cos(a) * 1.3, Math.sin(t * 2 + i) * .22, Math.sin(a) * 1.3); m.rotation.y = -a;
      m.material.emissiveIntensity = .25 + (Math.sin(t * (busy ? 6 : 2) + i * 2.3) > .75 ? 1.6 : 0);   // uno studente vota
    });
    P.topY = 2.8;
  },
  // Eidolon Noeima: un busto olografico che ruota, attraversato da un anello di scansione
  eidolon(P, g) {
    const bust = new THREE.Group(); bust.position.y = .3; g.add(bust);
    const wire = geo => { const l = new THREE.LineSegments(new THREE.WireframeGeometry(geo), lineMat(.55)); bust.add(l); P.tint.push(l.material); return l; };
    wire(new THREE.SphereGeometry(.48, 12, 9)).position.y = 1.85;
    wire(new THREE.CylinderGeometry(.16, .2, .4, 8, 1, true)).position.y = 1.3;
    const sh = wire(new THREE.SphereGeometry(.8, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2.3)); sh.position.y = .55; sh.scale.set(1, .8, .62);
    const scan = new THREE.Mesh(new THREE.TorusGeometry(.62, .02, 6, 40), glowMat(COL.green, .8)); scan.rotation.x = Math.PI / 2; g.add(scan); P.tint.push(scan.material);
    P.anim = (t, busy) => { bust.rotation.y = t * (busy ? .9 : .3); scan.position.y = 1.2 + Math.sin(t * (busy ? 2.4 : 1)) * 1; };
    P.topY = 3;
  },
  // Makkelijk: polaroid di famiglia aperte a ventaglio
  makkelijk(P, g) {
    const fan = new THREE.Group(); fan.position.y = 1.3; fan.rotation.y = FACE; g.add(fan);
    const shots = [-2, -1, 0, 1].map((k, i) => {
      const p = new THREE.Group(); fan.add(p);
      mesh(B(.8, .95, .02), mat(0xf1efe8, 0xf1efe8, .15), p, 0, 0, 0, null);
      const ph = new THREE.Mesh(new THREE.PlaneGeometry(.66, .62), glowMat(COL.green, .25)); ph.position.set(0, .1, .02); p.add(ph);
      const ln = lines(PICTURE.map(([x, y]) => [x * .38, y * .5]), .025); ln.position.y = .1; p.add(ln);
      P.tint.push(ph.material, ln.material);
      return { p, a: (k + .5) * .28, i };
    });
    P.anim = (t, busy) => shots.forEach(({ p, a, i }) => {
      const open = busy ? 1.3 : 1;
      p.rotation.z = -a * open + Math.sin(t * 1.3 + i) * .03; p.position.set(Math.sin(a * open) * .5, Math.cos(a * open) * .15 - .15, i * .03);
    });
    P.topY = 2.6;
  },
  // Italmanager · CROSSBAR: un campetto con la porta, un pallone che prende la traversa e la copertina che gira sopra
  italmanager(P, g) {
    const field = new THREE.Group(); field.position.y = .33; field.rotation.y = FACE; g.add(field);
    const turf = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), glowMat(COL.green, .08)); turf.rotation.x = -Math.PI / 2; field.add(turf);
    const pitch = lines([...R2(-1.1, -.75, 1.1, .75), ...Ln(0, -.75, 0, .75), ...circ(0, 0, .25, 18), ...R2(.8, -.35, 1.1, .35), ...R2(-1.1, -.35, -.8, .35)]);
    pitch.rotation.x = -Math.PI / 2; field.add(pitch); P.tint.push(turf.material, pitch.material);
    const W = mat(0xf2f2ee, 0xffffff, .25);
    mesh(new THREE.CylinderGeometry(.025, .025, .55, 8), W, field, 1.1, .27, -.32, null);
    mesh(new THREE.CylinderGeometry(.025, .025, .55, 8), W, field, 1.1, .27, .32, null);
    const bar = mesh(new THREE.CylinderGeometry(.025, .025, .66, 8), W, field, 1.1, .55, 0, null); bar.rotation.x = Math.PI / 2;
    const ball = mesh(new THREE.SphereGeometry(.07, 14, 10), mat(0xffffff, 0xffffff, .3), field, 0, .07, 0, null);
    const cover = new THREE.Group(); cover.position.y = 2.35; g.add(cover);
    const page = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.2), glowMat(COL.green, .1)); cover.add(page);
    const art = lines([...R2(-.45, -.6, .45, .6), ...R2(-.36, .34, .36, .5), ...Ln(-.3, .42, .3, .42), ...PICTURE.map(([x, y]) => [x * .42, y * .4 - .05]), ...Ln(-.36, -.48, .1, -.48)]);
    cover.add(art); P.tint.push(page.material, art.material);
    P.anim = (t, busy) => {
      // tiro da metà campo: il pallone sale, prende la traversa e torna indietro rimbalzando
      const k = (t * (busy ? .9 : .45)) % 1;
      if (k < .55) { const s = k / .55; ball.position.set(-.2 + s * 1.27, .07 + Math.sin(s * Math.PI * .5) * .48, Math.sin(s * 3) * .05); }
      else { const s = (k - .55) / .45; ball.position.set(1.07 - s * 1.1, .07 + Math.abs(Math.sin(s * Math.PI * 2.2)) * .48 * (1 - s), .15 * s); }
      bar.material.emissiveIntensity = k > .53 && k < .6 ? 1.2 : .25;          // la traversa si accende quando la colpisce
      cover.rotation.y = t * (busy ? .8 : .3); cover.position.y = 2.35 + Math.sin(t * 1.2) * .08;
    };
    P.topY = 3.1;
  },
  // un microfono dentro un anello di barre che seguono la voce
  voce(P, g) {
    mesh(new THREE.CylinderGeometry(.05, .05, 1.2, 8), mat(0x1b2a27), g, 0, .9, 0, null);
    mesh(new THREE.CapsuleGeometry(.27, .32, 6, 14), mat(0x1a2523, COL.green, .2), g, 0, 1.75, 0, null);
    const grill = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.CapsuleGeometry(.29, .32, 3, 10)), lineMat(.45));
    grill.position.y = 1.75; g.add(grill); P.tint.push(grill.material);
    const bars = Array.from({ length: 28 }, (_, i) => {
      const a = i / 28 * 6.283, b = new THREE.Mesh(B(.07, 1, .07), new THREE.MeshBasicMaterial({ color: COL.green, transparent: true, opacity: .8 }));
      b.position.set(Math.cos(a) * .78, .35, Math.sin(a) * .78); g.add(b); P.tint.push(b.material); return b;
    });
    P.anim = (t, busy) => bars.forEach((b, i) => {
      const h = .08 + Math.abs(Math.sin(t * (busy ? 6 : 2) + i * .7) * Math.sin(t * 1.3 + i * .23)) * (busy ? 1.2 : .45);
      b.scale.y = h; b.position.y = .3 + h / 2;
    });
    P.topY = 2.5;
  },
  // un cavalletto con l'immagine e il codice che gli gira accanto: immagini e pagine per i clienti
  clienti(P, g) {
    const e = new THREE.Group(); e.rotation.y = FACE; g.add(e);
    for (const x of [-.55, .55]) mesh(B(.06, 2.1, .06), mat(0x1b2a27), e, x, 1.05, -.15, null).rotation.x = .1;
    const fr = new THREE.Group(); fr.position.set(0, 1.85, 0); fr.rotation.x = -.1; e.add(fr);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.15), glowMat(COL.green, .08)); fr.add(sh);
    const ln = lines([...R2(-.85, -.58, .85, .58), ...PICTURE]); fr.add(ln);
    const code = lines([...Ln(-.3, .25, -.55, 0), ...Ln(-.55, 0, -.3, -.25), ...Ln(.3, .25, .55, 0), ...Ln(.55, 0, .3, -.25), ...Ln(.12, .32, -.12, -.32)]);
    code.position.set(.95, 2.85, .2); e.add(code);
    P.tint.push(sh.material, ln.material, code.material);
    P.anim = (t, busy) => { code.rotation.y = t * (busy ? 2.2 : .7); code.position.y = 2.85 + Math.sin(t * 1.7) * .12; };
    P.topY = 3.1;
  },
};
const _sp = new Float32Array(16 * 3);
function project(P) {
  const g = new THREE.Group(); g.position.set(P.x, 0, P.z); rig.add(g);
  const [r, seg, rot] = P.base;
  mesh(new THREE.CylinderGeometry(r, r + .15, .28, seg), mat(COL.pad), g, 0, .14, 0, COL.green, .45).rotation.y = rot;
  P.ticks = [];
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2, t = new THREE.Mesh(B(.16, .05, .08), new THREE.MeshBasicMaterial({ color: 0x24403a }));
    t.position.set(Math.cos(a) * r * .74, .31, Math.sin(a) * r * .74); t.rotation.y = -a; g.add(t); P.ticks.push(t);
  }
  P.tint = [];
  BUILD[P.key](P, g);
  // un filo di dati che sale dalla base: più fitto quando qualcuno ci lavora
  P.streamGeo = new THREE.BufferGeometry(); P.streamGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(16 * 3), 3));
  P.stream = new THREE.Points(P.streamGeo, new THREE.PointsMaterial({ color: COL.green, size: 3, sizeAttenuation: false, transparent: true, opacity: .2, blending: THREE.AdditiveBlending, depthWrite: false }));
  P.seeds = Array.from({ length: 16 }, () => [Math.random() * 6.283, Math.random(), .35 + Math.random() * .7]);
  g.add(P.stream); P.tint.push(P.stream.material);
  P.group = g; P.progress = Math.random() * .5; P.busy = null;
  P.port = new THREE.Vector3(P.x, 0, P.z).multiplyScalar(1 - 2.1 / Math.hypot(P.x, P.z));
  clickable(g, P.key);
  P.lbl = label(g, P.topY + .45, '', `<b>${P.name}</b>${P.tag}`);
  P.top = at(g, P.topY - .5);
  cable(P.x, P.z);
}
PROJECTS.forEach(project);
function stepProjects(dt) {
  for (const P of PROJECTS) {
    const c = P.busy ? P.busy.hex : COL.green;
    P.tint.forEach(m => m.color.setHex(c));
    P.flash = Math.max(0, (P.flash || 0) - dt * .8);
    P.group.scale.setScalar(1 + P.flash * .08);
    const lit = Math.round(P.progress * P.ticks.length);
    P.ticks.forEach((t, i) => t.material.color.setHex(i < lit ? c : 0x24403a));
    if (!isLive(P.key)) { P.stream.material.opacity = 0; continue; }
    P.anim(clock, !!P.busy);
    const a = P.streamGeo.attributes.position, sp = P.busy ? 1.7 : .6;
    P.seeds.forEach(([ang, ph, rr], i) => {
      const k = (clock * .35 * sp + ph) % 1, an = ang + clock * .6;
      a.setXYZ(i, Math.cos(an) * rr, .35 + k * (P.topY - .2), Math.sin(an) * rr);
    });
    a.needsUpdate = true;
    P.stream.material.opacity = P.busy ? .85 : .25;
  }
}
const byKey = Object.fromEntries(PROJECTS.map(P => [P.key, P]));
for (const P of PROJECTS) if (P.out) arc(new THREE.Vector3(P.x, 2.8, P.z), new THREE.Vector3(online.position.x, 2, online.position.z), 1.5, COL.green, .3);
arc(new THREE.Vector3(byKey.eidolon.x, .05, byKey.eidolon.z), new THREE.Vector3(byKey.makkelijk.x, .05, byKey.makkelijk.z), 1.2, COL.green, .3);   // due lavori di ritratti e foto
arc(new THREE.Vector3(byKey.esercizi.x, 1, byKey.esercizi.z), new THREE.Vector3(byKey.sito.x, 1, byKey.sito.z), 2, COL.green, .3);
arc(new THREE.Vector3(byKey.clienti.x, .05, byKey.clienti.z), new THREE.Vector3(higgs.position.x, .05, higgs.position.z), .8);
arc(new THREE.Vector3(byKey.clienti.x, .05, byKey.clienti.z), new THREE.Vector3(client.position.x, .05, client.position.z), .8, COL.client, .5);

// ---------- bot Telegram + Gemini ----------
const bot = new THREE.Group(); bot.position.set(-6.5, 0, -16.9); rig.add(bot);
pad(bot);
const phone = mesh(B(.12, 1.1, .6), mat(0x101817, COL.gemini, .1), bot, .6, .75, .7, 0x6c64a8);
const eye = mesh(new THREE.SphereGeometry(.42, 24, 18), mat(0x1a1740, COL.gemini, .9), bot, -.3, 1.25, -.3, null);
const eyeRing = new THREE.Mesh(new THREE.TorusGeometry(.66, .035, 8, 48), new THREE.MeshBasicMaterial({ color: COL.gemini }));
eyeRing.position.set(-.3, 1.25, -.3); bot.add(eyeRing);
clickable(bot, 'bot');
label(bot, 2.2, 'agent', '<b>Gemini · bot Telegram</b>guarda i reel e i video', CSS.gemini);
cable(bot.position.x, bot.position.z);
buildBrainPoints();
const EYE = at(eye, 0), PHONE = at(phone, .5);

// ---------- gli assistenti ----------
function robot(color, scale = 1) {
  const g = new THREE.Group(); g.scale.setScalar(scale); rig.add(g);
  const body = new THREE.Group(); g.add(body);
  mesh(B(.62, .52, .56), mat(0x16201f), body, 0, .52, 0, color, .9);
  const visor = mesh(B(.64, .12, .4), mat(0x000000, color, 1.6), body, 0, .6, 0, null);
  mesh(B(.04, .3, .04), mat(0x1c2725), body, 0, .92, 0, null);
  mesh(new THREE.SphereGeometry(.07, 10, 8), mat(0x000000, color, 2), body, 0, 1.1, 0, null);
  const pack = mesh(B(.26, .32, .05), mat(0xdfe9e4, color, .5), g, 0, 1.45, 0, null);
  pack.visible = false;
  return { g, body, pack, visor };
}
const ringPos = a => new THREE.Vector3(Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4);
const AGENTS = [];
let where = 'pc', lastPC = 'pc';
function addAgent(o) {
  const A = { ...o, ...robot(o.hex, o.scale || 1) };
  A.g.position.copy(ringPos(o.angle));
  A.state = 'read'; A.t = o.delay || 0; A.dur = 1.2; A.job = null;
  clickable(A.g, A.key);
  A.lbl = label(A.g, 1.75 * (o.scale || 1), 'agent', `<b></b><i>legge il Diario</i>`, A.color);
  A.nameEl = A.lbl.el.querySelector('b'); A.actEl = A.lbl.el.querySelector('i');
  A.nameEl.textContent = A.names ? `${A.name} · ${A.names[lastPC]}` : A.name;
  A.head = at(A.g, 1.1 * (o.scale || 1));
  AGENTS.push(A); return A;
}

// ---------- Diario e statistiche ----------
const logEl = document.getElementById('log'), clockEl = document.getElementById('clock');
let simMin = 9 * 60, diary = 0, approved = 0;
const hhmm = () => `${String(Math.floor(simMin / 60) % 24).padStart(2, '0')}:${String(Math.floor(simMin % 60)).padStart(2, '0')}`;
function log(text, color = CSS.green) {
  if (!story) audio.play('tick', 0, .3);
  const li = document.createElement('li');
  li.style.setProperty('--c', color);
  li.innerHTML = `<time>${hhmm()}</time><span class="d"></span><span>${text}</span>`;
  logEl.prepend(li);
  while (logEl.children.length > 8) logEl.lastChild.remove();
}
const who = A => `<b style="color:${A.color}">${A.nameEl.textContent}</b>`;
const S = id => document.getElementById(id);
const WHERE = { pc: 'PC fisso', mac: 'MacBook', sofa: 'divano · in pausa', walk: 'si sta spostando' };
function stats() {
  S('s-pc').textContent = WHERE[where];
  S('s-proj').textContent = PROJECTS.length;
  S('s-ag').textContent = AGENTS.length + DRONES.length + 1;
  S('s-diary').textContent = diary; S('s-ok').textContent = approved;
}

const claude = addAgent({ key: 'claude', name: 'Claude Code', color: CSS.claude, hex: COL.claude, angle: -.8 });
const codex = addAgent({ key: 'codex', name: 'ChatGPT · Codex', color: CSS.codex, hex: COL.codex, angle: 2.4, delay: .8 });

// ---------- sub-agent: droni che portano i dati da un punto all'altro ----------
// Claude e Codex affidano i compiti più lunghi ai loro sub-agent: cercano, pianificano, controllano, portano risultati.
const rndP = () => PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
const projSpot = P => at(P.group, P.topY - .2);
const SPOTS = {
  brain: out => out.copy(ball.position), bot: at(eye, .7), ps: at(ps, 1.7), c4d: at(c4d, 1.8), blender: at(blender, 1.8),
  higgs: at(higgs, 1.6), pc: at(pc, 2.3), mac: at(mac, 1.9), online: at(cloud, .7),
};
const ROUTES = [
  () => { const P = rndP(); return [SPOTS.brain, projSpot(P), `porta il brief a «${P.name}»`]; },
  () => { const P = rndP(); return [projSpot(P), SPOTS.brain, `riporta nel Diario i risultati di «${P.name}»`]; },
  () => { const P = rndP(); return [SPOTS.brain, projSpot(P), `cerca nei file quello che serve a «${P.name}»`]; },
  () => { const P = rndP(); return [SPOTS.bot, projSpot(P), `porta il resoconto di Gemini a «${P.name}»`]; },
  () => [SPOTS.higgs, SPOTS.ps, 'porta in Photoshop le immagini scelte'],
  () => { const P = Math.random() < .5 ? byKey.sito : byKey.esercizi; return [projSpot(P), SPOTS.online, `controlla la versione online di «${P.name}»`]; },
  () => [SPOTS.c4d, projSpot(byKey.sito), 'porta un render di Cinema 4D al sito dei corsi'],
  () => [SPOTS.blender, projSpot(byKey.voce), "porta la scena di Blender all'animazione"],
  () => [SPOTS.pc, SPOTS.mac, 'controlla che il Mac abbia gli stessi file'],
];
const DRONES = [];
function drone(owner, name, hex, color) {
  const g = new THREE.Group(); rig.add(g);
  mesh(B(.38, .1, .38), mat(0x16201f, hex, .3), g, 0, 0, 0, hex, .9);
  const rotors = [];
  for (const [x, z] of [[-.3, -.3], [.3, -.3], [-.3, .3], [.3, .3]]) {
    mesh(B(.3, .03, .04), mat(0x1c2725), g, x / 2, .02, z / 2, null).rotation.y = Math.atan2(x, z) + Math.PI / 2;
    const r = new THREE.Mesh(new THREE.CylinderGeometry(.15, .15, .01, 16), glowMat(hex, .3)); r.position.set(x, .07, z); g.add(r); rotors.push(r);
  }
  mesh(new THREE.SphereGeometry(.055, 8, 6), new THREE.MeshBasicMaterial({ color: hex }), g, 0, -.08, 0, null);
  const cargo = mesh(B(.2, .2, .2), mat(0xdfe9e4, hex, .9), g, 0, -.25, 0, null); cargo.visible = false;
  const D = { g, rotors, cargo, owner, name, color, hex, state: 'idle', t: Math.random() * 3, dur: 1 };
  g.position.copy(ball.position).add(new THREE.Vector3((Math.random() - .5) * 5, 1 + Math.random(), (Math.random() - .5) * 5));
  clickable(g, 'drone');
  label(g, .38, 'drone', `<b>${name}</b>`, color);
  DRONES.push(D); return D;
}
[['Claude', 'Explore'], ['Claude', 'Plan'], ['Claude', 'Verifica'], ['Codex', 'Codex · worker'], ['Codex', 'Codex · worker']]
  .forEach(([o, n]) => drone(o, n, o === 'Claude' ? COL.claude : COL.codex, o === 'Claude' ? CSS.claude : CSS.codex));
const _q = new THREE.Vector3(), _dm = new THREE.Vector3();
function fly(D, getTo, state) {
  D.from = D.g.position.clone(); D.getTo = getTo; D.state = state; D.t = 0;
  getTo(_q); D.dur = Math.max(.9, D.from.distanceTo(_q) / 8.5);
}
function send(D, a, b, task) { D.next = b; D.task = task; fly(D, a, 'fetch'); }
function stepDrone(D, dt) {
  const show = isLive('drone');
  D.g.scale.setScalar(THREE.MathUtils.lerp(D.g.scale.x, show ? 1 : .001, Math.min(1, dt * 5)));
  if (!show) return;
  D.t += dt;
  D.rotors.forEach((r, i) => { r.rotation.y += dt * (28 + i); });
  if (D.state === 'idle') {
    D.g.position.y += Math.sin(clock * 3 + D.g.id) * .004;
    if (D.t > 1.4 && !story) { const [a, b, task] = ROUTES[Math.floor(Math.random() * ROUTES.length)](); send(D, a, b, task); }
  } else {
    const k = Math.min(1, D.t / D.dur), e = k * k * (3 - 2 * k), u = 1 - e;
    D.getTo(_q);
    _dm.copy(D.from).lerp(_q, .5); _dm.y = Math.max(D.from.y, _q.y) + 1.4 + D.from.distanceTo(_q) * .12;
    D.g.position.set(u * u * D.from.x + 2 * u * e * _dm.x + e * e * _q.x, u * u * D.from.y + 2 * u * e * _dm.y + e * e * _q.y, u * u * D.from.z + 2 * u * e * _dm.z + e * e * _q.z);
    D.g.rotation.z = Math.sin(k * Math.PI) * .22;
    if (k >= 1) {
      if (D.state === 'fetch') {
        D.cargo.visible = true; audio.play('pop', 7, story ? .2 : .8);
        if (Math.random() < .3 && !story) log(`Un sub-agent di ${D.owner} <b style="color:${D.color}">(${D.name})</b> ${D.task}.`, D.color);
        fly(D, D.next, 'carry');
      } else { D.cargo.visible = false; D.state = 'idle'; D.t = 0; audio.play('pop', 12, story ? .2 : .8); }
    }
  }
  D.g.rotation.y += dt * .7;
}

// ---------- vita del mondo: onda dal cervello, lampeggi, la sfera che oscilla ----------
function stepWorld(dt) {
  const s = (clock % 4.5) / 4.5; sonar.scale.setScalar(1 + s * 17); sonar.material.opacity = story ? 0 : (1 - s) * .4;
  PYLONS.forEach((p, i) => p.lamp.material.color.setHex(!story && Math.sin(clock * 3 + i * 1.7) > .6 ? 0xffffff : COL.green));
  if (!isLive('brain')) return;
  // la sfera oscilla appesa ai cavi
  ball.position.set(Math.sin(clock * .41) * .18, BY + Math.sin(clock * .63) * .16, Math.cos(clock * .33) * .15);
  ball.rotation.set(Math.sin(clock * .29) * .08, Math.sin(clock * .17) * .14, Math.cos(clock * .23) * .07);
  ball.updateMatrix(); CABLES.forEach(updateCable);
  floorGlow.material.opacity = .07 + Math.sin(clock * 2) * .025;
}

// ---------- Giovanni si sposta: PC, divano, Mac ----------
let gioPath = null, moveT = 0, placeIdx = 0;
const PLACES = ['pc', 'sofa', 'mac', 'sofa'];
function goTo(to, quiet) {
  const from = gio.position.clone();
  const mid = from.clone().lerp(SEAT[to], .5); mid.x = Math.max(mid.x, -9.1); mid.y = 0;
  gioPath = { pts: [from, mid, SEAT[to].clone()], i: 0, k: 0, to };
  gioPhone.visible = false; where = 'walk';
  if (!quiet) {
    if (to === 'sofa') log('Giovanni va in pausa: divano, TV, telefono in mano. Gli assistenti continuano a lavorare.');
    else log(`Giovanni passa al ${to === 'pc' ? 'PC fisso' : 'MacBook'}: gli assistenti ripartono dal Diario, non da zero.`);
  }
}
function arrived(to) {
  where = to;
  if (to !== 'sofa') lastPC = to;
  gioPhone.visible = to === 'sofa';
  gioSub.textContent = to === 'sofa' ? 'in pausa, col telefono' : 'chiede, corregge, approva';
  AGENTS.forEach(A => { if (A.names) A.nameEl.textContent = `${A.name} · ${A.names[lastPC]}`; });
  screenMats.pc.forEach(m => { m.emissiveIntensity = to === 'pc' ? .55 : .05; });
  screenMats.mac.forEach(m => { m.emissiveIntensity = to === 'mac' ? .7 : .05; });
}
arrived('pc');
function stepGio(dt) {
  if (!gioPath) return;
  const P = gioPath, a = P.pts[P.i], b = P.pts[P.i + 1];
  P.k += dt * 5.5 / Math.max(a.distanceTo(b), .01);
  P.st = (P.st || 0) + dt; if (P.st > .3) { P.st = 0; audio.play('step'); }      // i passi di Giovanni
  gio.position.lerpVectors(a, b, Math.min(1, P.k));
  if (P.k >= 1) { P.i++; P.k = 0; if (P.i >= P.pts.length - 1) { gioPath = null; arrived(P.to); } }
}

// ---------- il lavoro degli assistenti (simulazione libera) ----------
const SPEED = 6.2;
function pickJob(A) {
  const free = PROJECTS.filter(P => !P.busy);
  if (!free.length) return null;
  const P = free[Math.floor(Math.random() * free.length)];
  P.busy = A; A.job = P; A.task = P.jobs[Math.floor(Math.random() * P.jobs.length)];
  return P;
}
function setState(A, s, dur) { A.state = s; A.t = 0; A.dur = dur; }
function walkTo(A, to, state) {
  A.from = A.g.position.clone(); A.to = to.clone();
  setState(A, state, Math.max(.4, A.from.distanceTo(A.to) / SPEED));
}
let parallelT = 14, geminiBusy = 0;
function stepAgent(A, dt) {
  A.t += dt;
  const walking = A.state === 'go' || A.state === 'back' || A.state === 'smove';
  if (walking) {
    const k = Math.min(1, A.t / A.dur), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    A.g.position.lerpVectors(A.from, A.to, e);
    _p.subVectors(A.to, A.from); if (_p.lengthSq() > .01) A.g.rotation.y = Math.atan2(_p.x, _p.z);
    if (k >= 1) {
      if (A.state === 'go') startWork(A);
      else if (A.state === 'back') { A.actEl.textContent = 'scrive nel Diario'; setState(A, 'write', 1); beam(A.head, BRAIN_TOP, A.hex, 1, { h: .8 }); }
      else setState(A, 'sidle', 0);
    }
  } else if (A.state === 'read' && A.t > A.dur && !story) {
    const P = pickJob(A);
    if (!P) { A.t = 0; return; }
    if (A.mini) log(`${who(A)} parte per «${P.name}»: ${A.task}.`, A.color);
    else if (where === 'sofa') {
      log(`Dal divano, Giovanni chiede a ${who(A)}: «${A.task}». La sessione gira sul PC, lui la guida dal telefono.`, A.color);
      beam(GIO, A.head, COL.gemini, 1.6, { h: 2 });
    } else {
      log(`Giovanni chiede a ${who(A)}: «${A.task}». Rilegge il Diario e parte.`, A.color);
      beam(GIO, A.head, COL.green, 1.4, { h: 1.4 });
    }
    A.actEl.textContent = `va a: ${P.name}`; A.pack.visible = true;
    walkTo(A, P.port, 'go');
  } else if (A.state === 'work') {
    const P = A.job; P.progress = Math.min(1, P.progress + dt * (A.mini ? .06 : .09));
    if (A === claude && !A.askedGemini && A.t > A.dur * .4 && Math.random() < dt * .25) {
      A.askedGemini = true;
      log(`${who(A)} chiede a Gemini, via API, di guardare un video per «${P.name}».`, CSS.gemini);
      beam(A.head, EYE, COL.gemini, 2.6, { both: true, h: 2.6 }); geminiBusy = 2.6; audio.play('bloop', 0, 1);
    }
    if (A.t > A.dur) {
      const a = Math.atan2(A.g.position.z, A.g.position.x);
      A.pack.visible = true; A.actEl.textContent = 'torna al cervello centrale';
      walkTo(A, ringPos(a), 'back');
    }
  } else if (A.state === 'write' && A.t > A.dur) {
    const P = A.job; diary++;
    A.pack.visible = false;
    if (P.progress >= .99) {
      log(`${who(A)}: «${P.name}» è pronto. Chiede l'ok a Giovanni.`, A.color);
      beam(A.head, GIO, A.hex, 1.4, { h: 1.4, onEnd: () => ask(P) });
    } else log(`${who(A)} scrive nel Diario: «${A.task}», a buon punto.`, A.color);
    P.busy = null; A.job = null;
    if (A.mini) { A.state = 'gone'; A.t = 0; return; }
    A.actEl.textContent = 'aspetta la prossima richiesta';
    setState(A, 'read', .8 + Math.random() * 1.4);
    if (A === claude && parallelT <= 0 && !story) spawnMinis();
  } else if (A.state === 'gone') {
    A.g.scale.multiplyScalar(1 - Math.min(1, dt * 4));
    if (A.g.scale.x < .05) { rig.remove(A.g); AGENTS.splice(AGENTS.indexOf(A), 1); clickables.splice(clickables.indexOf(A.g), 1); }
  }
  A.body.position.y = walking ? Math.abs(Math.sin(clock * 11)) * .1 : isLive(A.key) ? Math.sin(clock * 2.2 + A.g.id) * .03 : 0;
  A.visor.material.emissiveIntensity = A.state === 'work' || A.state === 'sidle' && A.busyLook ? 1.4 + Math.sin(clock * 8) * .6 : 1.4;
}
function startWork(A) {
  const P = A.job; A.askedGemini = false;
  A.actEl.textContent = A.task; A.pack.visible = false;
  setState(A, 'work', (A.mini ? 3.2 : 4.4) + Math.random() * 2.4);
  if (!A.mini) beam(GIO, P.top, A.hex, A.dur, { h: 2.2, op: .4, keep: () => A.state === 'work' && A.job === P });
  if (P.tool && /Photoshop|Cinema|Blender|scena/.test(A.task)) {
    beam(A.head, at(TOOLS[P.tool], 1.1), TOOLCOL[P.tool], A.dur * .8, { h: 1.6, both: true });
    log(`${who(A)} comanda ${TOOLTXT[P.tool]}.`, A.color);
  }
  if (P.gen && /prompt/.test(A.task) && !A.mini) imageFlow(A);
}
// dal prompt all'immagine finita: l'assistente scrive il prompt, Giovanni genera, l'immagine passa in Photoshop
function imageFlow(A) {
  log(`${who(A)} scrive il prompt per Nano Banana Pro: soggetto, luce, formato, immagini da allegare.`, A.color);
  beam(A.head, GIO, A.hex, 1.6, { h: 2.4, big: true, onEnd: () => {
    log('Giovanni incolla il prompt su Higgsfield e genera: i crediti sono suoi, decide lui quante prove fare.', CSS.amber);
    beam(GIO, at(higgs, 1.1), COL.amber, 1.6, { h: 2.6, onEnd: () => {
      higgs.userData.flash = 1; audio.play('ding', 5);
      log("L'immagine scelta passa in Photoshop: si corregge solo dove serve, sul file ad alta risoluzione.", CSS.ps);
      beam(at(higgs, 1.1), at(ps, 1.2), COL.amber, 2, { h: 4, big: true });
    } });
  } });
}
function spawnMinis() {
  parallelT = 26 + Math.random() * 10;
  if (PROJECTS.filter(P => !P.busy).length < 2 || AGENTS.length > 3) return;
  const m1 = addAgent({ key: 'mini', name: 'Sessione · Sonnet', color: CSS.mini, hex: 0xf4c9ae, angle: -.2, scale: .62, mini: true });
  const m2 = addAgent({ key: 'mini', name: 'Sessione · Haiku', color: CSS.mini, hex: 0xf4c9ae, angle: -1.4, scale: .62, mini: true, delay: .5 });
  m1.g.position.copy(claude.g.position); m2.g.position.copy(claude.g.position);
  log(`${who(claude)} apre due sessioni in parallelo: Sonnet per costruire, Haiku per controllare.`, CSS.claude);
}
const approvals = [];
function ask(P, deliver) {
  gioChip.hidden = false; gioChip.textContent = 'approva?';
  approvals.push({ P, t: 0, deliver });
}
function stepApprovals(dt) {
  if (!approvals.length) return;
  const a = approvals[0]; a.t += dt;
  if (a.t > 1.4 && !a.done) {
    a.done = true; approved++; gioChip.textContent = 'ok ✓'; audio.play('fanfare', 0, 1.5);
    a.P.flash = 1;
    if (a.P.out) { log(`Giovanni approva: «${a.P.name}» va online.`); beam(a.P.top, at(cloud, 0), COL.green, 1.8, { h: 2.4 }); }
    else if (a.P.key === 'clienti') { log('Giovanni approva: il lavoro parte per il cliente.', CSS.client); beam(at(ps, 1.2), at(client, 1.3), COL.client, 2.2, { h: 4, big: true }); }
    else log(`Giovanni approva «${a.P.name}».`);
    if (!story) a.P.progress = .08 + Math.random() * .2;
  }
  if (a.t > 2.6) { approvals.shift(); gioChip.hidden = !approvals.length; }
}

// ---------- reel, telefono e pausa ----------
let reelT = 4, soloT = 9;
function sendReel() {
  log(where === 'sofa' ? 'Dal divano, Giovanni manda un reel al suo bot Telegram.' : 'Giovanni manda un reel al suo bot Telegram.', CSS.gemini);
  beam(GIO, PHONE, COL.gemini, 1.5, { h: 2, onEnd: () => {
    geminiBusy = 2.4; audio.play('bloop', 0, 1);
    setTimeout(() => {
      log('Gemini risponde in chat con il resoconto e salva la novità nel cervello centrale.', CSS.gemini);
      beam(EYE, GIO, COL.gemini, 1.6, { h: 2 });
      beam(EYE, BRAIN_TOP, COL.gemini, 1.6, { h: 1.2 });
    }, 2400);
  } });
}
function stepFree(dt) {
  if (story) return;
  reelT -= dt; soloT -= dt; moveT += dt; parallelT -= dt;
  if (reelT < 0) { reelT = where === 'sofa' ? 6 + Math.random() * 4 : 13 + Math.random() * 8; if (!gioPath) sendReel(); }
  if (soloT < 0 && !gioPath) {
    soloT = 13 + Math.random() * 9;
    if (where === 'sofa') log('Sul divano, TV accesa: Giovanni guarda le notifiche, gli assistenti lavorano da soli. L\'ecosistema glielo permette.');
    else if (where === 'pc' && Math.random() < .55) { log('Giovanni ritocca a mano in Photoshop la zona da correggere.', CSS.ps); beam(GIO, at(ps, 1.1), COL.ps, 2.4, { h: 1.4 }); }
    else { log('Giovanni rilegge il Diario e aggiunge una cosa da fare.'); beam(GIO, BRAIN_TOP, COL.green, 1.8, { h: 1.6 }); }
  }
  if (moveT > (where === 'sofa' ? 22 : 30) && !gioPath) { moveT = 0; placeIdx = (placeIdx + 1) % PLACES.length; goTo(PLACES[placeIdx]); }
}

// ---------- la storia guidata ----------
const storyEl = S('story');
let story = null;
const keepStep = i => () => story && story.i === i;
const later = (i, ms, fn) => setTimeout(() => { if (story && story.i === i) fn(); }, ms);
function moveAgent(A, to) { A.from = A.g.position.clone(); A.to = to.clone(); setState(A, 'smove', Math.max(.5, A.from.distanceTo(A.to) / SPEED)); }
const CL = byKey.clienti;
// durante il flusso guidato si muove solo quello che serve in quel momento: il resto si ferma e si attenua
const live = new Set();
const isLive = k => !story || live.has(k);
let bulbT = .7;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const STEPS = [
  { t: "Giovanni ha un'idea", p: "È in pausa sul divano, con la TV accesa e il telefono in mano. L'idea arriva lì, non per forza davanti al computer.",
    dur: 7, live: ['gio', 'sofa'],
    go(i) { shot(at(gio, .9), 2.8, TH0 + .55, 1.12, 1.5);
      later(i, 1600, () => { bulb.visible = true; bulb.scale.setScalar(.01); bulbT = .7; bulb.material.emissive.setHex(COL.amber); audio.play('sparkle'); });
      log("Giovanni ha un'idea per un cliente."); } },
  { t: 'Subito ne parla con Claude e ChatGPT', p: "Dal telefono scrive a Claude e a ChatGPT, per non perdere l'idea. Due primi pareri, ancora dal divano.",
    dur: 10.5, live: ['gio', 'sofa', 'claude', 'codex'],
    go(i) { shot(claude.head, 2.3, TH0, 1.02, 2.4);
      later(i, 1100, () => { moveAgent(claude, sofa.position.clone().add(V(2.1, 0, 2.3))); moveAgent(codex, sofa.position.clone().add(V(-2.1, 0, 2.1))); shot(claude.head, 1.8, TH0 + .3, 1.02, 2.2); });
      later(i, 5200, () => {
        beam(GIO, claude.head, COL.claude, 4, { both: true, h: 1, keep: keepStep(i) });
        beam(GIO, codex.head, COL.codex, 4, { both: true, h: .9, keep: keepStep(i) });
        shot(at(gio, .7), 2.3, TH0 + .55, 1.1, 1.6); });
      log('Dal telefono, Giovanni ne parla con Claude e con ChatGPT.'); } },
  { t: 'Poi va al PC e ci lavora da lì', p: "Il divano è servito ad accendere la scintilla. Al PC l'idea si valida, cambia, si rafforza: Giovanni porta le critiche dell'uno all'altro.",
    dur: 10.5, live: ['gio', 'sofa', 'pc', 'claude', 'codex'],
    go(i) { goTo('pc', true); shot(at(gio, 1), 1.9, TH0 + .15, 1.05, 2.8);
      later(i, 700, () => { moveAgent(claude, pc.position.clone().add(V(2.9, 0, -2.4))); moveAgent(codex, pc.position.clone().add(V(2.9, 0, 2.5))); });
      later(i, 5400, () => {
        shot(pc.position.clone().add(V(1.6, 1, 0)), 2.2, TH0 - .3, 1.02, 1.8);
        beam(claude.head, GIO, COL.claude, 1.8, { h: 1.2, onEnd: () => beam(GIO, codex.head, COL.claude, 1.8, { h: 1 }) }); });
      later(i, 8200, () => { bulbT = 1.25; bulb.material.emissive.setHex(COL.green); audio.play('sparkle'); });
      log("Giovanni va al PC: l'idea si valida e si rafforza."); } },
  { t: 'Il brief va nel cervello centrale', p: "Quando l'idea regge, Giovanni la scrive nel cervello centrale: obiettivo, regole, materiali. Da qui partono tutti, su qualunque computer.",
    dur: 8.5, live: ['gio', 'pc', 'brain'],
    go(i) { bulbT = .01;
      const b = beam(GIO, BRAIN_TOP, COL.green, 3.4, { h: 2.2, big: true, once: true, onEnd: () => { brainFlash = 1; diary++; audio.play('brain'); } });
      shot(at(gio, 1), 2, TH0, 1.02, 2.5);
      later(i, 500, () => follow(b, 1.8, TH0 + .1, 1.05));
      later(i, 3300, () => shot(BRAIN_TOP, 2.3, TH0 + .35, 1.3, 1.5));
      log('Giovanni scrive il brief nel cervello centrale.'); } },
  { t: 'Il lavoro si divide, anche coi sub-agent', p: "Claude scrive una parte del codice, Codex un'altra, leggendo lo stesso brief. I compiti lunghi (cercare, pianificare, controllare) li affidano ai sub-agent, che portano i dati.",
    dur: 11.5, live: ['brain', 'drone', 'clienti', 'claude', 'codex', 'gio', 'pc'],
    go(i) { bulb.visible = false; CL.busy = claude; CL.progress = .05;
      shot(BRAIN_TOP, 1.7, TH0 - .15, 1.1, 2);
      DRONES.forEach((D, k) => {
        D.g.position.copy(ball.position).add(V(Math.cos(k * 1.3) * 1.6, -.3, Math.sin(k * 1.3) * 1.6));
        later(i, 400 + k * 380, () => send(D, SPOTS.brain, projSpot(CL), 'porta il brief al progetto'));
      });
      later(i, 1500, () => shot(at(DRONES[0].g, 0), 1.7, TH0 - .15, 1.1, 3));
      later(i, 1800, () => { moveAgent(claude, CL.port.clone().add(V(-1, 0, -.3))); moveAgent(codex, CL.port.clone().add(V(.7, 0, .8))); });
      later(i, 6200, () => {
        shot(at(CL.group, 1.6), 1.7, TH0 + .2, 1.05, 1.8);
        beam(GIO, CL.top, COL.green, 4, { h: 2.4, op: .5, keep: keepStep(i) });
        beam(claude.head, CL.top, COL.claude, 4, { h: .6, keep: keepStep(i) });
        beam(codex.head, CL.top, COL.codex, 4, { h: .5, keep: keepStep(i) }); });
      log('Claude e Codex scrivono il codice; i loro sub-agent portano i dati.'); } },
  { t: "Serve un'immagine: il prompt", p: 'Claude (o ChatGPT) scrive il prompt per Nano Banana Pro: soggetto, luce, formato, immagini di riferimento da allegare e in che ordine.',
    dur: 8, live: ['claude', 'gio', 'clienti', 'pc'],
    go(i) { CL.busy = claude;
      shot(claude.head, 2.4, TH0 + .2, 1.05, 2.2);
      later(i, 1300, () => { const b = beam(claude.head, GIO, COL.claude, 3.6, { h: 3, big: true, once: true }); follow(b, 1.4, TH0, 1.02); });
      later(i, 5300, () => shot(at(gio, 1), 2.3, TH0 - .2, 1.05, 1.8));
      log('Claude scrive il prompt per Nano Banana Pro.', CSS.claude); } },
  { t: 'Giovanni genera su Higgsfield', p: 'Incolla il prompt su Higgsfield e genera. Decide lui quante prove fare, perché i crediti sono suoi, e sceglie la migliore.',
    dur: 8.5, live: ['gio', 'pc', 'higgs'],
    go(i) { const b = beam(GIO, at(higgs, 1.1), COL.amber, 3.8, { h: 3.4, once: true, onEnd: () => { higgs.userData.flash = 1; audio.play('ding', 5); } });
      later(i, 300, () => follow(b, 1.3, TH0, 1.02));
      later(i, 3900, () => shot(at(higgs, .9), 2.6, TH0 + .35, 1.1, 1.6));
      log('Giovanni genera su Higgsfield.', CSS.amber); } },
  { t: 'Rifinitura in Photoshop', p: "L'immagine scelta passa in Photoshop. Si corregge solo dove serve, sul file ad alta risoluzione; Claude può preparare livelli e maschere con uno script.",
    dur: 9.5, live: ['higgs', 'ps', 'gio', 'claude', 'pc'],
    go(i) { shot(at(higgs, .9), 2.2, TH0 + .35, 1.1, 2);
      later(i, 700, () => {
        const b = beam(at(higgs, 1.1), at(ps, 1.2), COL.amber, 4.4, { h: 4.5, big: true, once: true, onEnd: () => {
          beam(GIO, at(ps, 1.1), COL.ps, 3, { h: 1.4, keep: keepStep(i) });
          beam(claude.head, at(ps, 1.1), COL.ps, 3, { h: 2.5, both: true, keep: keepStep(i) }); } });
        follow(b, 1.1, TH0, 1.02); });
      later(i, 5300, () => shot(at(ps, .9), 2.3, TH0 - .35, 1.05, 1.6));
      log("L'immagine passa in Photoshop.", CSS.ps); } },
  { t: 'Giovanni controlla e consegna', p: 'Controlla tutto, da sé. Solo con il suo ok il lavoro parte per il cliente.',
    dur: 9.5, live: ['gio', 'ps', 'client', 'pc', 'clienti'],
    go(i) { CL.progress = 1;
      shot(at(gio, 1), 2.7, TH0 + .2, 1.05, 2);
      gioChip.hidden = false; gioChip.textContent = 'approva?';
      later(i, 1700, () => { gioChip.textContent = 'ok ✓'; approved++; CL.flash = 1; audio.play('fanfare'); log('Giovanni approva: il lavoro parte per il cliente.', CSS.client); });
      later(i, 2800, () => {
        const b = beam(at(ps, 1.2), at(client, 1.3), COL.client, 4.4, { h: 4.5, big: true, once: true, onEnd: () => { client.userData.flash = 1; audio.play('fanfare'); } });
        follow(b, 1.1, TH0, 1.02); });
      later(i, 7300, () => { gioChip.hidden = true; shot(at(client, .9), 2.6, TH0 + .3, 1.1, 1.6); }); } },
  { t: 'Tutto finisce nel Diario', p: "Claude e Codex scrivono cosa hanno fatto e cosa resta aperto. Domani, dal PC, dal Mac o dal divano, si riparte da qui.",
    dur: 9, live: ['claude', 'codex', 'brain', 'drone'],
    go(i) { CL.busy = null; moveAgent(claude, ringPos(-.8)); moveAgent(codex, ringPos(2.4));
      shot(BRAIN_TOP, 1.3, TH0, 1.05, 1.4);
      later(i, 2800, () => { beam(claude.head, BRAIN_TOP, COL.claude, 1.6, { h: 1 }); beam(codex.head, BRAIN_TOP, COL.codex, 1.6, { h: 1 }); diary += 2; audio.play('brain'); brainFlash = 1; });
      later(i, 5000, () => { const h = HOME(); shot(h.target, h.zoom / ZS, TH0, PH0, 1.2); });
      log('Claude e Codex scrivono nel Diario.'); } },
];
function startStory() {
  audio.init(); audio.setMode('story');
  story = { i: -1, t: 0 };
  approvals.length = 0; gioChip.hidden = true; bulb.visible = false;
  beams.forEach(b => { b.onEnd = null; b.keep = null; b.t = b.life; });       // spegne i lampi della giornata normale
  packets.forEach(q => { q.t = 1; });
  gioPath = null; gio.position.copy(SEAT.sofa); arrived('sofa');
  AGENTS.forEach(A => {
    if (A.job) { A.job.busy = null; A.job = null; }
    A.pack.visible = false; A.actEl.textContent = '';
    if (A.mini) { A.state = 'gone'; A.t = 0; } else { A.g.position.copy(ringPos(A === claude ? -.8 : 2.4)); setState(A, 'sidle', 0); }
  });
  PROJECTS.forEach(P => { P.busy = null; });
  DRONES.forEach(D => { D.state = 'idle'; D.t = 0; D.cargo.visible = false; });
  storyEl.hidden = false; S('b-story').setAttribute('aria-pressed', 'true'); box.parentElement.classList.add('in-story');
  goStep(0);
}
function goStep(i) {
  if (i < 0) i = 0;
  if (i >= STEPS.length) return endStory();
  story.i = i; story.t = 0;
  live.clear(); STEPS[i].live.forEach(k => live.add(k));
  S('story-n').textContent = `${String(i + 1).padStart(2, '0')} / ${String(STEPS.length).padStart(2, '0')}`;
  S('story-t').textContent = STEPS[i].t; S('story-p').textContent = STEPS[i].p;
  audio.play('babble', STEPS[i].t + ' ' + STEPS[i].p);         // il testo «parla» come nei videogiochi
  claude.actEl.textContent = ''; codex.actEl.textContent = '';
  STEPS[i].go(i);
}
function endStory() {
  audio.setMode('free');
  story = null; live.clear(); storyEl.hidden = true; S('b-story').setAttribute('aria-pressed', 'false'); box.parentElement.classList.remove('in-story');
  bulb.visible = false; gioChip.hidden = true; CL.busy = null; CL.progress = .1;
  AGENTS.forEach(A => { if (!A.mini) { setState(A, 'read', 1 + Math.random()); A.actEl.textContent = 'aspetta la prossima richiesta'; } });
  moveT = 0; reelT = 5; soloT = 9;
  const h = HOME(); shot(h.target, h.zoom / ZS, TH0, PH0, 1.4);
  log('Fine del flusso guidato: riprende la giornata normale.');
}
S('st-next').addEventListener('click', () => story && goStep(story.i + 1));
S('st-prev').addEventListener('click', () => story && goStep(story.i - 1));
S('st-exit').addEventListener('click', () => story && endStory());
S('b-story').addEventListener('click', () => story ? endStory() : startStory());

// ---------- vista ----------
function fit() {
  const r = box.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  const a = r.width / r.height;
  const H = small() ? 17.5 / Math.min(a, 1.1) : Math.max(17, 27.3 / a);
  Object.assign(camera, { left: -H * a, right: H * a, top: H, bottom: -H });
  camera.updateProjectionMatrix();
  pointsUniforms.uPR.value = renderer.getPixelRatio();
}
addEventListener('resize', fit); fit(); home();

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let down = null;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointermove', e => {
  if (down) return;
  const r = box.getBoundingClientRect();
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  canvas.style.cursor = ray.intersectObjects(clickables, true).length ? 'pointer' : 'grab';
});
addEventListener('pointerup', e => {
  if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6) {
    const r = box.getBoundingClientRect();
    ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(clickables, true)[0];
    if (hit) openCard(hit.object.userData.key); else closeCard();
  }
  down = null;
});

// ---------- schede ----------
const INFO = {
  brain: ['La memoria', 'Cervello centrale', 'Google Drive conserva la memoria comune, le istruzioni di ogni progetto e un Diario che dice cosa è stato fatto e cosa resta aperto. Non comanda: ricorda. Sta appeso ai suoi cavi, che lo legano a tutto il resto: nessun lavoro resta chiuso in una chat.', CSS.green],
  drone: ['Sub-agent', 'I sub-agent', 'Claude e Codex affidano i compiti lunghi a degli aiutanti: Explore cerca nei file, Plan prepara il piano, Verifica controlla. Lavorano in parallelo e riportano i risultati: qui volano da un punto all’altro portando i dati.', CSS.claude],
  gio: ['Chi decide', 'Giovanni', 'Il lavoro parte da lui: ha le idee, chiede agli assistenti, manda i reel al bot, genera le immagini, ritocca a mano, approva. Anche dal divano.', CSS.green],
  sofa: ['La pausa', 'Divano, TV, telefono', "Con l'ecosistema Giovanni può staccarsi dalla scrivania: le sessioni continuano a girare sul PC e lui le guida dal telefono, manda reel al bot, segue un'app che cresce mentre guarda la TV.", CSS.gemini],
  pc: ['Postazione', 'PC fisso', 'Tre monitor e i programmi più pesanti: Photoshop, Blender, Cinema 4D, la voce clonata in locale, il bot Telegram. Legge e scrive lo stesso cervello centrale del Mac.', CSS.ink],
  mac: ['Postazione', 'MacBook', "Quasi intercambiabile col PC: stessi file, stessa memoria. Quando Giovanni cambia computer, l'assistente rilegge il Diario e riparte da dove si era fermato.", CSS.ink],
  claude: ['Assistente', 'Claude', 'Claude Code lavora sui file dei progetti, scrive codice e prompt, comanda Photoshop, Blender e Cinema 4D, chiede a Gemini di guardare i video e, per i lavori grandi, apre più sessioni in parallelo.', CSS.claude],
  codex: ['Assistente', 'ChatGPT · Codex', "L'assistente di OpenAI. Si usa per confrontare le idee e per scrivere codice sugli stessi progetti. Non vede le chat di Claude: legge gli stessi file e lo stesso Diario. Per questo collaborano «quasi» insieme.", CSS.codex],
  mini: ['Sessioni parallele', 'Sonnet e Haiku', 'Per i lavori con parti indipendenti Claude apre altre sessioni con modelli più economici: Sonnet per costruire, Haiku per leggere e controllare. Fanno prima, ma costano: si usano solo quando conviene.', CSS.mini],
  bot: ['Strumento', 'Gemini e il bot Telegram', 'Giovanni manda i reel al suo bot; Gemini li guarda e risponde in chat con un resoconto. Le novità utili finiscono nel cervello centrale. Anche Claude può chiedere a Gemini di guardare un video, via API.', CSS.gemini],
  ps: ['Strumento', 'Photoshop', "La rifinitura: l'immagine generata si corregge solo dove serve, sul file ad alta risoluzione. Claude può comandarlo con degli script (livelli, maschere, oggetti avanzati), sempre in modo reversibile.", CSS.ps],
  blender: ['Strumento', 'Blender', 'Collegato con MCP: Claude manda comandi alla finestra di Blender aperta, costruisce scene, luci e render senza servizi a pagamento.', CSS.blender],
  c4d: ['Strumento', 'Cinema 4D', 'Anche Cinema 4D è collegato con MCP: Claude prepara scene ed esempi per il corso di Rendering 3D, Giovanni li controlla e li rifinisce.', CSS.c4d],
  higgs: ['Strumento', 'Higgsfield · Nano Banana Pro', "Il prompt lo scrivono Claude o ChatGPT: soggetto, luce, formato, immagini da allegare e in che ordine. Giovanni lo incolla su Higgsfield e genera. L'immagine scelta poi passa in Photoshop.", CSS.amber],
  online: ['Pubblicazione', 'Online', "Il sito dei corsi sta su GitHub Pages, gli esercizi in aula su Cloudflare. Tutti e due gratuiti. Ci si arriva solo dopo l'ok di Giovanni.", CSS.green],
  client: ['Consegna', 'Cliente', 'Riceve il lavoro finito: codice e immagini controllati da Giovanni. Le prove e le anteprime restano nel cervello centrale.', CSS.client],
  sito: ['Progetto', 'Sito dei corsi', 'Le pagine dei corsi AANT. Gli assistenti preparano e controllano su computer e telefono; la pubblicazione parte solo con il sì di Giovanni.', CSS.green],
  sleep: ['Progetto', 'Sleep Physics', 'Il gioco di fisica di Giovanni per TikTok: sfere che cadono e rimbalzano, combo e sfide «Mystery». Una regia sceglie seed, sfide e musica e prepara i video; il codice lo scrivono Claude e Codex.', CSS.green],
  esercizi: ['Progetto', 'Esercizi in aula', 'Piccole app con QR per gli studenti, come «La frase a gruppi»: girano su Cloudflare e si provano prima con telefoni veri.', CSS.green],
  eidolon: ['Progetto', 'Eidolon Noeima', 'Il progetto di ritratti di Giovanni. Gli assistenti scrivono i prompt e confrontano i volti con i riferimenti; Giovanni genera e rifinisce in Photoshop.', CSS.green],
  makkelijk: ['Progetto', 'Makkelijk', 'Foto di famiglia dal taglio documentaristico per un cliente: schede dei personaggi, prompt e tante prove, con più assistenti coordinati. Il lavoro è chiuso, il metodo è rimasto ed è raccolto in un file di lezioni.', CSS.green],
  italmanager: ['Progetto', 'Italmanager · CROSSBAR', 'La carriera online di Giovanni in Football Manager, raccontata da CROSSBAR: articoli delle partite, copertine e bannerini delle vittorie. Gli assistenti scrivono testi e prompt, Giovanni genera e impagina.', CSS.green],
  voce: ['Progetto', 'Animazioni con voce', 'Spiegazioni animate ricavate dai videocorsi, narrate con la voce di Giovanni clonata sul PC, senza servizi a pagamento.', CSS.green],
  clienti: ['Progetto', 'Lavori per clienti', 'Codice e immagini. Gli assistenti scrivono pagine e prompt; Giovanni genera, rifinisce in Photoshop e consegna.', CSS.green],
};
const card = document.getElementById('card');
function openCard(key) {
  const I = INFO[key]; if (!I) return;
  card.style.setProperty('--c', I[3]);
  S('card-k').textContent = I[0]; S('card-t').textContent = I[1]; S('card-p').textContent = I[2];
  card.classList.add('on');
}
function closeCard() { card.classList.remove('on'); }
S('card-x').addEventListener('click', closeCard);

// ---------- comandi ----------
let paused = false, fast = false;
S('b-pause').addEventListener('click', e => { paused = !paused; e.currentTarget.setAttribute('aria-pressed', paused); e.currentTarget.textContent = paused ? 'Riprendi' : 'Pausa'; });
S('b-fast').addEventListener('click', e => { fast = !fast; e.currentTarget.setAttribute('aria-pressed', fast); });
S('b-swap').addEventListener('click', () => { if (story || gioPath) return; placeIdx = (placeIdx + 1) % PLACES.length; moveT = 0; goTo(PLACES[placeIdx]); });
S('b-home').addEventListener('click', home);
// suono: parte al primo tocco sulla pagina (i browser non lasciano partire l'audio da solo); la scelta resta sul dispositivo
const audioBtn = S('b-audio');
let audioOn = true; try { audioOn = localStorage.getItem('eco-audio') !== 'no'; } catch (e) {}
function showAudio() { audioBtn.setAttribute('aria-pressed', audioOn); audioBtn.textContent = audioOn ? '♪ Suono sì' : '♪ Suono no'; }
audio.setEnabled(audioOn); showAudio();
audioBtn.addEventListener('click', () => { audioOn = !audioOn; audio.setEnabled(audioOn); if (audioOn) audio.init(); showAudio(); try { localStorage.setItem('eco-audio', audioOn ? 'si' : 'no'); } catch (e) {} });
const wake = () => { if (audioOn) audio.init(); };
addEventListener('pointerdown', wake); addEventListener('keydown', wake);

// ---------- animazione ----------
let clock = 0, last = performance.now(), brainFlash = 0;
log('Giovanni apre la giornata al PC fisso.');
// quando la scena esce dallo schermo non si disegna: meno lavoro per il computer e per la batteria del telefono
let onScreen = true;
new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; audio.setAwake(onScreen && !document.hidden); }).observe(box);
document.addEventListener('visibilitychange', () => audio.setAwake(onScreen && !document.hidden));
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!onScreen) return;
  if (paused) dt = 0;
  if (fast) dt *= 2;
  if (reduced) dt *= .6;
  clock += dt; simMin += dt * 2.2;
  clockEl.textContent = hhmm();

  [...AGENTS].forEach(A => stepAgent(A, dt));
  stepApprovals(dt); stepFree(dt); stepGio(dt); stepBeams(dt); stepFocus(dt);
  if (story && dt) { const D = STEPS[story.i].dur; story.t += dt; S('story-bar').style.width = Math.min(100, story.t / D * 100) + '%'; if (story.t > D) goStep(story.i + 1); }

  // Giovanni: anello, telefono, lampadina; la TV cambia luce
  gioRing.material.opacity = .55 + Math.sin(clock * 3) * .35;
  bulb.position.y = 2.15 + Math.sin(clock * 3) * .06; bulb.rotation.y += dt;
  bulb.scale.setScalar(THREE.MathUtils.lerp(bulb.scale.x, bulbT, Math.min(1, dt * 4)));
  client.userData.flash = Math.max(0, (client.userData.flash || 0) - dt * .8); client.scale.setScalar(1 + client.userData.flash * .15);
  gioPhone.material.emissiveIntensity = .8 + Math.sin(clock * 5) * .4;
  if (isLive('sofa')) tvScreen.material.emissive.setHSL(.55 + Math.sin(clock * .7) * .08, .6, .45 + Math.sin(clock * 3.1) * .08);
  tvScreen.material.emissiveIntensity = where === 'sofa' ? .9 : .25;

  // Gemini
  geminiBusy = Math.max(0, geminiBusy - dt);
  const on = geminiBusy > 0;
  eye.material.emissiveIntensity = on ? 1.6 + Math.sin(clock * 10) * .5 : .7;
  phone.material.emissiveIntensity = on ? .9 : .08;
  if (isLive('bot')) { eyeRing.rotation.x += dt * (on ? 2.4 : .8); eyeRing.rotation.y += dt * 1.1; }

  // cervello: la rete dentro gira, la luce respira, i pacchetti corrono sui cavi
  brainFlash = Math.max(0, brainFlash - dt * .8);
  if (isLive('brain')) {
    net.rotation.y += dt * .25; net.rotation.x = Math.sin(clock * .3) * .3;
    net.material.opacity = .45 + Math.sin(clock * 2) * .15 + brainFlash * .5;
    glow.intensity = 12 + Math.sin(clock * 2) * 4 + brainFlash * 20;
  }
  pointsUniforms.uZoom.value = camera.zoom;
  stepWorld(dt);
  if (!story && Math.random() < dt * 2.6) packet(CABLES[Math.floor(Math.random() * CABLES.length)], Math.random() < .5);
  for (let i = packets.length - 1; i >= 0; i--) {
    const q = packets[i]; q.t += dt * q.speed;
    q.curve.getPoint(q.reverse ? 1 - q.t : q.t, q.m.position);
    if (q.t >= 1) { rig.remove(q.m); q.m.material.dispose(); packets.splice(i, 1); }
  }
  if (isLive('online')) cloud.position.y = 2.2 + Math.sin(clock * 1.3) * .12;
  higgs.userData.flash = Math.max(0, (higgs.userData.flash || 0) - dt * .7);
  higgs.userData.sheet.position.y = 1.1 + higgs.userData.flash * .5;
  stepProjects(dt);
  DRONES.forEach(D => stepDrone(D, dt));

  controls.update();
  renderer.render(scene, camera);
  placeLabels(); stats();
}
requestAnimationFrame(frame);
