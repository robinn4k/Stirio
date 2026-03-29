// ─── Wiki 3D Scenes: Specific scene builders for each 3D visualization ──
import * as THREE from 'three';
import { glassMaterial, liquidMaterial, metalMaterial } from './wiki-3d.js';

// ═══════════════════════════════════════════════════════════════════════
// GLASS PROFILES — parametric definitions for cocktail glass shapes
// ═══════════════════════════════════════════════════════════════════════

const GLASS_PROFILES = {
  rocks: {
    points: [[0,0],[1.1,0],[1.2,0.1],[1.2,1.6],[1.15,1.6]],
    stemH: 0, footR: 0, scale: 1,
  },
  highball: {
    points: [[0,0],[0.9,0],[0.95,0.1],[1.0,3.0],[0.95,3.0]],
    stemH: 0, footR: 0, scale: 0.8,
  },
  martini: {
    points: [[0,2.6],[1.6,2.6],[0.08,0.8],[0.08,0],[0.6,0],[0.6,0.08],[0.08,0.08]],
    stemH: 0, footR: 0, scale: 0.8, isMartini: true,
  },
  flute: {
    points: [[0,0],[0.6,0],[0.6,0.08],[0.08,0.08],[0.08,1.0],[0.5,3.2],[0.48,3.2]],
    stemH: 0, footR: 0, scale: 0.8,
  },
  hurricane: {
    points: [[0,0],[0.7,0],[0.7,0.08],[0.1,0.08],[0.1,0.8],[0.6,1.2],[1.0,2.0],[1.0,2.8],[0.9,3.2],[0.85,3.2]],
    stemH: 0, footR: 0, scale: 0.7,
  },
  margarita: {
    points: [[0,2.2],[1.8,2.2],[0.1,0.9],[0.1,0],[0.7,0],[0.7,0.08],[0.1,0.08]],
    stemH: 0, footR: 0, scale: 0.7, isMartini: true,
  },
  coupe: {
    points: [[0,0],[0.6,0],[0.6,0.08],[0.08,0.08],[0.08,1.2],[0.3,1.8],[0.8,2.2],[1.1,2.4],[1.05,2.4]],
    stemH: 0, footR: 0, scale: 0.8,
  },
};

// ═══════════════════════════════════════════════════════════════════════
// GLASS BUILDER — creates a glass mesh from profile
// ═══════════════════════════════════════════════════════════════════════

function buildGlass(profile) {
  const def = GLASS_PROFILES[profile] || GLASS_PROFILES.rocks;
  const pts = def.points.map(([x, y]) => new THREE.Vector2(x * def.scale, y * def.scale));
  const geo = new THREE.LatheGeometry(pts, 64);
  const mesh = new THREE.Mesh(geo, glassMaterial(0xffffff, 0.25));
  mesh.castShadow = true;
  return mesh;
}

// ═══════════════════════════════════════════════════════════════════════
// LIQUID LAYERS — creates colored liquid layers inside a glass
// ═══════════════════════════════════════════════════════════════════════

function buildLiquidLayers(profile, colors, layerRatios) {
  const def = GLASS_PROFILES[profile] || GLASS_PROFILES.rocks;
  const s = def.scale;
  const group = new THREE.Group();

  // Determine glass inner dimensions
  let innerR, baseY, topY;
  if (def.isMartini) {
    innerR = 1.4 * s;
    baseY = 0.85 * s;
    topY = 2.5 * s;
  } else {
    const xs = def.points.map(p => p[0]);
    const ys = def.points.map(p => p[1]);
    innerR = Math.max(...xs) * s * 0.85;
    baseY = Math.min(...ys) * s + 0.15 * s;
    topY = Math.max(...ys) * s * 0.85;
  }

  const totalH = topY - baseY;
  let currentY = baseY;

  colors.forEach((color, i) => {
    const ratio = layerRatios[i] || (1 / colors.length);
    const layerH = totalH * ratio;
    const geo = new THREE.CylinderGeometry(
      innerR * 0.9, innerR * 0.85, layerH, 32
    );
    const mesh = new THREE.Mesh(geo, liquidMaterial(color));
    mesh.position.y = currentY + layerH / 2;
    group.add(mesh);
    currentY += layerH;
  });

  return group;
}

