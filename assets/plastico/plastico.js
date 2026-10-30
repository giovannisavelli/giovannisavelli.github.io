/* Apertura della home, il plastico dei corsi: la pianta dei corsi diventa un plastico in gesso su un pavimento buio.
   Un faro segue il mouse; i muri vicini si abbattono (ruotano sulla loro base e si sdraiano), poi si rialzano.
   Le misure sono quelle della pianta: 1 unità = 3 cm, l'edificio è 880 × 520 unità (26,40 × 15,60 m). */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const hero = document.getElementById('hero');
const box = document.querySelector('.muri');
const ridotto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const piccolo = () => innerWidth < 700;
const BASE = window.BASE_CORSI ?? '';

const STANZE = [
  { nome: 'Rendering 3D', aula: 7, sotto: 'INTERIOR · 2A 2B 2C', c: '#9d7bff', href: 'interior/rendering3d/', x: 60, y: 40, w: 300, h: 174 },
  { nome: 'Photoshop', aula: 12, sotto: 'INTERIOR · 2A 2B 2C', c: '#38bdf8', href: 'interior/photoshop/', x: 60, y: 214, w: 300, h: 172 },
  { nome: 'Intelligenza Artificiale', aula: 18, sotto: 'INTERIOR · 3A 3B 3C', c: '#34d399', href: 'interior/ia/', x: 60, y: 386, w: 300, h: 174 },
  { nome: 'Modellazione 3D', aula: 4, sotto: 'PRODUCT · II SEMESTRE', c: '#fb923c', href: 'product/modellazione/', x: 640, y: 40, w: 300, h: 260 },
  { nome: 'IA · Product', aula: 15, sotto: 'PRODUCT DESIGN', c: '#34d399', href: 'product/ia/', x: 640, y: 300, w: 300, h: 260 },
];
// il logo dell'Accademia (marchio AANT e scritta), tracciati presi dal file SVG del sito accademiadellearti.it: 450 × 196
const LOGO = ["M85.4,1.14c2.03,0,3.66,1.63,3.66,3.66v80.11c0,2.03-1.63,3.66-3.66,3.66h-26.84c-2.03,0-3.66-1.63-3.66-3.66v-21.96c0-2.03-1.63-3.66-3.66-3.66h-12.61c-2.03,0-3.66,1.63-3.66,3.66v21.96c0,2.03-1.63,3.66-3.66,3.66H3.66c-2.03,0-3.66-1.63-3.66-3.66V4.8C0,2.76,1.63,1.14,3.66,1.14h81.74Z", "M186.11,1.14c2.03,0,3.66,1.63,3.66,3.66v80.11c0,2.03-1.63,3.66-3.66,3.66h-26.84c-2.03,0-3.66-1.63-3.66-3.66v-21.96c0-2.03-1.63-3.66-3.66-3.66h-12.61c-2.03,0-3.66,1.63-3.66,3.66v21.96c0,2.03-1.63,3.66-3.66,3.66h-27.65c-2.03,0-3.66-1.63-3.66-3.66V4.8c0-2.03,1.63-3.66,3.66-3.66h81.74Z", "M186.09,99.56c2.03,0,3.66,2.02,3.66,4.06v23.18c0,2.03-1.63,3.66-3.66,3.66h-9.35c-2.03,0-3.66,1.63-3.66,3.66v49.61c0,2.03-1.63,3.66-3.66,3.66h-48.37c-2.03,0-3.66-1.63-3.66-3.66v-50.02c0-2.03-1.63-3.66-3.66-3.66h-9.35c-2.03,0-3.66-1.63-3.66-3.66v-23.18c0-2.03,1.63-3.66,3.66-3.66h80.52s1.19,0,1.19,0Z", "M.02,143.47v-40.25c0-2.02,1.64-3.66,3.66-3.66h24.64c2.03,0,4.88.81,6.5,2.03l17.22,11.86c1.62,1.22,2.85.41,2.85-1.63v-9.01c0-1.8,1.46-3.26,3.26-3.26h27.7s3.2-.04,3.2,3.26v80.92c0,2.02-1.64,3.66-3.66,3.66h-24.64c-2.03,0-4.88-.81-6.5-2.03l-16.42-11.32c-1.62-1.22-2.85-.41-2.85,1.63v8.47c0,1.8-1.46,3.26-3.26,3.26H3.21s-3.2.04-3.2-3.26v-40.66Z", "M229.94,27.67h-13.78l-2.84,9.16h-4.63L219.89,1.99h6.42l11.25,34.84h-4.78l-2.84-9.16ZM217.4,23.69h11.35l-5.57-18.06h-.2l-5.57,18.06Z", "M240.69,23.39c0-8.41,4.73-14.18,11.64-14.18,4.88,0,8.56,2.74,10.15,7.32l-3.93,1.14c-1.19-2.89-3.38-4.58-6.22-4.58-4.43,0-7.27,4.08-7.27,10.3s2.84,10.3,7.32,10.3c3.23,0,5.67-2.19,6.67-5.97l3.98,1c-1.49,5.62-5.42,8.86-10.65,8.86-6.97,0-11.69-5.77-11.69-14.18Z", "M266.67,23.39c0-8.41,4.73-14.18,11.64-14.18,4.88,0,8.56,2.74,10.15,7.32l-3.93,1.14c-1.19-2.89-3.38-4.58-6.22-4.58-4.43,0-7.27,4.08-7.27,10.3s2.84,10.3,7.32,10.3c3.23,0,5.67-2.19,6.67-5.97l3.98,1c-1.49,5.62-5.42,8.86-10.65,8.86-6.97,0-11.69-5.77-11.69-14.18Z", "M292.95,29.56c0-4.03,2.59-6.87,7.96-8.56l6.37-1.94c1.29-.4,1.79-1.05,1.79-2.34,0-2.34-1.94-3.98-5.13-3.98-3.38,0-5.52,1.84-6.32,5.32l-3.98-.9c.9-4.93,4.88-7.96,10.45-7.96s9.36,3.18,9.36,8.11v19.51h-4.18v-4.48h-.2c-1.09,3.23-3.98,5.23-7.76,5.23-4.78,0-8.36-3.23-8.36-8.01ZM309.12,26.08v-4.28l-7.17,2.29c-3.09,1-4.63,2.79-4.63,5.28,0,2.99,2.19,4.98,5.13,4.98,3.83,0,6.67-3.33,6.67-8.26Z", "M329.87,9.21c3.38,0,6.07,1.54,7.66,4.43h.25V.25h4.28v36.58h-4.08v-4.68h-.25c-1.44,3.43-4.28,5.42-8.01,5.42-6.27,0-10.55-5.67-10.55-14.13s4.33-14.23,10.7-14.23ZM330.87,33.79c4.03,0,6.97-3.58,6.97-8.46v-3.98c0-4.98-2.79-8.36-6.87-8.36-4.48,0-7.41,4.13-7.41,10.4s2.94,10.4,7.32,10.4Z", "M348.18,23.39c0-8.46,4.63-14.18,11.45-14.18s11.05,5.37,11.05,13.24v.95h-18.21c.1,6.42,3.04,10.4,7.61,10.4,3.23,0,5.52-1.94,7.22-6.02l3.63,1.59c-2.14,5.47-5.77,8.21-10.8,8.21-7.22,0-11.94-5.67-11.94-14.18ZM352.66,20.15h13.49c-.4-4.58-2.94-7.37-6.52-7.37s-6.22,2.74-6.97,7.37Z", "M407.35,36.83v-18.11c0-3.43-1.89-5.57-4.88-5.57-3.63,0-6.22,3.23-6.22,7.91v15.78h-4.28v-18.11c0-3.43-1.89-5.57-4.88-5.57-3.58,0-6.17,3.23-6.17,7.91v15.78h-4.28V9.95h4.08v4.68h.2c1.14-3.43,3.83-5.42,7.32-5.42s6.22,1.94,7.37,5.03h.2c1.24-3.04,4.43-5.03,7.91-5.03,4.63,0,7.91,3.58,7.91,8.66v18.96h-4.28Z", "M421.04,0c1.59,0,2.84,1.14,2.84,2.74s-1.24,2.74-2.84,2.74-2.79-1.09-2.79-2.74,1.19-2.74,2.79-2.74ZM418.9,36.83V9.95h4.28v26.87h-4.28Z", "M429.9,29.56c0-4.03,2.59-6.87,7.96-8.56l6.37-1.94c1.29-.4,1.79-1.05,1.79-2.34,0-2.34-1.94-3.98-5.13-3.98-3.38,0-5.52,1.84-6.32,5.32l-3.98-.9c.9-4.93,4.88-7.96,10.45-7.96s9.36,3.18,9.36,8.11v19.51h-4.18v-4.48h-.2c-1.09,3.23-3.98,5.23-7.76,5.23-4.78,0-8.36-3.23-8.36-8.01ZM446.07,26.08v-4.28l-7.17,2.29c-3.09,1-4.63,2.79-4.63,5.28,0,2.99,2.19,4.98,5.13,4.98,3.83,0,6.67-3.33,6.67-8.26Z", "M220.34,58.97c3.38,0,6.07,1.54,7.66,4.43h.25v-13.39h4.28v36.58h-4.08v-4.68h-.25c-1.44,3.43-4.28,5.42-8.01,5.42-6.27,0-10.55-5.67-10.55-14.13s4.33-14.23,10.7-14.23ZM221.34,83.55c4.03,0,6.97-3.58,6.97-8.46v-3.98c0-4.98-2.79-8.36-6.87-8.36-4.48,0-7.41,4.13-7.41,10.4s2.94,10.4,7.32,10.4Z", "M238.65,73.15c0-8.46,4.63-14.18,11.45-14.18s11.05,5.37,11.05,13.24v.95h-18.21c.1,6.42,3.04,10.4,7.61,10.4,3.23,0,5.52-1.94,7.22-6.02l3.63,1.59c-2.14,5.47-5.77,8.21-10.8,8.21-7.22,0-11.94-5.67-11.94-14.18ZM243.13,69.92h13.49c-.4-4.58-2.94-7.37-6.52-7.37s-6.22,2.74-6.97,7.37Z", "M271.4,50.01v36.58h-4.28v-36.58h4.28Z", "M283.29,50.01v36.58h-4.28v-36.58h4.28Z", "M289.36,73.15c0-8.46,4.63-14.18,11.45-14.18s11.05,5.37,11.05,13.24v.95h-18.21c.1,6.42,3.04,10.4,7.61,10.4,3.23,0,5.52-1.94,7.22-6.02l3.63,1.59c-2.14,5.47-5.77,8.21-10.8,8.21-7.22,0-11.94-5.67-11.94-14.18ZM293.84,69.92h13.49c-.4-4.58-2.94-7.37-6.52-7.37s-6.22,2.74-6.97,7.37Z", "M350.02,77.43h-13.78l-2.84,9.16h-4.63l11.2-34.84h6.42l11.25,34.84h-4.78l-2.84-9.16ZM337.48,73.45h11.35l-5.57-18.06h-.2l-5.57,18.06Z", "M362.81,86.59v-26.87h4.08v5.52h.2c1.19-3.58,4.23-5.52,7.51-5.52h2.69v4.18h-2.89c-4.53,0-7.32,2.94-7.32,7.86v14.83h-4.28Z", "M390.58,86.59c-4.53,0-6.47-1.69-6.47-5.82v-17.62h-5.03v-3.43h5.03v-7.96h4.28v7.96h5.92v3.43h-5.92v16.77c0,2.24.9,2.99,3.28,2.99h2.64v3.68h-3.73Z", "M400.98,49.76c1.59,0,2.84,1.14,2.84,2.74s-1.24,2.74-2.84,2.74-2.79-1.09-2.79-2.74,1.19-2.74,2.79-2.74ZM398.84,86.59v-26.87h4.28v26.87h-4.28Z", "M209.64,122.92c0-8.46,4.63-14.18,11.45-14.18s11.05,5.37,11.05,13.24v.95h-18.21c.1,6.42,3.04,10.4,7.61,10.4,3.23,0,5.52-1.94,7.22-6.02l3.63,1.59c-2.14,5.47-5.77,8.21-10.8,8.21-7.22,0-11.94-5.67-11.94-14.18ZM214.12,119.68h13.49c-.4-4.58-2.94-7.37-6.52-7.37s-6.22,2.74-6.97,7.37Z", "M272.79,128.84c.5,1.14.9,2.04,1.39,3.23h.2c-.05-1.29-.05-2.29-.05-3.48v-27.07h4.43v34.84h-7.22l-13.34-27.32c-.5-1.14-.9-2.04-1.34-3.23h-.2c0,1.29.05,2.24.05,3.48v27.07h-4.43v-34.84h7.17l13.34,27.32Z", "M291,109.48v18.11c0,3.38,2.04,5.57,5.18,5.57,3.98,0,6.77-3.38,6.77-8.51v-15.18h4.33v26.87h-4.08v-4.73h-.2c-1.39,3.58-4.23,5.47-7.96,5.47-4.98,0-8.31-3.38-8.31-8.36v-19.26h4.28Z", "M325.19,137.1c-7.07,0-11.84-5.67-11.84-14.18s4.78-14.18,11.84-14.18,11.84,5.67,11.84,14.18-4.78,14.18-11.84,14.18ZM325.19,112.62c-4.58,0-7.46,4.08-7.46,10.3s2.89,10.3,7.46,10.3,7.46-4.08,7.46-10.3-2.89-10.3-7.46-10.3Z", "M348.13,136.36l-8.41-26.87h4.48l7.07,23.49h.2l7.07-23.49h4.28l-8.31,26.87h-6.37Z", "M365.55,122.92c0-8.46,4.63-14.18,11.45-14.18s11.05,5.37,11.05,13.24v.95h-18.21c.1,6.42,3.04,10.4,7.61,10.4,3.23,0,5.52-1.94,7.22-6.02l3.63,1.59c-2.14,5.47-5.77,8.21-10.8,8.21-7.22,0-11.94-5.67-11.94-14.18ZM370.03,119.68h13.49c-.4-4.58-2.94-7.37-6.52-7.37s-6.22,2.74-6.97,7.37Z", "M234.08,155.27h-10.4v30.85h-4.53v-30.85h-10.45v-3.98h25.38v3.98Z", "M234.03,172.68c0-8.46,4.63-14.18,11.45-14.18s11.05,5.37,11.05,13.24v.95h-18.21c.1,6.42,3.04,10.4,7.61,10.4,3.23,0,5.52-1.94,7.22-6.02l3.63,1.59c-2.14,5.47-5.77,8.21-10.8,8.21-7.22,0-11.94-5.67-11.94-14.18ZM238.5,169.45h13.49c-.4-4.58-2.94-7.37-6.52-7.37s-6.22,2.74-6.97,7.37Z", "M260.95,172.68c0-8.41,4.73-14.18,11.64-14.18,4.88,0,8.56,2.74,10.15,7.32l-3.93,1.14c-1.19-2.89-3.38-4.58-6.22-4.58-4.43,0-7.27,4.08-7.27,10.3s2.84,10.3,7.32,10.3c3.23,0,5.67-2.19,6.67-5.97l3.98,1c-1.49,5.62-5.42,8.86-10.65,8.86-6.97,0-11.69-5.77-11.69-14.18Z", "M304.39,186.12v-18.11c0-3.38-1.99-5.57-5.18-5.57-3.98,0-6.77,3.38-6.77,8.51v15.18h-4.28v-26.87h4.08v4.73h.2c1.39-3.58,4.18-5.47,7.91-5.47,4.98,0,8.31,3.38,8.31,8.36v19.26h-4.28Z", "M326.24,186.87c-7.07,0-11.84-5.67-11.84-14.18s4.78-14.18,11.84-14.18,11.84,5.67,11.84,14.18-4.78,14.18-11.84,14.18ZM326.24,162.38c-4.58,0-7.46,4.08-7.46,10.3s2.89,10.3,7.46,10.3,7.46-4.08,7.46-10.3-2.89-10.3-7.46-10.3Z", "M348.48,149.54v36.58h-4.28v-36.58h4.28Z", "M366.4,186.87c-7.07,0-11.84-5.67-11.84-14.18s4.78-14.18,11.84-14.18,11.84,5.67,11.84,14.18-4.78,14.18-11.84,14.18ZM366.4,162.38c-4.58,0-7.46,4.08-7.46,10.3s2.89,10.3,7.46,10.3,7.46-4.08,7.46-10.3-2.89-10.3-7.46-10.3Z", "M393.57,158.5c3.48,0,6.17,1.64,7.71,4.58h.2v-3.83h4.13v26.13c0,6.42-4.13,10.2-11,10.2-5.18,0-9.11-2.19-10.85-5.97l3.23-1.89c1.74,2.89,4.13,4.23,7.46,4.23,4.43,0,6.82-2.34,6.82-6.72v-4.53h-.2c-1.54,3.09-4.18,4.68-7.61,4.68-6.27,0-10.5-5.37-10.5-13.44s4.18-13.44,10.6-13.44ZM394.61,181.59c4.03,0,6.77-3.23,6.77-8.01v-3.68c0-4.43-2.89-7.61-6.82-7.61-4.33,0-7.22,3.78-7.22,9.65s2.89,9.65,7.27,9.65Z", "M415.02,149.29c1.59,0,2.84,1.14,2.84,2.74s-1.24,2.74-2.84,2.74-2.79-1.09-2.79-2.74,1.19-2.74,2.79-2.74ZM412.88,186.12v-26.87h4.28v26.87h-4.28Z", "M423.28,172.68c0-8.46,4.63-14.18,11.45-14.18s11.05,5.37,11.05,13.24v.95h-18.21c.1,6.42,3.04,10.4,7.61,10.4,3.23,0,5.52-1.94,7.22-6.02l3.63,1.59c-2.14,5.47-5.77,8.21-10.8,8.21-7.22,0-11.94-5.67-11.94-14.18ZM427.76,169.45h13.49c-.4-4.58-2.94-7.37-6.52-7.37s-6.22,2.74-6.97,7.37Z"];
const H = 64;                 // altezza dei muri (1,90 m): bassi come in un plastico, per vedere dentro le aule
const R = 150;                // i muri più vicini di così al mouse si abbattono

