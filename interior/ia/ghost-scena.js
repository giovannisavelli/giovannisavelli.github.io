import * as THREE from 'three';

// Header IA, nello stile di Gather: una sfera meccanica fatta di particelle (la Shell), tenuta ferma da cavi e tubi
// tesi fino ai bordi. Dentro c'è la rete del Ghost: traspare appena, e resta da sola quando la Shell viene tolta.
const stage = document.getElementById('ghost-stage');
const linksSvg = document.getElementById('ghost-links');
const btn = document.getElementById('ghost-toggle');
const stateEl = document.getElementById('ghost-state');
const driftEl = document.getElementById('ghost-drift');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 900px)').matches;

// canvas opaco con lo stesso colore di fondo della pagina: un canvas trasparente con punti "di luce" sparisce in alcuni browser
const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
renderer.setClearColor(0x090b0c, 1);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const hero = document.querySelector('.hero');
// la scena sta dietro tutta la parte alta della pagina: i cavi passano sotto il titolo e sotto le schede, poi sfumano
const canvasEl = renderer.domElement;
canvasEl.className = 'ghost-canvas';
(document.getElementById('page') || document.body).prepend(canvasEl);
function placeCanvas() {
  canvasEl.style.top = hero.offsetTop + 'px';
  canvasEl.style.height = Math.round(hero.offsetHeight + innerHeight * (small ? .5 : .75)) + 'px';
}
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, .1, 80);
camera.position.set(0, 0, 9);

const rnd = (a, b) => a + Math.random() * (b - a);
const hash = k => { const s = Math.sin(k * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const p = new THREE.Vector3(), nm = new THREE.Vector3(), tmp = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
const basis = a => {        // due direzioni perpendicolari ad "a"
  e1.set(Math.abs(a.y) < .9 ? 0 : 1, Math.abs(a.y) < .9 ? 1 : 0, 0).cross(a).normalize();
  e2.copy(a).cross(e1).normalize();
};

// ---------- la sfera meccanica, costruita punto per punto ----------
const NS = small ? 130000 : 230000;
const pos = new Float32Array(NS * 3), nor = new Float32Array(NS * 3), seed = new Float32Array(NS * 4), bright = new Float32Array(NS), kind = new Float32Array(NS);
let n = 0;
function put(q, nq, br, kd = 0) {
  if (n >= NS) return;
  pos[n * 3] = q.x; pos[n * 3 + 1] = q.y; pos[n * 3 + 2] = q.z;
  nor[n * 3] = nq.x; nor[n * 3 + 1] = nq.y; nor[n * 3 + 2] = nq.z;
  seed[n * 4] = Math.random(); seed[n * 4 + 1] = Math.random(); seed[n * 4 + 2] = Math.random(); seed[n * 4 + 3] = Math.random();
  bright[n] = br; kind[n] = kd; n++;
}
const sph = (lat, lon) => tmp.set(Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon));

// La sfera segue il riferimento generato da Giovanni: mozzi circolari a gradini con corona dentata (da cui escono
// i fasci di cavi), pannelli curvi con bulloni, fasce in rilievo e, su un lato, portello, griglia e alette.
const toLocal = new THREE.Quaternion().setFromEuler(new THREE.Euler(.18, .5, -.12)).invert();   // dalla vista alla sfera
const HUBS = [[-.62, .42, .66], [-.5, -.55, .66], [.9, -.22, .38], [.45, .7, -.55], [-.2, -.75, -.6], [-.7, .1, -.7]]
  .map((d, i) => ({ d: new THREE.Vector3(...d).normalize().applyQuaternion(toLocal), A: [.4, .42, .4, .44, .42, .4][i] }));
const SERVICE = new THREE.Vector3(.3, .3, .9).normalize().applyQuaternion(toLocal);
basis(SERVICE);
const SE1 = e1.clone(), SE2 = e2.clone();
HUBS.forEach(hb => { basis(hb.d); hb.e1 = e1.clone(); hb.e2 = e2.clone(); });

// profilo di un mozzo dal centro (s = 0) al bordo (s = 1): [inizio, quota, luminosità]
const PROFILE = [[0, -.12, .12], [.13, .06, 1.25], [.2, -.06, .45], [.3, -.02, 1.05], [.36, -.055, .5], [.46, -.015, 1.05],
                 [.52, -.04, .55], [.64, .01, .95], [.8, 0, 1], [.97, NaN, 0]];
const RAMP = .02, GEAR = 8;
function hubHeight(s, beta) {
  let i = 0;
  while (i < PROFILE.length - 1 && s >= PROFILE[i + 1][0]) i++;
  if (Number.isNaN(PROFILE[i][1])) return null;                 // fuga attorno al mozzo
  let h = PROFILE[i][1], br = PROFILE[i][2], slope = 0;
  if (i === GEAR) {                                              // corona dentata
    const tooth = THREE.MathUtils.smoothstep(Math.cos(beta * 56), -.2, .2);
    h = .015 + .045 * tooth; br = .55 + .65 * tooth;
  } else if (i > 0 && s - PROFILE[i][0] < RAMP) {               // gradino: la parete si vede e prende la luce
    const hp = PROFILE[i - 1][1];
    slope = (h - hp) / RAMP; h = hp + (h - hp) * (s - PROFILE[i][0]) / RAMP; br = 1.2;
  }
  return { h, br, slope };
}

// pannelli curvi: celle di Voronoi sulla sfera, ognuna alla sua quota
const SEEDS = [];
while (SEEDS.length < 20) {
  const d = new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1));
  if (d.length() < 1 && d.length() > .2) SEEDS.push(d.normalize());
}
function panel(x) {
  let a = -2, b = -2, ia = 0;
  SEEDS.forEach((s, i) => { const d = x.dot(s); if (d > a) { b = a; a = d; ia = i; } else if (d > b) b = d; });
  return { edge: (Math.acos(Math.min(1, b)) - Math.acos(Math.min(1, a))) / 2, id: ia };
}
const BELTS = [new THREE.Vector3(.2, .95, .25).normalize(), new THREE.Vector3(.85, -.3, .45).normalize()];

