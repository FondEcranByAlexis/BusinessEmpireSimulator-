
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";

// BUSINESS EMPIRE SIMULATOR V0.3
// Clients autonomes, caisse et économie événementielle

const $ = id => document.getElementById(id);
const SAVE_KEY = "business-empire-v02";

const defaults = {
  money: 5000,
  day: 1,
  stock: 30,
  sales: 0
};

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(SAVE_KEY));
    const result = { ...defaults };
    if (data) {
      for (const key of Object.keys(defaults)) {
        if (Number.isFinite(data[key]) && data[key] >= 0) {
          result[key] = data[key];
        }
      }
    }
    return result;
  } catch {
    return { ...defaults };
  }
}

const state = load();

function save() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {}
}

function hud() {
  $("money").textContent =
    Math.round(state.money).toLocaleString("fr-FR") + " €";
  $("day").textContent = state.day;
  $("stock").textContent = state.stock;
}

let noticeTimer;

function notify(message) {
  const el = $("message");
  el.textContent = message;
  el.classList.add("visible");
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(
    () => el.classList.remove("visible"), 2800
  );
}

// SCÈNE 3D

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc9e8);

const camera = new THREE.PerspectiveCamera(
  75, innerWidth / innerHeight, 0.1, 120
);
camera.position.set(0, 1.7, 6.5);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$("game").appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff, 0x718096, 2));

