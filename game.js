import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";
// Business Empire Simulator V0.8.0 — congélateur mural creux et produits visibles
const $=id=>document.getElementById(id);
const NORMAL_SAVE="business-empire-v04", DEV_SAVE="business-empire-dev-v01", LEGACY="business-empire-v02";
// L'activation est locale au navigateur, pas une authentification sécurisée.
const DEV_ACTIVATION=new URLSearchParams(location.search).get("fba-test");
if(DEV_ACTIVATION==="activer")localStorage.setItem("fba-dev-authorized","true");
const DEV_AUTHORIZED=localStorage.getItem("fba-dev-authorized")==="true";
const DEV_MODE=DEV_AUTHORIZED&&localStorage.getItem("fba-dev-enabled")==="true";
if(DEV_ACTIVATION==="activer")history.replaceState(null,"",location.pathname);
const SAVE=DEV_MODE?DEV_SAVE:NORMAL_SAVE;
const catalog=[
 {id:"eau",name:"Eau",cost:2,price:4,color:0x38bdf8,x:-5},
 {id:"pates",name:"Pâtes",cost:3,price:6,color:0xfacc15,x:0},
 {id:"savon",name:"Savon",cost:5,price:10,color:0x4ade80,x:5},
 {id:"riz",name:"Riz",cost:4,price:8,color:0xfde68a,x:-8.5,z:-7,level:2,kind:"sec"},
 {id:"biscuits",name:"Biscuits",cost:5,price:11,color:0xf59e0b,x:8.5,z:-7,level:3,kind:"sec"},
 {id:"fromage",name:"Fromage",cost:8,price:17,color:0xfef08a,x:-8.5,z:-3.5,level:4,kind:"froid"},
 {id:"surgeles",name:"Pizza surgelée",cost:9,price:20,color:0x60a5fa,x:8.5,z:-3.5,level:4,kind:"congelateur"},
 {id:"cereales",name:"Céréales",cost:6,price:13,color:0xc084fc,x:-8.5,z:0,level:5,kind:"sec"},
 {id:"pommes",name:"Pommes",cost:3,price:7,color:0xf87171,x:8.5,z:0,level:6,kind:"fruits"},
 {id:"cafe",name:"Café",cost:7,price:15,color:0x92400e,x:-5,z:-15,level:4,kind:"extension",license:"extensionLicense"},
 {id:"jus",name:"Jus de fruits",cost:4,price:9,color:0xfb923c,x:0,z:-15,level:4,kind:"extension",license:"extensionLicense"},
 {id:"chocolat",name:"Chocolat",cost:5,price:12,color:0x78350f,x:5,z:-15,level:4,kind:"extension",license:"extensionLicense"}
];
const CAPACITY=30, BOX_UNITS=10;
const upgradeCatalog=[
 {id:"reserve1",name:"Réserve agrandie I",level:3,cost:900,description:"Capacité de stockage : 30 à 60 cartons."},
 {id:"store1",name:"Extension du magasin I",level:4,cost:1800,description:"Ouvre une nouvelle salle de vente de 20 × 12 m derrière le magasin, avec accès central."},
 {id:"phoneSkill",name:"Compétence Téléphonie",level:5,cost:1200,description:"Formation préalable à la vente de téléphones."},
 {id:"phones",name:"Rayon Téléphones",level:6,cost:2400,requires:"phoneSkill",description:"Débloque la spécialisation téléphones."},
 {id:"gamingSkill",name:"Compétence Jeux vidéo",level:8,cost:1600,description:"Formation préalable à la vente de consoles."},
 {id:"consoles",name:"Rayon Consoles",level:10,cost:3500,requires:"gamingSkill",description:"Débloque la spécialisation consoles."},
 {id:"freshLicense",name:"Licence produits frais et surgelés",level:4,cost:650,description:"Autorise la vente de fromage et de pizzas surgelées."},
 {id:"fruitLicense",name:"Licence fruits et légumes",level:6,cost:450,description:"Autorise la vente de pommes et les futurs fruits."},
 {id:"extensionLicense",name:"Licence épicerie de l'extension",level:4,cost:800,requires:"store1",description:"Autorise les nouveaux rayons de l'extension : café, jus de fruits et chocolat."}
];
// Chaque euro de chiffre d'affaires encaissé compte pour la progression.
function revenueThreshold(level){
 if(level<=1)return 0;
 if(level===2)return 500;
 if(level===3)return 2000;
 return 4000*Math.pow(2,level-4);
}
function playerLevel(){
 if(DEV_MODE)return Math.max(1,Math.min(200,Number(state.devLevel)||1));
 let level=1;
 while(level<50&&finance.revenue>=revenueThreshold(level+1))level++;
 return level;
}
function nextLevelRevenue(){return revenueThreshold(playerLevel()+1);}
function reserveLimit(){return state.upgrades.reserve1?60:30;}
function reserveBoxes(){return catalog.reduce((n,p)=>n+state.inventory[p.id].boxes+Math.ceil(state.inventory[p.id].reserve/BOX_UNITS),0);}
function canOrderBox(){return reserveBoxes()<reserveLimit();}
function hasProductLicense(p){
 if(p.license)return !!state.upgrades[p.license];
 if(p.id==="fromage"||p.id==="surgeles")return !!state.upgrades.freshLicense;
 if(p.id==="pommes")return !!state.upgrades.fruitLicense;
 return true;
}
function productAvailable(p){return playerLevel()>=(p.level||1)&&hasProductLicense(p);}
function unlockedProducts(){return catalog.filter(productAvailable);}
function unlockedShelves(){return 6+Math.max(0,playerLevel()-1);}
function showUpgrades(){
 openPanel("Améliorations du magasin");
 paragraph("Niveau "+playerLevel()+" — CA cumulé : "+euro(finance.revenue)+" | Niveau suivant : "+euro(nextLevelRevenue())+" de CA");
 paragraph("Objectif : "+unlockedShelves()+" étagères au niveau actuel. Rayons supplémentaires installés : "+extraShelves.filter(e=>e.level<=playerLevel()).length+". Première extension aménagée avec six gondoles ; futurs agrandissements en préparation.");
 paragraph("Trésorerie : "+euro(state.money)+" | Réserve : "+reserveBoxes()+"/"+reserveLimit()+" cartons");
 paragraph("Licences commerciales : les produits concernés ne sont vendables qu’après achat de leur licence.");
 for(const u of upgradeCatalog){
  const owned=!!state.upgrades[u.id];
  paragraph(u.name+" — "+(owned?"ACQUIS":euro(u.cost))+" | Niveau "+u.level+" requis");
  paragraph(u.description);
  if(owned)continue;
  const eligible=playerLevel()>=u.level&&(!u.requires||state.upgrades[u.requires]);
  const b=button(panel,eligible?"Acheter — "+euro(u.cost):"Verrouillé — niveau "+u.level,()=>{
   if(!eligible)return;
   if(state.money<u.cost){toast("Trésorerie insuffisante");return;}
   state.money-=u.cost;state.upgrades[u.id]=true;sync();showUpgrades();toast("Amélioration débloquée : "+u.name);
  });
  b.disabled=!eligible;b.style.opacity=eligible?"1":".5";
 }
}
function initial(){
 const inventory={};
 catalog.forEach(p=>inventory[p.id]={shelf:p.kind==="extension"?0:10,reserve:0,boxes:0,price:p.price});
 return {money:5000,day:1,sales:0,inventory,finance:{revenue:0,supplies:0,charges:0,transactions:0},upgrades:{},hour:8};
}
function load(){
 const s=initial();
 try{
  const current=JSON.parse(localStorage.getItem(SAVE));
  if(current?.inventory){
   if(Number.isFinite(current.devLevel))s.devLevel=current.devLevel;
   for(const k of ["money","day","sales"])if(Number.isFinite(current[k])&&current[k]>=0)s[k]=current[k];
   if(current.upgrades&&typeof current.upgrades==="object")for(const u of upgradeCatalog)s.upgrades[u.id]=current.upgrades[u.id]===true;
   if(current.finance)for(const k of Object.keys(s.finance))if(Number.isFinite(current.finance[k])&&current.finance[k]>=0)s.finance[k]=current.finance[k];
   // Une session rechargée démarre toujours en préparation à 08:00.
   s.hour=8;
   for(const p of catalog){
    const src=current.inventory[p.id]||{},dst=s.inventory[p.id];
    for(const k of ["shelf","reserve","boxes"])if(Number.isFinite(src[k]))dst[k]=Math.max(0,Math.floor(src[k]));
    if(Number.isFinite(src.price))dst.price=Math.max(1,Math.round(src.price));
   }
  }else{
   const old=JSON.parse(localStorage.getItem(LEGACY));
   if(old){
    for(const k of ["money","day","sales"])if(Number.isFinite(old[k])&&old[k]>=0)s[k]=old[k];
    const qty=Math.max(0,Math.floor(old.stock||0));
    catalog.forEach((p,i)=>{
     const count=Math.floor(qty/3)+(i<qty%3?1:0);
     s.inventory[p.id].shelf=Math.min(CAPACITY,count);
     s.inventory[p.id].reserve=Math.max(0,count-CAPACITY);
    });
   }
  }
 }catch(e){console.warn("Chargement sauvegarde",e);}
 return s;
}
const state=load();
if(DEV_MODE&&!Number.isFinite(state.devLevel))state.devLevel=1;
state.hour=8;
const finance=state.finance;
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state));}catch(e){console.warn(e);}}
function total(){return catalog.reduce((n,p)=>{const a=state.inventory[p.id];return n+a.shelf+a.reserve+a.boxes*BOX_UNITS;},0);}
function hud(){
 $("money").textContent=Math.round(state.money).toLocaleString("fr-FR")+" €";
 $("day").textContent=state.day;
 $("stock").textContent=total();
}
let toastTimer;
function toast(t){
 const m=$("message");m.textContent=t;m.classList.add("visible");
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>m.classList.remove("visible"),2700);
}
// Overlay de gestion
const panel=document.createElement("section");
Object.assign(panel.style,{position:"fixed",left:"50%",top:"50%",transform:"translate(-50%,-50%)",width:"min(92vw,420px)",maxHeight:"75dvh",overflowY:"auto",background:"#0f172a",border:"1px solid #38bdf8",borderRadius:"14px",padding:"16px",zIndex:"50",display:"none",touchAction:"pan-y",color:"white"});
document.body.appendChild(panel);
function button(parent,label,fn){
 const b=document.createElement("button");b.textContent=label;
 Object.assign(b.style,{display:"block",width:"100%",padding:"11px",marginTop:"8px",borderRadius:"8px",background:"#2563eb",color:"white",fontSize:"12px",fontWeight:"bold",touchAction:"manipulation"});
 b.addEventListener("click",fn);parent.appendChild(b);return b;
}
function openPanel(title){
 panel.replaceChildren();
 const h=document.createElement("h2");h.textContent=title;h.style.fontSize="18px";panel.appendChild(h);
 button(panel,"Fermer",()=>panel.style.display="none");
 panel.style.display="block";
}
function paragraph(t){
 const p=document.createElement("p");p.textContent=t;p.style.marginTop="12px";p.style.fontSize="13px";panel.appendChild(p);
}
function showOrders(){
 openPanel("Fournisseurs — cartons de 10");
 unlockedProducts().forEach(p=>button(panel,p.name+" : "+(p.cost*10)+" €",()=>{
  const cost=p.cost*10;
  if(!canOrderBox()){toast("Réserve pleine — améliore sa capacité");return;}
  if(state.money<cost){toast("Trésorerie insuffisante");return;}
  state.money-=cost;finance.supplies+=cost;state.inventory[p.id].boxes++;
  sync();showOrders();toast("Carton livré : "+p.name);
 }));
}
function showStocks(){
 openPanel("Stocks");
 unlockedProducts().forEach(p=>{
  const a=state.inventory[p.id];
  paragraph(p.name+" — Rayons "+a.shelf+"/"+CAPACITY+" | Réserve "+a.reserve+" | Cartons "+a.boxes+" | "+a.price+" €");
 });
}
function showPrices(){
 openPanel("Prix de vente");
 catalog.forEach(p=>{
  const a=state.inventory[p.id];paragraph(p.name+" : "+a.price+" €");
  button(panel,"− 1 €",()=>{a.price=Math.max(1,a.price-1);save();showPrices();});
  button(panel,"+ 1 €",()=>{a.price++;save();showPrices();});
 });
}
$("restock").textContent="Commander";
$("restock").addEventListener("click",showOrders);
const actions=document.createElement("div");
Object.assign(actions.style,{position:"fixed",right:"12px",bottom:"110px",zIndex:"12",width:"110px"});
document.body.appendChild(actions);
// Menu centralisé, adapté aux petits écrans.
let paused=false;
const menuButton=button(actions,"☰ Menu",showMainMenu);
menuButton.style.background="#334155";
button(actions,"Interagir",interact).style.background="#15803d";
function showProfile(){
 openPanel("Profil du commerçant");
 paragraph("Entreprise : Business Empire Simulator");
 paragraph("Jour : "+state.day+" | Heure : "+formatHour(state.hour));
 paragraph("Trésorerie : "+euro(state.money));
 paragraph("Articles vendus : "+state.sales);
 paragraph("Transactions : "+finance.transactions);
 paragraph("Niveau du magasin : "+playerLevel());
 paragraph("Chiffre d’affaires encaissé : "+euro(finance.revenue));
 paragraph("Prochain niveau à "+euro(nextLevelRevenue())+" de chiffre d’affaires");
 button(panel,"← Retour au menu",showMainMenu);
}
function switchDevMode(enable){
 if(enable&&!DEV_AUTHORIZED){toast("Mode test non autorisé sur ce navigateur");return;}
 if(enable){
  if(!localStorage.getItem(DEV_SAVE)){
   const copy=initial();copy.money=100000;copy.devLevel=1;
   localStorage.setItem(DEV_SAVE,JSON.stringify(copy));
  }
  localStorage.setItem("fba-dev-enabled","true");
 }else localStorage.setItem("fba-dev-enabled","false");
 location.reload();
}
function showDevTools(){
 openPanel("FBA GAMES — MODE TEST");
 paragraph("Sauvegarde de test indépendante. Ces commandes ne modifient pas ta partie normale.");
 paragraph("Niveau de test : "+playerLevel()+" | Argent : "+euro(state.money));
 const selector=document.createElement("select");
 Object.assign(selector.style,{width:"100%",padding:"12px",background:"#1e293b",color:"white",borderRadius:"8px"});
 for(const n of [1,2,3,4,5,6,8,10,15,25,50,100,150,200]){
  const opt=document.createElement("option");opt.value=n;opt.textContent="Niveau "+n;opt.selected=playerLevel()===n;selector.appendChild(opt);
 }
 panel.appendChild(selector);
 button(panel,"Appliquer le niveau",()=>{
  state.devLevel=Number(selector.value);sync();showDevTools();toast("Niveau de test : "+state.devLevel);
 });
 button(panel,"Ajouter 100 000 €",()=>{state.money+=100000;sync();showDevTools();});
 button(panel,"Débloquer toutes les améliorations existantes",()=>{
  for(const u of upgradeCatalog)state.upgrades[u.id]=true;
  sync();showDevTools();toast("Améliorations de test activées");
 });
 button(panel,"Remplir tous les rayons débloqués",()=>{
  for(const p of unlockedProducts())state.inventory[p.id].shelf=CAPACITY;
  sync();showDevTools();
 });
 button(panel,"Retour à la partie normale",()=>switchDevMode(false));
}
function showMainMenu(){
 openPanel("☰ Menu principal");
 paragraph("Business Empire Simulator — Gestion du magasin"+(DEV_MODE?" | MODE TEST":""));
 button(panel,paused?"▶ Reprendre la partie":"⏸ Mettre en pause",()=>{
  paused=!paused;
  if(paused){showMainMenu();toast("Partie en pause");}
  else{panel.style.display="none";toast("Partie reprise");}
 });
 button(panel,"Profil",showProfile);
 if(DEV_MODE)button(panel,"OUTILS DÉVELOPPEUR",showDevTools);
 else if(DEV_AUTHORIZED)button(panel,"Activer le mode test FBA Games",()=>switchDevMode(true));
 button(panel,"Améliorations et compétences",showUpgrades);
 button(panel,"Stocks",showStocks);
 button(panel,"Réserve",showReserve);
 button(panel,"Commandes fournisseurs",showOrders);
 button(panel,"Prix de vente",showPrices);
 button(panel,"Ordinateur de caisse",showComputer);
 button(panel,"Bilan financier",showFinance);
 button(panel,"Fermer le menu",()=>panel.style.display="none");
}


