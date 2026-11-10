
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

// BUSINESS EMPIRE SIMULATOR V0.2
// Supermarché 3D à la première personne

const container = document.getElementById("game");
const moneyEl = document.getElementById("money");
const dayEl = document.getElementById("day");
const stockEl = document.getElementById("stock");
const messageEl = document.getElementById("message");

const SAVE_KEY = "business-empire-v02";

const initialState = {
  money: 5000,
  day: 1,
  stock: 30,
  sales: 0
};

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved) return { ...initialState };

    const state = { ...initialState };
    for (const key of Object.keys(initialState)) {
      if (Number.isFinite(saved[key]) && saved[key] >= 0) {
        state[key] = saved[key];
      }
    }
    return state;
  } catch {
    return { ...initialState };
  }
}

const state = loadGame();

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Le jeu continue si le stockage est indisponible.
  }
}

function updateHUD() {
  moneyEl.textContent = Math.round(state.money).toLocaleString("fr-FR") + " €";
  dayEl.textContent = state.day;
  stockEl.textContent = state.stock;
}

let messageTimeout;

function notify(text) {
  messageEl.textContent = text;
  messageEl.classList.add("visible");

  clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    messageEl.classList.remove("visible");
  }, 2600);
}

// INITIALISATION THREE.JS

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9ac7e0);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.set(0, 1.7, 5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

// ÉCLAIRAGE

scene.add(new THREE.HemisphereLight(0xffffff, 0x718096, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(5, 12, 4);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
sunlight.shadow.camera.left = -12;
sunlight.shadow.camera.right = 12;
sunlight.shadow.camera.top = 12;
sunlight.shadow.camera.bottom = -12;
scene.add(sunlight);

// OUTILS DE CONSTRUCTION

const colliders = [];

function box(x, y, z, w, h, d, color, collision = false) {
  const geometry = new THREE.BoxGeometry(w, h, d);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  if (collision) {
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2
    });
  }

  return mesh;
}

// SOL ET PLAFOND

box(0, -0.15, 0, 20, 0.3, 20, 0xb9c1c8);
box(0, 5.1, 0, 20, 0.2, 20, 0xf1f5f9);

// MURS DU MAGASIN

box(-10, 2.5, 0, 0.3, 5, 20, 0xe2e8f0, true);
box(10, 2.5, 0, 0.3, 5, 20, 0xe2e8f0, true);
box(0, 2.5, -10, 20, 5, 0.3, 0xe2e8f0, true);

// Mur avant avec ouverture centrale
box(-6, 2.5, 10, 8, 5, 0.3, 0xe2e8f0, true);
box(6, 2.5, 10, 8, 5, 0.3, 0xe2e8f0, true);
box(0, 4.2, 10, 4, 1.6, 0.3, 0xe2e8f0);

// Tapis d'entrée
box(0, 0.015, 8.5, 3, 0.03, 2, 0x334155);

// ÉCLAIRAGE INTÉRIEUR

for (const x of [-6, 0, 6]) {
  for (const z of [-6, 0, 6]) {
    box(x, 4.94, z, 2.8, 0.05, 0.5, 0xffffff);
  }
}

// RAYONNAGES

const shelves = [];

function createShelf(x, z, category, color) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);

  const metal = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.35,
    roughness: 0.55
  });

  const productMaterial = new THREE.MeshStandardMaterial({
    color
  });

  // Montants
  for (const sx of [-1.15, 1.15]) {
    for (const sz of [-0.4, 0.4]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 2.4, 0.08),
        metal
      );
      post.position.set(sx, 1.2, sz);
      group.add(post);
    }
  }

  // Plateaux et produits
  for (let level = 0; level < 3; level++) {
    const height = 0.45 + level * 0.75;

    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.1, 1),
      metal
    );
    plank.position.y = height;
    group.add(plank);

    for (let i = 0; i < 5; i++) {
      const product = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.4, 0.45),
        productMaterial
      );
      product.position.set(-0.9 + i * 0.45, height + 0.25, 0);
      group.add(product);
    }
  }

  scene.add(group);

  colliders.push({
    minX: x - 1.3,
    maxX: x + 1.3,
    minZ: z - 0.65,
    maxZ: z + 0.65
  });

  shelves.push({ x, z, category });
}

createShelf(-5, -4, "Boissons", 0x38bdf8);
createShelf(0, -4, "Alimentation", 0xfacc15);
createShelf(5, -4, "Hygiène", 0x4ade80);

createShelf(-5, 1, "Boissons", 0x38bdf8);
createShelf(0, 1, "Alimentation", 0xfacc15);
createShelf(5, 1, "Hygiène", 0x4ade80);

// CAISSE

box(6.5, 0.55, 6.5, 3, 1.1, 1.3, 0x475569, true);
box(6.5, 1.13, 6.5, 3.1, 0.12, 1.4, 0x1e293b);

box(7.3, 1.45, 6.5, 0.6, 0.55, 0.2, 0x0f172a);
box(7.3, 1.5, 6.37, 0.48, 0.3, 0x38bdf8);

// PANNEAU DU MAGASIN

