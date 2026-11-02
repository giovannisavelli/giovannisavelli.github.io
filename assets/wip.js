/* «Lavori in corso»: il docente che batte sulla tastiera come un pazzo.
 * Si mette un <div class="wip-anim" aria-hidden="true"></div> dove serve e si carica questo file.
 * Disegno e animazione sono in SVG e CSS, col colore del corso (var(--accent)). */
(function () {
  const stile = document.createElement('style');
  stile.textContent = `
    .wip-anim { width: min(420px, 100%); margin: 0 0 18px; color: var(--accent, #a78bfa); }
    .wip-anim svg { display: block; width: 100%; height: auto; overflow: visible; }
    .wip-anim * { transform-box: view-box; }
    .wip-braccio-a { transform-origin: 112px 118px; animation: wip-braccio .17s ease-in-out infinite alternate; }
    .wip-braccio-b { transform-origin: 108px 120px; animation: wip-braccio .17s ease-in-out -.085s infinite alternate; }
    .wip-avambraccio-a { transform-origin: 130px 150px; animation: wip-avambraccio .13s ease-in-out infinite alternate; }
    .wip-avambraccio-b { transform-origin: 126px 152px; animation: wip-avambraccio .13s ease-in-out -.07s infinite alternate; }
    .wip-dita line { animation: wip-dito .09s linear infinite alternate; }
    .wip-dita line:nth-child(2) { animation-delay: -.03s; } .wip-dita line:nth-child(3) { animation-delay: -.06s; }
    .wip-testa { transform-origin: 120px 108px; animation: wip-testa .34s ease-in-out infinite alternate; }
    .wip-corpo { transform-origin: 86px 182px; animation: wip-corpo .34s ease-in-out infinite alternate; }
    .wip-codice { animation: wip-scorri 2.4s linear infinite; }
    .wip-tasto { animation: wip-tasto .6s steps(1) infinite; opacity: .25; }
    .wip-tac { opacity: 0; transform-origin: center; animation: wip-tac 1.2s ease-out infinite; }
    .wip-goccia { animation: wip-goccia 1.6s ease-in infinite; opacity: 0; }
    .wip-tazza { transform-origin: 317px 188px; animation: wip-tazza .2s linear infinite alternate; }
    .wip-fumo { animation: wip-fumo 1.8s ease-out infinite; opacity: 0; }
    .wip-velocita line { animation: wip-velocita .24s steps(2) infinite; }
    .wip-cursore { animation: wip-cursore .8s steps(1) infinite; }
    @keyframes wip-braccio { from { transform: rotate(-7deg); } to { transform: rotate(5deg); } }
    @keyframes wip-avambraccio { from { transform: rotate(-15deg); } to { transform: rotate(8deg); } }
    @keyframes wip-dito { from { transform: translateY(-2px); } to { transform: translateY(2px); } }
    @keyframes wip-testa { from { transform: rotate(-3deg) translateY(0); } to { transform: rotate(4deg) translateY(1.5px); } }
    @keyframes wip-corpo { from { transform: rotate(-1deg); } to { transform: rotate(1.5deg); } }
    @keyframes wip-scorri { from { transform: translateY(0); } to { transform: translateY(-80px); } }
    @keyframes wip-tasto { 0%, 49% { opacity: 1; } 50%, 100% { opacity: .25; } }
    @keyframes wip-tac { 0% { opacity: 0; transform: scale(.4) translateY(6px); } 15% { opacity: 1; transform: scale(1.1) translateY(0); }
      45% { opacity: 1; transform: scale(1) translateY(-6px); } 70%, 100% { opacity: 0; transform: scale(.9) translateY(-12px); } }
    @keyframes wip-goccia { 0% { opacity: 0; transform: translate(0, 0); } 10% { opacity: .9; } 80% { opacity: .9; transform: translate(-8px, 26px); } 100% { opacity: 0; transform: translate(-9px, 32px); } }
    @keyframes wip-tazza { from { transform: rotate(-3deg) translateX(-.6px); } to { transform: rotate(3deg) translateX(.6px); } }
    @keyframes wip-fumo { 0% { opacity: 0; transform: translateY(4px); } 30% { opacity: .55; } 100% { opacity: 0; transform: translateY(-16px); } }
    @keyframes wip-velocita { 0% { opacity: .9; } 50% { opacity: 0; } }
    @keyframes wip-cursore { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
    @media (prefers-reduced-motion: reduce) { .wip-anim * { animation: none !important; } .wip-tac { opacity: 1; } }
  `;
  document.head.appendChild(stile);

  // Righe di codice sul monitor: due copie uguali una sotto l'altra, così lo scorrimento non ha salti.
  const righe = [[0, 70, 1], [10, 46, .5], [20, 88, .5], [30, 58, 1], [40, 34, .5], [50, 76, .5], [60, 52, 1], [70, 92, .5]];
  const codice = [0, 80].map(dy => righe.map(([y, w, a], i) =>
    `<rect x="${217 + (i % 3) * 8}" y="${84 + y + dy}" width="${w}" height="4" rx="2" fill="${a === 1 ? 'currentColor' : '#8a8a99'}" opacity="${a === 1 ? .9 : .55}"/>`).join('')).join('');
  const tasti = Array.from({ length: 10 }, (_, i) =>
    `<rect class="wip-tasto" x="${155 + i * 9.4}" y="182" width="6.5" height="4" rx="1" fill="currentColor" style="animation-delay:${-(i * 0.37 % 0.6).toFixed(2)}s"/>`).join('');

  const SVG = `
  <svg viewBox="0 0 360 230" xmlns="http://www.w3.org/2000/svg">
    <defs><clipPath id="wip-schermo"><rect x="211" y="76" width="113" height="73" rx="3"/></clipPath></defs>
    <line x1="14" y1="197" x2="346" y2="197" stroke="#3a3a46" stroke-width="2" stroke-linecap="round"/>
    <rect x="128" y="189" width="222" height="7" rx="2" fill="#2a2a34"/>
    <!-- sedia -->
    <path d="M44 178 h58 M52 178 v18 M96 178 v18 M46 178 Q40 140 52 118" fill="none" stroke="#4a4a58" stroke-width="5" stroke-linecap="round"/>
    <!-- monitor -->
    <rect x="205" y="70" width="125" height="85" rx="8" fill="#101016" stroke="currentColor" stroke-width="2.5"/>
    <g clip-path="url(#wip-schermo)"><g class="wip-codice">${codice}</g></g>
    <rect class="wip-cursore" x="300" y="138" width="7" height="5" fill="currentColor"/>
    <rect x="262" y="155" width="10" height="30" fill="#2a2a34"/><rect x="243" y="184" width="48" height="5" rx="2" fill="#2a2a34"/>
    <!-- tazza col caffè che trema -->
    <g class="wip-tazza"><rect x="310" y="172" width="15" height="17" rx="3" fill="#d9d4cc"/><path d="M325 176 q6 1 6 5 t-6 5" fill="none" stroke="#d9d4cc" stroke-width="2.5"/></g>
    <path class="wip-fumo" d="M314 166 q-4 -6 0 -11 t0 -11" fill="none" stroke="#9a9aa8" stroke-width="2" stroke-linecap="round"/>
    <path class="wip-fumo" style="animation-delay:-.9s" d="M321 166 q4 -6 0 -11 t0 -11" fill="none" stroke="#9a9aa8" stroke-width="2" stroke-linecap="round"/>
    <!-- tastiera -->
    <rect x="150" y="179" width="102" height="10" rx="2.5" fill="#1b1b23" stroke="#4a4a58" stroke-width="1.5"/>
    ${tasti}
    <!-- braccio dietro -->
    <g class="wip-braccio-b">
      <line x1="108" y1="120" x2="126" y2="152" stroke="#1c1c25" stroke-width="10" stroke-linecap="round"/>
      <g class="wip-avambraccio-b"><line x1="126" y1="152" x2="168" y2="174" stroke="#1c1c25" stroke-width="9" stroke-linecap="round"/><circle cx="170" cy="175" r="5.5" fill="#c9b19c"/></g>
    </g>
    <!-- corpo e testa -->
    <g class="wip-corpo">
      <path d="M66 184 Q66 140 98 110 Q112 104 122 116 Q114 150 106 184 Z" fill="#2c2c39"/>
      <path d="M98 110 Q112 104 122 116" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      <g class="wip-testa">
        <circle cx="124" cy="90" r="19" fill="#e2cbb6"/>
        <path d="M114 77 q5 -5 11 -5" fill="none" stroke="#fff3e6" stroke-width="3" stroke-linecap="round" opacity=".8"/>
        <circle cx="137" cy="88" r="1.9" fill="#101016"/>
        <path d="M133 83 q4 -2 8 0" fill="none" stroke="#2a2320" stroke-width="2" stroke-linecap="round"/>
        <path d="M110 94 q4 8 12 10 q10 2 20 -6 q2 14 -6 24 q-6 8 -14 6 q-10 -4 -12 -18 z" fill="#2a2320"/>
        <path class="wip-goccia" d="M110 80 q-3 5 0 7 q3 -2 0 -7 z" fill="#8fd3ff"/>
      </g>
    </g>
    <!-- braccio davanti -->
    <g class="wip-braccio-a">
      <line x1="112" y1="118" x2="130" y2="150" stroke="#34344a" stroke-width="11" stroke-linecap="round"/>
      <g class="wip-avambraccio-a"><line x1="130" y1="150" x2="190" y2="173" stroke="#34344a" stroke-width="10" stroke-linecap="round"/>
        <circle cx="192" cy="174" r="6" fill="#e2cbb6"/>
        <g class="wip-dita"><line x1="194" y1="177" x2="197" y2="183" stroke="#e2cbb6" stroke-width="2.5" stroke-linecap="round"/><line x1="198" y1="175" x2="202" y2="181" stroke="#e2cbb6" stroke-width="2.5" stroke-linecap="round"/><line x1="190" y1="178" x2="191" y2="184" stroke="#e2cbb6" stroke-width="2.5" stroke-linecap="round"/></g>
      </g>
    </g>
    <!-- linee di velocità e onomatopee -->
    <g class="wip-velocita" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <line x1="176" y1="160" x2="183" y2="153"/><line x1="192" y1="158" x2="196" y2="149"/><line x1="207" y1="163" x2="214" y2="157"/>
    </g>
    <g font-family="Geist Mono, ui-monospace, monospace" font-weight="700" fill="currentColor">
      <text class="wip-tac" x="160" y="146" font-size="13">tac</text>
      <text class="wip-tac" x="196" y="132" font-size="15" style="animation-delay:-.4s">TAC!</text>
      <text class="wip-tac" x="150" y="122" font-size="12" style="animation-delay:-.8s">clac</text>
    </g>
  </svg>`;

  /* ---------- Il diorama 3D: una scrivania in miniatura sospesa, col docente «giocattolo» che batte come un pazzo ----------
   * Idea presa dai diorami isometrici in scala giocattolo (riferimento del radar): pedana sospesa, personaggi a blocchi
   * con braccia articolate, contorni scuri. Il disegno SVG qui sopra resta per chi non ha il 3D o riduce le animazioni. */
  const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
  const stile3d = document.createElement('style');
  stile3d.textContent = `
    .wip-anim.wip-3d { position: relative; width: min(560px, 100%); aspect-ratio: 16 / 11; }
    .wip-anim.wip-3d canvas { display: block; width: 100%; height: 100%; }
    .wip-bolla { position: absolute; pointer-events: none; color: var(--accent, #a78bfa); font: 700 15px/1 'Geist Mono', ui-monospace, monospace;
      text-shadow: 0 2px 0 #101016, 0 0 12px rgba(0,0,0,.6); animation: wip-bolla .9s ease-out forwards; }
    @keyframes wip-bolla { 0% { opacity: 0; transform: translate(-50%, 0) scale(.4) rotate(var(--r)); } 18% { opacity: 1; transform: translate(-50%, -10px) scale(1.15) rotate(var(--r)); }
      100% { opacity: 0; transform: translate(-50%, -42px) scale(.95) rotate(var(--r)); } }
    .wip-zeta { color: #f1e7da; font-size: 13px; animation: wip-zeta 1.9s ease-out forwards; }
    @keyframes wip-zeta { 0% { opacity: 0; transform: translate(-50%, 0) scale(.5); } 20% { opacity: .9; } 100% { opacity: 0; transform: translate(-10%, -40px) scale(1.2); } }
  `;
  document.head.appendChild(stile3d);

  function webglDisponibile() {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  }

  async function diorama(box) {
    const THREE = await import(THREE_URL);
    const accento = new THREE.Color(getComputedStyle(box).color);
    box.innerHTML = '';
    box.classList.add('wip-3d');
    const tela = document.createElement('canvas');
    box.appendChild(tela);
    const renderer = new THREE.WebGLRenderer({ canvas: tela, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scena = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 60);
    cam.position.set(6.6, 6.9, -5.6);
    cam.lookAt(0.0, 1.35, 0.55);

    // materiali a tre toni, come un giocattolo dipinto
    const scala = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat);
    scala.minFilter = scala.magFilter = THREE.NearestFilter; scala.needsUpdate = true;
    const tinta = (c, extra) => new THREE.MeshToonMaterial(Object.assign({ color: c, gradientMap: scala }, extra || {}));
    const luce = c => new THREE.MeshBasicMaterial({ color: c });
    const CONTORNO = new THREE.MeshBasicMaterial({ color: 0x1a1420, side: THREE.BackSide });
    const mondo = new THREE.Group();
    scena.add(mondo);

    // ogni pezzo ha il suo contorno scuro: una copia un filo più grande, vista da dentro
    function pezzo(geo, mat, x, y, z, padre, bordo) {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
      (padre || mondo).add(m);
      const b = bordo === undefined ? 0.02 : bordo;
      if (b) {
        geo.computeBoundingBox();
        const s = geo.boundingBox.getSize(new THREE.Vector3());
        const o = new THREE.Mesh(geo, CONTORNO);
        o.scale.set(1 + 2 * b / Math.max(s.x, .01), 1 + 2 * b / Math.max(s.y, .01), 1 + 2 * b / Math.max(s.z, .01));
        m.add(o);
      }
      return m;
    }
    const box3 = (x, y, z) => new THREE.BoxGeometry(x, y, z);
    // scatola con gli spigoli arrotondati: ogni punto della superficie viene spinto sulla «pelle» di un raggio r
    function tondo(x, y, z, r) {
      r = Math.min(r === undefined ? Math.min(x, y, z) * 0.28 : r, x / 2, y / 2, z / 2);
      const g = new THREE.BoxGeometry(x, y, z, 4, 4, 4), pos = g.attributes.position;
      const dentro = new THREE.Vector3(x / 2 - r, y / 2 - r, z / 2 - r), fuori = dentro.clone().negate(), v = new THREE.Vector3(), c = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i); c.copy(v).clamp(fuori, dentro);
        v.sub(c); if (v.lengthSq() > 1e-12) v.setLength(r); v.add(c);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      return g;
    }
    const palla = (r, sy) => { const g = new THREE.SphereGeometry(r, 20, 14); if (sy) g.scale(1, sy, 1); return g; };

    /* ---------- la stanzetta: pavimento in legno, due pareti, battiscopa ---------- */
    const X0 = -2.3, X1 = 3.3, Z0 = -1.8, Z1 = 2.2, H = 3.1;
    pezzo(box3(X1 - X0, 0.3, Z1 - Z0), tinta(0xd9b58d), (X0 + X1) / 2, -0.15, (Z0 + Z1) / 2);
    const asse = tinta(0xc9a27a);
    for (let i = 1; i < 9; i++) pezzo(box3(0.015, 0.005, Z1 - Z0 - 0.02), asse, X0 + i * (X1 - X0) / 9, 0.003, (Z0 + Z1) / 2, mondo, 0);
    const muro = tinta(0xf1e7da), muro2 = tinta(0xe6d9c8);
    pezzo(box3(X1 - X0, H, 0.16), muro, (X0 + X1) / 2, H / 2, Z1 + 0.08);
    pezzo(box3(0.16, H, Z1 - Z0 + 0.16), muro2, X0 - 0.08, H / 2, (Z0 + Z1) / 2 + 0.08);
    const battiscopa = tinta(0xb48a64);
    pezzo(box3(X1 - X0, 0.14, 0.04), battiscopa, (X0 + X1) / 2, 0.07, Z1 - 0.02, mondo, 0.01);
    pezzo(box3(0.04, 0.14, Z1 - Z0), battiscopa, X0 + 0.02, 0.07, (Z0 + Z1) / 2, mondo, 0.01);
    // tappeto tondo nel colore del corso
    const tappeto = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.03, 40), tinta(accento.clone().lerp(new THREE.Color(0xffffff), 0.15)));
    tappeto.position.set(0.55, 0.02, 1.0); tappeto.receiveShadow = true; mondo.add(tappeto);

    // finestra sul muro di sinistra: notte, luna, stelle
    const fin = new THREE.Group(); fin.position.set(X0 + 0.01, 1.95, 0.35); fin.rotation.y = Math.PI / 2; mondo.add(fin);
    pezzo(box3(1.3, 1.05, 0.06), tinta(0xffffff), 0, 0, 0.02, fin);
    pezzo(box3(1.14, 0.9, 0.02), luce(0x1d2350), 0, 0, 0.06, fin, 0);
    pezzo(box3(0.04, 0.9, 0.03), tinta(0xffffff), 0, 0, 0.08, fin, 0);
    pezzo(box3(1.14, 0.04, 0.03), tinta(0xffffff), 0, 0, 0.08, fin, 0);
    const lunaM = new THREE.Mesh(palla(0.13), luce(0xfff2c4)); lunaM.position.set(0.3, 0.22, 0.08); fin.add(lunaM);
    const stelle = [[-0.4, 0.3], [-0.2, 0.12], [-0.35, -0.2], [0.2, -0.25], [0.42, -0.05], [-0.12, -0.35], [0.05, 0.32]].map(([x, y]) => {
      const st = new THREE.Mesh(box3(0.035, 0.035, 0.01), luce(0xffffff)); st.position.set(x, y, 0.075); fin.add(st); return st;
    });
    pezzo(box3(1.4, 0.06, 0.18), tinta(0xffffff), 0, -0.55, 0.08, fin); // davanzale

    // mensola con libri e una piantina appesa, poster, orologio
    const mens = tinta(0xb48a64);
    pezzo(box3(1.5, 0.06, 0.3), mens, 1.9, 2.15, Z1 - 0.15);
    const coloriLibri = [0xe2725b, 0x5b8be2, 0xf2c14e, 0x6bbf8a, accento.getHex(), 0xe2725b];
    let lx = 1.3;
    coloriLibri.forEach((c, i) => {
      const h = 0.3 + (i * 37 % 5) * 0.03, w = 0.09 + (i % 2) * 0.03;
      const l = pezzo(tondo(w, h, 0.22, 0.015), tinta(c), lx, 2.18 + h / 2, Z1 - 0.15, mondo, 0.012);
      if (i === 5) { l.rotation.z = 0.35; l.position.x += 0.06; }
      lx += w + 0.02;
    });
    pezzo(new THREE.CylinderGeometry(0.1, 0.08, 0.16, 12), tinta(0xc9714a), 2.45, 2.26, Z1 - 0.15);
    const cascata = tinta(0x5fae6e);
    for (let i = 0; i < 4; i++) pezzo(tondo(0.07, 0.22 + i * 0.05, 0.05, 0.02), cascata, 2.38 + i * 0.05, 2.12 - i * 0.04, Z1 - 0.06 - i * 0.02, mondo, 0.01);
    // poster: un cubo in prospettiva, perché è il corso di 3D
    const poster = new THREE.Group(); poster.position.set(1.9, 2.85, Z1 - 0.01); poster.rotation.y = Math.PI; mondo.add(poster);
    pezzo(box3(0.62, 0.44, 0.03), tinta(0x23232d), 0, 0, 0, poster);
    const cuboPoster = new THREE.Mesh(box3(0.17, 0.17, 0.17), new THREE.MeshBasicMaterial({ color: accento, wireframe: true }));
    cuboPoster.position.set(0, 0.02, 0.12); poster.add(cuboPoster);
    // orologio con le lancette che corrono
    const orol = new THREE.Group(); orol.position.set(X0 + 0.01, 2.55, -1.05); orol.rotation.y = Math.PI / 2; mondo.add(orol);
    pezzo(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 28).rotateX(Math.PI / 2), tinta(0xffffff), 0, 0, 0.03, orol, 0.02);
    const lancetta = (l, w) => { const g = new THREE.Group(); g.position.z = 0.07; orol.add(g); const m = new THREE.Mesh(box3(w, l, 0.01), luce(0x23232d)); m.position.y = l / 2; g.add(m); return g; };
    const minuti = lancetta(0.2, 0.025), ore = lancetta(0.13, 0.035);

    // lampada da terra calda
    const lamp = new THREE.Group(); lamp.position.set(-1.75, 0, 1.7); mondo.add(lamp);
    pezzo(new THREE.CylinderGeometry(0.2, 0.22, 0.05, 20), tinta(0x2b2b36), 0, 0.03, 0, lamp);
    pezzo(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 10), tinta(0x2b2b36), 0, 0.98, 0, lamp, 0.012);
    pezzo(new THREE.CylinderGeometry(0.18, 0.32, 0.36, 20, 1, true), tinta(0xffd79a, { side: THREE.DoubleSide, emissive: 0xffb45e, emissiveIntensity: 0.35 }), 0, 2.0, 0, lamp, 0);
    const luceCalda = new THREE.PointLight(0xffb66b, 3.2, 5.5, 1.4); luceCalda.position.set(0, 1.9, 0); lamp.add(luceCalda);

    /* ---------- scrivania ---------- */
    const legno = tinta(0xa8784e);
    pezzo(tondo(3.0, 0.12, 1.35, 0.04), legno, 0.6, 1.5, -0.25);
    for (const [x, z] of [[-0.8, -0.82], [2.0, -0.82], [-0.8, 0.32], [2.0, 0.32]]) pezzo(tondo(0.1, 1.44, 0.1, 0.03), legno, x, 0.72, z);

    // monitor girato verso di lui, con la luce dello schermo sul viso
    const monitor = new THREE.Group();
    monitor.position.set(0.55, 1.56, -0.5); monitor.rotation.y = 0.35;
    mondo.add(monitor);
    const scuro = tinta(0x2a2a35);
    pezzo(tondo(0.5, 0.04, 0.32, 0.015), scuro, 0, 0.02, 0, monitor);
    pezzo(tondo(0.1, 0.42, 0.1, 0.03), scuro, 0, 0.23, -0.05, monitor);
    pezzo(tondo(1.55, 0.98, 0.09, 0.03), scuro, 0, 0.92, 0, monitor);
    pezzo(box3(0.22, 0.2, 0.01), tinta(0xffe27a), 0.66, 1.3, 0.05, monitor, 0.012); // post-it
    pezzo(tondo(0.2, 0.2, 0.015, 0.05), luce(accento), 0, 0.98, -0.048, monitor, 0); // logo sul retro
    const luceSchermo = new THREE.PointLight(accento, 2.4, 3.2, 1.6);
    luceSchermo.position.set(0, 0.9, 0.5); monitor.add(luceSchermo);

    // tastiera coi tasti che si accendono
    pezzo(tondo(1.05, 0.05, 0.36, 0.02), tinta(0x1f1f28), 0.5, 1.585, 0.02);
    const tasti = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 12; c++) {
      const m = tinta(0x44445a, { emissive: accento, emissiveIntensity: 0 });
      tasti.push(pezzo(tondo(0.062, 0.03, 0.075, 0.01), m, 0.5 - 0.44 + c * 0.08, 1.62, -0.09 + r * 0.095, mondo, 0));
    }

    // tazza fumante e le tazze già finite, piantina, fogli
    const bianco = tinta(0xf6f2ec);
    const tazza = new THREE.Group(); tazza.position.set(1.65, 1.56, 0.05); mondo.add(tazza);
    pezzo(new THREE.CylinderGeometry(0.11, 0.1, 0.22, 18), bianco, 0, 0.11, 0, tazza);
    pezzo(new THREE.TorusGeometry(0.06, 0.018, 8, 16), bianco, 0.12, 0.12, 0, tazza, 0.01);
    pezzo(new THREE.CylinderGeometry(0.095, 0.095, 0.01, 18), tinta(0x4a2c1c), 0, 0.215, 0, tazza, 0);
    const fumi = [0, 1, 2].map(() => { const f = new THREE.Mesh(palla(0.05), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); tazza.add(f); return f; });
    [[1.9, 1.67, -0.15, 0, 0xe2725b], [1.75, 1.67, -0.42, 0, 0x5b8be2], [1.95, 1.66, -0.62, Math.PI / 2, 0xf2c14e]].forEach(([x, y, z, r, c]) => {
      const t = pezzo(new THREE.CylinderGeometry(0.11, 0.1, 0.22, 18), tinta(c), x, y, z); t.rotation.z = r;
    });
    pezzo(new THREE.CylinderGeometry(0.15, 0.12, 0.24, 16), tinta(0xc9714a), -0.5, 1.68, -0.6);
    const foglia = tinta(0x5fae6e);
    const foglie = [[0, 0.25, 0, 0.25], [0.6, 0.22, 0.9, -0.35], [-0.5, 0.2, -0.8, 0.3], [0.15, 0.3, 2.5, 0.05]].map(([ry, h, rz, rx]) => {
      const f = pezzo(tondo(0.1, 0.4, 0.04, 0.02), foglia, -0.5, 1.88 + h * 0.4, -0.6, mondo, 0.012);
      f.rotation.set(rx, ry, rz * 0.5); f.userData.rz = rz * 0.5; return f;
    });
    const foglio = pezzo(box3(0.42, 0.01, 0.56), tinta(0xfbf8f2), 1.15, 1.565, -0.62, mondo, 0.01); foglio.rotation.y = 0.3;
    const foglio2 = pezzo(box3(0.42, 0.01, 0.56), tinta(0xefe9dd), 1.2, 1.575, -0.57, mondo, 0.01); foglio2.rotation.y = -0.15;

    // sedia
    const nera = tinta(0x34344a);
    pezzo(tondo(0.9, 0.14, 0.8, 0.06), nera, 0.5, 1.1, 1.2);
    pezzo(tondo(0.9, 1.0, 0.14, 0.06), nera, 0.5, 1.65, 1.6);
    pezzo(new THREE.CylinderGeometry(0.05, 0.05, 0.98, 10), nera, 0.5, 0.57, 1.2);
    pezzo(tondo(0.8, 0.07, 0.1, 0.03), nera, 0.5, 0.08, 1.2); pezzo(tondo(0.1, 0.07, 0.8, 0.03), nera, 0.5, 0.08, 1.2);

    /* ---------- il gatto che dorme sul suo cuscino ---------- */
    const gatto = new THREE.Group(); gatto.position.set(2.45, 0.02, 1.35); gatto.rotation.y = 0.6; mondo.add(gatto);
    pezzo(new THREE.CylinderGeometry(0.55, 0.6, 0.14, 28), tinta(accento.clone().lerp(new THREE.Color(0x1d1d27), 0.25)), 0, 0.07, 0, gatto);
    const pelo = tinta(0xf0a35e), pelo2 = tinta(0xfff3e4);
    const pancia = pezzo(palla(0.36, 0.62), pelo, 0, 0.33, 0, gatto, 0.015);
    const testaG = new THREE.Group(); testaG.position.set(0.3, 0.32, -0.12); gatto.add(testaG);
    pezzo(palla(0.2, 0.85), pelo, 0, 0, 0, testaG, 0.015);
    for (const z of [-0.1, 0.1]) { const o = pezzo(new THREE.ConeGeometry(0.07, 0.13, 4), pelo, 0.02, 0.18, z, testaG, 0.012); o.rotation.x = z > 0 ? 0.3 : -0.3; }
    pezzo(palla(0.09, 0.7), pelo2, 0.15, -0.05, 0, testaG, 0);
    for (const z of [-0.07, 0.07]) pezzo(box3(0.02, 0.015, 0.06), luce(0x2a1a14), 0.17, 0.03, z, testaG, 0);
    const coda = new THREE.Group(); coda.position.set(-0.3, 0.2, 0.15); gatto.add(coda);
    const codaM = pezzo(new THREE.CapsuleGeometry(0.06, 0.45, 4, 10), pelo, 0, 0, 0.26, coda, 0.012); codaM.rotation.x = Math.PI / 2;

    /* ---------- il docente «giocattolo»: rasato, barba lunga, occhi che sbattono ---------- */
    const felpa = tinta(accento.clone().lerp(new THREE.Color(0x1d1d27), 0.4));
    const pelle = tinta(0xf3cfb0);
    const jeans = tinta(0x3a4766);
    const corpo = new THREE.Group(); corpo.position.set(0.5, 1.15, 1.05); mondo.add(corpo);
    pezzo(tondo(0.8, 0.88, 0.52, 0.16), felpa, 0, 0.47, 0, corpo);
    pezzo(tondo(0.5, 0.26, 0.12, 0.05), felpa, 0, 0.62, 0.3, corpo, 0.015); // cappuccio
    for (const x of [-0.18, 0.18]) {
      pezzo(tondo(0.3, 0.26, 0.64, 0.1), jeans, x, 0.1, -0.28, corpo);
      pezzo(tondo(0.27, 1.02, 0.27, 0.1), jeans, x, -0.43, -0.55, corpo);
      pezzo(tondo(0.3, 0.14, 0.4, 0.06), tinta(0xf2f2f2), x, -0.98, -0.64, corpo);
    }
    const testa = new THREE.Group(); testa.position.set(0, 0.95, 0); corpo.add(testa);
    pezzo(tondo(0.9, 0.84, 0.8, 0.24), pelle, 0, 0.4, -0.02, testa);
    for (const x of [-0.46, 0.46]) pezzo(palla(0.1, 1.2), pelle, x, 0.38, 0.04, testa, 0.015); // orecchie
    pezzo(tondo(0.16, 0.06, 0.1, 0.03), tinta(0xfff3e6), -0.16, 0.8, 0.0, testa, 0); // riflesso sulla testa rasata
    const occhi = [-0.19, 0.19].map(x => {
      const o = pezzo(tondo(0.1, 0.13, 0.04, 0.03), luce(0x1a1420), x, 0.46, -0.42, testa, 0);
      const b = new THREE.Mesh(box3(0.035, 0.035, 0.01), luce(0xffffff)); b.position.set(0.02, 0.03, -0.022); o.add(b);
      return o;
    });
    for (const x of [-0.19, 0.19]) {
      pezzo(tondo(0.18, 0.04, 0.03, 0.015), tinta(0x4a3527), x, 0.59, -0.42, testa, 0); // sopracciglia
      pezzo(tondo(0.13, 0.07, 0.02, 0.03), tinta(0xff9a8a, { transparent: true, opacity: 0.75 }), x * 1.45, 0.32, -0.42, testa, 0); // guance
    }
    pezzo(tondo(0.13, 0.13, 0.12, 0.05), pelle, 0, 0.34, -0.45, testa, 0.012); // naso
    const barba = tinta(0x4a3527);
    pezzo(tondo(0.92, 0.3, 0.5, 0.12), barba, 0, 0.12, -0.19, testa);
    pezzo(tondo(0.7, 0.34, 0.38, 0.13), barba, 0, -0.14, -0.26, testa);
    const punta = pezzo(tondo(0.44, 0.3, 0.28, 0.12), barba, 0, -0.4, -0.3, testa); punta.rotation.x = 0.18;
    pezzo(tondo(0.22, 0.18, 0.18, 0.08), barba, 0, -0.6, -0.34, testa, 0.015);
    pezzo(tondo(0.46, 0.08, 0.08, 0.04), tinta(0x5a4130), 0, 0.27, -0.45, testa, 0.012); // baffi
    pezzo(tondo(0.14, 0.04, 0.02, 0.015), tinta(0x8a3d38), 0, 0.2, -0.425, testa, 0); // bocca
    const goccia = pezzo(palla(0.05, 1.4), tinta(0x8fd3ff), 0.44, 0.6, -0.12, testa, 0);

    // braccia articolate: spalla e gomito; le mani sfiorano i tasti dall'alto
    function braccio(x) {
      const spalla = new THREE.Group(); spalla.position.set(x, 0.78, -0.05); corpo.add(spalla);
      pezzo(tondo(0.22, 0.22, 0.52, 0.09), felpa, 0, 0, -0.22, spalla);
      const gomito = new THREE.Group(); gomito.position.set(0, 0, -0.46); spalla.add(gomito);
      pezzo(tondo(0.2, 0.2, 0.52, 0.08), felpa, 0, 0, -0.22, gomito);
      pezzo(tondo(0.19, 0.12, 0.19, 0.05), pelle, 0, -0.02, -0.52, gomito, 0.015);
      return { spalla, gomito };
    }
    const bracci = [braccio(-0.37), braccio(0.37)];

    // luci: cielo, sole di scena e la lampada calda
    scena.add(new THREE.HemisphereLight(0xfff4e8, 0x4a4058, 1.25));
    const sole = new THREE.DirectionalLight(0xffffff, 1.9);
    sole.position.set(4.5, 8, -2.5); sole.castShadow = true;
    sole.shadow.mapSize.set(1024, 1024);
    Object.assign(sole.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 1, far: 22 });
    sole.shadow.bias = -0.0008; sole.shadow.radius = 3;
    scena.add(sole);

    function misura() {
      const w = box.clientWidth, h = box.clientHeight; if (!w || !h) return;
      renderer.setSize(w, h, false);
      const metaH = 2.95, metaW = metaH * w / h;
      Object.assign(cam, { left: -metaW, right: metaW, top: metaH, bottom: -metaH }); cam.updateProjectionMatrix();
    }
    new ResizeObserver(misura).observe(box); misura();

    // «tac» in alto a destra, «z» sopra il gatto
    const parole = ['tac', 'TAC!', 'clac', 'tic', 'TAC', 'tak'];
    const p3 = new THREE.Vector3();
    function bolla(testo, sx, sy, piccola) {
      const s = document.createElement('span');
      s.className = 'wip-bolla' + (piccola ? ' wip-zeta' : '');
      s.textContent = testo;
      s.style.left = sx + '%'; s.style.top = sy + '%';
      s.style.setProperty('--r', (Math.random() * 24 - 12).toFixed(0) + 'deg');
      box.appendChild(s);
      setTimeout(() => s.remove(), piccola ? 1900 : 950);
    }

    let visibile = false, ultimaBolla = 0, ultimaZ = 0, prossimoBlink = 2;
    new IntersectionObserver(v => { visibile = v[0].isIntersecting; }).observe(box);
    const orologio = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      if ((!visibile || document.hidden) && window.wipTempo === undefined) { orologio.getDelta(); return; }
      // wipTempo serve solo per registrare il video fotogramma per fotogramma
      const t = window.wipTempo !== undefined ? window.wipTempo : orologio.getElapsedTime();
      const raffica = 1 + 0.7 * Math.max(0, Math.sin(t * 1.3)) ** 2;
      const f = 7.5 * raffica;
      bracci.forEach((b, i) => {
        const fase = i * Math.PI;
        b.spalla.rotation.x = -0.45 + 0.05 * Math.abs(Math.sin(t * f * Math.PI * 0.5 + fase));
        b.spalla.rotation.y = (i ? -1 : 1) * 0.1 + 0.16 * Math.sin(t * 1.9 + fase * 0.6);
        b.gomito.rotation.x = 0.47 + 0.3 * raffica * Math.abs(Math.sin(t * f * Math.PI + fase));
      });
      testa.rotation.x = 0.05 * Math.sin(t * 2 * Math.PI * 3.2);
      testa.rotation.z = 0.06 * Math.sin(t * 2.1);
      testa.rotation.y = -0.12 + 0.06 * Math.sin(t * 0.9);
      corpo.rotation.z = 0.025 * Math.sin(t * 2 * Math.PI * 1.6);
      corpo.position.y = 1.15 + 0.012 * Math.abs(Math.sin(t * 2 * Math.PI * 3.2));
      // occhi che sbattono ogni tanto
      const fase = (t % 3.4);
      const chiuso = fase > 3.25 || (fase > 1.6 && fase < 1.68);
      occhi.forEach(o => { o.scale.y = chiuso ? 0.12 : 1; });
      tasti.forEach(k => { k.material.emissiveIntensity *= 0.82; });
      for (let n = 0; n < 2 + Math.round(raffica * 2); n++) if (Math.random() < 0.35) tasti[Math.floor(Math.random() * tasti.length)].material.emissiveIntensity = 1.4;
      const g = (t * 0.6) % 1;
      goccia.position.set(0.44, 0.75 - g * 0.55, -0.12); goccia.visible = g < 0.85;
      fumi.forEach((s, i) => { const u = (t * 0.45 + i / 3) % 1; s.position.set(Math.sin(u * 6 + i) * 0.04, 0.28 + u * 0.45, 0); s.material.opacity = 0.5 * Math.sin(u * Math.PI); s.scale.setScalar(0.7 + u); });
      tazza.rotation.z = 0.04 * Math.sin(t * 40) * raffica;
      foglie.forEach((fo, i) => { fo.rotation.z = fo.userData.rz + 0.06 * Math.sin(t * 1.4 + i); });
      // gatto: respira e muove la coda
      pancia.scale.set(1, 1 + 0.04 * Math.sin(t * 2.2), 1 + 0.03 * Math.sin(t * 2.2));
      coda.rotation.y = 0.5 * Math.sin(t * 1.1) + 0.2;
      testaG.rotation.z = 0.05 * Math.sin(t * 2.2);
      // il tempo vola: lancette veloci, stelle che brillano
      minuti.rotation.z = -t * 3.0; ore.rotation.z = -t * 0.25;
      stelle.forEach((st, i) => { st.scale.setScalar(0.6 + 0.5 * Math.abs(Math.sin(t * 1.5 + i * 1.7))); });
      cuboPoster.rotation.y = t * 0.6; cuboPoster.rotation.x = 0.4;
      mondo.position.y = 0.04 * Math.sin(t * 1.1);
      if (t - ultimaBolla > 0.34 / raffica || t < ultimaBolla) { ultimaBolla = t; bolla(parole[Math.floor(Math.random() * parole.length)], 58 + Math.random() * 30, 34 + Math.random() * 18); }
      if (t - ultimaZ > 1.3 || t < ultimaZ) {
        ultimaZ = t;
        p3.set(0, 0.85, 0).applyMatrix4(gatto.matrixWorld).project(cam);
        bolla('z', (p3.x + 1) / 2 * 100 + 2, (1 - p3.y) / 2 * 100, true);
      }
      renderer.render(scena, cam);
    });
  }

  function disegna() {
    const movimento = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.wip-anim').forEach(d => {
      if (!d.firstChild) d.innerHTML = SVG;
      if (movimento && webglDisponibile()) diorama(d).catch(e => { console.warn('Lavori in corso: il 3D non parte, resta il disegno.', e); d.classList.remove('wip-3d'); d.innerHTML = SVG; });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', disegna, { once: true });
  else disegna();
})();
