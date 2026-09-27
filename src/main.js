import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 800px)').matches;
const canvas = document.querySelector('#webgl');
const sceneWrap = document.querySelector('.scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.25 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = !isMobile;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.setClearColor(0xeeeae1, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xeeeae1, 0.025);
const camera = new THREE.PerspectiveCamera(isMobile ? 40 : 34, innerWidth / innerHeight, 0.1, 100);
camera.position.set(isMobile ? 11 : 10.5, isMobile ? 7 : 5.2, isMobile ? 15 : 12);

const ambient = new THREE.HemisphereLight(0xfffaf1, 0x6c665b, 2.2);
scene.add(ambient);
const sun = new THREE.DirectionalLight(0xfff6df, 5.4);
sun.position.set(-7, 11, 8);
sun.castShadow = !isMobile;
sun.shadow.mapSize.set(isMobile ? 512 : 1536, isMobile ? 512 : 1536);
sun.shadow.camera.left = -14; sun.shadow.camera.right = 14; sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -10;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xd8e6e8, 2.1);
fill.position.set(9, 5, -5);
scene.add(fill);
const warmLight = new THREE.PointLight(0xffb75d, 0, 15, 1.8);
warmLight.position.set(0.5, 2.2, 1.4);
scene.add(warmLight);

const mat = {
  plaster: new THREE.MeshStandardMaterial({ color: 0xe4e1d8, roughness: 0.87, metalness: 0.01 }),
  plasterDark: new THREE.MeshStandardMaterial({ color: 0xc7c4ba, roughness: 0.92 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8b5d3d, roughness: 0.67 }),
  woodLight: new THREE.MeshStandardMaterial({ color: 0xb48159, roughness: 0.62 }),
  stone: new THREE.MeshStandardMaterial({ color: 0x77766f, roughness: 0.98 }),
  charcoal: new THREE.MeshStandardMaterial({ color: 0x282a27, roughness: 0.75 }),
  glass: new THREE.MeshPhysicalMaterial({ color: 0xbdd2d2, transmission: 0.64, transparent: true, opacity: 0.43, roughness: 0.08, metalness: 0.02, thickness: 0.08 }),
  glow: new THREE.MeshStandardMaterial({ color: 0xd7a56d, emissive: 0xffa948, emissiveIntensity: 0 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x566152, roughness: 1 }),
  trunk: new THREE.MeshStandardMaterial({ color: 0x69513c, roughness: 1 })
};

const house = new THREE.Group();
house.position.set(isMobile ? 3 : 1.8, isMobile ? -1.8 : -1.2, 0);
house.rotation.y = -0.48;
scene.add(house);
const pieces = { roof: [], upper: [], left: [], right: [], floor: [], fixed: [], glass: [] };

function box(name, size, pos, material, group = 'fixed', opts = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name; mesh.position.set(...pos); mesh.castShadow = opts.cast ?? true; mesh.receiveShadow = opts.receive ?? true;
  mesh.userData.base = mesh.position.clone(); house.add(mesh); pieces[group].push(mesh); return mesh;
}

// Foundation, stepped ground plane and terrace.
box('foundation', [9.2, .35, 6.6], [0, -.3, 0], mat.stone, 'fixed');
box('internal-floor', [7.8, .2, 5.4], [-.15, 0, -.05], mat.woodLight, 'floor');
box('terrace', [7.3, .16, 2.15], [.6, -.05, 4], mat.wood, 'floor');
box('entry-step', [2.5, .18, 1.4], [-4.5, -.13, 2.7], mat.stone, 'fixed');

// Main walls: carefully leave the front open for full-height glazing.
box('back-wall', [8.4, 3.4, .22], [0, 1.75, -2.6], mat.plaster, 'left');
box('left-wall', [.22, 3.4, 5.4], [-4.1, 1.75, 0], mat.plaster, 'left');
box('right-core', [2.15, 3.4, 2.8], [3.05, 1.75, -1.25], mat.plaster, 'right');
box('wood-core', [1.75, 3.1, 2.35], [-1.6, 1.62, -1.3], mat.wood, 'right');
box('interior-partition', [.14, 2.65, 2.5], [.8, 1.42, -1.18], mat.plasterDark, 'right');
box('deep-eave', [9.25, .25, 6.25], [0, 3.56, .08], mat.charcoal, 'roof');
box('roof-cap', [8.95, .17, 5.95], [0, 3.77, .08], mat.plasterDark, 'roof');

