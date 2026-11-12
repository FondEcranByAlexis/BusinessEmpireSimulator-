import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";
import { LEVEL_REWARDS, LEVEL_PHASES, MAX_LEVEL, revenueThreshold, levelForRevenue } from "./progression.js?v=0.13.13";
import { EARLY_PRODUCTS, DEPARTMENTS, ANNEX_ENTRY, MALL_ROOM, MALL_GRID, MALL_MIN_Z, MALL_HALF_WIDTH, MALL_PLAZA_Z, departmentLocation } from "./departments.js?v=0.13.13";
// Business Empire Simulator V0.13.13 — version synchronisée
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
 {id:"eau",name:"Eau",cost:2,price:4,color:0x38bdf8,x:-5,z:-4,starter:true},
 {id:"pates",name:"Pâtes",cost:3,price:6,color:0xfacc15,x:0,z:-4,starter:true},
 {id:"savon",name:"Savon",cost:5,price:10,color:0x4ade80,x:5,z:-4,starter:true},
 {id:"lait",name:"Lait",cost:4,price:8,color:0xf8fafc,x:-5,z:1,starter:true},
 {id:"sucre",name:"Sucre",cost:3,price:7,color:0x93c5fd,x:0,z:1,starter:true},
 {id:"farine",name:"Farine",cost:3,price:7,color:0xfde68a,x:5,z:1,starter:true},
 {id:"riz",name:"Riz",cost:4,price:8,color:0xfde68a,x:-8.5,z:-7,level:2,kind:"sec"},
 {id:"conserves",name:"Conserves",cost:4,price:9,color:0xf97316,x:-8.9,z:5.9,level:2,kind:"wall",rotation:1},
 {id:"papier",name:"Papier toilette",cost:5,price:11,color:0xe2e8f0,x:-5.2,z:7.8,level:2,kind:"wall",rotation:2},
 {id:"biscuits",name:"Biscuits",cost:5,price:11,color:0xf59e0b,x:8.5,z:-7,level:3,kind:"sec"},
 {id:"fromage",name:"Fromage",cost:8,price:17,color:0xfef08a,x:-8.5,z:-3.5,level:4,kind:"froid"},
 {id:"surgeles",name:"Pizza surgelée",cost:9,price:20,color:0x60a5fa,x:8.5,z:-3.5,level:4,kind:"congelateur"},
 {id:"cereales",name:"Céréales",cost:6,price:13,color:0xc084fc,x:-8.5,z:0,level:5,kind:"sec"},
 {id:"pommes",name:"Pommes",cost:3,price:7,color:0xf87171,x:8.5,z:0,level:6,kind:"fruits"},
 {id:"cafe",name:"Café",cost:7,price:15,color:0x92400e,x:-5,z:-15,level:4,kind:"extension",license:"extensionLicense"},
 {id:"jus",name:"Jus de fruits",cost:4,price:9,color:0xfb923c,x:0,z:-15,level:4,kind:"extension",license:"extensionLicense"},
 {id:"chocolat",name:"Chocolat",cost:5,price:12,color:0x78350f,x:5,z:-15,level:4,kind:"extension",license:"extensionLicense"},
 {id:"the",name:"Thé",cost:4,price:9,color:0x65a30d,x:-7,z:-21.1,level:4,kind:"wall",rotation:0,license:"extensionLicense"},
 {id:"miel",name:"Miel",cost:6,price:12,color:0xd97706,x:7,z:-21.1,level:4,kind:"wall",rotation:0,license:"extensionLicense"},
 {id:"huile",name:"Huile d’olive",cost:7,price:14,color:0x84cc16,x:-9.15,z:-13.5,level:4,kind:"wall",rotation:1,license:"extensionLicense"},
 {id:"vinaigre",name:"Vinaigre",cost:3,price:7,color:0xa16207,x:9.15,z:-13.5,level:4,kind:"wall",rotation:-1,license:"extensionLicense"},
 {id:"lentilles",name:"Lentilles",cost:3,price:7,color:0xb45309,x:-9.15,z:-17,level:4,kind:"wall",rotation:1,license:"extensionLicense"},
 {id:"sel",name:"Sel",cost:2,price:5,color:0xa5b4fc,x:9.15,z:-17,level:4,kind:"wall",rotation:-1,license:"extensionLicense"},
 {id:"poivre",name:"Poivre",cost:3,price:7,color:0x52525b,x:-9.15,z:-20,level:4,kind:"wall",rotation:1,license:"extensionLicense"},
 {id:"chips",name:"Chips",cost:4,price:9,color:0xf59e0b,x:9.15,z:-20,level:4,kind:"wall",rotation:-1,license:"extensionLicense"},
 {id:"semoule",name:"Semoule",cost:3,price:7,color:0xeab308,x:-5,z:-19,level:4,kind:"wall",rotation:0,license:"extensionLicense"},
 {id:"graines",name:"Graines de tournesol",cost:4,price:9,color:0xc084fc,x:0,z:-19,level:4,kind:"wall",rotation:0,license:"extensionLicense"},
 {id:"sauce_tomate",name:"Sauce tomate",cost:4,price:8,color:0xef4444,x:5,z:-19,level:4,kind:"wall",rotation:0,license:"extensionLicense"},
 {id:"smartphones",name:"Téléphones",cost:65,price:125,color:0x2563eb,x:-8.9,z:-24.1,level:6,kind:"electronics",rotation:1,license:"phoneSkill",requiresShelf:"phones"},
 {id:"ecouteurs",name:"Écouteurs",cost:12,price:29,color:0x38bdf8,x:8.9,z:-24.1,level:5,kind:"electronics",rotation:-1,license:"store2"},
 {id:"casques",name:"Casques audio",cost:25,price:59,color:0xa78bfa,x:8.9,z:-27.1,level:5,kind:"electronics",rotation:-1,license:"store2"},
 {id:"ordinateurs",name:"Ordinateurs",cost:135,price:279,color:0x94a3b8,x:-6.7,z:-32.5,level:5,kind:"electronics",rotation:0,license:"store2"},
 {id:"drones",name:"Drones",cost:85,price:179,color:0x22c55e,x:6.7,z:-32.5,level:5,kind:"electronics",rotation:0,license:"store2"},
 {id:"tablettes",name:"Tablettes",cost:80,price:159,color:0x0891b2,x:-8.9,z:-27.1,level:5,kind:"electronics",rotation:1,license:"store2"},
 {id:"montres",name:"Montres connectées",cost:42,price:89,color:0xf472b6,x:-8.9,z:-30.1,level:5,kind:"electronics",rotation:1,license:"store2"},
 {id:"appareils_photo",name:"Appareils photo",cost:95,price:189,color:0x6366f1,x:4.5,z:-23.05,level:5,kind:"electronics",rotation:2,license:"store2"},
 {id:"enceintes",name:"Enceintes Bluetooth",cost:32,price:69,color:0xf97316,x:8.9,z:-30.1,level:5,kind:"electronics",rotation:-1,license:"store2"},
 {id:"claviers",name:"Claviers sans fil",cost:23,price:49,color:0xa3e635,x:-4.5,z:-23.05,level:5,kind:"electronics",rotation:2,license:"store2"}
];
const departmentColors=[0x0e7490,0xb45309,0x15803d,0x7c3aed,0xbe123c,0x0369a1];
for(const [id,name,cost,price,level,x,z,rotation] of EARLY_PRODUCTS){
 catalog.push({id,name,cost,price,level,x,z,rotation,color:departmentColors[level%departmentColors.length],kind:"wall",license:"extensionLicense"});
}
DEPARTMENTS.forEach((department,index)=>{
 department.id="annex"+(index+3);
 department.level=15+10*index;
 Object.assign(department,departmentLocation(index));
 department.cost=6000+index*4500;
 (department.licenses??[]).forEach((license,i)=>{department.licenses[i]={id:department.id+"License"+i,level:license[0],name:"Licence "+license[1],cost:license[2],requires:license[3],category:"licences",description:"Autorise les références du département "+department.name+"."};});
 department.products.forEach(([id,name,cost,price,license,level,storage],slot)=>{
  const permit=typeof license==="number"?department.licenses[license]:null;
  const side=slot%2===0?-1:1;
  catalog.push({id,name,cost,price,level:level??permit?.level??department.level,license:permit?.id??license,storage,
   x:department.x+side*3.55,z:department.front-1.35-Math.floor(slot/2)*1.6,rotation:-side,
   color:departmentColors[(index+slot)%departmentColors.length],kind:"department",department:department.id});
 });
});
const CAPACITY=30, BOX_UNITS=10;
// Six gondoles : une par produit de départ, 30 emplacements chacune.
function shelfCapacity(p){return CAPACITY;}
const upgradeCatalog=[
 {id:"handtruck",name:"Diable de manutention",level:1,cost:125,description:"Transporte jusqu’à 3 cartons du quai vers les trois zones de stockage."},
 {id:"reserve1",name:"Réserve agrandie I",level:3,cost:900,description:"Capacité de stockage : 30 à 60 cartons."},
 {id:"store1",name:"Extension du magasin I",level:4,cost:1800,description:"Agrandit le magasin et la réserve sèche : +40 places de stockage, jusqu’à 100 cartons après l’amélioration du niveau 3."},
 {id:"store2",name:"Extension Électronique II",level:5,cost:3000,requires:"store1",description:"Hall électronique avec neuf rayons disponibles dès l’ouverture et un emplacement pour les téléphones au niveau 6. Réserve électronique : 60 cartons. Réserve sèche : +60 cartons."},
 // L’identifiant de l’ancienne compétence conserve les achats des sauvegardes existantes.
 {id:"phoneSkill",name:"Licence Téléphonie",level:6,cost:1200,requires:"store2",category:"licences",description:"Autorise la vente de téléphones après l’installation du rayon dédié."},
 {id:"phones",name:"Rayon Téléphones",level:6,cost:2400,requires:["store2","phoneSkill"],category:"extensions",description:"Ouvre le rayon Téléphones dans le hall électronique."},
 {id:"gamingSkill",name:"Compétence Jeux vidéo",level:8,cost:1600,description:"Formation préalable à la vente de consoles."},
 {id:"consoles",name:"Rayon Consoles",level:10,cost:3500,requires:"gamingSkill",description:"Débloque la spécialisation consoles."},
 {id:"freshLicense",name:"Licence produits frais et surgelés",level:4,cost:650,description:"Autorise la vente de fromage et de pizzas surgelées."},
 {id:"fruitLicense",name:"Licence fruits et légumes",level:6,cost:450,description:"Autorise la vente de pommes et les futurs fruits."},
 {id:"extensionLicense",name:"Licence épicerie de l'extension",level:4,cost:800,requires:"store1",description:"Autorise les nouveaux rayons de l'extension : 14 références, dont le café, le jus de fruits et le chocolat."}
];
// Les capacités s'additionnent après achat. Le journal distingue les travaux
// livrés des services spécialisés qui restent prévus dans le programme.
DEPARTMENTS.forEach((department,index)=>{
 upgradeCatalog.push({id:department.id,name:"Extension "+(index+3)+" · "+department.name,level:department.level,cost:department.cost,
  requires:index===0?"store2":DEPARTMENTS[index-1].id,category:"extensions",construction:true,front:department.front,x:department.x,
  description:department.products.length?"Ouvre un département accessible depuis la place centrale.":"Ouvre un espace aménageable. Le service spécialisé est prévu dans le programme."});
 upgradeCatalog.push(...(department.licenses??[]));
});
LEVEL_REWARDS.forEach(([, , , stock, cold],index)=>{
 const level=index+1;
 if(level<=10)return;
 if(stock){
  const dry=Number(stock.match(/sec \+(\d+)/)?.[1]??0),electronics=Number(stock.match(/électronique \+(\d+)/)?.[1]??0);
  upgradeCatalog.push({id:"reserveLevel"+level,name:"Agrandissement de la réserve · niveau "+level,level,cost:dry*30+electronics*45,
   category:"stock",requires:"store2",capacity:{dry,electronics},description:stock});
 }
 if(cold){
  const size=Number(cold.match(/\+(\d+)/)?.[1]??0);
  upgradeCatalog.push({id:"coldLevel"+level,name:cold.split(" · ")[0],level,cost:size*65,
   category:"froid",requires:"freshLicense",capacity:{cold:size},description:cold});
 }
});
upgradeCatalog.push(
 {id:"pickupService",name:"Autorisation de retrait",level:102,cost:9500,category:"licences",description:"Active la préparation des commandes avec retrait."},
 {id:"tradeService",name:"Autorisation de vente pro",level:171,cost:22000,category:"licences",description:"Active les commandes professionnelles avec prix par volume après l’ouverture de l’espace pro."},
 {id:"deliveryService",name:"Autorisation de livraison locale",level:181,cost:26000,category:"licences",description:"Active les commandes à livrer après l’ouverture du centre d’expédition."}
);
const capacityUpgrades=upgradeCatalog.filter(u=>u.capacity);
const STORAGE_WINGS={
 dry:{minX:10,maxX:15.3,start:37.4,wall:0xe2e8f0,floor:0xb9c1c8},
 cold:{minX:20.65,maxX:24,start:17,wall:0xdbeafe,floor:0x9ccbdc},
 electronics:{minX:15.3,maxX:20.6,start:44,wall:0xdbeafe,floor:0xa8b9c9}
};
const STORAGE_BAY_DEPTH=4.4;
const storageWingGroups={dry:[],cold:[],electronics:[]};
const storageWingGates={};
function storageBayCount(kind){
 return capacityUpgrades.reduce((count,u)=>count+Number(!!u.capacity[kind]&&!!state.upgrades[u.id]),0);
}
function inStorageWing(kind,x,z){
 const wing=STORAGE_WINGS[kind];
 if(x<=wing.minX+.34||x>=wing.maxX-.34||z<=wing.start-.7)return false;
 const bays=storageBayCount(kind);
 return bays>0&&z<wing.start+bays*STORAGE_BAY_DEPTH-.25;
}
function playerLevel(){
 if(DEV_MODE&&Number.isFinite(state.devLevel))return Math.max(1,Math.min(MAX_LEVEL,Math.floor(state.devLevel)));
 return levelForRevenue(state.finance.revenue);
}
function nextLevelRevenue(){return revenueThreshold(playerLevel()+1);}
function nextLevelLabel(){
 const next=nextLevelRevenue();
 return next===null?"Niveau maximum atteint":"Niveau suivant à "+euro(next)+" de CA";
}
function activeCapacity(kind){
 return capacityUpgrades.reduce((total,u)=>total+(state.upgrades[u.id]?(u.capacity[kind]||0):0),0);
}
function reserveLimit(){return 30+(state.upgrades.reserve1?30:0)+(state.upgrades.store1?40:0)+(state.upgrades.store2?60:0)+activeCapacity("dry");}
function coldLimit(){return 20+activeCapacity("cold");}
function coldStorageProduct(p){return p.storage==="cold"||p.kind==="froid"||p.kind==="congelateur"||p.kind==="fruits";}
const STORAGE_NAMES={dry:"Réserve sèche",cold:"Chambre froide",electronics:"Réserve électronique"};
const STORAGE_KINDS=Object.keys(STORAGE_NAMES);
function storageKind(p){return p.storage??(p.kind==="electronics"?"electronics":coldStorageProduct(p)?"cold":"dry");}
function storageName(kind){return STORAGE_NAMES[kind];}
function storageLimit(kind){
 if(kind==="electronics")return state.upgrades.store2?60+activeCapacity("electronics"):0;
 return kind==="cold"?coldLimit():reserveLimit();
}
function storageBoxes(kind){
 return catalog.filter(p=>storageKind(p)===kind).reduce((n,p)=>n+state.inventory[p.id].boxes+
  Math.ceil(state.inventory[p.id].reserve/BOX_UNITS),0);
}
function reserveBoxes(){return storageBoxes("dry");}
const MAX_BOXES_PER_PRODUCT=5;
function productStoredUnits(p){const a=state.inventory[p.id];return a.boxes*BOX_UNITS+a.reserve;}
function stockAlert(p){
 const a=state.inventory[p.id],available=productStoredUnits(p)+a.shelf;
 return available===0?"RUPTURE":available<=stockThreshold(p)?"STOCK FAIBLE":"OK";
}
function canOrderBox(p){
 if(!p)return STORAGE_KINDS.some(kind=>storageBoxes(kind)<storageLimit(kind));
 const kind=storageKind(p);
 return storageBoxes(kind)<storageLimit(kind)&&state.inventory[p.id].boxes<MAX_BOXES_PER_PRODUCT;
}
function orderBlockReason(p){
 if(state.inventory[p.id].boxes>=MAX_BOXES_PER_PRODUCT)return "Maximum de 5 cartons de "+p.name+" atteint";
 if(storageBoxes(storageKind(p))>=storageLimit(storageKind(p)))return storageName(storageKind(p))+" pleine";
 return "";
}
function hasProductLicense(p){
 if(p.license)return !!state.upgrades[p.license];
 if(p.id==="fromage"||p.id==="surgeles")return !!state.upgrades.freshLicense;
 if(p.id==="pommes")return !!state.upgrades.fruitLicense;
 return true;
}
function productAvailable(p){return playerLevel()>=(p.level||1)&&hasProductLicense(p)&&(!p.department||state.upgrades[p.department])&&(p.kind!=="electronics"||!!state.upgrades.store2)&&
 (p.license!=="extensionLicense"||!!state.upgrades.store1)&&(!p.requiresShelf||!!state.upgrades[p.requiresShelf]);}
function unlockedProducts(){return catalog.filter(productAvailable);}
function unlockedShelves(){return 6+Math.max(0,playerLevel()-1)+(playerLevel()>=2?2:0);}
const CONSTRUCTION_DAYS=3;
const CONSTRUCTION_START_HOUR=8,CONSTRUCTION_END_HOUR=17;
const CONSTRUCTION_SHIFT_SECONDS=450; // 600 s pour 12 heures : 9 heures = 450 s
const CONSTRUCTION_PROGRESS_TOLERANCE=1e-9;
function constructionOnShift(){
 return !!state.construction&&!state.upgrades[state.construction.target||"store1"]&&
  state.hour>=CONSTRUCTION_START_HOUR&&state.hour<CONSTRUCTION_END_HOUR;
}
function constructionStage(){
 const p=state.construction?.progress??0;
 return p<1?"Jour 1 : préparation":p<2?"Jour 2 : gros œuvre":"Jour 3 : finitions";
}
function constructionPercent(){
 return Math.min(100,Math.floor((state.construction?.progress??0)/CONSTRUCTION_DAYS*100));
}
// Organisation du bureau des améliorations : navigation adaptée au téléphone.
const UPGRADE_TABS=[
 {id:"licences",label:"Licences"},
 {id:"extensions",label:"Extensions"},
 {id:"stock",label:"Stockage"},
 {id:"froid",label:"Chambre froide"},
 {id:"competences",label:"Compétences"},
 {id:"employes",label:"Employés"}
];
let activeUpgradeTab="licences";
function upgradeCategory(u){
 if(u.category)return u.category;
 if(u.id==="store1"||u.id==="store2")return "extensions";
 if(u.id==="reserve1"||u.id==="handtruck")return "stock";
 if(u.id==="freshLicense"||u.id==="fruitLicense"||u.id==="extensionLicense")return "licences";
 if(u.id.endsWith("Skill")||u.id==="consoles")return "competences";
 return "extensions";
}
function missingUpgradePrerequisites(upgrade){
 return [].concat(upgrade.requires??[]).filter(id=>!state.upgrades[id])
  .map(id=>upgradeCatalog.find(item=>item.id===id).name);
}
function showUpgrades(tab=activeUpgradeTab){
 activeUpgradeTab=UPGRADE_TABS.some(t=>t.id===tab)?tab:"licences";
 openPanel("Améliorations du magasin");
 paragraph("Niveau "+playerLevel()+" — CA cumulé : "+euro(finance.revenue)+" | "+nextLevelLabel());
 paragraph("Trésorerie : "+euro(state.money));
 const tabs=document.createElement("div");
 Object.assign(tabs.style,{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"6px",marginTop:"14px"});
 panel.appendChild(tabs);
 for(const t of UPGRADE_TABS){
  const b=document.createElement("button");b.textContent=t.label;
  Object.assign(b.style,{fontSize:"12px",fontWeight:"bold",padding:"10px 6px",
   borderRadius:"8px",color:"#fff",background:t.id===activeUpgradeTab?"#2563eb":"#334155",
   border:t.id===activeUpgradeTab?"1px solid #7dd3fc":"1px solid #475569",
   touchAction:"manipulation"});
  b.addEventListener("click",()=>showUpgrades(t.id));tabs.appendChild(b);
 }
 const note=document.createElement("p");
 Object.assign(note.style,{fontSize:"12px",color:"#94a3b8",lineHeight:"1.4",marginTop:"12px"});
 panel.appendChild(note);
 if(activeUpgradeTab==="stock"){
  note.textContent="Réserve sèche : capacité et transport des cartons.";
  paragraph("Stockage actuel : "+storageBoxes("dry")+"/"+reserveLimit()+" cartons.");
  paragraph("La première extension ajoute 40 places en réserve sèche. La zone Électronique en ajoute 60.");
  if(state.upgrades.store2)paragraph(storageName("electronics")+" : "+storageBoxes("electronics")+"/"+storageLimit("electronics")+" cartons.");
 }else if(activeUpgradeTab==="froid"){
  note.textContent="Zone frigorifique indépendante de la réserve sèche.";
  paragraph("Chambre froide : "+storageBoxes("cold")+"/"+coldLimit()+" cartons (10 produits par carton).");
  const products=catalog.filter(p=>coldStorageProduct(p)&&p.level<=playerLevel());
  if(products.length)paragraph("Références : "+products.map(p=>p.name).join(", ")+".");
  button(panel,"Consulter les stocks",showStocks);
 }else if(activeUpgradeTab==="extensions"){
  note.textContent=DEV_MODE?"Extensions et nouveaux rayons. En mode test, les extensions ouvrent dès l’achat.":"Extensions, nouveaux rayons et suivi des chantiers.";
  if(state.construction&&!state.upgrades[state.construction.target||"store1"]){
   paragraph("Chantier "+(state.construction.target==="store2"?"électronique":"magasin")+" : "+constructionPercent()+" % — "+constructionStage()+".");
   paragraph("Ouvriers de 8 h à 17 h, pendant trois journées de travail.");
  }
 }else if(activeUpgradeTab==="licences"){
  note.textContent="Licences commerciales : elles doivent être achetées pour vendre les produits concernés.";
 }else if(activeUpgradeTab==="competences"){
  note.textContent="Formations et nouveaux rayons spécialisés : acquiers les prérequis avant d'investir.";
 }else if(activeUpgradeTab==="employes"){
  note.textContent="Gestion des employés : embauche, planning et affectations.";
  paragraph("Manutentionnaire — "+(state.workerHired?"Recruté":"Non recruté")+".");
  button(panel,"Gérer "+state.workerName+" — manutention",showWorkerManagement);
  paragraph("Mise en rayon — "+(state.stockerHired?"Recruté":"Non recruté")+".");
  button(panel,"Gérer "+state.stockerName+" — mise en rayon",showStockerManagement);
  button(panel,"Planning du personnel",showWorkerPlanning);
  paragraph("D'autres postes pourront être ajoutés dans une future mise à jour.");
 }
 const upgrades=upgradeCatalog.filter(u=>upgradeCategory(u)===activeUpgradeTab).sort((a,b)=>a.level-b.level);
 const next=upgrades.find(u=>u.level>playerLevel());

 for(const u of upgrades.filter(u=>u.level<=playerLevel()||state.upgrades[u.id]||u===next)){
  const hasConstruction=!DEV_MODE&&(u.construction||u.id==="store1"||u.id==="store2");
  const owned=!!state.upgrades[u.id];
  const underway=!!state.construction&&(state.construction.target||"store1")===u.id&&!owned;
  paragraph(u.name+" — "+(owned?"ACQUIS":underway?"CHANTIER EN COURS":euro(u.cost))+" | Niveau "+u.level+" requis");
  paragraph(u.description);
  if(hasConstruction&&u.id==="store2"&&!owned&&!underway)paragraph("Chantier sur trois journées, de 8 h à 17 h.");
  if(underway){paragraph("Progression : "+constructionPercent()+" % — "+constructionStage());continue;}
  if(owned)continue;
  const prerequisites=missingUpgradePrerequisites(u);
  const eligible=playerLevel()>=u.level&&!prerequisites.length&&(!hasConstruction||!state.construction);
  if(prerequisites.length)paragraph("Prérequis · "+prerequisites.join(" et "));
  const b=button(panel,eligible?"Acheter — "+euro(u.cost):"Verrouillé — niveau "+u.level,()=>{
   if(!eligible||state.upgrades[u.id]||(hasConstruction&&state.construction))return;
   if(state.money<u.cost){toast("Trésorerie insuffisante");return;}
   state.money-=u.cost;
   if(hasConstruction){
    state.construction={progress:0,units:"days",target:u.id};
    sync();updateConstructionUI();showUpgrades(activeUpgradeTab);toast("Chantier lancé : les ouvriers arrivent !");
   }else{
    state.upgrades[u.id]=true;sync();showUpgrades(activeUpgradeTab);toast("Amélioration débloquée : "+u.name);
   }
  });
  b.disabled=!eligible;b.style.opacity=eligible?"1":".5";
 }
}

function initial(){
 const inventory={};
 catalog.forEach(p=>inventory[p.id]={shelf:(p.kind==="extension"||p.kind==="electronics"||p.kind==="department"||p.level>=11)?0:10,reserve:0,boxes:0,price:p.price});
 return {money:1000,day:1,sundayMode:'closed',trolleyCargo:[],workerEnabled:false,workerHired:false,workerWageDue:0,workerPaidTotal:0,workerDaysWorked:0,workerPayrollHistory:[],workerSchedule:[null,[8,17],[8,17],[8,17],[8,17],[8,17],[8,17]],workerLeaveDays:[],stockerName:"Camille",stockerHired:false,stockerEnabled:false,stockerSchedule:[null,[8,17],[8,17],[8,17],[8,17],[8,17],[8,17]],stockerLeaveDays:[],construction:null,stockerSentHomeDay:0,stockerWageDue:0,stockerPaidTotal:0,stockerDaysWorked:0,sales:0,satisfaction:80,inventory,finance:{revenue:0,supplies:0,charges:0,transactions:0},upgrades:{},hour:7};
}
function load(){
 const s=initial();
 try{
  const current=JSON.parse(localStorage.getItem(SAVE));
  if(current?.inventory){
   if(Number.isFinite(current.devLevel))s.devLevel=current.devLevel;
   for(const k of ["money","day","sales"])if(Number.isFinite(current[k])&&current[k]>=0)s[k]=current[k];
   if(Number.isFinite(current.satisfaction))s.satisfaction=Math.max(0,Math.min(100,Math.round(current.satisfaction)));
   if(Number.isInteger(current.lastNotifiedLevel)&&current.lastNotifiedLevel>=1&&current.progressionVersion===1)s.lastNotifiedLevel=Math.min(current.lastNotifiedLevel,MAX_LEVEL);
   if(typeof current.playerName==="string")s.playerName=current.playerName.slice(0,24);
   if(current.construction&&Number.isFinite(current.construction.progress)){
    // Anciennes sauvegardes V0.10.5 : l'avancement 0-90 s est migré.
    const progress=current.construction.units==="days"?current.construction.progress:current.construction.progress/90*CONSTRUCTION_DAYS;
    const requested=upgradeCatalog.find(u=>u.id===current.construction.target);
    const target=requested?.construction||requested?.id==="store2"?requested.id:"store1";
    if(!current.upgrades?.[target])s.construction={progress:Math.max(0,Math.min(CONSTRUCTION_DAYS,progress)),units:"days",target};
   }
   if(typeof current.workerName==="string")s.workerName=current.workerName.slice(0,24);
   if(typeof current.stockerName==="string")s.stockerName=current.stockerName.slice(0,24);
   for(const k of ["stockerHired","stockerEnabled"])if(typeof current[k]==="boolean")s[k]=current[k];
   for(const k of ["stockerSentHomeDay","stockerWageDue","stockerPaidTotal","stockerDaysWorked"])if(Number.isFinite(current[k])&&current[k]>=0)s[k]=current[k];
   if(Array.isArray(current.stockerSchedule)&&current.stockerSchedule.length===7)s.stockerSchedule=current.stockerSchedule.map(v=>Array.isArray(v)&&v.length===2&&Number.isInteger(v[0])&&Number.isInteger(v[1])&&v[0]>=8&&v[1]<=20&&v[1]>v[0]?v:null);
   if(Array.isArray(current.stockerLeaveDays))s.stockerLeaveDays=current.stockerLeaveDays.filter(Number.isInteger).slice(-60);
   if(Number.isInteger(current.workerSentHomeDay))s.workerSentHomeDay=current.workerSentHomeDay;
   if(typeof current.workerEnabled==="boolean")s.workerEnabled=current.workerEnabled;
   s.workerHired=typeof current.workerHired==="boolean"?current.workerHired:current.workerEnabled===true;
   for(const k of ["workerWageDue","workerPaidTotal","workerDaysWorked"])if(Number.isFinite(current[k])&&current[k]>=0)s[k]=current[k];
   if(Array.isArray(current.workerPayrollHistory))s.workerPayrollHistory=current.workerPayrollHistory.slice(-24);
   if(Array.isArray(current.workerSchedule)&&current.workerSchedule.length===7)s.workerSchedule=current.workerSchedule.map(v=>Array.isArray(v)&&v.length===2&&Number.isInteger(v[0])&&Number.isInteger(v[1])&&v[0]>=8&&v[1]<=20&&v[1]>v[0]?v:null);
   if(Array.isArray(current.workerLeaveDays))s.workerLeaveDays=current.workerLeaveDays.filter(Number.isInteger).slice(-60);
   if(Array.isArray(current.trolleyCargo))s.trolleyCargo=current.trolleyCargo.filter(it=>it&&catalog.some(p=>p.id===it.id)).slice(0,3).map(it=>({id:it.id}));
   if(["closed","morning"].includes(current.sundayMode))s.sundayMode=current.sundayMode;
   if(current.upgrades&&typeof current.upgrades==="object")for(const u of upgradeCatalog)s.upgrades[u.id]=current.upgrades[u.id]===true;
   if(current.finance)for(const k of Object.keys(s.finance))if(Number.isFinite(current.finance[k])&&current.finance[k]>=0)s.finance[k]=current.finance[k];
   if(Array.isArray(current.supplierOrders))s.supplierOrders=current.supplierOrders.filter(o=>o&&Array.isArray(o.items)&&Number.isFinite(o.due));
   if(Array.isArray(current.deliveryDock))s.deliveryDock=current.deliveryDock.filter(it=>it&&typeof it.id==="string"&&Number.isFinite(it.qty));
   if(current.management&&typeof current.management==="object")s.management=current.management;
   // Une session rechargée démarre en préparation à 07:00.
   s.hour=7;
   for(const p of catalog){
    const src=current.inventory[p.id]||{},dst=s.inventory[p.id];
    for(const k of ["shelf","reserve","boxes"])if(Number.isFinite(src[k]))dst[k]=Math.max(0,Math.floor(src[k]));
    // Le surplus d'une ancienne gondole double reste acquis et va en réserve.
    if(p.starter&&dst.shelf>CAPACITY){dst.reserve+=dst.shelf-CAPACITY;dst.shelf=CAPACITY;}
    if(Number.isFinite(src.price))dst.price=Math.max(1,Math.round(src.price));
   }
  }else{
   const old=DEV_MODE?null:JSON.parse(localStorage.getItem(LEGACY));
   if(old){
    for(const k of ["money","day","sales"])if(Number.isFinite(old[k])&&old[k]>=0)s[k]=old[k];
    const qty=Math.max(0,Math.floor(old.stock||0));
    catalog.filter(p=>(p.level||1)<11).forEach((p,i)=>{
     const count=Math.floor(qty/3)+(i<qty%3?1:0);
     s.inventory[p.id].shelf=Math.min(shelfCapacity(p),count);
     s.inventory[p.id].reserve=Math.max(0,count-shelfCapacity(p));
    });
   }
  }
 }catch(e){console.warn("Chargement sauvegarde",e);}
 return s;
}
const state=load();
// Un chantier déjà payé dans une ancienne sauvegarde de test est livré au chargement.
if(DEV_MODE&&state.construction){
 state.upgrades[state.construction.target]=true;
 state.construction=null;
}
// Les niveaux déjà acquis ne déclenchent aucune notification rétroactive.
if(!Number.isInteger(state.lastNotifiedLevel))state.lastNotifiedLevel=playerLevel();
state.progressionVersion=1;
state.management=state.management??{};
state.supplierOrders=Array.isArray(state.supplierOrders)?state.supplierOrders:[];
state.deliveryDock=Array.isArray(state.deliveryDock)?state.deliveryDock:[];
state.hour=7;
state.playerName=state.playerName||"Joueur";
state.workerName=state.workerName||"George";
state.workerSentHomeDay=Number.isInteger(state.workerSentHomeDay)?state.workerSentHomeDay:0;
const finance=state.finance;
function save(){try{localStorage.setItem(SAVE,JSON.stringify(state));}catch(e){console.warn(e);}}
function total(){return catalog.reduce((n,p)=>{const a=state.inventory[p.id];return n+a.shelf+a.reserve+a.boxes*BOX_UNITS;},0);}
// Une clientèle satisfaite revient plus souvent ; un plafond protège la fluidité mobile.
function customerTraffic(){
 const rating=Math.max(0,Math.min(100,Number(state.satisfaction??80)));
 if(rating>=85)return {label:"Très élevée",min:5,max:8};
 if(rating>=70)return {label:"Élevée",min:7,max:12};
 if(rating>=40)return {label:"Modérée",min:11,max:17};
 return {label:"Faible",min:16,max:24};
}
function nextCustomerDelay(){
 const traffic=customerTraffic();
 return traffic.min+Math.random()*(traffic.max-traffic.min);
}
function updateSatisfactionDisplay(){
 const rating=Math.max(0,Math.min(100,Math.round(state.satisfaction??80)));
 const fill=$("satisfactionFill"),value=$("satisfactionValue"),status=$("satisfactionStatus"),trafficLabel=$("trafficStatus");
 if(!fill||!value||!status)return;
 const color=rating>=70?"#22c55e":rating>=40?"#f59e0b":"#ef4444";
 fill.style.width=rating+"%";fill.style.background=color;
 value.textContent=rating+" %";value.style.color=color;
 status.textContent=rating>=85?"Excellente":rating>=70?"Bonne":rating>=40?"À améliorer":"Insatisfaits";
 if(trafficLabel)trafficLabel.textContent="Affluence : "+customerTraffic().label;
}
function changeSatisfaction(amount){
 const old=state.satisfaction??80;
 state.satisfaction=Math.max(0,Math.min(100,Math.round(old+amount)));
 if(state.satisfaction!==old){updateSatisfactionDisplay();save();}
}
function hud(){
 updateSatisfactionDisplay();
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
 releaseMouseLook();
 panel.replaceChildren();
 const h=document.createElement("h2");h.textContent=title;h.style.fontSize="18px";panel.appendChild(h);
 button(panel,"Fermer",()=>panel.style.display="none");
 panel.style.display="block";
}
function paragraph(t){
 const p=document.createElement("p");p.textContent=t;p.style.marginTop="12px";p.style.fontSize="13px";panel.appendChild(p);
}
// V0.10.8 — nouvelles possibilités annoncées une fois par niveau gagné.
const levelModal=document.createElement("div");
Object.assign(levelModal.style,{position:"fixed",inset:"0",zIndex:"110",display:"none",
 alignItems:"center",justifyContent:"center",padding:"12px",background:"rgba(0,0,0,.76)",
 color:"#fff",touchAction:"pan-y"});
