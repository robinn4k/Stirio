// ─── Wiki 3D Engine: Three.js renderer, camera, controls, lighting ───
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let renderer = null;
let currentScene = null;
let currentCamera = null;
let controls = null;
let animationId = null;
let currentContainer = null;
let autoRotate = true;
let clock = new THREE.Clock();
let mixers = [];
let activeAnimations = [];

// ─── Initialize renderer ─────────────────────────────────────────────
function initRenderer(container) {
  if (renderer && currentContainer === container) return;
  dispose();

  const rect = container.getBoundingClientRect();
  const w = rect.width || 300;
  const h = rect.height || 300;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  currentContainer = container;
}

// ─── Create scene with standard lighting ──────────────────────────────
function createScene() {
  const scene = new THREE.Scene();

  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  // Key light
  const key = new THREE.DirectionalLight(0xffffff, 1.0);
  key.position.set(5, 8, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);

  // Fill light
  const fill = new THREE.DirectionalLight(0x8888ff, 0.3);
  fill.position.set(-3, 4, -3);
  scene.add(fill);

  // Rim light
  const rim = new THREE.PointLight(0xffaa44, 0.5, 20);
  rim.position.set(0, 6, -5);
  scene.add(rim);

  // Ground plane (subtle reflection)
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(5, 64),
    new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.4,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.receiveShadow = true;
  scene.add(ground);

  return scene;
}

// ─── Create camera + controls ─────────────────────────────────────────
function createCamera(container) {
  const rect = container.getBoundingClientRect();
  const aspect = (rect.width || 300) / (rect.height || 300);
  const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
  camera.position.set(0, 2, 5);
  camera.lookAt(0, 0, 0);
  return camera;
}

function createControls(camera, domElement) {
  const ctrl = new OrbitControls(camera, domElement);
  ctrl.enableDamping = true;
  ctrl.dampingFactor = 0.08;
  ctrl.autoRotate = autoRotate;
  ctrl.autoRotateSpeed = 1.5;
  ctrl.minDistance = 2;
  ctrl.maxDistance = 15;
  ctrl.maxPolarAngle = Math.PI / 1.8;
  ctrl.target.set(0, 0.5, 0);
  return ctrl;
}

// ─── Animation loop ──────────────────────────────────────────────────
function animate() {
  animationId = requestAnimationFrame(animate);
  const delta = clock.getDelta();

  // Update mixers
  mixers.forEach(m => m.update(delta));

  // Update custom animations
  activeAnimations.forEach(fn => fn(delta, clock.getElapsedTime()));

  if (controls) {
    controls.autoRotate = autoRotate;
    controls.update();
  }
  if (renderer && currentScene && currentCamera) {
    renderer.render(currentScene, currentCamera);
  }
}

// ─── Public API ──────────────────────────────────────────────────────

export function mountScene(container, buildFn) {
  dispose();
  initRenderer(container);
  currentScene = createScene();
  currentCamera = createCamera(container);
  controls = createControls(currentCamera, renderer.domElement);
  mixers = [];
  activeAnimations = [];
  clock = new THREE.Clock();

  // Let the build function populate the scene
  buildFn(currentScene, currentCamera, {
    addMixer: m => mixers.push(m),
    addAnimation: fn => activeAnimations.push(fn),
    renderer,
    controls,
    loadGLTF,
  });

  animate();
  handleResize(container);
}

export function dispose() {
  if (animationId) cancelAnimationFrame(animationId);
  animationId = null;
  mixers.forEach(m => m.stopAllAction());
  mixers = [];
  activeAnimations = [];
  if (controls) { controls.dispose(); controls = null; }
  if (currentScene) {
    currentScene.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    });
    currentScene = null;
  }
  if (renderer && currentContainer) {
    currentContainer.innerHTML = '';
  }
  currentCamera = null;
}

export function toggleAutoRotate() {
  autoRotate = !autoRotate;
  return autoRotate;
}

export function resetCamera() {
  if (currentCamera && controls) {
    currentCamera.position.set(0, 2, 5);
    controls.target.set(0, 0.5, 0);
    controls.update();
  }
}

// ─── GLTF Loader ─────────────────────────────────────────────────────
const gltfLoader = new GLTFLoader();

function loadGLTF(url) {
  return new Promise((resolve, reject) => {
    gltfLoader.load(url, resolve, undefined, reject);
  });
}

// ─── Resize handler ──────────────────────────────────────────────────
let resizeObserver = null;

function handleResize(container) {
  if (resizeObserver) resizeObserver.disconnect();
  resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      if (width && height && renderer && currentCamera) {
        renderer.setSize(width, height);
        currentCamera.aspect = width / height;
        currentCamera.updateProjectionMatrix();
      }
    }
  });
  resizeObserver.observe(container);
}

// ─── Material helpers ────────────────────────────────────────────────

export function glassMaterial(color, opacity = 0.4) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    roughness: 0.05,
    metalness: 0.0,
    transmission: 0.9,
    thickness: 0.5,
    ior: 1.5,
    side: THREE.DoubleSide,
  });
}

export function liquidMaterial(color, opacity = 0.85) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    roughness: 0.2,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
}

export function metalMaterial(color = 0xcccccc) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.2,
    metalness: 0.9,
  });
}