// portello, griglia e alette sulla sesta faccia (coordinate u, v sul piano tangente)
function service(u, v) {
  const rr = (cu, cv, hu, hv, rad) => {         // distanza da un rettangolo con angoli arrotondati (<0 dentro)
    const qx = Math.abs(u - cu) - hu + rad, qy = Math.abs(v - cv) - hv + rad;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rad;
  };
  const hatch = rr(-.04, .06, .16, .1, .04);
  if (hatch < 0) {
    if (hatch > -.016) return { h: .018, br: 1.2 };
    if (Math.abs(u - .06) < .03 && Math.abs(v - .06) < .025) return { h: .03, br: 1.2 };        // maniglia
    if (Math.abs(u + .07) < .05 && Math.abs(v - .06) < .01) return { h: -.03, br: .3 };          // fessura
    return { h: -.01, br: .85 };
  }
  if (rr(.27, -.02, .08, .17, .01) < 0) {                          // griglia di ventilazione
    if (rr(.27, -.02, .08, .17, .01) > -.012) return { h: .02, br: 1.15 };
    return ((v + .2) * 30) % 1 < .45 ? { h: .022, br: 1.1 } : { h: -.018, br: .3 };
  }
  if (rr(-.3, -.04, .07, .2, .01) < 0) {                           // pacco di alette
    return ((v + .25) * 24) % 1 < .3 ? { h: .055, br: 1 } : { h: -.005, br: .45 };
  }
  return { h: .008, br: rnd(.8, .92) };
}

const x = new THREE.Vector3(), tg = new THREE.Vector3();
const SURF = Math.floor(NS * .86);
for (let k = 0; n < SURF && k < SURF * 4; k++) {
  x.set(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1));
  const L = x.length(); if (L > 1 || L < .1) continue; x.divideScalar(L);
  let h = 0, br = rnd(.8, .95), slope = 0, skip = false, inHub = false;
  for (const hb of HUBS) {
    const cosA = x.dot(hb.d), s = Math.acos(Math.min(1, cosA)) / hb.A;
    if (s >= 1.03) continue;
    inHub = true;
    if (s > .97) { skip = true; break; }
    const r = hubHeight(s, Math.atan2(x.dot(hb.e2), x.dot(hb.e1)));
    if (!r) { skip = true; break; }
    h = r.h; br = r.br; slope = r.slope / hb.A;
    tg.copy(x).multiplyScalar(cosA).sub(hb.d).normalize();     // direzione che si allontana dal centro del mozzo
    break;
  }
  if (skip) continue;
  if (!inHub) {
    const sa = Math.acos(Math.min(1, x.dot(SERVICE)));
    if (sa < .5) {
      if (sa > .485) continue;
      const r = service(x.dot(SE1), x.dot(SE2)); h = r.h; br = r.br;
    } else {
      const pn = panel(x);
      if (pn.edge < .011) continue;                               // fuga fra i pannelli
      const hh = hash(pn.id);
      h = hh < .4 ? 0 : hh < .75 ? .012 : .024;
      if (pn.edge < .026) { br = 1.15; h -= (.026 - pn.edge) * .4; }   // bordo smussato che prende la luce
      for (const b of BELTS) {                                    // fasce in rilievo
        const d = Math.abs(x.dot(b));
        if (d < .05 && d > .043) { skip = true; break; }
        if (d < .043) { h = .032; br = d > .036 ? 1.2 : rnd(.82, .95); }
      }
      if (skip) continue;
    }
  }
  nm.copy(x);
  if (slope) nm.addScaledVector(tg, -slope * .09).normalize();
  put(p.copy(x).multiplyScalar(1 + h), nm, br);
}