const levelModalCard=document.createElement("section");
Object.assign(levelModalCard.style,{width:"min(94vw,460px)",maxHeight:"88dvh",
 overflowY:"auto",padding:"16px",borderRadius:"15px",border:"2px solid #fbbf24",
 background:"#0f172a",boxShadow:"0 12px 40px #0009"});
levelModal.appendChild(levelModalCard);document.body.appendChild(levelModal);
function implementedMilestone(level){
 return [1,2,3,4,5,6,7,8,9,11,14,16,18,19,20,24,25,31,49,59,66,72,77,86,88,94,104,109,110,112,138,154,172,174,179,199,200].includes(level);
}
function milestoneEntries(level){
 const entries=LEVEL_REWARDS[level-1];
 return entries.map((description,index)=>{
  if(!description)return "";
  if(level<=10&&index>0)return description;
  if(index===0)return (implementedMilestone(level)?"":"Programme · ")+description.replace(/^Proposition · /,"");
  const categories=["","licences","extensions","stock","froid"];
  const offers=upgradeCatalog.filter(u=>u.level===level&&upgradeCategory(u)===categories[index]);
  return offers.length?offers.map(u=>u.name+" ("+euro(u.cost)+")").join(" · "):(level===1?"":"Programme · ")+description;
 }).filter(Boolean);
}
function showProgression(first){
 if(!Number.isInteger(first)||first<1||first>MAX_LEVEL)first=Math.floor((playerLevel()-1)/10)*10+1;
 const last=Math.min(MAX_LEVEL,first+9);
 openPanel("Progression · niveaux "+first+" à "+last);
 paragraph("Niveau "+playerLevel()+" · "+euro(finance.revenue)+" de CA encaissé");
 paragraph("Les entrées marquées « Programme » décrivent des fonctionnalités prévues.");
 const select=document.createElement("select");
 select.setAttribute("aria-label","Tranche de niveaux");
 const ranges=[[1,10,"Démarrage"],...LEVEL_PHASES];
 for(const [start,end,name] of ranges){
  const option=document.createElement("option");
  option.value=start;option.textContent=start+"–"+end+" · "+name;option.selected=start===first;
  select.appendChild(option);
 }
 select.addEventListener("change",()=>showProgression(Number(select.value)));
 panel.appendChild(select);
 for(let level=first;level<=last;level++){
  const group=document.createElement("details");
  const title=document.createElement("summary");
  title.textContent=(level<=playerLevel()?"✓ ":"")+"Niveau "+level+" · "+euro(revenueThreshold(level));
  group.open=level===playerLevel();
  group.appendChild(title);
  for(const description of milestoneEntries(level)){
   const line=document.createElement("p");line.textContent=description;group.appendChild(line);
  }
  group.style.marginTop="12px";panel.appendChild(group);
 }
}
const pendingLevelNotices=[];
let levelModalShowing=false;
function closeLevelNotice(){
 levelModal.style.display="none";levelModalShowing=false;
 if(pendingLevelNotices.length)showNextLevelNotice();
}
function showNextLevelNotice(){
 if(levelModalShowing||!pendingLevelNotices.length)return;
 const level=pendingLevelNotices.shift();
 releaseMouseLook();
 levelModalShowing=true;levelModal.style.display="flex";levelModalCard.replaceChildren();
 const heading=document.createElement("h2");
 heading.textContent="NIVEAU "+level+" ATTEINT !";
 Object.assign(heading.style,{textAlign:"center",fontSize:"23px",color:"#fbbf24",marginBottom:"9px"});
 levelModalCard.appendChild(heading);
 const intro=document.createElement("p");
 intro.textContent="Bravo ! Voici les nouvelles possibilités de ton supermarché.";
 Object.assign(intro.style,{fontSize:"13px",color:"#cbd5e1",textAlign:"center",marginBottom:"14px"});
 levelModalCard.appendChild(intro);
 function section(title,entries){
  if(!entries.length)return;
  const h=document.createElement("h3");h.textContent=title;
  Object.assign(h.style,{color:"#7dd3fc",fontSize:"14px",margin:"13px 0 7px"});
  levelModalCard.appendChild(h);
  for(const line of entries){
   const p=document.createElement("p");p.textContent="• "+line;
   Object.assign(p.style,{fontSize:"13px",lineHeight:"1.45",margin:"6px 0"});
   levelModalCard.appendChild(p);
  }
 }
 const newProducts=catalog.filter(p=>(p.level||1)===level);
 section("NOUVEAUX PRODUITS",newProducts.map(p=>{
  const required=p.license||(["fromage","surgeles"].includes(p.id)?"freshLicense":p.id==="pommes"?"fruitLicense":null);
  const prerequisites=[required,p.requiresShelf,p.department].filter(id=>id&&!state.upgrades[id]).map(id=>upgradeCatalog.find(u=>u.id===id)?.name).filter(Boolean);
  return p.name+(prerequisites.length?" — nécessite : "+prerequisites.join(" et "):" — disponible");
 }));
 const newUpgrades=upgradeCatalog.filter(u=>u.level===level);
 section("AMÉLIORATIONS ET COMPÉTENCES",newUpgrades.map(u=>{
  const prerequisites=missingUpgradePrerequisites(u);
  const restriction=prerequisites.length?" — nécessite d’abord : "+prerequisites.join(" et "):"";
  return u.name+" ("+euro(u.cost)+")"+restriction+(state.upgrades[u.id]?" — déjà acquis":"");
 }));
 const milestone=LEVEL_REWARDS[level-1]?.[0];
 if(milestone)section(implementedMilestone(level)?"DÉBLOCAGE":"PROGRAMME",[milestone.replace(/^Proposition · /,"")]);
 const cont=button(levelModalCard,"Continuer à jouer",closeLevelNotice);
 cont.style.background="#16a34a";
 button(levelModalCard,"Voir les améliorations",()=>{closeLevelNotice();showUpgrades();});
}
function checkLevelUp(){
 const current=playerLevel();
 const previous=state.lastNotifiedLevel||1;
 if(current<=previous)return;
 pendingLevelNotices.push(current);
 state.lastNotifiedLevel=current;save();
 showNextLevelNotice();
}
// Panier fournisseurs : paiement groupé, délai normal 30 s ou express 5 s.
const supplierCart={};
function pendingBoxes(id){
 return state.supplierOrders.reduce((n,o)=>n+o.items.reduce((m,it)=>m+(it.id===id?it.qty:0),0),0)
  +state.deliveryDock.filter(it=>it.id===id).length+state.trolleyCargo.filter(it=>it.id===id).length
  +Number(workerCargo?.id===id)+Number(held?.source==="delivery"&&held.id===id);
}
function pendingTotal(kind){
 return state.supplierOrders.reduce((n,o)=>n+o.items.reduce((m,it)=>{
  const p=catalog.find(p=>p.id===it.id);
  return m+(p&&(!kind||storageKind(p)===kind)?it.qty:0);
 },0),0)+state.deliveryDock.filter(it=>{
  const p=catalog.find(p=>p.id===it.id);return p&&(!kind||storageKind(p)===kind);
 }).length+state.trolleyCargo.filter(it=>{
  const p=catalog.find(p=>p.id===it.id);return p&&(!kind||storageKind(p)===kind);
 }).length+(held?.source==="delivery"&&(!kind||storageKind(catalog.find(p=>p.id===held.id))===kind)?1:0)
 +Number(!!workerCargo&&(!kind||storageKind(catalog.find(p=>p.id===workerCargo.id))===kind));
}
function cartCount(kind){
 return Object.entries(supplierCart).reduce((n,[id,qty])=>{
  const p=catalog.find(p=>p.id===id);return n+(p&&(!kind||storageKind(p)===kind)?qty:0);
 },0);
}
function cartSubtotal(){return catalog.reduce((n,p)=>n+(supplierCart[p.id]||0)*p.cost*BOX_UNITS,0);}
function cartCapacity(kind){return Math.max(0,storageLimit(kind)-storageBoxes(kind)-pendingTotal(kind));}
function stockCapacityStatus(kind,includeCart=true){
 const limit=storageLimit(kind),stored=storageBoxes(kind),incoming=pendingTotal(kind),cart=includeCart?cartCount(kind):0;
 const used=stored+incoming+cart,free=Math.max(0,limit-used);
 const full=free===0,nearFull=!full&&free<=Math.max(2,Math.ceil(limit*.15));
 return {kind,limit,stored,incoming,cart,used,free,
  status:full?"STOCK COMPLET":nearFull?"PRESQUE PLEIN":"DISPONIBLE",
  color:full?"#ef4444":nearFull?"#f59e0b":"#22c55e"};
}
function renderStockCapacity(parent,includeCart=true){
 const result={};
 for(const kind of STORAGE_KINDS){
  if(!storageLimit(kind))continue;
  const data=stockCapacityStatus(kind,includeCart);result[kind]=data;
  const container=document.createElement("section");
  Object.assign(container.style,{padding:"12px",borderRadius:"11px",background:"#142336",border:"1px solid "+data.color,margin:"12px 0",color:"#fff"});
  const header=document.createElement("div");
  Object.assign(header.style,{display:"flex",gap:"10px",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",fontWeight:"bold"});
  const title=document.createElement("span");title.textContent=storageName(kind).toUpperCase();
  const status=document.createElement("span");status.textContent=data.status;status.style.color=data.color;
  header.append(title,status);container.appendChild(header);
  const summary=document.createElement("p");
  summary.textContent=data.used+" / "+data.limit+" cartons réservés — "+data.free+" place(s) restante(s)";
  Object.assign(summary.style,{fontSize:"13px",margin:"10px 0 6px"});container.appendChild(summary);
  const bar=document.createElement("div");
  Object.assign(bar.style,{width:"100%",height:"12px",background:"#334155",borderRadius:"9px",overflow:"hidden"});
  const filled=document.createElement("div");
  Object.assign(filled.style,{height:"100%",width:Math.min(100,data.used/data.limit*100)+"%",background:data.color,transition:"width .2s ease"});
  bar.appendChild(filled);container.appendChild(bar);
  const details=document.createElement("p");
  details.textContent="Stocké : "+data.stored+" · À livrer / en transport : "+data.incoming+(includeCart?" · Panier : "+data.cart:"");
  Object.assign(details.style,{fontSize:"12px",margin:"8px 0 0",color:"#cbd5e1"});container.appendChild(details);
  if(data.free===0){
   const warning=document.createElement("p");
   warning.textContent=storageName(kind)+" pleine : impossible d'y ajouter de nouveaux cartons. Les autres zones restent accessibles.";
   Object.assign(warning.style,{fontSize:"12px",fontWeight:"bold",color:"#fca5a5",margin:"8px 0 0"});
   container.appendChild(warning);
  }
  parent.appendChild(container);
 }
 return result;
}
function addSupplierItem(p){
 const count=state.inventory[p.id].boxes+pendingBoxes(p.id)+(supplierCart[p.id]||0);
 if(count>=MAX_BOXES_PER_PRODUCT){toast("Maximum de 5 cartons, commandes en attente incluses");return;}
 const kind=storageKind(p);
 if(cartCount(kind)>=cartCapacity(kind)){toast(storageName(kind)+" pleine — pas de nouvelle commande possible");return;}
 supplierCart[p.id]=(supplierCart[p.id]||0)+1;showOrders();
}
function processSupplierOrders(){
 let changed=false;
 for(const order of state.supplierOrders.slice()){
  if(Date.now()<order.due)continue;
  for(const it of order.items){
   const p=catalog.find(p=>p.id===it.id);
   if(!p)continue;
   for(let n=0;n<it.qty;n++)state.deliveryDock.push({id:it.id,qty:BOX_UNITS});
  }
  state.supplierOrders.splice(state.supplierOrders.indexOf(order),1);
  changed=true;
 }
 if(changed){sync();refreshDeliveryDock();toast("Camion arrivé ! Récupère les cartons à la zone livraison.");}
}
setInterval(processSupplierOrders,1000);
function checkoutSupplier(express){
 const items=Object.entries(supplierCart).filter(([id,q])=>q>0&&catalog.some(p=>p.id===id)).map(([id,qty])=>({id,qty}));
 if(!items.length){toast("Ton panier est vide");return;}
 for(const it of items){
  const p=catalog.find(p=>p.id===it.id);
  if(state.inventory[it.id].boxes+pendingBoxes(it.id)+it.qty>MAX_BOXES_PER_PRODUCT){toast("Limite atteinte : "+p.name);return;}
 }
 for(const kind of STORAGE_KINDS){
  const count=items.reduce((n,it)=>{const p=catalog.find(p=>p.id===it.id);return n+(p&&storageKind(p)===kind?it.qty:0);},0);
  if(count>cartCapacity(kind)){toast(storageName(kind)+" pleine — commande refusée");return;}
 }
 const subtotal=cartSubtotal(),fee=express?Math.round(subtotal*20)/100:0,totalCost=subtotal+fee;
 if(state.money<totalCost){toast("Trésorerie insuffisante : "+euro(totalCost));return;}
 state.money-=totalCost;finance.supplies+=totalCost;
 state.supplierOrders.push({items,due:Date.now()+(express?5000:30000),express,paid:totalCost});
 for(const k of Object.keys(supplierCart))delete supplierCart[k];
 sync();showOrders();toast("Commande payée — livraison dans "+(express?5:30)+" secondes");
}
function showOrders(){
 processSupplierOrders();
 openPanel("FOURNISSEURS — Mon panier");
 const capacity=renderStockCapacity(panel);
 paragraph("Chaque zone possède sa capacité indépendante. Limite : 5 cartons par produit, commandes en attente comprises.");
 if(Object.values(capacity).some(zone=>zone.free===0))paragraph("Tu peux commander pour les zones qui ont encore de la place.");
 for(const p of unlockedProducts()){
  const a=state.inventory[p.id],qty=supplierCart[p.id]||0,pending=pendingBoxes(p.id);
  const perProductRemaining=MAX_BOXES_PER_PRODUCT-a.boxes-pending-qty;
  const kind=storageKind(p);
  const productStatus=perProductRemaining<=0?"PLEIN":perProductRemaining===1?"DERNIÈRE PLACE":"Disponible";
  paragraph(p.name+" ("+storageName(kind)+") — "+productStatus+" | "+a.boxes+"/5 stockés | "+pending+" à livrer | Panier : "+qty+" | "+euro(p.cost*BOX_UNITS)+"/carton");
  const add=button(panel,"+ Ajouter 1 carton de "+p.name,()=>addSupplierItem(p));
  add.disabled=a.boxes+pending+qty>=MAX_BOXES_PER_PRODUCT||cartCapacity(kind)<=cartCount(kind);
  if(add.disabled)add.style.opacity=".45";
  if(qty)button(panel,"− Retirer 1 carton de "+p.name,()=>{supplierCart[p.id]--;if(!supplierCart[p.id])delete supplierCart[p.id];showOrders();});
 }
 paragraph("SOUS-TOTAL : "+euro(cartSubtotal())+" — "+cartCount()+" carton(s)");
 if(cartCount()){
  button(panel,"PAYER — Normale 30 s : "+euro(cartSubtotal()),()=>checkoutSupplier(false));
  button(panel,"PAYER — Express 5 s (+20 %) : "+euro(Math.round(cartSubtotal()*120)/100),()=>checkoutSupplier(true));
 }
 if(state.deliveryDock.length)paragraph("CAMION À DÉCHARGER : "+state.deliveryDock.length+" carton(s) — quai de déchargement à l’arrière du supermarché.");
 if(state.supplierOrders.length){
  paragraph("LIVRAISONS EN COURS");
  for(const o of state.supplierOrders){
   paragraph((o.express?"Express":"Normale")+" — "+o.items.reduce((n,it)=>n+it.qty,0)+" carton(s) — "+Math.max(0,Math.ceil((o.due-Date.now())/1000))+" s restantes");
  }
  button(panel,"Actualiser le suivi",showOrders);
 }
}
function showStocks(){
 openPanel("Stocks");
 renderStockCapacity(panel,false);
 unlockedProducts().forEach(p=>{
  const a=state.inventory[p.id];
  paragraph(p.name+" — "+stockAlert(p)+" | Rayon "+a.shelf+"/"+shelfCapacity(p)+" | "+storageName(storageKind(p))+" : "+a.boxes+"/5 cartons + "+a.reserve+" en vrac | "+a.price+" €");
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
 if(playerLevel()===MAX_LEVEL)paragraph("Statut · Hypermarché phare");
 paragraph("Chiffre d’affaires encaissé : "+euro(finance.revenue));
 paragraph(nextLevelLabel());
 button(panel,"Progression des niveaux",showProgression);
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
function showTestReset(){
 openPanel("Repartir au niveau 1 en mode test");
 paragraph("Tu recommences au jour 1 avec 1 000 €, le stock de départ et aucune amélioration. Les niveaux se débloquent au fil de tes ventes.");
 button(panel,"Confirmer la réinitialisation du test",()=>{
  if(!DEV_MODE)return;
  try{
   localStorage.setItem(DEV_SAVE,JSON.stringify(initial()));
  }catch(e){
   console.warn("Réinitialisation du test",e);
   toast("Impossible d’enregistrer la nouvelle partie de test.");
   return;
  }
  location.reload();
 });
 button(panel,"Annuler",showDevTools);
}
function showDevTools(){
 openPanel("FBA GAMES — MODE TEST");
 paragraph("Sauvegarde de test indépendante. Ces commandes ne modifient pas ta partie normale.");
 paragraph("Niveau de test : "+playerLevel()+" | Argent : "+euro(state.money));
 paragraph(Number.isFinite(state.devLevel)?"Progression manuelle":"Progression par chiffre d’affaires");
 const selector=inputNumber("Choisis un niveau entre 1 et "+MAX_LEVEL,playerLevel(),1,MAX_LEVEL);
 button(panel,"Appliquer le niveau",()=>{
  const level=Number(selector.value);
  if(!Number.isInteger(level)||level<1||level>MAX_LEVEL){toast("Saisis un niveau de 1 à "+MAX_LEVEL);return;}
  state.devLevel=level;state.lastNotifiedLevel=level;sync();showDevTools();toast("Niveau de test : "+level);
 });
 if(Number.isFinite(state.devLevel))button(panel,"Reprendre la progression par les ventes",()=>{
  delete state.devLevel;
  state.lastNotifiedLevel=playerLevel();sync();showDevTools();
 });
 button(panel,"Ajouter 100 000 €",()=>{state.money+=100000;sync();showDevTools();});
 button(panel,"Débloquer toutes les améliorations existantes",()=>{
  for(const u of upgradeCatalog)state.upgrades[u.id]=true;
  sync();showDevTools();toast("Améliorations de test activées");
 });
 button(panel,"Remplir tous les rayons débloqués",()=>{
  for(const p of unlockedProducts())state.inventory[p.id].shelf=shelfCapacity(p);
  sync();showDevTools();
 });
 button(panel,"Réinitialiser le mode test",showTestReset);
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
 button(panel,"Paramètres",showSettings);
 button(panel,"Profil",showProfile);
 button(panel,"Progression des niveaux",showProgression);
 if(openDepartmentCount())button(panel,"Plan de la galerie",showMallMap);
 if(camera.position.z<ANNEX_ENTRY-1)button(panel,"Retour à la caisse",()=>{
  if(held){toast("Dépose le carton avant de revenir");return;}
  camera.position.set(5.4,1.7,7.5);panel.style.display="none";
 });
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
 paragraph("Bénéfice net simplifié : "+euro(finance.revenue-finance.supplies-finance.charges-state.workerPaidTotal-state.stockerPaidTotal));
 paragraph("Transactions : "+finance.transactions+" | Articles vendus : "+state.sales);
 paragraph("Charges journalières : loyer "+euro(RENTS)+", électricité "+euro(ELECTRICITY)+", autres "+euro(OTHER_CHARGES)+".");
 paragraph("Salaires versés : "+euro(state.workerPaidTotal+state.stockerPaidTotal)+" | Salaires dus : "+euro(state.workerWageDue+state.stockerWageDue));
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
 renderStockCapacity(panel);
 button(panel,"Caisse — paiements",showCheckout);
 if(activeRegisters().length)button(panel,"Caisses supplémentaires",showAuxiliaryRegisters);
 button(panel,"Fournisseurs — commander des cartons",showComputerOrders);
 button(panel,"Stocks du magasin",showStocks);
 button(panel,"Bilan financier",showFinance);
 button(panel,"Améliorations",showUpgrades);
 button(panel,"Progression des niveaux",showProgression);
 if(openDepartmentCount())button(panel,"Accès aux départements",showDepartmentTravel);
 if(playerLevel()>=7)button(panel,"Gestion commerciale",showCommercialManagement);
 if(playerLevel()>=24)button(panel,"Fournil et boulanger",showBakery);
 if(playerLevel()>=40)button(panel,"Commandes des clients",showOrderServices);
 button(panel,"Calendrier et horaires",showCalendar);
 button(panel,"Personnaliser les prénoms",showNames);
 button(panel,"État de l’équipe — présence et tâches",showEmployeeOverview);
 button(panel,"Personnel — manutentionnaire",showWorkerManagement);
 button(panel,"Personnel — mise en rayon",showStockerManagement);
 button(panel,"Planning des employés",showWorkerPlanning);
}
function showDepartmentTravel(){
 openPanel("Accès aux départements");
 for(const department of DEPARTMENTS.filter(item=>state.upgrades[item.id])){
  button(panel,department.name,()=>{
   if(seatedAtCheckout||held){toast("Libère tes mains et relève-toi avant le déplacement");return;}
   camera.position.set(department.x,1.7,department.front+.9);
   yaw=targetYaw=0;pitch=targetPitch=0;
   panel.style.display="none";
  });
 }
}
function showMallMap(){
 openPanel("Plan de la galerie");
 paragraph("Entrée depuis l’électronique en haut du plan. Les allées relient toutes les rangées.");
 const grid=document.createElement("div");
 Object.assign(grid.style,{display:"grid",gridTemplateColumns:"repeat(5,minmax(0,1fr))",gap:"4px",marginTop:"12px"});
 panel.appendChild(grid);
 for(let row=0;row<5;row++){
  for(let column=-2;column<=2;column++){
   const department=DEPARTMENTS.find(item=>item.row===row&&item.column===column);
   const open=department&&state.upgrades[department.id];
   const here=camera.position.z<ANNEX_ENTRY&&Math.round(camera.position.x/MALL_GRID)===column&&
    Math.floor((ANNEX_ENTRY-camera.position.z)/MALL_GRID)===row;
   const cell=document.createElement("div");
   cell.textContent=department?department.name:row===0?"Entrée":row===2&&column===0?"Place centrale":"Allée";
   if(here)cell.textContent+=" · Vous êtes ici";
   Object.assign(cell.style,{padding:"5px",fontSize:"10px",overflowWrap:"anywhere",borderRadius:"5px",
    background:open?"#155e75":department?"#27354a":"#164e46",border:here?"2px solid #fbbf24":"1px solid #465a70"});
   if(department&&!open)cell.textContent+=" · N"+department.level;
   grid.appendChild(cell);
  }
 }
}
function inputNumber(label,value,min,max){
 const wrapper=document.createElement("label");
 wrapper.textContent=label;
 wrapper.style.display="block";
 const input=document.createElement("input");
 input.type="number";input.min=min;input.max=max;input.step=1;input.value=value;
 input.style.cssText="display:block;width:100%;padding:8px;margin:5px 0 12px;box-sizing:border-box";
 wrapper.appendChild(input);panel.appendChild(wrapper);
 return input;
}
const BAKERY_ID="annex4";
const BAKER_WAGE=60;
const BAKERY_RECIPES=[
 {id:"pain",name:"Pains",hour:8,ingredients:{farine:1}},
 {id:"viennoiseries",name:"Viennoiseries",hour:13,ingredients:{farine:1,sucre:1,lait:1}}
];
function bakeryState(){
 return state.management.bakery??={enabled:true,plan:{},lastBake:{},paidDay:0,batch:null};
}
function bakerOnDuty(){
 return !!state.upgrades[BAKERY_ID]&&state.hour>=8&&state.hour<17&&(state.hour<12||state.hour>=13)&&!(isSunday()&&state.sundayMode==="closed")&&state.hour<closingHour();
}
function bakeryPlan(recipe){
 return bakeryState().plan[recipe.id]??{hour:recipe.hour,quantity:10};
}
function bakeryStatus(){
 if(!state.upgrades[BAKERY_ID])return "Recrutement automatique à l’ouverture de la boulangerie, niveau 25.";
 const bakery=bakeryState();
 if(bakery.batch){
  const product=BAKERY_RECIPES.find(recipe=>recipe.id===bakery.batch.id)?.name;
  return product+" · "+bakery.batch.quantity+" en préparation ou en attente de place en rayon.";
 }
 if(!bakery.enabled)return "Fournées automatiques en pause.";
 if(!bakerOnDuty())return "Hors service. Horaires de 8 h à 17 h, pause de midi à 13 h.";
 return "En service · le boulanger prépare les fournées prévues.";
}
function showBakery(){
 openPanel("Fournil et boulanger");
 paragraph(bakeryStatus());
 paragraph("Salaire de "+euro(BAKER_WAGE)+" le jour où la première fournée démarre. Les ingrédients sont prélevés en réserve.");
 const bakery=bakeryState();
 for(const recipe of BAKERY_RECIPES){
  const rule=bakeryPlan(recipe);
  paragraph(recipe.name+" · "+rule.quantity+" à "+rule.hour+" h · "+Object.entries(recipe.ingredients).map(([id,amount])=>{
   const product=catalog.find(p=>p.id===id);
   return amount+" "+product.name+" pour 5 pièces ("+productStoredUnits(product)+" en réserve)";
  }).join(" · "));
  button(panel,"Régler la fournée · "+recipe.name,()=>editBakeryPlan(recipe));
 }
 const enabled=button(panel,bakery.enabled?"Suspendre les fournées":"Reprendre les fournées",()=>{
  bakery.enabled=!bakery.enabled;save();showBakery();
 });
 enabled.disabled=!state.upgrades[BAKERY_ID];
}
function editBakeryPlan(recipe){
 openPanel("Planning · "+recipe.name);
 const rule=bakeryPlan(recipe);
 const hour=inputNumber("Heure de départ",rule.hour,8,16);
 const quantity=inputNumber("Quantité, par multiples de 5",rule.quantity,5,20);
 button(panel,"Enregistrer la fournée",()=>{
  const h=Number(hour.value),q=Number(quantity.value);
  if(!Number.isInteger(h)||h<8||h>16||h===12||!Number.isInteger(q)||q<5||q>20||q%5){
   toast("Choisis une heure de 8 h à 16 h hors midi, et 5, 10, 15 ou 20 pièces.");return;
  }
  bakeryState().plan[recipe.id]={hour:h,quantity:q};save();showBakery();
 });
}
function consumeBakeryIngredients(recipe,quantity){
 const items=Object.entries(recipe.ingredients).map(([id,amount])=>({
  product:catalog.find(p=>p.id===id),quantity:amount*quantity/5
 }));
 if(items.some(item=>productStoredUnits(item.product)<item.quantity))return false;
 for(const item of items){
  const inventory=state.inventory[item.product.id];
  const fromLoose=Math.min(inventory.reserve,item.quantity);
  inventory.reserve-=fromLoose;
  const remaining=item.quantity-fromLoose;
  if(remaining){
   const cartons=Math.ceil(remaining/BOX_UNITS);
   inventory.boxes-=cartons;
   inventory.reserve+=cartons*BOX_UNITS-remaining;
  }
 }
 return true;
}
let bakeryTick=-1;
function updateBakery(){
 if(!state.upgrades[BAKERY_ID])return;
 const minute=Math.floor(state.hour*60),tick=state.day*1440+minute;
 if(tick===bakeryTick)return;
 bakeryTick=tick;
 const bakery=bakeryState();
 const batch=bakery.batch;
 if(batch&&tick>=batch.ready){
  const product=catalog.find(p=>p.id===batch.id);
  const inventory=product&&state.inventory[product.id];
  const quantity=inventory?Math.min(batch.quantity,Math.max(0,shelfCapacity(product)-inventory.shelf)):0;
  if(quantity){
   inventory.shelf+=quantity;
   batch.quantity-=quantity;
   if(batch.quantity===0)bakery.batch=null;
   sync();toast("Fournée en rayon · "+quantity+" × "+product.name);
  }
  return;
 }
 if(batch||!bakery.enabled||!bakerOnDuty()||minute+20>Math.min(17,closingHour())*60)return;
 const wage=bakery.paidDay===state.day?0:BAKER_WAGE;
 if(state.money<wage)return;
 for(const recipe of BAKERY_RECIPES){
  const rule=bakeryPlan(recipe),product=catalog.find(p=>p.id===recipe.id);
  if(bakery.lastBake[recipe.id]===state.day||minute<rule.hour*60||!productAvailable(product))continue;
  if(shelfCapacity(product)-state.inventory[product.id].shelf<rule.quantity)continue;
  if(!consumeBakeryIngredients(recipe,rule.quantity))continue;
  bakery.lastBake[recipe.id]=state.day;
  bakery.paidDay=state.day;
  bakery.batch={id:recipe.id,quantity:rule.quantity,ready:tick+20};
  state.money-=wage;finance.charges+=wage;
  sync();toast("Fournée lancée · "+recipe.name);
  return;
 }
}

function showCommercialManagement(){
 openPanel("Gestion commerciale");
 button(panel,"Produits à démarquer",showMarkdowns);
 if(playerLevel()>=9)button(panel,"Ventes des sept derniers jours",showRecentSales);
 if(playerLevel()>=14)button(panel,"Alertes de rupture",showStockAlerts);
 if(playerLevel()>=18)button(panel,"Commandes récurrentes",showStandingOrders);
 if(playerLevel()>=199)button(panel,"Bilan des départements",showDepartmentPerformance);
}
function managementProducts(){
 return unlockedProducts().sort((a,b)=>a.name.localeCompare(b.name,"fr"));
}
function pickManagementProduct(title,products,onChoose){
 openPanel(title);
 const select=document.createElement("select");
 select.setAttribute("aria-label","Produit");
 select.style.width="100%";
 for(const p of products){
  const option=document.createElement("option");
  option.value=p.id;option.textContent=p.name;select.appendChild(option);
 }
 panel.appendChild(select);
 const choose=button(panel,"Configurer le produit",()=>{
  const p=products.find(p=>p.id===select.value)||products[0];
  if(p)onChoose(p);
 });
 choose.disabled=!products.length;
 return select;
}
function showMarkdowns(){
 state.management.markdowns??={};
 pickManagementProduct("Produits à démarquer",managementProducts().filter(p=>storageKind(p)==="cold"&&state.inventory[p.id].shelf>0),p=>{
  openPanel("Démarque · "+p.name);
  paragraph("Sélectionne la référence dont tu as vérifié la date en rayon.");
  const price=inputNumber("Nouveau prix en euros",Math.max(1,state.inventory[p.id].price-1),1,999999);
  button(panel,"Mettre de côté pour démarque",()=>{
   const amount=Number(price.value);
   if(!Number.isInteger(amount)||amount<1||amount>=state.inventory[p.id].price){toast("Choisis un prix inférieur au prix actuel");return;}
   state.management.markdowns[p.id]=amount;save();showMarkdowns();
  });
 });
 paragraph("Les références marquées apparaissent ici avant modification du prix en rayon.");
 for(const [id,price] of Object.entries(state.management.markdowns)){
  const p=catalog.find(p=>p.id===id);
  if(!p||!productAvailable(p))continue;
  button(panel,"Appliquer "+euro(price)+" · "+p.name,()=>{
   if(state.inventory[id].shelf>0&&price<state.inventory[id].price)state.inventory[id].price=price;
   delete state.management.markdowns[id];sync();showMarkdowns();
  });
  button(panel,"Retirer de la liste · "+p.name,()=>{delete state.management.markdowns[id];save();showMarkdowns();});
 }
}
function trackSale(basket,prices){
 const history=state.management.salesHistory??={};
 const allTime=state.management.salesTotals??={};
 const day=history[state.day]??={};
 for(const [id,quantity] of Object.entries(basket)){
  const p=catalog.find(p=>p.id===id);
  if(!p||quantity<=0)continue;
  day[id]=(day[id]||0)+quantity;
  const stats=allTime[id]??={revenue:0,cost:0};
  stats.revenue+=quantity*(prices[id]??state.inventory[id].price);
  stats.cost+=quantity*p.cost;
 }
 for(const key of Object.keys(history))if(Number(key)<state.day-6)delete history[key];
}
function showRecentSales(){
 openPanel("Ventes · sept derniers jours");
 const history=state.management.salesHistory??{};
 const totals={};
 for(const [day,sales] of Object.entries(history)){
  if(Number(day)<state.day-6)continue;
  for(const [id,quantity] of Object.entries(sales))totals[id]=(totals[id]||0)+quantity;
 }
 const sorted=Object.entries(totals).sort((a,b)=>b[1]-a[1]);
 if(!sorted.length)paragraph("Les ventes encaissées apparaîtront ici.");
 for(const [id,quantity] of sorted)paragraph((catalog.find(p=>p.id===id)?.name??id)+" · "+quantity+" vendu(s)");
}
function stockThreshold(p){
 return state.management.alerts?.[p.id]??10;
}
function showStockAlerts(){
 state.management.alerts??={};
 pickManagementProduct("Alertes de rupture",managementProducts(),p=>{
  openPanel("Alerte · "+p.name);
  const threshold=inputNumber("Seuil d’alerte en unités",stockThreshold(p),0,10000);
  button(panel,"Enregistrer le seuil",()=>{
   const value=Number(threshold.value);
   if(!Number.isInteger(value)||value<0||value>10000){toast("Choisis un seuil valide");return;}
   state.management.alerts[p.id]=value;save();showStockAlerts();
  });
 });
 for(const p of managementProducts().filter(p=>stockAlert(p)!=="OK")){
  paragraph(p.name+" · "+stockAlert(p)+" · "+(state.inventory[p.id].shelf+productStoredUnits(p))+" unités, seuil "+stockThreshold(p));
 }
}
function showStandingOrders(){
 state.management.standingOrders??={};
 pickManagementProduct("Commandes récurrentes",managementProducts(),p=>{
  openPanel("Commande récurrente · "+p.name);
  const rule=state.management.standingOrders[p.id];
  const cartons=inputNumber("Cartons à commander",rule?.cartons??1,1,MAX_BOXES_PER_PRODUCT);
  const interval=inputNumber("Nombre de jours entre deux commandes",rule?.interval??2,1,30);
  button(panel,"Activer ou mettre à jour",()=>{
   const qty=Number(cartons.value),days=Number(interval.value);
   if(!Number.isInteger(qty)||qty<1||qty>MAX_BOXES_PER_PRODUCT||!Number.isInteger(days)||days<1||days>30){toast("Vérifie les quantités et la fréquence");return;}
   state.management.standingOrders[p.id]={cartons:qty,interval:days,nextDay:state.day+1};save();showStandingOrders();
  });
  if(rule)button(panel,"Désactiver",()=>{delete state.management.standingOrders[p.id];save();showStandingOrders();});
 });
 paragraph("Le paiement et la livraison suivent le circuit fournisseur habituel.");
 for(const [id,rule] of Object.entries(state.management.standingOrders)){
  const p=catalog.find(p=>p.id===id);
  if(p)paragraph(p.name+" · "+rule.cartons+" carton(s) tous les "+rule.interval+" jour(s) · prochain essai jour "+rule.nextDay);
 }
}
function processStandingOrders(){
 if(playerLevel()<18)return;
 for(const [id,rule] of Object.entries(state.management.standingOrders??{})){
  const p=catalog.find(p=>p.id===id);
  if(!p||!productAvailable(p)||!Number.isInteger(rule.cartons)||rule.cartons<1||
   !Number.isInteger(rule.interval)||rule.interval<1||rule.nextDay>state.day)continue;
  const cost=rule.cartons*p.cost*BOX_UNITS;
  const kind=storageKind(p);
  if(cost>state.money||state.inventory[id].boxes+pendingBoxes(id)+rule.cartons>MAX_BOXES_PER_PRODUCT||cartCapacity(kind)<rule.cartons)continue;
  state.money-=cost;finance.supplies+=cost;
  state.supplierOrders.push({items:[{id,qty:rule.cartons}],due:Date.now()+30000,express:false,paid:cost});
  rule.nextDay=state.day+rule.interval;
 }
}
function showDepartmentPerformance(){
 openPanel("Bilan des départements");
 const totals=state.management.salesTotals??{};
 const losses=state.management.losses??{};
 paragraph("Le détail par référence couvre les opérations enregistrées depuis la mise à jour.");
 for(const department of [{id:undefined,name:"Magasin principal"},...DEPARTMENTS].filter(d=>!d.id||state.upgrades[d.id])){
  const group=catalog.filter(p=>p.department===department.id);
  const result=group.reduce((a,p)=>{
   const sales=totals[p.id];
   a.revenue+=sales?.revenue??0;a.cost+=sales?.cost??0;
   a.losses+=(losses[p.id]??0)*p.cost;
   a.out+=Number(productAvailable(p)&&state.inventory[p.id].shelf===0);
   return a;
  },{revenue:0,cost:0,losses:0,out:0});
  paragraph(department.name+" · CA "+euro(result.revenue)+" · Marge brute "+euro(result.revenue-result.cost)+" · Pertes "+euro(result.losses)+" · "+result.out+" rupture(s) en rayon");
 }
}

const SERVICE_CHANNELS=[
 {id:"traiteur",name:"Commandes traiteur",level:40,department:"annex5",refs:["salades","sandwichs","plats_prepares"]},
 {id:"boucherie",name:"Réservations boucherie",level:59,department:"annex7",refs:["viandes","jambons","terrines"]},
 {id:"precommande",name:"Précommandes de jeux",level:77,department:"annex9",refs:["consoles_jeu","jeux_video","manettes"]},
 {id:"retrait",name:"Retrait en magasin",level:101,permit:"pickupService"},
 {id:"pro",name:"Commandes professionnelles",level:172,permit:"tradeService"},
 {id:"livraison",name:"Livraison locale",level:182,permit:"deliveryService"}
];
function availableChannels(){
 return SERVICE_CHANNELS.filter(c=>playerLevel()>=c.level&&(!c.department||state.upgrades[c.department])&&(!c.permit||state.upgrades[c.permit]));
}
function serviceOrders(){
 return state.management.serviceOrders??=[];
}
function showOrderServices(){
 openPanel("Commandes des clients");
 const channels=availableChannels();
 if(!channels.length)paragraph("Les services de commande sont accessibles après achat de leur extension et de leur autorisation.");
 for(const channel of channels)button(panel,channel.name,()=>showServiceChannel(channel));
}
function showServiceChannel(channel){
 openPanel(channel.name);
 paragraph("Enregistre la demande, prépare les articles puis valide la remise pour encaisser la commande.");
 const products=managementProducts().filter(p=>!channel.refs||channel.refs.includes(p.id));
 if(products.length)button(panel,"Enregistrer une demande",()=>pickManagementProduct("Article de la commande",products,p=>showNewServiceOrder(channel,p)));
 const orders=serviceOrders().filter(o=>o.channel===channel.id);
 for(const order of orders.filter(o=>o.status!=="paid")){
  const p=catalog.find(p=>p.id===order.product);
  if(!p)continue;
  const status=order.status==="ready"?"Prête · "+(order.locker??"comptoir"):"À préparer";
  paragraph("#"+order.id+" · "+order.quantity+" × "+p.name+" · "+euro(order.unitPrice*order.quantity)+" · "+status+" · jour "+order.day+" à "+order.hour+" h");
  if(order.status==="waiting")button(panel,"Préparer #"+order.id,()=>{prepareServiceOrder(order);showServiceChannel(channel);});
  if(order.status==="ready"){
   button(panel,channel.id==="livraison"?"Confirmer la livraison #"+order.id:"Remettre et encaisser #"+order.id,()=>{
    if(finishServiceOrder(order))showServiceChannel(channel);
   });
   if(channel.id==="retrait"&&playerLevel()>=106){
    const cold=storageKind(p)==="cold";
    if(!cold||playerLevel()>=108)button(panel,cold?"Mettre en casier réfrigéré":"Mettre en casier sec",()=>{
     order.locker=cold?"casier réfrigéré":"casier sec";save();showServiceChannel(channel);
    });
   }
  }
  button(panel,"Annuler #"+order.id,()=>{cancelServiceOrder(order);showServiceChannel(channel);});
 }
 if(channel.id==="pro"&&playerLevel()>=179){
  const paid=orders.filter(o=>o.status==="paid");
  for(const order of paid.slice(-15)){
   const p=catalog.find(p=>p.id===order.product);
   if(p)paragraph("Contrat #"+order.id+" · CA "+euro(order.unitPrice*order.quantity)+" · marge brute "+euro((order.unitPrice-p.cost)*order.quantity));
  }
 }
 if(channel.id==="retrait"&&playerLevel()>=109){
  const hired=!!state.management.orderPicker;
  button(panel,hired?"Suspendre le préparateur de commandes":"Recruter le préparateur · 60 € par jour avec préparation",()=>{
   state.management.orderPicker=!hired;save();showServiceChannel(channel);
  });
 }
 button(panel,"Retour aux services",showOrderServices);
}
function showNewServiceOrder(channel,p){
 openPanel("Nouvelle demande · "+p.name);
 const quantity=inputNumber("Quantité",1,1,channel.id==="pro"?50:30);
 const day=inputNumber("Jour prévu",state.day,state.day,state.day+30);
 const hour=inputNumber("Heure de retrait ou de livraison",Math.min(20,Math.max(8,Math.ceil(state.hour))),8,20);
 const interval=channel.id==="pro"&&playerLevel()>=174?inputNumber("Répéter tous les X jours (0 = commande unique)",0,0,30):null;
 button(panel,"Enregistrer",()=>{
  const count=Number(quantity.value),dueDay=Number(day.value),dueHour=Number(hour.value),repeat=Number(interval?.value??0);
  if(!Number.isInteger(count)||count<1||count>(channel.id==="pro"?50:30)||
   !Number.isInteger(dueDay)||dueDay<state.day||dueDay>state.day+30||
   !Number.isInteger(dueHour)||dueHour<8||dueHour>20||
   !Number.isInteger(repeat)||repeat<0||repeat>30){toast("Vérifie la quantité et le créneau");return;}
  if(serviceOrders().filter(o=>o.status!=="paid").length>=30){toast("30 commandes actives au maximum");return;}
  const unitPrice=channel.id==="pro"&&count>=10?Math.max(1,Math.floor(state.inventory[p.id].price*.95)):state.inventory[p.id].price;
  addServiceOrder({channel:channel.id,product:p.id,quantity:count,unitPrice,day:dueDay,hour:dueHour,repeat});
  save();showServiceChannel(channel);
 });
}
function addServiceOrder(data){
 state.management.nextOrderId=(state.management.nextOrderId??0)+1;
 serviceOrders().push({...data,id:state.management.nextOrderId,status:"waiting"});
}
function prepareServiceOrder(order,quiet=false){
 if(order.status!=="waiting")return false;
 const p=catalog.find(p=>p.id===order.product);
 if(!p||!productAvailable(p))return false;
 const a=state.inventory[p.id];
 const canUseReserve=order.channel==="pro";
 if(a.shelf+(canUseReserve?productStoredUnits(p):0)<order.quantity){
  if(!quiet)toast("Quantité en stock insuffisante pour cette commande");
  return false;
 }
 const fromShelf=Math.min(a.shelf,order.quantity);
 a.shelf-=fromShelf;
 let remaining=order.quantity-fromShelf;
 const fromLoose=Math.min(a.reserve,remaining);
 a.reserve-=fromLoose;remaining-=fromLoose;
 if(remaining){
  const cartons=Math.ceil(remaining/BOX_UNITS);
  a.boxes-=cartons;a.reserve+=cartons*BOX_UNITS-remaining;
 }
 order.status="ready";sync();
 return true;
}
function finishServiceOrder(order){
 if(order.status!=="ready")return false;
 if(order.day>state.day||(order.day===state.day&&order.hour>state.hour)){
  toast("Le créneau de cette commande n’est pas encore arrivé");return false;
 }
 const payment=order.quantity*order.unitPrice;
 state.money+=payment;finance.revenue+=payment;finance.transactions++;state.sales+=order.quantity;
 trackSale({[order.product]:order.quantity},{[order.product]:order.unitPrice});
 order.status="paid";
 if(order.repeat>0)addServiceOrder({channel:order.channel,product:order.product,quantity:order.quantity,unitPrice:order.unitPrice,day:state.day+order.repeat,hour:order.hour,repeat:order.repeat});
 const completed=serviceOrders().filter(o=>o.status==="paid");
 if(completed.length>60)state.management.serviceOrders=serviceOrders().filter(o=>o!==completed[0]);
 sync();checkLevelUp();toast("Commande encaissée · "+euro(payment));
 return true;
}
function cancelServiceOrder(order){
 if(order.status!=="waiting"&&order.status!=="ready")return;
 if(order.status==="ready"){
  const a=state.inventory[order.product];
  if(a){
   const put=Math.min(order.quantity,Math.max(0,CAPACITY-a.shelf));
   a.shelf+=put;a.reserve+=order.quantity-put;
  }
 }
 order.status="cancelled";
 state.management.serviceOrders=serviceOrders().filter(o=>o!==order);
 sync();
}
function processOrderPicker(){
 if(playerLevel()<109||!state.management.orderPicker||state.money<60)return;
 let worked=false;
 for(const order of serviceOrders()){
  if(order.channel==="retrait"&&order.day<=state.day&&prepareServiceOrder(order,true))worked=true;
 }
 if(worked){state.money-=60;finance.charges+=60;}
}

function showNames(){
 openPanel("PERSONNALISATION — Prénoms");
 paragraph("Chaque partie possède ses propres prénoms. Ils sont enregistrés dans ta sauvegarde.");
 const makeNameInput=(title,value)=>{
  const label=document.createElement("label");label.textContent=title;label.style.display="block";label.style.marginTop="12px";panel.appendChild(label);
  const field=document.createElement("input");field.type="text";field.maxLength=24;field.value=value;
  Object.assign(field.style,{display:"block",width:"100%",padding:"10px",color:"#111",background:"#fff",borderRadius:"8px",marginTop:"5px"});
  panel.appendChild(field);return field;
 };
 const player=makeNameInput("Ton prénom",state.playerName);
 const worker=makeNameInput("Prénom du manutentionnaire",state.workerName);
 button(panel,"Enregistrer les prénoms",()=>{
  const a=player.value.trim(),b=worker.value.trim();
  if(!a||!b){toast("Renseigne les deux prénoms");return;}
  state.playerName=a;state.workerName=b;save();toast("Prénoms enregistrés");showNames();
 });
 button(panel,"Retour au personnel",showWorkerManagement);
}
const WORKER_DAILY_WAGE=65;
function settleWorkerPayroll(){
 if(!state.workerWageDue)return;
 const due=state.workerWageDue,paid=Math.min(Math.max(0,state.money),due);
 state.money-=paid;state.workerWageDue-=paid;state.workerPaidTotal+=paid;
 const d=gameDate();
 state.workerPayrollHistory.push({month:d.getUTCMonth()+1,year:d.getUTCFullYear(),due,paid});
 state.workerPayrollHistory=state.workerPayrollHistory.slice(-24);
 toast(state.workerWageDue?"Paie partielle : dette salariale "+euro(state.workerWageDue):"Salaire mensuel versé : "+euro(paid));
}
function workerShift(day=state.day){const d=new Date(Date.UTC(2027,0,1));d.setUTCDate(d.getUTCDate()+day-1);return state.workerLeaveDays.includes(day)?null:state.workerSchedule[d.getUTCDay()];}
// Statuts communs : gestion du personnel, dialogues, horaires et animations.
function employeeOnLunch(shift){return !!shift&&state.hour>=shift[0]&&state.hour<shift[1]&&state.hour>=12&&state.hour<13;}
function employeeWorking(shift){return !!shift&&state.hour>=shift[0]&&state.hour<shift[1]&&!employeeOnLunch(shift);}
function employeeStatus(hired,enabled,sentHomeDay,shift){
 if(!hired)return "Non recruté";
 if(!enabled)return "Affectation suspendue";
 if(sentHomeDay===state.day)return "Rentré chez lui pour aujourd’hui";
 if(!shift)return "Repos ou congé";
 if(state.hour<shift[0])return "Prise de poste à "+formatHour(shift[0]);
 if(state.hour>=shift[1])return "Service terminé à "+formatHour(shift[1]);
 if(employeeOnLunch(shift))return "Pause déjeuner — reprise à 13:00";
 return "En service";
}
function showWorkerPlanning(){
 openPanel("PLANNING — "+state.workerName);
 paragraph("Semaine du "+dateLabel()+". Les horaires sont modifiables et sauvegardés.");
 const names=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
 for(let i=0;i<7;i++){
  const shift=state.workerSchedule[i];
  paragraph(names[i]+" : "+(shift?formatHour(shift[0])+"–"+formatHour(shift[1])+" (pause 12:00–13:00 si incluse)":"Repos"));
  button(panel,names[i]+" — "+(shift?"Modifier / repos":"Définir horaires"),()=>{
   openPanel("HORAIRES — "+names[i]);
   const start=document.createElement("select"),end=document.createElement("select");
   for(let h=8;h<=20;h++)for(const el of [start,end]){const opt=document.createElement("option");opt.value=h;opt.textContent=formatHour(h);el.appendChild(opt);}
   start.value=shift?shift[0]:8;end.value=shift?shift[1]:17;
   paragraph("Début");panel.appendChild(start);paragraph("Fin");panel.appendChild(end);
   button(panel,"Enregistrer",()=>{const a=Number(start.value),b=Number(end.value);if(b<=a){toast("La fin doit être après le début");return;}state.workerSchedule[i]=[a,b];save();showWorkerPlanning();});
   button(panel,"Jour de repos",()=>{state.workerSchedule[i]=null;save();showWorkerPlanning();});
   button(panel,"Retour au planning",showWorkerPlanning);
  });
 }
 paragraph("Aujourd’hui : "+(state.workerLeaveDays.includes(state.day)?"Congé":state.workerSentHomeDay===state.day?"Rentré plus tôt":workerShift()?"Travail prévu":"Repos"));
 button(panel,state.workerLeaveDays.includes(state.day)?"Annuler le congé du jour":"Accorder un congé aujourd’hui",()=>{state.workerLeaveDays=state.workerLeaveDays.includes(state.day)?state.workerLeaveDays.filter(d=>d!==state.day):[...state.workerLeaveDays,state.day];save();showWorkerPlanning();});
 button(panel,"Retour au personnel",showWorkerManagement);
}
function showWorkerManagement(){

 openPanel("PERSONNEL — "+state.workerName);
 button(panel,"Modifier les prénoms",showNames);
 button(panel,"Voir / modifier le planning",showWorkerPlanning);
 paragraph("Contrat : "+(state.workerHired?"CDI — manutentionnaire":"Aucun contrat")+".");
 paragraph("Statut actuel : "+(employeeBreakLabel(workerBreakJourney)||employeeStatus(state.workerHired,state.workerEnabled,state.workerSentHomeDay,workerShift()))+".");
 paragraph("Tâche : "+workerTaskLabel()+".");
 paragraph("Horaires : selon le planning enregistré, pause déjeuner 12:00–13:00.");
 paragraph("Salaire de simulation : "+euro(WORKER_DAILY_WAGE)+" par journée travaillée, versé en fin de mois.");
 paragraph("Journées comptabilisées : "+state.workerDaysWorked+".");
 paragraph("Salaire restant à payer : "+euro(state.workerWageDue)+".");
 paragraph("Salaires déjà versés : "+euro(state.workerPaidTotal)+".");
 if(!state.workerHired)button(panel,"Recruter "+state.workerName+" — CDI",()=>{
  state.workerHired=true;state.workerEnabled=true;save();showWorkerManagement();toast(state.workerName+" recruté !");
 });
 else{
  button(panel,state.workerEnabled?"Suspendre l’affectation":"Réactiver l’affectation",()=>{
   state.workerEnabled=!state.workerEnabled;if(!state.workerEnabled)workerTalking=false;save();showWorkerManagement();
  });
  if(state.workerSentHomeDay===state.day){
   paragraph("Le départ anticipé est sauvegardé pour cette journée. Tu peux rappeler le salarié sans rompre son contrat.");
   button(panel,"Rappeler "+state.workerName+" au travail",()=>{
    state.workerSentHomeDay=0;
    state.workerEnabled=true;
    workerTalking=false;workerWait=0;
    save();showWorkerManagement();
    const shift=workerShift();
    const available=shift&&state.hour>=shift[0]&&state.hour<shift[1]&&!(state.hour>=12&&state.hour<13);
    toast(available?state.workerName+" est de retour au travail !":"Rappel confirmé : retour au prochain créneau de travail");
   });
  }
  if(state.workerWageDue>0)button(panel,"Verser les salaires dus",()=>{settleWorkerPayroll();sync();showWorkerManagement();});
  button(panel,"Rompre le contrat",()=>{
   if(workerCargo){toast("Attends qu’il dépose son carton");return;}
   state.workerHired=false;state.workerEnabled=false;workerTalking=false;save();showWorkerManagement();toast("Contrat terminé — les salaires dus restent à payer");
  });
 }
 if(state.workerPayrollHistory.length){
  paragraph("Historique des paies :");
  for(const p of state.workerPayrollHistory.slice(-4).reverse())paragraph(String(p.month).padStart(2,"0")+"/"+p.year+" — dû "+euro(p.due)+" / versé "+euro(p.paid));
 }
}
const STOCKER_DAILY_WAGE=60;
function stockerShift(day=state.day){
 const d=new Date(Date.UTC(2027,0,1));d.setUTCDate(d.getUTCDate()+day-1);
 return state.stockerLeaveDays.includes(day)?null:state.stockerSchedule[d.getUTCDay()];
}
function showStockerManagement(){
 openPanel("PERSONNEL — MISE EN RAYON");
 paragraph("Prénom : "+state.stockerName);
 const input=document.createElement("input");input.value=state.stockerName;input.maxLength=24;input.style.width="100%";panel.appendChild(input);
 button(panel,"Enregistrer le prénom",()=>{state.stockerName=input.value.trim().slice(0,24)||"Camille";save();showStockerManagement();});
 paragraph("Contrat : "+(state.stockerHired?"CDI":"Non recruté"));
 paragraph("Statut actuel : "+(employeeBreakLabel(stockerBreakJourney)||employeeStatus(state.stockerHired,state.stockerEnabled,state.stockerSentHomeDay,stockerShift()))+".");
 paragraph("Tâche : "+stockerTaskLabel()+".");
 paragraph("Salaire : "+euro(STOCKER_DAILY_WAGE)+"/journée | Dû : "+euro(state.stockerWageDue)+" | Versé : "+euro(state.stockerPaidTotal));
 paragraph("Mission : transporter des produits depuis la réserve et remplir les rayons.");
 button(panel,"Planning de mise en rayon",showStockerPlanning);
 if(!state.stockerHired)button(panel,"Recruter "+state.stockerName,()=>{state.stockerHired=true;state.stockerEnabled=true;save();showStockerManagement();});
 else{
  button(panel,state.stockerEnabled?"Suspendre l’affectation":"Réactiver l’affectation",()=>{state.stockerEnabled=!state.stockerEnabled;save();showStockerManagement();});
  button(panel,"Rompre le contrat",()=>{state.stockerHired=false;state.stockerEnabled=false;save();showStockerManagement();});
 }
}
function showStockerPlanning(){
 openPanel("PLANNING — "+state.stockerName);
 const days=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
 days.forEach((name,i)=>{
  const shift=state.stockerSchedule[i];
  paragraph(name+" : "+(shift?formatHour(shift[0])+"–"+formatHour(shift[1]):"Repos"));
  button(panel,name+" — modifier",()=>{
   openPanel("HORAIRES — "+name);
   const start=document.createElement("select"),end=document.createElement("select");
   for(let h=8;h<=20;h++)for(const el of [start,end]){const opt=document.createElement("option");opt.value=h;opt.textContent=formatHour(h);el.appendChild(opt);}
   start.value=shift?shift[0]:8;end.value=shift?shift[1]:17;
   paragraph("Début");panel.appendChild(start);paragraph("Fin");panel.appendChild(end);
   button(panel,"Enregistrer",()=>{if(+end.value<=+start.value){toast("Horaires invalides");return;}state.stockerSchedule[i]=[+start.value,+end.value];save();showStockerPlanning();});
   button(panel,"Jour de repos",()=>{state.stockerSchedule[i]=null;save();showStockerPlanning();});
   button(panel,"Retour",showStockerPlanning);
  });
 });
 button(panel,state.stockerLeaveDays.includes(state.day)?"Annuler le congé du jour":"Congé aujourd’hui",()=>{
  state.stockerLeaveDays=state.stockerLeaveDays.includes(state.day)?state.stockerLeaveDays.filter(d=>d!==state.day):[...state.stockerLeaveDays,state.day];save();showStockerPlanning();
 });
 button(panel,"Retour au personnel",showStockerManagement);
}
function showEmployeeOverview(){
 openPanel("ÉQUIPE — PRÉSENCE ET MISSIONS");
 paragraph("Heure du magasin : "+formatHour(state.hour)+". Pause déjeuner automatique de 12:00 à 13:00.");
 paragraph(state.workerName+" — Manutentionnaire");
 paragraph("Présence : "+(employeeBreakLabel(workerBreakJourney)||employeeStatus(state.workerHired,state.workerEnabled,state.workerSentHomeDay,workerShift())));
 paragraph("Mission : "+workerTaskLabel());
 paragraph(state.stockerName+" — Mise en rayon");
 paragraph("Présence : "+(employeeBreakLabel(stockerBreakJourney)||employeeStatus(state.stockerHired,state.stockerEnabled,state.stockerSentHomeDay,stockerShift())));
 paragraph("Mission : "+stockerTaskLabel());
 if(state.upgrades[BAKERY_ID]){
  paragraph("Boulanger · recruté à l’ouverture du fournil");
  paragraph(bakeryStatus());
  button(panel,"Planning des fournées",showBakery);
 }
 button(panel,"Actualiser les statuts",showEmployeeOverview);
 button(panel,"Gérer le manutentionnaire",showWorkerManagement);
 button(panel,"Gérer la mise en rayon",showStockerManagement);
 button(panel,"Retour à l’ordinateur",showComputer);
}
const FBA_START_DATE=new Date(Date.UTC(2027,0,1));
const FBA_DAYS=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"];
function gameDate(){const d=new Date(FBA_START_DATE.getTime());d.setUTCDate(d.getUTCDate()+Math.max(0,Math.floor(state.day)-1));return d;}
function dateLabel(){return new Intl.DateTimeFormat("fr-FR",{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(gameDate());}
function isSunday(){return gameDate().getUTCDay()===0;}
function closingHour(){return isSunday()&&state.sundayMode==="morning"?12:20;}
function showCalendar(){
 openPanel("CALENDRIER — Gestion des horaires");
 paragraph("Date du jeu : "+dateLabel());
 paragraph("Calendrier réel : mois de 28 à 31 jours, années bissextiles incluses.");
 paragraph("Du lundi au samedi : 08:00–20:00.");
 paragraph("Dimanche : "+(state.sundayMode==="morning"?"ouvert de 08:00 à 12:00":"fermé toute la journée")+".");
 button(panel,"Dimanche : fermer",()=>{state.sundayMode="closed";save();showCalendar();toast("Dimanche : fermeture programmée");});
 button(panel,"Dimanche : ouvrir de 08:00 à 12:00",()=>{state.sundayMode="morning";save();showCalendar();toast("Dimanche : ouverture 08:00–12:00");});
 paragraph("Les horaires personnalisés et la paie mensuelle seront ajoutés avec la gestion du personnel.");
}
function showComputerOrders(){
 if(!near(7.3,6.5,3.4)){toast("Approche-toi de l'ordinateur");return;}
 showOrders();
}
// Interface de caisse autonome, compacte, distincte du bureau fournisseurs.
const checkoutUI=document.createElement("div");
Object.assign(checkoutUI.style,{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:"30",width:"min(320px,85vw)",maxHeight:"calc(100dvh - 20px)",overflowY:"auto",padding:"14px",borderRadius:"13px",border:"1px solid #38bdf8",background:"#0f172a",color:"#fff",boxShadow:"0 12px 35px #0009",display:"none",fontFamily:"Arial,sans-serif",boxSizing:"border-box"});
document.body.appendChild(checkoutUI);
function checkoutButton(label,fn){
 const b=button(checkoutUI,label,fn);
 b.style.fontSize="14px";b.style.padding="10px";return b;
}
function checkoutText(value,large=false){
 const p=document.createElement("div");p.textContent=value;
 Object.assign(p.style,{margin:"9px 0",fontSize:large?"18px":"13px",fontWeight:large?"bold":"normal"});
 checkoutUI.appendChild(p);
}
let terminalKeyHandler=null;
function closeCheckoutUI(){
 terminalKeyHandler=null;
 checkoutUI.style.display="none";
}
let checkoutVisual=null;
function clearCheckoutVisual(){
 if(!checkoutVisual)return;
 for(const m of checkoutVisual.models){scene.remove(m);m.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
 checkoutVisual=null;
}
// Les articles non scannés restent individualisés : le clic doit retirer le produit réellement touché.
function checkoutRemaining(c){
 if(!Array.isArray(c.checkoutRemaining)){
  c.checkoutRemaining=Object.entries(c.basket).flatMap(([id,q])=>Array(Math.max(0,q)).fill(id));
 }
 return c.checkoutRemaining;
}
function renderCheckoutVisual(c){
 if(checkoutVisual?.customer===c&&checkoutVisual.scanned===c.scanned)return;
 clearCheckoutVisual();
 const models=[];
 checkoutRemaining(c).slice(0,5).forEach((id,i)=>{
  const p=catalog.find(x=>x.id===id);if(!p)return;
  const m=productModel(p);m.scale.setScalar(.7);
  m.position.set(6.16-i*.23,1.28,6.44);
  // L'index correspond à la position dans la file, pas au type de produit.
  m.traverse(o=>{o.userData.checkoutArticle=true;o.userData.checkoutSlot=i;});
  scene.add(m);models.push(m);
 });
 checkoutVisual={customer:c,scanned:c.scanned,models};
}
function scanCheckoutArticle(slot){
 const c=cashier;if(!c||c.phase!=="checkout")return;
 const count=Object.values(c.basket).reduce((n,q)=>n+q,0);
 if(c.scanned>=count)return;
 const remaining=checkoutRemaining(c);
 // Seuls les cinq articles présents sur le tapis peuvent être scannés.
 if(!Number.isInteger(slot)||slot<0||slot>=Math.min(remaining.length,5))return;
 remaining.splice(slot,1);
 c.scanned++;
 renderCheckoutVisual(c);
 toast(c.scanned===count?"Tous les articles sont scannés":"Bip ! Article scanné");
 if(c.scanned===count)showPayment(c,count);
 else closeCheckoutUI();
}
function showCheckout(){
 if(!cashier){closeCheckoutUI();clearCheckoutVisual();return;}
 if(!seatedAtCheckout&&!near(6.5,6.5,3.5)){toast("Approche-toi de la caisse");return;}
 releaseMouseLook();
 panel.style.display="none";
 const c=cashier,count=Object.values(c.basket).reduce((n,q)=>n+q,0);
 if(!count){checkoutUI.replaceChildren();checkoutUI.style.display="block";checkoutText("Panier vide");checkoutButton("Terminer",()=>finishCheckout(c));return;}
 renderCheckoutVisual(c);
 if(c.scanned>=count)showPayment(c,count);
 else{closeCheckoutUI();toast("Touche directement les articles sur le tapis pour les scanner");}
}
function completeCheckoutPayment(c,count){
 if(c!==cashier)return;
 state.money+=c.total;state.sales+=count;
 finance.revenue+=c.total;finance.transactions++;
 trackSale(c.basket,c.prices);
 c.paid=true;
 if(count>0)changeSatisfaction(c.waitPenalty?1:3);
 sync();finishCheckout(c);
 checkLevelUp();
 toast("Paiement accepté : +"+euro(c.total));
}
function showPayment(c,count){
 if(c!==cashier)return;
 terminalKeyHandler=null;
 releaseMouseLook();
 checkoutUI.replaceChildren();checkoutUI.style.display="block";
 checkoutText("FBA — MODE DE PAIEMENT",true);
 checkoutText("À régler : "+euro(c.total),true);
 checkoutText(c.paymentMethod==="cash"?"Le client paie en espèces.":"Le client paie par carte.");
 checkoutButton(c.paymentMethod==="cash"?"Ouvrir le tiroir-caisse":"Ouvrir le terminal bancaire",()=>c.paymentMethod==="cash"?showCashPayment(c,count):showCardPayment(c,count));
 checkoutButton("Retour aux articles",showCheckout);
}
function showCardPayment(c,count){
 if(c!==cashier)return;
 let entered="",amountConfirmed=false;
 const expected=Math.round(c.total*100);
 function draw(){
  terminalKeyHandler=null;
  checkoutUI.replaceChildren();checkoutUI.style.display="block";
  checkoutText("FBA — TERMINAL BANCAIRE",true);
  checkoutText("Total à encaisser : "+euro(c.total),true);
  if(!amountConfirmed){
   checkoutText("Saisis le montant en euros avec le clavier ou les boutons. Entrée pour valider.");
   const amountDisplay=document.createElement("div");
   Object.assign(amountDisplay.style,{fontSize:"18px",fontWeight:"bold",margin:"9px 0"});
   checkoutUI.appendChild(amountDisplay);
   const grid=document.createElement("div");
   Object.assign(grid.style,{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"5px"});
   checkoutUI.appendChild(grid);
   function enterDigit(digit){
    entered=digit==="C"?"":digit==="⌫"?entered.slice(0,-1):(entered+digit).slice(0,7);
    updateAmount();
   }
   function confirmAmount(){
    if(c!==cashier)return;
    if(Math.round(Number(entered)*100)!==expected){toast("Saisis le montant exact");return;}
    amountConfirmed=true;draw();
   }
   for(const digit of ["1","2","3","4","5","6","7","8","9","C","0","⌫"]){
    const b=document.createElement("button");b.textContent=digit;
    Object.assign(b.style,{minHeight:"40px",padding:"7px",fontSize:"19px",fontWeight:"bold",touchAction:"manipulation",background:"#334155",color:"#fff",border:"1px solid #64748b",borderRadius:"7px"});
    b.type="button";
    // Uniquement click : le navigateur déduplique les interactions tactiles.
    // Ne pas mélanger pointerup et click (double frappe sur certains Android).
    b.addEventListener("click",e=>{
     e.preventDefault();e.stopPropagation();
     enterDigit(digit);
    });
    grid.appendChild(b);
   }
   const ok=checkoutButton("Valider le montant",confirmAmount);
   terminalKeyHandler=event=>{
    if(c!==cashier)return false;
    const digit=/^[0-9]$/.test(event.key)?event.key:/^(?:Numpad|Digit)([0-9])$/.exec(event.code)?.[1];
    if(digit!==undefined)enterDigit(digit);
    else if(event.key==="Backspace")enterDigit("⌫");
    else if(event.key==="Delete")enterDigit("C");
    else if(event.key==="Enter"){if(!event.repeat)confirmAmount();}
    else return false;
    return true;
   };
   function updateAmount(){
    amountDisplay.textContent="Montant saisi : "+(entered?euro(Number(entered)):"0,00 €");
    ok.disabled=Math.round(Number(entered)*100)!==expected;
    ok.style.opacity=ok.disabled?".45":"1";
   }
   updateAmount();
  }else{
   checkoutText("Montant validé : "+euro(c.total),true);
   checkoutText("2. Fais glisser la carte de gauche à droite pour payer.");
   const slot=document.createElement("div");
   Object.assign(slot.style,{background:"#111827",border:"2px solid #64748b",borderRadius:"9px",padding:"12px",margin:"10px 0",textAlign:"center"});
   const card=document.createElement("div");card.textContent="💳 GLISSER LA CARTE →";
   Object.assign(card.style,{background:"#1d4ed8",color:"#fff",borderRadius:"7px",padding:"13px 4px",fontSize:"13px",fontWeight:"bold",touchAction:"none",userSelect:"none"});
   slot.appendChild(card);checkoutUI.appendChild(slot);
   let x=null;
   card.addEventListener("pointerdown",e=>{x=e.clientX;card.setPointerCapture(e.pointerId);});
   card.addEventListener("pointerup",e=>{
    if(x!==null&&e.clientX-x>55&&c===cashier){
     card.textContent="CARTE ACCEPTÉE ✓";
     card.style.background="#14532d";
     completeCheckoutPayment(c,count);
    }
    x=null;
   });
   checkoutButton("Modifier le montant",()=>{amountConfirmed=false;draw();});
  }
  checkoutButton("Retour",()=>showPayment(c,count));
 }
 draw();
}
function showCashPayment(c,count){
 if(c!==cashier)return;
 terminalKeyHandler=null;
 // Le client remet un montant arrondi à un billet supérieur ou égal au total.
 const cents=Math.round(c.total*100);
 const receivedCents=[500,1000,2000,5000,10000,20000].find(v=>v>=cents)||Math.ceil(cents/5000)*5000;
 const changeCents=receivedCents-cents;
 let given=0;
 const denominations=[5000,2000,1000,500,200,100,50,20,10,5,2,1];
 const labels=["50 €","20 €","10 €","5 €","2 €","1 €","50 c","20 c","10 c","5 c","2 c","1 c"];
 function draw(){
  checkoutUI.replaceChildren();checkoutUI.style.display="block";
  checkoutText("CAISSE — PAIEMENT ESPÈCES",true);
  checkoutText("Total : "+euro(c.total));
  checkoutText("Reçu : "+euro(receivedCents/100));
  checkoutText("Monnaie à rendre : "+euro(changeCents/100),true);
  checkoutText("Monnaie sélectionnée : "+euro(given/100));
  const grid=document.createElement("div");
  Object.assign(grid.style,{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"5px"});
  checkoutUI.appendChild(grid);
  denominations.forEach((v,i)=>{
   const b=document.createElement("button");b.textContent=labels[i];
   Object.assign(b.style,{padding:"9px 3px",borderRadius:"7px",border:"1px solid #64748b",background:"#334155",color:"white",fontSize:"12px"});
   b.onclick=()=>{given+=v;draw();};grid.appendChild(b);
  });
  checkoutButton("Effacer la sélection",()=>{given=0;draw();});
  const ok=checkoutButton("Confirmer la monnaie",()=>completeCheckoutPayment(c,count));
  ok.disabled=given!==changeCents;
  ok.style.opacity=given===changeCents?"1":".45";
  checkoutButton("Retour",()=>showPayment(c,count));
 }
 draw();
}
function finishCheckout(c){
 if(c!==cashier)return;
 closeCheckoutUI();clearCheckoutVisual();cashier=null;
 sendToExit(c);
 panel.style.display="none";
}
// Scène et éclairage léger
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9bc9e8);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.05,100);
camera.position.set(0,1.7,7.5);camera.rotation.order="YXZ";
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
const basePixelRatio=Math.min(devicePixelRatio||1,1.25);
renderer.setPixelRatio(basePixelRatio);
renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=false;
$("game").appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xffffff,0x718096,2.2));
const sun=new THREE.DirectionalLight(0xffffff,1.4);sun.position.set(5,12,4);scene.add(sun);
const ambient=scene.children.find(o=>o.isHemisphereLight);
let storeLightsOn=true,stockroomLightsOn=true,coldRoomLightsOn=true;
const ceilingLights=new THREE.Group();scene.add(ceilingLights);
function ceilingLamp(x,z){
 const lamp=new THREE.PointLight(0xfff4db,0,9,1.8);lamp.position.set(x,4.45,z);ceilingLights.add(lamp);return lamp;
}
const lamps=[];
for(const x of [-6,0,6])for(const z of [-6,0,6])lamps.push({light:ceilingLamp(x,z),extension:false});
for(const x of [-6,0,6])for(const z of [-14,-19])lamps.push({light:ceilingLamp(x,z),extension:true});
const reserveLightPositions=[3.5,7.5,11.5,15,18.5,22];
for(const x of [11.6,13.8])for(const z of reserveLightPositions)
 lamps.push({light:ceilingLamp(x,z),stockroom:true});
for(const x of [17.2,21.6])for(const z of [5,11,15])lamps.push({light:ceilingLamp(x,z),coldroom:true});
function updateLighting(){
 const hour=state.hour;
 const daylight=Math.max(.12,Math.min(1,(20-hour)/3.5));
 scene.background.setRGB(.055+.55*daylight,.09+.69*daylight,.17+.74*daylight);
 sun.intensity=.12+1.28*daylight;
 ambient.intensity=.25+1.95*daylight;
 for(const l of lamps)l.light.intensity=l.requiresUpgrade&&!state.upgrades[l.requiresUpgrade]?0:l.breakroom?1.8:l.stockroom?(stockroomLightsOn?1.7:0):l.coldroom?(coldRoomLightsOn?1.8:0):(storeLightsOn&&(!l.extension||state.upgrades.store1)?1.35:0);
 if(typeof coldLightGlow!=="undefined")coldLightGlow.intensity=coldRoomLightsOn?1.8:0;
 if(typeof coldLight!=="undefined")coldLight.material.color.setHex(coldRoomLightsOn?0xf8fafc:0x64748b);
 if(typeof extendedColdLights!=="undefined")extendedColdLights.forEach(m=>m.material.color.setHex(coldRoomLightsOn?0xf8fafc:0x64748b));
 if(typeof reserveLightPanels!=="undefined")reserveLightPanels.forEach(m=>m.material.color.setHex(stockroomLightsOn?0xfff7db:0x64748b));
 if(typeof storageExtensionLightPanels!=="undefined")storageExtensionLightPanels.forEach(m=>m.material.color.setHex(stockroomLightsOn?0xfff7db:0x64748b));
}
const colliders=[];
const colliderCells=new Map(),COLLIDER_CELL_SIZE=6,COLLIDER_CELL_PADDING=.5;
function colliderCell(x,z){return Math.floor(x/COLLIDER_CELL_SIZE)+","+Math.floor(z/COLLIDER_CELL_SIZE);}
function indexColliders(){
 colliderCells.clear();
 for(const collider of colliders){
  const minX=Math.floor((collider.minX-COLLIDER_CELL_PADDING)/COLLIDER_CELL_SIZE);
  const maxX=Math.floor((collider.maxX+COLLIDER_CELL_PADDING)/COLLIDER_CELL_SIZE);
  const minZ=Math.floor((collider.minZ-COLLIDER_CELL_PADDING)/COLLIDER_CELL_SIZE);
  const maxZ=Math.floor((collider.maxZ+COLLIDER_CELL_PADDING)/COLLIDER_CELL_SIZE);
  for(let x=minX;x<=maxX;x++)for(let z=minZ;z<=maxZ;z++){
   const key=x+","+z;
   if(!colliderCells.has(key))colliderCells.set(key,[]);
   colliderCells.get(key).push(collider);
  }
 }
}
function cube(x,y,z,w,h,d,color,solid=false){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.8}));
 mesh.position.set(x,y,z);scene.add(mesh);
 if(solid)colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2});
 return mesh;
}
// Carrelage commercial : dalles claires et joints fins, sans texture externe.
function tileFloor(width,depth,x,z){
 const c=document.createElement("canvas");c.width=512;c.height=512;
 const ctx=c.getContext("2d");ctx.fillStyle="#d9dfe3";ctx.fillRect(0,0,512,512);
 for(let iy=0;iy<8;iy++)for(let ix=0;ix<8;ix++){
  ctx.fillStyle=(ix+iy)%3===0?"#e7eaed":"#dfe4e7";
  ctx.fillRect(ix*64+2,iy*64+2,60,60);
 }
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(width/8,depth/8);
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshStandardMaterial({map:tex,roughness:.88}));
 mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.012,z);scene.add(mesh);return mesh;
}
function wallBaseboard(x,z,w,d,extension=false){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,.16,d),new THREE.MeshStandardMaterial({color:0x475569,roughness:.55}));
 m.position.set(x,.12,z);scene.add(m);if(extension)extensionMeshes.push(m);return m;
}
function ceilingPanel(x,z,extension=false){
 const frame=new THREE.Mesh(new THREE.BoxGeometry(2.45,.045,.40),new THREE.MeshStandardMaterial({color:0x94a3b8,metalness:.5}));
 frame.position.set(x,4.91,z);scene.add(frame);
 const diffuser=new THREE.Mesh(new THREE.BoxGeometry(2.3,.028,.29),new THREE.MeshBasicMaterial({color:0xfff7db}));
 diffuser.position.set(x,4.87,z);scene.add(diffuser);
 if(extension)extensionMeshes.push(frame,diffuser);
}
cube(0,-.15,0,20,.3,20,0xb9c1c8);
tileFloor(19.65,19.65,0,0);
// Plinthes du magasin principal : couvrir tout le mur gauche jusqu'à l'entrée.
wallBaseboard(-9.78,0,.07,19.5);
// Mur droit segmenté autour de l'accès à la réserve.
wallBaseboard(9.78,-3,.07,13.7);
wallBaseboard(9.78,8.5,.07,2.7);
// Entrée centrale libre : plinthes uniquement sur les portions de mur.
wallBaseboard(-6,9.77,7.5,.07);
wallBaseboard(6,9.77,7.5,.07);
// Mur séparatif de l'extension : passage central de 4 m dégagé.
wallBaseboard(-6,-9.78,7.7,.07);
wallBaseboard(6,-9.78,7.7,.07);
for(const x of [-6,0,6])for(const z of [-6,0,6])ceilingPanel(x,z);
cube(0,5.1,0,20,.2,20,0xf1f5f9);
cube(-10,2.5,0,.3,5,20,0xe2e8f0,true);
cube(10,2.5,-3,.3,5,14,0xe2e8f0,true);
cube(10,2.5,8.5,.3,5,3,0xe2e8f0,true);
cube(10,4.2,5.5,.3,1.6,3,0xe2e8f0);
// Un seul sol et plafond pour supprimer les trous entre les trois zones.
cube(12.65,-.15,12.6,5.3,.3,22.2,0xb9c1c8);
cube(12.65,5.1,12.6,5.3,.2,22.2,0xf1f5f9);
// Exactement les mêmes plafonniers LED plats, sur toute la longueur de la réserve.
const reserveLightPanels=[];
for(const z of reserveLightPositions)for(const x of [11.6,13.8]){
 cube(x,4.905,z,1.62,.055,.58,0x94a3b8);
 reserveLightPanels.push(cube(x,4.869,z,1.49,.024,.46,0xfff7db));
}
// Chambre froide accolée à la réserve, accès par une porte libre de 2 m.
// Cloison continue sur 8 m, avec une porte de 2,4 m (z 4,25 à 6,65).
cube(15.3,2.5,2.875,.3,5,2.75,0xdbeafe,true);
cube(15.3,2.5,8.075,.3,5,2.85,0xdbeafe,true);
cube(15.3,4.2,5.45,.3,1.6,2.4,0xdbeafe);
// Huisserie inox, montants sans collision supplémentaire dans l'ouverture.
cube(15.13,1.7,4.25,.10,3.4,.10,0x64748b);
cube(15.13,1.7,6.65,.10,3.4,.10,0x64748b);
cube(15.13,3.42,5.45,.10,.09,2.48,0x64748b);
cube(18.35,-.15,5.5,6.1,.3,8,0x9ccbdc);
cube(18.35,5.1,5.5,6.1,.2,8,0xe0f2fe);
// Porte technique sur la façade est de la chambre froide, vers le couloir logistique.
cube(24,2.5,2.875,.3,5,2.75,0xcbd5e1,true);
cube(24,2.5,11.825,.3,5,10.35,0xcbd5e1,true);
cube(24,4.2,5.45,.3,1.6,2.4,0xcbd5e1);
cube(19.65,2.5,1.5,8.7,5,.3,0xcbd5e1,true);
cube(17.975,2.5,17,5.35,5,.3,0xcbd5e1,true);
storageWingGates.cold=cube(22.325,2.5,17,3.35,5,.3,0xcbd5e1,true);
colliders.at(-1).storageGate="cold";
// Extension de la chambre froide vers l'arrière et l'est.
cube(15.3,2.5,13.25,.3,5,7.5,0xdbeafe,true);
cube(19.65,-.15,13.25,8.7,.3,7.5,0x9ccbdc);
cube(19.65,5.1,13.25,8.7,.2,7.5,0xe0f2fe);
cube(22.7,-.15,5.5,2.6,.3,8,0x9ccbdc);
cube(22.7,5.1,5.5,2.6,.2,8,0xe0f2fe);
const extendedColdLights=[];
for(const x of [17.2,21.6])for(const z of [11,15])extendedColdLights.push(cube(x,4.87,z,2.0,.04,.55,0xf8fafc));
// Les anciens luminaires ont été remplacés par le modèle LED unique.
for(const x of [16.6,22.5])for(const z of [11,14.8]){
 for(const y of [.65,1.7,2.75])cube(x,y,z,1.45,.09,1.5,0x94a3b8);
 for(const dx of [-.65,.65])for(const dz of [-.65,.65])cube(x+dx,1.6,z+dz,.07,3.2,.07,0x64748b);
}
// Sol antidérapant et plinthes sanitaires.
// Revêtement continu, posé légèrement au-dessus des anciens dallages pour supprimer les démarcations.
const coldFloor=cube(19.65,.055,9.25,8.65,.11,15.45,0xb7dce8);
cube(19.65,.14,1.75,8.4,.23,.08,0x64748b);
cube(18.05,.14,16.82,5.2,.23,.08,0x64748b);
// Plinthes sanitaires le long de la cloison, de part et d’autre de la porte froide.
cube(15.48,.14,2.9,.08,.23,2.6,0x64748b);
cube(15.48,.14,11.75,.08,.23,10.0,0x64748b);
// Plinthe interrompue à la porte technique (z=4.25 à 6.65).
cube(23.82,.14,2.875,.08,.23,2.75,0x64748b);
cube(23.82,.14,11.825,.08,.23,10.35,0x64748b);
const coldLight=cube(18.35,4.88,5.5,3.4,.045,.55,0xf8fafc);
const coldLightGlow=new THREE.PointLight(0xbceeff,1.3,11);
coldLightGlow.position.set(18.35,4.5,5.5);scene.add(coldLightGlow);
// Interrupteur extérieur, côté réserve, à droite de la porte froide.
const coldSwitchPlate=cube(15.055,1.35,7.35,.06,.26,.23,0xf8fafc);
const coldSwitch=cube(15.005,1.35,7.35,.065,.13,.12,0x22c55e);
// Groupes froid, grilles et rayonnages inox.
cube(18.35,4.25,1.83,2.5,.7,.45,0x64748b);
for(let i=0;i<9;i++)cube(17.35+i*.25,4.25,1.57,.07,.4,.035,0x94a3b8);
for(const x of [16.35,20.15]){
 for(const z of [3.1,7.8]){
  for(const y of [.65,1.7,2.75])cube(x,y,z,1.45,.09,1.5,0x94a3b8);
  for(const dx of [-.65,.65])for(const dz of [-.65,.65])cube(x+dx,1.6,z+dz,.07,3.2,.07,0x64748b);
 }
}
const coldSign=(()=>{const c=document.createElement("canvas");c.width=512;c.height=128;const ctx=c.getContext("2d");ctx.fillStyle="#0c4a6e";ctx.fillRect(0,0,512,128);ctx.fillStyle="#e0f2fe";ctx.textAlign="center";ctx.font="bold 45px Arial";ctx.fillText("CHAMBRE FROIDE",256,80);const m=new THREE.Mesh(new THREE.PlaneGeometry(2.8,.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}));m.position.set(15.08,4.1,5.45);m.rotation.y=-Math.PI/2;scene.add(m);return m;})();