const RENTS=35, ELECTRICITY=12, OTHER_CHARGES=8, DAILY_CHARGES=RENTS+ELECTRICITY+OTHER_CHARGES;
function euro(n){return Math.round(n).toLocaleString("fr-FR")+" €";}
function showFinance(){
 openPanel("Bilan financier");
 paragraph("Jour "+state.day+" — Heure : "+formatHour(state.hour));
 paragraph("Chiffre d'affaires cumulé : "+euro(finance.revenue));
 paragraph("Achats fournisseurs : "+euro(finance.supplies));
 paragraph("Charges cumulées : "+euro(finance.charges));
 paragraph("Bénéfice net simplifié : "+euro(finance.revenue-finance.supplies-finance.charges));
 paragraph("Transactions : "+finance.transactions+" | Articles vendus : "+state.sales);
 paragraph("Charges journalières : loyer "+euro(RENTS)+", électricité "+euro(ELECTRICITY)+", autres "+euro(OTHER_CHARGES)+".");
 paragraph("Le bilan est cumulatif et ne valorise pas le stock restant.");
}
function formatHour(hour){
 const h=Math.floor(hour),m=Math.floor((hour-h)*60);
 return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0");
}
function showComputer(){
 if(!near(7.3,6.5,3.4)){toast("Approche-toi de l'ordinateur de caisse");return;}
 openPanel("ORDINATEUR — Business Empire OS");
 paragraph("Terminal de caisse et gestion des fournisseurs");
 paragraph("Client à encaisser : "+(cashier?"Oui — "+euro(cashier.total):"Aucun"));
 paragraph("Trésorerie disponible : "+euro(state.money));
 button(panel,"Caisse — paiements",showCheckout);
 button(panel,"Fournisseurs — commander des cartons",showComputerOrders);
 button(panel,"Stocks du magasin",showStocks);
 button(panel,"Bilan financier",showFinance);
 button(panel,"Améliorations",showUpgrades);
}
function showComputerOrders(){
 if(!near(7.3,6.5,3.4)){toast("Approche-toi de l'ordinateur");return;}
 openPanel("ORDINATEUR — Fournisseurs");
 paragraph("Commandes livrées en réserve. Chaque carton contient "+BOX_UNITS+" produits.");
 for(const p of unlockedProducts()){
  const a=state.inventory[p.id],cost=p.cost*BOX_UNITS;
  paragraph(p.name+" | "+euro(cost)+"/carton | "+a.boxes+" carton(s) en réserve");
  button(panel,"Commander 1 carton — "+euro(cost),()=>{
   if(!canOrderBox()){toast("Réserve pleine — améliore sa capacité");return;}
   if(state.money<cost){toast("Trésorerie insuffisante");return;}
   state.money-=cost;finance.supplies+=cost;a.boxes++;
   sync();showComputerOrders();toast("Commande livrée : "+p.name);
  });
 }
 button(panel,"← Bureau",showComputer);
}
function showCheckout(){
 if(!cashier){toast("Aucun client à encaisser");return;}
 if(!near(6.5,6.5,3.5)){toast("Approche-toi de la caisse");return;}
 openPanel("Caisse — client en attente");
 const c=cashier;
 const items=Object.entries(c.basket);
 const count=items.reduce((n,[,q])=>n+q,0);
 if(!count){
  paragraph("Panier vide.");
  button(panel,"Terminer le passage",()=>finishCheckout(c));
  return;
 }
 for(const [id,q] of items){
  const p=catalog.find(p=>p.id===id);
  paragraph(p.name+" : "+q+" × "+euro(c.prices[id])+" = "+euro(q*c.prices[id]));
 }
 paragraph("Total : "+euro(c.total));
 paragraph("Articles scannés : "+c.scanned+"/"+count);
 button(panel,"Scanner un article",()=>{
  if(c!==cashier){panel.style.display="none";return;}
  if(c.scanned<count)c.scanned++;
  if(c.scanned===count)toast("Tous les articles sont scannés");
  showCheckout();
 });
 if(c.scanned===count)button(panel,"Encaisser "+euro(c.total),()=>{
  if(c!==cashier)return;
  state.money+=c.total;state.sales+=count;
  finance.revenue+=c.total;finance.transactions++;
  sync();finishCheckout(c);panel.style.display="none";
  toast("Paiement reçu : +"+euro(c.total));
 });
}
function finishCheckout(c){
 if(c!==cashier)return;
 cashier=null;c.phase="leaving";c.waypoint=0;
 c.route=[{x:5.2,z:8},{x:0,z:8},{x:0,z:12.5}];
 panel.style.display="none";
}
// Scène et éclairage léger
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9bc9e8);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.05,100);
camera.position.set(0,1.7,7.5);camera.rotation.order="YXZ";
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.25));
renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=false;
$("game").appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x718096,2.2));
const sun=new THREE.DirectionalLight(0xffffff,1.4);sun.position.set(5,12,4);scene.add(sun);
const ambient=scene.children.find(o=>o.isHemisphereLight);
let storeLightsOn=true,stockroomLightsOn=true;
const ceilingLights=new THREE.Group();scene.add(ceilingLights);
function ceilingLamp(x,z){
 const lamp=new THREE.PointLight(0xfff4db,0,9,1.8);lamp.position.set(x,4.45,z);ceilingLights.add(lamp);return lamp;
}
const lamps=[];
for(const x of [-6,0,6])for(const z of [-6,0,6])lamps.push({light:ceilingLamp(x,z),extension:false});
for(const x of [-6,0,6])for(const z of [-14,-19])lamps.push({light:ceilingLamp(x,z),extension:true});
for(const x of [11.6,13.8])for(const z of [3.5,7.5])lamps.push({light:ceilingLamp(x,z),stockroom:true});
function updateLighting(){
 const hour=state.hour;
 const daylight=Math.max(.12,Math.min(1,(20-hour)/3.5));
 scene.background.setRGB(.055+.55*daylight,.09+.69*daylight,.17+.74*daylight);
 sun.intensity=.12+1.28*daylight;
 ambient.intensity=.25+1.95*daylight;
 for(const l of lamps)l.light.intensity=l.stockroom?(stockroomLightsOn?1.7:0):(storeLightsOn&&(!l.extension||state.upgrades.store1)?1.35:0);
}
const colliders=[];
function cube(x,y,z,w,h,d,color,solid=false){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.8}));
 mesh.position.set(x,y,z);scene.add(mesh);
 if(solid)colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
 return mesh;
}
cube(0,-.15,0,20,.3,20,0xb9c1c8);
cube(0,5.1,0,20,.2,20,0xf1f5f9);
cube(-10,2.5,0,.3,5,20,0xe2e8f0,true);
cube(10,2.5,-3,.3,5,14,0xe2e8f0,true);
cube(10,2.5,8.5,.3,5,3,0xe2e8f0,true);
cube(10,4.2,5.5,.3,1.6,3,0xe2e8f0);
cube(12.65,-.15,5.5,5.3,.3,8,0xb9c1c8);
cube(12.65,5.1,5.5,5.3,.2,8,0xf1f5f9);
cube(15.3,2.5,5.5,.3,5,8,0xe2e8f0,true);
cube(12.65,2.5,1.5,5.3,5,.3,0xe2e8f0,true);
// Cloison de fond continue et opaque : l'interrupteur est fixé sur sa face intérieure.
cube(12.65,2.5,9.35,5.3,5,.3,0xe2e8f0,true);
// Ouverture rectangulaire de 3 m, du sol jusqu’à 3,4 m, sans panneau suspendu.
// Mur arrière avec passage central réservé à la première extension.
cube(-6,2.5,-10,8,5,.3,0xe2e8f0,true);
cube(6,2.5,-10,8,5,.3,0xe2e8f0,true);
cube(0,4.15,-10,4,1.7,.3,0xe2e8f0);
const extensionGate=cube(0,1.65,-10,3.95,3.3,.24,0x64748b);
const extensionGateCollider={minX:-2,maxX:2,minZ:-10.2,maxZ:-9.8,level:1};
colliders.push(extensionGateCollider);
// Salle supplémentaire : 20 m de large et 12 m de profondeur.
const extensionMeshes=[];
function extensionCube(x,y,z,w,h,d,color){
 const mesh=cube(x,y,z,w,h,d,color);
 extensionMeshes.push(mesh);return mesh;
}
extensionCube(0,-.15,-16,20,.3,12,0xb9c1c8);
extensionCube(0,5.1,-16,20,.2,12,0xf1f5f9);
extensionCube(-10,2.5,-16,.3,5,12,0xe2e8f0);
extensionCube(10,2.5,-16,.3,5,12,0xe2e8f0);
extensionCube(0,2.5,-22,20,5,.3,0xe2e8f0);
for(const x of [-6,0,6])for(const z of [-14,-19])extensionCube(x,4.94,z,2.8,.05,.5,0xffffff);
// Rayonnages muraux, avec tablettes inclinées et bordures.
function addWallRack(x,z,rotation=0,extension=true){
 const rack=new THREE.Group();rack.position.set(x,0,z);rack.rotation.y=rotation;
 const steel=new THREE.MeshStandardMaterial({color:0x64748b,metalness:.3});
 for(const y of [.45,1.15,1.85]){
  const plank=new THREE.Mesh(new THREE.BoxGeometry(2.55,.075,.78),steel);
  plank.position.y=y;plank.rotation.x=.12;rack.add(plank);
  const lip=new THREE.Mesh(new THREE.BoxGeometry(2.55,.055,.04),steel);
  lip.position.set(0,y+.08,.38);rack.add(lip);
 }
 for(const px of [-1.2,1.2])for(const pz of [-.34,.34]){
  const post=new THREE.Mesh(new THREE.BoxGeometry(.055,2.3,.055),steel);
  post.position.set(px,1.15,pz);rack.add(post);
 }
 scene.add(rack);
 if(extension)extensionMeshes.push(rack);
 const alongX=Math.abs(Math.cos(rotation))>.5;
 colliders.push({minX:x-(alongX?1.3:.42),maxX:x+(alongX?1.3:.42),
  minZ:z-(alongX?.42:1.3),maxZ:z+(alongX?.42:1.3),
  ...(extension?{requiresUpgrade:"store1"}:{})});
}
for(const x of [-7,-3.5,3.5,7])addWallRack(x,-21.1,0,true);
for(const z of [-13.5,-17,-20]){addWallRack(-9.15,z,Math.PI/2,true);addWallRack(9.15,z,-Math.PI/2,true);}
addWallRack(-8.9,5.9,Math.PI/2,false);
addWallRack(-5.2,7.8,0,false);
// Trois rayons commercialisables dans la nouvelle zone, avec cartons visibles.
for(const p of catalog.filter(p=>p.kind==="extension")){
 const rack=new THREE.Group();rack.position.set(p.x,0,p.z);
 const metal=new THREE.MeshStandardMaterial({color:0x64748b,metalness:.3});
 const productMat=new THREE.MeshStandardMaterial({color:p.color,roughness:.75});
 for(const y of [.48,1.15,1.82]){
  const plank=new THREE.Mesh(new THREE.BoxGeometry(2.65,.08,.95),metal);
  plank.position.y=y;plank.rotation.x=.12;rack.add(plank);
  const lip=new THREE.Mesh(new THREE.BoxGeometry(2.65,.07,.045),metal);
  lip.position.set(0,y+.09,.46);rack.add(lip);
 }
 for(let i=0;i<CAPACITY;i++){
  const tier=Math.floor(i/10),slot=i%10;
  const item=new THREE.Mesh(new THREE.BoxGeometry(.19,.3,.32),productMat);
  item.position.set(-1.08+(slot%5)*.52,.72+tier*.67,slot<5?-.20:.19);
  rack.add(item);displays[p.id].push(item);
 }
 scene.add(rack);extensionProductGroups[p.id]=rack;extensionMeshes.push(rack);
}
// Gondoles d'extension avec allées libres, uniquement visibles après achat.
for(const x of [-5,0,5])for(const z of [-15,-19]){
 const rack=new THREE.Group();rack.position.set(x,0,z);
 const steel=new THREE.MeshStandardMaterial({color:0x64748b,metalness:.35});
 for(const y of [.45,1.15,1.85]){
  const shelf=new THREE.Mesh(new THREE.BoxGeometry(2.8,.09,.95),steel);
  shelf.position.y=y;shelf.rotation.x=.12;rack.add(shelf);
  const rim=new THREE.Mesh(new THREE.BoxGeometry(2.8,.055,.04),steel);
  rim.position.set(0,y+.08,.47);rack.add(rim);
 }
 for(const px of [-1.32,1.32])for(const pz of [-.43,.43]){
  const post=new THREE.Mesh(new THREE.BoxGeometry(.06,2.25,.06),steel);
  post.position.set(px,1.13,pz);rack.add(post);
 }
 scene.add(rack);extensionMeshes.push(rack);
 colliders.push({minX:x-1.5,maxX:x+1.5,minZ:z-.55,maxZ:z+.55,requiresUpgrade:"store1"});
}
function refreshExtension(){
 const unlocked=!!state.upgrades.store1;
 extensionGate.visible=!unlocked;
 extensionGateCollider.disabled=unlocked;
 for(const mesh of extensionMeshes)mesh.visible=unlocked;
}
cube(-6,2.5,10,8,5,.3,0xe2e8f0,true);
cube(6,2.5,10,8,5,.3,0xe2e8f0,true);
cube(0,4.2,10,4,1.6,.3,0xe2e8f0);
cube(0,-.17,12,8,.3,5,0x94a3b8);
cube(0,.015,8.5,3,.03,2,0x334155);
for(const x of [-6,0,6])for(const z of [-6,0,6])cube(x,4.94,z,2.8,.05,.5,0xffffff);
const displays={},extraShelves=[];
let freezerLid=null,freezerOpen=false;
let fridgeDoor=null,fridgeOpen=false;
for(const p of catalog){
 displays[p.id]=[];
 for(const z of (p.level?[p.z]:[-4,1])){
  const metal=new THREE.MeshStandardMaterial({color:0x64748b,metalness:.3});
  const mat=new THREE.MeshStandardMaterial({color:p.color});
  const group=new THREE.Group();group.position.set(p.x,0,z);
  if(p.level){
   group.scale.set((p.kind==="congelateur"||p.kind==="froid")?1:.47,1,(p.kind==="congelateur"||p.kind==="froid")?1:.8);
   group.visible=playerLevel()>=p.level;
   extraShelves.push({group,level:p.level});


  }
  if(p.kind!=="congelateur"&&p.kind!=="froid")for(const x of [-1.15,1.15])for(const dz of [-.4,.4]){
   const post=new THREE.Mesh(new THREE.BoxGeometry(.08,2.4,.08),metal);
   post.position.set(x,1.2,dz);group.add(post);
  }
  for(let level=0;level<((p.kind==="congelateur"||p.kind==="froid")?0:3);level++){
   const y=.45+level*.75;
   // Plateau légèrement incliné vers le client, avec butée anti-chute.
   const tilt=.12; // pente vers le client (avant = z positif)
   const isFruit=p.kind==="fruits";
   const plank=new THREE.Mesh(new THREE.BoxGeometry(2.4,.075,1),isFruit?new THREE.MeshStandardMaterial({color:0x9a6b3b,roughness:.9}):metal);
   plank.position.y=y;plank.rotation.x=tilt;group.add(plank);
   const lip=new THREE.Mesh(new THREE.BoxGeometry(2.4,.065,.045),isFruit?new THREE.MeshStandardMaterial({color:0x7c4a24}):metal);
   lip.position.set(0,y+.075,.49);group.add(lip);
   if(isFruit){
    const wood=new THREE.MeshStandardMaterial({color:0x8b5a2b,roughness:.9});
    for(const x of [-1.1,0,1.1]){
     const side=new THREE.Mesh(new THREE.BoxGeometry(.035,.12,.94),wood);
     side.position.set(x,y+.11,0);side.rotation.x=tilt;group.add(side);
    }
   }
   for(let i=0;i<5;i++){
    const item=isFruit
     ?new THREE.Mesh(new THREE.SphereGeometry(.19,12,10),mat)
     :new THREE.Mesh(new THREE.BoxGeometry(.3,.4,.45),mat);
    item.position.set(-.9+i*.45,y+(isFruit?.23:.25),0);
    if(!isFruit)item.rotation.x=tilt;
    group.add(item);displays[p.id].push(item);
   }
  }
  if(p.kind==="froid"){
   // Réfrigérateur vertical creux, contre le mur gauche ; ouverture côté allée.
   const shell=new THREE.MeshStandardMaterial({color:0xe5edf4,roughness:.45,metalness:.15});
   const liner=new THREE.MeshStandardMaterial({color:0xc5d9e6,roughness:.58});
   const trim=new THREE.MeshStandardMaterial({color:0x334155,metalness:.42});
   const glass=new THREE.MeshStandardMaterial({color:0x9ddcf4,transparent:true,opacity:.19,roughness:.08,depthWrite:false,side:THREE.DoubleSide});
   const add=(w,h,d,x,y,z,material,parent=group)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
   };
   // Environ 1,15 m de profondeur, 1,65 m de longueur, 2,2 m de hauteur.
   add(.10,2.18,1.65,-.54,1.13,0,shell); // fond contre mur
   add(1.15,.12,1.65,0,.10,0,shell);
   add(1.15,.12,1.65,0,2.18,0,shell);
   for(const z2 of [-.78,.78])add(1.15,2.18,.10,0,1.13,z2,shell);
   for(const y of [.62,1.15,1.68])add(1.02,.045,1.43,.04,y,0,liner);
   // Porte vitrée montée sur charnière verticale, côté z négatif.
   const door=new THREE.Group();
   door.position.set(.58,1.13,-.8);
   add(.035,2.02,1.55,0,0,.775,glass,door);
   for(const z2 of [0,1.55])add(.07,2.08,.07,0,0,z2,trim,door);
   for(const y of [-1.02,1.02])add(.07,.07,1.58,0,y,.775,trim,door);
   add(.13,.48,.055,.10,0,1.46,trim,door);
   group.add(door);fridgeDoor=door;
   // Fromages disposés sur trois étagères, visibilité synchronisée au stock.
   for(let i=0;i<CAPACITY;i++){
    const shelf=Math.floor(i/10),slot=i%10;
    const item=new THREE.Mesh(new THREE.BoxGeometry(.17,.14,.28),mat);
    item.position.set(-.24+(slot%2)*.37,.73+shelf*.53,-.54+Math.floor(slot/2)*.27);
    group.add(item);displays[p.id].push(item);
   }
  }
  if(p.kind==="congelateur"){
   // Long congélateur coffre contre le mur droit, ouvert sur une vraie cuve creuse.
   const shell=new THREE.MeshStandardMaterial({color:0xe7eef4,roughness:.46,metalness:.18});
   const liner=new THREE.MeshStandardMaterial({color:0xc5d9e6,roughness:.6,side:THREE.DoubleSide});
   const trim=new THREE.MeshStandardMaterial({color:0x334155,metalness:.4,roughness:.4});
   const glass=new THREE.MeshStandardMaterial({color:0x9ddcf4,transparent:true,opacity:.22,roughness:.08,side:THREE.DoubleSide,depthWrite:false});
   const add=(w,h,d,x,y,z,material,parent=group)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
    mesh.position.set(x,y,z);parent.add(mesh);return mesh;
   };
   // Longueur 3.5 m le long du mur x=10 ; accès côté allée (x négatif).
   add(1.38,.14,3.5,0,.13,0,shell);
   add(.13,.92,3.5,.625,.63,0,shell);
   add(.13,.92,3.5,-.625,.63,0,shell);
   add(1.38,.92,.13,0,.63,-1.685,shell);
   add(1.38,.92,.13,0,.63,1.685,shell);
   add(1.1,.04,3.22,0,.22,0,liner);
   add(.035,.66,3.22,-.545,.58,0,liner);
   add(.035,.66,3.22,.545,.58,0,liner);
   // Rebord supérieur et poignée du couvercle.
   for(const x of [-.65,.65])add(.07,.065,3.5,x,1.11,0,trim);
   for(const z2 of [-1.72,1.72])add(1.38,.065,.07,0,1.11,z2,trim);
   const lid=new THREE.Group();
   lid.position.set(.67,1.16,0); // charnière côté mur
   add(1.35,.035,3.42,-.675,0,0,glass,lid);
   add(.065,.07,3.44,-1.34,0,0,trim,lid);
   add(.065,.07,3.44,0,0,0,trim,lid);
   for(const z2 of [-1.7,1.7])add(1.35,.07,.06,-.675,0,z2,trim,lid);
   add(.09,.06,.65,-1.36,.065,0,trim,lid);
   group.add(lid);freezerLid=lid;
   // Les pizzas sont réellement dans la cuve et non sur un plateau extérieur.
   const pizzaMat=new THREE.MeshStandardMaterial({color:0x60a5fa,roughness:.75});
   for(let i=0;i<CAPACITY;i++){
    const item=new THREE.Mesh(new THREE.BoxGeometry(.62,.09,.29),pizzaMat);
    const row=Math.floor(i/10),slot=i%10;
    item.position.set(-.27+row*.27,.34+row*.12,-1.43+slot*.315);
    item.rotation.y=.04*(i%3-1);
    group.add(item);displays[p.id].push(item);
   }
  }
  scene.add(group);
  colliders.push({minX:p.x-(p.kind==="congelateur"?.7:p.kind==="froid"?.62:p.level?.62:1.3),maxX:p.x+(p.kind==="congelateur"?.7:p.level?.62:1.3),minZ:z-(p.kind==="congelateur"?1.75:p.kind==="froid"?.85:p.level?.52:.65),maxZ:z+(p.kind==="congelateur"?1.75:p.level?.52:.65),level:p.level||1});
 }
}
const extensionProductGroups={};
function refreshDisplays(){
 for(const p of catalog)displays[p.id].forEach((m,i)=>m.visible=productAvailable(p)&&i<state.inventory[p.id].shelf);
 for(const e of extraShelves)e.group.visible=playerLevel()>=e.level;
 for(const p of catalog.filter(p=>p.kind==="extension")){const g=extensionProductGroups[p.id];if(g)g.visible=!!state.upgrades.store1;}
}
cube(6.5,.55,6.5,3,1.1,1.3,0x475569,true);
cube(6.5,1.13,6.5,3.1,.12,1.4,0x1e293b);
// Écran et clavier côté employé (vers l'entrée, z positif), pas côté rayons.
cube(7.3,1.45,6.5,.6,.55,.2,0x0f172a);
const terminalScreen=cube(7.3,1.5,6.64,.48,.3,.045,0x22c55e);
terminalScreen.material.emissive=new THREE.Color(0x064e3b);
const terminalKeyboard=cube(7.3,1.22,6.86,.65,.035,.24,0x94a3b8);
// Petit interrupteur fixé sur le flanc de la caisse, côté employé.
const lightSwitch=cube(8.08,1.16,6.93,.10,.09,.035,0x22c55e);
// Interrupteur dédié, sur le mur intérieur de la réserve près de son entrée.
// Plaque et bouton fixés sur le mur du fond de la réserve, côté intérieur.
const stockroomSwitchPlate=cube(11.3,1.35,9.165,.19,.22,.045,0xf8fafc);
const stockroomSwitch=cube(11.3,1.35,9.13,.09,.11,.045,0x22c55e);
function toggleStockroomLights(){
 stockroomLightsOn=!stockroomLightsOn;
 stockroomSwitch.material.color.setHex(stockroomLightsOn?0x22c55e:0xef4444);
 updateLighting();
 toast("Lumière de la réserve : "+(stockroomLightsOn?"allumée":"éteinte"));
}
function toggleLights(){
 storeLightsOn=!storeLightsOn;
 lightSwitch.material.color.setHex(storeLightsOn?0x22c55e:0xef4444);
 updateLighting();
 toast("Éclairage du magasin : "+(storeLightsOn?"allumé":"éteint"));
}
cube(12.8,.1,5.5,3.5,.2,5.8,0x8b5e3c);
// Représentation 3D : jusqu'à 3 cartons par produit, plus un lot ouvert
const boxes={},reserveModels={};
for(const [i,p] of catalog.entries()){
 boxes[p.id]=[];
 for(let j=0;j<3;j++){
  const mesh=cube(11.3+(i%4)*.85,.48+j*.68,3.3+Math.floor(i/4)*1.55,.7,.65,.7,0xb98246);
  const band=new THREE.Mesh(new THREE.BoxGeometry(.72,.13,.72),new THREE.MeshStandardMaterial({color:p.color}));
  band.position.y=.18;mesh.add(band);
  boxes[p.id].push(mesh);
 }
 reserveModels[p.id]=cube(11.3+(i%4)*.85,.25,4.1+Math.floor(i/4)*1.55,.55,.4,.45,p.color);
}
function refreshBoxes(){
 catalog.forEach(p=>{
  const a=state.inventory[p.id];
  boxes[p.id].forEach((m,i)=>m.visible=i<Math.min(3,a.boxes));
  reserveModels[p.id].visible=a.reserve>0;
 });
}
const signCanvas=document.createElement("canvas");signCanvas.width=512;signCanvas.height=128;
const ctx=signCanvas.getContext("2d");ctx.fillStyle="#0f172a";ctx.fillRect(0,0,512,128);
ctx.fillStyle="#38bdf8";ctx.font="bold 34px Arial";ctx.textAlign="center";ctx.fillText("BUSINESS EMPIRE",256,78);
const sign=new THREE.Mesh(new THREE.PlaneGeometry(5,1.25),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(signCanvas),side:THREE.DoubleSide}));
sign.position.set(0,3.5,-9.8);scene.add(sign);
function sync(){hud();refreshDisplays();refreshBoxes();refreshExtension();updateLighting();save();}
// V0.4.2 — transport de cartons entiers, remplissage en lot
// held = {id, quantity}. Une unité d'ancienne réserve peut être regroupée en lot.
let held=null;
const carryLabel=document.createElement("div");
Object.assign(carryLabel.style,{
 position:"fixed",left:"50%",top:"max(10px, env(safe-area-inset-top))",transform:"translateX(-50%)",
 zIndex:"13",padding:"8px 12px",borderRadius:"9px",background:"#0f172ae8",
 border:"1px solid #38bdf8",color:"white",fontSize:"12px",fontWeight:"bold",
 pointerEvents:"none",maxWidth:"45vw",textAlign:"center"
});
document.body.appendChild(carryLabel);
function refreshCarry(){
 const p=held&&catalog.find(p=>p.id===held.id);
 carryLabel.style.display=p?"block":"none";
 carryLabel.textContent=p?"Carton : "+p.name+" — "+held.quantity+" produit(s)":"";
}
function near(x,z,r=2.5){return Math.hypot(camera.position.x-x,camera.position.z-z)<=r;}
function atReserve(){return near(12.5,5.5,3.1);}
function putBack(){
 if(!held)return;
 state.inventory[held.id].reserve+=held.quantity;
 held=null;sync();refreshCarry();showReserve();
}
function takeCarton(p,amount){
 const a=state.inventory[p.id];
 if(held){toast("Dépose d'abord le carton que tu portes");return;}
 if(a.boxes>0){
  a.boxes--;held={id:p.id,quantity:BOX_UNITS};
 }else if(a.reserve>0){
  const quantity=Math.min(amount,a.reserve);
  a.reserve-=quantity;held={id:p.id,quantity};
 }else{toast("Aucun produit disponible");return;}
 sync();refreshCarry();panel.style.display="none";
 toast("Carton de "+p.name+" : "+held.quantity+" produits. Va au rayon.");
}
// Gestion des déchets : uniquement les produits réellement en réserve.
// Confirmation obligatoire ; aucun remboursement.
function showDisposal(p){
 const a=state.inventory[p.id];
 openPanel("Jeter des marchandises — "+p.name);
 paragraph("Stock disponible : "+a.reserve+" unité(s) en vrac et "+a.boxes+" carton(s) de 10.");
 paragraph("Les produits jetés sont définitivement perdus, sans remboursement.");
 const quantityLabel=document.createElement("label");
 quantityLabel.textContent="Quantité à jeter (unités) : ";
 quantityLabel.style.display="block";
 quantityLabel.style.marginTop="12px";
 panel.appendChild(quantityLabel);
 const input=document.createElement("input");
 input.type="number";input.min="1";input.max=String(a.reserve+a.boxes*BOX_UNITS);
 input.step="1";input.value="1";input.inputMode="numeric";
 Object.assign(input.style,{width:"100%",padding:"10px",marginTop:"6px",borderRadius:"8px",background:"#fff",color:"#111"});
 panel.appendChild(input);
 button(panel,"Continuer",()=>{
  const amount=Number(input.value);
  const available=a.reserve+a.boxes*BOX_UNITS;
  if(!Number.isSafeInteger(amount)||amount<1||amount>available){
   toast("Choisis une quantité entre 1 et "+available);return;
  }
  openPanel("Confirmer la suppression");
  paragraph("Jeter définitivement "+amount+" × "+p.name+" ?");
  button(panel,"Oui, jeter "+amount+" produit(s)",()=>{
   // Déballer virtuellement les cartons nécessaires pour prélever le solde.
   const fromLoose=Math.min(a.reserve,amount);
   a.reserve-=fromLoose;
   let remaining=amount-fromLoose;
   if(remaining>0){
    const opened=Math.ceil(remaining/BOX_UNITS);
    a.boxes-=opened;
    a.reserve+=opened*BOX_UNITS-remaining;
   }
   sync();showReserve();toast(amount+" × "+p.name+" jetés");
  });
  button(panel,"Annuler",showReserve);
 });
 button(panel,"Annuler",showReserve);
}
function showReserve(){
 if(!atReserve()){toast("Approche-toi de la réserve");return;}
 openPanel("Réserve — cartons à transporter");
 if(held){
  const p=catalog.find(p=>p.id===held.id);
  paragraph("Tu portes "+held.quantity+" × "+p.name);
  button(panel,"Reposer le carton dans la réserve",putBack);
  return;
 }
 for(const p of unlockedProducts()){
  const a=state.inventory[p.id];
  paragraph("● "+p.name+" — "+a.boxes+" carton(s) fermé(s) ("+(a.boxes*BOX_UNITS)+" unités) + "+a.reserve+" en vrac. Total : "+(a.reserve+a.boxes*BOX_UNITS));
  if(a.boxes>0)button(panel,"Prendre un carton de "+p.name+" (10)",()=>takeCarton(p,10));
  if(a.reserve>0)button(panel,"Prendre un lot de "+p.name+" ("+Math.min(10,a.reserve)+")",()=>takeCarton(p,10));
  if(a.boxes>0||a.reserve>0)button(panel,"Jeter des "+p.name,()=>showDisposal(p));
 }
}
function interact(){
 if(held){
  const p=catalog.find(p=>p.id===held.id);
  if(productAvailable(p)&&(p.level?near(p.x,p.z,2.2):(near(p.x,1,3.2)||near(p.x,-4,3.2)))){
   const a=state.inventory[p.id],space=Math.max(0,CAPACITY-a.shelf);
   if(!space){toast("Rayons "+p.name+" pleins");return;}
   const placed=Math.min(space,held.quantity);
   a.shelf+=placed;held.quantity-=placed;
   if(held.quantity===0)held=null;
   sync();refreshCarry();
   toast(placed+" × "+p.name+" placés"+(held?" — "+held.quantity+" restants":""));
   return;
  }
  if(atReserve()){showReserve();return;}
  toast("Rejoins le rayon "+p.name+" puis appuie sur Interagir");
  return;
 }
 if(near(11.3,9.13,1.45)&&camera.position.x>10.5){toggleStockroomLights();return;}
 if(atReserve()){showReserve();return;}
 if(fridgeDoor&&playerLevel()>=4&&near(-8.5,-3.5,2.4)){
  fridgeOpen=!fridgeOpen;fridgeDoor.rotation.y=fridgeOpen?-1.15:0;
  toast(fridgeOpen?"Réfrigérateur ouvert":"Réfrigérateur fermé");return;
 }
 if(freezerLid&&playerLevel()>=4&&near(8.5,-3.5,3.1)){
  freezerOpen=!freezerOpen;freezerLid.rotation.z=freezerOpen?-.95:0;
  toast(freezerOpen?"Congélateur ouvert":"Congélateur fermé");return;
 }
 if(near(8.08,6.93,1.15)){toggleLights();return;}
 if(near(7.3,6.5,3.4)){showComputer();return;}
 toast("Approche-toi de la réserve, de la caisse ou de l’interrupteur lumineux");
}
refreshCarry();
// Commandes de déplacement et caméra lissée
let yaw=0,pitch=0,targetYaw=0,targetPitch=0,lookPointer=null,lastX=0,lastY=0;
const keys={forward:false,backward:false,left:false,right:false};
const canvas=renderer.domElement;canvas.style.touchAction="none";
canvas.addEventListener("pointerdown",e=>{
 if(lookPointer!==null)return;
 lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove",e=>{
 if(e.pointerId!==lookPointer)return;
 const dx=THREE.MathUtils.clamp(e.clientX-lastX,-65,65);
 const dy=THREE.MathUtils.clamp(e.clientY-lastY,-65,65);
 lastX=e.clientX;lastY=e.clientY;
 targetYaw-=dx*.0025;targetPitch=THREE.MathUtils.clamp(targetPitch-dy*.0025,-1.15,1.15);
});
function stopLook(e){if(e.pointerId===lookPointer)lookPointer=null;}
for(const type of ["pointerup","pointercancel","lostpointercapture"])canvas.addEventListener(type,stopLook);
// Joystick tactile analogique indépendant de la caméra.
const joystick=$("joystick"),stick=$("joystickStick");
let joystickPointer=null,joyX=0,joyY=0;
function updateJoystick(e){
 const rect=joystick.getBoundingClientRect();
 const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
 const max=rect.width*.32;
 let x=(e.clientX-cx)/max,y=(e.clientY-cy)/max;
 const magnitude=Math.hypot(x,y);
 if(magnitude>1){x/=magnitude;y/=magnitude;}
 joyX=Math.abs(x)<.09?0:x;joyY=Math.abs(y)<.09?0:y;
 stick.style.transform="translate("+joyX*max+"px,"+joyY*max+"px)";
}
joystick.addEventListener("pointerdown",e=>{
 e.preventDefault();if(joystickPointer!==null)return;
 joystickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);updateJoystick(e);
});
joystick.addEventListener("pointermove",e=>{if(e.pointerId===joystickPointer){e.preventDefault();updateJoystick(e);}});
function resetJoystick(e){
 if(e.pointerId!==joystickPointer)return;
 joystickPointer=null;joyX=0;joyY=0;stick.style.transform="translate(0px,0px)";
}
for(const type of ["pointerup","pointercancel","lostpointercapture"])joystick.addEventListener(type,resetJoystick);
const keyMap={KeyW:"forward",KeyZ:"forward",ArrowUp:"forward",KeyS:"backward",ArrowDown:"backward",KeyA:"left",KeyQ:"left",ArrowLeft:"left",KeyD:"right",ArrowRight:"right"};
document.addEventListener("keydown",e=>{if(keyMap[e.code]){keys[keyMap[e.code]]=true;e.preventDefault();}});
document.addEventListener("keyup",e=>{if(keyMap[e.code])keys[keyMap[e.code]]=false;});
window.addEventListener("blur",()=>{Object.keys(keys).forEach(k=>keys[k]=false);lookPointer=null;joystickPointer=null;joyX=0;joyY=0;stick.style.transform="translate(0px,0px)";});
function blocked(x,z,r=.4){
 if(x< -9.45+r||x>15-r||z<(state.upgrades.store1?-21.45:-9.45)+r||z>13.8-r)return true;
 if(x>9.45&&x<10.55&&!(z>4.05&&z<6.95))return true;
 if(x>10.5&&(z<1.85||z>9.15))return true;
 return colliders.some(c=>!c.disabled&&(!c.requiresUpgrade||state.upgrades[c.requiresUpgrade])&&playerLevel()>=(c.level||1)&&x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ);
}
function movePlayer(dt){
 if(panel.style.display!=="none")return;
 const f=Number(keys.forward)-Number(keys.backward)-joyY,s=Number(keys.right)-Number(keys.left)+joyX;
 if(!f&&!s)return;
 const len=Math.max(1,Math.hypot(f,s)),speed=4*dt;
 const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)/len*speed;
 const dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)/len*speed;
 if(!blocked(camera.position.x+dx,camera.position.z))camera.position.x+=dx;
 if(!blocked(camera.position.x,camera.position.z+dz))camera.position.z+=dz;
}
// V0.5 — panier multi-produits, caisse manuelle et horaires 08h-20h
const customers=[],queue=[];let cashier=null,shopOpen=false,spawnTimer=0,dayTimer=0;
const MAX_CUSTOMERS=5,DAY_SECONDS=600,OPEN_HOUR=8,CLOSE_HOUR=20;
const timeLabel=document.createElement("div");
Object.assign(timeLabel.style,{position:"fixed",top:"80px",left:"12px",zIndex:"11",padding:"6px 10px",background:"#0f172acb",borderRadius:"8px",color:"white",fontSize:"12px",pointerEvents:"none"});
document.body.appendChild(timeLabel);
function updateTime(){updateLighting();timeLabel.textContent="Jour "+state.day+" — "+formatHour(state.hour)+" — "+(shopOpen?"OUVERT":"FERMÉ");}
function makeCustomer(){
 const group=new THREE.Group();
 const shirts=[0xef4444,0x2563eb,0x16a34a,0xf59e0b,0x9333ea];
 const shirt=new THREE.MeshStandardMaterial({color:shirts[Math.floor(Math.random()*shirts.length)]});
 const skin=new THREE.MeshStandardMaterial({color:0xd6a17c});
 const pants=new THREE.MeshStandardMaterial({color:0x334155});
 function part(w,h,d,mat,x,y,z){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);group.add(m);return m;
 }
 part(.5,.7,.3,shirt,0,1.25,0);part(.32,.32,.32,skin,0,1.78,0);
 const l=part(.18,.65,.2,pants,-.14,.48,0),r=part(.18,.65,.2,pants,.14,.48,0);
 part(.14,.65,.2,shirt,-.34,1.23,0);part(.14,.65,.2,shirt,.34,1.23,0);
 group.position.set(0,0,12.5);scene.add(group);
 const choices=[...unlockedProducts()].sort(()=>Math.random()-.5).slice(0,1+Math.floor(Math.random()*catalog.length));
 const route=[{x:0,z:8}];
 for(const p of choices){
  const aisleX=p.level?(p.x<0?-7.2:7.2):(p.x===5?2.5:p.x-2.5);
  const targetZ=p.level?p.z:-1.5;
  route.push({x:aisleX,z:8},{x:aisleX,z:targetZ,shop:p.id},{x:aisleX,z:8});
 }
 route.push({x:8.3,z:4.5},{x:5.2,z:4.5});
 customers.push({group,route,waypoint:0,phase:"shopping",timer:0,basket:{},prices:{},total:0,scanned:0,speed:1.2+Math.random()*.35,l,r,walkTime:0});
}
function walk(c,t,dt){
 const p=c.group.position,dx=t.x-p.x,dz=t.z-p.z,dist=Math.hypot(dx,dz);
 if(dist<.05){c.l.rotation.x=0;c.r.rotation.x=0;return true;}
 const step=Math.min(c.speed*dt,dist);p.x+=dx/dist*step;p.z+=dz/dist*step;
 c.group.rotation.y=Math.atan2(-dx,-dz);
 c.walkTime+=dt*9;c.l.rotation.x=Math.sin(c.walkTime)*.4;c.r.rotation.x=-Math.sin(c.walkTime)*.4;
 return step>=dist;
}
function removeCustomer(c){
 scene.remove(c.group);
 c.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});
 const i=customers.indexOf(c);if(i!==-1)customers.splice(i,1);
}
function updateCustomers(dt){
 for(const c of [...customers]){
  if(c.phase==="shopping"){
   const t=c.route[c.waypoint];
   if(!t){c.phase="queue";queue.push(c);continue;}
   if(walk(c,t,dt)){
    c.waypoint++;
    if(t.shop){c.phase="choosing";c.timer=1.5;c.productId=t.shop;}
    else if(c.waypoint>=c.route.length){c.phase="queue";queue.push(c);}
   }
  }else if(c.phase==="choosing"){
   c.timer-=dt;
   if(c.timer<=0){
    const a=state.inventory[c.productId];
    const quantity=Math.min(a.shelf,1+Math.floor(Math.random()*3));
    if(quantity>0){
     a.shelf-=quantity;c.basket[c.productId]=(c.basket[c.productId]||0)+quantity;
     c.prices[c.productId]=a.price;c.total+=quantity*a.price;sync();
    }
    c.phase="shopping";
   }
  }else if(c.phase==="queue"){
   const i=queue.indexOf(c);
   if(i===0&&!cashier){
    queue.shift();cashier=c;c.phase="checkout";c.scanned=0;
    toast("Client en caisse : utilise l’ordinateur");
   }else walk(c,{x:5.2-Math.max(0,i)*.7,z:4.5},dt);
  }else if(c.phase==="checkout"){
   walk(c,{x:5.2,z:4.5},dt);
  }else if(c.phase==="leaving"){
   if(walk(c,c.route[c.waypoint],dt)){
    c.waypoint++;if(c.waypoint>=c.route.length)removeCustomer(c);
   }
  }
 }
}
const openButton=$("openShop");
let dayStarted=false,closing=false;
function updateOpen(){
 openButton.textContent=shopOpen?"Fermer le magasin":closing?"Fermeture en cours":"Ouvrir le magasin";
 openButton.disabled=closing;
 updateTime();
}
openButton.addEventListener("click",()=>{
 if(paused){toast("Reprends la partie avant d’ouvrir le magasin");return;}
 if(closing){toast("Attends le départ des derniers clients");return;}
 if(shopOpen){
  shopOpen=false;updateOpen();toast("Fermé aux nouveaux clients");return;
 }
 if(state.hour>=CLOSE_HOUR){toast("Fermeture à 20 h");return;}
 dayStarted=true;shopOpen=true;spawnTimer=1;updateOpen();toast("Magasin ouvert");
});
function business(dt){
 // À 8 h, l'horloge reste arrêtée jusqu'à la première ouverture.
 if(!dayStarted){state.hour=OPEN_HOUR;dayTimer=0;updateTime();return;}
 // Horloge en pause dès que le magasin est fermé manuellement.
 if(!shopOpen&&!closing){updateTime();return;}
 if(!closing){
  dayTimer=Math.min(DAY_SECONDS,dayTimer+dt);
  state.hour=OPEN_HOUR+(dayTimer/DAY_SECONDS)*(CLOSE_HOUR-OPEN_HOUR);
  if(shopOpen&&state.hour<CLOSE_HOUR){
   spawnTimer-=dt;
   if(spawnTimer<=0&&customers.length<MAX_CUSTOMERS){
    makeCustomer();spawnTimer=7+Math.random()*5;
   }
  }
  if(dayTimer>=DAY_SECONDS){
   state.hour=CLOSE_HOUR;shopOpen=false;closing=true;
   updateOpen();toast("20 h : magasin fermé, fin des passages en caisse");
  }
 }
 // Les clients déjà présents terminent leurs achats et passent en caisse.
 if(closing&&customers.length===0&&queue.length===0&&!cashier){
  dayTimer=0;state.hour=OPEN_HOUR;state.day++;
  state.money-=DAILY_CHARGES;finance.charges+=DAILY_CHARGES;
  dayStarted=false;closing=false;shopOpen=false;spawnTimer=0;
  updateOpen();sync();
  toast("Jour "+state.day+" — 8 h : préparation libre, charges "+euro(DAILY_CHARGES));
 }
 updateTime();
}
window.addEventListener("resize",()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.05),smooth=1-Math.exp(-14*dt);
 yaw+=(targetYaw-yaw)*smooth;pitch+=(targetPitch-pitch)*smooth;
 camera.rotation.y=yaw;camera.rotation.x=pitch;
 if(!paused){movePlayer(dt);business(dt);updateCustomers(dt);}
 renderer.render(scene,camera);
}
sync();updateOpen();animate();toast("Business Empire Simulator V0.8.0 !");