// bulloni: lungo i bordi dei pannelli, ai lati delle fasce e in cerchio sui mozzi
const BOLTS = [];
const addBolt = (q, lift) => {
  if (BOLTS.some(b => b.distanceTo(q) < .05)) return;
  BOLTS.push(q.clone());
  basis(q);
  for (let k = 0; k < 24; k++) {
    const a = rnd(0, Math.PI * 2), rr = .011 * Math.sqrt(Math.random());
    put(p.copy(q).multiplyScalar(1 + lift).addScaledVector(e1, Math.cos(a) * rr).addScaledVector(e2, Math.sin(a) * rr), q, 1.3);
  }
};
HUBS.forEach(hb => {
  for (let j = 0; j < 14; j++) {
    const b = j / 14 * Math.PI * 2, a = hb.A * .72;
    x.copy(hb.d).multiplyScalar(Math.cos(a)).addScaledVector(hb.e1, Math.sin(a) * Math.cos(b)).addScaledVector(hb.e2, Math.sin(a) * Math.sin(b));
    addBolt(x, .018);
  }
});
for (let k = 0; k < 9000 && n < NS * .97; k++) {
  x.set(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)); const L = x.length(); if (L > 1 || L < .1) continue; x.divideScalar(L);
  if (HUBS.some(hb => Math.acos(Math.min(1, x.dot(hb.d))) < hb.A * 1.08) || Math.acos(Math.min(1, x.dot(SERVICE))) < .53) continue;
  const pn = panel(x), hh = hash(pn.id), base = hh < .4 ? 0 : hh < .75 ? .012 : .024;
  if (pn.edge > .03 && pn.edge < .036) addBolt(x, base + .012);
  else if (BELTS.some(b => { const d = Math.abs(x.dot(b)); return d > .028 && d < .033; })) addBolt(x, .044);
}
// un po' di polvere sospesa intorno, come in Gather (kind = 1)
while (n < NS) {
  p.set(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize().multiplyScalar(rnd(1.25, 2.6));
  put(p, nm.set(0, 0, 1), rnd(.15, .4), 1);
}

// ---------- i cavi: fasci che escono dai mozzi e vanno oltre i bordi, ricalcolati a ogni fotogramma ----------
// La sfera si muove, gli ancoraggi no: per questo i cavi si tendono e la sfera torna al suo posto.
// Tipi: 0 cavo liscio, 1 tubo corrugato, 2 cavo d'acciaio intrecciato.
const REST = new THREE.Euler(.18, .5, -.12);
const restQ = new THREE.Quaternion().setFromEuler(REST);
const CAB = [];
HUBS.forEach(hb => {
  const count = 4 + Math.floor(Math.random() * 3);
  for (let c = 0; c < count; c++) {
    const a = rnd(0, Math.PI * 2), rr = rnd(0, .07);
    const sock = hb.d.clone().addScaledVector(hb.e1, Math.cos(a) * rr).addScaledVector(hb.e2, Math.sin(a) * rr).normalize().multiplyScalar(.95);
    const w = hb.d.clone().applyQuaternion(restQ).add(new THREE.Vector3(rnd(-.55, .55), rnd(-.55, .55), rnd(-.3, .3)));
    w.z *= .3; if (w.x < 0) w.x *= 1.7; if (w.y < 0) w.y *= 1.5; w.normalize();
    const anchor = w.multiplyScalar(rnd(12, 17)).add(new THREE.Vector3(rnd(-.6, .6), rnd(-.6, .6), rnd(-1.2, .4)));
    const type = c === 0 || Math.random() < .2 ? 1 : Math.random() < .7 ? 2 : 0;
    CAB.push({ sock, sockN: hb.d.clone(), anchor, r: type === 1 ? rnd(.04, .06) : rnd(.016, .028), rib: type, sag: rnd(.1, .7) });
  }
});
const NC = small ? 80000 : 165000;
const cT = new Float32Array(NC), cAng = new Float32Array(NC), cR = new Float32Array(NC), cRib = new Float32Array(NC), cSag = new Float32Array(NC);
const cSock = new Float32Array(NC * 3), cSockN = new Float32Array(NC * 3), cAnc = new Float32Array(NC * 3), cSeed = new Float32Array(NC * 4);
const cWeight = CAB.map(c => c.r + .012), cTot = cWeight.reduce((a, b) => a + b, 0);
for (let i = 0; i < NC; i++) {
  let pick = Math.random() * cTot, ci = 0;            // i tubi grossi ricevono più punti
  while (pick > cWeight[ci]) pick -= cWeight[ci++];
  const c = CAB[Math.min(ci, CAB.length - 1)];
  cT[i] = Math.pow(Math.random(), 1.12);              // più punti vicino alla sfera, dove il cavo si vede meglio
  cAng[i] = rnd(0, Math.PI * 2); cR[i] = c.r; cRib[i] = c.rib; cSag[i] = c.sag;
  cSock.set(c.sock.toArray(), i * 3); cSockN.set(c.sockN.toArray(), i * 3); cAnc.set(c.anchor.toArray(), i * 3);
  cSeed[i * 4] = Math.random(); cSeed[i * 4 + 1] = Math.random(); cSeed[i * 4 + 2] = Math.random(); cSeed[i * 4 + 3] = Math.random();
}

// ---------- il Ghost: una rete dentro la sfera ----------
const NODES = [];
for (let tries = 0; NODES.length < (small ? 34 : 54) && tries < 5000; tries++) {
  const q = new THREE.Vector3(rnd(-.8, .8), rnd(-.8, .8), rnd(-.8, .8));
  if (q.length() > .8 || NODES.some(o => o.p.distanceTo(q) < .2)) continue;
  NODES.push({ p: q, busy: false });
}
const EDGES = [], seen = new Set();
NODES.forEach((a, i) => {
  NODES.map((b, j) => [a.p.distanceTo(b.p), j]).filter(x => x[1] !== i).sort((x, y) => x[0] - y[0]).slice(0, 3).forEach(([, j]) => {
    const key = Math.min(i, j) + '-' + Math.max(i, j);
    if (!seen.has(key)) { seen.add(key); EDGES.push([i, j]); }
  });
});
const lensGLSL = `
  uniform vec2 uMouse; uniform float uHover, uAspect;
  float lensAt(vec4 cp, float r0, float r1){
    vec2 ndc = cp.xy / cp.w;
    return uHover * (1. - smoothstep(r0, r1, length((ndc - uMouse) * vec2(uAspect, 1.))));
  }`;
const U = { uTime: { value: 0 }, uBare: { value: 0 }, uLoose: { value: 1 }, uPR: { value: renderer.getPixelRatio() },
            uMouse: { value: new THREE.Vector2(9, 9) }, uHover: { value: 0 }, uAspect: { value: 1 }, uBall: { value: new THREE.Matrix4() } };
const additive = { transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending };
// Senza Shell la rete diventa frenetica: i nodi vibrano e si spostano trascinando i collegamenti, i segnali corrono
// più veloci e più numerosi, i collegamenti sfarfallano. uPhase è un orologio che accelera quando la Shell è tolta.
U.uPhase = { value: 0 }; U.uAmp = { value: .02 };
const jigGLSL = `
  uniform float uPhase, uAmp;
  vec3 jig(float i){
    return (vec3(sin(uPhase * 1.3 + i * 1.7), sin(uPhase * 1.1 + i * 2.3), sin(uPhase * 1.7 + i * .9))
          + .45 * vec3(sin(uPhase * 4.1 + i * 3.1), sin(uPhase * 3.7 + i * 1.3), sin(uPhase * 4.6 + i * 2.7))) * uAmp;
  }`;
const jig = (i, ph, amp, out) => out.set(
  Math.sin(ph * 1.3 + i * 1.7) + .45 * Math.sin(ph * 4.1 + i * 3.1),
  Math.sin(ph * 1.1 + i * 2.3) + .45 * Math.sin(ph * 3.7 + i * 1.3),
  Math.sin(ph * 1.7 + i * .9) + .45 * Math.sin(ph * 4.6 + i * 2.7)).multiplyScalar(amp);
const lineGeo = new THREE.BufferGeometry();
lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(EDGES.flatMap(([a, b]) => [...NODES[a].p.toArray(), ...NODES[b].p.toArray()]), 3));
lineGeo.setAttribute('aId', new THREE.Float32BufferAttribute(EDGES.flatMap(([a, b]) => [a, b]), 1));
// la rete traspare appena dalla Shell, si accende un po' dove passa il mouse, del tutto quando la Shell non c'è
const netLines = new THREE.LineSegments(lineGeo, new THREE.ShaderMaterial({ uniforms: U, ...additive,
  vertexShader: `attribute float aId; uniform float uBare; varying float vI; ${lensGLSL} ${jigGLSL}
    void main(){ vec4 cp = projectionMatrix * modelViewMatrix * vec4(position + jig(aId), 1.);
      float flick = mix(1., .35 + .65 * step(0., sin(uPhase * 4.2 + aId * 3.7)), uBare * .55);
      vI = (.07 + lensAt(cp, .08, .38) * .3 + uBare * .75) * flick; gl_Position = cp; }`,
  fragmentShader: `varying float vI; void main(){ gl_FragColor = vec4(vec3(.72, .93, .84) * vI * .5, 1.); }` }));