cube(12.65,2.5,1.5,5.3,5,.3,0xe2e8f0,true);
// Passage libre entre ancienne réserve et agrandissement (ancien mur du fond supprimé).
// Cloison de fond continue et opaque : l'interrupteur est fixé sur sa face intérieure.
// Réserve prolongée vers l'arrière, avec porte logistique vers le quai.
// Partie centrale déjà comprise dans le sol/plafond continu.
cube(10,2.5,12.8,.3,5,7,0xe2e8f0,true);
// Réserve V3 : extension vers z=23,5 au-delà de l'ancien mur de fermeture.
// L'ancien mur z=17 est supprimé pour créer une seule pièce continue.
// Le quai logistique conserve son couloir indépendant x=25,65.
// Extension déjà comprise dans le sol/plafond continu.
// Petit raccord vertical entre les deux anciennes sections du mur gauche.
cube(10.0,2.5,16.5,.3,5,.65,0xe2e8f0,true);
cube(10.0,2.5,20.2,.3,5,7.1,0xe2e8f0,true);
cube(15.3,2.5,20.2,.3,5,7.1,0xe2e8f0,true);
// La cloison arrière s'efface à l'achat de l'extension du magasin.
const oldReserveEndWall=cube(12.65,2.5,23.7,5.3,5,.3,0xe2e8f0);
const oldReserveWallCollider={minX:10.0,maxX:15.3,minZ:23.55,maxZ:23.85};
colliders.push(oldReserveWallCollider);
// Pièce de stockage additionnelle derrière la réserve existante.
// Ses murs et rayonnages n'entravent pas la circulation tant que l'extension n'est pas acquise.
const storageExtensionMeshes=[],storageExtensionColliders=[],storageExtensionLightPanels=[];
function storageExtensionPart(x,y,z,w,h,d,color,solid=false){
 const mesh=cube(x,y,z,w,h,d,color);
 storageExtensionMeshes.push(mesh);
 if(solid){
  const hit={minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,requiresUpgrade:"store1"};
  colliders.push(hit);storageExtensionColliders.push(hit);
 }
 return mesh;
}
storageExtensionPart(12.65,-.15,27.1,5.3,.3,7.0,0xb9c1c8);
storageExtensionPart(12.65,5.1,27.1,5.3,.2,7.0,0xf1f5f9);
storageExtensionPart(10.0,2.5,27.15,.3,5,7.0,0xe2e8f0,true);
storageExtensionPart(15.3,2.5,27.15,.3,5,7.0,0xe2e8f0,true);
// Nouvelle porte arrière de réserve, ouverte seulement après l'extension électronique.
const reserve2Gate=cube(12.65,2.5,30.6,5.3,5,.3,0xe2e8f0);
const reserve2GateCollider={minX:10,maxX:15.3,minZ:30.45,maxZ:30.75,disabled:false};
colliders.push(reserve2GateCollider);
const reserve2Meshes=[];
function reserve2Part(x,y,z,w,h,d,color,solid=false){
 const mesh=cube(x,y,z,w,h,d,color);reserve2Meshes.push(mesh);
 if(solid)colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,requiresUpgrade:"store2"});
 return mesh;
}
reserve2Part(12.65,-.15,34.0,5.3,.3,7.0,0xb9c1c8);
reserve2Part(12.65,5.1,34.0,5.3,.2,7.0,0xf1f5f9);
reserve2Part(10,2.5,34.0,.3,5,7.0,0xe2e8f0,true);
reserve2Part(15.3,2.5,32.25,.3,5,3.5,0xe2e8f0,true);
reserve2Part(15.3,2.5,36.65,.3,5,1.7,0xe2e8f0,true);
reserve2Part(15.3,4.2,35,.3,1.6,2,0xe2e8f0);
reserve2Part(17.95,-.15,37.25,5.3,.3,13.5,0xa8b9c9);
reserve2Part(17.95,5.1,37.25,5.3,.2,13.5,0xf1f5f9);
reserve2Part(15.3,2.5,40.75,.3,5,6.5,0xdbeafe,true);
reserve2Part(20.6,2.5,37.25,.3,5,13.5,0xdbeafe,true);
reserve2Part(17.95,2.5,30.5,5.3,5,.3,0xdbeafe,true);
storageWingGates.electronics=reserve2Part(17.95,2.5,44,5.3,5,.3,0xdbeafe,true);
colliders.at(-1).storageGate="electronics";
for(const z of [32,35,38,41.5]){
 reserve2Part(17.95,4.88,z,1.6,.05,.5,0xe0f2fe);
 lamps.push({light:ceilingLamp(17.95,z),stockroom:true,requiresUpgrade:"store2"});
}
storageWingGates.dry=reserve2Part(12.65,2.5,37.4,5.3,5,.3,0xe2e8f0,true);
colliders.at(-1).storageGate="dry";
for(const x of [11.6,13.8])for(const z of [32.4,35.4]){
 reserve2Part(x,4.905,z,1.62,.055,.58,0x94a3b8);
 reserve2Part(x,4.869,z,1.49,.024,.46,0xfff7db);
 const light=ceilingLamp(x,z);lamps.push({light,stockroom:true,requiresUpgrade:"store2"});
}
for(const x of [11.6,13.8])for(const z of [25.2,28.5]){
 storageExtensionPart(x,4.905,z,1.62,.055,.58,0x94a3b8);
 const panel=storageExtensionPart(x,4.869,z,1.49,.024,.46,0xfff7db);
 storageExtensionLightPanels.push(panel);
 const lamp=ceilingLamp(x,z);
 lamps.push({light:lamp,stockroom:true,requiresUpgrade:"store1"});
}
wallBaseboard(12.65,23.52,5.0,.07);
for(const x of [10.2,15.08])wallBaseboard(x,20.05,.07,7.0);
// L’extension utilise désormais les mêmes plafonniers LED que l’ancienne réserve.
// Réserve V3 : deux rangées murales uniquement. Aucun meuble au milieu de
// l'allée, de l'accès magasin (x=10,z=5.5) ou devant l'interrupteur (z=7.8).
const dryStorageSlots=[],electronicsStorageSlots=[];
function storageRack(x,z,face,upgrade=null,slots=dryStorageSlots){
 const put=(px,py,pz,w,h,d,col)=>{
  const m=cube(px,py,pz,w,h,d,col);
  if(upgrade==="store2")reserve2Meshes.push(m);
  else if(upgrade==="store1")storageExtensionMeshes.push(m);
  return m;
 };
 for(const y of [.62,1.62,2.62]){
  put(x,y,z,.84,.075,1.65,0x94a3b8);
  put(x,y+.062,z+.80,.84,.07,.035,0x64748b);
  for(const dz of [-.37,.37])slots.push({x,y:y+.367,z:z+dz,face,requiresUpgrade:upgrade});
 }
 for(const dx of [-.38,.38])for(const dz of [-.78,.78])
  put(x+dx,1.66,z+dz,.055,3.32,.055,0x64748b);
 put(x,3.3,z,.82,.07,1.58,0x64748b);
 const hit={minX:x-.44,maxX:x+.44,minZ:z-.82,maxZ:z+.82};
 if(upgrade){
  hit.requiresUpgrade=upgrade;
  if(upgrade==="store1")storageExtensionColliders.push(hit);
 }
 colliders.push(hit);
}
// Mur gauche : interruption sur 2,45 m au niveau de l'interrupteur.
for(const z of [3.1,9.35,11.4,13.45,15.5,17.55,19.6,21.65])
 storageRack(10.75,z,1);
