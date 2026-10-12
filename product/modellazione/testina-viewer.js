import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// Lo stesso modello anima l'header del corso e la pagina di esplorazione.
export function mountTestina(canvas, loading) {
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.5 : 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.13;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .55;
  scene.add(new THREE.HemisphereLight(0xfff4e9, 0x29232a, 1.25));
  const key = new THREE.DirectionalLight(0xffead6, 2.25);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb775, .65);
  rim.position.set(3, 2, -4);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(35, 1, .1, 40);
  const initial = new THREE.Vector3(2.75, 1.3, 5.6);
  camera.position.copy(initial);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = .075;
  controls.enablePan = false;
  controls.minDistance = 4.6;
  controls.maxDistance = 10;
  controls.minPolarAngle = .6;
  controls.maxPolarAngle = 2.18;
  controls.target.set(0, -.15, 0);
  controls.update();

  const legs = [];
  let sway = 0;
  let velocity = 0;
  const movement = { dragging: false, x: 0 };
  canvas.addEventListener('pointerdown', event => {
    movement.dragging = true;
    movement.x = event.clientX;
  });
  window.addEventListener('pointerup', () => { movement.dragging = false; });
  canvas.addEventListener('pointercancel', () => { movement.dragging = false; });
  canvas.addEventListener('pointermove', event => {
    if (!movement.dragging) return;
    const dx = event.clientX - movement.x;
    movement.x = event.clientX;
    if (!reduceMotion) velocity += THREE.MathUtils.clamp(dx * .08, -2.2, 2.2);
  });

  function rotate(sign) {
    const offset = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), -sign * Math.PI / 5);
    camera.position.copy(controls.target).add(offset);
    controls.update();
    if (!reduceMotion) velocity += sign * 3.5;
  }
  function reset() {
    camera.position.copy(initial);
    controls.target.set(0, -.15, 0);
    controls.update();
    velocity = 0;
  }
  canvas.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      rotate(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  const draco = new DRACOLoader();
  draco.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/');
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);
  loader.load('../../assets/modelli/testina-pupazzetto.glb', ({ scene: model }) => {
    scene.add(model);
    for (const name of ['GambaSinistraPivot', 'GambaDestraPivot']) {
      const pivot = model.getObjectByName(name);
      if (pivot) {
        pivot.rotation.x = .22;
        legs.push(pivot);
      }
    }
    if (loading) {
      loading.classList.add('done');
      loading.addEventListener('transitionend', () => loading.remove(), { once: true });
    }
  }, undefined, error => {
    console.error('Impossibile caricare Testolona:', error);
    if (loading) loading.textContent = 'Il modello 3D non è disponibile. Riprova a caricare la pagina.';
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.fov = rect.width < 600 ? 42 : 35;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  let frameId = null;
  let previousTime = 0;
  let inView = true;
  function frame(now) {
    frameId = requestAnimationFrame(frame);
    const dt = Math.min((now - previousTime) / 1000 || 0, .04);
    previousTime = now;
    if (!reduceMotion) {
      velocity += (-24 * sway - 6 * velocity) * dt;
      sway = THREE.MathUtils.clamp(sway + velocity * dt, -.28, .28);
      legs.forEach((pivot, index) => { pivot.rotation.z = sway * (index === 0 ? 1 : .9); });
    }
    controls.update();
    renderer.render(scene, camera);
  }
  function updateVisibility() {
    if (inView && !document.hidden && frameId === null) {
      previousTime = performance.now();
      frameId = requestAnimationFrame(frame);
    } else if ((!inView || document.hidden) && frameId !== null) {
      cancelAnimationFrame(frameId);
      frameId = null;
    }
  }
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updateVisibility();
  }).observe(canvas);
  document.addEventListener('visibilitychange', updateVisibility);
  updateVisibility();

  return { rotate, reset };
}