const sun = new THREE.DirectionalLight(0xffffff, 1.8);
sun.position.set(4, 11, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -12;
scene.add(sun);

const colliders = [];

function cube(x, y, z, w, h, d, color, solid = false) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({
      color, roughness: 0.8
    })
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
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

cube(0, -0.15, 0, 20, 0.3, 20, 0xb9c1c8);
cube(0, 5.1, 0, 20, 0.2, 20, 0xf1f5f9);

cube(-10, 2.5, 0, 0.3, 5, 20, 0xe2e8f0, true);
cube(10, 2.5, 0, 0.3, 5, 20, 0xe2e8f0, true);
cube(0, 2.5, -10, 20, 5, 0.3, 0xe2e8f0, true);
cube(-6, 2.5, 10, 8, 5, 0.3, 0xe2e8f0, true);
cube(6, 2.5, 10, 8, 5, 0.3, 0xe2e8f0, true);
cube(0, 4.2, 10, 4, 1.6, 0.3, 0xe2e8f0);

cube(0, 0.015, 8.5, 3, 0.03, 2, 0x334155);

for (const x of [-6, 0, 6]) {
  for (const z of [-6, 0, 6]) {
    cube(x, 4.94, z, 2.8, 0.05, 0.5, 0xffffff);
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

function shelf(data) {
  const group = new THREE.Group();
  group.position.set(data.x, 0, data.z);

  const metal = new THREE.MeshStandardMaterial({
    color: 0x64748b, metalness: 0.35
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
      product.position.set(-0.9 + i * 0.45, y + 0.25, 0);
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

shelfPositions.forEach(shelf);

// CAISSE

cube(6.5, 0.55, 6.5, 3, 1.1, 1.3, 0x475569, true);
cube(6.5, 1.13, 6.5, 3.1, 0.12, 1.4, 0x1e293b);
cube(7.3, 1.45, 6.5, 0.6, 0.55, 0.2, 0x0f172a);
cube(7.3, 1.5, 6.37, 0.48, 0.3, 0x38bdf8);

// PANNEAU

const canvas = document.createElement("canvas");
canvas.width = 512;
canvas.height = 128;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#0f172a";
ctx.fillRect(0, 0, 512, 128);
ctx.fillStyle = "#38bdf8";
ctx.font = "bold 34px Arial";
ctx.textAlign = "center";
ctx.fillText("BUSINESS EMPIRE", 256, 78);

const sign = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 1.25),
  new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(canvas),
    side: THREE.DoubleSide
  })
);
sign.position.set(0, 3.5, -9.8);
scene.add(sign);

// COMMANDES DU JOUEUR

let yaw = 0;
let pitch = 0;

const keys = {
  forward: false,
  backward: false,
  left: false,
  right: false
};

for (const [id, direction] of [
  ["forward", "forward"],
  ["backward", "backward"],
  ["left", "left"],
  ["right", "right"]
]) {
  const button = $(id);

  button.addEventListener("pointerdown", e => {
    e.preventDefault();
    button.setPointerCapture(e.pointerId);
    keys[direction] = true;
  });

  const release = () => keys[direction] = false;
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

const keyMap = {
  KeyW: "forward", KeyZ: "forward",
  ArrowUp: "forward",
  KeyS: "backward", ArrowDown: "backward",
  KeyA: "left", KeyQ: "left",
  ArrowLeft: "left",
  KeyD: "right", ArrowRight: "right"
};

document.addEventListener("keydown", e => {
  if (keyMap[e.code]) {
    keys[keyMap[e.code]] = true;
    e.preventDefault();
  }
});

document.addEventListener("keyup", e => {
  if (keyMap[e.code]) keys[keyMap[e.code]] = false;
});

window.addEventListener("blur", () => {
  Object.keys(keys).forEach(k => keys[k] = false);
});

let lookPointer = null;
let lastX = 0;
let lastY = 0;

renderer.domElement.addEventListener("pointerdown", e => {
  if (lookPointer !== null) return;
  lookPointer = e.pointerId;
  lastX = e.clientX;
  lastY = e.clientY;
  renderer.domElement.setPointerCapture(e.pointerId);
});

renderer.domElement.addEventListener("pointermove", e => {
  if (e.pointerId !== lookPointer) return;

  yaw -= (e.clientX - lastX) * 0.004;
  pitch -= (e.clientY - lastY) * 0.004;
  pitch = THREE.MathUtils.clamp(pitch, -1.2, 1.2);

  lastX = e.clientX;
  lastY = e.clientY;
});

function stopLook(e) {
  if (e.pointerId === lookPointer) lookPointer = null;
}

renderer.domElement.addEventListener("pointerup", stopLook);
renderer.domElement.addEventListener("pointercancel", stopLook);

// COLLISIONS

function blocked(x, z, radius = 0.3) {
  if (x < -9.5 || x > 9.5 || z < -9.5 || z > 9.5) {
    return true;
  }

  return colliders.some(c =>
    x + radius > c.minX &&
    x - radius < c.maxX &&
    z + radius > c.minZ &&
    z - radius < c.maxZ
  );
}

function movePlayer(dt) {
  const f = Number(keys.forward) - Number(keys.backward);
  const s = Number(keys.right) - Number(keys.left);

  if (!f && !s) return;

  const length = Math.hypot(f, s);
  const speed = 3.5 * dt;

  const dx = (-Math.sin(yaw) * f + Math.cos(yaw) * s)
    / length * speed;
  const dz = (-Math.cos(yaw) * f - Math.sin(yaw) * s)
    / length * speed;

  const x = camera.position.x + dx;
  const z = camera.position.z + dz;

  if (!blocked(x, camera.position.z)) camera.position.x = x;
  if (!blocked(camera.position.x, z)) camera.position.z = z;
}

// CLIENTS 3D

const customers = [];
const maxCustomers = 5;

function createCustomer() {
  const group = new THREE.Group();

  const colors = [
    0xef4444, 0x2563eb, 0x16a34a,
    0xf59e0b, 0x9333ea
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
      new THREE.BoxGeometry(w, h, d), mat
    );
    mesh.position.set(x, y, z);
    group.add(mesh);
    return mesh;
  }

  part(0.5, 0.7, 0.3, shirt, 0, 1.25, 0);
  part(0.32, 0.32, 0.32, skin, 0, 1.78, 0);

  const leftLeg = part(
    0.18, 0.65, 0.2, trousers, -0.14, 0.48, 0
  );
  const rightLeg = part(
    0.18, 0.65, 0.2, trousers, 0.14, 0.48, 0
  );

  part(0.14, 0.65, 0.2, shirt, -0.34, 1.23, 0);
  part(0.14, 0.65, 0.2, shirt, 0.34, 1.23, 0);

  // Panier
  part(0.5, 0.28, 0.35,
    new THREE.MeshStandardMaterial({ color: 0x64748b }),
    0.45, 0.8, -0.15
  );

  group.position.set(0, 0, 8.8);
  scene.add(group);

  const aisle = Math.floor(Math.random() * 3);
  const aisleX = [-7.5, -2.5, 2.5][aisle];

  const route = [
    { x: 0, z: 6 },
    { x: aisleX, z: 6 },
    { x: aisleX, z: 3 },
    { x: aisleX, z: -1.5 },
    { x: aisleX, z: -6.5 },
    { x: 8.4, z: -6.5 },
    { x: 8.4, z: 4.6 },
    { x: 5.2, z: 4.6 }
  ];

  const customer = {
    group,
    route,
    waypoint: 0,
    phase: "shopping",
    timer: 0,
    items: 0,
    speed: 1.2 + Math.random() * 0.4,
    leftLeg,
    rightLeg,
    walkingTime: 0
  };

  customers.push(customer);
}

function walkTo(customer, target, dt) {
  const p = customer.group.position;
  const dx = target.x - p.x;
  const dz = target.z - p.z;
  const distance = Math.hypot(dx, dz);

  if (distance < 0.08) return true;

  const step = Math.min(customer.speed * dt, distance);

  p.x += dx / distance * step;
  p.z += dz / distance * step;

  customer.group.rotation.y = Math.atan2(-dx, -dz);

  customer.walkingTime += dt * 9;
  customer.leftLeg.rotation.x =
    Math.sin(customer.walkingTime) * 0.45;
  customer.rightLeg.rotation.x =
    -Math.sin(customer.walkingTime) * 0.45;

  return false;
}

function stopWalking(customer) {
  customer.leftLeg.rotation.x = 0;
  customer.rightLeg.rotation.x = 0;
}

let checkoutCustomer = null;
const checkoutQueue = [];

function updateCustomers(dt) {
  for (const customer of [...customers]) {

    if (customer.phase === "shopping") {
      const target = customer.route[customer.waypoint];

      if (walkTo(customer, target, dt)) {
        customer.waypoint++;

        // Pause au rayon pour sélectionner des produits
        if ([3, 4].includes(customer.waypoint)) {
          customer.phase = "choosing";
          customer.timer = 1.5 + Math.random() * 2;
          stopWalking(customer);
        }

        if (customer.waypoint >= customer.route.length) {
          customer.phase = "queue";
          checkoutQueue.push(customer);
        }
      }
    }

    else if (customer.phase === "choosing") {
      customer.timer -= dt;

      if (customer.timer <= 0) {
        const available = Math.max(
          0, state.stock - reservedItems()
        );

        if (available > 0) {
          customer.items++;
        }

        customer.phase = "shopping";
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
        const position = Math.max(0, index);
        walkTo(customer, {
          x: 5.2 - position * 0.9,
          z: 4.6
        }, dt);
      }
    }

    else if (customer.phase === "checkout") {
      if (!walkTo(customer, { x: 5.2, z: 4.6 }, dt)) {
        continue;
      }

      stopWalking(customer);
      customer.timer -= dt;

      if (customer.timer <= 0) {
        const sold = Math.min(customer.items, state.stock);
        const revenue = sold * 15;

        state.stock -= sold;
        state.money += revenue;
        state.sales += sold;

        hud();
        save();

        notify(
          sold > 0
            ? "Client encaissé : +" + revenue + " €"
            : "Un client repart sans achat"
        );

        checkoutCustomer = null;
        customer.phase = "leaving";
      }
    }

    else if (customer.phase === "leaving") {
      if (walkTo(customer, { x: 0, z: 6 }, dt)) {
        customer.phase = "exit";
      }
    }

    else if (customer.phase === "exit") {
      if (walkTo(customer, { x: 0, z: 9.6 }, dt)) {
        scene.remove(customer.group);
        const index = customers.indexOf(customer);
        if (index !== -1) customers.splice(index, 1);
      }
    }
  }
}

function reservedItems() {
  return customers.reduce(
    (total, c) => total + c.items, 0
  );
}

// GESTION COMMERCIALE

let shopOpen = false;
let spawnTimer = 0;
let businessTimer = 0;
const businessDayDuration = 180;

const openButton = $("openShop");

function updateShopButton() {
  openButton.textContent = shopOpen
    ? "Fermer le magasin"
    : "Ouvrir le magasin";
}

$("restock").addEventListener("click", () => {
  const quantity = Math.min(20, 200 - state.stock);
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
  hud();
  save();

  notify("Livraison reçue : +" + quantity + " produits");
});

openButton.addEventListener("click", () => {
  shopOpen = !shopOpen;
  updateShopButton();

  if (shopOpen) {
    spawnTimer = 1;
    notify("Le magasin est ouvert !");
  } else {
    notify("Magasin fermé : plus de nouveaux clients");
  }
});

function updateBusiness(dt) {
  if (!shopOpen) return;

  businessTimer += dt;
  spawnTimer -= dt;

  if (
    spawnTimer <= 0 &&
    customers.length < maxCustomers
  ) {
    createCustomer();
    spawnTimer = 7 + Math.random() * 5;
  }

  if (businessTimer >= businessDayDuration) {
    businessTimer -= businessDayDuration;
    state.day++;
    hud();
    save();
    notify("Nouvelle journée : jour " + state.day);
  }
}

// AFFICHAGE ET ANIMATION

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const dt = Math.min(clock.getDelta(), 0.05);

  movePlayer(dt);
  updateBusiness(dt);
  updateCustomers(dt);

  camera.rotation.order = "YXZ";
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  renderer.render(scene, camera);
}

hud();
updateShopButton();
animate();

notify("V0.3 : clients autonomes activés !");