// Mur droit : interruption devant l'accès de la chambre froide z=4.25 à 6.65.
for(const z of [3.2,9.35,11.4,13.45,15.5,17.55,19.6,21.65])
 storageRack(14.55,z,-1);
// Deux rangées supplémentaires, toujours sans étagère au milieu du passage.
for(const z of [25.2,27.35,29.5]){
 storageRack(10.75,z,1,"store1");
 storageRack(14.55,z,-1,"store1");
}
for(const z of [32.4,34.6,36.5])storageRack(10.75,z,1,"store2");
for(const z of [31.5,33.18,36.5])storageRack(14.55,z,-1,"store2");
for(const z of [31.6,33.4,37.6,39.7,41.8])storageRack(16.05,z,1,"store2",electronicsStorageSlots);
for(const z of [31.6,34.1,36.6,39.1,41.6])storageRack(19.85,z,-1,"store2",electronicsStorageSlots);
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
const extensionTiles=tileFloor(19.65,11.7,0,-16);extensionMeshes.push(extensionTiles);
wallBaseboard(0,-21.77,19.5,.07,true);
for(const x of [-9.78,9.78])wallBaseboard(x,-16,.07,11.6,true);
for(const x of [-6,0,6])for(const z of [-14,-19])ceilingPanel(x,z,true);
// Finitions des deux faces de la cloison et des murs de la réserve.
for(const z of [-9.78,-10.22])for(const x of [-6,6])wallBaseboard(x,z,7.7,.065,true);
wallBaseboard(15.08,2.85,.065,2.6);
wallBaseboard(15.08,8.02,.065,2.65);
wallBaseboard(12.65,1.73,5.0,.065);
// Plinthes périphériques de la réserve étendue, interrompues seulement aux portes.
wallBaseboard(10.2,13.0,.07,7.8);
wallBaseboard(15.08,12.4,.07,8.8);
wallBaseboard(11,16.86,2.0,.07);
wallBaseboard(14.55,16.86,1.5,.07);
// Ancienne plinthe du mur de fond supprimée : passage vers la nouvelle réserve.
// Face magasin de la cloison caisse/réserve, sans traverser sa porte.
wallBaseboard(9.78,2.7,.065,2.35);
wallBaseboard(9.78,8.45,.065,2.75);
wallBaseboard(10.22,2.45,.065,1.65);
wallBaseboard(10.22,8.25,.065,2.0);
// Encadrement du passage principal / extension : montants et linteau commerciaux.
const passageTrim=new THREE.MeshStandardMaterial({color:0x64748b,metalness:.28,roughness:.48});
for(const x of [-2.03,2.03]){
 const post=new THREE.Mesh(new THREE.BoxGeometry(.09,3.38,.37),passageTrim);
 post.position.set(x,1.69,-10);scene.add(post);
}
const lintel=new THREE.Mesh(new THREE.BoxGeometry(4.16,.12,.38),passageTrim);
lintel.position.set(0,3.4,-10);scene.add(lintel);
// Bande de seuil fine, affleurante au carrelage, sans obstacle au passage.
const threshold=new THREE.Mesh(new THREE.BoxGeometry(3.8,.012,.18),new THREE.MeshStandardMaterial({color:0x94a3b8,metalness:.45}));
threshold.position.set(0,.028,-10);scene.add(threshold);

extensionCube(0,5.1,-16,20,.2,12,0xf1f5f9);
extensionCube(-10,2.5,-16,.3,5,12,0xe2e8f0);
extensionCube(10,2.5,-16,.3,5,12,0xe2e8f0);
// Passage central vers l'électronique, fermé tant que la deuxième extension n'est pas terminée.
extensionCube(-6,2.5,-22,8,5,.3,0xe2e8f0);
extensionCube(6,2.5,-22,8,5,.3,0xe2e8f0);
extensionCube(0,4.17,-22,4,1.66,.3,0xe2e8f0);
for(const [minX,maxX] of [[-10,-2],[2,10]])
 colliders.push({minX,maxX,minZ:-22.2,maxZ:-21.8,requiresUpgrade:"store1"});
const electronicsGate=cube(0,1.67,-22,3.95,3.34,.25,0x334155);
const electronicsGateCollider={minX:-2,maxX:2,minZ:-22.2,maxZ:-21.8,disabled:false};
colliders.push(electronicsGateCollider);
// Hall supplémentaire de 20 × 12 m.
const electronicsMeshes=[];
function electronicsCube(x,y,z,w,h,d,color){
 const mesh=cube(x,y,z,w,h,d,color);electronicsMeshes.push(mesh);return mesh;
}
electronicsCube(0,-.15,-28,20,.3,12,0xb0bccd);
const electronicsTiles=tileFloor(19.65,11.7,0,-28);electronicsMeshes.push(electronicsTiles);
electronicsCube(0,5.1,-28,20,.2,12,0xe2e8f0);
electronicsCube(-10,2.5,-28,.3,5,12,0xdbeafe);
electronicsCube(10,2.5,-28,.3,5,12,0xdbeafe);
electronicsCube(-6.65,2.5,ANNEX_ENTRY,6.7,5,.3,0xdbeafe);
electronicsCube(6.65,2.5,ANNEX_ENTRY,6.7,5,.3,0xdbeafe);
electronicsCube(0,4.2,ANNEX_ENTRY,6.6,1.6,.3,0xdbeafe);
const annexGate=electronicsCube(0,1.7,ANNEX_ENTRY,6.6,3.4,.3,0x475569);
const annexGroups=new Map();
const mallShell=new THREE.Group();scene.add(mallShell);
function openDepartmentCount(){
 let count=0;
 for(const department of DEPARTMENTS){
  if(!state.upgrades[department.id])break;
  count++;
 }
 return count;
}
for(const x of [-6,0,6])for(const z of [-26,-31]){
 electronicsCube(x,4.94,z,2.8,.05,.55,0xf8fafc);
 const lamp=ceilingLamp(x,z);lamps.push({light:lamp,requiresUpgrade:"store2"});
}
for(const x of [-9.7,9.7])electronicsCube(x,.12,-28,.08,.24,11.5,0x64748b);
electronicsCube(0,.12,-33.74,19.2,.24,.08,0x64748b);
electronicsCube(0,.035,-22,3.8,.015,.2,0x94a3b8);
for(const x of [-6,0,6])for(const z of [-14,-19])extensionCube(x,4.94,z,2.8,.05,.5,0xffffff);
// Rayonnages muraux, avec tablettes inclinées et bordures.
const wallProductRacks=[];
function addWallRack(product){
 const {x,z}=product,rotation=product.rotation*Math.PI/2;
 const extension=product.license==="extensionLicense";
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
 const productSign=shelfSign(product.name);
 productSign.position.set(0,2.65,0);rack.add(productSign);
 wallProductRacks.push({rack,product,rotation});
 scene.add(rack);
 if(extension)extensionMeshes.push(rack);
 const alongX=Math.abs(Math.cos(rotation))>.5;
 colliders.push({minX:x-(alongX?1.3:.42),maxX:x+(alongX?1.3:.42),
  minZ:z-(alongX?.42:1.3),maxZ:z+(alongX?.42:1.3),
  ...(extension?{requiresUpgrade:"store1"}:{})});
}
for(const p of catalog.filter(p=>p.kind==="wall"))addWallRack(p);
function buildStorageWings(){
 for(const kind of STORAGE_KINDS){
  const wing=STORAGE_WINGS[kind];
  const count=capacityUpgrades.filter(u=>u.capacity[kind]).length;
  const center=(wing.minX+wing.maxX)/2, width=wing.maxX-wing.minX;
  const walls=new THREE.MeshStandardMaterial({color:wing.wall});
  const flooring=new THREE.MeshStandardMaterial({color:wing.floor});
  const racks=new THREE.MeshStandardMaterial({color:kind==="cold"?0x789cb4:0x64748b});
  for(let i=0;i<count;i++){
   const group=new THREE.Group(),z=wing.start+(i+.5)*STORAGE_BAY_DEPTH;
   const part=(x,y,depth,w,h,d,material)=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,depth);group.add(m);return m;
   };
   part(center,-.15,z,width,.3,STORAGE_BAY_DEPTH,flooring);
   part(center,5.1,z,width,.2,STORAGE_BAY_DEPTH,walls);
   const back=part(center,2.5,z+STORAGE_BAY_DEPTH/2,width,5,.3,walls);
   for(const side of [-1,1]){
    const x=center+side*width/2;
    part(x,2.5,z,.25,5,STORAGE_BAY_DEPTH,walls);
    const rack=x-side*.49;
    for(const y of [.55,1.55,2.55])part(rack,y,z,.66,.07,3.6,racks);
    for(const end of [-1,1])part(rack,1.55,z+end*1.76,.06,3.1,.07,racks);
   }
   scene.add(group);storageWingGroups[kind].push({group,back});
  }
 }
}
buildStorageWings();
function refreshExtension(){
 const unlocked=!!state.upgrades.store1;
 const electronicsUnlocked=!!state.upgrades.store2;
 extensionGate.visible=!unlocked;
 extensionGateCollider.disabled=unlocked;
 for(const mesh of extensionMeshes)mesh.visible=unlocked;
 electronicsGate.visible=unlocked&&!electronicsUnlocked;
 electronicsGateCollider.disabled=electronicsUnlocked||!unlocked;
 for(const mesh of electronicsMeshes)mesh.visible=electronicsUnlocked;
 const mallOpen=openDepartmentCount()>0;
 annexGate.visible=electronicsUnlocked&&!mallOpen;
 mallShell.visible=mallOpen;
 for(const [id,room] of annexGroups){
  room.group.visible=mallOpen;
  room.gate.visible=!state.upgrades[id];
  if(!state.upgrades[id])room.furnishings.visible=false;
 }
 // La même amélioration agrandit aussi la surface exploitable du stockage.
 oldReserveEndWall.visible=!unlocked;
 oldReserveWallCollider.disabled=unlocked;
 for(const mesh of storageExtensionMeshes)mesh.visible=unlocked;
 reserve2Gate.visible=unlocked&&!electronicsUnlocked;
 reserve2GateCollider.disabled=electronicsUnlocked||!unlocked;
 for(const mesh of reserve2Meshes)mesh.visible=electronicsUnlocked;
 for(const kind of STORAGE_KINDS){
  const count=storageBayCount(kind);
  storageWingGates[kind].visible=(kind==="cold"||electronicsUnlocked)&&count===0;
  storageWingGroups[kind].forEach(({group,back},i)=>{
   group.visible=i<count;
   back.visible=i===count-1;
  });
 }
}
// Équipe de chantier niveau 4 : ouvriers visibles devant le passage de l'extension.
const constructionCrew=[];
function createBuilder(x,z,color){
 const group=new THREE.Group();
 const vest=new THREE.MeshStandardMaterial({color,roughness:.85});
 const hardhat=new THREE.MeshStandardMaterial({color:0xfacc15});
 const skin=new THREE.MeshStandardMaterial({color:0xd7a17c});
 const dark=new THREE.MeshStandardMaterial({color:0x334155});
 const steel=new THREE.MeshStandardMaterial({color:0x94a3b8,metalness:.45});
 function part(w,h,d,mat,px,py,pz,parent=group){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(px,py,pz);parent.add(m);return m;
 }
 part(.52,.73,.30,vest,0,1.24,0);
 part(.34,.34,.32,skin,0,1.81,0);
 part(.43,.14,.4,hardhat,0,2.04,0);
 part(.56,.045,.48,hardhat,0,1.99,.04);
 for(const px of [-.16,.16])part(.2,.73,.22,dark,px,.45,0);
 for(const px of [-.16,.16])part(.065,.58,.018,steel,px,1.23,.16);
 part(.18,.63,.18,vest,-.35,1.23,0);
 const arm=new THREE.Group();arm.position.set(.34,1.57,0);group.add(arm);
 part(.18,.63,.18,vest,0,-.30,0,arm);
 part(.07,.36,.07,dark,0,-.7,.06,arm);
 part(.26,.12,.12,steel,0,-.89,.06,arm);
 group.position.set(x,0,z);group.rotation.y=Math.PI;scene.add(group);
 constructionCrew.push({group,arm,offset:constructionCrew.length*1.6});
}
if(!DEV_MODE){
 createBuilder(-2.85,-8.75,0xf97316);
 createBuilder(2.85,-8.75,0xfacc15);
}
let constructionAnimation=0,constructionAutosave=0;
function updateConstructionUI(){
 const active=!!state.construction&&!state.upgrades[state.construction.target||"store1"];
 const ui=$("constructionHud");
 if(ui){
  ui.style.display=active?"block":"none";
  if(active){
   const pct=constructionPercent();
   $("constructionProgress").textContent=pct+" %";
   $("constructionBar").style.width=pct+"%";
   const title=$("constructionHud").querySelector("span");
   if(title)title.textContent=state.construction.target==="store2"?"CHANTIER — ÉLECTRONIQUE":"CHANTIER — EXTENSION";
   $("constructionStage").textContent=constructionOnShift()?constructionStage()+" · Ouvriers 8 h–17 h":
     state.hour<CONSTRUCTION_START_HOUR?"Reprise des travaux à 8 h":
     "Travaux arrêtés à 17 h — reprise demain à 8 h";
  }
 }
 for(const w of constructionCrew){
  const target=active?state.construction.target:null;
  const project=upgradeCatalog.find(u=>u.id===target);
  const front=project?.front;
  if(front!==undefined&&openDepartmentCount()){
   w.group.position.x=project.x+Math.sign(w.offset-.5)*1.4;
   w.group.position.z=front+1.25;
  }else{
   w.group.position.x=w.offset===0?-2.85:2.85;
   w.group.position.z=front!==undefined?ANNEX_ENTRY+1.4:target==="store2"?-20.1:-8.75;
  }
  w.group.visible=active&&constructionOnShift();
  if(!constructionOnShift()){w.arm.rotation.x=0;w.group.position.y=0;}
 }
}
function updateConstruction(dt){
 if(!state.construction||state.upgrades[state.construction.target||"store1"])return;
 // Chantier actif uniquement de 08 h à 17 h : neuf heures de travail par journée.
 // 450 secondes réelles = une journée complète d'ouvriers dans le temps du jeu.
 if(constructionOnShift()){
  const workSeconds=Math.min(dt,Math.max(0,CONSTRUCTION_SHIFT_SECONDS-dayTimer));
  state.construction.progress+=workSeconds/CONSTRUCTION_SHIFT_SECONDS;
  constructionAnimation+=dt;
  for(const w of constructionCrew){
   w.arm.rotation.x=-.5+Math.sin(constructionAnimation*5+w.offset)*.8;
   w.group.position.y=.015*Math.abs(Math.sin(constructionAnimation*2+w.offset));
  }
 }
 constructionAutosave+=dt;
 if(constructionAutosave>=5){constructionAutosave=0;save();}
 if(state.construction.progress>=CONSTRUCTION_DAYS-CONSTRUCTION_PROGRESS_TOLERANCE){
  const target=state.construction.target||"store1";
  state.construction=null;state.upgrades[target]=true;
  updateConstructionUI();sync();
  toast("Travaux terminés · "+upgradeCatalog.find(u=>u.id===target)?.name);
 }else updateConstructionUI();
}
updateConstructionUI();