// ---------- i muri: [x1, z1, x2, z2] sull'asse del muro, con lo spessore a parte ----------
const MURI = [];
const muro = (x1, z1, x2, z2, s = 10) => MURI.push({ x1, z1, x2, z2, s });
// involucro, con l'ingresso al centro del lato di sotto
muro(60, 45, 940, 45); muro(65, 45, 65, 555); muro(935, 45, 935, 555);
muro(60, 555, 466, 555); muro(534, 555, 940, 555);
// muri dell'atrio, interrotti dalle porte delle aule
const conPorte = (x, porte) => { let z = 50; for (const [a, b] of porte) { muro(x, z, x, a); z = b; } muro(x, z, x, 550); };
conPorte(360, [[102, 152], [275, 325], [448, 498]]);
conPorte(640, [[145, 195], [405, 455]]);
// muri fra le aule
muro(70, 214, 355, 214); muro(70, 386, 355, 386); muro(645, 300, 930, 300);
// pilastri dell'atrio
const PILASTRI = [[398, 150], [602, 150], [398, 300], [602, 300], [398, 450], [602, 450]];   // vicini ai muri, per lasciare libero il logo

// ---------- scena ----------
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
// risoluzione: si parte da 1,5 al massimo e si scende da soli se il computer fa fatica (vedi «adatta» nel ciclo)
let dpr = Math.min(devicePixelRatio, 1.5);
renderer.setPixelRatio(dpr);
renderer.setClearColor(0x0a0a0d, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
box.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0a0a0d, 1500, 2900);
const camera = new THREE.PerspectiveCamera(32, 1, 10, 6000);