// nodi (aK = -1) e segnali: due per collegamento sempre, altri quattro solo quando la Shell è tolta
const PA = [], PB = [], PIA = [], PIB = [], PO = [], PK = [];
NODES.forEach((nd, i) => { PA.push(...nd.p.toArray()); PB.push(...nd.p.toArray()); PIA.push(i); PIB.push(i); PO.push(0); PK.push(-1); });
EDGES.forEach(([a, b]) => { for (let k = 0; k < 6; k++) {
  const rev = k % 2 === 1;                      // metà dei segnali va nel verso opposto
  PA.push(...NODES[rev ? b : a].p.toArray()); PB.push(...NODES[rev ? a : b].p.toArray());
  PIA.push(rev ? b : a); PIB.push(rev ? a : b); PO.push(Math.random()); PK.push(k);
} });
const pulseGeo = new THREE.BufferGeometry();
pulseGeo.setAttribute('position', new THREE.Float32BufferAttribute(PA, 3));
pulseGeo.setAttribute('aB', new THREE.Float32BufferAttribute(PB, 3));
pulseGeo.setAttribute('aIA', new THREE.Float32BufferAttribute(PIA, 1));
pulseGeo.setAttribute('aIB', new THREE.Float32BufferAttribute(PIB, 1));
pulseGeo.setAttribute('aO', new THREE.Float32BufferAttribute(PO, 1));
pulseGeo.setAttribute('aK', new THREE.Float32BufferAttribute(PK, 1));
const netPoints = new THREE.Points(pulseGeo, new THREE.ShaderMaterial({ uniforms: U, ...additive,
  vertexShader: `attribute vec3 aB; attribute float aIA, aIB, aO, aK; uniform float uTime, uBare, uPR; varying float vI; ${lensGLSL} ${jigGLSL}
    void main(){
      float node = step(aK, -.5);
      float t = fract(uPhase * (.18 + .07 * aO) + aO);
      vec3 a = position + jig(aIA), b = aB + jig(aIB);
      vec3 q = mix(mix(a, b, t), a, node);
      vec4 mv = modelViewMatrix * vec4(q, 1.); vec4 cp = projectionMatrix * mv;
      float extra = mix(1., uBare, step(1.5, aK));            // i segnali in più compaiono solo senza Shell
      float blink = mix(1., .6 + .4 * sin(uPhase * 11. + aIA * 5.1), uBare * node);
      vI = (.1 + lensAt(cp, .08, .38) * .35 + uBare * .85) * mix(sin(t * 3.14159), 1., node) * extra * blink;
      gl_Position = cp; gl_PointSize = uPR * mix(2.2, 3.4 + uBare * 1.4, node) * (9. / -mv.z);
    }`,
  fragmentShader: `varying float vI; void main(){ vec2 d = gl_PointCoord - .5; if (dot(d, d) > .25) discard;
      gl_FragColor = vec4(vec3(.8, 1., .9) * vI, 1.); }` }));

