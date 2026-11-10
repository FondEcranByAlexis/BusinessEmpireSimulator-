
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

// BUSINESS EMPIRE SIMULATOR V0.3.1
// Correction caméra, entrée, clients et collisions

const $ = id => document.getElementById(id);
const SAVE_KEY = "business-empire-v02";

const defaults = {
  money: 5000,
  day: 1,
  stock: 30,
  sales: 0
};

function loadGame() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    const result = { ...defaults };

    if (saved) {
      for (const key of Object.keys(defaults)) {
        if (Number.isFinite(saved[key]) && saved[key] >= 0) {
          result[key] = saved[key];
        }
      }
    }
    return result;
  } catch {
    return { ...defaults };
  }
}

const state = loadGame();

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {}
}

function updateHUD() {
  $("money").textContent =
    Math.round(state.money).toLocaleString("fr-FR") + " €";
  $("day").textContent = state.day;
  $("stock").textContent = state.stock;
}

let messageTimer;

function notify(text) {
  const el = $("message");
  el.textContent = text;
  el.classList.add("visible");

  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    el.classList.remove("visible");
  }, 2500);
}

// SCÈNE 3D

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc9e8);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.05,
  100
);

camera.position.set(0, 1.7, 7.5);
camera.rotation.order = "YXZ";

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio || 1, 1.25)
);

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;

$("game").appendChild(renderer.domElement);

scene.add(
  new THREE.HemisphereLight(0xffffff, 0x718096, 2.2)
);

const sunlight = new THREE.DirectionalLight(
  0xffffff,
  1.4
);

sunlight.position.set(5, 12, 4);
scene.add(sunlight);

// MATÉRIAUX ET COLLISIONS

const colliders = [];

function makeBox(
  x, y, z, w, h, d, color, solid = false
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.8
    })
  );

  mesh.position.set(x, y, z);
  scene.add(mesh);

  if (solid) {
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2
    });
  }

  return mesh;
}

// BÂTIMENT

makeBox(0, -0.15, 0, 20, 0.3, 20, 0xb9c1c8);
makeBox(0, 5.1, 0, 20, 0.2, 20, 0xf1f5f9);

// Murs latéraux et arrière
makeBox(-10, 2.5, 0, 0.3, 5, 20, 0xe2e8f0, true);
makeBox(10, 2.5, 0, 0.3, 5, 20, 0xe2e8f0, true);
makeBox(0, 2.5, -10, 20, 5, 0.3, 0xe2e8f0, true);

// Entrée : ouverture de 4 mètres
makeBox(-6, 2.5, 10, 8, 5, 0.3, 0xe2e8f0, true);
makeBox(6, 2.5, 10, 8, 5, 0.3, 0xe2e8f0, true);

// Linteau au-dessus de la porte
makeBox(0, 4.2, 10, 4, 1.6, 0.3, 0xe2e8f0);

// Sol extérieur devant l'entrée
makeBox(0, -0.17, 12, 8, 0.3, 5, 0x94a3b8);

// Tapis d'entrée
makeBox(0, 0.015, 8.5, 3, 0.03, 2, 0x334155);

// Luminaires
for (const x of [-6, 0, 6]) {
  for (const z of [-6, 0, 6]) {
    makeBox(
      x, 4.94, z,
      2.8, 0.05, 0.5,
      0xffffff
    );
  }
}

// RAYONNAGES

const shelfPositions = [
  { x: -5, z: -4, color: 0x38bdf8 },
  { x: 0, z: -4, color: 0xfacc15 },
  { x: 5, z: -4, color: 0x4ade80 },
  { x: -5, z: 1, color: 0x38bdf8 },
  { x: 0, z: 1, color: 0xfacc15 },
  { x: 5, z: 1, color: 0x4ade80 }
];

function createShelf(data) {
  const group = new THREE.Group();
  group.position.set(data.x, 0, data.z);

  const metal = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.3,
    roughness: 0.6
  });

  const productMat = new THREE.MeshStandardMaterial({
    color: data.color
  });

  for (const x of [-1.15, 1.15]) {
    for (const z of [-0.4, 0.4]) {
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 2.4, 0.08),
        metal
      );
      post.position.set(x, 1.2, z);
      group.add(post);
    }
  }

  for (let level = 0; level < 3; level++) {
    const y = 0.45 + level * 0.75;

    const plank = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.1, 1),
      metal
    );

    plank.position.y = y;
    group.add(plank);

    for (let i = 0; i < 5; i++) {
      const product = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.4, 0.45),
        productMat
      );

      product.position.set(
        -0.9 + i * 0.45,
        y + 0.25,
        0
      );

      group.add(product);
    }
  }

  scene.add(group);

  colliders.push({
    minX: data.x - 1.3,
    maxX: data.x + 1.3,
    minZ: data.z - 0.65,
    maxZ: data.z + 0.65
  });
}