cube(-6,2.5,10,8,5,.3,0xe2e8f0,true);
cube(6,2.5,10,8,5,.3,0xe2e8f0,true);
cube(0,4.2,10,4,1.6,.3,0xe2e8f0);
// Identité commerciale FBA : enseignes fixées aux murs, visibles en entrant.
function brandPanel(title,subtitle,width=5.6,height=1.0){
 const c=document.createElement("canvas");c.width=1024;c.height=256;
 const ctx=c.getContext("2d");
 ctx.fillStyle="#101827";ctx.fillRect(0,0,1024,256);
 ctx.fillStyle="#38bdf8";ctx.fillRect(0,0,1024,12);ctx.fillRect(0,244,1024,12);
 ctx.fillStyle="#ffffff";ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.font="900 99px Arial";ctx.fillText(title,512,102,950);
 ctx.fillStyle="#7dd3fc";ctx.font="bold 44px Arial";ctx.fillText(subtitle,512,193,940);
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,depthTest:true}));
 return m;
}
const electronicsBrand=brandPanel("FBA ÉLECTRONIQUE","TÉLÉPHONES · AUDIO · INFORMATIQUE · DRONES",4.5,.9);
electronicsBrand.position.set(0,4.14,-21.78);scene.add(electronicsBrand);electronicsMeshes.push(electronicsBrand);
const entranceBrand=brandPanel("FBA SUPERMARKET","BUSINESS EMPIRE SIMULATOR",5.6,1.25);
// Face extérieure du mur d’entrée (z positif), texte orienté vers le visiteur.
entranceBrand.position.set(0,4.24,10.20);scene.add(entranceBrand);
// Enseigne au-dessus de l’entrée de la réserve, face au magasin.
const reserveBrand=brandPanel("ZONE STOCKAGE","RÉSERVE — PRODUITS SECS",2.9,.67);
reserveBrand.position.set(9.78,4.15,5.5);reserveBrand.rotation.y=-Math.PI/2;scene.add(reserveBrand);
const electronicsStorageBrand=brandPanel("RÉSERVE ÉLECTRONIQUE","STOCKAGE DES CARTONS",2.6,.62);
electronicsStorageBrand.position.set(15.08,4.14,35);
electronicsStorageBrand.rotation.y=-Math.PI/2;scene.add(electronicsStorageBrand);reserve2Meshes.push(electronicsStorageBrand);
const corridorBrand=brandPanel("FBA SUPERMARKET","EXTENSION DU MAGASIN",3.75,.72);
corridorBrand.position.set(0,4.18,-9.78);scene.add(corridorBrand);

cube(0,-.17,12,8,.3,5,0x94a3b8);
cube(0,.015,8.5,3,.03,2,0x334155);
for(const x of [-6,0,6])for(const z of [-6,0,6])cube(x,4.94,z,2.8,.05,.5,0xffffff);
// Emballages 3D stylisés, avec étiquettes lisibles et silhouettes distinctes.
const productTextures={};
function packageTexture(p){
 if(productTextures[p.id])return productTextures[p.id];
 // Texture haute définition : nom très lisible sur la face avant du paquet.
 const c=document.createElement("canvas");
 const scale=p.department?.5:1;
 c.width=512*scale;c.height=512*scale;
 const x=c.getContext("2d");x.scale(scale,scale);
 x.fillStyle="#"+p.color.toString(16).padStart(6,"0");x.fillRect(0,0,512,512);
 x.fillStyle="#ffffff";x.fillRect(18,62,476,370);
 x.fillStyle="#172033";x.textAlign="center";x.textBaseline="middle";
 const words=p.name.split(" ");const lines=[];let line="";
 for(const word of words){
  const trial=(line+" "+word).trim();
  if(line&&trial.length>12){lines.push(line);line=word;}else line=trial;
 }
 if(line)lines.push(line);
 const visible=lines.slice(0,3),fontSize=visible.length>2?67:visible.length>1?83:106;
 x.font="900 "+fontSize+"px Arial";
 visible.forEach((v,i)=>x.fillText(v,256,246+(i-(visible.length-1)/2)*(fontSize+13),460));
 x.fillStyle="#172033";x.fillRect(18,455,476,14);
 const t=new THREE.CanvasTexture(c);
 t.colorSpace=THREE.SRGBColorSpace;
 t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 productTextures[p.id]=t;return t;
}
function productModel(p){
 const g=new THREE.Group(),base=new THREE.MeshStandardMaterial({color:p.color,roughness:.72});
 const label=new THREE.MeshStandardMaterial({map:packageTexture(p),roughness:.68});
 const white=new THREE.MeshStandardMaterial({color:0xf1f5f9,roughness:.65});
 const add=(geometry,material,x=0,y=0,z=0)=>{
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);g.add(mesh);return mesh;
 };
 if(p.id==="eau"||p.id==="jus"){
  const bottle=p.id==="eau";
  add(new THREE.CylinderGeometry(bottle?.105:.14,bottle?.115:.14,.35,10),base,0,.015,0);
  add(new THREE.CylinderGeometry(.055,.065,.09,10),white,0,.235,0);
  add(new THREE.CylinderGeometry(.065,.065,.04,10),new THREE.MeshStandardMaterial({color:0x1d4ed8}),0,.30,0);
  // Étiquette cylindrique courbée autour de la bouteille, face imprimée vers l'allée (+Z).
  // Arc de 240° : le nom reste centré devant, les bords épousent la bouteille.
  const curvedLabel=new THREE.Mesh(
   new THREE.CylinderGeometry(bottle?.119:.145,bottle?.119:.145,.18,32,1,true,-Math.PI*2/3,Math.PI*4/3),
   label
  );
  curvedLabel.position.y=.02;
  g.add(curvedLabel);
 }else if(p.id==="conserves"){
  add(new THREE.CylinderGeometry(.15,.15,.32,16),base,0,0,0);
  add(new THREE.CylinderGeometry(.152,.152,.022,16),white,0,.16,0);
  add(new THREE.CylinderGeometry(.152,.152,.022,16),white,0,-.16,0);
  add(new THREE.CylinderGeometry(.154,.154,.22,24,1,true),label,0,0,0);
 }else if(p.id==="papier"){
  for(const x of [-.12,.12]){
   const roll=add(new THREE.CylinderGeometry(.12,.12,.27,14),base,x,0,0);
   roll.rotation.x=Math.PI/2;
   const core=add(new THREE.CylinderGeometry(.034,.034,.275,12),new THREE.MeshStandardMaterial({color:0xb8a38e}),x,0,0);
   core.rotation.x=Math.PI/2;
  }
 }else if(p.id==="pommes"){
  add(new THREE.SphereGeometry(.18,12,10),base);
  add(new THREE.CylinderGeometry(.018,.025,.09,6),new THREE.MeshStandardMaterial({color:0x365314}),0,.18,0);
 }else if(p.kind==="electronics"){
  const black=new THREE.MeshStandardMaterial({color:0x111827,roughness:.25,metalness:.2});
  const screen=new THREE.MeshStandardMaterial({color:p.color,emissive:p.color,emissiveIntensity:.17});
  const metal=new THREE.MeshStandardMaterial({color:0x94a3b8,metalness:.65,roughness:.3});
  if(p.id==="smartphones"){
   add(new THREE.BoxGeometry(.23,.43,.045),black);
   add(new THREE.BoxGeometry(.20,.37,.007),screen,0,0,.028);
  }else if(p.id==="ecouteurs"){
   for(const x of [-.10,.10]){
    add(new THREE.SphereGeometry(.075,9,8),white,x,.04,.03);
    add(new THREE.CylinderGeometry(.022,.024,.20,8),metal,x,-.12,.03);
   }
  }else if(p.id==="casques"){
   const band=add(new THREE.TorusGeometry(.16,.042,7,18,Math.PI),black,0,.03,0);
   band.rotation.z=Math.PI;
   for(const x of [-.16,.16])add(new THREE.BoxGeometry(.085,.19,.13),screen,x,-.10,0);
  }else if(p.id==="ordinateurs"){
   add(new THREE.BoxGeometry(.42,.29,.045),black,0,.09,0);
   add(new THREE.BoxGeometry(.38,.25,.008),screen,0,.09,.029);
   add(new THREE.BoxGeometry(.48,.025,.33),metal,0,-.08,.13);
  }else if(p.id==="tablettes"){
   add(new THREE.BoxGeometry(.40,.47,.038),black);
   add(new THREE.BoxGeometry(.36,.42,.009),screen,0,0,.024);
  }else if(p.id==="montres"){
   add(new THREE.BoxGeometry(.105,.42,.032),base);
   add(new THREE.BoxGeometry(.17,.18,.065),metal,0,.025,.022);
   add(new THREE.BoxGeometry(.145,.155,.009),screen,0,.025,.06);
  }else if(p.id==="appareils_photo"){
   add(new THREE.BoxGeometry(.35,.23,.14),black);
   add(new THREE.BoxGeometry(.16,.055,.11),base,-.055,.13,0);
   const lens=add(new THREE.CylinderGeometry(.102,.113,.10,16),metal,0,0,.11);
   lens.rotation.x=Math.PI/2;
   add(new THREE.CircleGeometry(.077,16),screen,0,0,.163);
  }else if(p.id==="enceintes"){
   add(new THREE.CylinderGeometry(.115,.115,.38,16),base);
   for(const y of [-.19,.19])add(new THREE.CylinderGeometry(.113,.113,.018,16),black,0,y,0);
   add(new THREE.BoxGeometry(.035,.095,.014),metal,0,.095,.111);
  }else if(p.id==="claviers"){
   add(new THREE.BoxGeometry(.46,.16,.036),black);
   for(const y of [-.04,.009,.058])add(new THREE.BoxGeometry(.39,.025,.013),metal,0,y,.022);
  }else if(p.id==="drones"){
   add(new THREE.BoxGeometry(.25,.085,.20),base);
   for(const x of [-.20,.20])for(const z of [-.19,.19]){
    add(new THREE.BoxGeometry(.23,.035,.035),black,x/2,0,z/2);
    add(new THREE.CylinderGeometry(.10,.10,.018,10),metal,x,.06,z);
   }
  }
 }else if(p.id==="fromage"){
  add(new THREE.CylinderGeometry(.17,.17,.15,3),base);
  add(new THREE.BoxGeometry(.22,.035,.12),label,0,.09,0);
 }else if(p.id==="surgeles"){
  add(new THREE.BoxGeometry(.36,.075,.32),label);
  add(new THREE.BoxGeometry(.33,.025,.29),base,0,.048,0);
 }else{
  const tall=p.id==="cafe"||p.id==="cereales";
  const h=tall?.49:.39,w=tall?.29:.33;
  const silver=new THREE.MeshStandardMaterial({color:0xcbd5e1,metalness:.35,roughness:.36});
  const dark=new THREE.MeshStandardMaterial({color:0x334155,roughness:.7});
  // Formes adaptées aux produits : sachets souples, briques, boîtes et flacons.
  if(p.id==="pates"||p.id==="riz"||p.id==="cafe"){
   const bag=add(new THREE.BoxGeometry(w,h,.25),[base,base,base,base,label,base]);
   add(new THREE.BoxGeometry(w*.96,.035,.265),silver,0,h/2+.008,0);
   add(new THREE.BoxGeometry(w*.96,.028,.265),silver,0,-h/2+.008,0);
   // Soudures latérales caractéristiques des sachets alimentaires.
   for(const x of [-w/2,w/2])add(new THREE.BoxGeometry(.018,h*.92,.26),base,x,0,0);
  }else if(p.id==="savon"){
   // Flacon de savon à pompe.
   add(new THREE.BoxGeometry(.25,.34,.22),base,0,-.035,0);
   add(new THREE.PlaneGeometry(.22,.27),label,0,-.035,.113);
   add(new THREE.CylinderGeometry(.045,.045,.075,10),white,0,.175,0);
   add(new THREE.BoxGeometry(.15,.035,.055),dark,.045,.22,0);
  }else if(p.id==="chocolat"){
   // Tablette plate sous emballage avec pliures sur les côtés.
   add(new THREE.BoxGeometry(.34,.39,.095),[base,base,base,base,label,base]);
   for(const x of [-.16,.16])add(new THREE.BoxGeometry(.018,.36,.105),silver,x,0,0);
  }else if(p.id==="biscuits"){
   // Paquet de biscuits rectangulaire et coutures de fermeture.
   add(new THREE.BoxGeometry(.34,.34,.30),[base,base,base,base,label,base]);
   for(const y of [-.17,.17])add(new THREE.BoxGeometry(.32,.022,.31),silver,0,y,0);
  }else{
   // Boîte rigide de céréales et autres produits secs.
   add(new THREE.BoxGeometry(w,h,.27),[base,base,base,base,label,base]);
   add(new THREE.BoxGeometry(w*.9,.035,.23),white,0,h/2+.018,0);
   add(new THREE.BoxGeometry(w*.92,.02,.23),dark,0,-h/2,0);
  }
 }
 return g;
}
// Réglettes de prix en euros, visibles sur le bord avant des rayons.
const priceLabelTextures={};
function addPriceRail(parent,p,y,width,front){
 const key=p.id;
 if(!priceLabelTextures[key]){
  const canvas=document.createElement("canvas");
  const scale=p.department?.5:1;
  canvas.width=512*scale;canvas.height=192*scale;
  const ctx=canvas.getContext("2d");ctx.scale(scale,scale);
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,512,192);
  ctx.strokeStyle="#cbd5e1";ctx.lineWidth=5;ctx.strokeRect(3,3,506,186);
  ctx.fillStyle="#0f172a";ctx.textAlign="left";ctx.textBaseline="middle";
  ctx.font="bold 40px Arial";ctx.fillText(p.name,22,51,468);
  ctx.font="bold 83px Arial";ctx.fillText(p.price.toFixed(2).replace(".",",")+" €",22,131,468);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  tex.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  priceLabelTextures[key]=tex;
 }
 // Réglette discrète au bord du plateau, avec un seul petit porte-prix.
 const rail=new THREE.Mesh(new THREE.BoxGeometry(width,.065,.025),new THREE.MeshStandardMaterial({color:0xcbd5e1,roughness:.6}));
 rail.position.set(0,y,front);parent.add(rail);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(.52,.195),new THREE.MeshBasicMaterial({map:priceLabelTextures[key],side:THREE.DoubleSide}));
 sign.position.set(0,y-.018,front+.016);parent.add(sign);
}
function addShelfDividers(parent,y,width){
 const mat=new THREE.MeshStandardMaterial({color:0xb6c8d5,transparent:true,opacity:.58,roughness:.22,depthWrite:false});
 for(const x of [-width*.30,-width*.10,width*.10,width*.30]){
  const divider=new THREE.Mesh(new THREE.BoxGeometry(.018,.13,.85),mat);
  divider.position.set(x,y+.115,0);parent.add(divider);
 }
}
const displays={},departmentDisplays=new Map(),extraShelves=[];
let freezerLid=null,freezerOpen=false;
let fridgeDoor=null,fridgeOpen=false;
for(const p of catalog){
 displays[p.id]=[];
 if(p.kind==="extension"||p.kind==="electronics"||p.kind==="wall"||p.kind==="department")continue;
 for(const z of (p.z!==undefined?[p.z]:[-4,1])){
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
   if(!isFruit){addPriceRail(group,p,y+.025,2.4,.525);addShelfDividers(group,y,2.4);}
   else addPriceRail(group,p,y+.025,2.4,.525);
   if(isFruit){
    const wood=new THREE.MeshStandardMaterial({color:0x8b5a2b,roughness:.9});
    for(const x of [-1.1,0,1.1]){
     const side=new THREE.Mesh(new THREE.BoxGeometry(.035,.12,.94),wood);
     side.position.set(x,y+.11,0);side.rotation.x=tilt;group.add(side);
    }
   }
   // Dix articles par plateau : cinq devant et cinq derrière, trente par meuble.
   for(let i=0;i<10;i++){
    const item=productModel(p);
    const col=i%5,row=Math.floor(i/5);
    item.position.set(-.96+col*.48,y+(isFruit?.23:.26),row===0?.22:-.22);
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
// Repères de rayons : noms visibles et surbrillance du rayon du carton porté.
const shelfGuides={};
function shelfSign(label){
 const canvas=document.createElement("canvas");canvas.width=512;canvas.height=128;
 const ctx=canvas.getContext("2d");
 ctx.fillStyle="#0f172a";ctx.fillRect(0,0,512,128);
 ctx.strokeStyle="#38bdf8";ctx.lineWidth=8;ctx.strokeRect(5,5,502,118);
 ctx.fillStyle="#ffffff";ctx.font="bold 43px Arial";ctx.textAlign="center";
 ctx.fillText(label,256,80,480);
 const texture=new THREE.CanvasTexture(canvas);
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:true,depthWrite:false}));
 sprite.scale.set(2.5,.62,1);return sprite;
}
function addShelfGuide(p,x,z,rotation=0){
 const group=new THREE.Group();group.position.set(x,0,z);group.rotation.y=rotation;
 const sign=shelfSign(p.name);sign.position.set(0,2.72,0);group.add(sign);
 // Balise lumineuse sur toute la hauteur et la largeur du meuble, visible à travers les murs.
 const isCompact=!!p.level&&p.kind!=="electronics"&&p.kind!=="extension"&&p.kind!=="froid"&&p.kind!=="congelateur"&&p.kind!=="wall";
 const width=isCompact?1.3:p.kind==="froid"?1.35:p.kind==="congelateur"?1.55:2.9;
 const depth=isCompact?.95:p.kind==="congelateur"?3.6:p.kind==="froid"?1.8:1.2;
 const height=p.kind==="congelateur"?1.35:2.5;
 const geometry=new THREE.BoxGeometry(width,height,depth);
 const highlight=new THREE.Group();
 const glow=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({
  color:0x00e5ff,transparent:true,opacity:.22,depthTest:false,depthWrite:false,side:THREE.DoubleSide
 }));
 glow.renderOrder=997;highlight.add(glow);
 const edges=new THREE.LineSegments(
  new THREE.EdgesGeometry(geometry),
  new THREE.LineBasicMaterial({color:0x00ffff,transparent:true,opacity:1,depthTest:false,depthWrite:false})
 );
 edges.renderOrder=1000;highlight.add(edges);
 // Montants lumineux verticaux et bordures rendent le rayon identifiable de loin.
 highlight.position.y=height/2;group.add(highlight);
 scene.add(group);shelfGuides[p.id+"@"+z]={group,highlight,sign,p};
}
function updateShelfGuides(){
 for(const guide of Object.values(shelfGuides)){
  const active=!!held&&held.id===guide.p.id&&productAvailable(guide.p);
  guide.group.visible=productAvailable(guide.p)&&(guide.p.kind!=="extension"||!!state.upgrades.store1)&&
   (guide.p.kind!=="electronics"||!!state.upgrades.store2);
  guide.highlight.visible=active;
  guide.sign.visible=guide.group.visible&&guide.p.kind!=="wall"&&guide.p.kind!=="electronics"&&guide.p.kind!=="department";
 }
}
const extensionProductGroups={};
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
  addPriceRail(rack,p,y+.025,2.65,.505);
  addShelfDividers(rack,y,2.65);
 }
 for(let i=0;i<CAPACITY;i++){
  const tier=Math.floor(i/10),slot=i%10;
  const item=productModel(p);
  item.position.set(-1.08+(slot%5)*.52,.72+tier*.67,slot<5?-.20:.19);
  rack.add(item);displays[p.id].push(item);
 }
 for(const px of [-1.27,1.27])for(const pz of [-.43,.43]){
  const post=new THREE.Mesh(new THREE.BoxGeometry(.075,2.35,.075),metal);
  post.position.set(px,1.175,pz);rack.add(post);
 }
 scene.add(rack);extensionProductGroups[p.id]=rack;extensionMeshes.push(rack);
 addShelfGuide(p,p.x,p.z);
 colliders.push({minX:p.x-1.4,maxX:p.x+1.4,minZ:p.z-.55,maxZ:p.z+.55,requiresUpgrade:"store1"});
}

// Vitrines orientées vers l’allée centrale, sur les deux côtés et au fond.
const electronicsProductGroups={};
for(const p of catalog.filter(p=>p.kind==="electronics")){
 const angle=p.rotation*Math.PI/2;
 const rack=new THREE.Group();rack.position.set(p.x,0,p.z);rack.rotation.y=angle;
 const sign=shelfSign(p.name);sign.position.y=2.65;rack.add(sign);
 const steel=new THREE.MeshStandardMaterial({color:0x475569,metalness:.5,roughness:.35});
 const glass=new THREE.MeshStandardMaterial({color:0x8ecce0,transparent:true,opacity:.25,depthWrite:false});
 for(const y of [.45,1.15,1.85]){
  const shelf=new THREE.Mesh(new THREE.BoxGeometry(2.55,.08,.96),steel);
  shelf.position.y=y;rack.add(shelf);
  const front=new THREE.Mesh(new THREE.BoxGeometry(2.55,.20,.03),glass);
  front.position.set(0,y+.13,.48);rack.add(front);
  addPriceRail(rack,p,y+.02,2.55,.51);
 }
 for(const x of [-1.25,1.25])for(const z of [-.46,.46]){
  const post=new THREE.Mesh(new THREE.BoxGeometry(.06,2.4,.06),steel);
  post.position.set(x,1.2,z);rack.add(post);
 }
 const sample=productModel(p);
 for(let i=0;i<CAPACITY;i++){
  const tier=Math.floor(i/10),slot=i%10,item=sample.clone();
  item.position.set(-1.02+(slot%5)*.51,.70+tier*.70,slot<5?-.20:.19);
  rack.add(item);displays[p.id].push(item);
 }
 scene.add(rack);electronicsProductGroups[p.id]=rack;electronicsMeshes.push(rack);
 const alongX=p.rotation%2===0,halfX=alongX?1.35:.60,halfZ=alongX?.60:1.35;
 colliders.push({minX:p.x-halfX,maxX:p.x+halfX,minZ:p.z-halfZ,maxZ:p.z+halfZ,requiresUpgrade:"store2"});
 addShelfGuide(p,p.x,p.z,angle);
}
// Assortiment des rayonnages muraux et des trois gondoles du fond.
for(const item of wallProductRacks){
 const p=item.product;
 for(const y of [.45,1.15,1.85])addPriceRail(item.rack,p,y+.025,2.55,.41);
 const sample=productModel(p);
 for(let i=0;i<CAPACITY;i++){
  const tier=Math.floor(i/10),slot=i%10;
  const model=sample.clone();
  model.position.set(-1.02+(slot%5)*.51,.69+tier*.70,slot<5?-.18:.18);
  item.rack.add(model);displays[p.id].push(model);
 }
 addShelfGuide(p,p.x,p.z,item.rotation);
}
for(const p of catalog.filter(p=>p.kind!=="extension"&&p.kind!=="electronics"&&p.kind!=="wall"&&p.kind!=="department"))for(const z of (p.z!==undefined?[p.z]:[-4,1]))addShelfGuide(p,p.x,z);
// Cinq rangées reliées par un axe central et des allées transversales.
function mallPart(group,x,y,z,w,h,d,material){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.position.set(x,y,z);group.add(mesh);return mesh;
}
function mallSign(group,title,subtitle,x,z,rotation=0,width=6){
 const sign=brandPanel(title,subtitle,width,.95);
 sign.material.side=THREE.FrontSide;
 sign.position.set(x,3.55,z);sign.rotation.y=rotation;group.add(sign);
 return sign;
}
const mallCenter=(ANNEX_ENTRY+MALL_MIN_Z)/2;
const mallSize=ANNEX_ENTRY-MALL_MIN_Z;
const mallWallMaterial=new THREE.MeshStandardMaterial({color:0xcbd5e1});
const mallFloorMaterial=new THREE.MeshStandardMaterial({color:0xaabacb});
const plazaMaterial=new THREE.MeshStandardMaterial({color:0xd2e4e6});
const guideMaterial=new THREE.MeshBasicMaterial({color:0x69b8b4});
mallPart(mallShell,0,-.16,mallCenter,2*MALL_HALF_WIDTH,.3,mallSize,mallFloorMaterial);
mallPart(mallShell,0,5.1,mallCenter,2*MALL_HALF_WIDTH,.2,mallSize,mallWallMaterial);
mallPart(mallShell,0,2.5,MALL_MIN_Z,2*MALL_HALF_WIDTH,5,.3,mallWallMaterial);
for(const side of [-1,1]){
 mallPart(mallShell,side*MALL_HALF_WIDTH,2.5,mallCenter,.3,5,mallSize,mallWallMaterial);
 mallPart(mallShell,side*16.65,2.5,ANNEX_ENTRY,26.7,5,.3,mallWallMaterial);
 mallPart(mallShell,side*3.05,.012,mallCenter,.09,.015,mallSize-2,guideMaterial);
}
mallPart(mallShell,0,.003,MALL_PLAZA_Z,31,.018,11,plazaMaterial);
mallSign(mallShell,"GALERIE FBA","↑ PLACE CENTRALE · ← AILE OUEST · AILE EST →",0,ANNEX_ENTRY-2,0,6.5);
mallSign(mallShell,"PLACE CENTRALE","← AILE OUEST · ↑ FOND DE GALERIE · AILE EST →",0,MALL_PLAZA_Z-3,0,7.5);
mallSign(mallShell,"SORTIE","↑ ÉLECTRONIQUE · MAGASIN · CAISSES",0,MALL_PLAZA_Z+3,Math.PI,6.5);
mallSign(mallShell,"PLAN DE LA GALERIE","SUR LA PLACE · APPUIE SUR INTERAGIR",4.4,MALL_PLAZA_Z-.6,0,4.4);
for(const [z,west,east] of [
 [ANNEX_ENTRY-5,"BOISSONS · PRIMEUR","BOULANGERIE · HYGIÈNE"],
 [ANNEX_ENTRY-16,"BOUCHERIE · JEUX VIDÉO","POISSONNERIE · ANIMALERIE"],
 [ANNEX_ENTRY-29,"MAISON","RETRAIT DES COMMANDES"],
 [ANNEX_ENTRY-40,"CUISINES DU MONDE · TEXTILE","JARDIN · RÉCEPTION"],
 [ANNEX_ENTRY-51,"VRAC · EXPÉDITION","PROFESSIONNELS · ÉVÉNEMENTS"],
]){
 mallSign(mallShell,"← "+west,"AILE OUEST", -4.2,z,0,6.1);
 mallSign(mallShell,east+" →","AILE EST",4.2,z,0,6.1);
}

// Une instance par emplacement, regroupée en un seul objet de rendu
// par pièce du modèle. Les trente emplacements restent utilisables.
function departmentProductBatch(parent,product){
 const model=productModel(product);
 const transform=new THREE.Matrix4();
 const position=new THREE.Vector3(),rotation=new THREE.Quaternion(),scale=new THREE.Vector3(.67,.67,.67);
 const result=[];
 for(const piece of model.children){
  const batch=new THREE.InstancedMesh(piece.geometry,piece.material,CAPACITY);
  piece.updateMatrix();
  for(let index=0;index<CAPACITY;index++){
   const tier=Math.floor(index/10),slot=index%10;
   position.set(-.64+(slot%5)*.32,.65+tier*.65,slot<5?-.16:.16);
   transform.compose(position,rotation,scale).multiply(piece.matrix);
   batch.setMatrixAt(index,transform);
  }
  batch.computeBoundingSphere();
  parent.add(batch);result.push(batch);
 }
 departmentDisplays.set(product.id,result);
}
let bakeryScene=null;
for(const [index,department] of DEPARTMENTS.entries()){
 const group=new THREE.Group(),furnishings=new THREE.Group();
 furnishings.visible=false;
 group.add(furnishings);scene.add(group);
 const {x,z,front}=department,half=MALL_ROOM/2;
 const accent=new THREE.MeshStandardMaterial({color:departmentColors[index%departmentColors.length]});
 const roomWall=(x,y,z,w,h,d,material)=>mallPart(group,x,y,z,w,h,d,material);
 const fixture=(x,y,z,w,h,d,material)=>mallPart(furnishings,x,y,z,w,h,d,material);
 const hit=(x,z,w,d,lockedBy)=>colliders.push({
  minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,requiresUpgrade:"annex3",lockedBy
 });
 roomWall(x,.01,z,MALL_ROOM,.025,MALL_ROOM,plazaMaterial);
 for(const side of [-1,1]){
  roomWall(x+side*half,2.5,z,.24,5,MALL_ROOM,mallWallMaterial);
  hit(x+side*half,z,.24,MALL_ROOM);
  roomWall(x+side*2.95,2.5,front,3.1,5,.24,mallWallMaterial);
  hit(x+side*2.95,front,3.1,.24);
 }
 roomWall(x,2.5,z-half,MALL_ROOM,5,.24,mallWallMaterial);
 hit(x,z-half,MALL_ROOM,.24);
 roomWall(x,4.2,front,2.8,1.6,.24,accent);
 const gate=roomWall(x,1.7,front,2.8,3.4,.24,new THREE.MeshStandardMaterial({color:0x475569}));
 hit(x,front,2.8,.24,department.id);
 mallSign(group,department.name.toUpperCase(),"NIVEAU "+department.level,x,front+.15,0,7.4);
 annexGroups.set(department.id,{group,gate,furnishings,x,z});
 if(department.id===BAKERY_ID){
  const ovenZ=z-3.62;
  const metal=new THREE.MeshStandardMaterial({color:0x334155,roughness:.55});
  const glass=new THREE.MeshStandardMaterial({color:0x16243a,emissive:0xfb7b24,emissiveIntensity:0});
  fixture(x,.88,ovenZ,2.35,1.76,.92,metal);
  fixture(x,1.1,ovenZ+.47,1.85,.67,.045,glass);
  fixture(x,1.54,ovenZ+.54,1.45,.045,.09,metal);
  fixture(x,.84,z-1.7,1.45,.13,.6,accent);
  for(const side of [-1,1])fixture(x+side*.53,.41,z-1.7,.08,.82,.58,metal);
  colliders.push({minX:x-1.18,maxX:x+1.18,minZ:ovenZ-.46,maxZ:ovenZ+.46,requiresUpgrade:BAKERY_ID});
  colliders.push({minX:x-.73,maxX:x+.73,minZ:z-2,maxZ:z-1.4,requiresUpgrade:BAKERY_ID});
  const sign=shelfSign("FOURNIL · PLANNING");sign.position.set(x,2.35,ovenZ+.5);furnishings.add(sign);
  const baker=new THREE.Group();
  baker.position.set(x+1.75,0,ovenZ+.95);
  furnishings.add(baker);
  const uniform=new THREE.MeshStandardMaterial({color:0xf1f5f9});
  const skin=new THREE.MeshStandardMaterial({color:0xd99d73});
  const trousers=new THREE.MeshStandardMaterial({color:0x27354a});
  mallPart(baker,0,1.22,0,.44,.67,.29,uniform);
  mallPart(baker,0,1.72,0,.29,.31,.27,skin);
  mallPart(baker,0,1.95,0,.36,.22,.34,uniform);
  for(const side of [-1,1]){
   mallPart(baker,side*.125,.43,0,.2,.86,.24,trousers);
   mallPart(baker,side*.29,1.17,0,.13,.52,.16,uniform);
  }
  bakeryScene={baker,glass,x,z:ovenZ+.55};
 }
 if(!department.products.length){
  fixture(x+2.25,.52,z,2.6,1.04,.82,accent);
  fixture(x+2.25,1.06,z,2.6,.09,.9,mallWallMaterial);
  colliders.push({minX:x+.95,maxX:x+3.55,minZ:z-.45,maxZ:z+.45,requiresUpgrade:department.id});
 }
 for(const p of catalog.filter(product=>product.department===department.id)){
  const rack=new THREE.Group();furnishings.add(rack);
  rack.position.set(p.x,0,p.z);rack.rotation.y=p.rotation*Math.PI/2;
  const sign=shelfSign(p.name);sign.position.y=2.34;rack.add(sign);
  const shelfMaterial=new THREE.MeshStandardMaterial({color:p.storage==="cold"?0x93c5fd:0x475569});
  const backPanel=new THREE.Mesh(new THREE.BoxGeometry(1.7,2.15,.06),shelfMaterial);
  backPanel.position.set(0,1.07,-.32);rack.add(backPanel);
  departmentProductBatch(rack,p);
  for(let tier=0;tier<3;tier++){
   const y=.43+tier*.65;
   const shelf=new THREE.Mesh(new THREE.BoxGeometry(1.72,.08,.72),shelfMaterial);
   shelf.position.y=y;rack.add(shelf);
   addPriceRail(rack,p,y+.02,1.72,.37);
  }
  colliders.push({minX:p.x-.42,maxX:p.x+.42,minZ:p.z-.87,maxZ:p.z+.87,requiresUpgrade:department.id});
  addShelfGuide(p,p.x,p.z,p.rotation*Math.PI/2);
 }
}
function refreshDisplays(){
 for(const p of catalog){
  const stock=productAvailable(p)?state.inventory[p.id].shelf:0;
  const batches=departmentDisplays.get(p.id);
  if(batches){
   for(const mesh of batches){
    mesh.count=Math.min(stock,CAPACITY);
    mesh.visible=mesh.count>0;
   }
  }else displays[p.id].forEach((mesh,index)=>mesh.visible=index<stock);
 }
 for(const e of extraShelves)e.group.visible=playerLevel()>=e.level;
 for(const p of catalog.filter(p=>p.kind==="extension")){const g=extensionProductGroups[p.id];if(g)g.visible=!!state.upgrades.store1;}
 for(const p of catalog.filter(p=>p.kind==="electronics")){const g=electronicsProductGroups[p.id];if(g)g.visible=!!state.upgrades.store2;}
 updateShelfGuides();
}
cube(6.5,.55,6.5,3,1.1,1.3,0x475569,true);
cube(6.5,1.13,6.5,3.1,.12,1.4,0x1e293b);
// Écran et clavier côté employé (vers l'entrée, z positif), pas côté rayons.
cube(7.3,1.45,6.5,.6,.55,.2,0x0f172a);
const terminalScreen=cube(7.3,1.5,6.64,.48,.3,.045,0x22c55e);
terminalScreen.material.emissive=new THREE.Color(0x064e3b);
const terminalKeyboard=cube(7.3,1.22,6.86,.65,.035,.24,0x94a3b8);
// V0.9.90 — Équipements réalistes de la caisse, purement visuels.
const checkoutRubber=new THREE.MeshStandardMaterial({color:0x111827,roughness:.92});
const checkoutSteel=new THREE.MeshStandardMaterial({color:0x94a3b8,metalness:.65,roughness:.32});
const checkoutBlack=new THREE.MeshStandardMaterial({color:0x172033,roughness:.6});
const checkoutGlow=new THREE.MeshStandardMaterial({color:0x38bdf8,emissive:0x075985,emissiveIntensity:.32});
function checkoutPart(x,y,z,w,h,d,mat){
 const part=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
 part.position.set(x,y,z);scene.add(part);return part;
}
// Tapis roulant incrusté dans le plateau, avec rouleaux et rebords.
checkoutPart(5.72,1.205,6.46,1.23,.025,.94,checkoutRubber);
for(const z of [6.0,6.92])checkoutPart(5.72,1.232,z,1.27,.055,.045,checkoutSteel);
for(const x of [5.1,6.34])checkoutPart(x,1.233,6.46,.045,.055,.99,checkoutSteel);
for(const x of [5.36,5.72,6.08])checkoutPart(x,1.223,6.46,.015,.006,.89,checkoutBlack);
// Scanner encastré au milieu du comptoir.
checkoutPart(6.61,1.211,6.35,.38,.018,.47,checkoutSteel);
checkoutPart(6.61,1.223,6.35,.28,.012,.35,checkoutBlack);
for(const x of [6.52,6.61,6.70])checkoutPart(x,1.231,6.35,.012,.004,.28,checkoutGlow);
// Terminal bancaire orienté vers le client (côté rayons).
checkoutPart(7.66,1.245,6.10,.25,.08,.36,checkoutBlack);
const paymentDisplay=checkoutPart(7.66,1.30,6.05,.205,.012,.16,checkoutGlow);
paymentDisplay.rotation.x=-.32;
for(let row=0;row<3;row++)for(let col=0;col<3;col++)
 checkoutPart(7.58+col*.078,1.295,6.20+row*.052,.043,.008,.029,checkoutSteel);