const commonGLSL = `
  uniform float uTime, uLoose, uPR;
  vec3 flow(vec3 p, float t, vec4 s){
    return vec3(sin(p.y*3.1 + t*.7 + s.x*6.28), sin(p.x*2.7 - t*.6 + s.y*6.28), sin((p.x+p.y)*2.3 + t*.5 + s.z*6.28));
  }
  // luce da sinistra in alto, come la luna di Gather: muovendo la sfera, il terminatore scorre sui volumi
  float light(vec3 n){ return pow(max(dot(normalize(normalMatrix * n), normalize(vec3(-.55, .45, .7))), 0.), 1.15); }
  // vicino ai bordi della scena i punti si spengono piano: niente tagli netti
  float edgeFade(vec4 cp){ vec2 q = abs(cp.xy / cp.w); return smoothstep(1.02, .72, q.x) * smoothstep(1.02, .5, q.y); }
  float looseK(float w){ float k = clamp(uLoose * 1.8 - w * .8, 0., 1.); return k * k * (3. - 2. * k); }`;
const dotFrag = `varying float vA;
  void main(){ vec2 d = gl_PointCoord - .5; float r2 = dot(d, d); if (r2 > .25) discard;
    gl_FragColor = vec4(vec3(.93, .9, .84) * vA * .38 * (1. - r2 * 2.), 1.); }`;

// ---------- la Shell: i punti della sfera ----------
const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('aNormal', new THREE.BufferAttribute(nor, 3));
geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
geo.setAttribute('aBright', new THREE.BufferAttribute(bright, 1));
geo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
const shell = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: U, ...additive, fragmentShader: dotFrag,
  vertexShader: `
    attribute vec3 aNormal; attribute vec4 aSeed; attribute float aBright; attribute float aKind;
    varying float vA;
    ${commonGLSL}
    void main(){
      vec3 p = position;
      float k = looseK(aSeed.w);
      float dust = aKind;
      // la polvere intorno galleggia piano; senza Shell ogni punto si stacca con il suo ritardo e se ne va
      p += flow(p * .8, uTime * .25, aSeed) * .12 * dust;
      p += (normalize(position + 1e-4) * (.45 + aSeed.x * .9) + vec3(-.5, -.1, 0.) * aSeed.y) * k + flow(p * 1.1, uTime * .6, aSeed) * .2 * k;
      p += flow(p * 4., uTime * 1.4, aSeed) * .003;
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uPR * (.9 + aSeed.z * .55) * (9. / -mv.z);
      vA = aBright * mix(.015 + 1.15 * light(aNormal), 1., dust) * (1. - k * .85) * (.6 + .4 * aSeed.x) * edgeFade(gl_Position);
    }` }));

// ---------- i cavi ----------
const cgeo = new THREE.BufferGeometry();
cgeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NC * 3), 3));
cgeo.setAttribute('aT', new THREE.BufferAttribute(cT, 1));
cgeo.setAttribute('aAng', new THREE.BufferAttribute(cAng, 1));
cgeo.setAttribute('aR', new THREE.BufferAttribute(cR, 1));
cgeo.setAttribute('aRib', new THREE.BufferAttribute(cRib, 1));
cgeo.setAttribute('aSag', new THREE.BufferAttribute(cSag, 1));
cgeo.setAttribute('aSock', new THREE.BufferAttribute(cSock, 3));
cgeo.setAttribute('aSockN', new THREE.BufferAttribute(cSockN, 3));
cgeo.setAttribute('aAnchor', new THREE.BufferAttribute(cAnc, 3));
cgeo.setAttribute('aSeed', new THREE.BufferAttribute(cSeed, 4));
const cables = new THREE.Points(cgeo, new THREE.ShaderMaterial({ uniforms: U, ...additive, fragmentShader: dotFrag,
  vertexShader: `
    attribute float aT, aAng, aR, aRib, aSag; attribute vec3 aSock, aSockN, aAnchor; attribute vec4 aSeed;
    uniform mat4 uBall;
    varying float vA;
    ${commonGLSL}
    vec3 bez(vec3 a, vec3 b, vec3 c, vec3 d, float t){ float u = 1. - t; return u*u*u*a + 3.*u*u*t*b + 3.*u*t*t*c + t*t*t*d; }
    vec3 bezD(vec3 a, vec3 b, vec3 c, vec3 d, float t){ float u = 1. - t; return 3.*u*u*(b - a) + 6.*u*t*(c - b) + 3.*t*t*(d - c); }
    void main(){
      vec3 S = (uBall * vec4(aSock, 1.)).xyz, Sn = normalize(mat3(uBall) * aSockN), A = aAnchor;
      float L = length(A - S);
      vec3 P1 = S + Sn * L * .25, P2 = A + normalize(S - A) * L * .4 + vec3(0., -aSag, 0.);
      vec3 c = bez(S, P1, P2, A, aT), T = normalize(bezD(S, P1, P2, A, aT));
      vec3 up = abs(T.y) < .95 ? vec3(0., 1., 0.) : vec3(1., 0., 0.);
      vec3 b1 = normalize(cross(T, up)), b2 = cross(T, b1);
      vec3 nn = cos(aAng) * b1 + sin(aAng) * b2;
      float corr = step(.5, aRib) * step(aRib, 1.5), braid = step(1.5, aRib);
      float strand = sin(3. * aAng + aT * L * 130.);      // trefoli del cavo intrecciato
      vec3 p = c + nn * aR * (1. + corr * .24 * sin(aT * L * 75.) + braid * .1 * strand);
      float k = looseK(aSeed.w);
      p += (nn * (.3 + aSeed.x * .6) + vec3(-.3, -.1, 0.) * aSeed.y) * k + flow(p, uTime * .6, aSeed) * .2 * k;
      vec4 mv = modelViewMatrix * vec4(p, 1.);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uPR * (.9 + aSeed.z * .55) * (9. / -mv.z);
      float along = 1. - smoothstep(.3, 1., aT);
      vA = (corr > .5 ? .74 : .66) * mix(1., .55 + .45 * strand, braid) * (.015 + 1.15 * light(nn)) * (1. - k * .85) * (.6 + .4 * aSeed.x)
           * along * edgeFade(gl_Position);
    }` }));