function createSign(text, x, y, z) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, 256, 78);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 1.25),
    material
  );

  mesh.position.set(x, y, z);
  scene.add(mesh);
}

createSign("BUSINESS EMPIRE", 0, 3.5, -9.8);

// DÉPLACEMENT PREMIÈRE PERSONNE

let yaw = 0;
let pitch = 0;

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

function bindMovement(id, direction) {
  const button = document.getElementById(id);

  const release = () => {
    keys[direction] = false;
  };

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    keys[direction] = true;
  });

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

bindMovement("forward", "forward");
bindMovement("backward", "backward");
bindMovement("left", "left");
bindMovement("right", "right");

const keyboardMap = {
  KeyW: "forward",
  KeyZ: "forward",
  ArrowUp: "forward",
  KeyS: "backward",
  ArrowDown: "backward",
  KeyA: "left",
  KeyQ: "left",
  ArrowLeft: "left",
  KeyD: "right",
  ArrowRight: "right"
};

document.addEventListener("keydown", event => {
  const direction = keyboardMap[event.code];
  if (direction) {
    keys[direction] = true;
    event.preventDefault();
  }
});

document.addEventListener("keyup", event => {
  const direction = keyboardMap[event.code];
  if (direction) keys[direction] = false;
});

window.addEventListener("blur", () => {
  for (const direction of Object.keys(keys)) {
    keys[direction] = false;
  }
});

// ORIENTATION TACTILE DE LA CAMÉRA

let lookPointer = null;
let lastX = 0;
let lastY = 0;

renderer.domElement.addEventListener("pointerdown", event => {
  if (lookPointer !== null) return;

  lookPointer = event.pointerId;
  lastX = event.clientX;
  lastY = event.clientY;

  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", event => {
  if (event.pointerId !== lookPointer) return;

  const dx = event.clientX - lastX;
  const dy = event.clientY - lastY;

  yaw -= dx * 0.004;
  pitch -= dy * 0.004;

  pitch = THREE.MathUtils.clamp(
    pitch,
    -Math.PI / 2.5,
    Math.PI / 2.5
  );

  lastX = event.clientX;
  lastY = event.clientY;
});

function stopLooking(event) {
  if (event.pointerId === lookPointer) {
    lookPointer = null;
  }
}

renderer.domElement.addEventListener("pointerup", stopLooking);
renderer.domElement.addEventListener("pointercancel", stopLooking);

// COLLISIONS

function isBlocked(x, z) {
  const radius = 0.3;

  if (x < -9.5 || x > 9.5 || z < -9.5 || z > 9.5) {
    return true;
  }

  for (const c of colliders) {
    if (
      x + radius > c.minX &&
      x - radius < c.maxX &&
      z + radius > c.minZ &&
      z - radius < c.maxZ
    ) {
      return true;
    }
  }

  return false;
}

function movePlayer(delta) {
  const forward = Number(keys.forward) - Number(keys.backward);
  const sideways = Number(keys.right) - Number(keys.left);

  if (!forward && !sideways) return;

  const length = Math.hypot(forward, sideways);
  const speed = 3.5 * delta;

  const f = forward / length;
  const s = sideways / length;

  const dx = (-Math.sin(yaw) * f + Math.cos(yaw) * s) * speed;
  const dz = (-Math.cos(yaw) * f - Math.sin(yaw) * s) * speed;

  const nextX = camera.position.x + dx;
  const nextZ = camera.position.z + dz;

  if (!isBlocked(nextX, camera.position.z)) {
    camera.position.x = nextX;
  }

  if (!isBlocked(camera.position.x, nextZ)) {
    camera.position.z = nextZ;
  }
}

// GESTION DES STOCKS

document.getElementById("restock").addEventListener("click", () => {
  const cost = 150;
  const quantity = 20;

  if (state.money < cost) {
    notify("Trésorerie insuffisante !");
    return;
  }

  if (state.stock >= 200) {
    notify("La réserve est pleine !");
    return;
  }

  const purchased = Math.min(quantity, 200 - state.stock);
  const actualCost = purchased * (cost / quantity);

  state.money -= actualCost;
  state.stock += purchased;

  updateHUD();
  saveGame();

  notify("Commande reçue : +" + purchased + " produits");
});

// OUVERTURE DU MAGASIN

document.getElementById("openShop").addEventListener("click", () => {
  if (state.stock <= 0) {
    notify("Impossible : les rayons sont vides !");
    return;
  }

  // Simulation d'une journée commerciale
  const visitors = 8 + Math.floor(Math.random() * 13);
  const sold = Math.min(state.stock, visitors);
  const sellingPrice = 15;
  const revenue = sold * sellingPrice;

  state.stock -= sold;
  state.money += revenue;
  state.sales += sold;
  state.day += 1;

  updateHUD();
  saveGame();

  notify(
    sold + " ventes réalisées : +" + revenue + " €"
  );
});

// REDIMENSIONNEMENT

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// BOUCLE DU JEU

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  movePlayer(delta);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene, camera);
}

// DÉMARRAGE

updateHUD();
animate();

notify("Bienvenue dans Business Empire Simulator !");