// ═══════════════════════════════════════════════════════════════════════
// ICE CUBES
// ═══════════════════════════════════════════════════════════════════════

function buildIceCubes(count, spreadR, baseY) {
  const group = new THREE.Group();
  const iceMat = glassMaterial(0xeeffff, 0.35);
  for (let i = 0; i < count; i++) {
    const size = 0.15 + Math.random() * 0.1;
    const geo = new THREE.BoxGeometry(size, size, size);
    const cube = new THREE.Mesh(geo, iceMat);
    const angle = (i / count) * Math.PI * 2;
    cube.position.set(
      Math.cos(angle) * spreadR * (0.5 + Math.random() * 0.5),
      baseY + Math.random() * 0.3,
      Math.sin(angle) * spreadR * (0.5 + Math.random() * 0.5)
    );
    cube.rotation.set(Math.random(), Math.random(), Math.random());
    group.add(cube);
  }
  return group;
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: COCKTAIL GLASS — glass + liquid layers + ice
// ═══════════════════════════════════════════════════════════════════════

export function buildCocktailScene(scene, camera, ctx, params) {
  const { glass = 'rocks', colors = ['#e74c3c'], layers = [1.0] } = params || {};

  // Glass
  const glassMesh = buildGlass(glass);
  scene.add(glassMesh);

  // Liquid
  const liquid = buildLiquidLayers(glass, colors, layers);
  scene.add(liquid);

  // Ice (for rocks/highball)
  if (['rocks', 'highball'].includes(glass)) {
    const ice = buildIceCubes(4, 0.5, 0.3);
    scene.add(ice);
  }

  // Subtle floating animation
  ctx.addAnimation((delta, t) => {
    glassMesh.position.y = Math.sin(t * 0.8) * 0.03;
    liquid.position.y = glassMesh.position.y;
  });

  camera.position.set(0, 2, 4);
  ctx.controls.target.set(0, 0.8, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TECHNIQUE — SHAKE (animated shaker)
// ═══════════════════════════════════════════════════════════════════════

function buildShaker() {
  const group = new THREE.Group();
  const mat = metalMaterial(0xc0c0c0);

  // Body (bottom)
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.5, 2.0, 32),
    mat
  );
  body.position.y = 1.0;
  group.add(body);

  // Top cap
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.55, 0.8, 32),
    mat
  );
  cap.position.y = 2.4;
  group.add(cap);

  // Strainer cap
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.3, 0.4, 32),
    mat
  );
  top.position.y = 3.0;
  group.add(top);

  return group;
}