// luci: un velo d'ambiente e il faro, che fa tutto il resto (e le ombre dei muri)
scene.add(new THREE.HemisphereLight(0xbfc4cc, 0x0a0a0d, .32));
const faro = new THREE.SpotLight(0xfff3e2, 2.2e5, 2600, .42, .75, 1.6);
faro.castShadow = true; faro.shadow.mapSize.set(1024, 1024); faro.shadow.bias = -.0006; faro.shadow.radius = 6; faro.shadow.blurSamples = 8; faro.shadow.camera.near = 100; faro.shadow.camera.far = 2600;
scene.add(faro, faro.target);

// ---------- pavimento: la pianta disegnata su una tela, e una griglia che va lontano ----------
const SC = 2.4;                                     // pixel della tela per unità
const tela = document.createElement('canvas');
tela.width = 1080 * SC; tela.height = 700 * SC;     // margine di 40 unità attorno all'edificio
function disegnaPianta() {
  const c = tela.getContext('2d');
  c.setTransform(SC, 0, 0, SC, 40 * SC, 40 * SC);   // coordinate della pianta, con il margine
  c.fillStyle = '#121216'; c.fillRect(-40, -40, 1080, 700);
  const linea = (w, col) => { c.lineWidth = w; c.strokeStyle = col; };
  // griglia dei punti dell'atrio
  c.fillStyle = 'rgba(200,200,205,.22)';
  for (let x = 380; x <= 620; x += 24) for (let y = 60; y <= 540; y += 24) {
    if (x > 375 && x < 625 && y > 315 && y < 435) continue;   // sotto il logo niente puntini
    c.beginPath(); c.arc(x, y, .9, 0, 7); c.fill();
  }
  // impronte dei muri (si vedono quando i muri sono abbattuti)
  linea(1.2, 'rgba(230,226,218,.55)');
  for (const m of MURI) { const o = m.s / 2; c.strokeRect(Math.min(m.x1, m.x2) - (m.x1 === m.x2 ? o : 0), Math.min(m.z1, m.z2) - (m.z1 === m.z2 ? o : 0), Math.abs(m.x2 - m.x1) + (m.x1 === m.x2 ? m.s : 0), Math.abs(m.z2 - m.z1) + (m.z1 === m.z2 ? m.s : 0)); }
  // aule: tutte uguali, come laboratori. Si entra dall'atrio; lo schermo è sulla parete esterna
  // e banchi, monitor e sedie guardano lo schermo. Dalla parte della porta resta un corridoio libero.
  for (const s of STANZE) {
    const sx = s.x < 500, dir = sx ? 1 : -1, fx = sx ? s.x + 10 : s.x + s.w - 10, cz = s.y + s.h / 2;
    const X = (d, w) => sx ? fx + d : fx - d - w;          // distanza dalla parete dello schermo → x sulla tela
    // schermo e cattedra
    c.fillStyle = 'rgba(230,226,218,.75)'; c.fillRect(X(3, 3), cz - 46, 3, 92);
    linea(1, 'rgba(210,206,198,.6)'); c.strokeRect(X(26, 16), cz - 30, 16, 60);
    c.beginPath(); c.arc(fx + dir * 16, cz, 5, 0, 7); c.stroke();
    c.strokeRect(X(29, 6), cz + 10, 6, 10);                  // il portatile del docente
    // banchi da due, in file; ogni posto ha il suo monitor e la sua sedia
    const lato = (s.h - 20 - 26) / 2, n = lato > 95 ? 2 : 1, L = 42, passo = 50;
    for (const d of [56, 94, 132, 170]) for (const v of [-1, 1]) for (let k = 0; k < n; k++) {
      const z0 = v < 0 ? cz - 13 - (k + 1) * passo + (passo - L) : cz + 13 + k * passo;
      linea(1, 'rgba(200,198,190,.5)'); c.strokeRect(X(d, 18), z0, 18, L);
      linea(.8, 'rgba(200,198,190,.4)');
      for (const p of [.25, .75]) {
        c.beginPath(); c.moveTo(X(d + 3, 0), z0 + L * p - 6); c.lineTo(X(d + 3, 0), z0 + L * p + 6); c.stroke();
        c.beginPath(); c.arc(fx + dir * (d + 27), z0 + L * p, 4.5, 0, 7); c.stroke();
      }
    }
    // la porta, sull'atrio
    const py = cz - 25, d = sx ? -1 : 1, hx = sx ? 360 : 640;
    linea(1, 'rgba(220,216,208,.6)');
    c.beginPath(); c.moveTo(hx, py); c.lineTo(hx + d * 50, py); c.stroke();
    c.beginPath(); c.arc(hx, py, 50, d < 0 ? Math.PI : 0, Math.PI / 2, d < 0); c.stroke();
    // numero dell'aula e misure, nell'angolo libero vicino alla porta
    c.textAlign = sx ? 'right' : 'left';
    const tx = sx ? s.x + s.w - 16 : s.x + 16;
    c.fillStyle = 'rgba(236,232,222,.92)'; c.font = '600 15px Geist, Arial, sans-serif'; c.fillText(`AULA ${s.aula}`, tx, s.y + 34);
    c.fillStyle = 'rgba(190,186,178,.8)'; c.font = '500 8.5px "Geist Mono", monospace'; c.fillText(`${(s.w * .03).toFixed(2).replace('.', ',')} × ${(s.h * .03).toFixed(2).replace('.', ',')} M`, tx, s.y + 48);
    c.textAlign = 'left';
  }
  // atrio: il logo dell'Accademia, intero e pieno, nella fascia libera fra le due file di pilastri
  c.save(); c.translate(500 - 225 * .4, 375 - 98 * .4); c.scale(.4, .4);
  c.fillStyle = '#ece8de'; for (const d of LOGO) c.fill(new Path2D(d));
  c.restore();
  c.textAlign = 'center';
  c.fillStyle = 'rgba(220,216,208,.9)'; c.font = '500 12px "Geist Mono", monospace'; c.fillText('ATRIO', 500, 230);
  c.fillStyle = 'rgba(190,186,178,.8)'; c.font = '500 10px "Geist Mono", monospace'; c.fillText('INGRESSO ↑', 500, 616);
  linea(1, 'rgba(220,216,208,.6)');
  c.beginPath(); c.arc(466, 560, 34, 0, Math.PI / 2); c.stroke(); c.beginPath(); c.arc(534, 560, 34, Math.PI, Math.PI / 2, true); c.stroke();
  linea(.8, 'rgba(160,160,165,.6)');
  c.beginPath(); c.moveTo(60, 20); c.lineTo(940, 20); c.moveTo(60, 14); c.lineTo(60, 26); c.moveTo(940, 14); c.lineTo(940, 26); c.stroke();
  c.fillStyle = 'rgba(170,170,175,.8)'; c.fillText('26,40 m', 500, 14);
  c.beginPath(); c.moveTo(905, 590); c.lineTo(915, 566); c.lineTo(925, 590); c.lineTo(915, 584); c.closePath(); c.stroke(); c.fillText('N', 915, 604);
  c.textAlign = 'left'; c.fillText('PIANTA PIANO TERRA · 1:100', 60, 614);
  tex.needsUpdate = true;
}
const tex = new THREE.CanvasTexture(tela);
tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
const pianta = new THREE.Mesh(new THREE.PlaneGeometry(1080, 700), new THREE.MeshStandardMaterial({ map: tex, roughness: .95, metalness: 0, transparent: true, opacity: ridotto ? 1 : 0 }));
pianta.rotation.x = -Math.PI / 2; pianta.position.set(500, 0, 310); pianta.receiveShadow = true;
scene.add(pianta);
const suolo = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.MeshStandardMaterial({ color: 0x0f0f13, roughness: 1 }));
suolo.rotation.x = -Math.PI / 2; suolo.position.set(500, -.5, 310); suolo.receiveShadow = true; scene.add(suolo);
const griglia = new THREE.GridHelper(6000, 100, 0x18181d, 0x131317); griglia.position.set(500, -.2, 310); scene.add(griglia);
disegnaPianta(); document.fonts.ready.then(disegnaPianta);