// Glazing and slender mullions.
box('front-glass', [5.75, 2.85, .08], [.48, 1.55, 2.63], mat.glass, 'glass', { cast: false });
box('side-glass', [.08, 2.85, 2.55], [4.08, 1.55, 1.25], mat.glass, 'glass', { cast: false });
[-2.4, -.45, 1.5, 3.36].forEach((x) => box('mullion', [.055, 2.95, .11], [x, 1.55, 2.68], mat.charcoal, 'right'));
box('window-head', [5.9, .08, .12], [.48, 3.04, 2.68], mat.charcoal, 'right');

// Upper volume lends the building a non-boxlike, cantilevered silhouette.
box('upper-volume', [4.25, 1.55, 3.3], [-1.25, 4.62, -.65], mat.plaster, 'upper');
box('upper-window', [2.3, .72, .09], [-1.15, 4.72, 1.04], mat.glass, 'upper', { cast: false });
box('upper-frame', [2.55, .09, .12], [-1.15, 5.1, 1.08], mat.charcoal, 'upper');
box('upper-roof', [4.7, .2, 3.7], [-1.25, 5.52, -.65], mat.charcoal, 'roof');

// Timber screen creates depth across the garden elevation.
for (let i = 0; i < 10; i++) box('timber-screen', [.08, 3, .16], [-3.8 + i * .28, 1.58, 2.87], mat.wood, 'left');

function plant(x, z, scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.08 * scale, .11 * scale, 2.5 * scale, 7), mat.trunk);
  trunk.position.y = 1.1 * scale; trunk.castShadow = true; g.add(trunk);
  [[0, 2.15, 0], [.25, 2.75, .08], [-.2, 3.25, -.05], [.1, 3.72, 0]].forEach(([lx, ly, lz], i) => {
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry((.55 - i * .045) * scale, 1), mat.leaf);
    crown.position.set(lx * scale, ly * scale, lz * scale); crown.scale.set(.72, 1, .62); crown.castShadow = true; g.add(crown);
  });
  g.position.set(x, -.1, z); house.add(g); pieces.fixed.push(g);
}
plant(5.1, 2.4, .82); plant(-4.9, -1.7, .58);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({ color: 0xded9cf, roughness: 1 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -1.52; ground.receiveShadow = true; scene.add(ground);

const state = { explode: 0, enter: 0, warm: 0, sceneOpacity: 1 };
const pointer = { x: 0, y: 0 };

function ease(t) { return t * t * (3 - 2 * t); }
function updateHouse() {
  const e = ease(state.explode);
  pieces.roof.forEach((m) => m.position.copy(m.userData.base).add(new THREE.Vector3(0, 3.8 * e, 0)));
  pieces.upper.forEach((m) => m.position.copy(m.userData.base).add(new THREE.Vector3(0, 1.95 * e, -.5 * e)));
  pieces.left.forEach((m) => m.position.copy(m.userData.base).add(new THREE.Vector3(-2.1 * e, .25 * e, 0)));
  pieces.right.forEach((m) => m.position.copy(m.userData.base).add(new THREE.Vector3(2.1 * e, .2 * e, 0)));
  pieces.floor.forEach((m) => m.position.copy(m.userData.base).add(new THREE.Vector3(0, -1.05 * e, 0)));
  pieces.glass.forEach((m) => { m.position.copy(m.userData.base).add(new THREE.Vector3(0, 0, 1.45 * e)); m.material.opacity = .43 - state.enter * .35; });
  mat.glow.emissiveIntensity = state.warm * 2.8;
  warmLight.intensity = state.warm * 28;
}

const glowPanels = [];
for (let i = 0; i < 3; i++) glowPanels.push(box('interior-light', [1.55, 1.9, .025], [-1.8 + i * 1.8, 1.62, 2.57], mat.glow, 'fixed', { cast: false }));

function cameraPose() {
  const enter = ease(state.enter);
  const mobileOffset = isMobile ? 3.8 : 0;
  const base = new THREE.Vector3(10.5 + mobileOffset, 5.2 + mobileOffset * .2, 12 + mobileOffset);
  const inside = new THREE.Vector3(3.3, 2.4, 4.4);
  camera.position.lerpVectors(base, inside, enter);
  camera.position.x += pointer.x * (1 - enter) * .42;
  camera.position.y += pointer.y * (1 - enter) * .24;
  const target = new THREE.Vector3(1.1, 1.7, enter ? -1.2 : .2);
  camera.lookAt(target);
}

let raf = 0;
function render() {
  updateHouse();
  house.rotation.y += ((-0.48 + pointer.x * .035) - house.rotation.y) * .035;
  house.rotation.x += ((pointer.y * -.018) - house.rotation.x) * .035;
  cameraPose(); renderer.render(scene, camera); raf = requestAnimationFrame(render);
}
render();

addEventListener('pointermove', (event) => {
  pointer.x = (event.clientX / innerWidth - .5) * 2;
  pointer.y = (event.clientY / innerHeight - .5) * 2;
});
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 800 ? 1.25 : 1.75)); ScrollTrigger.refresh();
});
document.addEventListener('visibilitychange', () => { if (document.hidden) cancelAnimationFrame(raf); else render(); });