shelfPositions.forEach(createShelf);

// CAISSE

makeBox(
  6.5, 0.55, 6.5,
  3, 1.1, 1.3,
  0x475569, true
);

makeBox(
  6.5, 1.13, 6.5,
  3.1, 0.12, 1.4,
  0x1e293b
);

makeBox(
  7.3, 1.45, 6.5,
  0.6, 0.55, 0.2,
  0x0f172a
);

makeBox(
  7.3, 1.5, 6.37,
  0.48, 0.3, 0.05,
  0x38bdf8
);

// PANNEAU

const signCanvas = document.createElement("canvas");
signCanvas.width = 512;
signCanvas.height = 128;

const ctx = signCanvas.getContext("2d");
ctx.fillStyle = "#0f172a";
ctx.fillRect(0, 0, 512, 128);
ctx.fillStyle = "#38bdf8";
ctx.font = "bold 34px Arial";
ctx.textAlign = "center";
ctx.fillText("BUSINESS EMPIRE", 256, 78);

const sign = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 1.25),
  new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(signCanvas),
    side: THREE.DoubleSide
  })
);

sign.position.set(0, 3.5, -9.8);
scene.add(sign);

// CAMÉRA FLUIDIFIÉE

let yaw = 0;
let pitch = 0;
let targetYaw = 0;
let targetPitch = 0;

const LOOK_SENSITIVITY = 0.0025;
const MAX_TOUCH_DELTA = 65;
const CAMERA_SMOOTHING = 14;

let lookPointer = null;
let lastX = 0;
let lastY = 0;

const canvas = renderer.domElement;

canvas.style.touchAction = "none";

canvas.addEventListener("pointerdown", event => {
  if (lookPointer !== null) return;

  lookPointer = event.pointerId;
  lastX = event.clientX;
  lastY = event.clientY;

  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", event => {
  if (event.pointerId !== lookPointer) return;

  let dx = event.clientX - lastX;
  let dy = event.clientY - lastY;

  lastX = event.clientX;
  lastY = event.clientY;

  // Évite les très grands sauts tactiles
  dx = THREE.MathUtils.clamp(
    dx, -MAX_TOUCH_DELTA, MAX_TOUCH_DELTA
  );

  dy = THREE.MathUtils.clamp(
    dy, -MAX_TOUCH_DELTA, MAX_TOUCH_DELTA
  );

  targetYaw -= dx * LOOK_SENSITIVITY;
  targetPitch -= dy * LOOK_SENSITIVITY;

  targetPitch = THREE.MathUtils.clamp(
    targetPitch,
    -1.15,
    1.15
  );
});

function stopLooking(event) {
  if (event.pointerId === lookPointer) {
    lookPointer = null;
  }
}

canvas.addEventListener("pointerup", stopLooking);
canvas.addEventListener("pointercancel", stopLooking);
canvas.addEventListener("lostpointercapture", stopLooking);

// COMMANDES DE DÉPLACEMENT

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

const movementButtons = [
  ["forward", "forward"],
  ["backward", "backward"],
  ["left", "left"],
  ["right", "right"]
];

for (const [id, direction] of movementButtons) {
  const button = $(id);

  button.addEventListener("pointerdown", event => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    keys[direction] = true;
  });

  const release = () => {
    keys[direction] = false;
  };

  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

const keyMap = {
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
  const direction = keyMap[event.code];

  if (direction) {
    keys[direction] = true;
    event.preventDefault();
  }
});

document.addEventListener("keyup", event => {
  const direction = keyMap[event.code];
  if (direction) keys[direction] = false;
});

window.addEventListener("blur", () => {
  for (const key of Object.keys(keys)) {
    keys[key] = false;
  }
  lookPointer = null;
});

// COLLISIONS AMÉLIORÉES

const PLAYER_RADIUS = 0.4;