// le aule accese: un velo del colore del corso sul pavimento
const veli = STANZE.map(s => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(s.w - 20, s.h - 20), new THREE.MeshBasicMaterial({ color: s.c, transparent: true, opacity: 0, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(s.x + s.w / 2, .6, s.y + s.h / 2); scene.add(m); return m;
});

// ---------- i muri del plastico: ognuno ruota attorno alla sua base ----------
const gesso = new THREE.MeshStandardMaterial({ color: 0xe9e5dc, roughness: .88, metalness: 0 });
const spigoli = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: .18 });
const pezzi = [];
function pezzo(cx, cz, lungo, spesso, alto, asseX) {
  // perno sulla base, sul lato lungo; la caduta è una rotazione attorno all'asse del muro
  const perno = new THREE.Group(); perno.position.set(cx, 0, cz); scene.add(perno);
  const geo = new RoundedBoxGeometry(asseX ? lungo : spesso, alto, asseX ? spesso : lungo, 2, 1.8);
  geo.translate(0, alto / 2, 0);
  const mesh = new THREE.Mesh(geo, gesso); mesh.castShadow = true; mesh.receiveShadow = true; perno.add(mesh);
  mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 35), spigoli));
  // nascita: i muri salgono dal pavimento a onda, partendo dall'ingresso
  const nasce = .9 + Math.hypot(cx - 500, cz - 560) / 620 * 1.5 + Math.random() * .15;
  mesh.scale.y = ridotto ? 1 : .001;
  pezzi.push({ perno, mesh, cx, cz, asseX, lungo, ang: 0, vel: 0, verso: 1, nasce, cresciuto: ridotto });
}
for (const m of MURI) {
  const asseX = m.z1 === m.z2, lungo = Math.hypot(m.x2 - m.x1, m.z2 - m.z1);
  if (lungo < 4) continue;
  // i muri lunghi si spezzano in pannelli: così cadono a pezzi, solo vicino al mouse
  const n = Math.max(1, Math.round(lungo / 70));
  for (let i = 0; i < n; i++) {
    const t = (i + .5) / n, l = lungo / n;
    pezzo(m.x1 + (m.x2 - m.x1) * t, m.z1 + (m.z2 - m.z1) * t, l - 1, m.s, H, asseX);
  }
}
for (const [x, z] of PILASTRI) pezzo(x, z, 14, 14, H + 6, true);