export function buildShakeScene(scene, camera, ctx) {
  const shaker = buildShaker();
  scene.add(shaker);

  // Shaking animation
  ctx.addAnimation((delta, t) => {
    const intensity = (Math.sin(t * 3) > 0) ? 1 : 0;
    if (intensity) {
      shaker.rotation.z = Math.sin(t * 12) * 0.3;
      shaker.rotation.x = Math.cos(t * 10) * 0.15;
      shaker.position.y = Math.abs(Math.sin(t * 8)) * 0.2;
    } else {
      shaker.rotation.z *= 0.9;
      shaker.rotation.x *= 0.9;
      shaker.position.y *= 0.9;
    }
  });

  camera.position.set(0, 2.5, 4);
  ctx.controls.target.set(0, 1.5, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TECHNIQUE — STIR (mixing glass + bar spoon)
// ═══════════════════════════════════════════════════════════════════════

export function buildStirScene(scene, camera, ctx) {
  // Mixing glass
  const glass = buildGlass('rocks');
  glass.scale.set(1.3, 1.3, 1.3);
  scene.add(glass);

  // Liquid
  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.9, 0.85, 1.2, 32),
    liquidMaterial('#d35400')
  );
  liquid.position.y = 0.7;
  scene.add(liquid);

  // Bar spoon
  const spoonGroup = new THREE.Group();
  const spoonHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 3.0, 8),
    metalMaterial(0xc0c0c0)
  );
  spoonHandle.position.y = 1.5;
  spoonGroup.add(spoonHandle);

  const spoonBowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    metalMaterial(0xc0c0c0)
  );
  spoonBowl.position.y = 0.0;
  spoonGroup.add(spoonBowl);

  spoonGroup.position.set(0.4, 0, 0);
  scene.add(spoonGroup);

  // Stirring animation
  ctx.addAnimation((delta, t) => {
    const angle = t * 1.5;
    spoonGroup.position.x = Math.cos(angle) * 0.5;
    spoonGroup.position.z = Math.sin(angle) * 0.5;
    spoonGroup.rotation.y = angle;
  });

  camera.position.set(0, 3, 4);
  ctx.controls.target.set(0, 1.0, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TECHNIQUE — MUDDLE
// ═══════════════════════════════════════════════════════════════════════

export function buildMuddleScene(scene, camera, ctx) {
  // Glass
  const glass = buildGlass('rocks');
  glass.scale.set(1.2, 1.2, 1.2);
  scene.add(glass);

  // Ingredients (mint leaves as flat discs)
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(
      new THREE.CircleGeometry(0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0x2ecc71, side: THREE.DoubleSide })
    );
    leaf.position.set(
      (Math.random() - 0.5) * 0.6,
      0.15 + Math.random() * 0.1,
      (Math.random() - 0.5) * 0.6
    );
    leaf.rotation.x = -Math.PI / 2 + (Math.random() - 0.5) * 0.5;
    scene.add(leaf);
  }

  // Muddler
  const muddler = new THREE.Group();
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 2.5, 16),
    new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.8 })
  );
  handle.position.y = 1.5;
  muddler.add(handle);
  scene.add(muddler);

  // Muddling animation
  ctx.addAnimation((delta, t) => {
    const cycle = t * 2;
    const press = Math.max(0, Math.sin(cycle));
    muddler.position.y = -press * 0.3;
    muddler.rotation.z = Math.sin(cycle * 0.5) * 0.05;
  });

  camera.position.set(0, 2.5, 3.5);
  ctx.controls.target.set(0, 0.8, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TECHNIQUE — BUILD
// ═══════════════════════════════════════════════════════════════════════

export function buildBuildScene(scene, camera, ctx) {
  const glass = buildGlass('highball');
  scene.add(glass);

  const layerColors = ['#f39c12', '#ecf0f1', '#3498db'];
  const layerGroup = new THREE.Group();
  scene.add(layerGroup);

  let layerIndex = 0;
  let layerTimer = 0;
  const builtLayers = [];

  ctx.addAnimation((delta, t) => {
    layerTimer += delta;
    if (layerIndex < layerColors.length && layerTimer > 2.0) {
      layerTimer = 0;
      const h = 0.6;
      const geo = new THREE.CylinderGeometry(0.6, 0.58, h, 32);
      const mesh = new THREE.Mesh(geo, liquidMaterial(layerColors[layerIndex]));
      mesh.position.y = 0.3 + layerIndex * h;
      mesh.scale.y = 0;
      layerGroup.add(mesh);
      builtLayers.push({ mesh, targetY: 1.0, currentY: 0 });
      layerIndex++;
    }
    // Animate growing layers
    builtLayers.forEach(l => {
      if (l.currentY < l.targetY) {
        l.currentY = Math.min(l.currentY + delta * 1.5, l.targetY);
        l.mesh.scale.y = l.currentY;
      }
    });
    // Loop
    if (layerIndex >= layerColors.length && layerTimer > 3.0) {
      builtLayers.forEach(l => layerGroup.remove(l.mesh));
      builtLayers.length = 0;
      layerIndex = 0;
      layerTimer = 0;
    }
  });

  camera.position.set(0, 2, 3.5);
  ctx.controls.target.set(0, 1.0, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TECHNIQUE — LAYER
// ═══════════════════════════════════════════════════════════════════════

export function buildLayerScene(scene, camera, ctx) {
  // Shot glass
  const pts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.5, 0),
    new THREE.Vector2(0.55, 0.05),
    new THREE.Vector2(0.6, 1.2),
    new THREE.Vector2(0.57, 1.2),
  ];
  const glassGeo = new THREE.LatheGeometry(pts, 32);
  const glass = new THREE.Mesh(glassGeo, glassMaterial(0xffffff, 0.2));
  scene.add(glass);

  // Pre-built colorful layers
  const colors = ['#8B4513', '#DAA520', '#FFFFF0'];
  colors.forEach((c, i) => {
    const h = 0.35;
    const layer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42 - i * 0.01, 0.4 - i * 0.01, h, 32),
      liquidMaterial(c, 0.9)
    );
    layer.position.y = 0.2 + i * h;
    scene.add(layer);
  });

  // Bar spoon pouring animation
  const spoon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 2.5, 8),
    metalMaterial()
  );
  spoon.position.set(0.3, 1.5, 0);
  spoon.rotation.z = 0.2;
  scene.add(spoon);

  ctx.addAnimation((delta, t) => {
    spoon.rotation.z = 0.2 + Math.sin(t) * 0.05;
  });

  camera.position.set(0, 1.5, 3);
  ctx.controls.target.set(0, 0.6, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TECHNIQUE — STRAIN
// ═══════════════════════════════════════════════════════════════════════

export function buildStrainScene(scene, camera, ctx) {
  // Shaker tilted
  const shaker = buildShaker();
  shaker.rotation.z = 0.8;
  shaker.position.set(-0.5, 2.0, 0);
  scene.add(shaker);

  // Receiving glass
  const glass = buildGlass('martini');
  glass.position.set(0.5, -0.5, 0);
  scene.add(glass);

  // Pouring stream particles
  const streamGeo = new THREE.CylinderGeometry(0.03, 0.02, 1.5, 8);
  const stream = new THREE.Mesh(streamGeo, liquidMaterial('#f5deb3', 0.7));
  stream.position.set(0.1, 0.8, 0);
  stream.rotation.z = 0.3;
  scene.add(stream);

  ctx.addAnimation((delta, t) => {
    stream.material.opacity = 0.4 + Math.sin(t * 3) * 0.3;
    shaker.rotation.z = 0.8 + Math.sin(t * 0.5) * 0.05;
  });

  camera.position.set(0, 2, 4.5);
  ctx.controls.target.set(0, 1.0, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TECHNIQUE — BLEND
// ═══════════════════════════════════════════════════════════════════════

export function buildBlendScene(scene, camera, ctx) {
  // Blender body
  const blenderGroup = new THREE.Group();

  // Base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.8, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  base.position.y = 0.25;
  blenderGroup.add(base);

  // Jar
  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.6, 2.0, 32, 1, true),
    glassMaterial(0xffffff, 0.2)
  );
  jar.position.y = 1.5;
  blenderGroup.add(jar);

  // Liquid inside
  const liquid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.55, 1.2, 32),
    liquidMaterial('#f1c40f', 0.8)
  );
  liquid.position.y = 1.1;
  blenderGroup.add(liquid);

  // Lid
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.55, 0.2, 32),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  );
  lid.position.y = 2.6;
  blenderGroup.add(lid);

  scene.add(blenderGroup);

  // Blending vibration
  ctx.addAnimation((delta, t) => {
    const blending = Math.sin(t * 2) > 0;
    if (blending) {
      blenderGroup.position.x = Math.sin(t * 30) * 0.01;
      blenderGroup.position.z = Math.cos(t * 25) * 0.01;
      liquid.position.y = 1.1 + Math.sin(t * 8) * 0.05;
    }
  });

  camera.position.set(0, 2, 4);
  ctx.controls.target.set(0, 1.2, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TOOL — SHAKER (exploded view)
// ═══════════════════════════════════════════════════════════════════════

export function buildToolShakerScene(scene, camera, ctx) {
  const mat = metalMaterial(0xc0c0c0);

  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.5, 2.0, 32), mat);
  body.position.y = 1.0;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.55, 0.8, 32), mat);
  cap.position.y = 2.4;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.3, 0.4, 32), mat);
  top.position.y = 3.0;

  const parts = [body, cap, top];
  const basePositions = parts.map(p => p.position.y);
  parts.forEach(p => scene.add(p));

  let exploded = false;
  ctx.explode = () => {
    exploded = !exploded;
  };

  ctx.addAnimation((delta, t) => {
    const offsets = exploded ? [0, 1.2, 2.0] : [0, 0, 0];
    parts.forEach((p, i) => {
      const target = basePositions[i] + offsets[i];
      p.position.y += (target - p.position.y) * 0.05;
    });
  });

  camera.position.set(0, 2.5, 5);
  ctx.controls.target.set(0, 1.5, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TOOL — JIGGER
// ═══════════════════════════════════════════════════════════════════════

export function buildToolJiggerScene(scene, camera, ctx) {
  const mat = metalMaterial(0xd4af37);

  // Double cone jigger
  const topCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.2, 32, 1, true),
    mat
  );
  topCone.position.y = 1.2;
  scene.add(topCone);

  const bottomCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 1.0, 32, 1, true),
    mat
  );
  bottomCone.rotation.x = Math.PI;
  bottomCone.position.y = 0.1;
  scene.add(bottomCone);

  // Center band
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.03, 8, 32),
    mat
  );
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.6;
  scene.add(band);

  ctx.addAnimation((delta, t) => {
    topCone.position.y = 1.2 + Math.sin(t * 0.5) * 0.05;
    bottomCone.position.y = 0.1 + Math.sin(t * 0.5) * 0.05;
    band.position.y = 0.6 + Math.sin(t * 0.5) * 0.05;
  });

  camera.position.set(0, 1.5, 3.5);
  ctx.controls.target.set(0, 0.6, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TOOL — STRAINER (Hawthorne)
// ═══════════════════════════════════════════════════════════════════════

export function buildToolStrainerScene(scene, camera, ctx) {
  const mat = metalMaterial(0xc0c0c0);

  // Flat disc with holes
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.05, 32),
    mat
  );
  disc.position.y = 0.5;
  scene.add(disc);

  // Handle
  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8),
    mat
  );
  handle.position.set(0, 0.5, -0.9);
  handle.rotation.x = Math.PI / 2;
  scene.add(handle);

  // Spring coil (torus segments)
  for (let i = 0; i < 20; i++) {
    const coil = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.02, 4, 32, Math.PI / 10),
      mat
    );
    coil.rotation.x = Math.PI / 2;
    coil.rotation.z = (i / 20) * Math.PI * 2;
    coil.position.y = 0.45;
    scene.add(coil);
  }

  camera.position.set(0, 2, 3);
  ctx.controls.target.set(0, 0.5, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TOOL — MUDDLER
// ═══════════════════════════════════════════════════════════════════════

export function buildToolMuddlerScene(scene, camera, ctx) {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.9 });

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 3.0, 16),
    woodMat
  );
  handle.position.y = 1.5;
  scene.add(handle);

  // Textured bottom
  const bottom = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 1 })
  );
  bottom.position.y = 0.1;
  scene.add(bottom);

  ctx.addAnimation((delta, t) => {
    handle.position.y = 1.5 + Math.sin(t * 0.5) * 0.05;
    bottom.position.y = 0.1 + Math.sin(t * 0.5) * 0.05;
  });

  camera.position.set(0, 2, 3.5);
  ctx.controls.target.set(0, 1.0, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: TOOL — BAR SPOON
// ═══════════════════════════════════════════════════════════════════════

export function buildToolBarspoonScene(scene, camera, ctx) {
  const mat = metalMaterial(0xc0c0c0);

  // Twisted handle
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.03, 1, 0),
    new THREE.Vector3(-0.03, 2, 0),
    new THREE.Vector3(0.03, 3, 0),
    new THREE.Vector3(0, 4, 0),
  ]);
  const tubeGeo = new THREE.TubeGeometry(curve, 64, 0.02, 8, false);
  const handle = new THREE.Mesh(tubeGeo, mat);
  scene.add(handle);

  // Spoon bowl
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    mat
  );
  scene.add(bowl);

  // Disc end
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16),
    mat
  );
  disc.position.y = 4;
  scene.add(disc);

  ctx.addAnimation((delta, t) => {
    handle.rotation.y = t * 0.3;
    bowl.rotation.y = t * 0.3;
    disc.rotation.y = t * 0.3;
  });

  camera.position.set(0, 2, 4);
  ctx.controls.target.set(0, 2, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: GLASSWARE — Gallery of glass types
// ═══════════════════════════════════════════════════════════════════════

export function buildGlasswareScene(scene, camera, ctx) {
  const types = ['rocks', 'highball', 'martini', 'flute', 'coupe', 'hurricane'];
  const spacing = 2.0;
  const startX = -(types.length - 1) * spacing / 2;

  types.forEach((type, i) => {
    const glass = buildGlass(type);
    glass.position.x = startX + i * spacing;
    glass.position.y = -0.5;
    scene.add(glass);
  });

  camera.position.set(0, 2, 8);
  ctx.controls.target.set(0, 0.5, 0);
  ctx.controls.minDistance = 4;
  ctx.controls.maxDistance = 20;
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: ALAMBIQUE — Load GLB model
// ═══════════════════════════════════════════════════════════════════════

export async function buildAlambiqueScene(scene, camera, ctx) {
  // Try to load the GLB model
  try {
    const gltf = await ctx.loadGLTF('alambique.glb');
    const model = gltf.scene;
    model.scale.set(1.5, 1.5, 1.5);
    model.position.y = -1;
    scene.add(model);

    if (gltf.animations && gltf.animations.length) {
      const mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach(clip => mixer.clipAction(clip).play());
      ctx.addMixer(mixer);
    }
  } catch (e) {
    // Fallback: simple programmatic alambique
    const mat = metalMaterial(0xb87333); // copper

    // Caldera (pot)
    const pot = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.5),
      mat
    );
    pot.position.y = 0;
    scene.add(pot);

    // Capitel (dome)
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2),
      mat
    );
    dome.position.y = 0.6;
    scene.add(dome);

    // Cuello de cisne (swan neck)
    const neckCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.0, 0),
      new THREE.Vector3(0, 1.5, 0),
      new THREE.Vector3(0.3, 1.8, 0),
      new THREE.Vector3(0.8, 1.7, 0),
      new THREE.Vector3(1.2, 1.3, 0),
      new THREE.Vector3(1.5, 0.8, 0),
    ]);
    const neck = new THREE.Mesh(
      new THREE.TubeGeometry(neckCurve, 32, 0.08, 16, false),
      mat
    );
    scene.add(neck);

    // Condensador (condenser)
    const condenser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 1.5, 32),
      mat
    );
    condenser.position.set(1.5, 0.1, 0);
    scene.add(condenser);

    // Fire base
    const fire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.0, 0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    fire.position.y = -0.8;
    scene.add(fire);

    // Animated fire glow
    const fireLight = new THREE.PointLight(0xff6600, 1, 5);
    fireLight.position.set(0, -0.5, 0);
    scene.add(fireLight);

    ctx.addAnimation((delta, t) => {
      fireLight.intensity = 0.5 + Math.sin(t * 5) * 0.3;
    });
  }

  camera.position.set(0, 1.5, 4.5);
  ctx.controls.target.set(0.5, 0.5, 0);
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE: HERO — Animated cocktail for the wiki hub header
// ═══════════════════════════════════════════════════════════════════════