function isBlocked(x, z, radius = PLAYER_RADIUS) {
  // Limites du terrain, y compris l'extérieur
  if (
    x < -9.45 + radius ||
    x > 9.45 - radius ||
    z < -9.45 + radius ||
    z > 13.8 - radius
  ) {
    return true;
  }

  // Les murs définissent eux-mêmes l'ouverture.
  // Il n'y a plus de barrière invisible à z = 9.5.
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

function movePlayer(dt) {
  const forward =
    Number(keys.forward) - Number(keys.backward);

  const sideways =
    Number(keys.right) - Number(keys.left);

  if (!forward && !sideways) return;

  const length = Math.hypot(forward, sideways);
  const speed = 3.3 * dt;

  const f = forward / length;
  const s = sideways / length;

  const dx = (
    -Math.sin(yaw) * f +
    Math.cos(yaw) * s
  ) * speed;

  const dz = (
    -Math.cos(yaw) * f -
    Math.sin(yaw) * s
  ) * speed;

  const newX = camera.position.x + dx;
  const newZ = camera.position.z + dz;

  if (!isBlocked(newX, camera.position.z)) {
    camera.position.x = newX;
  }

  if (!isBlocked(camera.position.x, newZ)) {
    camera.position.z = newZ;
  }
}

// CLIENTS AUTONOMES

const customers = [];
const checkoutQueue = [];
const MAX_CUSTOMERS = 5;

let checkoutCustomer = null;

function createCustomer() {
  const group = new THREE.Group();

  const colors = [
    0xef4444,
    0x2563eb,
    0x16a34a,
    0xf59e0b,
    0x9333ea
  ];

  const shirtColor =
    colors[Math.floor(Math.random() * colors.length)];

  const skin = new THREE.MeshStandardMaterial({
    color: 0xd6a17c
  });

  const shirt = new THREE.MeshStandardMaterial({
    color: shirtColor
  });

  const trousers = new THREE.MeshStandardMaterial({
    color: 0x334155
  });

  function part(w, h, d, mat, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      mat
    );

    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  }

  part(0.5, 0.7, 0.3, shirt, 0, 1.25, 0);
  part(0.32, 0.32, 0.32, skin, 0, 1.78, 0);

  const leftLeg = part(
    0.18, 0.65, 0.2,
    trousers, -0.14, 0.48, 0
  );

  const rightLeg = part(
    0.18, 0.65, 0.2,
    trousers, 0.14, 0.48, 0
  );

  part(0.14, 0.65, 0.2, shirt, -0.34, 1.23, 0);
  part(0.14, 0.65, 0.2, shirt, 0.34, 1.23, 0);

  const basketMaterial = new THREE.MeshStandardMaterial({
    color: 0x64748b
  });

  part(
    0.5, 0.28, 0.35,
    basketMaterial, 0.45, 0.8, -0.15
  );

  group.position.set(0, 0, 12.5);
  scene.add(group);

  const aisleIndex = Math.floor(Math.random() * 3);
  const aisleX = [-7.5, -2.5, 2.5][aisleIndex];

  // Chemin qui contourne les rayons.
  const route = [
    { x: 0, z: 8 },
    { x: aisleX, z: 8 },
    { x: aisleX, z: 3.2 },
    { x: aisleX, z: -1.5, shop: true },
    { x: aisleX, z: -6.5, shop: true },
    { x: 8.3, z: -6.5 },
    { x: 8.3, z: 4.5 },
    { x: 5.2, z: 4.5 }
  ];

  customers.push({
    group,
    route,
    waypoint: 0,
    phase: "shopping",
    timer: 0,
    items: 0,
    speed: 1.2 + Math.random() * 0.35,
    leftLeg,
    rightLeg,
    walkTime: 0
  });
}

function stopWalking(customer) {
  customer.leftLeg.rotation.x = 0;
  customer.rightLeg.rotation.x = 0;
}

function walkTo(customer, target, dt) {
  const p = customer.group.position;
  const dx = target.x - p.x;
  const dz = target.z - p.z;
  const distance = Math.hypot(dx, dz);

  if (distance < 0.05) {
    stopWalking(customer);
    return true;
  }

  const step = Math.min(customer.speed * dt, distance);

  p.x += dx / distance * step;
  p.z += dz / distance * step;

  customer.group.rotation.y = Math.atan2(-dx, -dz);

  customer.walkTime += dt * 9;

  customer.leftLeg.rotation.x =
    Math.sin(customer.walkTime) * 0.4;

  customer.rightLeg.rotation.x =
    -Math.sin(customer.walkTime) * 0.4;

  return step >= distance;
}

function reservedItems() {
  return customers.reduce(
    (sum, customer) => sum + customer.items,
    0
  );
}

function removeCustomer(customer) {
  scene.remove(customer.group);

  customer.group.traverse(object => {
    if (object.geometry) object.geometry.dispose();
  });

  const index = customers.indexOf(customer);
  if (index !== -1) customers.splice(index, 1);
}