// Zone d'ensachage et séparateur des achats.
checkoutPart(6.95,1.208,6.46,.38,.012,.94,checkoutSteel);
checkoutPart(6.94,1.28,6.46,.045,.14,.94,checkoutBlack);
// Façade commerciale FBA sur la face client du meuble.
const checkoutLogoCanvas=document.createElement("canvas");
checkoutLogoCanvas.width=512;checkoutLogoCanvas.height=128;
const checkoutLogoCtx=checkoutLogoCanvas.getContext("2d");
checkoutLogoCtx.fillStyle="#0f172a";checkoutLogoCtx.fillRect(0,0,512,128);
checkoutLogoCtx.fillStyle="#38bdf8";checkoutLogoCtx.fillRect(0,0,512,9);
checkoutLogoCtx.fillStyle="#ffffff";checkoutLogoCtx.textAlign="center";
checkoutLogoCtx.font="bold 54px Arial";checkoutLogoCtx.fillText("FBA SUPERMARKET",256,81);
const checkoutLogoTex=new THREE.CanvasTexture(checkoutLogoCanvas);
checkoutLogoTex.colorSpace=THREE.SRGBColorSpace;
const checkoutLogo=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.425),
 new THREE.MeshBasicMaterial({map:checkoutLogoTex,side:THREE.DoubleSide}));
checkoutLogo.position.set(6.5,.70,7.158);scene.add(checkoutLogo);
// Même enseigne côté opposé de la caisse, lisible depuis l'autre allée.
const checkoutLogoOpposite=new THREE.Mesh(new THREE.PlaneGeometry(1.7,.425),
 new THREE.MeshBasicMaterial({map:checkoutLogoTex,side:THREE.DoubleSide}));
checkoutLogoOpposite.position.set(6.5,.70,5.842);
checkoutLogoOpposite.rotation.y=Math.PI;
scene.add(checkoutLogoOpposite);
// Petit interrupteur fixé sur le flanc de la caisse, côté employé.
const lightSwitch=cube(8.08,1.16,6.93,.10,.09,.035,0x22c55e);
// Interrupteur dédié, sur le mur intérieur de la réserve près de son entrée.
// Plaque et bouton fixés sur le mur du fond de la réserve, côté intérieur.
const stockroomSwitchPlate=cube(10.174,1.35,7.8,.045,.22,.19,0xf8fafc);
const stockroomSwitch=cube(10.205,1.35,7.8,.035,.11,.09,0x22c55e);
function toggleColdRoomLights(){
 coldRoomLightsOn=!coldRoomLightsOn;
 coldSwitch.material.color.setHex(coldRoomLightsOn?0x22c55e:0xef4444);
 updateLighting();
 toast("Éclairage chambre froide : "+(coldRoomLightsOn?"allumé":"éteint"));
}
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
// Chaque produit sec possède six places sur les étagères : cinq cartons et un lot ouvert.
const boxes={},reserveModels={};
const storageSlots={dry:dryStorageSlots,electronics:electronicsStorageSlots};
const storageProductGroups={};
for(const kind of Object.keys(storageSlots)){
 const products=catalog.filter(p=>storageKind(p)===kind&&(p.level||1)<11);
 storageProductGroups[kind]=products;
 if(storageSlots[kind].length<products.length*(MAX_BOXES_PER_PRODUCT+1))
  throw Error("Capacité visuelle insuffisante : "+storageName(kind));
}
// Produits froids : conserver les emplacements des rayonnages inox.
const coldSlots={
 fromage:{x:16.35,z:3.1},
 surgeles:{x:20.15,z:3.1},
 pommes:{x:16.35,z:7.8}
};
for(const p of catalog){
 boxes[p.id]=[];
 if(p.level>=11)continue;
 const kind=storageKind(p),cold=kind==="cold",slot=cold?coldSlots[p.id]:null;
 const slots=storageSlots[kind];
 const base=cold?-1:storageProductGroups[kind].indexOf(p)*(MAX_BOXES_PER_PRODUCT+1);
 for(let j=0;j<MAX_BOXES_PER_PRODUCT;j++){
  const pos=cold?{x:slot.x+(j%2===0?-.34:.34),y:[1.025,1.025,2.075,2.075,3.125][j],z:slot.z}:slots[base+j];
  const mesh=cube(pos.x,pos.y,pos.z,cold?.56:.51,.65,cold?.7:.55,0xb98246);
  const band=new THREE.Mesh(new THREE.BoxGeometry(cold?.44:.43,.085,.025),
   new THREE.MeshStandardMaterial({color:p.color,roughness:.7}));
  band.position.set(0,.16,cold?.363:.286);mesh.add(band);
  if(!cold){
   // Étiquette face à l'allée plutôt que tournée contre le mur.
   const label=new THREE.Mesh(new THREE.PlaneGeometry(.42,.28),
    new THREE.MeshBasicMaterial({map:packageTexture(p),side:THREE.DoubleSide}));
   label.rotation.y=pos.face>0?Math.PI/2:-Math.PI/2;
   label.position.set(pos.face*.263,-.06,0);mesh.add(label);
  }
  mesh.userData.requiresUpgrade=pos.requiresUpgrade;
  boxes[p.id].push(mesh);
 }
 const looseSlot=cold?{x:20.15,z:7.8}:slots[base+MAX_BOXES_PER_PRODUCT];
 reserveModels[p.id]=cube(cold?looseSlot.x+(Object.keys(coldSlots).indexOf(p.id)-1)*.43:looseSlot.x,
  cold?1.05:looseSlot.y-.12,looseSlot.z,.42,.4,.45,p.color);
 reserveModels[p.id].userData.requiresUpgrade=looseSlot.requiresUpgrade;
}
function refreshBoxes(){
 catalog.forEach(p=>{
  const a=state.inventory[p.id];
  const visible=m=>!m.userData.requiresUpgrade||state.upgrades[m.userData.requiresUpgrade];
  boxes[p.id].forEach((m,i)=>m.visible=visible(m)&&i<Math.min(MAX_BOXES_PER_PRODUCT,a.boxes));
  if(reserveModels[p.id])reserveModels[p.id].visible=visible(reserveModels[p.id])&&a.reserve>0;
 });
}
function sync(){
 hud();refreshDisplays();refreshBoxes();refreshExtension();updateLighting();
 for(const register of extraRegisters)for(const mesh of register.meshes)mesh.visible=playerLevel()>=register.level;
 save();
}
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
 carryLabel.textContent=p?(held.source==="loose"?"Produits en vrac : ":held.source==="delivery"?"Livraison : ":"Carton : ")+p.name+" — "+held.quantity+" produit(s)":"";
 updateShelfGuides();
}
function near(x,z,r=2.5){return Math.hypot(camera.position.x-x,camera.position.z-z)<=r;}
function atReserve(){return inStorageWing("dry",camera.position.x,camera.position.z)||camera.position.x>10.35&&camera.position.x<15.05&&camera.position.z>1.8&&camera.position.z<(state.upgrades.store2?37.25:state.upgrades.store1?30.45:23.45);}
function atColdRoom(){return inStorageWing("cold",camera.position.x,camera.position.z)||camera.position.x>15.55&&camera.position.x<23.75&&camera.position.z>1.8&&camera.position.z<16.8;}
function atElectronicsReserve(){
 const {x,z}=camera.position;
 return inStorageWing("electronics",x,z)||!!state.upgrades.store2&&x>=15.3&&x<20.35&&z>30.75&&z<43.7;
}
function currentStorageKind(){
 if(atElectronicsReserve())return "electronics";
 if(atColdRoom())return "cold";
 return atReserve()?"dry":null;
}
function atStorageFor(p){return currentStorageKind()===storageKind(p);}
function putBack(){
 if(!held)return;
 const p=catalog.find(p=>p.id===held.id);
 if(!p||!atStorageFor(p))return;
 if(held.source==="delivery"&&held.quantity===BOX_UNITS){
  if(state.inventory[held.id].boxes>=MAX_BOXES_PER_PRODUCT||
   storageBoxes(storageKind(p))>=storageLimit(storageKind(p))){
   toast(storageName(storageKind(p))+" pleine ou limite par produit atteinte");return;
  }
  state.inventory[held.id].boxes++;
 }
 else state.inventory[held.id].reserve+=held.quantity;
 held=null;sync();refreshCarry();showReserve();
}
function takeCarton(p,amount,source="box"){
 const a=state.inventory[p.id];
 if(held){toast("Dépose d'abord le carton que tu portes");return;}
 if(source==="box"&&a.boxes>0){
  a.boxes--;held={id:p.id,quantity:BOX_UNITS,source:"box"};
 }else if(source==="loose"&&a.reserve>0){
  const quantity=Math.min(amount,a.reserve);
  a.reserve-=quantity;held={id:p.id,quantity,source:"loose"};
 }else{toast("Aucun produit disponible");return;}
 sync();refreshCarry();panel.style.display="none";
 toast((held.source==="loose"?"Lot en vrac de ":"Carton de ")+p.name+" : "+held.quantity+" produits. Va au rayon.");
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
   const losses=state.management.losses??={};
   losses[p.id]=(losses[p.id]||0)+amount;
   sync();showReserve();toast(amount+" × "+p.name+" jetés");
  });
  button(panel,"Annuler",showReserve);
 });
 button(panel,"Annuler",showReserve);
}
// Accès technique indépendant, côté est, jusqu'au véritable arrière du magasin (z négatif).
// Les clients entrent côté z positif ; le quai se trouve au-delà du fond du magasin.
const serviceCorridorFloor=cube(25.65,-.15,-8.3,3.1,.3,31.4,0xb9c1c8);
// Deux parois continues : côté chambre froide la paroi existante sert de mur,
// puis un prolongement prend le relais jusqu'à l'arrière du magasin.
// Porte de 2,6 m découpée dans la paroi ouest du couloir : accès à la salle de repos.
cube(24.1,2.5,-15.65,.25,5,16.7,0xe2e8f0,true);
cube(24.1,2.5,-1.6,.25,5,6.2,0xe2e8f0,true);
cube(24.1,4.2,-6,.25,1.6,2.6,0xe2e8f0);
cube(27.2,2.5,-8.3,.25,5,31.4,0xe2e8f0,true);
cube(25.65,5.1,-8.3,3.1,.2,31.4,0xf1f5f9);
// Annexe du personnel à l'ouest du couloir logistique, hors des axes des livraisons.
cube(20.95,-.15,-6,6.3,.3,6,0xa8b5c6);
tileFloor(5.95,5.65,20.95,-6);
cube(20.95,5.1,-6,6.3,.2,6,0xe2e8f0);
cube(17.8,2.5,-6,.25,5,6,0xe2e8f0,true);
cube(20.95,2.5,-9,6.3,5,.25,0xe2e8f0,true);
cube(20.95,2.5,-3,6.3,5,.25,0xe2e8f0,true);
// Huisserie et panneau d'accueil vus depuis le couloir.
for(const z of [-7.3,-4.7])cube(24.16,1.65,z,.09,3.3,.09,0x64748b);
cube(24.16,3.32,-6,.10,.12,2.62,0x64748b);
const breakSignCanvas=document.createElement("canvas");breakSignCanvas.width=512;breakSignCanvas.height=160;
const breakSignCtx=breakSignCanvas.getContext("2d");
breakSignCtx.fillStyle="#0f172a";breakSignCtx.fillRect(0,0,512,160);
breakSignCtx.fillStyle="#38bdf8";breakSignCtx.fillRect(0,0,512,12);
breakSignCtx.fillStyle="#fff";breakSignCtx.textAlign="center";breakSignCtx.font="bold 48px Arial";
breakSignCtx.fillText("SALLE DE REPOS",256,95);
const breakSign=new THREE.Mesh(new THREE.PlaneGeometry(2.3,.7),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(breakSignCanvas),side:THREE.DoubleSide}));
breakSign.position.set(24.29,3.85,-6);breakSign.rotation.y=Math.PI/2;scene.add(breakSign);
// Mobilier : table, deux chaises, cafetière, micro-ondes et casiers.
cube(19.8,.78,-6,1.35,.13,1.65,0x92400e,true);
for(const x of [19.26,20.34])for(const z of [-6.64,-5.36])cube(x,.39,z,.09,.78,.09,0x475569);
for(const z of [-4.9,-7.1]){
 cube(21.05,.45,z,.72,.13,.68,0x334155,true);
 cube(20.78,.87,z,.13,.85,.68,0x475569);
 for(const zz of [z-.23,z+.23])cube(21.32,.23,zz,.07,.46,.07,0x475569);
}
cube(18.55,1.07,-4.15,1.02,2.12,.72,0xd1d5db,true);
cube(18.93,1.45,-4.15,.04,.10,.08,0x475569);
cube(18.55,1.22,-7.84,.95,.9,.73,0x64748b,true);
cube(18.55,1.72,-7.84,.65,.38,.56,0x1f2937);
cube(18.56,1.74,-7.47,.37,.07,.025,0x38bdf8);
for(const x of [19.3,20.1])cube(x,1.1,-8.48,.65,2.2,.4,0x94a3b8,true);
cube(20.95,4.92,-6,2.35,.08,.5,0xfff7db);
lamps.push({light:ceilingLamp(20.95,-6),breakroom:true});
// Fermeture de l'extrémité côté chambre froide : plus de vue sur l'extérieur.
// L'accès latéral depuis la chambre froide (x=24, z=4.25..6.65) reste ouvert.
cube(25.65,2.5,7.45,3.1,5,.25,0xe2e8f0,true);
// Sortie sur le quai : passage sur toute la largeur, sans mini-porte ni collision.
// Le quai extérieur commence directement au bout du couloir.
// Liaison depuis la porte technique de la chambre froide (z 4.25 à 6.65).
cube(25.65,-.15,5.45,3.1,.3,2.6,0xb9c1c8);
// Quai arrière extérieur, sans murs qui dépassent du bâtiment.
const dockFloor=cube(25.65,.045,-25.2,5.2,.09,4.8,0x64748b);
const dockMark=cube(25.65,.105,-23.0,4.8,.018,.09,0xfacc15);
const deliveryTruck=new THREE.Group();scene.add(deliveryTruck);
const truckBody=cube(25.65,1.65,-29.0,3.5,2.8,4.2,0xe2e8f0);
const truckCab=cube(25.65,1.15,-31.6,3.2,2,1.3,0x2563eb);
const truckStripe=cube(25.65,2.45,-31.11,2.5,.3,.05,0xfacc15);
const dockCartons=[];
for(let i=0;i<8;i++){
 const m=cube(24.55+(i%3)*1.05,.4+Math.floor(i/3)*.7,-24.3,.72,.65,.72,0xb98246);
 dockCartons.push(m);
}
// Diable visible en 3D, près du quai et accompagnant le joueur lorsqu'il est chargé.
const handtruckVisual=new THREE.Group();
const trolleyMetal=new THREE.MeshStandardMaterial({color:0xdc2626,metalness:.45,roughness:.35});
const trolleyRubber=new THREE.MeshStandardMaterial({color:0x111827});
function trolleyPart(w,h,d,x,y,z,mat=trolleyMetal){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
 m.position.set(x,y,z);handtruckVisual.add(m);return m;
}
trolleyPart(.85,.09,.6,0,.13,.03);
trolleyPart(.08,1.35,.08,-.36,.78,.24);
trolleyPart(.08,1.35,.08,.36,.78,.24);
trolleyPart(.8,.08,.08,0,1.44,.24);
for(const x of [-.42,.42]){
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.12,12),trolleyRubber);
 wheel.rotation.z=Math.PI/2;wheel.position.set(x,.17,.32);handtruckVisual.add(wheel);
}
const trolleyBoxes=[];
for(let i=0;i<3;i++){const b=trolleyPart(.67,.33,.49,0,.39+i*.35,.02,new THREE.MeshStandardMaterial({color:0xb98246}));trolleyBoxes.push(b);}
scene.add(handtruckVisual);
const handtruckHeldVisual=handtruckVisual.clone(true);
handtruckHeldVisual.traverse(o=>{if(o.isMesh)o.material=o.material.clone();});
camera.add(handtruckHeldVisual);
scene.add(camera);
function updateHandtruck(){
 const purchased=!!state.upgrades.handtruck;
 const carrying=purchased&&state.trolleyCargo.length>0;
 handtruckVisual.visible=purchased&&!carrying;
 handtruckHeldVisual.visible=carrying;
 if(!purchased)return;
 handtruckVisual.position.set(25.3,0,-24.0);
 handtruckVisual.rotation.y=0;
 // First-person attachment: in front of the camera, not behind the player's view.
 handtruckHeldVisual.position.set(0,-1.02,-1.95);
 handtruckHeldVisual.rotation.set(-.10,0,0);
 handtruckHeldVisual.scale.set(.95,.95,.95);
 const boxes=handtruckHeldVisual.children.filter(o=>o.isMesh&&o.geometry?.parameters?.width===.67);
 boxes.forEach((box,i)=>{
  box.visible=i<state.trolleyCargo.length;
  if(box.visible){const p=catalog.find(p=>p.id===state.trolleyCargo[i].id);box.material.color.setHex(p?p.color:0xb98246);}
 });
 trolleyBoxes.forEach(b=>b.visible=false);
}
// Personnel : morphologies arrondies, visages expressifs et coiffures distinctes.
function staffAppearance(group,isGeorge){
 const skin=new THREE.MeshStandardMaterial({color:isGeorge?0xe5ac83:0xc98b68,roughness:.9});
 const hair=new THREE.MeshStandardMaterial({color:isGeorge?0x493126:0x241d22,roughness:.95});
 const cloth=new THREE.MeshStandardMaterial({color:isGeorge?0xf59e0b:0x16a34a});
 const details=new THREE.MeshStandardMaterial({color:isGeorge?0xffd166:0x86efac});
 const eyes=new THREE.MeshStandardMaterial({color:0x231b1b});
 const boots=new THREE.MeshStandardMaterial({color:0x202a36});
 const add=(geometry,material,x,y,z,sx=1,sy=1,sz=1)=>{
  const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);group.add(m);return m;
 };
 add(new THREE.SphereGeometry(1,20,14),cloth,0,1.22,0,isGeorge?.36:.32,.47,.24);
 add(new THREE.CylinderGeometry(.115,.12,.15,12),skin,0,1.65,0);
 add(new THREE.SphereGeometry(.20,20,16),skin,0,1.84,.018,isGeorge?1.06:.99,1.12,.97);
 for(const sign of [-1,1]){
  add(new THREE.SphereGeometry(.055,10,8),skin,sign*.202,1.84,.01,.62,1,.6);
  add(new THREE.SphereGeometry(.022,10,8),eyes,sign*.077,1.865,.205,1,.85,.45);
  add(new THREE.SphereGeometry(.037,10,8),hair,sign*.077,1.924,.195,1,.19,.4);
  add(new THREE.SphereGeometry(.13,12,10),boots,sign*.18,.1,.095,1,.47,1.42);
 }
 add(new THREE.SphereGeometry(.05,10,8),skin,0,1.805,.211,.75,.7,1);
 add(new THREE.SphereGeometry(.045,10,8),eyes,0,1.731,.206,.8,.14,.13);
 add(new THREE.SphereGeometry(.215,20,14),hair,0,2.008,-.018,1,.46,.94);
 if(isGeorge){
  // George : cheveux bruns courts coiffés sur le côté, barbe, veste orange.
  add(new THREE.SphereGeometry(.155,14,10),hair,-.065,1.976,.11,1.08,.36,.65);
  for(const side of [-1,1]){
   add(new THREE.SphereGeometry(.08,12,8),hair,side*.17,1.955,-.02,.65,1.08,.95);
   add(new THREE.BoxGeometry(.045,.67,.04),details,side*.20,1.19,.225);
  }
  add(new THREE.SphereGeometry(.15,14,10),hair,0,1.745,.07,.95,.31,.8);
  add(new THREE.SphereGeometry(.11,12,8),skin,0,1.756,.153,1,.36,.6);
 }else{
  // Camille : cheveux noirs mi-longs, queue-de-cheval, tenue verte zippée.
  for(const side of [-1,1])add(new THREE.SphereGeometry(.077,12,9),hair,side*.148,1.855,-.045,.84,2.0,1);
  add(new THREE.SphereGeometry(.125,14,10),hair,0,1.81,-.22,.94,1.86,.85);
  add(new THREE.SphereGeometry(.11,12,9),hair,.102,1.988,.105,1.3,.33,.58);
  add(new THREE.BoxGeometry(.02,.56,.029),details,0,1.21,.236);
  for(const side of [-1,1])add(new THREE.BoxGeometry(.10,.04,.03),details,side*.16,.96,.21);
 }
}
// Premier manutentionnaire : modèle 3D autonome, itinéraire quai → réserve.
const workerGroup=new THREE.Group();
const workerSkin=new THREE.MeshStandardMaterial({color:0xe5ac83});
const workerVest=new THREE.MeshStandardMaterial({color:0xf59e0b});
const workerPants=new THREE.MeshStandardMaterial({color:0x334155});
function workerBox(w,h,d,x,y,z,mat){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);workerGroup.add(m);return m;
}
// Le modele visuel regarde vers -Z, comme la direction de marche.
const workerVisual=new THREE.Group();workerVisual.rotation.y=Math.PI;workerGroup.add(workerVisual);
staffAppearance(workerVisual,true);
const workerLeftLeg=workerBox(.22,.8,.23,-.18,.4,0,workerPants);workerLeftLeg.geometry=new THREE.CylinderGeometry(.115,.105,.8,12);
const workerRightLeg=workerBox(.22,.8,.23,.18,.4,0,workerPants);workerRightLeg.geometry=new THREE.CylinderGeometry(.115,.105,.8,12);
const workerLeftArm=workerBox(.18,.75,.2,-.44,1.15,0,workerSkin);workerLeftArm.geometry=new THREE.CapsuleGeometry(.095,.55,4,10);
const workerRightArm=workerBox(.18,.75,.2,.44,1.15,0,workerSkin);workerRightArm.geometry=new THREE.CapsuleGeometry(.095,.55,4,10);
const workerCarton=workerBox(.6,.45,.5,0,1.05,-.45,new THREE.MeshStandardMaterial({color:0xb98246}));
scene.add(workerGroup);
const WORKER_DOCK=[25.65,-23.8];
function storageWorkPoint(p){
 const kind=storageKind(p);
 return kind==="electronics"?[17.95,35]:kind==="cold"?[19.5,5.5]:[13,5.5];
}
function staffRoute(group,point){
 const [x,z]=point;
 if(blocked(x,z,.22))return [];
 return staffBreakPath(group.position,{x,z}).slice(1);
}
function faceNpc(group,dx,dz,dt){
 if(Math.hypot(dx,dz)<.001)return;
 const angle=Math.atan2(-dx,-dz)-group.rotation.y;
 group.rotation.y+=Math.atan2(Math.sin(angle),Math.cos(angle))*(1-Math.exp(-12*dt));
}
let workerRoute=[],workerWaypoint=0,workerPhase="dock",workerCargo=null,workerWait=0,workerTalking=false,workerTalkTimer=0,workerWalkClock=0;
let workerBreakJourney=null,stockerBreakJourney=null;
const WORKER_BREAK_SEAT={x:22.2,z:-5.25},STOCKER_BREAK_SEAT={x:22.2,z:-6.75};
workerGroup.position.set(25.65,0,-23.8);
function workerTaskLabel(){
 if(employeeBreakLabel(workerBreakJourney))return employeeBreakLabel(workerBreakJourney);
 if(workerCargo){const p=catalog.find(p=>p.id===workerCargo.id);return "Transport d’un carton"+(p?" de "+p.name:"");}
 if(workerRoute.length&&workerPhase==="pickup")return "En route pour décharger le quai";
 if(workerRoute.length&&workerPhase==="dock")return "Retour au quai";
 if(state.deliveryDock.length)return state.deliveryDock.length+" carton(s) à prendre en charge";
 return "Disponible au quai";
}
function workerGo(point,phase){
 workerRoute=staffRoute(workerGroup,point);
 workerWaypoint=0;workerPhase=phase;
 if(!workerRoute.length)workerWait=1.5;
 return workerRoute.length>0;
}
function workerReply(message,continueWork=false){
 panel.style.display="none";
 if(continueWork)workerTalking=false;
 const old=document.getElementById("fba-worker-reply");if(old)old.remove();
 const reply=document.createElement("section");reply.id="fba-worker-reply";
 Object.assign(reply.style,{position:"fixed",left:"50%",bottom:"14%",transform:"translateX(-50%)",width:"min(92vw,470px)",background:"rgba(15,23,42,.96)",border:"1px solid #38bdf8",borderRadius:"14px",padding:"16px",zIndex:"60",color:"white",boxShadow:"0 8px 30px #0008"});
 const name=document.createElement("strong");name.textContent=state.workerName;name.style.color="#7dd3fc";reply.appendChild(name);
 const answer=document.createElement("p");answer.textContent=message;Object.assign(answer.style,{fontSize:"15px",lineHeight:"1.5",margin:"10px 0 14px"});reply.appendChild(answer);
 const actions=document.createElement("div");Object.assign(actions.style,{display:"flex",gap:"8px",flexWrap:"wrap"});reply.appendChild(actions);
 const add=(label,fn)=>{const b=document.createElement("button");b.textContent=label;Object.assign(b.style,{background:"#2563eb",color:"white",padding:"10px 14px",borderRadius:"8px",flex:"1",minWidth:"110px"});b.onclick=()=>{reply.remove();fn();};actions.appendChild(b);};
 add("Continuer la discussion",showWorkerInteraction);
 add("Terminer",()=>{workerTalking=false;});
 document.body.appendChild(reply);
}
function showWorkerInteraction(){
 if(!state.workerEnabled||!workerGroup.visible){toast("Le manutentionnaire n’est pas en service");return;}
 const old=document.getElementById("fba-worker-reply");if(old)old.remove();
 workerTalking=true;
 openPanel("DISCUSSION — "+state.workerName);
 paragraph(state.workerName+" : Salut "+state.playerName+" ! Tu as besoin de quelque chose ?");
 const p=workerCargo&&catalog.find(p=>p.id===workerCargo.id);
 paragraph("Présence : "+employeeStatus(state.workerHired,state.workerEnabled,state.workerSentHomeDay,workerShift())+".");
 paragraph("Mission : "+workerTaskLabel()+".");
 paragraph("Cartons à décharger : "+state.deliveryDock.length+".");
 button(panel,"Comment ça va ?",()=>workerReply("Ça va bien, merci "+state.playerName+" !"));
 button(panel,"Tu fais quoi ?",()=>workerReply(workerCargo?"Je range un carton.":state.deliveryDock.length?"Je m’occupe des livraisons.":"J’attends une livraison."));
 button(panel,"Va décharger le camion",()=>workerReply(employeeOnLunch(workerShift())?"Je reprends les livraisons à 13 h, après ma pause.":state.deliveryDock.length?"Pas de souci, j’y vais !":"Il n’y a aucun camion à décharger.",true));
 button(panel,"Combien de cartons restent ?",()=>workerReply("Il reste "+state.deliveryDock.length+" carton(s) au quai."));
 button(panel,"Reprends ton travail",()=>workerReply("D’accord, je reprends le travail !",true));
 button(panel,"Tu peux rentrer chez toi pour aujourd’hui",()=>{
  if(workerCargo||state.deliveryDock.length){workerReply("Il reste encore du travail. Je termine les cartons avant de rentrer.");return;}
  state.workerSentHomeDay=state.day;workerTalking=false;workerRoute=[];save();workerReply("Merci "+state.playerName+" ! J’ai terminé, à demain !",true);
 });
 button(panel,"Terminer la conversation",()=>{panel.style.display="none";workerTalking=false;});
}
// Second salarié : déplacements entre la réserve et les gondoles.
const stockerGroup=new THREE.Group();
const stockerMat=new THREE.MeshStandardMaterial({color:0x16a34a});
const stockerSkin=new THREE.MeshStandardMaterial({color:0xd6a47e});
const stockerPants=new THREE.MeshStandardMaterial({color:0x1e293b});
function stockerPart(w,h,d,x,y,z,mat){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);stockerGroup.add(m);return m;
}
// Meme orientation pour Camille : le visage reste devant pendant les trajets.
const stockerVisual=new THREE.Group();stockerVisual.rotation.y=Math.PI;stockerGroup.add(stockerVisual);
staffAppearance(stockerVisual,false);
const stockerLegA=stockerPart(.2,.8,.23,-.17,.4,0,stockerPants);stockerLegA.geometry=new THREE.CylinderGeometry(.105,.10,.8,12);
const stockerLegB=stockerPart(.2,.8,.23,.17,.4,0,stockerPants);stockerLegB.geometry=new THREE.CylinderGeometry(.105,.10,.8,12);
const stockerArmA=stockerPart(.18,.7,.2,-.43,1.13,0,stockerSkin);stockerArmA.geometry=new THREE.CapsuleGeometry(.093,.50,4,10);
const stockerArmB=stockerPart(.18,.7,.2,.43,1.13,0,stockerSkin);stockerArmB.geometry=new THREE.CapsuleGeometry(.093,.50,4,10);
const stockerCarton=stockerPart(.55,.42,.48,0,1.05,-.4,new THREE.MeshStandardMaterial({color:0xb98246}));
scene.add(stockerGroup);
stockerGroup.position.set(13,0,5);
let stockerTarget=null,stockerPhase="idle",stockerCargo=null,stockerTimer=0,stockerWalk=0,stockerTalking=false;
function stockerNeeds(){
 const options=catalog.filter(p=>productAvailable(p)&&state.inventory[p.id].shelf<shelfCapacity(p)&&
  (state.inventory[p.id].boxes>0||state.inventory[p.id].reserve>0));
 if(playerLevel()>=19)options.sort((a,b)=>state.inventory[a.id].shelf-state.inventory[b.id].shelf);
 return options[0];
}
function stockerTaskLabel(){
 if(employeeBreakLabel(stockerBreakJourney))return employeeBreakLabel(stockerBreakJourney);
 if(stockerCargo){const p=catalog.find(p=>p.id===stockerCargo);return (stockerPhase==="placing"?"Mise en rayon":"Réassort")+(p?" · "+p.name:"");}
 if(stockerPhase==="idle-return")return "Retour vers la réserve";
 const waiting=catalog.filter(p=>productAvailable(p)&&state.inventory[p.id].shelf<shelfCapacity(p)&&(state.inventory[p.id].boxes>0||state.inventory[p.id].reserve>0)).length;
 return waiting?waiting+" rayon(s) à réapprovisionner":"Surveillance des stocks";
}
function showStockerInteraction(){
 stockerTalking=true;openPanel("DISCUSSION — "+state.stockerName);
 paragraph(state.stockerName+" : Salut "+state.playerName+" ! Je m’occupe des rayons.");
 paragraph("Présence : "+employeeStatus(state.stockerHired,state.stockerEnabled,state.stockerSentHomeDay,stockerShift())+".");
 paragraph("Mission : "+stockerTaskLabel()+".");
 button(panel,"Tu fais quoi ?",()=>{panel.style.display="none";toast(state.stockerName+" : "+stockerTaskLabel());stockerTalking=false;});
 button(panel,"Des rayons ont besoin d’être remplis ?",()=>{panel.style.display="none";toast(state.stockerName+" : "+stockerTaskLabel());stockerTalking=false;});
 button(panel,"Reprends ton travail",()=>{
  stockerTalking=false;panel.style.display="none";
  toast(employeeOnLunch(stockerShift())?state.stockerName+" : Je reprends à 13 h !":state.stockerName+" : D’accord, je m’en occupe !");
 });
 button(panel,"Tu peux rentrer chez toi",()=>{state.stockerSentHomeDay=state.day;stockerTalking=false;panel.style.display="none";save();toast(state.stockerName+" : À demain !");});
 button(panel,"Terminer",()=>{stockerTalking=false;panel.style.display="none";});
}
function stockerShelfPosition(p){
 // La position du produit désigne le centre du meuble : rester côté allée.
 // Rayons centraux : accès depuis l'allée latérale, pas à travers la gondole.
 if(p.kind==="extension")return [p.x,p.z+2.0];
 if(p.kind==="wall"||p.kind==="electronics"||p.kind==="department"){
  const angle=p.rotation*Math.PI/2,distance=p.kind==="electronics"?2:1.25;
  return [p.x+Math.sin(angle)*distance,p.z+Math.cos(angle)*distance];
 }
 if(p.kind==="froid"||p.kind==="congelateur")return [p.x,p.z+2.1];
 if(p.x<=-4)return [p.x+1.65,p.z??1];
 if(p.x>=4)return [p.x-1.65,p.z??1];
 return [p.x+1.65,p.z??1];
}
let stockerRoute=[];
function stockerRouteTo(point){
 stockerRoute=staffRoute(stockerGroup,point).map(({x,z})=>[x,z]);
 stockerTarget=stockerRoute.shift()??null;
 return !!stockerTarget;
}
function updateStocker(dt){
 const shift=stockerShift();
 const assigned=state.stockerHired&&state.stockerEnabled&&state.stockerSentHomeDay!==state.day;
 const onDuty=assigned&&employeeWorking(shift),onBreak=assigned&&employeeOnLunch(shift);
 if(!assigned)stockerBreakJourney=null;
 if(onBreak&&!stockerBreakJourney)stockerBreakJourney=beginStaffBreak(stockerGroup,STOCKER_BREAK_SEAT);
 stockerGroup.visible=!!(assigned&&(onDuty||onBreak||stockerBreakJourney));
 const stop=()=>{stockerLegA.rotation.x=stockerLegB.rotation.x=stockerArmA.rotation.x=stockerArmB.rotation.x=0;};
 if(stockerBreakJourney){
  if(!stockerTalking){
   if(!onBreak)endStaffBreak(stockerBreakJourney);
   const arrived=advanceStaffBreak(stockerGroup,stockerBreakJourney,dt,()=>{
    stockerWalk+=dt*9;
    stockerLegA.rotation.x=Math.sin(stockerWalk)*.35;stockerLegB.rotation.x=-stockerLegA.rotation.x;
    stockerArmA.rotation.x=stockerCarton.visible?-.55:-stockerLegA.rotation.x*.5;stockerArmB.rotation.x=stockerCarton.visible?-.55:stockerLegA.rotation.x*.5;
   },stop);
   if(arrived)stockerBreakJourney=null;
  }else stop();
  return;
 }
 if(!onDuty){stop();return;}
 if(stockerTalking){stop();faceNpc(stockerGroup,camera.position.x-stockerGroup.position.x,camera.position.z-stockerGroup.position.z,dt);return;}
 if(stockerTimer>0){
  stockerTimer-=dt;
  if(stockerPhase==="placing"){
   stockerArmA.rotation.x=stockerArmB.rotation.x=-.75;
   const p=catalog.find(p=>p.id===stockerCargo);
   faceNpc(stockerGroup,p.x-stockerGroup.position.x,p.z-stockerGroup.position.z,dt);
  }else stop();
  return;
 }
 if(!stockerTarget){
  if(stockerRoute.length){stockerTarget=stockerRoute.shift();}
  else if(stockerPhase==="reserve"||stockerPhase==="shelf"||stockerPhase==="placing"||stockerPhase==="idle-return"){
   if(stockerPhase==="reserve"){
    const a=state.inventory[stockerCargo];
    if(a.boxes>0){a.boxes--;stockerUnits=BOX_UNITS;stockerCarton.visible=true;}
    else if(a.reserve>0){stockerUnits=Math.min(BOX_UNITS,a.reserve);a.reserve-=stockerUnits;stockerCarton.visible=true;}
    else{stockerCargo=null;stockerPhase="idle";}
    if(stockerCargo){
     const p=catalog.find(p=>p.id===stockerCargo);
     stockerPhase="shelf";
     if(!stockerRouteTo(stockerShelfPosition(p))){
      a.reserve+=stockerUnits;stockerCargo=null;stockerUnits=0;
      stockerCarton.visible=false;stockerPhase="idle";stockerTimer=2;sync();
     }
    }
   }else if(stockerPhase==="shelf"){
    stockerPhase="placing";stockerTimer=.85;
   }else if(stockerPhase==="placing"){
    const p=catalog.find(x=>x.id===stockerCargo),a=state.inventory[p.id];
    const qty=Math.max(0,Math.min(stockerUnits,shelfCapacity(p)-a.shelf));
    a.shelf+=qty;a.reserve+=stockerUnits-qty;
    stockerCargo=null;stockerCarton.visible=false;stockerPhase="idle";stockerTimer=2;sync();
   }else stockerPhase="idle";
   return;
  }else{
   const p=stockerNeeds();
   if(p){
    stockerCargo=p.id;stockerPhase="reserve";
    if(!stockerRouteTo(storageWorkPoint(p))){stockerCargo=null;stockerPhase="idle";stockerTimer=2;}
   }
   else if(Math.hypot(stockerGroup.position.x-13,stockerGroup.position.z-5)>.3){stockerPhase="idle-return";if(!stockerRouteTo([13,5]))stockerTimer=2;}
   else{stockerPhase="idle";return;}
  }
 }
 if(!stockerTarget)return;
 const dx=stockerTarget[0]-stockerGroup.position.x,dz=stockerTarget[1]-stockerGroup.position.z;
 const dist=Math.hypot(dx,dz),step=dt*(stockerCarton.visible?1.55:1.9);
 if(dist>step){
  stockerGroup.position.x+=dx/dist*step;stockerGroup.position.z+=dz/dist*step;
  faceNpc(stockerGroup,dx,dz,dt);
  stockerWalk+=step*5.3;stockerLegA.rotation.x=Math.sin(stockerWalk)*.35;stockerLegB.rotation.x=-stockerLegA.rotation.x;
  stockerArmA.rotation.x=stockerCarton.visible?-.55:-stockerLegA.rotation.x*.5;stockerArmB.rotation.x=stockerCarton.visible?-.55:stockerLegA.rotation.x*.5;
 }else{
  stockerGroup.position.x=stockerTarget[0];stockerGroup.position.z=stockerTarget[1];stockerTarget=null;
  stockerLegA.rotation.x=stockerLegB.rotation.x=stockerArmA.rotation.x=stockerArmB.rotation.x=0;
 }
}
let stockerUnits=0;
function updateWorker(dt){
 const shift=workerShift();
 const assigned=state.workerHired&&state.workerEnabled&&state.workerSentHomeDay!==state.day;
 const onDuty=assigned&&employeeWorking(shift),onBreak=assigned&&employeeOnLunch(shift);
 if(!assigned)workerBreakJourney=null;
 if(onBreak&&!workerBreakJourney)workerBreakJourney=beginStaffBreak(workerGroup,WORKER_BREAK_SEAT);
 workerGroup.visible=!!(assigned&&(onDuty||onBreak||workerBreakJourney));
 const stop=()=>{workerLeftLeg.rotation.x=workerRightLeg.rotation.x=workerLeftArm.rotation.x=workerRightArm.rotation.x=0;};
 if(workerBreakJourney){
  if(!workerTalking){
   if(!onBreak)endStaffBreak(workerBreakJourney);
   const arrived=advanceStaffBreak(workerGroup,workerBreakJourney,dt,()=>{
    workerWalkClock+=dt*9;
    const stride=Math.sin(workerWalkClock)*.34;
    workerLeftLeg.rotation.x=stride;workerRightLeg.rotation.x=-stride;
    workerLeftArm.rotation.x=workerCargo?-.55:-stride*.6;
    workerRightArm.rotation.x=workerCargo?-.55:stride*.6;
   },stop,3.2);
   if(arrived)workerBreakJourney=null;
  }else stop();
  return;
 }
 if(!onDuty){stop();return;}
 if(workerTalking){stop();faceNpc(workerGroup,camera.position.x-workerGroup.position.x,camera.position.z-workerGroup.position.z,dt);return;}
 if(workerWait>0){workerWait-=dt;stop();return;}
 if(!workerRoute.length){
  if(workerCargo){
   const p=catalog.find(p=>p.id===workerCargo.id);
   if(!workerGo(storageWorkPoint(p),"storage"))return;
  }else if(Math.hypot(workerGroup.position.x-WORKER_DOCK[0],workerGroup.position.z-WORKER_DOCK[1])>.15){
   if(!workerGo(WORKER_DOCK,"pickup"))return;
  }else if(state.deliveryDock.length){
   const idx=state.deliveryDock.findIndex(it=>{
    const p=catalog.find(p=>p.id===it.id);
    return p&&state.inventory[p.id].boxes<MAX_BOXES_PER_PRODUCT&&storageBoxes(storageKind(p))<storageLimit(storageKind(p));
   });
   const p=idx<0?null:catalog.find(p=>p.id===state.deliveryDock[idx].id);
   if(!p||!workerGo(storageWorkPoint(p),"storage")){workerWait=2;return;}
   workerCargo=state.deliveryDock.splice(idx,1)[0];workerCarton.visible=true;
   refreshDeliveryDock();sync();workerWait=.55;return;
  }else{workerPhase="dock";stop();return;}
 }
 const target=workerRoute[workerWaypoint];
 if(target){
  const dx=target.x-workerGroup.position.x,dz=target.z-workerGroup.position.z;
  const dist=Math.hypot(dx,dz),step=dt*(workerCargo?1.65:2.05);
  if(dist<=step){workerGroup.position.x=target.x;workerGroup.position.z=target.z;workerWaypoint++;}
  else{workerGroup.position.x+=dx/dist*step;workerGroup.position.z+=dz/dist*step;}
  if(dist>.01){
   faceNpc(workerGroup,dx,dz,dt);
   workerWalkClock+=Math.min(step,dist)*5.3;
   const stride=Math.sin(workerWalkClock)*.34;
   workerLeftLeg.rotation.x=stride;workerRightLeg.rotation.x=-stride;
   workerLeftArm.rotation.x=workerCargo?-.55:-stride*.6;
   workerRightArm.rotation.x=workerCargo?-.55:stride*.6;
  }else stop();
 }
 workerCarton.visible=!!workerCargo;
 if(workerWaypoint<workerRoute.length)return;
 workerRoute=[];workerWait=.7;
 if(workerPhase==="storage"&&workerCargo){
  const p=catalog.find(p=>p.id===workerCargo.id);
  if(p&&state.inventory[p.id].boxes<MAX_BOXES_PER_PRODUCT&&storageBoxes(storageKind(p))<storageLimit(storageKind(p))){
   state.inventory[p.id].boxes++;toast("Manutentionnaire : carton de "+p.name+" rangé");
  }else state.deliveryDock.push(workerCargo);
  workerCargo=null;workerCarton.visible=false;sync();refreshDeliveryDock();
 }
}
function refreshDeliveryDock(){
 const n=state.deliveryDock.length;
 truckBody.visible=truckCab.visible=truckStripe.visible=n>0;
 dockCartons.forEach((m,i)=>{
  m.visible=i<Math.min(n,dockCartons.length);
  if(m.visible){const p=catalog.find(p=>p.id===state.deliveryDock[i].id);m.material.color.setHex(p?p.color:0xb98246);}
 });
}
function showDeliveryDock(){
 if(!near(25.65,-24.3,3.2)){toast("Approche-toi de la zone livraison");return;}
 openPanel("ZONE LIVRAISON — Déchargement");
 if(state.upgrades.handtruck){
  paragraph("DIABLE DE MANUTENTION — "+state.trolleyCargo.length+"/3 cartons chargés.");
  if(state.trolleyCargo.length)button(panel,"Voir les cartons sur le diable",showTrolley);
 }
 if(held){paragraph("Rends-toi dans la réserve correspondante pour ranger ton carton.");return;}
 if(!state.deliveryDock.length){paragraph("Aucun camion à décharger pour le moment.");return;}
 paragraph(state.deliveryDock.length+" carton(s) à ranger. Chaque carton contient 10 produits.");
 for(const p of catalog){
  const qty=state.deliveryDock.filter(it=>it.id===p.id).length;
  if(!qty)continue;
  if(state.upgrades.handtruck&&state.trolleyCargo.length<3)button(panel,"Charger sur le diable — "+p.name+" ("+qty+" disponibles)",()=>{
   const i=state.deliveryDock.findIndex(it=>it.id===p.id);
   if(i<0||state.trolleyCargo.length>=3)return;
   state.deliveryDock.splice(i,1);state.trolleyCargo.push({id:p.id});
   sync();refreshDeliveryDock();showDeliveryDock();toast("Diable : "+state.trolleyCargo.length+"/3 cartons");
  });
  button(panel,"Prendre 1 carton — "+p.name+" ("+qty+" restant(s))",()=>{
   const i=state.deliveryDock.findIndex(it=>it.id===p.id);
   if(i<0||held)return;
   state.deliveryDock.splice(i,1);held={id:p.id,quantity:BOX_UNITS,source:"delivery"};
   sync();refreshDeliveryDock();refreshCarry();panel.style.display="none";
   toast("Carton de "+p.name+" à ranger : "+storageName(storageKind(p)));
  });
 }
}
refreshDeliveryDock();
function showTrolley(){
 openPanel("Diable de manutention — "+state.trolleyCargo.length+"/3 cartons");
 if(!state.upgrades.handtruck){paragraph("Achetable dans les améliorations pour 125 €.");return;}
 if(!state.trolleyCargo.length){paragraph("Diable vide. Charge-le au quai de déchargement.");return;}
 for(const [i,it] of state.trolleyCargo.entries()){
  const p=catalog.find(p=>p.id===it.id);
  paragraph((i+1)+". "+(p?p.name:it.id)+" — "+(p?storageName(storageKind(p)):"Produit inconnu"));
  if(p&&atStorageFor(p)){
   button(panel,"Décharger "+p.name,()=>{
    const a=state.inventory[p.id];
    if(a.boxes>=MAX_BOXES_PER_PRODUCT){toast("Maximum de cartons pour "+p.name);return;}
    if(storageBoxes(storageKind(p))>=storageLimit(storageKind(p))){toast(storageName(storageKind(p))+" pleine");return;}
    a.boxes++;state.trolleyCargo.splice(i,1);sync();showTrolley();toast("Carton rangé : "+p.name);
   });
  }
 }
 if(!currentStorageKind())paragraph("Pour décharger, rends-toi dans la zone de stockage indiquée pour le carton.");
}
function showReserve(){
 const kind=currentStorageKind();
 if(!kind){toast("Approche-toi d’une zone de stockage");return;}
 openPanel(storageName(kind));
 paragraph(storageBoxes(kind)+" / "+storageLimit(kind)+" cartons occupés.");
 if(state.upgrades.handtruck&&state.trolleyCargo.length)button(panel,"Décharger le diable ("+state.trolleyCargo.length+" cartons)",showTrolley);
 if(held){
  const p=catalog.find(p=>p.id===held.id);
  paragraph("Tu portes "+held.quantity+" × "+p.name+(held.source==="loose"?" (en vrac)":" (carton)"));
  button(panel,held.source==="loose"?"Reposer les produits en vrac":held.source==="delivery"?"Ranger le carton livré":"Reposer le carton",putBack);
  return;
 }
 for(const p of unlockedProducts().filter(p=>storageKind(p)===kind)){
  const a=state.inventory[p.id];
  paragraph("● "+p.name+" — "+stockAlert(p)+" | Cartons : "+a.boxes+"/5 ("+(a.boxes*BOX_UNITS)+" unités) | Espace vrac : "+a.reserve+" unités | Total réserve : "+(a.reserve+a.boxes*BOX_UNITS));
  if(a.boxes>0)button(panel,"Prendre un carton de "+p.name+" (10)",()=>takeCarton(p,10,"box"));
  if(a.reserve>0)button(panel,"PRENDRE EN VRAC — "+p.name+" ("+Math.min(10,a.reserve)+")",()=>takeCarton(p,10,"loose"));
  if(a.boxes>0||a.reserve>0)button(panel,"Jeter des "+p.name,()=>showDisposal(p));
 }
}
let seatedAtCheckout=false,checkoutPreviousView=null;
const seatButton=document.createElement("button");
seatButton.textContent="S’asseoir à la caisse";
Object.assign(seatButton.style,{position:"fixed",right:"14px",bottom:"8%",zIndex:"25",padding:"13px",background:"#2563eb",color:"#fff",borderRadius:"10px",fontWeight:"bold",display:"none"});
document.body.appendChild(seatButton);
function sitAtCheckout(){
 if(seatedAtCheckout)return;
 releaseMouseLook();
 checkoutPreviousView={position:camera.position.clone(),yaw,pitch,targetYaw,targetPitch};
 seatedAtCheckout=true;panel.style.display="none";
 camera.position.set(7.45,1.72,7.65);
 const look=new THREE.Vector3(6.1,1.32,6.35);
 const dx=look.x-camera.position.x,dz=look.z-camera.position.z;
 yaw=targetYaw=Math.atan2(-dx,-dz);
 pitch=targetPitch=Math.atan2(look.y-camera.position.y,Math.hypot(dx,dz));
 seatButton.textContent="Se lever de la caisse";
 joystick.style.display="none";
 if(cashier)showCheckout();else{closeCheckoutUI();toast("Poste de caisse prêt — attends un client");}
}
function leaveCheckoutSeat(){
 if(!seatedAtCheckout)return;
 seatedAtCheckout=false;closeCheckoutUI();clearCheckoutVisual();
 if(checkoutPreviousView){
  camera.position.copy(checkoutPreviousView.position);
  yaw=checkoutPreviousView.yaw;pitch=checkoutPreviousView.pitch;
  targetYaw=checkoutPreviousView.targetYaw;targetPitch=checkoutPreviousView.targetPitch;
 }
 joystick.style.display="";seatButton.textContent="S’asseoir à la caisse";
}
seatButton.addEventListener("click",()=>seatedAtCheckout?leaveCheckoutSeat():sitAtCheckout());
function showCheckoutSeatPrompt(){
 openPanel("POSTE DE CAISSE");
 paragraph("Assieds-toi pour scanner les articles avec une caméra fixe orientée vers le tapis et l’écran.");
 button(panel,"S’asseoir à la caisse",sitAtCheckout);
 button(panel,"Ordinateur de gestion",showComputer);
}
function interact(){
 if(seatedAtCheckout){
  if(checkoutUI.style.display==="none")showCheckout();
  return;
 }
 if(held){
  const p=catalog.find(p=>p.id===held.id);
  if(productAvailable(p)&&near(p.x,p.z,2.75)){
   const a=state.inventory[p.id],space=Math.max(0,shelfCapacity(p)-a.shelf);
   if(!space){toast("Rayons "+p.name+" pleins");return;}
   const placed=Math.min(space,held.quantity);
   a.shelf+=placed;held.quantity-=placed;
   if(held.quantity===0)held=null;
   sync();refreshCarry();
   toast(placed+" × "+p.name+" placés"+(held?" — "+held.quantity+" restants":""));
   return;
  }
  if(currentStorageKind()){if(!atStorageFor(p)){toast("Zone de rangement : "+storageName(storageKind(p)));return;}showReserve();return;}
  toast("Suis le rayon "+p.name+" surligné en bleu puis appuie sur Interagir");
  return;
 }
 if(state.upgrades[BAKERY_ID]&&bakeryScene&&near(bakeryScene.x,bakeryScene.z,2.5)){showBakery();return;}
 if(stockerGroup.visible&&near(stockerGroup.position.x,stockerGroup.position.z,2.25)){showStockerInteraction();return;}
 if(state.workerEnabled&&workerGroup.visible&&near(workerGroup.position.x,workerGroup.position.z,2.25)){showWorkerInteraction();return;}
 if(near(25.65,-24.3,3.2)){showDeliveryDock();return;}
 if(near(15.0,7.35,1.15)&&camera.position.x<15.3&&camera.position.x>13.7){toggleColdRoomLights();return;}
 if(near(10.2,7.8,1.45)&&camera.position.x>10.2){toggleStockroomLights();return;}
 if(currentStorageKind()){showReserve();return;}
 if(openDepartmentCount()&&near(0,MALL_PLAZA_Z,3)){showMallMap();return;}
 const register=activeRegisters().find(r=>near(r.x,r.z,1.65));
 if(register){showAuxiliaryCheckout(register);return;}
 if(fridgeDoor&&playerLevel()>=4&&near(-8.5,-3.5,2.4)){
  fridgeOpen=!fridgeOpen;fridgeDoor.rotation.y=fridgeOpen?-1.15:0;
  toast(fridgeOpen?"Réfrigérateur ouvert":"Réfrigérateur fermé");return;
 }
 if(freezerLid&&playerLevel()>=4&&near(8.5,-3.5,3.1)){
  freezerOpen=!freezerOpen;freezerLid.rotation.z=freezerOpen?-.95:0;
  toast(freezerOpen?"Congélateur ouvert":"Congélateur fermé");return;
 }
 if(near(8.08,6.93,1.15)){toggleLights();return;}
 if(near(7.3,6.5,3.4)){showCheckoutSeatPrompt();return;}
 toast("Approche-toi de la réserve, de la chambre froide ou de la caisse");
}
refreshCarry();
// Commandes de déplacement et caméra lissée
let yaw=0,pitch=0,targetYaw=0,targetPitch=0,lookPointer=null,lastX=0,lastY=0;
const keys={forward:false,backward:false,left:false,right:false};
const canvas=renderer.domElement;canvas.style.touchAction="none";
const pressedMovement=new Map();
const MOUSE_SENSITIVITY_KEY="fba-mouse-sensitivity";
const DEFAULT_MOUSE_SENSITIVITY=60;
const savedMouseSensitivity=Number(localStorage.getItem(MOUSE_SENSITIVITY_KEY));
let mouseSensitivity=savedMouseSensitivity>=10&&savedMouseSensitivity<=150?savedMouseSensitivity:DEFAULT_MOUSE_SENSITIVITY;
function showSettings(){
 openPanel("Paramètres");
 const label=document.createElement("label");
 const value=document.createElement("span");
 const slider=document.createElement("input");
 slider.type="range";slider.min="10";slider.max="150";slider.step="5";
 slider.value=String(mouseSensitivity);
 slider.style.cssText="display:block;width:100%;margin:12px 0;accent-color:#38bdf8;touch-action:pan-y";
 label.append(value,slider);
 panel.appendChild(label);
 function displaySensitivity(){value.textContent="Sensibilité de la souris · "+mouseSensitivity+" %";}
 function saveSensitivity(){
  mouseSensitivity=slider.valueAsNumber;
  localStorage.setItem(MOUSE_SENSITIVITY_KEY,String(mouseSensitivity));
  displaySensitivity();
 }
 displaySensitivity();
 slider.addEventListener("input",saveSensitivity);
 button(panel,"Réinitialiser la sensibilité",()=>{
  slider.value=String(DEFAULT_MOUSE_SENSITIVITY);
  saveSensitivity();
 });
 button(panel,"Retour au menu",showMainMenu);
}
let mouseLookRequested=false,mouseLookFallback=false,mousePosition=null;
function canLookAround(){
 return !paused&&!seatedAtCheckout&&!levelModalShowing&&panel.style.display==="none"&&checkoutUI.style.display==="none";
}
function updateMouseHelp(){
 const active=document.pointerLockElement===canvas||mouseLookFallback;
 $("mouseLookHelp").textContent=active?"Souris pour regarder · Échap pour libérer":"Clique dans le jeu pour activer la souris";
}
function clearMovement(){
 pressedMovement.clear();
 for(const direction of Object.keys(keys))keys[direction]=false;
}
function releaseMouseLook(){
 mouseLookRequested=false;mouseLookFallback=false;mousePosition=null;
 clearMovement();
 if(document.pointerLockElement===canvas)document.exitPointerLock();
 updateMouseHelp();
}
function useMouseLookFallback(){
 if(!mouseLookRequested||!canLookAround())return;
 mouseLookRequested=false;mouseLookFallback=true;mousePosition=null;
 updateMouseHelp();
}
function captureMouseLook(){
 if(!canLookAround()||document.pointerLockElement===canvas||mouseLookRequested||mouseLookFallback)return;
 mouseLookRequested=true;
 if(!canvas.requestPointerLock){useMouseLookFallback();return;}
 try{
  const request=canvas.requestPointerLock();
  request?.catch(useMouseLookFallback);
 }catch{
  useMouseLookFallback();
 }
}
document.addEventListener("pointerlockchange",()=>{
 if(document.pointerLockElement===canvas){
  if(!mouseLookRequested||!canLookAround()){releaseMouseLook();return;}
  mouseLookRequested=false;mouseLookFallback=false;
 }else{
  mouseLookRequested=false;clearMovement();
 }
 mousePosition=null;updateMouseHelp();
});
document.addEventListener("pointerlockerror",useMouseLookFallback);
function turnCamera(dx,dy,sensitivity=.0025){
 targetYaw-=dx*sensitivity;
 targetPitch=THREE.MathUtils.clamp(targetPitch-dy*sensitivity,-1.15,1.15);
}
document.addEventListener("mousemove",e=>{
 if(document.pointerLockElement===canvas&&canLookAround())turnCamera(e.movementX,e.movementY,.0025*mouseSensitivity/100);
});
canvas.addEventListener("pointerleave",()=>{mousePosition=null;});