// ---------- i nomi dei corsi, sospesi sopra le aule (HTML, seguono la proiezione della telecamera) ----------
const etichette = document.createElement('div'); etichette.className = 'etichette'; box.appendChild(etichette);
let suEtichetta = -1;
const tag = STANZE.map((s, i) => {
  const a = document.createElement('a'); a.className = 'etichetta'; a.href = BASE + s.href; a.style.setProperty('--c', s.c);
  const corto = { 'Rendering 3D': 'Rendering', 'Intelligenza Artificiale': 'IA Interior', 'Modellazione 3D': 'Modellazione', 'IA · Product': 'IA Product' }[s.nome] || s.nome;
  a.innerHTML = `<b><i></i><span class="lungo">${s.nome}</span><span class="corto">${corto}</span></b><small>${s.sotto}</small>`;
  a.addEventListener('pointerenter', () => { suEtichetta = i; }); a.addEventListener('pointerleave', () => { suEtichetta = -1; });
  etichette.appendChild(a);
  return { a, p: new THREE.Vector3(s.x + s.w / 2, H + 46, s.y + s.h / 2 + 10) };
});
const v3 = new THREE.Vector3();
function piazzaEtichette() {
  const r = box.getBoundingClientRect();
  for (const t of tag) { v3.copy(t.p).project(camera); t.a.style.transform = `translate(${((v3.x + 1) / 2 * r.width).toFixed(1)}px, ${((1 - v3.y) / 2 * r.height).toFixed(1)}px) translate(-50%, -100%)`; }
}