cables.frustumCulled = false;
document.getElementById('ghost-npts').textContent = (NS + NC).toLocaleString('it-IT');

// rig: sta al centro della cornice e non ruota; ball: la sfera, che si muove dentro i suoi cavi
const rig = new THREE.Group(), ball = new THREE.Group();
const net = new THREE.Group();          // la rete, che senza Shell gira su se stessa
net.add(netLines, netPoints);
ball.add(net, shell);
rig.add(ball, cables);
scene.add(rig);

// ---------- righelli e croci della cornice (come in Gather) ----------
const SVGNS = 'http://www.w3.org/2000/svg';
const ruler = document.createElementNS(SVGNS, 'svg');
ruler.setAttribute('class', 'ghost-ruler'); ruler.setAttribute('aria-hidden', 'true');
stage.prepend(ruler);
function drawRuler(w, h) {
  ruler.setAttribute('viewBox', `0 0 ${w} ${h}`);
  const L = 46, R = w - 46, T = 146, B = h - 76;
  let d = '';
  for (let x = L + 14, i = 1; x < R - 10; x += 12, i++) {
    const len = i % 10 === 0 ? 15 : i % 5 === 0 ? 9 : 4;
    d += `M${x} ${T}v${len}M${x} ${B}v${-len}`;
  }
  for (let y = T + 18, i = 1; y < B - 12; y += 18, i++) {
    const len = i % 5 === 0 ? 9 : 4;
    d += `M${L} ${y}h${len}M${R} ${y}h${-len}`;
  }
  const cross = (x, y) => `M${x - 14} ${y}h28M${x} ${y - 14}v28`;
  ruler.innerHTML = `<path d="${d}" stroke="rgba(236,235,228,.24)" stroke-width="1" fill="none"/>` +
    `<path d="${cross(L, T)}${cross(R, T)}${cross(L, B)}${cross(R, B)}" stroke="rgba(236,235,228,.42)" stroke-width="1" fill="none"/>`;
}

// ---------- i mirini del Ghost ----------
// Ogni mirino aggancia un nodo della rete, lo segue qualche secondo, poi scrive SEEK e ne cerca un altro.
// La cornice insegue il punto con un po' di ritardo: per questo il "+" non è mai perfettamente al centro.
const SLOTS = small ? 7 : 10;
const ACTIVE_ON = small ? 5 : 7, ACTIVE_OFF = SLOTS;
const TRK = [];
for (let j = 0; j < SLOTS; j++) {
  const el = document.createElement('div');
  el.className = 'gtrk';
  el.innerHTML = '<i class="gtrk-box"></i><i class="gtrk-plus"></i><span class="gtrk-label"><b></b><em></em></span>';
  stage.appendChild(el);
  TRK.push({ el, plus: el.querySelector('.gtrk-plus'), num: el.querySelector('b'), em: el.querySelector('em'),
             n: String(j + 1).padStart(2, '0'), node: null, bx: 0, by: 0, a: 0, state: 'idle', t: 0, life: 0, sx: 0, sy: 0, vis: 0 });
}
const linkEls = [];
for (let j = 0; j < SLOTS * 2; j++) {
  const l = document.createElementNS(SVGNS, 'line');
  l.setAttribute('stroke', 'rgb(236,235,228)'); l.setAttribute('stroke-width', '1');
  linksSvg.appendChild(l); linkEls.push(l);
}

// ---------- interazione: la sfera è legata ----------
// Trascinandola si sposta e ruota di poco (i cavi la trattengono); lasciandola torna indietro con un piccolo rimbalzo.
const mouse = { x: 0, y: 0, ndc: new THREE.Vector2(9, 9), on: 0, active: false };
const pull = { rx: 0, ry: 0, x: 0, y: 0, vx: 0, vy: 0, dragging: false, px: 0, py: 0 };
const LIMIT = .32;
function setMouse(e) {
  const sr = stage.getBoundingClientRect(), r = canvasEl.getBoundingClientRect();
  mouse.x = e.clientX - sr.left; mouse.y = e.clientY - sr.top;
  mouse.ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
}
stage.addEventListener('pointerdown', e => {
  if (e.target.closest('.ghost-controls')) return;
  pull.dragging = true; pull.px = e.clientX; pull.py = e.clientY;
  stage.setPointerCapture(e.pointerId); stage.classList.add('grabbing');
  setMouse(e); mouse.active = true;
});
stage.addEventListener('pointermove', e => {
  if (!pull.dragging && e.target.closest('.ghost-controls')) { mouse.active = false; return; }
  setMouse(e); mouse.active = true;
  if (pull.dragging) {
    pull.rx += (e.clientX - pull.px) * .006; pull.ry += (e.clientY - pull.py) * .006;
    pull.px = e.clientX; pull.py = e.clientY;
  }
});
const endDrag = e => { pull.dragging = false; pull.rx = pull.ry = 0; stage.classList.remove('grabbing'); if (e.pointerType === 'touch') mouse.active = false; };
stage.addEventListener('pointerup', endDrag);
stage.addEventListener('pointercancel', endDrag);
stage.addEventListener('pointerleave', () => { if (!pull.dragging) mouse.active = false; });