// Un toucher sur un article 3D déclenche directement son scan.
const checkoutRaycaster=new THREE.Raycaster();
canvas.addEventListener("pointerup",e=>{
 if(e.button!==0||document.pointerLockElement===canvas)return;
 if(!cashier||!checkoutVisual?.models.length||(!seatedAtCheckout&&!near(6.5,6.5,3.5)))return;
 const rect=canvas.getBoundingClientRect();
 const pointer=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
 checkoutRaycaster.setFromCamera(pointer,camera);
 const hits=checkoutRaycaster.intersectObjects(checkoutVisual.models,true);
 // Le premier objet touché détermine l'article retiré, même au milieu du tapis.
 const hit=hits.find(h=>h.object.userData.checkoutArticle);
 if(hit)scanCheckoutArticle(hit.object.userData.checkoutSlot);
});
canvas.addEventListener("pointerdown",e=>{
 if(e.pointerType==="mouse"){
  const scanning=cashier&&checkoutVisual?.models.length&&near(6.5,6.5,3.5);
  if(e.button===0&&!scanning)captureMouseLook();
  return;
 }
 if(lookPointer!==null)return;
 lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove",e=>{
 if(e.pointerType==="mouse"){
  if(!mouseLookFallback||!canLookAround())return;
  if(mousePosition)turnCamera(e.clientX-mousePosition.x,e.clientY-mousePosition.y,.0025*mouseSensitivity/100);
  mousePosition={x:e.clientX,y:e.clientY};
  return;
 }
 if(e.pointerId!==lookPointer)return;
 const dx=THREE.MathUtils.clamp(e.clientX-lastX,-65,65);
 const dy=THREE.MathUtils.clamp(e.clientY-lastY,-65,65);
 lastX=e.clientX;lastY=e.clientY;
 if(seatedAtCheckout)return;
 turnCamera(dx,dy);
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
document.addEventListener("keydown",e=>{
 if(e.code==="Escape"&&(document.pointerLockElement===canvas||mouseLookFallback)){
  releaseMouseLook();return;
 }
 if(e.target?.closest?.("input, textarea, select, [contenteditable]")||e.ctrlKey||e.altKey||e.metaKey)return;
 if(!levelModalShowing&&panel.style.display==="none"&&checkoutUI.style.display==="block"&&terminalKeyHandler?.(e)){
  e.preventDefault();return;
 }
 const direction=keyMap[e.code];
 if(direction&&canLookAround()){
  pressedMovement.set(e.code,direction);
  keys[direction]=true;e.preventDefault();
 }
 if(!e.repeat&&panel.style.display==="none"&&checkoutUI.style.display==="none"&&!levelModalShowing){
  if(e.key?.toLowerCase()==="m"){e.preventDefault();showMainMenu();}
  if(e.code==="KeyE"&&!paused&&(seatedAtCheckout||canLookAround())){e.preventDefault();interact();}
 }
});
document.addEventListener("keyup",e=>{
 const direction=pressedMovement.get(e.code);
 if(!direction)return;
 pressedMovement.delete(e.code);
 keys[direction]=Array.from(pressedMovement.values()).includes(direction);
 e.preventDefault();
});
window.addEventListener("blur",()=>{
 releaseMouseLook();
 lookPointer=null;joystickPointer=null;joyX=0;joyY=0;stick.style.transform="translate(0px,0px)";
});
function blocked(x,z,r=.4){
 // Entrée clientèle au sud (z positif), quai logistique à l'arrière (z négatif).
 const mallOpen=!!state.upgrades.annex3;
 const depth=state.upgrades.store2?-33.45:state.upgrades.store1?-21.45:-9.45;
 const shop=x>=-9.45+r&&x<=9.45-r&&z>=depth+r&&z<=9.45-r;
 const mall=mallOpen&&Math.abs(x)<=MALL_HALF_WIDTH-.15-r&&z>=MALL_MIN_Z+.15+r&&z<=ANNEX_ENTRY-.15-r;
 const mallDoor=mallOpen&&Math.abs(x)<3.3-r&&z>ANNEX_ENTRY-.8-r&&z<ANNEX_ENTRY+.95+r;
 // Le volume accessible suit les extensions physiques de la réserve.
 const reserveDepth=state.upgrades.store2?37.25:state.upgrades.store1?30.45:23.45;
 const reserve=x>10.35&&x<15.05&&z>1.8&&z<reserveDepth;
 const cold=x>15.55&&x<23.75&&z>1.8&&z<16.8;
 const electronicsReserve=state.upgrades.store2&&x>15.55&&x<20.35&&z>30.75&&z<43.7;
 const electronicsReserveDoor=state.upgrades.store2&&x>=15.0-r&&x<=15.6+r&&z>34+r&&z<35.8-r;
 const entrance=Math.abs(x)<2.15&&z>9.0&&z<13.45;
 const reserveDoor=x>=9.45-r&&x<=10.55+r&&z>4.05+r&&z<6.95-r;
 const coldDoor=x>=15.0-r&&x<=15.6+r&&z>4.25+r&&z<6.65-r;
 const serviceDoor=x>23.65&&x<25.3&&z>4.25+r&&z<6.65-r;
 const serviceCorridor=x>24.3&&x<27.0&&z>-24.0&&z<6.6;
 const rearDock=x>23.2&&x<28.1&&z>-27.4&&z<=-23.0;
 const breakRoom=x>18.05+r&&x<23.85-r&&z>-8.9+r&&z<-3.1-r;
 const breakDoor=x>23.5&&x<24.65&&z>-7.25+r&&z<-4.75-r;
 const storageWing=STORAGE_KINDS.some(kind=>{
  const wing=STORAGE_WINGS[kind];
  return inStorageWing(kind,x,z)&&x>wing.minX+.7+r&&x<wing.maxX-.7-r;
 });
 if(!(shop||mall||mallDoor||reserve||cold||storageWing||electronicsReserve||electronicsReserveDoor||entrance||reserveDoor||coldDoor||serviceDoor||serviceCorridor||rearDock||breakRoom||breakDoor))return true;
 const candidates=r<=COLLIDER_CELL_PADDING?colliderCells.get(colliderCell(x,z)):colliders;
 return candidates?.some(c=>x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ&&
  !c.disabled&&(!c.requiresUpgrade||state.upgrades[c.requiresUpgrade])&&
  (!c.lockedBy||!state.upgrades[c.lockedBy])&&(!c.level||playerLevel()>=c.level)&&
  (!c.storageGate||!storageBayCount(c.storageGate)))??false;
}
// Trajets employés sur la carte du bâtiment, sans traverser murs, rayons ni meubles.
// Les chemins parcourus sont inversés après la pause : reprise au point de travail exact.
function directWalk(from,to,isBlocked,spacing=.23){
 const steps=Math.max(1,Math.ceil(Math.hypot(to.x-from.x,to.z-from.z)/spacing));
 for(let step=1;step<=steps;step++){
  const fraction=step/steps;
  if(isBlocked(from.x+(to.x-from.x)*fraction,from.z+(to.z-from.z)*fraction))return false;
 }
 return true;
}
function staffBreakPath(from,to){
 return directWalk(from,to,(x,z)=>blocked(x,z,.22))?[from,to]:findStaffPath(from,to);
}
function findStaffPath(from,to){
 const STEP=.5,MIN_X=Math.min(-10,Math.floor(Math.min(from.x,to.x)-12)),MIN_Z=Math.floor(Math.min(-34,from.z-6,to.z-6));
 const W=Math.ceil((Math.max(30,from.x+12,to.x+12)-MIN_X)/STEP)+1;
 const H=Math.ceil((Math.max(44,from.z+2,to.z+2)-MIN_Z)/STEP)+1;
 const at=(i,j)=>({x:MIN_X+i*STEP,z:MIN_Z+j*STEP});
 const node=p=>({i:Math.max(0,Math.min(W-1,Math.round((p.x-MIN_X)/STEP))),
                 j:Math.max(0,Math.min(H-1,Math.round((p.z-MIN_Z)/STEP)))});
 const cells=new Uint8Array(W*H);
 const free=(i,j)=>{
  if(i<0||j<0||i>=W||j>=H)return false;
  const key=j*W+i;
  if(!cells[key])cells[key]=blocked(MIN_X+i*STEP,MIN_Z+j*STEP,.22)?2:1;
  return cells[key]===1;
 };
 const nearest=p=>{
  if(free(p.i,p.j))return p;
  for(let radius=1;radius<=10;radius++){
   for(let di=-radius;di<=radius;di++)for(let dj=-radius;dj<=radius;dj++){
    if(Math.max(Math.abs(di),Math.abs(dj))===radius&&free(p.i+di,p.j+dj))return {i:p.i+di,j:p.j+dj};
   }
  }
  return null;
 };
 const start=nearest(node(from)),goal=nearest(node(to));
 if(!start||!goal)return [];
 const key=(i,j)=>i+","+j,startKey=key(start.i,start.j),endKey=key(goal.i,goal.j);
 const frontier=[{i:start.i,j:start.j,g:0,f:Math.abs(start.i-goal.i)+Math.abs(start.j-goal.j)}];
 const costs=new Map([[startKey,0]]),parents=new Map(),visited=new Set();
 while(frontier.length){
  let index=0;
  for(let k=1;k<frontier.length;k++)if(frontier[k].f<frontier[index].f||(frontier[k].f===frontier[index].f&&frontier[k].g>frontier[index].g))index=k;
  const current=frontier.splice(index,1)[0],id=key(current.i,current.j);
  if(visited.has(id))continue;
  if(id===endKey){
   const grid=[];let cursor=id;
   while(cursor!==startKey){
    const [i,j]=cursor.split(",").map(Number);grid.push(at(i,j));
    cursor=parents.get(cursor);if(!cursor)return [];
   }
   grid.reverse();
   return [{x:from.x,z:from.z},at(start.i,start.j),...grid,{x:to.x,z:to.z}];
  }
  visited.add(id);
  for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const i=current.i+di,j=current.j+dj,nk=key(i,j);
   if(!free(i,j)||visited.has(nk))continue;
   const g=current.g+1;if(g>=(costs.get(nk)??Infinity))continue;
   costs.set(nk,g);parents.set(nk,id);
   frontier.push({i,j,g,f:g+Math.abs(goal.i-i)+Math.abs(goal.j-j)});
  }
 }
 return [];
}
function beginStaffBreak(group,seat){
 const from={x:group.position.x,z:group.position.z};
 const outward=staffBreakPath(from,seat);
 if(!outward.length){
  console.warn("Trajet salle de repos inaccessible depuis",from);
  return {stage:"blocked",outward:[from],route:[],index:0};
 }
 return {stage:"toRoom",outward,route:outward.slice(1),index:0};
}
function endStaffBreak(journey){
 if(journey.stage==="returning"||journey.stage==="done")return;
 if(journey.stage==="blocked"){journey.stage="done";return;}
 // Si l'heure est déjà 13h avant l'arrivée, retourner depuis la dernière étape parcourue.
 journey.route=(journey.stage==="toRoom"
   ?journey.outward.slice(0,journey.index+1)
   :journey.outward.slice(0,-1)).reverse();
 journey.index=0;journey.stage="returning";
}
function advanceStaffBreak(group,journey,dt,walk,stop,speed=2.8){
 if(journey.stage==="blocked"||journey.stage==="atBreak"){stop();return false;}
 const point=journey.route[journey.index];
 if(!point){
  journey.stage=journey.stage==="toRoom"?"atBreak":"done";stop();
  return journey.stage==="done";
 }
 const p=group.position,dx=point.x-p.x,dz=point.z-p.z,dist=Math.hypot(dx,dz);
 const step=Math.min(dist,dt*speed);
 if(dist>.001){
  const nx=p.x+dx/dist*step,nz=p.z+dz/dist*step;
  if(!blocked(nx,nz,.20)){p.x=nx;p.z=nz;}
  faceNpc(group,dx,dz,dt);walk();
 }else stop();
 if(Math.hypot(p.x-point.x,p.z-point.z)<.09){
  p.x=point.x;p.z=point.z;journey.index++;
 }
 if(journey.index>=journey.route.length){
  journey.stage=journey.stage==="toRoom"?"atBreak":"done";stop();
 }
 return journey.stage==="done";
}
function employeeBreakLabel(journey){
 if(!journey)return null;
 if(journey.stage==="toRoom")return "En route vers la salle de repos";
 if(journey.stage==="atBreak")return "En pause dans la salle de repos";
 if(journey.stage==="returning")return "Retour vers son poste";
 return null;
}
function movePlayer(dt){
 if(seatedAtCheckout||panel.style.display!=="none")return;
 const f=Number(keys.forward)-Number(keys.backward)-joyY,s=Number(keys.right)-Number(keys.left)+joyX;
 if(!f&&!s)return;
 const len=Math.max(1,Math.hypot(f,s)),speed=(state.upgrades.handtruck&&state.trolleyCargo.length?3.7:5.5)*dt;
 const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)/len*speed;
 const dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)/len*speed;
 if(!blocked(camera.position.x+dx,camera.position.z))camera.position.x+=dx;
 if(!blocked(camera.position.x,camera.position.z+dz))camera.position.z+=dz;
}
// V0.5 — panier multi-produits, caisse manuelle et horaires 08h-20h
const customers=[],queue=[];let cashier=null,shopOpen=false,spawnTimer=0,dayTimer=0;
const MAX_CUSTOMERS=5,DAY_SECONDS=600,OPEN_HOUR=8,CLOSE_HOUR=20;
const PREOPEN_HOUR=7,PREOPEN_SECONDS=45; // Préparation matinale de 7 h à 8 h
let preopenTimer=0;
function updateTime(){
 updateLighting();
 $("day").textContent=state.day+" — "+dateLabel();
 $("hour").textContent=formatHour(state.hour);
 $("shopStatus").textContent=shopOpen?"OUVERT":"FERMÉ";
 $("shopStatus").style.color=shopOpen?"#4ade80":"#fca5a5";
}
function makeCustomer(){
 const group=new THREE.Group();
 const shirts=[0xef4444,0x2563eb,0x16a34a,0xf59e0b,0x9333ea,0x0891b2,0x64748b];
 const skinTones=[0xf0c9a6,0xd9a884,0xb77c5c,0x8c593f];
 const hairColors=[0x251b18,0x553724,0x986d36,0x3a3435];
 const shirt=new THREE.MeshStandardMaterial({color:shirts[Math.floor(Math.random()*shirts.length)],roughness:.8});
 const skin=new THREE.MeshStandardMaterial({color:skinTones[Math.floor(Math.random()*skinTones.length)],roughness:.9});
 const pants=new THREE.MeshStandardMaterial({color:[0x334155,0x1e293b,0x475569,0x3f3f46][Math.floor(Math.random()*4)]});
 const hair=new THREE.MeshStandardMaterial({color:hairColors[Math.floor(Math.random()*hairColors.length)]});
 const shoes=new THREE.MeshStandardMaterial({color:0x171717});
 function part(w,h,d,mat,x,y,z,parent=group){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 const rounded=(mat,x,y,z,sx,sy,sz,parent=group)=>{
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),mat);
  mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;
 };
 rounded(shirt,0,1.25,0,.29,.42,.18);
 const head=new THREE.Group();head.position.set(0,1.78,0);group.add(head);
 rounded(skin,0,0,0,.17,.2,.16,head);
 rounded(hair,0,.115,.025,.174,.112,.16,head);
 for(const side of [-1,1])rounded(shoes,side*.061,.022,-.147,.018,.014,.01,head);
 rounded(skin,0,-.025,-.155,.031,.035,.037,head);
 const limb=(x,y)=>{const pivot=new THREE.Group();pivot.position.set(x,y,0);group.add(pivot);return pivot;};
 const l=limb(-.14,.85),r=limb(.14,.85);
 for(const leg of [l,r]){
  rounded(pants,0,-.33,0,.10,.36,.105,leg);
  rounded(shoes,0,-.745,-.052,.116,.071,.166,leg);
 }
 const armLeft=limb(-.30,1.52),armRight=limb(.30,1.52);
 for(const arm of [armLeft,armRight]){
  rounded(shirt,0,-.18,0,.085,.23,.089,arm);
  rounded(skin,0,-.45,0,.068,.18,.071,arm);
 }
 if(Math.random()<.25){
  rounded(shirt,0,.148,-.016,.188,.095,.176,head);
  part(.31,.035,.16,shirt,0,.105,-.169,head);
 }
 // Panier tenu dans la main avec des produits visibles au fur et à mesure des achats.
 const basketGroup=new THREE.Group();basketGroup.position.set(.46,.72,-.10);group.add(basketGroup);
 const basketMat=new THREE.MeshStandardMaterial({color:[0x2563eb,0x16a34a,0xd97706][Math.floor(Math.random()*3)],roughness:.78});
 const basketRim=new THREE.MeshStandardMaterial({color:0x1e293b,roughness:.75});
 part(.58,.055,.38,basketMat,0,0,0,basketGroup);
 for(const z of [-.17,.17])part(.58,.25,.04,basketMat,0,.15,z,basketGroup);
 for(const x of [-.27,.27])part(.04,.25,.38,basketMat,x,.15,0,basketGroup);
 for(const z of [-.18,.18])part(.60,.035,.035,basketRim,0,.29,z,basketGroup);
 for(const x of [-.23,.23])part(.035,.18,.04,basketRim,x,.39,0,basketGroup);
 part(.49,.035,.04,basketRim,0,.49,0,basketGroup);
 const basketCargo=[];
 for(let i=0;i<4;i++){
  const cargo=part(.15,.16,.13,new THREE.MeshStandardMaterial({color:0xfacc15}),-.16+(i%3)*.16,.13+Math.floor(i/3)*.14,-.07+(i%2)*.13,basketGroup);
  cargo.visible=false;basketCargo.push(cargo);
 }
 // Sac d'achat qui remplace le panier uniquement après le paiement.
 const bagGroup=new THREE.Group();bagGroup.position.set(.43,.67,-.10);group.add(bagGroup);
 const bagMat=new THREE.MeshStandardMaterial({color:0xd6b58b,roughness:1});
 const handleMat=new THREE.MeshStandardMaterial({color:0x91674c,roughness:1});
 part(.43,.46,.28,bagMat,0,.01,0,bagGroup);
 for(const z of [-.095,.095]){
  part(.035,.22,.035,handleMat,-.12,.31,z,bagGroup);
  part(.035,.22,.035,handleMat,.12,.31,z,bagGroup);
  part(.27,.035,.035,handleMat,0,.42,z,bagGroup);
 }
 bagGroup.visible=false;
 const available=unlockedProducts().sort(()=>Math.random()-.5);
 const first=available[0];
 const count=1+Math.floor(Math.random()*4);
 const choices=available.filter(p=>p===first||Math.hypot(p.x-first.x,p.z-first.z)<15).slice(0,count);
 const speed=1.35+Math.random()*.42;
 const route=[{x:0,z:8}];
 for(const p of choices){
  const [x,z]=stockerShelfPosition(p);
  route.push({x,z,shop:p.id});
 }
 const distance=route.reduce((length,point,i)=>{
  const previous=i?route[i-1]:{x:0,z:12.5};
  return length+Math.hypot(point.x-previous.x,point.z-previous.z);
 },0);
 group.scale.setScalar(.85+Math.random()*.19);
 group.position.set(0,0,12.5);scene.add(group);
 customers.push({
  group,route,waypoint:0,phase:"shopping",timer:0,basket:{},prices:{},total:0,scanned:0,
  speed,l,r,armLeft,armRight,head,basketGroup,basketCargo,bagGroup,
  visualClock:Math.random()*6,paid:false,walkTime:0,paymentMethod:Math.random()<.7?"cash":"card",
  stuckTime:0,shoppingTime:0,shoppingTimeLimit:Math.max(42,30+distance*1.85/speed),queueElapsed:0,checkoutElapsed:0,waitPenalty:false,missingProducts:0,lastNavX:0,lastNavZ:12.5
 });
}
function updateCustomerVisual(c,dt){
 c.visualClock+=dt;
 const ids=[];
 for(const [id,quantity] of Object.entries(c.basket)){
  for(let i=0;i<quantity&&ids.length<c.basketCargo.length;i++)ids.push(id);
 }
 for(let i=0;i<c.basketCargo.length;i++){
  const item=c.basketCargo[i],id=ids[i];
  item.visible=!!id;
  if(id){const p=catalog.find(product=>product.id===id);if(p)item.material.color.setHex(p.color);}
 }
 c.basketGroup.visible=!c.paid&&c.phase!=="leaving";
 c.bagGroup.visible=c.phase==="leaving"&&c.paid;
 c.head.rotation.y=Math.sin(c.visualClock*1.2)*.15;
 if(c.phase==="choosing"){
  const product=catalog.find(p=>p.id===c.productId);
  if(product)faceNpc(c.group,product.x-c.group.position.x,product.z-c.group.position.z,dt);
  c.l.rotation.x*=Math.exp(-12*dt);c.r.rotation.x*=Math.exp(-12*dt);
  // Le client observe le rayon et avance le bras pour prendre un produit.
  c.armLeft.rotation.x=-.7+Math.sin(c.visualClock*6)*.18;
  c.armRight.rotation.x=-.1;c.head.rotation.y=.20+Math.sin(c.visualClock*2)*.12;
  c.group.position.y=.004*Math.sin(c.visualClock*3);
 }else if(c.phase==="checkout"||c.phase==="auxCheckout"){
  const register=c.auxRegister;
  faceNpc(c.group,(register?.x??6.5)-c.group.position.x,(register?.z??6.5)-c.group.position.z,dt);
  c.l.rotation.x=0;c.r.rotation.x=0;
  c.armLeft.rotation.x=-.35+Math.sin(c.visualClock*2.8)*.10;
  c.armRight.rotation.x=-.12;c.group.position.y=0;
 }else if(c.phase==="queue"||c.phase==="auxQueue"){
  c.armLeft.rotation.x=.08*Math.sin(c.visualClock*2.1);
  c.armRight.rotation.x=-.12;c.group.position.y=.009*Math.sin(c.visualClock*1.6);
 }else{
  c.armLeft.rotation.x=Math.sin(c.walkTime)*.23;
  c.armRight.rotation.x=-.12;
  c.group.position.y=Math.abs(Math.sin(c.walkTime))*.015;
 }
}
// Zone réservée au personnel derrière la caisse : interdite aux clients.
// Le joueur conserve son accès à l'ordinateur et au poste de travail.
function customerBlocked(x,z,r=.28){
 if(blocked(x,z,r))return true;
 return x+r>4.7&&x-r<9.45&&z+r>7.25&&z-r<9.95;
}
// Navigation A* sur grille invisible : évite les collisions avec les rayons et la caisse.
const NAV_STEP=.35,NAV_MIN_X=-MALL_HALF_WIDTH,NAV_MIN_Z=MALL_MIN_Z,NAV_W=Math.ceil(2*MALL_HALF_WIDTH/NAV_STEP),NAV_H=Math.ceil((13.6-NAV_MIN_Z)/NAV_STEP);
function navNode(x,z){
 return {i:Math.max(0,Math.min(NAV_W-1,Math.round((x-NAV_MIN_X)/NAV_STEP))),
 j:Math.max(0,Math.min(NAV_H-1,Math.round((z-NAV_MIN_Z)/NAV_STEP)))};
}
function navPoint(i,j){return {x:NAV_MIN_X+i*NAV_STEP,z:NAV_MIN_Z+j*NAV_STEP};}
function navPath(from,to){
 return customerCanWalk(from,to,.28,.05)?[to]:findNavPath(from,to);
}
function customerCanWalk(from,to,radius=.26,spacing=.02){
 return directWalk(from,to,(x,z)=>customerBlocked(x,z,radius),spacing);
}
function findNavPath(from,to){
 const start=navNode(from.x,from.z),goal=navNode(to.x,to.z);
 const cells=new Uint8Array(NAV_W*NAV_H);
 const free=(i,j)=>{
  if(i<0||j<0||i>=NAV_W||j>=NAV_H)return false;
  const key=j*NAV_W+i;
  if(!cells[key])cells[key]=customerBlocked(NAV_MIN_X+i*NAV_STEP,NAV_MIN_Z+j*NAV_STEP,.28)?2:1;
  return cells[key]===1;
 };
 // Le point de grille le plus proche peut être de l'autre côté d'un coin de rayon.
 const nearest=(n,position)=>{
  const reachable=(i,j)=>free(i,j)&&(!position||customerCanWalk(position,navPoint(i,j)));
  if(reachable(n.i,n.j))return n;
  for(let radius=1;radius<=12;radius++){
   let best=null,dist=Infinity;
   for(let di=-radius;di<=radius;di++)for(let dj=-radius;dj<=radius;dj++){
    if(Math.max(Math.abs(di),Math.abs(dj))!==radius||!reachable(n.i+di,n.j+dj))continue;
    const d=di*di+dj*dj;if(d<dist){dist=d;best={i:n.i+di,j:n.j+dj};}
   }
   if(best)return best;
  }
  return null;
 };
 const exactGoal=!customerBlocked(to.x,to.z);
 const a=nearest(start,from),b=nearest(goal,exactGoal?to:null);if(!a||!b)return [];
 const key=(i,j)=>i+","+j,goalKey=key(b.i,b.j);
 const open=[{i:a.i,j:a.j,g:0,f:Math.abs(b.i-a.i)+Math.abs(b.j-a.j)}];
 const best=new Map([[key(a.i,a.j),0]]),parents=new Map(),closed=new Set();
 while(open.length){
  let index=0;for(let k=1;k<open.length;k++)if(open[k].f<open[index].f||(open[k].f===open[index].f&&open[k].g>open[index].g))index=k;
  const n=open.splice(index,1)[0],nk=key(n.i,n.j);
  if(closed.has(nk))continue;
  if(nk===goalKey){
   const path=[];let cursor=nk;
   while(cursor){
    const [i,j]=cursor.split(",").map(Number);path.push(navPoint(i,j));cursor=parents.get(cursor);
   }
   path.reverse();
   if(exactGoal)path.push({x:to.x,z:to.z});
   return path;
  }
  closed.add(nk);
  for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const i=n.i+di,j=n.j+dj,k=key(i,j);
   if(!free(i,j)||closed.has(k))continue;
   const g=n.g+1;if(g>=(best.get(k)??Infinity))continue;
   best.set(k,g);parents.set(k,nk);
   open.push({i,j,g,f:g+Math.abs(b.i-i)+Math.abs(b.j-j)});
  }
 }
 return [];
}
// Navigation réécrite : suivi de grille, arrivée réelle et récupération des impasses.
function walk(c,t,dt){
 if(!t)return false;
 const p=c.group.position,goal=t.x.toFixed(2)+","+t.z.toFixed(2);
 if(Math.hypot(p.x-t.x,p.z-t.z)<.22){c.navTarget=null;c.navRoute=null;c.stuckTime=0;return true;}
 if(c.navTarget!==goal||!c.navRoute){
  c.navTarget=goal;c.navRoute=navPath(p,t);c.navIndex=0;
 }
 const route=c.navRoute;
 if(!route?.length){
  c.stuckTime=(c.stuckTime||0)+dt;
  c.l.rotation.x=c.r.rotation.x=0;
  if(c.stuckTime>3){c.stuckTime=0;c.navTarget=null;c.navRoute=null;}
  return false;
 }
 while(c.navIndex<route.length&&Math.hypot(route[c.navIndex].x-p.x,route[c.navIndex].z-p.z)<.18){
  const next=route[c.navIndex+1];
  // Garde le point au coin d'un meuble tant que la diagonale n'est pas libre.
  if(next&&!customerCanWalk(p,next))break;
  c.navIndex++;
 }
 if(c.navIndex>=route.length){
  c.navTarget=null;c.navRoute=null;
  return Math.hypot(p.x-t.x,p.z-t.z)<.4;
 }
 const w=route[c.navIndex],dx=w.x-p.x,dz=w.z-p.z,dist=Math.hypot(dx,dz);
 const step=Math.min(c.speed*dt,dist);
 if(!step)return false;
 const nx=p.x+dx/dist*step,nz=p.z+dz/dist*step;
 if(customerBlocked(nx,nz,.25)){
  c.stuckTime=(c.stuckTime||0)+dt;
  if(c.stuckTime>.35){c.navTarget=null;c.navRoute=null;c.stuckTime=0;}
  return false;
 }
 p.x=nx;p.z=nz;c.stuckTime=0;
 faceNpc(c.group,dx,dz,dt);
 c.walkTime+=step*5.5;c.l.rotation.x=Math.sin(c.walkTime)*.4;c.r.rotation.x=-Math.sin(c.walkTime)*.4;
 return false;
}
function removeCustomer(c){
 scene.remove(c.group);
 c.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});
 const i=customers.indexOf(c);if(i!==-1)customers.splice(i,1);
}
// La file est un état indépendant : personne ne contourne la caisse côté personnel.
const extraRegisters=[
 {id:"second",level:20,x:-2.4,z:5.05,queueX:-1.15,queueZ:5.25,express:false,queue:[],client:null},
 {id:"express",level:110,x:2.1,z:3.9,queueX:1.05,queueZ:4.05,express:true,queue:[],client:null},
];
for(const register of extraRegisters){
 const {x,z,level}=register;
 register.meshes=[
  cube(x,.54,z,1.1,1.08,1.45,0x475569),
  cube(x,1.11,z,1.19,.11,1.54,0x172033),
  cube(x,1.29,z-.45,.35,.25,.16,0x22c55e),
 ];
 const sign=shelfSign(register.express?"CAISSE 3 · EXPRESS":"CAISSE 2");
 sign.position.set(x,2.05,z);scene.add(sign);register.meshes.push(sign);
 colliders.push({minX:x-.59,maxX:x+.59,minZ:z-.77,maxZ:z+.77,level});
}
function activeRegisters(){return extraRegisters.filter(r=>playerLevel()>=r.level);}
function approachingCustomerCount(register){
 return customers.filter(c=>c.phase==="approachingQueue"&&c.auxRegister===register).length;
}
function auxiliaryCustomerCount(register){
 return register.queue.length+Number(!!register.client)+approachingCustomerCount(register);
}
function showAuxiliaryRegisters(){
 openPanel("Caisses supplémentaires");
 for(const register of activeRegisters()){
  const label=register.express?"Caisse 3 · petits paniers":"Caisse 2";
  button(panel,label+" · "+auxiliaryCustomerCount(register)+" client(s)",()=>showAuxiliaryCheckout(register));
 }
 if(playerLevel()>=49){
  const hired=!!state.management.extraCashier;
  button(panel,hired?"Suspendre le caissier de la caisse 2":"Recruter le caissier de la caisse 2 · 65 € par journée travaillée",()=>{
   state.management.extraCashier=!hired;save();showAuxiliaryRegisters();
  });
 }
}
function showAuxiliaryCheckout(register){
 if(!activeRegisters().includes(register))return;
 openPanel(register.express?"Caisse 3 · express":"Caisse 2");
 const client=register.client;
 paragraph(register.queue.length+" client(s) dans la file.");
 if(!client){paragraph("Aucun client au comptoir.");button(panel,"Actualiser",()=>showAuxiliaryCheckout(register));return;}
 const items=Object.entries(client.basket).flatMap(([id,n])=>Array(n).fill(id));
 paragraph(client.scanned+" / "+items.length+" articles scannés · "+euro(client.total));
 if(client.scanned<items.length){
  const product=catalog.find(p=>p.id===items[client.scanned]);
  button(panel,"Scanner · "+product.name,()=>{
   if(register.client!==client)return;
   client.scanned++;showAuxiliaryCheckout(register);
  });
 }else button(panel,"Encaisser "+euro(client.total),()=>{
  if(payAuxiliaryCheckout(register,client))showAuxiliaryCheckout(register);
 });
}
function payAuxiliaryCheckout(register,client){
 if(register.client!==client)return false;
 const count=Object.values(client.basket).reduce((n,q)=>n+q,0);
 if(client.scanned<count)return false;
 if(count){
  state.money+=client.total;finance.revenue+=client.total;finance.transactions++;state.sales+=count;
  trackSale(client.basket,client.prices);
  client.paid=true;changeSatisfaction(2);
 }
 register.client=null;sendToExit(client);sync();checkLevelUp();
 return true;
}
function updateAuxiliaryQueue(client,dt){
 const register=client.auxRegister;
 if(!register)return;
 if(client.phase==="auxCheckout"){
  if(register.id==="second"&&state.management.extraCashier&&state.hour>=8&&state.hour<20&&
   (state.hour<12||state.hour>=13)&&state.money>=65){
   client.timer-=dt;
   if(client.timer<=0){
    client.scanned=Object.values(client.basket).reduce((n,q)=>n+q,0);
    state.management.cashierWorkedDay=state.day;
    payAuxiliaryCheckout(register,client);
   }
  }
  return;
 }
 const i=register.queue.indexOf(client);
 if(i<0){sendToExit(client);return;}
 const p=client.group.position,beforeX=p.x,beforeZ=p.z;
 const target=queueSpot(i,register);
 const arrived=walk(client,target,dt);
 if(arrived&&register.client){
  faceNpc(client.group,register.queueX-p.x,register.queueZ-p.z,dt);
  client.l.rotation.x=client.r.rotation.x=0;
 }
 const moved=Math.hypot(p.x-beforeX,p.z-beforeZ)>.003;
 client.queueStall=moved||arrived?0:(client.queueStall||0)+dt;
 if(i===0&&!register.client&&arrived){
  register.queue.shift();register.client=client;client.phase="auxCheckout";client.scanned=0;
  client.timer=2+Object.values(client.basket).reduce((n,q)=>n+q,0)*.55;
  client.navTarget=null;client.navRoute=null;
  toast(register.express?"Client à la caisse express":"Client à la caisse 2");
 }else if(client.queueStall>10)sendToExit(client);
}
const CHECKOUT_APPROACH_FALLBACK={x:3.35,z:6.5};
function queueSpot(i,register){
 if(register)return {x:register.queueX,z:register.queueZ-Math.min(i+Number(!!register.client),4)*.65};
 return {x:3.65,z:6.25-Math.min(i+Number(!!cashier),4)*.78};
}
function sendToQueue(c){
 if(c.phase==="approachingQueue"||c.phase==="queue"||c.phase==="checkout"||c.phase==="auxQueue"||c.phase==="auxCheckout")return;
 const count=Object.values(c.basket).reduce((n,q)=>n+q,0);
 if(count===0){sendToExit(c);return;}
 const register=activeRegisters().filter(r=>!r.express||count<=5)
  .sort((a,b)=>auxiliaryCustomerCount(a)-auxiliaryCustomerCount(b))[0];
 if(register&&auxiliaryCustomerCount(register)<queue.length+Number(!!cashier)+approachingCustomerCount()){
  c.auxRegister=register;
 }
 c.phase="approachingQueue";c.queueStall=0;c.checkoutApproach=null;c.navTarget=null;c.navRoute=null;
}
function updateQueueApproach(c,dt){
 const register=c.auxRegister,line=register?.queue??queue;
 const counterFree=!register&&!cashier&&line.length===0;
 if(!counterFree)c.checkoutApproach=null;
 const target=c.checkoutApproach??queueSpot(line.length,register);
 const p=c.group.position,x=p.x,z=p.z;
 const arrived=walk(c,target,dt);
 if(arrived||(counterFree&&Math.hypot(p.x-target.x,p.z-target.z)<.45&&customerCanWalk(p,target))){
  // Les clients prennent leur place à leur arrivée, dans l'ordre de la file visible.
  line.push(c);c.phase=register?"auxQueue":"queue";c.queueStall=0;
  return;
 }
 c.queueStall=Math.hypot(p.x-x,p.z-z)>.003?0:c.queueStall+dt;
 if(c.queueStall>5&&counterFree&&!c.checkoutApproach){
  c.checkoutApproach=CHECKOUT_APPROACH_FALLBACK;c.queueStall=0;
  c.navTarget=null;c.navRoute=null;
 }else if(c.queueStall>10){
  changeSatisfaction(-2);sendToExit(c);
 }
}
function sendToExit(c){
 if(!c.paid&&Object.keys(c.basket).length){
  for(const [id,quantity] of Object.entries(c.basket)){
   const p=catalog.find(product=>product.id===id),inventory=state.inventory[id];
   const returned=Math.min(quantity,Math.max(0,shelfCapacity(p)-inventory.shelf));
   inventory.shelf+=returned;inventory.reserve+=quantity-returned;
  }
  c.basket={};sync();
 }
 if(c.auxRegister){
  const register=c.auxRegister;
  register.queue=register.queue.filter(customer=>customer!==c);
  if(register.client===c)register.client=null;
  c.auxRegister=null;
  c.phase="leaving";c.waypoint=0;c.navTarget=null;c.navRoute=null;c.stuckTime=0;c.exitStall=0;
  c.route=[{x:0,z:7.7},{x:0,z:12.5}];
  return;
 }
 const index=queue.indexOf(c);if(index>=0)queue.splice(index,1);
 c.phase="leaving";c.waypoint=0;c.navTarget=null;c.navRoute=null;c.stuckTime=0;c.exitStall=0;
 c.route=[{x:0,z:8.5},{x:0,z:12.5}];
}
function updateCustomers(dt){
 for(const c of [...customers]){
  updateCustomerVisual(c,dt);
  if(c.phase==="shopping"){
   c.shoppingTime=(c.shoppingTime||0)+dt;
   if(c.shoppingTime>c.shoppingTimeLimit){sendToQueue(c);continue;}
   const t=c.route[c.waypoint];
   if(!t){sendToQueue(c);continue;}
   const beforeX=c.group.position.x,beforeZ=c.group.position.z;
   const arrived=walk(c,t,dt);
   const moved=Math.hypot(c.group.position.x-beforeX,c.group.position.z-beforeZ)>.003;
   c.shoppingStall=moved?0:(c.shoppingStall||0)+dt;
   if(arrived||c.shoppingStall>6){
    c.shoppingStall=0;c.waypoint++;c.navTarget=null;c.navRoute=null;
    if(arrived&&t.shop){c.phase="choosing";c.timer=.85+Math.random()*1.6;c.productId=t.shop;}
    else if(c.waypoint>=c.route.length)sendToQueue(c);
   }
  }else if(c.phase==="choosing"){
   c.timer-=dt;
   if(c.timer<=0){
    const a=state.inventory[c.productId];
    if(a){
     const quantity=Math.min(a.shelf,1+Math.floor(Math.random()*3));
     if(quantity>0){
      a.shelf-=quantity;c.basket[c.productId]=(c.basket[c.productId]||0)+quantity;
      c.prices[c.productId]=a.price;c.total+=quantity*a.price;sync();
     }else{
      c.missingProducts++;
      changeSatisfaction(-2);
     }
    }
    c.phase="shopping";
   }
  }else if(c.phase==="approachingQueue"){
   updateQueueApproach(c,dt);
  }else if(c.phase==="auxQueue"||c.phase==="auxCheckout"){
   updateAuxiliaryQueue(c,dt);
  }else if(c.phase==="queue"){
   c.queueElapsed+=dt;
   if(c.queueElapsed>25&&!c.waitPenalty){c.waitPenalty=true;changeSatisfaction(-3);}
   const i=queue.indexOf(c);
   if(i<0){sendToExit(c);continue;}
   const target=i===0&&!cashier&&c.checkoutApproach?c.checkoutApproach:queueSpot(i),p=c.group.position;
   const beforeX=p.x,beforeZ=p.z;
   const arrived=walk(c,target,dt);
   if(arrived&&cashier){faceNpc(c.group,3.65-p.x,6.25-p.z,dt);c.l.rotation.x=c.r.rotation.x=0;}
   const moved=Math.hypot(p.x-beforeX,p.z-beforeZ)>.003;
   c.queueStall=moved||arrived?0:(c.queueStall||0)+dt;
   if(i===0&&!cashier&&(arrived||Math.hypot(p.x-target.x,p.z-target.z)<.45)){
    queue.shift();cashier=c;c.phase="checkout";c.scanned=0;c.queueStall=0;
    c.navTarget=null;c.navRoute=null;
    if(seatedAtCheckout)showCheckout();else toast("Client en caisse : assieds-toi au poste");
   }else if(c.queueStall>5){
    c.queueStall=0;c.navTarget=null;c.navRoute=null;
    if(i===0&&!cashier){
     if(!c.checkoutApproach)c.checkoutApproach=CHECKOUT_APPROACH_FALLBACK;
     else{changeSatisfaction(-2);sendToExit(c);}
    }else c.l.rotation.x=c.r.rotation.x=0;
   }
  }else if(c.phase==="checkout"){
   if(c===cashier&&seatedAtCheckout&&panel.style.display==="none"&&checkoutUI.style.display==="none"&&
    (checkoutVisual?.customer!==c||checkoutVisual.models.length===0))showCheckout();
   c.checkoutElapsed+=dt;
   if(c.checkoutElapsed>45&&!c.waitPenalty){c.waitPenalty=true;changeSatisfaction(-3);}
   c.l.rotation.x=c.r.rotation.x=0;
  }else if(c.phase==="leaving"){
   const t=c.route[c.waypoint];
   if(!t){removeCustomer(c);continue;}
   const x=c.group.position.x,z=c.group.position.z;
   if(walk(c,t,dt)){c.waypoint++;c.exitStall=0;}
   else{
    const moved=Math.hypot(c.group.position.x-x,c.group.position.z-z)>.003;
    c.exitStall=moved?0:(c.exitStall||0)+dt;
    if(c.exitStall>7){c.waypoint++;c.exitStall=0;c.navTarget=null;c.navRoute=null;}
   }
   if(c.waypoint>=c.route.length)removeCustomer(c);
  }
 }
}
const openButton=$("openShop");
let dayStarted=false,closing=false;
function updateOpen(){
 openButton.textContent=shopOpen?"Fermer le magasin":closing?"Fermeture en cours":"Ouvrir le magasin";
 openButton.disabled=closing||state.hour<OPEN_HOUR||(isSunday()&&state.sundayMode==="closed")||state.hour>=closingHour();
 openButton.title=isSunday()&&state.sundayMode==="closed"?"Fermé le dimanche (modifiable sur le PC)":state.hour<OPEN_HOUR?"Ouverture possible à 08:00":"";
 updateTime();
}
openButton.addEventListener("click",()=>{
 if(paused){toast("Reprends la partie avant d’ouvrir le magasin");return;}
 if(closing){toast("Attends le départ des derniers clients");return;}
 if(state.hour<OPEN_HOUR){toast("Ouverture possible à 08:00");return;}
 if(isSunday()&&state.sundayMode==="closed"){toast("Dimanche fermé : change les horaires sur le PC");return;}
 if(shopOpen){
  shopOpen=false;updateOpen();toast("Fermé aux nouveaux clients");return;
 }
 if(state.hour>=closingHour()){toast("Horaire de fermeture dépassé");return;}
 dayStarted=true;shopOpen=true;spawnTimer=1;updateOpen();toast("Magasin ouvert — affluence "+customerTraffic().label.toLowerCase());
});
function business(dt){
 // Le joueur prépare son magasin entre 7 h et 8 h.
 if(!dayStarted){
  if(preopenTimer<PREOPEN_SECONDS){
   preopenTimer=Math.min(PREOPEN_SECONDS,preopenTimer+dt);
   state.hour=PREOPEN_HOUR+(preopenTimer/PREOPEN_SECONDS)*(OPEN_HOUR-PREOPEN_HOUR);
   if(preopenTimer>=PREOPEN_SECONDS){state.hour=OPEN_HOUR;dayStarted=true;toast("08:00 — Tu peux ouvrir le magasin");}
  }
  dayTimer=0;updateOpen();return;
 }
 // La journée avance même si le joueur ouvre tard ou ferme temporairement.
 if(!closing){
  dayTimer=Math.min(DAY_SECONDS,dayTimer+dt);
  state.hour=OPEN_HOUR+(dayTimer/DAY_SECONDS)*(CLOSE_HOUR-OPEN_HOUR);
  if(shopOpen&&state.hour<closingHour()){
   spawnTimer-=dt;
   if(spawnTimer<=0&&customers.length<MAX_CUSTOMERS){
    makeCustomer();spawnTimer=nextCustomerDelay();
   }
  }
  if(shopOpen&&state.hour>=closingHour()){shopOpen=false;toast("Heure de fermeture atteinte — derniers clients en caisse");}
  if(dayTimer>=DAY_SECONDS){
   state.hour=CLOSE_HOUR;shopOpen=false;closing=true;
   updateOpen();toast("20 h : fin de journée, derniers clients en caisse");
  }
 }
 // Les clients déjà présents terminent leurs achats et passent en caisse.
 if(closing&&customers.length===0&&queue.length===0&&!cashier){
  const finishedDate=gameDate();
  if(state.workerHired&&state.workerEnabled&&workerShift()&&state.workerSentHomeDay!==state.day){
   state.workerWageDue+=WORKER_DAILY_WAGE;state.workerDaysWorked++;
  }
  if(state.stockerHired&&state.stockerEnabled&&stockerShift()&&state.stockerSentHomeDay!==state.day){state.stockerWageDue+=STOCKER_DAILY_WAGE;state.stockerDaysWorked++;}
  if(finishedDate.getUTCDate()===new Date(Date.UTC(finishedDate.getUTCFullYear(),finishedDate.getUTCMonth()+1,0)).getUTCDate()){settleWorkerPayroll();const paid=Math.min(Math.max(0,state.money),state.stockerWageDue);state.money-=paid;state.stockerWageDue-=paid;state.stockerPaidTotal+=paid;}
  if(state.management.cashierWorkedDay===state.day){state.money-=65;finance.charges+=65;}
  dayTimer=0;preopenTimer=0;state.hour=PREOPEN_HOUR;state.day++;
  state.money-=DAILY_CHARGES;finance.charges+=DAILY_CHARGES;
  processStandingOrders();
  processOrderPicker();
  dayStarted=false;closing=false;shopOpen=false;spawnTimer=0;
  updateOpen();sync();
  toast(dateLabel()+" — 7 h : préparation, charges "+euro(DAILY_CHARGES));
 }
 updateTime();
}
window.addEventListener("resize",()=>{
 camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});