function updateCustomers(dt) {
  for (const customer of [...customers]) {
    if (customer.phase === "shopping") {
      const target = customer.route[customer.waypoint];

      if (walkTo(customer, target, dt)) {
        customer.waypoint++;

        if (target.shop) {
          customer.phase = "choosing";
          customer.timer = 1.5 + Math.random() * 1.5;
        } else if (customer.waypoint >= customer.route.length) {
          customer.phase = "queue";
          checkoutQueue.push(customer);
        }
      }
    }

    else if (customer.phase === "choosing") {
      customer.timer -= dt;

      if (customer.timer <= 0) {
        const available = Math.max(
          0,
          state.stock - reservedItems()
        );

        if (available > 0) customer.items++;

        if (customer.waypoint >= customer.route.length) {
          customer.phase = "queue";
          checkoutQueue.push(customer);
        } else {
          customer.phase = "shopping";
        }
      }
    }

    else if (customer.phase === "queue") {
      const index = checkoutQueue.indexOf(customer);

      if (index === 0 && !checkoutCustomer) {
        checkoutQueue.shift();
        checkoutCustomer = customer;
        customer.phase = "checkout";
        customer.timer = 3;
      } else {
        // File le long de l'allée devant la caisse
        const queueIndex = Math.max(0, index);
        walkTo(customer, {
          x: 5.2 - queueIndex * 0.9,
          z: 4.5
        }, dt);
      }
    }

    else if (customer.phase === "checkout") {
      const arrived = walkTo(
        customer,
        { x: 5.2, z: 4.5 },
        dt
      );

      if (!arrived) continue;

      customer.timer -= dt;

      if (customer.timer <= 0) {
        const sold = Math.min(
          customer.items,
          state.stock
        );

        const revenue = sold * 15;

        state.stock -= sold;
        state.money += revenue;
        state.sales += sold;

        updateHUD();
        saveGame();

        notify(
          sold > 0
            ? "Client encaissé : +" + revenue + " €"
            : "Client reparti sans achat"
        );

        checkoutCustomer = null;
        customer.phase = "leaving";
        customer.route = [
          { x: 5.2, z: 8 },
          { x: 0, z: 8 },
          { x: 0, z: 12.5 }
        ];
        customer.waypoint = 0;
      }
    }

    else if (customer.phase === "leaving") {
      const target = customer.route[customer.waypoint];

      if (walkTo(customer, target, dt)) {
        customer.waypoint++;

        if (customer.waypoint >= customer.route.length) {
          removeCustomer(customer);
        }
      }
    }
  }
}

// GESTION DU MAGASIN

let shopOpen = false;
let spawnTimer = 0;
let businessTimer = 0;

const DAY_DURATION = 180;
const openButton = $("openShop");

function updateShopButton() {
  openButton.textContent = shopOpen
    ? "Fermer le magasin"
    : "Ouvrir le magasin";
}

$("restock").addEventListener("click", () => {
  const quantity = Math.min(
    20,
    Math.max(0, 200 - state.stock)
  );

  const cost = quantity * 7.5;

  if (quantity <= 0) {
    notify("Réserve pleine !");
    return;
  }

  if (state.money < cost) {
    notify("Trésorerie insuffisante !");
    return;
  }

  state.money -= cost;
  state.stock += quantity;

  updateHUD();
  saveGame();

  notify("Livraison : +" + quantity + " produits");
});

openButton.addEventListener("click", () => {
  shopOpen = !shopOpen;
  updateShopButton();

  if (shopOpen) {
    spawnTimer = 1;
    notify("Le magasin est ouvert !");
  } else {
    notify("Magasin fermé aux nouveaux clients");
  }
});

function updateBusiness(dt) {
  if (!shopOpen) return;

  businessTimer += dt;
  spawnTimer -= dt;

  if (
    spawnTimer <= 0 &&
    customers.length < MAX_CUSTOMERS
  ) {
    createCustomer();
    spawnTimer = 7 + Math.random() * 5;
  }

  if (businessTimer >= DAY_DURATION) {
    businessTimer -= DAY_DURATION;
    state.day++;

    updateHUD();
    saveGame();

    notify("Jour " + state.day);
  }
}

// REDIMENSIONNEMENT

window.addEventListener("resize", () => {
  camera.aspect =
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});

// BOUCLE PRINCIPALE

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  // Lissage indépendant de la fréquence d'affichage
  const smooth = 1 - Math.exp(
    -CAMERA_SMOOTHING * dt
  );

  yaw += (targetYaw - yaw) * smooth;
  pitch += (targetPitch - pitch) * smooth;

  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  movePlayer(dt);
  updateBusiness(dt);
  updateCustomers(dt);

  renderer.render(scene, camera);
}

// DÉMARRAGE

updateHUD();
updateShopButton();
animate();

notify("Business Empire V0.3.1 prêt !");
      