export function buildHeroScene(scene, camera, ctx) {
  // Rotating cocktail lineup
  const types = ['martini', 'rocks', 'highball'];
  const colors = [['#ecf0f1'], ['#c0392b', '#e74c3c'], ['#2ecc71', '#f1c40f']];
  const ratios = [[1.0], [0.6, 0.4], [0.5, 0.5]];

  types.forEach((type, i) => {
    const angle = (i / types.length) * Math.PI * 2;
    const r = 2.0;
    const glass = buildGlass(type);
    glass.position.set(Math.cos(angle) * r, -0.3, Math.sin(angle) * r);
    scene.add(glass);

    const liquid = buildLiquidLayers(type, colors[i], ratios[i]);
    liquid.position.copy(glass.position);
    scene.add(liquid);
  });

  camera.position.set(0, 3, 5);
  ctx.controls.target.set(0, 0.5, 0);
  ctx.controls.enableZoom = false;
  ctx.controls.enablePan = false;
}

// ═══════════════════════════════════════════════════════════════════════
// SCENE REGISTRY — Maps scene IDs to builder functions
// ═══════════════════════════════════════════════════════════════════════

export const SCENE_BUILDERS = {
  'cocktail-glass': buildCocktailScene,
  'technique-shake': buildShakeScene,
  'technique-stir': buildStirScene,
  'technique-muddle': buildMuddleScene,
  'technique-build': buildBuildScene,
  'technique-layer': buildLayerScene,
  'technique-strain': buildStrainScene,
  'technique-blend': buildBlendScene,
  'tool-shaker': buildToolShakerScene,
  'tool-jigger': buildToolJiggerScene,
  'tool-strainer': buildToolStrainerScene,
  'tool-muddler': buildToolMuddlerScene,
  'tool-barspoon': buildToolBarspoonScene,
  'glassware': buildGlasswareScene,
  'alambique': buildAlambiqueScene,
  'hero': buildHeroScene,
};