// ---------- inquadratura ----------
function inquadra() {
  const r = box.getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  camera.aspect = r.width / r.height;
  if (piccolo()) { camera.position.set(500, 1500, 1850); camera.lookAt(500, 0, 300); camera.setViewOffset(r.width, r.height, 0, 0, r.width, r.height); }
  else {
    camera.position.set(560, 1180, 1820); camera.lookAt(500, 0, 330);
    // l'edificio sta a destra del titolo: si sposta l'inquadratura, non la scena
    camera.setViewOffset(r.width, r.height, -r.width * .19, -r.height * .03, r.width, r.height);
  }
  camera.updateProjectionMatrix();
}
inquadra(); addEventListener('resize', inquadra);

// ---------- mouse: punto sul pavimento, aula sotto il mouse ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), piano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), punto = new THREE.Vector3();
let mouse = null, ultimo = -1e9, sopra = null;
hero.addEventListener('pointermove', e => {
  const r = box.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  if (ray.ray.intersectPlane(piano, punto)) { mouse = punto.clone(); ultimo = performance.now(); }
});
hero.addEventListener('pointerleave', () => { ultimo = -1e9; });
const aulaIn = p => STANZE.findIndex(s => p && p.x > s.x + 10 && p.x < s.x + s.w - 10 && p.z > s.y + 10 && p.z < s.y + s.h - 10);
hero.addEventListener('click', e => {
  if (e.target.closest('a, button')) return;
  const i = aulaIn(mouse && performance.now() - ultimo < 500 ? mouse : null);
  if (i >= 0) location.href = BASE + STANZE[i].href;
});