// La façade et les panneaux restent visibles. L'intérieur d'une boutique
// est chargé au rendu à l'approche, indépendamment du stock et de la navigation.
let renderingDeepGallery=false;
function updateGalleryRendering(){
 const {x,z}=camera.position;
 for(const [id,room] of annexGroups){
  const dx=Math.max(0,Math.abs(x-room.x)-MALL_ROOM/2);
  const dz=Math.max(0,Math.abs(z-room.z)-MALL_ROOM/2);
  const distance=room.furnishings.visible?7:5.5;
  room.furnishings.visible=room.group.visible&&!!state.upgrades[id]&&dx*dx+dz*dz<=distance*distance;
 }
 // À cette distance les luminaires du magasin ne touchent plus la galerie.
 // Les retirer du rendu évite les calculs d'éclairage inutiles par pixel.
 const deep=z<ANNEX_ENTRY-(renderingDeepGallery?5:7);
 if(deep===renderingDeepGallery)return;
 renderingDeepGallery=deep;
 ceilingLights.visible=!deep;
 coldLightGlow.visible=!deep;
 renderer.setPixelRatio(deep?Math.min(basePixelRatio,1):basePixelRatio);
}
const clock=new THREE.Clock();
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.05),smooth=1-Math.exp(-14*dt);
 yaw+=(targetYaw-yaw)*smooth;pitch+=(targetPitch-pitch)*smooth;
 camera.rotation.y=yaw;camera.rotation.x=pitch;
 if(!paused){movePlayer(dt);updateConstruction(dt);business(dt);updateBakery();updateCustomers(dt);updateWorker(dt);updateStocker(dt);}
 seatButton.style.display=seatedAtCheckout||near(7.3,6.5,3.4)?"block":"none";
 updateHandtruck();
 updateGalleryRendering();
 if(bakeryScene&&state.upgrades[BAKERY_ID]){
  bakeryScene.baker.visible=bakerOnDuty();
  const batch=state.management.bakery?.batch;
  bakeryScene.glass.emissiveIntensity=batch&&state.day*1440+state.hour*60<batch.ready ? .9 : 0;
 }
 renderer.render(scene,camera);
}
indexColliders();sync();updateOpen();updateConstructionUI();animate();toast("Business Empire Simulator V0.13.13 !");