// il pulsante toglie la Shell: sfera e cavi si disperdono e restano la rete e i mirini del Ghost
let shellOn = true, loose = reduced ? 0 : 1;
btn.addEventListener('click', () => {
  shellOn = !shellOn;
  btn.classList.toggle('off', !shellOn);
  btn.setAttribute('aria-pressed', String(!shellOn));
  btn.querySelector('span').textContent = shellOn ? 'Togli la Shell' : 'Rimetti la Shell';
  stateEl.innerHTML = shellOn ? 'Shell <b>montata</b>' : 'Shell <b>tolta</b>';
});

function fit() {
  placeCanvas();
  const r = canvasEl.getBoundingClientRect(), sr = stage.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / r.height;
  const T16 = Math.tan(THREE.MathUtils.degToRad(16));
  // la sfera (diametro 2) occupa gran parte dello spazio che ha a disposizione (sul computer +30% dal 28/10)
  let top, bottom, cx;
  if (small) {
    top = r.top + 76; bottom = hero.querySelector('.eyebrow').getBoundingClientRect().top - 14; cx = sr.left + sr.width * .5;
  } else {
    top = sr.top + 146; bottom = sr.bottom - 76; cx = sr.left + sr.width * .52;
  }
  const space = Math.max(120, bottom - top);
  camera.position.z = 2 * r.height / (2 * T16 * space * (small ? .62 : .86));
  camera.updateProjectionMatrix();
  linksSvg.setAttribute('viewBox', `0 0 ${sr.width} ${sr.height}`);
  if (!small) drawRuler(sr.width, sr.height);
  const k = camera.position.z * T16;
  rig.position.set((((cx - r.left) / r.width) * 2 - 1) * k * camera.aspect, -((((top + bottom) / 2 - r.top) / r.height) * 2 - 1) * k, 0);
  U.uAspect.value = camera.aspect;
}
fit(); addEventListener('resize', fit); document.fonts.ready.then(fit);

// la barra delle schede prende lo sfondo scuro solo quando è attaccata in alto (vedi ghost-scena.css)
const nav = document.querySelector('.course-navigation');
if (nav) {
  const stick = () => nav.classList.toggle('is-stuck', scrollY > 0 && nav.getBoundingClientRect().top <= parseFloat(getComputedStyle(nav).top) + 1);
  addEventListener('scroll', stick, { passive: true }); addEventListener('resize', stick); stick();
}

// sceglie un nodo libero, lontano dagli altri mirini; se il mouse è sulla scena, spesso uno vicino a dove guardi
function pickNode(proj) {
  const taken = TRK.filter(t => t.state !== 'idle' && t.node !== null).map(t => proj[t.node]);
  const free = NODES.map((nd, i) => i).filter(i => !NODES[i].busy && proj[i][3] &&
    taken.every(q => Math.hypot(q[0] - proj[i][0], (q[1] - proj[i][1]) * 1.8) > 95));
  if (!free.length) return null;
  let i;
  if (mouse.active && Math.random() < .65) {
    free.sort((a, b) => Math.hypot(proj[a][0] - mouse.x, proj[a][1] - mouse.y) - Math.hypot(proj[b][0] - mouse.x, proj[b][1] - mouse.y));
    i = free[Math.floor(Math.random() * Math.min(3, free.length))];
  } else i = free[Math.floor(Math.random() * free.length)];
  NODES[i].busy = true;
  return i;
}