// ---------- animazione ----------
const fuoco = new THREE.Vector3(500, 0, 330), col = new THREE.Color(0xfff3e2), BIANCO = new THREE.Color(0xfff3e2), tmp = new THREE.Color();
let tPrima = performance.now(), visibile = true;
const t0 = performance.now();
const adatta = { n: 0, somma: 0 };
new IntersectionObserver(e => { visibile = e[0].isIntersecting; }).observe(hero);
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.05, (now - tPrima) / 1000); tPrima = now;
  if (!visibile) return;
  // se un fotogramma dura troppo per un secondo di fila, si abbassa la risoluzione (fino a 0,75)
  adatta.n++; adatta.somma += dt;
  if (adatta.somma > 1) {
    const media = adatta.somma / adatta.n;
    if (media > 1 / 45 && dpr > .75) { dpr = Math.max(.75, dpr - .25); renderer.setPixelRatio(dpr); inquadra(); }
    adatta.n = 0; adatta.somma = 0;
  }
  // il bersaglio: il mouse, o un giro lento sull'edificio quando il mouse non c'è
  const attivo = now - ultimo < 3500 && mouse;
  const s = now / 1000;
  const bx = attivo ? mouse.x : 500 + 330 * Math.sin(s * .19), bz = attivo ? mouse.z : 300 + 190 * Math.sin(s * .13 + 1);
  const k = ridotto ? 1 : 1 - Math.exp(-dt * 3.2);
  fuoco.x += (bx - fuoco.x) * k; fuoco.z += (bz - fuoco.z) * k;
  faro.position.set(fuoco.x + 60, 760, fuoco.z + 260); faro.target.position.copy(fuoco); faro.target.updateMatrixWorld();

  // aula sotto il faro: si accende e la luce prende il suo colore
  const i = suEtichetta >= 0 ? suEtichetta : aulaIn(attivo ? mouse : null);
  tag.forEach((t, j) => t.a.classList.toggle('accesa', j === i));
  if (i !== sopra) { sopra = i; hero.style.cursor = i >= 0 ? 'pointer' : ''; }
  col.lerp(i >= 0 ? tmp.set(STANZE[i].c).lerp(BIANCO, .35) : BIANCO, 1 - Math.exp(-dt * 3)); faro.color.copy(col);
  veli.forEach((v, j) => { v.material.opacity += ((j === i ? .16 : 0) - v.material.opacity) * (1 - Math.exp(-dt * 4)); });

  // apertura: prima compare la pianta, poi i muri salgono a onda dall'ingresso, infine i nomi
  const vita = (now - t0) / 1000;
  if (!ridotto) pianta.material.opacity = Math.min(1, Math.max(0, (vita - .15) / .9));
  if (vita > 2.9) tag.forEach(t => t.a.classList.add('su'));
  const costruito = ridotto || vita > 3.4;

  // i muri: quelli vicini al faro si abbattono, cadendo dalla parte opposta al mouse; gli altri si rialzano
  const TERRA = Math.PI / 2 * .985;
  for (const p of pezzi) {
    if (!p.cresciuto) {
      const q = Math.min(1, Math.max(0, (vita - p.nasce) / .55));
      p.mesh.scale.y = Math.max(.001, 1 - Math.pow(1 - q, 3) + Math.sin(q * Math.PI) * .06 * (1 - q));
      if (q >= 1) { p.cresciuto = true; p.mesh.scale.y = 1; }
    }
    const d = Math.hypot(p.cx - fuoco.x, p.cz - fuoco.z);
    const giu = costruito && d < R;
    if (giu && p.ang < .05) p.verso = p.asseX ? Math.sign(p.cz - fuoco.z || 1) : -Math.sign(p.cx - fuoco.x || 1);
    if (ridotto) p.ang = giu ? TERRA : 0;
    else if (giu) {
      // cade come un corpo pesante: lento all'inizio, sempre più veloce, poi batte a terra e rimbalza appena
      p.vel += (1.2 + 24 * Math.sin(p.ang + .04)) * dt;
      p.ang += p.vel * dt;
      if (p.ang >= TERRA) { p.ang = TERRA; p.vel = Math.abs(p.vel) > .8 ? -p.vel * .2 : 0; }
    } else {
      // si rialza con calma, senza rimbalzi
      p.vel += ((0 - p.ang) * 14 - p.vel * 7.5) * dt; p.ang += p.vel * dt;
      if (p.ang < 0) { p.ang = 0; p.vel = 0; }
    }
    if (p.asseX) p.perno.rotation.set(p.ang * p.verso, 0, 0); else p.perno.rotation.set(0, 0, p.ang * p.verso);
  }
  piazzaEtichette();
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