if (!reducedMotion) {
  gsap.to('.hero__copy', { opacity: 0, y: -70, ease: 'none', scrollTrigger: { trigger: '.hero', start: '35% top', end: 'bottom 40%', scrub: true } });
  gsap.from('.approach__heading', { opacity: 0, y: 70, scrollTrigger: { trigger: '.approach', start: 'top 65%', end: '45% 50%', scrub: true } });
  gsap.to(state, { explode: 1, ease: 'none', scrollTrigger: { trigger: '.assembly', start: '12% top', end: '78% bottom', scrub: 1.2 } });
  document.querySelectorAll('.principle').forEach((el) => gsap.to(el, { opacity: 1, y: -35, scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 34%', scrub: true, toggleActions: 'play reverse play reverse' } }));
  gsap.to(state, { enter: 1, ease: 'power2.inOut', scrollTrigger: { trigger: '.interior', start: 'top bottom', end: '65% center', scrub: 1.1 } });
  gsap.to(sceneWrap, { opacity: 0, scrollTrigger: { trigger: '#about', start: 'top 85%', end: 'top 30%', scrub: true } });
  gsap.from('.about h2', { xPercent: -12, scrollTrigger: { trigger: '.about', start: 'top bottom', end: '45% 55%', scrub: true } });
  document.querySelectorAll('.project figure').forEach((figure) => {
    const image = figure.querySelector('img');
    gsap.fromTo(figure, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', ease: 'power3.out', scrollTrigger: { trigger: figure, start: 'top 90%', end: 'top 35%', scrub: .8 } });
    gsap.fromTo(image, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: figure, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  gsap.from('.profile__mark', { rotation: -7, scale: .85, opacity: 0, scrollTrigger: { trigger: '.profile', start: 'top 75%', end: '50% 50%', scrub: true } });
  gsap.to('.scene__caption', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.closing', start: 'top 65%', end: 'top 30%', scrub: true } });
  const closing = gsap.timeline({ scrollTrigger: { trigger: '.closing', start: 'top bottom', end: '75% 55%', scrub: 1.1, onEnter: () => { state.explode = 1; state.enter = 0; }, onEnterBack: () => { state.enter = 0; } } });
  closing.to(sceneWrap, { opacity: 1 }, 0).to(state, { explode: 0, warm: 1 }, 0).from('.closing__copy', { opacity: 0, y: 80 }, .3);
} else {
  state.explode = 0; state.enter = 0; sceneWrap.style.opacity = .72;
}

ScrollTrigger.create({ trigger: '.assembly', start: 'top center', end: 'bottom center', onUpdate: (self) => { document.querySelector('.scene__count').textContent = `${String(Math.min(4, 1 + Math.floor(self.progress * 3))).padStart(2,'0')} / 05`; } });
ScrollTrigger.create({ trigger: '.closing', start: 'top center', onEnter: () => document.querySelector('.scene__count').textContent = '05 / 05', onLeaveBack: () => document.querySelector('.scene__count').textContent = '04 / 05' });

const cursor = document.querySelector('.cursor');
if (!isMobile) {
  let cx = 0, cy = 0;
  gsap.ticker.add(() => { gsap.set(cursor, { x: cx, y: cy }); });
  addEventListener('pointermove', (e) => { cx = e.clientX; cy = e.clientY; });
  document.querySelectorAll('[data-cursor="project"]').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-project'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-project'));
  });
}

document.querySelectorAll('img').forEach((img) => img.addEventListener('error', () => img.classList.add('is-fallback')));
const serviceImage = document.querySelector('.services__image');
document.querySelectorAll('.service-list a').forEach((link) => link.addEventListener('mouseenter', () => { serviceImage.style.backgroundImage = `url(${link.dataset.image})`; }));

const loaderValue = document.querySelector('.loader__value');
const loaderLine = document.querySelector('.loader__line i');
const progress = { value: 0 };
gsap.to(progress, { value: 100, duration: reducedMotion ? .2 : 1.15, ease: 'power2.inOut', onUpdate: () => { const value = Math.round(progress.value); loaderValue.textContent = value; loaderLine.style.width = `${value}%`; }, onComplete: () => { document.querySelector('.loader').classList.add('is-hidden'); document.body.classList.add('is-ready'); } });