const v = new THREE.Vector3();
const fmt = s => (s >= 0 ? '+' : '−') + Math.abs(s).toFixed(2);
let last = performance.now(), clock = 0;
let visible = true;
new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(hero);
function frame(now) {
  requestAnimationFrame(frame);
  if (!visible) { last = now; return; }
  const dt = Math.min(.05, (now - last) / 1000); last = now; clock += reduced ? 0 : dt;
  loose += ((shellOn ? 0 : 1) - loose) * Math.min(1, dt * (shellOn ? 1.1 : .7));
  mouse.on += ((mouse.active && !pull.dragging ? 1 : 0) - mouse.on) * Math.min(1, dt * 4);

  // molla: durante il trascinamento la sfera insegue la mano ma non va oltre LIMIT (i cavi la tengono);
  // lasciata, torna al suo posto e oscilla un poco prima di fermarsi
  const tx = LIMIT * Math.tanh(pull.rx / LIMIT), ty = LIMIT * Math.tanh(pull.ry / LIMIT);
  const stiff = pull.dragging ? 60 : 26, damp = pull.dragging ? 14 : 3.6;
  pull.vx += ((tx - pull.x) * stiff - pull.vx * damp) * dt; pull.vy += ((ty - pull.y) * stiff - pull.vy * damp) * dt;
  pull.x += pull.vx * dt; pull.y += pull.vy * dt;
  const sway = reduced ? 0 : 1;
  ball.rotation.set(REST.x + pull.y * .9 + Math.sin(clock * .5) * .02 * sway, REST.y + pull.x * 1.1 + Math.sin(clock * .33) * .035 * sway, REST.z);
  ball.position.set(pull.x * .45, -pull.y * .45 + Math.sin(clock * .7) * .012 * sway, 0);
  ball.updateMatrix();
  U.uBall.value.copy(ball.matrix);

  U.uTime.value = clock; U.uLoose.value = loose; U.uBare.value = loose;
  if (!reduced) { U.uPhase.value += dt * (1 + 2.6 * loose); net.rotation.y += dt * loose * .28; net.rotation.x += dt * loose * .09; }
  U.uAmp.value = .02 + .08 * loose;
  U.uMouse.value.copy(mouse.ndc); U.uHover.value = mouse.on;
  driftEl.textContent = 'Drift ' + String(Math.round(loose * 99)).padStart(2, '0');

  // posizione sullo schermo di ogni nodo del Ghost (e se sta nella metà verso di noi)
  const r = canvasEl.getBoundingClientRect(), sr = stage.getBoundingClientRect();
  rig.updateMatrixWorld();
  const proj = NODES.map(nd => {
    v.copy(nd.p).add(jig(NODES.indexOf(nd), U.uPhase.value, U.uAmp.value, tmp)).applyMatrix4(net.matrixWorld);
    const w = [v.x - rig.position.x, v.y - rig.position.y, v.z];
    v.project(camera);
    return [(v.x + 1) / 2 * r.width + r.left - sr.left, (1 - v.y) / 2 * r.height + r.top - sr.top, w, w[2] > -.35];
  });

  const active = Math.round(ACTIVE_ON + (ACTIVE_OFF - ACTIVE_ON) * loose);
  const k5 = 1 - Math.exp(-dt * (5 + 3.5 * loose)), k2 = 1 - Math.exp(-dt * (2.4 + 1.6 * loose));
  TRK.forEach((t, j) => {
    const want = j < active;
    if (t.state === 'idle' && want && Math.random() < dt * 1.5) {
      t.node = pickNode(proj);
      if (t.node !== null) {
        const q = proj[t.node];
        t.bx = q[0] + (Math.random() - .5) * 60; t.by = q[1] + (Math.random() - .5) * 60;
        t.state = 'seek'; t.t = 0;
      }
    }
    if (t.state === 'idle') { t.a = Math.max(0, t.a - dt * 2); t.el.style.opacity = t.a.toFixed(2); return; }
    const q = proj[t.node];
    t.t += dt;
    if (t.state === 'seek') {
      t.bx += (q[0] - t.bx) * k2; t.by += (q[1] - t.by) * k2;
      if (t.t > .7 && Math.hypot(q[0] - t.bx, q[1] - t.by) < 2.5) { t.state = 'lock'; t.t = 0; t.life = (3.5 + Math.random() * 5) * (1 - .5 * loose); }
    } else {
      t.bx += (q[0] - t.bx) * k5; t.by += (q[1] - t.by) * k5;
      if (t.t > t.life || !q[3]) {
        NODES[t.node].busy = false;
        if (want) { const nn = pickNode(proj); if (nn !== null) t.node = nn; else NODES[t.node].busy = true; t.state = 'seek'; t.t = 0; }
        else t.state = 'idle';
      }
    }
    t.a += ((want ? 1 : 0) - t.a) * Math.min(1, dt * 3);
    if (!want && t.a < .02) { NODES[t.node].busy = false; t.state = 'idle'; }
    t.sx = q[0]; t.sy = q[1]; t.vis = t.a * (t.state === 'lock' ? 1 : .7);
    t.el.style.opacity = t.vis.toFixed(2);
    t.el.style.transform = `translate(${t.bx.toFixed(1)}px,${t.by.toFixed(1)}px)`;
    t.plus.style.transform = `translate(${(q[0] - t.bx).toFixed(1)}px,${(q[1] - t.by).toFixed(1)}px)`;
    t.num.textContent = t.n;
    t.em.textContent = t.state === 'lock' ? `${fmt(q[2][0])} ${fmt(q[2][1])} ${fmt(q[2][2])}` : 'SEEK';
  });

  // collegamenti fra i mirini: ognuno ai due più vicini
  const on = TRK.filter(t => t.state !== 'idle' && t.vis > .05);
  const used = new Set(); let li = 0;
  on.forEach((a, i) => {
    on.map((b, j) => [Math.hypot(a.sx - b.sx, a.sy - b.sy), j]).filter(x => x[1] !== i).sort((x, y) => x[0] - y[0]).slice(0, 2).forEach(([, j]) => {
      const key = Math.min(i, j) + '-' + Math.max(i, j);
      if (used.has(key) || li >= linkEls.length) return; used.add(key);
      const b = on[j], l = linkEls[li++];
      l.setAttribute('x1', a.sx.toFixed(1)); l.setAttribute('y1', a.sy.toFixed(1));
      l.setAttribute('x2', b.sx.toFixed(1)); l.setAttribute('y2', b.sy.toFixed(1));
      l.setAttribute('stroke-opacity', (.3 * Math.min(a.vis, b.vis)).toFixed(3));
    });
  });
  for (; li < linkEls.length; li++) linkEls[li].setAttribute('stroke-opacity', '0');

  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
