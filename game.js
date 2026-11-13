import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";
import { installSurveillance } from "./surveillance.js?v=0.14.34";
import { LEVEL_REWARDS, LEVEL_PHASES, MAX_LEVEL, revenueThreshold, levelForRevenue } from "./progression.js?v=0.14.34";
import { EARLY_PRODUCTS, DEPARTMENTS, ANNEX_ENTRY, MALL_ROOM, MALL_GRID, MALL_MIN_Z, MALL_HALF_WIDTH, MALL_PLAZA_Z, departmentLocation } from "./departments.js?v=0.14.34";
// Business Empire Simulator V0.14.34 — version synchronisée
const $=id=>document.getElementById(id);
const NORMAL_SAVE="business-empire-v04", DEV_SAVE="business-empire-dev-v01", LEGACY="business-empire-v02";
// L'activation est locale au navigateur, pas une authentification sécurisée.
const DEV_ACTIVATION=new URLSearchParams(location.search).get("fba-test");
if(DEV_ACTIVATION==="activer")localStorage.setItem("fba-dev-authorized","true");
const DEV_AUTHORIZED=localStorage.getItem("fba-dev-authorized")==="true";
const DEV_MODE=DEV_AUTHORIZED&&localStorage.getItem("fba-dev-enabled")==="true";
if(DEV_ACTIVATION==="activer")history.replaceState(null,"",location.pathname);
const SAVE=DEV_MODE?DEV_SAVE:NORMAL_SAVE;
const PROFILE_KEY="fba-age-profile", DEFAULT_STORE_NAME="FBA Supermarket";
const ADULT_LEVEL=35;
const birthYearNow=()=>new Date().getFullYear();
function validBirthYear(year){
 const now=birthYearNow();
 return Number.isInteger(year)&&year>=now-120&&year<=now;
}
let ageProfile=null;
try{
 const saved=JSON.parse(localStorage.getItem(PROFILE_KEY));
 if(validBirthYear(saved?.year))ageProfile=saved;
}catch(e){console.warn("Profil d’âge",e);}
function adultContentAllowed(){
 if(!ageProfile)return false;
 const difference=birthYearNow()-ageProfile.year;
 return difference>18||difference===18&&ageProfile.adultConfirmed===true;
}
const catalog=[
 {id:"eau",name:"Eau",cost:2,price:4,color:0x38bdf8,x:-5,z:-4,starter:true},
 {id:"pates",name:"Pâtes",cost:3,price:6,color:0xfacc15,x:0,z:-4,starter:true},
 {id:"savon",name:"Savon",cost:5,price:10,color:0x4ade80,x:5,z:-4,starter:true},
 {id:"lait",name:"Lait",cost:4,price:8,color:0xf8fafc,x:-5,z:1,starter:true},
 {id:"sucre",name:"Sucre",cost:3,price:7,color:0x93c5fd,x:0,z:1,starter:true},
 {id:"farine",name:"Farine",cost:3,price:7,color:0xfde68a,x:5,z:1,starter:true},
 {id:"riz",name:"Riz",cost:4,price:8,color:0xfde68a,x:-8.5,z:-7,level:2,kind:"sec"},
 {id:"conserves",name:"Conserves",cost:4,price:9,color:0xf97316,x:-6.7,z:-8.85,level:2,kind:"wall",rotation:0},
 {id:"papier",name:"Papier toilette",cost:5,price:11,color:0xe2e8f0,x:6.6,z:-8.85,level:2,kind:"wall",rotation:0},
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
for(const [id,name,cost,price,color,z] of [
 ["energie_classique","Énergie classique",2,5,0x0891b2,-1],
 ["energie_agrumes","Énergie agrumes",2,6,0xf97316,-4],
 ["energie_sans_sucre","Énergie sans sucre",3,7,0x7c3aed,-7],
]){
 catalog.push({id,name,cost,price,color,x:-38.7,z,rotation:1,level:16,kind:"wall",license:"energyLicense",requiresShelf:"checkoutHall",can:true});
}
for(const [id,name,cost,price,color,x] of [
 ["preservatifs","Préservatifs",3,7,0x496789,-28],
 ["lubrifiant","Gel intime",4,9,0x79638c,-25],
 ["accessoires_intimes","Accessoires intimes",13,29,0x445870,-15],
]){
 catalog.push({id,name,cost,price,color,x,z:-10.85,rotation:0,level:ADULT_LEVEL,kind:"wall",
  license:"intimateLicense",requiresShelf:"checkoutHall",adultOnly:true});
}
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
const FRONT_HALL="checkoutHall", AUTO_SHOWROOM="autoShowroom";
const HALL_WEST=-40;
const DIRECTOR_LEVEL=15, SECURITY_LEVEL=22, SELF_HELP_LEVEL=26, SELF_HELP_WAGE=65;
const DIRECTOR_DESK={x:-12.2,z:-4.3}, SECURITY_DESK={x:-13,z:8.1};
const EXIT_GATE={x:0,z:9.1};
const TAGGED_PRODUCTS=new Set(["smartphones","tablettes","ordinateurs","drones","appareils_photo","consoles_jeu"]);
const EMPLOYEE_DEFAULTS={
 baker:"Louis",picker:"Nina",selfHelp:"Émilie",builder1:"Antoine",builder2:"Yanis",
 main:"Sofia",second:"Hugo",
 lane3:"Lina",lane4:"Arthur",lane5:"Inès",lane6:"Noah",lane7:"Jade",lane8:"Adam",lane9:"Emma",lane10:"Lucas",
 shelf1:"Léa",shelf2:"Nathan",shelf3:"Chloé",shelf4:"Gabriel",shelf5:"Manon",
 shelf6:"Théo",shelf7:"Sarah",shelf8:"Jules",shelf9:"Nora",shelf10:"Enzo",
 dock1:"Karim",dock2:"Tom",dock3:"Youssef",dock4:"Maxime",dock5:"Romain",
 security1:"Malik",security2:"Aïcha",security3:"Victor",security4:"Maya"
};
const WOMEN_ON_STAFF=new Set(["main","lane3","lane5","lane7","lane9","shelf1","shelf3","shelf5","shelf7","shelf9","security2","security4","selfHelp"]);
function employeeName(id){return state.employeeNames[id]??EMPLOYEE_DEFAULTS[id];}
const STAFF_PLANS={
 shelf:{label:"Mise en rayon",levels:[12,14,17,20,23,27,31,36,42,48],wage:60,training:"shelfTraining"},
 dock:{label:"Manutention",levels:[13,18,24,32,40],wage:65,training:"dockTraining"},
 security:{label:"Sécurité",levels:[22,30,38,46],wage:75},
};
const FAST_RESTOCK_LIMIT=15;
const TROLLEY_BASE_CAPACITY=3, DOCK_CARRY_LIMIT=3, SHELF_CARRY_LIMIT=2;
const HAND_CARRY_UPGRADES=[
 {id:"carryTwo",name:"Port de deux cartons",level:12,cost:650,category:"competences",handCapacity:2,description:"Porte deux cartons de la même référence à la main."},
 {id:"carryThree",name:"Port de trois cartons",level:24,cost:1500,requires:"carryTwo",category:"competences",handCapacity:3,description:"Porte trois cartons de la même référence à la main."},
];
function handCapacity(){
 return HAND_CARRY_UPGRADES.reduce((limit,upgrade)=>state.upgrades[upgrade.id]?upgrade.handCapacity:limit,1);
}
const TROLLEY_UPGRADES=[
 {id:"handtruckReinforced",name:"Diable renforcé",level:12,cost:750,requires:"handtruck",category:"stock",trolleyCapacity:5,description:"Permet de transporter jusqu’à 5 cartons par trajet."},
 {id:"handtruckPlatform",name:"Plateforme de manutention",level:24,cost:2200,requires:"handtruckReinforced",category:"stock",trolleyCapacity:8,description:"Permet de transporter jusqu’à 8 cartons par trajet."},
 {id:"handtruckLarge",name:"Plateforme grande capacité",level:35,cost:6500,requires:"handtruckPlatform",category:"stock",trolleyCapacity:28,description:"Ajoute 20 places à la plateforme, pour un total de 28 cartons."},
];
function trolleyCapacity(){
 return TROLLEY_UPGRADES.reduce((capacity,upgrade)=>state.upgrades[upgrade.id]?upgrade.trolleyCapacity:capacity,TROLLEY_BASE_CAPACITY);
}
function trolleyLoadLabel(){
 return state.trolleyCargo.length+"/"+trolleyCapacity()+" cartons";
}
// Six gondoles : une par produit de départ, 30 emplacements chacune.
function shelfCapacity(p){return CAPACITY;}
const upgradeCatalog=[
 ...TROLLEY_UPGRADES,
 ...HAND_CARRY_UPGRADES,
 {id:"intimateLicense",name:"Licence Bien-être intime",level:ADULT_LEVEL,cost:2200,requires:FRONT_HALL,category:"licences",
  adultOnly:true,description:"Ouvre un rayon de produits intimes et d’accessoires sexuels, en emballages neutres."},
 {id:FRONT_HALL,name:"Hall des caisses",level:15,cost:7500,requires:"store1",category:"extensions",construction:true,description:"Agrandit le magasin côté ouest. Accueille les caisses supplémentaires, les bornes libre-service et le rayon boissons énergisantes."},
 {id:"energyLicense",name:"Licence boissons énergisantes",level:16,cost:850,requires:FRONT_HALL,category:"licences",description:"Autorise trois boissons énergisantes dans le hall ouest."},
 {id:"shelfTraining",name:"Formation au réassort",level:18,cost:1400,category:"competences",description:"L’équipe de mise en rayon se déplace 10 % plus vite."},
 {id:"dockTraining",name:"Formation à la manutention",level:20,cost:1800,category:"competences",description:"Les manutentionnaires se déplacent 15 % plus vite avec un carton."},
 {id:"checkoutTraining",name:"Formation à l’encaissement",level:28,cost:2400,category:"competences",description:"Les caissiers employés terminent leurs transactions 20 % plus vite."},
 {id:AUTO_SHOWROOM,name:"Showroom FBA Automobile",level:45,cost:18000,requires:FRONT_HALL,category:"extensions",construction:true,description:"Ouvre un showroom pour exposer, commander et vendre des voitures."},
 {id:"autoLicense",name:"Licence Automobile",level:46,cost:3500,requires:AUTO_SHOWROOM,category:"licences",description:"Autorise la vente de voitures électriques et thermiques."},
 {id:"handtruck",name:"Diable de manutention",level:1,cost:125,description:"Transporte jusqu’à 3 cartons du quai vers les trois zones de stockage."},
 {id:"reserve1",name:"Réserve agrandie I",level:3,cost:900,description:"Capacité de stockage : 30 à 60 cartons."},
 {id:"store1",name:"Extension du magasin I",level:4,cost:1800,description:"Agrandit le magasin et la réserve sèche : +40 places de stockage, jusqu’à 100 cartons après l’amélioration du niveau 3."},
 {id:"store2",name:"Extension Électronique II",level:5,cost:3000,requires:"store1",description:"Hall électronique avec neuf rayons disponibles dès l’ouverture et un emplacement pour les téléphones au niveau 6. Réserve électronique : 60 cartons. Réserve sèche : +60 cartons."},
 // L’identifiant de l’ancienne compétence conserve les achats des sauvegardes existantes.
 {id:"phoneSkill",name:"Licence Téléphonie",level:6,cost:1200,requires:"store2",category:"licences",description:"Autorise la vente de téléphones après l’installation du rayon dédié."},
 {id:"phones",name:"Rayon Téléphones",level:6,cost:2400,requires:["store2","phoneSkill"],category:"extensions",description:"Ouvre le rayon Téléphones dans le hall électronique."},
 {id:"fastMovement",name:"Déplacement rapide",level:6,cost:500,category:"competences",description:"Augmente de 25 % ta vitesse de déplacement à pied."},
 {id:"fastRestock",name:"Mise en rayon efficace",level:8,cost:800,category:"competences",description:"Prends jusqu’à 15 articles d’un même produit en réserve et dépose-les en une seule interaction si le rayon a la place."},
 {id:"gamingSkill",name:"Licence Jeux vidéo",level:8,cost:1600,category:"licences",description:"Autorise l’ouverture du rayon Consoles au niveau 10."},
 {id:"consoles",name:"Rayon Consoles",level:10,cost:3500,requires:"gamingSkill",category:"extensions",description:"Débloque le rayon Consoles. Les consoles seront ajoutées au catalogue dans une prochaine mise à jour."},
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
const MAX_BOXES_PER_PRODUCT=25;
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
 if(state.inventory[p.id].boxes>=MAX_BOXES_PER_PRODUCT)return "Maximum de "+MAX_BOXES_PER_PRODUCT+" cartons de "+p.name+" atteint";
 if(storageBoxes(storageKind(p))>=storageLimit(storageKind(p)))return storageName(storageKind(p))+" pleine";
 return "";
}
function hasProductLicense(p){
 if(p.license)return !!state.upgrades[p.license];
 if(p.id==="fromage"||p.id==="surgeles")return !!state.upgrades.freshLicense;
 if(p.id==="pommes")return !!state.upgrades.fruitLicense;
 return true;
}
function contentVisible(item){return !item?.adultOnly||adultContentAllowed();}
function productAvailable(p){return contentVisible(p)&&playerLevel()>=(p.level||1)&&hasProductLicense(p)&&(!p.department||state.upgrades[p.department])&&(p.kind!=="electronics"||!!state.upgrades.store2)&&
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
   paragraph(employeeName("builder1")+" et "+employeeName("builder2")+" · chantier de 8 h à 17 h sur trois journées de travail.");
  }
 }else if(activeUpgradeTab==="licences"){
  note.textContent="Licences commerciales : elles doivent être achetées pour vendre les produits concernés.";
 }else if(activeUpgradeTab==="competences"){
  note.textContent="Bonus qui améliorent tes actions en jeu.";
 }else if(activeUpgradeTab==="employes"){
  note.textContent="Gestion des employés : embauche, planning et affectations.";
  paragraph("Manutentionnaire — "+(state.workerHired?"Recruté":"Non recruté")+".");
  button(panel,"Gérer "+state.workerName+" — manutention",showWorkerManagement);
  paragraph("Mise en rayon — "+(state.stockerHired?"Recruté":"Non recruté")+".");
  button(panel,"Gérer "+state.stockerName+" — mise en rayon",showStockerManagement);
  button(panel,"Planning du personnel",showWorkerPlanning);
  button(panel,"Recrutement et équipes",()=>showTeamManagement());
  paragraph("D'autres postes pourront être ajoutés dans une future mise à jour.");
 }
 const upgrades=upgradeCatalog.filter(u=>contentVisible(u)&&upgradeCategory(u)===activeUpgradeTab).sort((a,b)=>a.level-b.level);
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
   if(typeof current.storeName==="string")s.storeName=current.storeName.trim().slice(0,40);
   if(current.employeeNames&&typeof current.employeeNames==="object"){
    s.employeeNames=Object.fromEntries(Object.entries(current.employeeNames)
     .filter(([key,name])=>Object.hasOwn(EMPLOYEE_DEFAULTS,key)&&typeof name==="string"&&name.trim())
     .map(([key,name])=>[key,name.trim().slice(0,24)]));
   }
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
   if(Array.isArray(current.trolleyCargo))s.trolleyCargo=current.trolleyCargo.filter(it=>it&&catalog.some(p=>p.id===it.id)).map(it=>({id:it.id}));
   if(["closed","morning"].includes(current.sundayMode))s.sundayMode=current.sundayMode;
   if(current.lighting&&typeof current.lighting==="object"){
    s.lighting=Object.fromEntries(Object.entries(current.lighting).filter(([,value])=>typeof value==="boolean"));
   }
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
state.storeName=state.storeName||DEFAULT_STORE_NAME;
state.employeeNames??={};
state.workerName=state.workerName||"George";
state.workerSentHomeDay=Number.isInteger(state.workerSentHomeDay)?state.workerSentHomeDay:0;
const finance=state.finance;
function save(){
 try{
  const inTransit=teamUnits.filter(unit=>unit.cargo);
  if(workerCargo)inTransit.push({role:"dock",cargo:{product:{id:workerCargo.id},quantity:workerCargo.qty}});
  if(stockerCargo&&stockerUnits)inTransit.push({role:"shelf",cargo:{product:{id:stockerCargo},quantity:stockerUnits}});
  if(held)inTransit.push({role:held.source==="delivery"?"dock":"shelf",cargo:{product:{id:held.id},quantity:held.quantity}});
  const snapshot=inTransit.length?{...state,inventory:{...state.inventory},deliveryDock:[...state.deliveryDock]}:state;
  for(const unit of inTransit){
   const {product,quantity}=unit.cargo;
   if(unit.role==="dock"){
    const full=Math.floor(quantity/BOX_UNITS);
    for(let i=0;i<full;i++)snapshot.deliveryDock.push({id:product.id,qty:BOX_UNITS});
    const remainder=quantity%BOX_UNITS;
    if(remainder){
     const inventory={...snapshot.inventory[product.id]};
     inventory.reserve+=remainder;snapshot.inventory[product.id]=inventory;
    }
   }
   else{
    const inventory={...snapshot.inventory[product.id]};
    inventory.reserve+=quantity;snapshot.inventory[product.id]=inventory;
   }
  }
  localStorage.setItem(SAVE,JSON.stringify(snapshot));
 }catch(e){console.warn(e);}
}
function total(){return catalog.filter(contentVisible).reduce((n,p)=>{const a=state.inventory[p.id];return n+a.shelf+a.reserve+a.boxes*BOX_UNITS;},0);}
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
 const lanes=state.upgrades[FRONT_HALL]?activeRegisters().filter(r=>r.self||cashierOnDuty(r.id)).length:0;
 return (traffic.min+Math.random()*(traffic.max-traffic.min))/Math.min(2.5,1+lanes*.18);
}
function customerLimit(){
 if(!state.upgrades[FRONT_HALL])return MAX_CUSTOMERS;
 const lanes=activeRegisters().filter(r=>r.self||cashierOnDuty(r.id)).length;
 return Math.min(graphicsMode==="fluid"?14:22,8+lanes*2);
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
 return [1,2,3,4,5,6,7,8,9,10,11,14,16,18,19,20,24,25,31,49,59,66,72,77,86,88,94,104,109,110,112,138,154,172,174,179,199,200].includes(level);
}
function staffMilestones(level){
 const notes=Object.values(STAFF_PLANS).flatMap(plan=>{
  const index=plan.levels.indexOf(level);
  return index<0?[]:[plan.label+" · poste "+(index+1)+" disponible au recrutement"];
 });
 if(level===DIRECTOR_LEVEL)notes.push("Bureau du directeur · après ouverture du hall des caisses");
 if(level===SECURITY_LEVEL)notes.push("Poste de sécurité et portiques antivol · après ouverture du hall des caisses");
 if(level===SELF_HELP_LEVEL)notes.push("Assistance libre-service · recrutement de "+employeeName("selfHelp")+" · "+euro(SELF_HELP_WAGE)+" par journée de service");
 if(level===20)notes.push("Recrutement aux caisses 1 et 2");
 for(const register of extraRegisters){
  if(register.hall&&register.level===level)notes.push(register.label+" · après ouverture du hall des caisses");
 }
 return notes;
}
function milestoneEntries(level){
 const entries=LEVEL_REWARDS[level-1];
 const planned=entries.map((description,index)=>{
  if(!description)return "";
  if(level<=10&&index>0)return description;
  if(index===0)return (implementedMilestone(level)?"":"Programme · ")+description.replace(/^Proposition · /,"");
  const categories=["","licences","extensions","stock","froid"];
  const offers=upgradeCatalog.filter(u=>u.level===level&&upgradeCategory(u)===categories[index]);
  return offers.length?offers.map(u=>u.name+" ("+euro(u.cost)+")").join(" · "):(level===1?"":"Programme · ")+description;
 }).filter(Boolean);
 const additions=upgradeCatalog.filter(u=>contentVisible(u)&&u.level===level&&
  (u.trolleyCapacity||u.handCapacity||[FRONT_HALL,AUTO_SHOWROOM,"energyLicense","autoLicense","shelfTraining","dockTraining","checkoutTraining","intimateLicense"].includes(u.id)));
 return [...planned,...staffMilestones(level),...additions.map(u=>u.name+" · "+euro(u.cost)+" · "+u.description)];
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
 const newProducts=catalog.filter(p=>contentVisible(p)&&(p.level||1)===level);
 section("NOUVEAUX PRODUITS",newProducts.map(p=>{
  const required=p.license||(["fromage","surgeles"].includes(p.id)?"freshLicense":p.id==="pommes"?"fruitLicense":null);
  const prerequisites=[required,p.requiresShelf,p.department].filter(id=>id&&!state.upgrades[id]).map(id=>upgradeCatalog.find(u=>u.id===id)?.name).filter(Boolean);
  return p.name+(prerequisites.length?" — nécessite : "+prerequisites.join(" et "):" — disponible");
 }));
 const newUpgrades=upgradeCatalog.filter(u=>contentVisible(u)&&u.level===level);
 section("AMÉLIORATIONS ET COMPÉTENCES",newUpgrades.map(u=>{
  const prerequisites=missingUpgradePrerequisites(u);
  const restriction=prerequisites.length?" — nécessite d’abord : "+prerequisites.join(" et "):"";
  return u.name+" ("+euro(u.cost)+")"+restriction+(state.upgrades[u.id]?" — déjà acquis":"");
 }));
 section("RECRUTEMENT ET CAISSES",staffMilestones(level));
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
  +inTransitBoxes(id);
}
function inTransitBoxes(id){
 let count=workerCargo?.id===id?Math.ceil(workerCargo.qty/BOX_UNITS):0;
 if(held?.source==="delivery"&&held.id===id)count+=Math.ceil(held.quantity/BOX_UNITS);
 for(const unit of teamUnits)if(unit.role==="dock"&&unit.cargo?.product.id===id)count+=Math.ceil(unit.cargo.quantity/BOX_UNITS);
 return count;
}
function pendingTotal(kind){
 return catalog.reduce((total,p)=>total+(!kind||storageKind(p)===kind?pendingBoxes(p.id):0),0);
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
 if(count>=MAX_BOXES_PER_PRODUCT){toast("Maximum de "+MAX_BOXES_PER_PRODUCT+" cartons, commandes en attente incluses");return;}
 const kind=storageKind(p);
 if(cartCount(kind)>=cartCapacity(kind)){toast(storageName(kind)+" pleine — pas de nouvelle commande possible");return;}
 supplierCart[p.id]=(supplierCart[p.id]||0)+1;showOrders();
}
function addAllSupplierItems(){
 const free=Object.fromEntries(STORAGE_KINDS.map(kind=>[kind,cartCapacity(kind)-cartCount(kind)]));
 const items=unlockedProducts().map(p=>({
  id:p.id,kind:storageKind(p),
  remaining:MAX_BOXES_PER_PRODUCT-state.inventory[p.id].boxes-pendingBoxes(p.id)-(supplierCart[p.id]||0)
 })).filter(item=>item.remaining>0);
 let added=0;
 function addCartons(item,requested){
  const quantity=Math.min(requested,item.remaining,free[item.kind]);
  if(quantity<=0)return;
  supplierCart[item.id]=(supplierCart[item.id]||0)+quantity;
  item.remaining-=quantity;
  free[item.kind]-=quantity;
  added+=quantity;
 }
 // Couvrir chaque référence avant de compléter les stocks les plus proches de la limite.
 for(const item of items)if(!supplierCart[item.id])addCartons(item,1);
 items.sort((a,b)=>a.remaining-b.remaining);
 for(const item of items)addCartons(item,item.remaining);
 showOrders();
 if(!added){toast("Aucun carton à ajouter · réserves pleines ou limites par produit atteintes");return;}
 const incomplete=items.filter(item=>item.remaining>0).length;
 toast(added+" carton(s) ajouté(s)"+(incomplete?" · "+incomplete+" référence(s) limitées par la place en réserve":""));
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
 button(panel,"Tout commander",addAllSupplierItems);
 paragraph("Complète chaque produit débloqué jusqu’à "+MAX_BOXES_PER_PRODUCT+" cartons selon la place libre. Les cartons en livraison et dans le panier sont comptés. Après paiement, la livraison arrive au quai de déchargement.");
 paragraph("SOUS-TOTAL : "+euro(cartSubtotal())+" — "+cartCount()+" carton(s)");
 if(cartCount()){
  button(panel,"Commander · Livraison normale (30 s) : "+euro(cartSubtotal()),()=>checkoutSupplier(false));
  button(panel,"Commander · Livraison express (5 s, +20 %) : "+euro(Math.round(cartSubtotal()*120)/100),()=>checkoutSupplier(true));
 }
 const capacity=renderStockCapacity(panel);
 paragraph("Chaque zone possède sa capacité indépendante. Limite : "+MAX_BOXES_PER_PRODUCT+" cartons par produit, commandes en attente comprises.");
 if(Object.values(capacity).some(zone=>zone.free===0))paragraph("Tu peux commander pour les zones qui ont encore de la place.");
 for(const p of unlockedProducts()){
  const a=state.inventory[p.id],qty=supplierCart[p.id]||0,pending=pendingBoxes(p.id);
  const perProductRemaining=MAX_BOXES_PER_PRODUCT-a.boxes-pending-qty;
  const kind=storageKind(p);
  const productStatus=perProductRemaining<=0?"PLEIN":perProductRemaining===1?"DERNIÈRE PLACE":"Disponible";
  paragraph(p.name+" ("+storageName(kind)+") — "+productStatus+" | "+a.boxes+"/"+MAX_BOXES_PER_PRODUCT+" stockés | "+pending+" à livrer | Panier : "+qty+" | "+euro(p.cost*BOX_UNITS)+"/carton");
  const add=button(panel,"+ Ajouter 1 carton de "+p.name,()=>addSupplierItem(p));
  add.disabled=a.boxes+pending+qty>=MAX_BOXES_PER_PRODUCT||cartCapacity(kind)<=cartCount(kind);
  if(add.disabled)add.style.opacity=".45";
  if(qty)button(panel,"− Retirer 1 carton de "+p.name,()=>{supplierCart[p.id]--;if(!supplierCart[p.id])delete supplierCart[p.id];showOrders();});
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
  paragraph(p.name+" — "+stockAlert(p)+" | Rayon "+a.shelf+"/"+shelfCapacity(p)+" | "+storageName(storageKind(p))+" : "+a.boxes+"/"+MAX_BOXES_PER_PRODUCT+" cartons + "+a.reserve+" en vrac | "+a.price+" €");
 });
}
function showPrices(){
 openPanel("Prix de vente");
 catalog.filter(contentVisible).forEach(p=>{
  const a=state.inventory[p.id];paragraph(p.name+" : "+a.price+" €");
  button(panel,"− 1 €",()=>{a.price=Math.max(1,a.price-1);updatePriceLabel(p);save();showPrices();});
  button(panel,"+ 1 €",()=>{a.price++;updatePriceLabel(p);save();showPrices();});
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
const handtruckButton=button(actions,"Utiliser le diable (T)",useHandtruck);
handtruckButton.setAttribute("aria-keyshortcuts","T");
handtruckButton.style.display="none";
const checkoutRushButton=button(actions,"Files d’attente",showCheckoutRush);
checkoutRushButton.style.background="#92400e";
checkoutRushButton.style.display="none";
function showProfile(){
 openPanel("Profil du commerçant");
 paragraph("Commerçant · "+state.playerName);
 paragraph("Magasin · "+state.storeName);
 button(panel,"Personnaliser les noms",showNames);
 paragraph("Jour : "+state.day+" | Heure : "+formatHour(state.hour));
 paragraph("Trésorerie : "+euro(state.money));
 paragraph("Articles vendus : "+state.sales);
 paragraph("Transactions : "+finance.transactions);
 paragraph("Niveau du magasin : "+playerLevel());
 if(playerLevel()===MAX_LEVEL)paragraph("Statut · Hypermarché phare");
 paragraph("Chiffre d’affaires encaissé : "+euro(finance.revenue));
 paragraph(nextLevelLabel());
 button(panel,"Progression des niveaux",showProgression);
 button(panel,"Files et renfort en caisse",showCheckoutRush);
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
  for(const u of upgradeCatalog.filter(contentVisible))state.upgrades[u.id]=true;
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
 if(playerLevel()>=12)button(panel,"Recrutement et équipes",()=>showTeamManagement());
 if(state.upgrades[AUTO_SHOWROOM])button(panel,"Service automobile",showAutoService);
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
 else button(panel,"Remarques des clients",showCustomerFeedback);
 if(playerLevel()>=24)button(panel,"Fournil et boulanger",showBakery);
 if(playerLevel()>=40)button(panel,"Commandes des clients",showOrderServices);
 button(panel,"Calendrier et horaires",showCalendar);
 button(panel,"Personnaliser les noms",showNames);
 button(panel,"État de l’équipe — présence et tâches",showEmployeeOverview);
 button(panel,"Recrutement et équipes",()=>showTeamManagement());
 if(state.upgrades[AUTO_SHOWROOM])button(panel,"Service automobile",showAutoService);
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
 openPanel("Fournil · "+employeeName("baker"));
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
 button(panel,"Remarques des clients",showCustomerFeedback);
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
  button(panel,hired?"Suspendre "+employeeName("picker"):"Recruter "+employeeName("picker")+" · 60 € par jour avec préparation",()=>{
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

function nameField(title,value,maxLength=24){
 const label=document.createElement("label");
 label.textContent=title;label.style.cssText="display:block;margin-top:12px";
 const field=document.createElement("input");
 field.type="text";field.maxLength=maxLength;field.value=value;
 field.style.cssText="display:block;width:100%;box-sizing:border-box;padding:8px;margin-top:5px;color:#111;background:#fff;border-radius:8px";
 label.appendChild(field);panel.appendChild(label);
 return field;
}
function showNames(){
 openPanel("Personnalisation");
 paragraph("Les noms sont enregistrés dans cette partie.");
 const player=nameField("Ton nom",state.playerName);
 const store=nameField("Nom du magasin",state.storeName,40);
 button(panel,"Enregistrer",()=>{
  state.playerName=player.value.trim().slice(0,24)||"Joueur";
  state.storeName=store.value.trim().slice(0,40)||DEFAULT_STORE_NAME;
  updateStoreSigns();save();showNames();toast("Noms enregistrés");
 });
 for(const [role,title] of [["shelf","Mise en rayon"],["dock","Manutention"],["checkout","Caissiers"],["security","Sécurité"],["other","Boulangerie, commandes et chantier"]]){
  button(panel,title,()=>showEmployeeNames(role,title));
 }
 button(panel,"Retour au profil",showProfile);
}
function showEmployeeNames(role,title){
 openPanel(title);
 const fields=[];
 if(role==="shelf")fields.push(["stockerName",nameField("Responsable de la mise en rayon",state.stockerName),"Camille"]);
 if(role==="dock")fields.push(["workerName",nameField("Responsable de la manutention",state.workerName),"George"]);
 for(const unit of teamUnits.filter(unit=>unit.role===role)){
  fields.push([unit.id,nameField(unit.name,employeeName(unit.id)),EMPLOYEE_DEFAULTS[unit.id]]);
 }
 if(role==="checkout"){
  for(const register of [{id:"main",label:"Caisse 1"},...extraRegisters.filter(r=>!r.self&&!r.legacy)]){
   fields.push([register.id,nameField(register.label,employeeName(register.id)),EMPLOYEE_DEFAULTS[register.id]]);
  }
 }
 if(role==="other"){
  for(const [id,label] of [["baker","Boulanger"],["picker","Préparateur de commandes"],["selfHelp","Assistance libre-service"],["builder1","Ouvrier de chantier 1"],["builder2","Ouvrier de chantier 2"]]){
   fields.push([id,nameField(label,employeeName(id)),EMPLOYEE_DEFAULTS[id]]);
  }
 }
 button(panel,"Enregistrer",()=>{
  for(const [id,field,fallback] of fields){
   const name=field.value.trim().slice(0,24)||fallback;
   if(id==="workerName"||id==="stockerName")state[id]=name;
   else state.employeeNames[id]=name;
  }
  save();showEmployeeNames(role,title);toast("Noms de l’équipe enregistrés");
 });
 button(panel,"Retour à la personnalisation",showNames);
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
 button(panel,"Personnaliser les noms",showNames);
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
  paragraph(employeeName("baker")+" · boulanger recruté à l’ouverture du fournil");
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
function checkoutSlotCount(){return playerLevel()>=10?6:5;}
function fillCheckoutSlots(belt){
 for(let slot=0;slot<belt.items.length&&belt.waiting.length;slot++){
  if(!belt.items[slot])belt.items[slot]=belt.waiting.shift();
 }
}
function checkoutBelt(c){
 const belt=c.belt??={items:[],waiting:Object.entries(c.basket).flatMap(([id,q])=>Array(Math.max(0,q)).fill(id)),refillDelay:0};
 const slots=checkoutSlotCount();
 if(belt.items.length!==slots){
  if(belt.items.length>slots){
   belt.waiting.unshift(...belt.items.splice(slots).filter(Boolean));
   if(c.pendingAntitheft?.slot>=slots)c.pendingAntitheft=null;
  }
  while(belt.items.length<slots)belt.items.push(null);
  if(!belt.refillDelay)fillCheckoutSlots(belt);
 }
 return belt;
}
function renderCheckoutVisual(c){
 const {items}=checkoutBelt(c),slots=items.length;
 if(checkoutVisual?.customer===c&&checkoutVisual.items.length===slots&&
  checkoutVisual.items.every((id,index)=>id===items[index]))return;
 clearCheckoutVisual();
 const models=[];
 items.forEach((id,i)=>{
  if(!id)return;
  const p=catalog.find(x=>x.id===id);if(!p)return;
  const m=productModel(p);m.scale.setScalar(.7);
  if(TAGGED_PRODUCTS.has(id)){
   const tag=new THREE.Mesh(new THREE.BoxGeometry(.10,.068,.052),checkoutTagMaterial);
   tag.position.set(.14,.13,.095);m.add(tag);
  }
  if(slots===6){
   const backRow=i%2;
   m.position.set(6.05-Math.floor(i/2)*.36+backRow*.15,1.28,backRow?6.16:6.75);
  }
  else m.position.set(6.16-i*.23,1.28,6.44);
  // L’index désigne une place fixe sur le tapis.
  m.traverse(o=>{o.userData.checkoutArticle=true;o.userData.checkoutSlot=i;});
  scene.add(m);models.push(m);
 });
 checkoutVisual={customer:c,items:items.slice(),models};
}
function scanCheckoutArticle(slot){
 const c=cashier;if(!c||c.phase!=="checkout")return;
 if(c.pendingAntitheft)return;
 const count=Object.values(c.basket).reduce((n,q)=>n+q,0);
 if(c.scanned>=count)return;
 const belt=checkoutBelt(c);
 const id=belt.items[slot];
 if(!Number.isInteger(slot)||!id)return;
 if(TAGGED_PRODUCTS.has(id)){
  c.pendingAntitheft={slot,id};
  showAntitheftRemoval(c);
  return;
 }
 finishArticleScan(c,belt,slot,count);
}
function showAntitheftRemoval(c){
 const pending=c.pendingAntitheft;
 const product=catalog.find(p=>p.id===pending.id);
 releaseMouseLook();
 terminalKeyHandler=null;
 checkoutUI.replaceChildren();checkoutUI.style.display="block";
 checkoutText("CAISSE 1 · ANTIVOL",true);
 checkoutText(product.name+" · antivol actif");
 checkoutText("Confirme le retrait pour scanner cet article.");
 checkoutButton("Retirer l’antivol et scanner",()=>resolveAntitheft(c,pending,true));
 checkoutButton("Scanner sans retirer l’antivol",()=>resolveAntitheft(c,pending,false));
}
function resolveAntitheft(c,pending,removed){
 if(c!==cashier||c.phase!=="checkout"||c.pendingAntitheft!==pending||!registerOpen())return;
 const belt=checkoutBelt(c);
 if(belt.items[pending.slot]!==pending.id){showCheckout();return;}
 c.pendingAntitheft=null;
 if(!removed)c.forgottenTag??=pending.id;
 const count=Object.values(c.basket).reduce((n,q)=>n+q,0);
 finishArticleScan(c,belt,pending.slot,count,removed?"Antivol retiré · article scanné":"Article scanné · antivol encore actif");
}
function finishArticleScan(c,belt,slot,count,message){
 belt.items[slot]=null;
 if(belt.waiting.length)belt.refillDelay=.25;
 c.scanned++;
 playSound("scan");
 renderCheckoutVisual(c);
 toast(message??(c.scanned===count?"Tous les articles sont scannés":"Bip ! Article scanné"));
 if(c.scanned===count)showPayment(c,count);
 else closeCheckoutUI();
}
function sayCheckoutLine(customer,stage,message){
 const spoken=customer.checkoutLines??=new Set();
 if(spoken.has(stage))return false;
 spoken.add(stage);
 speakDialogue(message,"customer");
 return true;
}
function showCheckout(){
 if(!cashier){closeCheckoutUI();clearCheckoutVisual();return;}
 if(!registerOpen()){toast("Caisse fermée · assieds-toi pour ouvrir le poste");return;}
 if(!seatedAtCheckout&&!near(6.5,6.5,3.5)){toast("Approche-toi de la caisse");return;}
 releaseMouseLook();
 panel.style.display="none";
 const c=cashier,count=Object.values(c.basket).reduce((n,q)=>n+q,0);
 const greeted=sayCheckoutLine(c,"greeting","Bonjour !");
 if(!count){checkoutUI.replaceChildren();checkoutUI.style.display="block";checkoutText("Panier vide");checkoutButton("Terminer",()=>finishCheckout(c));return;}
 renderCheckoutVisual(c);
 if(c.pendingAntitheft)showAntitheftRemoval(c);
 else if(c.scanned>=count)showPayment(c,count);
 else{
  closeCheckoutUI();
  toast((greeted?"Client · Bonjour ! — ":"")+"Touche directement les articles sur le tapis pour les scanner");
 }
}
function completeCheckoutPayment(c,count,staffed=false){
 if(c!==cashier)return;
 state.money+=c.total;state.sales+=count;
 finance.revenue+=c.total;finance.transactions++;
 trackSale(c.basket,c.prices);
 c.paid=true;
 c.manualCheckout=!staffed;
 if(!staffed&&c.paymentMethod==="cash")playSound("close");
 if(count>0)changeSatisfaction(c.waitPenalty?1:3);
 sync();finishCheckout(c,staffed);
 checkLevelUp();
 const farewell=!staffed&&sayCheckoutLine(c,"farewell","Merci, bonne journée !");
 toast("Paiement accepté : +"+euro(c.total)+(farewell?" · Client : Merci, bonne journée !":""));
}
function showPayment(c,count){
 if(c!==cashier)return;
 terminalKeyHandler=null;
 releaseMouseLook();
 checkoutUI.replaceChildren();checkoutUI.style.display="block";
 checkoutText("FBA — MODE DE PAIEMENT",true);
 checkoutText("À régler : "+euro(c.total),true);
 const paymentLine=c.paymentMethod==="cash"?"Je paie en espèces.":"Je paie par carte.";
 checkoutText("Client · "+paymentLine);
 sayCheckoutLine(c,"payment",paymentLine);
 checkoutButton(c.paymentMethod==="cash"?"Ouvrir le tiroir-caisse":"Ouvrir le terminal bancaire",()=>{
  if(c.paymentMethod==="cash"){playSound("open");showCashPayment(c,count);}
  else showCardPayment(c,count);
 });
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
function finishCheckout(c,staffed=false){
 if(c!==cashier)return;
 closeCheckoutUI();clearCheckoutVisual();cashier=null;
 sendToExit(c);
 if(!staffed)panel.style.display="none";
}
// Scène et éclairage léger
const scene=new THREE.Scene();scene.background=new THREE.Color(0x9bc9e8);
const camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,0.05,100);
camera.position.set(0,1.7,7.5);camera.rotation.order="YXZ";
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
const GRAPHICS_KEY="fba-graphics";
const graphicsPresets={fluid:.78,balanced:1,detail:1.35};
const savedGraphics=localStorage.getItem(GRAPHICS_KEY);
let graphicsMode=Object.hasOwn(graphicsPresets,savedGraphics)?savedGraphics:"balanced";
let renderingDeepGallery=false;
function resizeGameView(){
 const width=innerWidth,height=innerHeight;
 if(!width||!height)return;
 const aspect=width/height;
 if(camera.aspect!==aspect){camera.aspect=aspect;camera.updateProjectionMatrix();}
 const limit=renderingDeepGallery?Math.min(graphicsPresets[graphicsMode],1):graphicsPresets[graphicsMode];
 const pixelRatio=Math.min(devicePixelRatio||1,limit);
 const size=renderer.getSize(viewSize);
 if(renderer.getPixelRatio()!==pixelRatio)renderer.setPixelRatio(pixelRatio);
 if(size.x!==width||size.y!==height)renderer.setSize(width,height);
}
const viewSize=new THREE.Vector2();
resizeGameView();renderer.shadowMap.enabled=false;
$("game").appendChild(renderer.domElement);
// Conserver les pixels des textures même si Android libère les canevas graphiques.
const gameTextures=new Set();
function uploadTexturePixels(texture,canvas){
 const {width,height}=canvas;
 const {data}=canvas.getContext("2d").getImageData(0,0,width,height);
 const rowSize=width*4,pixels=texture.image.data;
 for(let y=0;y<height;y++)pixels.set(data.subarray(y*rowSize,(y+1)*rowSize),(height-1-y)*rowSize);
 texture.needsUpdate=true;
}
function gameTexture(canvas){
 const {width,height}=canvas;
 const texture=new THREE.DataTexture(new Uint8Array(width*height*4),width,height);
 texture.colorSpace=THREE.SRGBColorSpace;
 texture.magFilter=THREE.LinearFilter;
 texture.minFilter=THREE.LinearMipmapLinearFilter;
 texture.generateMipmaps=true;
 uploadTexturePixels(texture,canvas);
 gameTextures.add(texture);
 return texture;
}
scene.add(new THREE.HemisphereLight(0xffffff,0x718096,2.2));
const sun=new THREE.DirectionalLight(0xffffff,1.4);sun.position.set(5,12,4);scene.add(sun);
const ambient=scene.children.find(o=>o.isHemisphereLight);
const LIGHT_ZONES={
 sales:"Surface de vente",hall:"Hall des caisses",gallery:"Galerie et départements",
 auto:"Showroom automobile",dry:"Réserve sèche",cold:"Chambre froide",
 electronics:"Réserve électronique",logistics:"Quai et couloir logistique",staff:"Salle de repos",office:"Bureau du directeur",outside:"Façade et parking"
};
const lightSettings=state.lighting??={};
const lightOn=zone=>lightSettings[zone]!==false;
// L'éclairage d'une surface dépend de sa position dans le bâtiment.
const COMMERCIAL_LIGHTS=["sales","hall","gallery","auto"];
const STORAGE_LIGHTS=["dry","electronics"];
const zonePanels=new Map(),zoneBounds=[],zoneLevels=[];
const LIGHT_REGION_COUNT=13;
for(let i=0;i<LIGHT_REGION_COUNT;i++){zoneBounds.push(new THREE.Vector4());zoneLevels.push(1);}
const fixedLightUniforms={bounds:{value:zoneBounds},levels:{value:zoneLevels}};
function standardMaterial(options){
 const material=new THREE.MeshStandardMaterial(options);
 material.onBeforeCompile=applyFixedLighting;
 return material;
}
function applyFixedLighting(shader){
 shader.uniforms.fbaZoneBounds=fixedLightUniforms.bounds;
 shader.uniforms.fbaZoneLevels=fixedLightUniforms.levels;
 shader.vertexShader="varying vec2 fbaFloorPosition;\n"+shader.vertexShader.replace("#include <project_vertex>",`
  #include <project_vertex>
  vec4 floorPosition = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
   floorPosition = instanceMatrix * floorPosition;
  #endif
  fbaFloorPosition = (modelMatrix * floorPosition).xz;
 `);
 shader.fragmentShader=`
  varying vec2 fbaFloorPosition;
  uniform vec4 fbaZoneBounds[${LIGHT_REGION_COUNT}];
  uniform float fbaZoneLevels[${LIGHT_REGION_COUNT}];
 `+shader.fragmentShader.replace("#include <opaque_fragment>",`
  float circuitLight = 1.0;
  for (int i = 0; i < ${LIGHT_REGION_COUNT}; ++i) {
   vec4 bounds = fbaZoneBounds[i];
   vec2 edge = min(fbaFloorPosition - bounds.xy, bounds.zw - fbaFloorPosition);
   circuitLight = mix(circuitLight, fbaZoneLevels[i], smoothstep(-0.12, 0.12, min(edge.x, edge.y)));
  }
  outgoingLight *= circuitLight;
  #include <opaque_fragment>
 `);
}
function zonePanel(zone){
 if(!zonePanels.has(zone))zonePanels.set(zone,new THREE.MeshBasicMaterial({color:0xfff7db}));
 return zonePanels.get(zone);
}
const reserveLightPositions=[3.5,7.5,11.5,15,18.5,22];
const PARKING_HALF_WIDTH=9.8;
function updateLighting(){
 const daylight=Math.max(.12,Math.min(1,(20-state.hour)/3.5));
 scene.background.setRGB(.055+.55*daylight,.09+.69*daylight,.17+.74*daylight);
 sun.intensity=.12+1.28*daylight;
 ambient.intensity=.25+1.95*daylight;
 const storageEnd=kind=>STORAGE_WINGS[kind].start+storageBayCount(kind)*STORAGE_BAY_DEPTH;
 const regions=[
  ["sales",-10,state.upgrades.store2?ANNEX_ENTRY:state.upgrades.store1?-22:-10,10,10],
  ["hall",HALL_WEST,-12,-10,9.6,state.upgrades[FRONT_HALL]],
  ["gallery",-MALL_HALF_WIDTH,MALL_MIN_Z,MALL_HALF_WIDTH,ANNEX_ENTRY,state.upgrades.annex3],
  ["gallery",AUTO_LINK_X-3,GALLERY_LINK_Z-1.5,AUTO_LINK_X+3,SHOWROOM_LINK_Z+1.5,autoLinkOpen()],
  ["auto",-30,-22,-10,-12,state.upgrades[AUTO_SHOWROOM]],
  ["dry",10,1.5,15.3,state.upgrades.store2?storageEnd("dry"):state.upgrades.store1?30.6:23.6],
  ["cold",15.3,1.5,24,17],
  ["cold",20.65,17,24,storageEnd("cold"),storageBayCount("cold")],
  ["electronics",15.3,30.5,20.6,storageEnd("electronics"),state.upgrades.store2],
  ["logistics",24,-27.5,28.5,7.5],
  ["staff",17.8,-9,24.1,-3],
  ["office",-14.65,-5.55,-10.1,-2.05,directorOpen()],
  ["outside",-PARKING_HALF_WIDTH,10.14,PARKING_HALF_WIDTH,31]
 ];
 for(const [i,[zone,x0,z0,x1,z1,active=true]] of regions.entries()){
  // Les améliorations verrouillées ne modifient aucune surface.
  if(active)zoneBounds[i].set(x0,z0,x1,z1);
  else zoneBounds[i].set(1,1,-1,-1);
  zoneLevels[i]=zone==="outside"?(lightOn(zone)?1+(1-daylight)*1.8:1):
   lightOn(zone)?1.05+(1-daylight)*2.5:.38+(1-daylight)*.24;
 }
 for(const [zone,material] of zonePanels)material.color.setHex(lightOn(zone)?(zone==="cold"?0xdff5ff:0xfff7db):0x64748b);
 for(const [zones,switchMesh] of [[COMMERCIAL_LIGHTS,lightSwitch],[STORAGE_LIGHTS,stockroomSwitch],[["cold"],coldSwitch]]){
  const enabled=zones.filter(lightOn).length;
  switchMesh.material.color.setHex(enabled===zones.length?0x22c55e:enabled===0?0xef4444:0xf59e0b);
 }
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
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),standardMaterial({color,roughness:.8}));
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
 const tex=gameTexture(c);
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(width/8,depth/8);
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),standardMaterial({map:tex,roughness:.88}));
 mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.012,z);scene.add(mesh);return mesh;
}
function wallBaseboard(x,z,w,d,extension=false){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,.16,d),standardMaterial({color:0x475569,roughness:.55}));
 m.position.set(x,.12,z);scene.add(m);if(extension)extensionMeshes.push(m);return m;
}
function ceilingPanel(x,z,extension=false){
 const frame=new THREE.Mesh(new THREE.BoxGeometry(2.45,.045,.40),standardMaterial({color:0x94a3b8,metalness:.5}));
 frame.position.set(x,4.91,z);scene.add(frame);
 const diffuser=new THREE.Mesh(new THREE.BoxGeometry(2.3,.028,.29),new THREE.MeshBasicMaterial({color:0xfff7db}));
 diffuser.position.set(x,4.87,z);scene.add(diffuser);
 if(extension)extensionMeshes.push(frame,diffuser);
}
cube(0,-.15,0,20,.3,20,0xb9c1c8);
tileFloor(19.65,19.65,0,0);
// Plinthes du magasin principal : couvrir tout le mur gauche jusqu'à l'entrée.
wallBaseboard(-9.78,-3.6,.07,12.3);
wallBaseboard(-9.78,8.7,.07,2.3);
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
cube(-10,2.5,-3.75,.3,5,12.5,0xe2e8f0,true);
cube(-10,2.5,8.75,.3,5,2.5,0xe2e8f0,true);
cube(-10,4.3,5,.3,1.4,5,0xe2e8f0);
const hallGate=cube(-10,1.8,5,.3,3.6,5,0xe2e8f0,true);
colliders.at(-1).lockedBy=FRONT_HALL;
cube(10,2.5,-3,.3,5,14,0xe2e8f0,true);
cube(10,2.5,8.5,.3,5,3,0xe2e8f0,true);
cube(10,4.2,5.5,.3,1.6,3,0xe2e8f0);
// Un seul sol et plafond pour supprimer les trous entre les trois zones.
cube(12.65,-.15,12.6,5.3,.3,22.2,0xb9c1c8);
cube(12.65,5.1,12.6,5.3,.2,22.2,0xf1f5f9);
// Exactement les mêmes plafonniers LED plats, sur toute la longueur de la réserve.
for(const z of reserveLightPositions)for(const x of [11.6,13.8]){
 cube(x,4.905,z,1.62,.055,.58,0x94a3b8);
 cube(x,4.869,z,1.49,.024,.46,0xfff7db).material=zonePanel("dry");
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
for(const x of [17.2,21.6])for(const z of [11,15])cube(x,4.87,z,2.0,.04,.55,0xf8fafc).material=zonePanel("cold");
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
coldLight.material=zonePanel("cold");
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
const coldSign=(()=>{const c=document.createElement("canvas");c.width=512;c.height=128;const ctx=c.getContext("2d");ctx.fillStyle="#0c4a6e";ctx.fillRect(0,0,512,128);ctx.fillStyle="#e0f2fe";ctx.textAlign="center";ctx.font="bold 45px Arial";ctx.fillText("CHAMBRE FROIDE",256,80);const m=new THREE.Mesh(new THREE.PlaneGeometry(2.8,.7),new THREE.MeshBasicMaterial({map:gameTexture(c),side:THREE.DoubleSide}));m.position.set(15.08,4.1,5.45);m.rotation.y=-Math.PI/2;scene.add(m);return m;})();

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
const storageExtensionMeshes=[],storageExtensionColliders=[];
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
 reserve2Part(17.95,4.88,z,1.6,.05,.5,0xe0f2fe).material=zonePanel("electronics");
}
storageWingGates.dry=reserve2Part(12.65,2.5,37.4,5.3,5,.3,0xe2e8f0,true);
colliders.at(-1).storageGate="dry";
for(const x of [11.6,13.8])for(const z of [32.4,35.4]){
 reserve2Part(x,4.905,z,1.62,.055,.58,0x94a3b8);
 reserve2Part(x,4.869,z,1.49,.024,.46,0xfff7db).material=zonePanel("dry");
}
for(const x of [11.6,13.8])for(const z of [25.2,28.5]){
 storageExtensionPart(x,4.905,z,1.62,.055,.58,0x94a3b8);
 storageExtensionPart(x,4.869,z,1.49,.024,.46,0xfff7db).material=zonePanel("dry");
}
wallBaseboard(12.65,23.52,5.0,.07);
for(const x of [10.2,15.08])wallBaseboard(x,20.05,.07,7.0);
// L’extension utilise désormais les mêmes plafonniers LED que l’ancienne réserve.
// Réserve V3 : deux rangées murales uniquement. Aucun meuble au milieu de
// l'allée, de l'accès magasin (x=10,z=5.5) ou devant l'interrupteur (z=7.8).
const storageRacks={dry:[],cold:[],electronics:[]};
const STORAGE_CARTON_HEIGHT=.21;
function addStorageRack(kind,x,z,levels,length,angle=0,access={}){
 const alongZ=angle!==0,step=length/5;
 const rack={...access,slots:[],overflow:[]};
 for(const y of levels){
  for(let layer=0;layer<3;layer++){
   for(let i=0;i<5;i++){
    const offset=(i-2)*step;
    const slot={x:x+(alongZ?0:offset),z:z+(alongZ?offset:0),angle,width:step-.025,
     y:y+.045+STORAGE_CARTON_HEIGHT/2+layer*(STORAGE_CARTON_HEIGHT+.006)};
    (layer<2?rack.slots:rack.overflow).push(slot);
   }
  }
 }
 storageRacks[kind].push(rack);
}
function storageRack(x,z,face,upgrade=null,kind="dry"){
 const put=(px,py,pz,w,h,d,col)=>{
  const m=cube(px,py,pz,w,h,d,col);
  if(upgrade==="store2")reserve2Meshes.push(m);
  else if(upgrade==="store1")storageExtensionMeshes.push(m);
  return m;
 };
 const levels=[.62,1.62,2.62];
 for(const y of levels){
  put(x,y,z,.84,.075,1.65,0x94a3b8);
  put(x,y+.062,z+.80,.84,.07,.035,0x64748b);
 }
 addStorageRack(kind,x,z,levels,1.55,face*Math.PI/2,{requiresUpgrade:upgrade});
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
for(const z of [31.6,33.4,37.6,39.7,41.8])storageRack(16.05,z,1,"store2","electronics");
for(const z of [31.6,34.1,36.6,39.1,41.6])storageRack(19.85,z,-1,"store2","electronics");
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
const passageTrim=standardMaterial({color:0x64748b,metalness:.28,roughness:.48});
for(const x of [-2.03,2.03]){
 const post=new THREE.Mesh(new THREE.BoxGeometry(.09,3.38,.37),passageTrim);
 post.position.set(x,1.69,-10);scene.add(post);
}
const lintel=new THREE.Mesh(new THREE.BoxGeometry(4.16,.12,.38),passageTrim);
lintel.position.set(0,3.4,-10);scene.add(lintel);
// Bande de seuil fine, affleurante au carrelage, sans obstacle au passage.
const threshold=new THREE.Mesh(new THREE.BoxGeometry(3.8,.012,.18),standardMaterial({color:0x94a3b8,metalness:.45}));
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
 electronicsCube(x,4.94,z,2.8,.05,.55,0xf8fafc).material=zonePanel("sales");
}
for(const x of [-9.7,9.7])electronicsCube(x,.12,-28,.08,.24,11.5,0x64748b);
electronicsCube(0,.12,-33.74,19.2,.24,.08,0x64748b);
electronicsCube(0,.035,-22,3.8,.015,.2,0x94a3b8);
for(const x of [-6,0,6])for(const z of [-14,-19])extensionCube(x,4.94,z,2.8,.05,.5,0xffffff).material=zonePanel("sales");
// Rayonnages muraux, avec tablettes inclinées et bordures.
const wallProductRacks=[];
function addWallRack(product){
 const {x,z}=product,rotation=product.rotation*Math.PI/2;
 const extension=product.license==="extensionLicense";
 const rack=new THREE.Group();rack.position.set(x,0,z);rack.rotation.y=rotation;
 const steel=standardMaterial({color:0x64748b,metalness:.3});
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
  ...(extension?{requiresUpgrade:"store1"}:product.requiresShelf===FRONT_HALL?{requiresUpgrade:FRONT_HALL,level:product.level,requiresLicense:product.license,adultOnly:product.adultOnly}:{})});
}
for(const p of catalog.filter(p=>p.kind==="wall"))addWallRack(p);
function buildStorageWings(){
 for(const kind of STORAGE_KINDS){
  const wing=STORAGE_WINGS[kind];
  const count=capacityUpgrades.filter(u=>u.capacity[kind]).length;
  const center=(wing.minX+wing.maxX)/2, width=wing.maxX-wing.minX;
  const walls=standardMaterial({color:wing.wall});
  const flooring=standardMaterial({color:wing.floor});
  const racks=standardMaterial({color:kind==="cold"?0x789cb4:0x64748b});
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
    for(const y of [.55,1.55,2.55]){
     part(rack,y,z,.66,.07,3.6,racks);
    }
    for(const offset of [-.8625,.8625]){
     addStorageRack(kind,rack,z+offset,[.55,1.55,2.55],1.725,-side*Math.PI/2,{bay:i});
    }
    for(const end of [-1,1])part(rack,1.55,z+end*1.76,.06,3.1,.07,racks);
   }
   part(center,4.91,z,Math.min(2.35,width-.4),.065,.40,zonePanel(kind));
   scene.add(group);storageWingGroups[kind].push({group,back});
  }
 }
}
buildStorageWings();
function refreshExtension(){
 const unlocked=!!state.upgrades.store1;
 hallGate.visible=!state.upgrades[FRONT_HALL];
 hallGroup.visible=!!state.upgrades[FRONT_HALL];
 directorRoom.visible=directorOpen();securityStation.visible=exitPorticoes.visible=securityOpen();
 intimateSign.visible=adultContentAllowed()&&playerLevel()>=ADULT_LEVEL&&!!state.upgrades.intimateLicense;
 showroomGroup.visible=!!state.upgrades[AUTO_SHOWROOM];
 autoLinkGroup.visible=autoLinkOpen();
 showroomLinkGate.visible=!autoLinkOpen();galleryLinkGate.visible=!autoLinkOpen();galleryLinkSign.visible=autoLinkOpen();
 showroomGate.visible=!!state.upgrades[FRONT_HALL]&&!state.upgrades[AUTO_SHOWROOM];
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
// Silhouettes communes, articulées aux épaules et aux hanches.
function personModel(group,{shirt,skin,hair,woman=false,style=0,trousers=0x334155,uniform=false}){
 const material=color=>standardMaterial({color,roughness:.83});
 const fabric=material(shirt),face=material(skin),hairMat=material(hair);
 const pants=material(trousers),shoes=material(0x22262d),white=material(0xf5f1eb),eyes=material(0x352c2b);
 const sphere=new THREE.SphereGeometry(1,12,9);
 const matrix=new THREE.Matrix4();
 function shapes(parent,mat,parts){
  const mesh=new THREE.InstancedMesh(sphere,mat,parts.length);
  for(const [i,[x,y,z,sx,sy,sz]] of parts.entries()){
   matrix.makeScale(sx,sy,sz).setPosition(x,y,z);mesh.setMatrixAt(i,matrix);
  }
  mesh.computeBoundingSphere();parent.add(mesh);
 }
 function pivot(x,y,z=0){
  const node=new THREE.Group();node.position.set(x,y,z);group.add(node);return node;
 }
 const shoulders=woman?.245:.276,hip=woman?.165:.152;
 shapes(group,fabric,[[0,1.27,0,shoulders,.34,.151],[0,1.09,.007,hip+.035,.25,.136]]);
 shapes(group,face,[[0,1.58,0,.071,.115,.07]]);
 shapes(group,pants,[[0,.849,0,hip+.029,.132,.128]]);
 if(uniform){
  const badge=mallPart(group,.124,1.39,-.145,.085,.048,.01,white);
  badge.rotation.y=-.12;
 }
 const head=pivot(0,1.735);
 shapes(head,face,[[0,.017,0,.139,.171,.126],[0,-.072,-.026,.111,.078,.102],
  [-.138,.004,.004,.026,.047,.024],[.138,.004,.004,.026,.047,.024],[0,-.013,-.123,.022,.044,.036]]);
 shapes(head,white,[[-.051,.025,-.115,.024,.012,.012],[.051,.025,-.115,.024,.012,.012]]);
 shapes(head,eyes,[[-.050,.024,-.126,.009,.011,.005],[.050,.024,-.126,.009,.011,.005],
  [-.051,.050,-.119,.023,.006,.008],[.051,.050,-.119,.023,.006,.008],[0,-.068,-.119,.034,.006,.010]]);
 const hairParts=[[0,.10,.015,.145,.100,.129]];
 if(style===1)hairParts.push([0,-.037,.122,.137,.158,.075],[-.119,-.041,.038,.041,.12,.084],[.119,-.041,.038,.041,.12,.084]);
 if(style===2)hairParts.push([0,.06,.133,.058,.057,.046],[0,-.073,.155,.046,.129,.043]);
 if(style===3)hairParts.push([0,-.085,-.089,.095,.044,.058]);
 if(style===0||style===3)hairParts.push([-.044,.103,-.071,.093,.046,.060]);
 shapes(head,hairMat,hairParts);
 const legs=[-1,1].map(side=>{
  const leg=pivot(side*.107,.84);
  shapes(leg,pants,[[0,-.192,0,.096,.237,.101],[0,-.531,.012,.073,.240,.074]]);
  shapes(leg,shoes,[[0,-.777,-.047,.081,.062,.135]]);
  return leg;
 });
 const arms=[-1,1].map(side=>{
  const arm=pivot(side*(shoulders+.021),1.49);
  shapes(arm,fabric,[[0,-.14,0,.073,.191,.082]]);
  shapes(arm,face,[[0,-.375,-.012,.054,.130,.057],[0,-.509,-.026,.05,.070,.036]]);
  return arm;
 });
 return {head,legs,arms};
}
// Équipe de chantier niveau 4 : ouvriers visibles devant le passage de l'extension.
const constructionCrew=[];
function createBuilder(x,z,color){
 const group=new THREE.Group();
 const hardhat=standardMaterial({color:0xfacc15});
 const steel=standardMaterial({color:0x94a3b8,metalness:.45});
 const dark=standardMaterial({color:0x334155});
 const {head,arms:[,arm]}=personModel(group,{shirt:color,skin:0xd7a17c,hair:0x493126,uniform:true});
 const shell=new THREE.Mesh(new THREE.SphereGeometry(.152,12,8),hardhat);
 shell.position.set(0,.147,0);shell.scale.y=.62;head.add(shell);
 mallPart(head,0,.128,-.08,.29,.032,.24,hardhat);
 mallPart(arm,0,-.57,-.028,.042,.29,.05,dark);
 mallPart(arm,0,-.73,-.028,.23,.075,.075,steel);
 group.position.set(x,0,z);scene.add(group);
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
function paintBrand(c,title,subtitle){
 const ctx=c.getContext("2d");
 ctx.fillStyle="#101827";ctx.fillRect(0,0,1024,256);
 ctx.fillStyle="#38bdf8";ctx.fillRect(0,0,1024,12);ctx.fillRect(0,244,1024,12);
 ctx.fillStyle="#ffffff";ctx.textAlign="center";ctx.textBaseline="middle";
 ctx.font="900 99px Arial";ctx.fillText(title,512,102,950);
 ctx.fillStyle="#7dd3fc";ctx.font="bold 44px Arial";ctx.fillText(subtitle,512,193,940);
}
function brandPanel(title,subtitle,width=5.6,height=1.0){
 const c=document.createElement("canvas");c.width=1024;c.height=256;
 paintBrand(c,title,subtitle);
 const tex=gameTexture(c);
 const m=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,depthTest:true}));
 return m;
}
const electronicsBrand=brandPanel("FBA ÉLECTRONIQUE","TÉLÉPHONES · AUDIO · INFORMATIQUE · DRONES",4.5,.9);
electronicsBrand.position.set(0,4.14,-21.78);scene.add(electronicsBrand);electronicsMeshes.push(electronicsBrand);
const entranceBrand=brandPanel(state.storeName,"BUSINESS EMPIRE SIMULATOR",5.6,1.25);
// Face extérieure du mur d’entrée (z positif), texte orienté vers le visiteur.
entranceBrand.position.set(0,4.24,10.20);scene.add(entranceBrand);
// Enseigne au-dessus de l’entrée de la réserve, face au magasin.
const reserveBrand=brandPanel("ZONE STOCKAGE","RÉSERVE — PRODUITS SECS",2.9,.67);
reserveBrand.position.set(9.78,4.15,5.5);reserveBrand.rotation.y=-Math.PI/2;scene.add(reserveBrand);
const electronicsStorageBrand=brandPanel("RÉSERVE ÉLECTRONIQUE","STOCKAGE DES CARTONS",2.6,.62);
electronicsStorageBrand.position.set(15.08,4.14,35);
electronicsStorageBrand.rotation.y=-Math.PI/2;scene.add(electronicsStorageBrand);reserve2Meshes.push(electronicsStorageBrand);
const corridorBrand=brandPanel(state.storeName,"EXTENSION DU MAGASIN",3.75,.72);
corridorBrand.position.set(0,4.18,-9.78);scene.add(corridorBrand);

function buildStoreExterior(){
 const group=new THREE.Group();scene.add(group);
 const asphalt=standardMaterial({color:0x454c52,roughness:1});
 const concrete=standardMaterial({color:0xc6c8c6,roughness:.95});
 const trim=standardMaterial({color:0x263b4a,roughness:.65});
 const cladding=standardMaterial({color:0x647888,roughness:.72});
 const blue=standardMaterial({color:0x007a9a,roughness:.52});
 const windowGlass=standardMaterial({color:0x385f76,metalness:.36,roughness:.28});
 const paint=new THREE.MeshBasicMaterial({color:0xdce0dc});
 const curb=standardMaterial({color:0x7a8283});
 const grass=standardMaterial({color:0x586f50,roughness:1});
 const leaf=standardMaterial({color:0x476d43,roughness:1});
 const trunk=standardMaterial({color:0x685141,roughness:1});
 const part=(x,y,z,w,h,d,mat)=>mallPart(group,x,y,z,w,h,d,mat);

 part(0,-.09,20.65,PARKING_HALF_WIDTH*2,.16,20.7,asphalt);
 part(0,-.19,32.1,PARKING_HALF_WIDTH*2,.19,2.2,grass);
 part(-14.05,-.19,21.55,8.5,.19,23.3,grass);
 part(0,-.04,12.22,PARKING_HALF_WIDTH*2,.10,3.94,concrete);
 part(0,-.033,20.1,3.1,.076,12.2,concrete);
 part(0,3.24,10.98,10.8,.22,1.95,trim);
 part(0,3.31,11.94,10.8,.27,.14,blue);
 part(0,5.03,10.23,20.25,.25,.52,trim);
 part(0,3.54,10.18,20.1,.12,.14,blue);
 part(0,2.77,10.05,3.92,.10,.18,trim);
 for(const x of [-1.97,1.97]){
  part(x,1.38,10.10,.095,2.76,.19,trim);
  part(x*.89,1.40,10.12,.31,2.69,.055,windowGlass);
 }
 for(const side of [-1,1]){
  for(let i=0;i<4;i++){
   const x=side*(3.05+i*1.75);
   part(x,1.76,10.18,1.66,2.68,.13,trim);
   part(x,1.79,10.26,1.54,2.53,.045,windowGlass);
   part(x,1.02,10.29,1.54,.04,.034,cladding);
  }
  const column=part(side*5.15,1.57,11.61,.27,3.14,.27,trim);
  colliders.push({minX:column.position.x-.135,maxX:column.position.x+.135,minZ:11.475,maxZ:11.745});
  for(const offset of [2.1,4.55,7,9.45])part(side*offset,.004,18.1,.06,.009,5.2,paint);
  part(side*5.775,.008,15.52,7.35,.014,.065,paint);
  for(const x of [3.325,8.225])part(side*x,.042,15.78,1.35,.10,.16,curb);
  for(const z of [13.55,25.6]){
   const x=side*8.7;
   part(x,.10,z,1.35,.23,1.35,curb);
   colliders.push({minX:x-.675,maxX:x+.675,minZ:z-.675,maxZ:z+.675});
   const stem=new THREE.Mesh(new THREE.CylinderGeometry(.07,.12,1.75,8),trunk);
   stem.position.set(x,1.08,z);group.add(stem);
   for(const [dx,y,dz,scale] of [[0,2.3,0,1],[-.41,2.04,.11,.69],[.42,2.16,-.14,.72]]){
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(scale,1),leaf);
    crown.position.set(x+dx,y,z+dz);crown.scale.y=1.12;group.add(crown);
   }
  }
  const poleX=side*9.2;
  part(poleX,2.15,25.2,.09,4.3,.09,trim);
  part(poleX-side*.22,4.24,25.2,.59,.11,.23,trim);
  part(poleX-side*.22,4.17,25.2,.51,.04,.17,zonePanel("outside"));
 }
 for(const x of [-3.7,0,3.7])part(x,3.105,11.3,1.30,.04,.20,zonePanel("outside"));
 for(let z=21.2;z<=25;z+=.58)part(0,.008,z,2.8,.01,.22,paint);
 const parking=brandPanel("PARKING","ENTRÉE DU SUPERMARCHÉ",2.55,.62);
 parking.position.set(4.15,2.25,26.55);group.add(parking);
 part(4.15,1.02,26.49,.12,2.04,.12,trim);
 for(const [x,z,color] of [[-5.775,18.1,0x2d6987],[8.225,18.1,0x9b392e]]){
  const body=standardMaterial({color,roughness:.34,metalness:.32});
  part(x,.48,z,1.72,.52,3.95,body);
  part(x,.90,z-.20,1.43,.36,1.94,windowGlass);
  part(x,1.105,z-.23,1.40,.07,1.78,body);
  for(const dx of [-.76,.76])for(const dz of [-1.21,1.21]){
   const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.28,.28,.24,10),trim);
   wheel.rotation.z=Math.PI/2;wheel.position.set(x+dx,.28,z+dz);group.add(wheel);
  }
  for(const dx of [-.59,.59])part(x+dx,.54,z+1.98,.24,.10,.04,paint);
  colliders.push({minX:x-.86,maxX:x+.86,minZ:z-1.98,maxZ:z+1.98});
 }
}
buildStoreExterior();
cube(0,.015,8.5,3,.03,2,0x334155);
for(const x of [-6,0,6])for(const z of [-6,0,6])cube(x,4.94,z,2.8,.05,.5,0xffffff).material=zonePanel("sales");
// Emballages 3D stylisés, avec étiquettes lisibles et silhouettes distinctes.
const productTextures={};
function packageTexture(p,format=""){
 const key=p.id+":"+format;
 if(productTextures[key])return productTextures[key];
 const c=document.createElement("canvas");
 const scale=(format||p.department)?.5:1;
 c.width=512*scale;c.height=512*scale;
 const x=c.getContext("2d");x.scale(scale,scale);
 const code=[...p.id].reduce((value,character)=>Math.imul(value,31)+character.charCodeAt(0)|0,7)>>>0;
 const accent="#"+p.color.toString(16).padStart(6,"0");
 x.fillStyle=format==="CARTON"?"#d3b18a":format==="VRAC"?"#93a8ad":accent;x.fillRect(0,0,512,512);
 x.fillStyle="#172033";x.fillRect(0,0,512,76);
 x.fillStyle="#fff";x.textAlign="left";x.textBaseline="middle";x.font="bold 33px Arial";
 x.fillText(format||"FBA SÉLECTION",23,39);
 x.fillStyle=accent;x.fillRect(20,89,472,125);
 x.fillStyle="#172033";
 // Motif et code de référence propres à chaque emballage.
 for(let i=0;i<12;i++){
  const bits=(code>>>(i*2))&3;
  x.globalAlpha=.16+bits*.12;
  x.fillRect(31+i*40,107+bits*13,18+bits*3,95-bits*16);
 }
 x.globalAlpha=1;
 x.fillStyle="#fff";x.fillRect(20,223,472,208);
 x.fillStyle="#172033";x.textAlign="center";
 const words=p.name.split(" "),lines=[];
 let line="";
 for(const word of words){
  const trial=(line+" "+word).trim();
  if(line&&trial.length>15){lines.push(line);line=word;}else line=trial;
 }
 if(line)lines.push(line);
 const fontSize=Math.min(77,168/lines.length);
 x.font="900 "+fontSize+"px Arial";
 lines.forEach((v,i)=>x.fillText(v,256,328+(i-(lines.length-1)/2)*(fontSize+4),445));
 x.textAlign="left";x.font="bold 31px Arial";
 x.fillText((format==="CARTON"?BOX_UNITS+" U · ":"")+p.id.replaceAll("_"," ").toUpperCase(),23,469,325);
 for(let i=0;i<15;i++)x.fillRect(368+i*8,450,2+((code>>>i)&3),35);
 const t=gameTexture(c);
 t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 productTextures[key]=t;return t;
}
const PRODUCT_PACKAGING={
 bag:new Set("pates riz cafe farine sucre lentilles chips semoule graines granola biscuits_matin nouilles sans_gluten terreaux croquettes litieres legumes_surgeles cereales_vrac legumineuses_vrac fruits_secs_vrac".split(" ")),
 bottle:new Set("eau jus huile vinaigre sirop sodas eaux_aromatisees thes_glaces liquide_vaisselle shampoings biberons gourdes lubrifiant".split(" ")),
 jar:new Set("miel sauce_tomate confiture pate_tartiner poivre sel epices_monde sauces_monde sauces_fraiches terrines purees_bebe compotes_bebe".split(" ")),
 tray:new Set("patisseries salades sandwichs plats_prepares viandes jambons poissons crevettes coquillages mer_surgeles raviolis mezze beurre".split(" ")),
 cup:new Set("yaourts desserts_frais dessert_maison glaces".split(" ")),
 flat:new Set("jeux_video cahiers semences filtres linge vetements chaussettes lingettes dentifrices preservatifs".split(" ")),
};
function productModel(p){
 const g=new THREE.Group(),base=standardMaterial({color:p.color,roughness:.72});
 const label=standardMaterial({map:packageTexture(p),roughness:.68});
 const white=standardMaterial({color:0xf1f5f9,roughness:.65});
 const add=(geometry,material,x=0,y=0,z=0)=>{
  const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);g.add(mesh);return mesh;
 };
 const id=p.id;
 const dark=standardMaterial({color:0x293546,roughness:.8});
 const packaging=Object.keys(PRODUCT_PACKAGING).find(key=>PRODUCT_PACKAGING[key].has(id));
 const wrap=[base,base,base,base,label,base];
 const box=(w,h,d)=>add(new THREE.BoxGeometry(w,h,d),wrap);
 if(packaging==="bottle"){
  const slim=["eau","huile","vinaigre","biberons","gourdes"].includes(id);
  const radius=slim?.095:.125,height=id==="lubrifiant"?.24:.35;
  add(new THREE.CylinderGeometry(radius*.96,radius,height,12),base);
  add(new THREE.CylinderGeometry(radius*.44,radius*.89,.065,12),base,0,height/2+.026,0);
  add(new THREE.CylinderGeometry(radius*.47,radius*.47,.051,12),id==="eau"?dark:white,0,height/2+.075,0);
  add(new THREE.CylinderGeometry(radius+.004,radius+.004,height*.76,16,1,true,-Math.PI*.62,Math.PI*1.24),label);
 }else if(id==="conserves"||p.can||packaging==="jar"||packaging==="cup"||id==="deodorants"){
  const narrow=p.can||id==="poivre"||id==="deodorants";
  const cup=packaging==="cup",radius=narrow?.092:.132;
  const height=narrow?.39:cup?.19:.28;
  const bottom=radius*(cup?.73:1);
  add(new THREE.CylinderGeometry(radius,bottom,height,16),base);
  add(new THREE.CylinderGeometry(radius+.006,radius+.006,.026,16),white,0,height/2,0);
  add(new THREE.CylinderGeometry(radius+.003,bottom+.003,height*.9,16,1,true,-Math.PI*.61,Math.PI*1.22),label);
 }else if(p.id==="papier"){
  for(const x of [-.12,.12]){
   const roll=add(new THREE.CylinderGeometry(.12,.12,.27,14),base,x,0,0);
   roll.rotation.x=Math.PI/2;
   const core=add(new THREE.CylinderGeometry(.034,.034,.275,12),standardMaterial({color:0xb8a38e}),x,0,0);
   core.rotation.x=Math.PI/2;
  }
 }else if(["pommes","poires","oranges","tomates","carottes","ballons"].includes(id)){
  const colors={pommes:0xd84b37,poires:0x92ad43,oranges:0xe78a24,tomates:0xcb352b,carottes:0xe17325};
  if(colors[id])base.color.setHex(colors[id]);
  const fruit=id==="carottes"
   ?add(new THREE.CylinderGeometry(.087,.023,.39,9),base)
   :add(new THREE.SphereGeometry(.16,14,10),base);
  if(id==="poires"){fruit.scale.set(.83,1.06,.85);add(new THREE.SphereGeometry(.10,12,8),base,0,.105,0);}
  if(id==="tomates")fruit.scale.y=.79;
  if(id!=="ballons"){
   const green=standardMaterial({color:0x476331});
   add(new THREE.CylinderGeometry(.013,.019,.059,6),green,0,id==="carottes"?.215:.166,0);
   const leaf=add(new THREE.SphereGeometry(.055,10,6),green,.043,id==="carottes"?.235:.179,0);
   leaf.scale.set(1,.27,.55);leaf.rotation.z=.32;
  }else add(new THREE.TorusGeometry(.158,.008,5,16),white);
 }else if(p.kind==="electronics"){
  const black=standardMaterial({color:0x111827,roughness:.25,metalness:.2});
  const screen=standardMaterial({color:p.color,emissive:p.color,emissiveIntensity:.17});
  const metal=standardMaterial({color:0x94a3b8,metalness:.65,roughness:.3});
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
 }else if(packaging==="bag"||id==="biscuits"||id==="chocolat"){
  const flat=id==="chocolat",full=id==="chips"||id==="croquettes";
  const w=full?.34:.29,h=id==="biscuits"?.32:.43,d=flat?.08:full?.23:.16;
  box(w,h,d);
  for(const y of [-h/2,h/2])add(new THREE.BoxGeometry(w*.95,.026,d*.82),white,0,y,0);
 }else if(packaging==="tray"||packaging==="flat"){
  const tray=packaging==="tray";
  box(tray?.33:.29,tray?.24:.40,tray?.17:.085);
  if(tray)add(new THREE.BoxGeometry(.345,.027,.185),dark,0,-.124,0);
 }else if(id==="pain"||id==="viennoiseries"){
  base.color.setHex(id==="pain"?0xb77439:0xca8543);
  const bread=add(new THREE.CapsuleGeometry(id==="pain"?.069:.081,id==="pain"?.28:.17,4,10),base);
  bread.rotation.z=-.68;
  for(const offset of [-.075,.025,.10]){
   const score=add(new THREE.BoxGeometry(.105,.02,.015),white,offset*.75,offset,.064);
   score.rotation.z=-.25;
  }
 }else if(id==="savon"||id==="lessives"||id==="nettoyants"){
  const spray=id==="nettoyants";
  box(.25,.32,.18).position.y=-.04;
  add(new THREE.CylinderGeometry(.043,.051,.072,10),white,0,.147,0);
  add(new THREE.BoxGeometry(spray?.19:.13,.035,.058),dark,.033,.193,0);
  if(spray)add(new THREE.BoxGeometry(.03,.072,.036),dark,.105,.156,.021);
 }else{
  const tall=id==="lait"||id==="cereales"||id==="cereales_maison";
  const code=[...id].reduce((total,letter)=>total+letter.charCodeAt(0),0);
  const w=.27+(code%4)*.018,h=tall?.47:.27+(code%5)*.03,d=.15+(code%3)*.045;
  box(w,h,d);
  if(id==="lait"){
   add(new THREE.BoxGeometry(w*.92,.052,d),base,0,h/2+.025,0);
   add(new THREE.CylinderGeometry(.044,.045,.037,10),white,.071,h/2+.065,0);
  }
 }

 return g;
}
// Réglettes de prix en euros, visibles sur le bord avant des rayons.
const priceLabelTextures={};
function updatePriceLabel(p){
 const label=priceLabelTextures[p.id],price=state.inventory[p.id].price;
 if(!label||label.price===price)return;
 const {canvas,texture}=label;
 const ctx=canvas.getContext("2d");
 const scale=canvas.width/512;
 ctx.setTransform(scale,0,0,scale,0,0);
 ctx.fillStyle="#ffffff";ctx.fillRect(0,0,512,192);
 ctx.strokeStyle="#cbd5e1";ctx.lineWidth=5;ctx.strokeRect(3,3,506,186);
 ctx.fillStyle="#0f172a";ctx.textAlign="left";ctx.textBaseline="middle";
 ctx.font="bold 40px Arial";ctx.fillText(p.name,22,51,468);
 ctx.font="bold 83px Arial";ctx.fillText(price.toFixed(2).replace(".",",")+" €",22,131,468);
 uploadTexturePixels(texture,canvas);label.price=price;
}
function priceLabel(p,width=.52){
 const key=p.id;
 if(!priceLabelTextures[key]){
  const canvas=document.createElement("canvas");
  const scale=p.department?.5:1;
  canvas.width=512*scale;canvas.height=192*scale;
  const texture=gameTexture(canvas);
  texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  priceLabelTextures[key]={canvas,texture};
  updatePriceLabel(p);
 }
 return new THREE.Mesh(new THREE.PlaneGeometry(width,width*192/512),
  new THREE.MeshBasicMaterial({map:priceLabelTextures[key].texture,side:THREE.DoubleSide}));
}
function addPriceRail(parent,p,y,width,front){
 // Réglette discrète au bord du plateau, avec un seul petit porte-prix.
 const rail=new THREE.Mesh(new THREE.BoxGeometry(width,.065,.025),standardMaterial({color:0xcbd5e1,roughness:.6}));
 rail.position.set(0,y,front);parent.add(rail);
 const sign=priceLabel(p);
 sign.position.set(0,y-.018,front+.016);parent.add(sign);
}
function addShelfDividers(parent,y,width){
 const mat=standardMaterial({color:0xb6c8d5,transparent:true,opacity:.58,roughness:.22,depthWrite:false});
 for(const x of [-width*.30,-width*.10,width*.10,width*.30]){
  const divider=new THREE.Mesh(new THREE.BoxGeometry(.018,.13,.85),mat);
  divider.position.set(x,y+.115,0);parent.add(divider);
 }
}
const displays={},shelfDisplayBatches=new Map(),extraShelves=[],coldPriceLabels={};
let freezerLid=null,freezerOpen=false;
let fridgeDoor=null,fridgeOpen=false;
for(const p of catalog){
 displays[p.id]=[];
 if(p.kind==="extension"||p.kind==="electronics"||p.kind==="wall"||p.kind==="department")continue;
 for(const z of (p.z!==undefined?[p.z]:[-4,1])){
  const metal=standardMaterial({color:0x64748b,metalness:.3});
  const mat=standardMaterial({color:p.color});
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
   const plank=new THREE.Mesh(new THREE.BoxGeometry(2.4,.075,1),isFruit?standardMaterial({color:0x9a6b3b,roughness:.9}):metal);
   plank.position.y=y;plank.rotation.x=tilt;group.add(plank);
   const lip=new THREE.Mesh(new THREE.BoxGeometry(2.4,.065,.045),isFruit?standardMaterial({color:0x7c4a24}):metal);
   lip.position.set(0,y+.075,.49);group.add(lip);
   if(!isFruit){addPriceRail(group,p,y+.025,2.4,.525);addShelfDividers(group,y,2.4);}
   else addPriceRail(group,p,y+.025,2.4,.525);
   if(isFruit){
    const wood=standardMaterial({color:0x8b5a2b,roughness:.9});
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
   const shell=standardMaterial({color:0xe5edf4,roughness:.45,metalness:.15});
   const liner=standardMaterial({color:0xc5d9e6,roughness:.58});
   const trim=standardMaterial({color:0x334155,metalness:.42});
   const glass=standardMaterial({color:0x9ddcf4,transparent:true,opacity:.19,roughness:.08,depthWrite:false,side:THREE.DoubleSide});
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
   const sign=priceLabel(p,.82);
   sign.position.set(.63,2.23,0);sign.rotation.y=Math.PI/2;
   group.add(sign);coldPriceLabels[p.id]=sign;
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
   const shell=standardMaterial({color:0xe7eef4,roughness:.46,metalness:.18});
   const liner=standardMaterial({color:0xc5d9e6,roughness:.6,side:THREE.DoubleSide});
   const trim=standardMaterial({color:0x334155,metalness:.4,roughness:.4});
   const glass=standardMaterial({color:0x9ddcf4,transparent:true,opacity:.22,roughness:.08,side:THREE.DoubleSide,depthWrite:false});
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
   const sign=priceLabel(p,.92);
   sign.position.set(-.79,1.03,0);sign.rotation.y=-Math.PI/2;sign.rotateX(-Math.PI/7);
   group.add(sign);coldPriceLabels[p.id]=sign;
   // Les pizzas sont réellement dans la cuve et non sur un plateau extérieur.
   const pizzaMat=standardMaterial({color:0x60a5fa,roughness:.75});
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
 const texture=gameTexture(canvas);
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
 const metal=standardMaterial({color:0x64748b,metalness:.3});
 const productMat=standardMaterial({color:p.color,roughness:.75});
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
 const steel=standardMaterial({color:0x475569,metalness:.5,roughness:.35});
 const glass=standardMaterial({color:0x8ecce0,transparent:true,opacity:.25,depthWrite:false});
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
const mallWallMaterial=standardMaterial({color:0xcbd5e1});
const hallGroup=new THREE.Group(),showroomGroup=new THREE.Group();
scene.add(hallGroup,showroomGroup);
hallGroup.add(tileFloor(-HALL_WEST-10,21.6,(HALL_WEST-10)/2,-1.2));
showroomGroup.add(tileFloor(19.7,9.9,-20,-16.95));
const hallTrim=standardMaterial({color:0x29465b});
const hallLight=new THREE.MeshBasicMaterial({color:0xfff7db});
const hallStripe=new THREE.MeshBasicMaterial({color:0x258691});
const laneStripe=new THREE.MeshBasicMaterial({color:0xe4c261});
mallPart(hallGroup,(HALL_WEST-10)/2,.017,5,-HALL_WEST-11,.009,.11,hallStripe);
mallPart(hallGroup,-37.45,.017,-1.8,.11,.009,13.1,hallStripe);
mallPart(hallGroup,-17.3,2.48,9.38,14,.21,.045,hallTrim);
for(const x of [-25,-20,-15])mallPart(hallGroup,x,.15,9.37,4.45,.24,.12,hallTrim);
for(const [x,z,title] of [[-4.6,7.95,"ÉPICERIE"],[4,-7.9,"FRAIS & SURGELÉS"]]){
 mallSign(hallGroup,title,"FBA SUPERMARKET",x-11,z,0,3.2);
}
mallPart(hallGroup,(HALL_WEST-10)/2,5.1,-1.2,-HALL_WEST-10,.2,21.6,mallWallMaterial);
mallPart(hallGroup,HALL_WEST,2.5,-1.2,.24,5,21.6,mallWallMaterial);
mallPart(hallGroup,(HALL_WEST-10)/2,2.5,9.55,-HALL_WEST-10,5,.24,mallWallMaterial);
mallPart(hallGroup,-10,2.5,-11,.24,5,2,mallWallMaterial);
mallPart(hallGroup,(HALL_WEST-22)/2,2.5,-12,-22-HALL_WEST,5,.24,mallWallMaterial);
mallPart(hallGroup,-14,2.5,-12,8,5,.24,mallWallMaterial);
const showroomGate=mallPart(hallGroup,-20,2.5,-12,4,5,.24,hallTrim);
mallPart(showroomGroup,-20,5.1,-17,20,.2,10,mallWallMaterial);
mallPart(showroomGroup,-20,2.5,-22,20,5,.24,mallWallMaterial);
mallPart(showroomGroup,-10,2.5,-17,.24,5,10,mallWallMaterial);
const SHOWROOM_LINK_Z=-16.5,GALLERY_LINK_Z=-58,AUTO_LINK_X=-33;
mallPart(showroomGroup,-30,2.5,-20.25,.24,5,3.5,mallWallMaterial);
mallPart(showroomGroup,-30,2.5,-13.75,.24,5,3.5,mallWallMaterial);
const showroomLinkGate=mallPart(showroomGroup,-30,2.5,SHOWROOM_LINK_Z,.24,5,3,mallWallMaterial);
const autoLinkGroup=new THREE.Group();scene.add(autoLinkGroup);
function autoLinkOpen(){return !!(state.upgrades[AUTO_SHOWROOM]&&state.upgrades.annex3);}
const linkLength=SHOWROOM_LINK_Z-GALLERY_LINK_Z+3,linkMiddle=(SHOWROOM_LINK_Z+GALLERY_LINK_Z)/2;
autoLinkGroup.add(tileFloor(5.8,linkLength,AUTO_LINK_X,linkMiddle));
mallPart(autoLinkGroup,AUTO_LINK_X,5.1,linkMiddle,6,.2,linkLength,mallWallMaterial);
mallPart(autoLinkGroup,-36,2.5,linkMiddle,.24,5,linkLength,mallWallMaterial);
for(const z of [SHOWROOM_LINK_Z+1.5,GALLERY_LINK_Z-1.5])mallPart(autoLinkGroup,AUTO_LINK_X,2.5,z,6,5,.24,mallWallMaterial);
mallPart(autoLinkGroup,-30,2.5,linkMiddle,.24,5,linkLength-6,mallWallMaterial);
function ceilingFixture(parent,x,z,zone,width=2.4){
 mallPart(parent,x,4.96,z,width+.10,.065,.47,mallWallMaterial);
 mallPart(parent,x,4.90,z,width,.065,.36,zonePanel(zone));
}
for(let z=-20;z>GALLERY_LINK_Z;z-=5)ceilingFixture(autoLinkGroup,AUTO_LINK_X,z,"gallery");
mallSign(autoLinkGroup,"PLACE CENTRALE","PASSAGE GALERIE",AUTO_LINK_X,-21,0,4.7);
mallSign(autoLinkGroup,"AUTOMOBILE","RETOUR VERS LE HALL DES CAISSES",AUTO_LINK_X,-54,Math.PI,4.7);
for(const x of [-37,-31,-25,-19,-13])for(const z of [-8,-2,4]){
 ceilingFixture(hallGroup,x,z,"hall");
}
for(const x of [-26,-20,-14])ceilingFixture(showroomGroup,x,-17,"auto");
const intimateSign=mallSign(hallGroup,"BIEN-ÊTRE INTIME","RAYON RÉSERVÉ AUX ADULTES",-25,-11.78,0,5.5);
mallSign(hallGroup,"CAISSES","← LIBRE-SERVICE · RAYONS →",-17,4.2,Math.PI,6.6);
mallSign(hallGroup,"BOISSONS ÉNERGISANTES","ALLÉE OUEST",-39.1,-4,Math.PI/2,4.7);
mallSign(hallGroup,"FBA AUTOMOBILE","SHOWROOM · ÉLECTRIQUE & THERMIQUE",-20,-11.85,0,5.4);
mallSign(showroomGroup,"FBA AUTOMOBILE","COMMANDES ET VENTES · INTERAGIR AU COMPTOIR",-20,-19.6,0,7);
mallPart(showroomGroup,-20,.54,-17,2.1,1.08,.74,hallTrim);
mallPart(showroomGroup,-20,1.1,-17,2.2,.1,.84,mallWallMaterial);
colliders.push({minX:-21.1,maxX:-18.9,minZ:-17.42,maxZ:-16.58,requiresUpgrade:AUTO_SHOWROOM});
const directorRoom=new THREE.Group(),securityStation=new THREE.Group();
hallGroup.add(directorRoom,securityStation);
ceilingFixture(directorRoom,-12.25,-4.22,"office",1.75);
ceilingFixture(securityStation,-13,8.05,"hall",1.55);
function serviceFurniture(group,x,y,z,w,h,d,material,solid=false,level=DIRECTOR_LEVEL){
 mallPart(group,x,y,z,w,h,d,material);
 if(solid)colliders.push({minX:x-w/2,maxX:x+w/2,minZ:z-d/2,maxZ:z+d/2,level,requiresUpgrade:FRONT_HALL});
}
const officeWood=standardMaterial({color:0x99684c,roughness:.6});
const officeGlass=standardMaterial({color:0x9bcde8,transparent:true,opacity:.26,depthWrite:false});
serviceFurniture(directorRoom,-12.35,1.55,-5.5,4.55,3.1,.16,hallTrim,true);
serviceFurniture(directorRoom,-14.6,1.45,-3.8,.14,2.9,3.4,officeGlass,true);
serviceFurniture(directorRoom,-12.2,.52,-4.3,2.15,1.04,.77,officeWood,true);
serviceFurniture(directorRoom,-12.2,1.08,-4.3,2.28,.10,.88,hallTrim);
serviceFurniture(directorRoom,-12.4,1.31,-4.48,.58,.39,.09,hallTrim);
serviceFurniture(directorRoom,-12.4,1.32,-4.426,.50,.31,.012,hallLight);
serviceFurniture(directorRoom,-12.4,1.15,-4.07,.48,.045,.20,mallWallMaterial);
serviceFurniture(directorRoom,-12.2,.47,-5.1,.55,.10,.57,hallTrim);
serviceFurniture(directorRoom,-12.2,.8,-5.37,.55,.68,.10,hallTrim);
serviceFurniture(directorRoom,-10.35,1.05,-4.6,.48,2.10,1.35,officeWood,true);
mallSign(directorRoom,"BUREAU DU DIRECTEUR","FINANCES · PERSONNEL · STOCKS",-12.2,-5.36,0,3.85);
serviceFurniture(securityStation,-13,.50,8.1,2,1,.68,hallTrim,true,SECURITY_LEVEL);
serviceFurniture(securityStation,-13,1.05,8.1,2.12,.09,.79,mallWallMaterial);
serviceFurniture(securityStation,-13.29,1.30,8.29,.53,.38,.09,hallTrim);
serviceFurniture(securityStation,-13.29,1.30,8.233,.45,.29,.015,hallLight);
mallSign(securityStation,"POSTE DE SÉCURITÉ","ALERTES DES PORTIQUES",-13,9.2,0,3.5).rotation.y=Math.PI;
const exitPorticoes=new THREE.Group();scene.add(exitPorticoes);
const gateIndicator=new THREE.MeshBasicMaterial({color:0x4ade80});
for(const x of [-1.68,1.68]){
 mallPart(exitPorticoes,x,.94,EXIT_GATE.z,.12,1.88,.36,mallWallMaterial);
 mallPart(exitPorticoes,x,1.87,EXIT_GATE.z,.13,.13,.37,gateIndicator);
}
function directorOpen(){return playerLevel()>=DIRECTOR_LEVEL&&!!state.upgrades[FRONT_HALL];}
function securityOpen(){return playerLevel()>=SECURITY_LEVEL&&!!state.upgrades[FRONT_HALL];}
function showDirectorOffice(){
 if(!directorOpen())return;
 openPanel("Bureau du directeur");
 paragraph(state.storeName+" · Direction "+state.playerName);
 for(const [label,action] of [
  ["Bilan financier",showFinance],["Recrutement et équipes",()=>showTeamManagement()],
  ["Tableau de service",showServiceBoard],["Stocks du magasin",showStocks],
  ["Remarques des clients",showCustomerFeedback],["Calendrier et horaires",showCalendar],
  ["Éclairage du magasin",showLightingControls]
 ])button(panel,label,action);
 if(securityOpen())button(panel,"Journal de sécurité",showSecurityDesk);
}

function showLightingControls(){
 if(!directorOpen())return;
 openPanel("Bureau du directeur · Éclairage");
 for(const [label,action] of [["Interrupteur général · Espaces de vente",toggleLights],["Interrupteur commun · Réserves",toggleStockroomLights]]){
  button(panel,label,()=>{if(directorOpen()){action();showLightingControls();}});
 }
 for(const [zone,label] of Object.entries(LIGHT_ZONES)){
  button(panel,label+" · "+(lightOn(zone)?"Allumé":"Éteint"),()=>{
   if(!directorOpen())return;
   setZoneLighting(zone);
   showLightingControls();
  });
 }
 button(panel,"Retour au bureau",showDirectorOffice);
}

const AUTO_MODELS=[
 {id:"city",name:"FBA City",fuel:"Électrique",cost:12500,price:15900,x:-25.4,z:-18.3,color:0x0e7490},
 {id:"touring",name:"FBA Touring",fuel:"Thermique",cost:14200,price:17900,x:-14.6,z:-18.3,color:0xb91c1c},
];
const tireMaterial=standardMaterial({color:0x17191f,roughness:.86});
const carGlass=standardMaterial({color:0x20394d,metalness:.65,roughness:.18});
for(const model of AUTO_MODELS){
 const {x,z,color}=model,paint=standardMaterial({color,metalness:.6,roughness:.24});
 mallPart(showroomGroup,x,.62,z,1.82,.53,4.12,paint);
 mallPart(showroomGroup,x,.99,z-.14,1.54,.32,2.23,paint);
 mallPart(showroomGroup,x,1.27,z-.26,1.43,.39,1.8,carGlass);
 mallPart(showroomGroup,x,1.49,z-.27,1.43,.07,1.63,paint);
 for(const dx of [-.87,.87])for(const dz of [-1.22,1.22]){
  const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.32,.32,.19,16),tireMaterial);
  wheel.rotation.z=Math.PI/2;wheel.position.set(x+dx,.33,z+dz);showroomGroup.add(wheel);
 }
 for(const dx of [-.58,.58])mallPart(showroomGroup,x+dx,.7,z+2.065,.44,.12,.035,hallLight);
 mallSign(showroomGroup,model.name,model.fuel,x,z-2.5,0,3.2);
 colliders.push({minX:x-1,maxX:x+1,minZ:z-2.1,maxZ:z+2.1,requiresUpgrade:AUTO_SHOWROOM});
}
function showAutoService(){
 if(!state.upgrades[AUTO_SHOWROOM])return;
 openPanel("FBA Automobile");
 if(!state.upgrades.autoLicense){paragraph("Licence Automobile requise au niveau 46.");return;}
 const orders=state.management.autoOrders??={};
 const autoSales=state.management.autoSales??=0;
 paragraph("Ventes automobiles · "+autoSales+" | Trésorerie · "+euro(state.money));
 for(const model of AUTO_MODELS){
  const order=orders[model.id];
  paragraph(model.name+" · "+model.fuel+" · achat "+euro(model.cost)+" · vente "+euro(model.price));
  if(!order){
   button(panel,"Commander "+model.name,()=>{
    if(orders[model.id]||state.money<model.cost){toast("Commande indisponible ou trésorerie insuffisante");return;}
    state.money-=model.cost;finance.supplies+=model.cost;
    orders[model.id]={delivery:state.day+1,appointment:state.day+2};
    save();hud();showAutoService();
   });
  }else if(state.day<order.delivery)paragraph("Livraison prévue au jour "+order.delivery);
  else if(state.day<order.appointment)paragraph("En stock · rendez-vous client au jour "+order.appointment);
  else button(panel,"Finaliser la vente · "+euro(model.price),()=>{
   if(orders[model.id]!==order||state.day<order.appointment)return;
   delete orders[model.id];state.management.autoSales++;state.money+=model.price;
   finance.revenue+=model.price;finance.transactions++;state.sales++;
   sync();checkLevelUp();showAutoService();
  });
 }
}

const mallCenter=(ANNEX_ENTRY+MALL_MIN_Z)/2;
const mallSize=ANNEX_ENTRY-MALL_MIN_Z;
const mallFloorMaterial=standardMaterial({color:0xaabacb});
const plazaMaterial=standardMaterial({color:0xd2e4e6});
const guideMaterial=new THREE.MeshBasicMaterial({color:0x69b8b4});
mallPart(mallShell,0,-.16,mallCenter,2*MALL_HALF_WIDTH,.3,mallSize,mallFloorMaterial);
mallPart(mallShell,0,5.1,mallCenter,2*MALL_HALF_WIDTH,.2,mallSize,mallWallMaterial);
for(let z=ANNEX_ENTRY-4;z>MALL_MIN_Z;z-=7){
 for(const x of [-8,0,8])ceilingFixture(mallShell,x,z,"gallery");
}
for(const x of [-24,-16,16,24])ceilingFixture(mallShell,x,MALL_PLAZA_Z,"gallery");
mallPart(mallShell,0,2.5,MALL_MIN_Z,2*MALL_HALF_WIDTH,5,.3,mallWallMaterial);
for(const side of [-1,1]){
 if(side===1)mallPart(mallShell,MALL_HALF_WIDTH,2.5,mallCenter,.3,5,mallSize,mallWallMaterial);
 mallPart(mallShell,side*16.65,2.5,ANNEX_ENTRY,26.7,5,.3,mallWallMaterial);
 mallPart(mallShell,side*3.05,.012,mallCenter,.09,.015,mallSize-2,guideMaterial);
}
for(const [a,b] of [[MALL_MIN_Z,GALLERY_LINK_Z-1.5],[GALLERY_LINK_Z+1.5,ANNEX_ENTRY]]){
 mallPart(mallShell,-MALL_HALF_WIDTH,2.5,(a+b)/2,.3,5,b-a,mallWallMaterial);
}
const galleryLinkGate=mallPart(mallShell,-MALL_HALF_WIDTH,2.5,GALLERY_LINK_Z,.3,5,3,mallWallMaterial);
const galleryLinkSign=mallSign(mallShell,"AUTOMOBILE","PASSAGE VERS LE SHOWROOM",-29.45,GALLERY_LINK_Z,Math.PI/2,2.9);
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
 shelfDisplayBatches.set(product.id,[result]);
}
let bakeryScene=null;
for(const [index,department] of DEPARTMENTS.entries()){
 const group=new THREE.Group(),furnishings=new THREE.Group();
 furnishings.visible=false;
 group.add(furnishings);scene.add(group);
 const {x,z,front}=department,half=MALL_ROOM/2;
 for(const dx of [-2.1,2.1])ceilingFixture(furnishings,x+dx,z,"gallery");
 const accent=standardMaterial({color:departmentColors[index%departmentColors.length]});
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
 const gate=roomWall(x,1.7,front,2.8,3.4,.24,standardMaterial({color:0x475569}));
 hit(x,front,2.8,.24,department.id);
 mallSign(group,department.name.toUpperCase(),"NIVEAU "+department.level,x,front+.15,0,7.4);
 annexGroups.set(department.id,{group,gate,furnishings,x,z});
 if(department.id===BAKERY_ID){
  const ovenZ=z-3.62;
  const metal=standardMaterial({color:0x334155,roughness:.55});
  const glass=standardMaterial({color:0x16243a,emissive:0xfb7b24,emissiveIntensity:0});
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
  const uniform=standardMaterial({color:0xf1f5f9});
  const {head}=personModel(baker,{shirt:0xf1f5f9,skin:0xd99d73,hair:0x392620,uniform:true});
  const hat=new THREE.Mesh(new THREE.CylinderGeometry(.147,.13,.16,12),uniform);
  hat.position.y=.20;head.add(hat);
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
  const shelfMaterial=standardMaterial({color:p.storage==="cold"?0x93c5fd:0x475569});
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
// Une série d’articles identiques sur le même meuble partage ses appels de dessin.
function batchShelfDisplays(){
 for(const [id,items] of Object.entries(displays)){
  if(!items.length)continue;
  const byShelf=new Map();
  for(const item of items){
   if(!byShelf.has(item.parent))byShelf.set(item.parent,[]);
   byShelf.get(item.parent).push(item);
  }
  const groups=[];
  for(const [parent,models] of byShelf){
   const sample=models[0],parts=sample.isMesh?[sample]:sample.children;
   const batches=parts.map((part,index)=>{
    const batch=new THREE.InstancedMesh(part.geometry,part.material,models.length);
    const matrix=new THREE.Matrix4();
    for(const [slot,model] of models.entries()){
     model.updateMatrix();
     matrix.copy(model.matrix);
     if(!model.isMesh){const piece=model.children[index];piece.updateMatrix();matrix.multiply(piece.matrix);}
     batch.setMatrixAt(slot,matrix);
    }
    batch.computeBoundingSphere();parent.add(batch);
    return batch;
   });
   const retained=new Set(parts.map(part=>part.geometry));
   for(const model of models){
    parent.remove(model);
    model.traverse(piece=>{if(piece.geometry&&!retained.has(piece.geometry))piece.geometry.dispose();});
   }
   groups.push(batches);
  }
  displays[id]=[];
  shelfDisplayBatches.set(id,groups);
 }
}
function refreshDisplays(){
 for(const p of catalog){
  const available=productAvailable(p);
  const stock=available?state.inventory[p.id].shelf:0;
  updatePriceLabel(p);
  if(coldPriceLabels[p.id])coldPriceLabels[p.id].visible=available;
  const batches=shelfDisplayBatches.get(p.id);
  if(batches){
   for(const group of batches)for(const mesh of group){
    mesh.count=Math.min(stock,CAPACITY);
    mesh.visible=mesh.count>0;
   }
  }else displays[p.id].forEach((mesh,index)=>mesh.visible=index<stock);
 }
 for(const e of extraShelves)e.group.visible=playerLevel()>=e.level;
 for(const {rack,product} of wallProductRacks)if(product.requiresShelf===FRONT_HALL)rack.visible=productAvailable(product);
 for(const p of catalog.filter(p=>p.kind==="extension")){const g=extensionProductGroups[p.id];if(g)g.visible=!!state.upgrades.store1;}
 for(const p of catalog.filter(p=>p.kind==="electronics")){const g=electronicsProductGroups[p.id];if(g)g.visible=!!state.upgrades.store2;}
 updateShelfGuides();
}
cube(6.5,.55,6.5,3,1.1,1.3,0x475569,true);
cube(6.5,1.13,6.5,3.1,.12,1.4,0x1e293b);
// Écran et clavier côté employé (vers l'entrée, z positif), pas côté rayons.
cube(7.3,1.45,6.5,.6,.55,.2,0x0f172a);
const terminalScreen=cube(7.3,1.5,6.64,.48,.3,.045,0x22c55e);
const mainClosedSign=shelfSign("CAISSE 1 · FERMÉE");
mainClosedSign.position.set(6.55,2.03,6.38);scene.add(mainClosedSign);
terminalScreen.material.emissive=new THREE.Color(0x064e3b);
const terminalKeyboard=cube(7.3,1.22,6.86,.65,.035,.24,0x94a3b8);
// V0.9.90 — Équipements réalistes de la caisse, purement visuels.
const checkoutRubber=standardMaterial({color:0x111827,roughness:.92});
const checkoutSteel=standardMaterial({color:0x94a3b8,metalness:.65,roughness:.32});
const checkoutBlack=standardMaterial({color:0x172033,roughness:.6});
const checkoutTagMaterial=standardMaterial({color:0xe7eaf0,roughness:.52});
const checkoutGlow=standardMaterial({color:0x38bdf8,emissive:0x075985,emissiveIntensity:.32});
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
// Détacheur magnétique du côté caissier.
checkoutPart(6.65,1.23,7.02,.22,.06,.22,checkoutSteel);
const tagDetacher=new THREE.Mesh(new THREE.CylinderGeometry(.076,.076,.042,16),checkoutBlack);
tagDetacher.position.set(6.65,1.28,7.02);scene.add(tagDetacher);
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
const checkoutLogoTex=gameTexture(checkoutLogoCanvas);

function updateStoreSigns(){
 for(const [sign,subtitle] of [[entranceBrand,"BUSINESS EMPIRE SIMULATOR"],[corridorBrand,"EXTENSION DU MAGASIN"]]){
  const texture=sign.material.map;
  const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=256;
  paintBrand(canvas,state.storeName,subtitle);uploadTexturePixels(texture,canvas);
 }
 checkoutLogoCtx.fillStyle="#0f172a";checkoutLogoCtx.fillRect(0,0,512,128);
 checkoutLogoCtx.fillStyle="#38bdf8";checkoutLogoCtx.fillRect(0,0,512,9);
 checkoutLogoCtx.fillStyle="#ffffff";checkoutLogoCtx.textAlign="center";
 checkoutLogoCtx.font="bold 54px Arial";checkoutLogoCtx.fillText(state.storeName,256,81,470);
 uploadTexturePixels(checkoutLogoTex,checkoutLogoCanvas);
 $("storeName").textContent=state.storeName;
}
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
function setLightCircuit(zones,label){
 const on=!zones.every(lightOn);
 for(const zone of zones)lightSettings[zone]=on;
 updateLighting();save();
 toast(label+" · "+(on?"Éclairage allumé":"Éclairage éteint"));
}
function setZoneLighting(zone){setLightCircuit([zone],LIGHT_ZONES[zone]);}
function toggleColdRoomLights(){setZoneLighting("cold");}
function toggleStockroomLights(){setLightCircuit(STORAGE_LIGHTS,"Réserves sèche et électronique");}
function toggleLights(){setLightCircuit(COMMERCIAL_LIGHTS,"Espaces de vente");}
// Les emplacements libres sont partagés par toutes les références de la zone.
for(const [xs,zs] of [[[16.35,20.15],[3.1,7.8]],[[16.6,22.5],[11,14.8]]]){
 for(const x of xs)for(const z of zs)addStorageRack("cold",x,z,[.65,1.7,2.75],1.22);
}
const storageBatches=new Map();
const storageBoxGeometry=new THREE.BoxGeometry(1,1,1);
storageBoxGeometry.clearGroups();
storageBoxGeometry.addGroup(0,24,0);
storageBoxGeometry.addGroup(24,6,1);
storageBoxGeometry.addGroup(30,6,0);
const storageCardboard=standardMaterial({color:0xb78d62,roughness:.94});
const cartonLabels=new Map();
function cartonLabel(product,loose=false){
 const key=product.id+(loose?":loose":":box");
 if(!cartonLabels.has(key)){
  cartonLabels.set(key,standardMaterial({map:packageTexture(product,loose?"VRAC":"CARTON"),roughness:.88}));
 }
 return cartonLabels.get(key);
}
function labelDeliveryCarton(mesh,id){
 if(mesh.userData.productId===id)return;
 const product=catalog.find(p=>p.id===id);
 if(!product)return;
 const label=cartonLabel(product);
 mesh.material=[storageCardboard,storageCardboard,storageCardboard,storageCardboard,label,label];
 mesh.userData.productId=id;
}
const storageMatrix=new THREE.Matrix4(),storagePosition=new THREE.Vector3();
const storageRotation=new THREE.Quaternion(),storageScale=new THREE.Vector3(),storageUp=new THREE.Vector3(0,1,0);
const storageOverflow={dry:0,cold:0,electronics:0};
function storageCartonBatch(product,loose,count){
 const key=product.id+(loose?":loose":":box");
 let batch=storageBatches.get(key);
 if(batch&&batch.instanceMatrix.count>=count)return batch;
 if(batch){scene.remove(batch);batch.dispose();}
 batch=new THREE.InstancedMesh(storageBoxGeometry,
  [storageCardboard,cartonLabel(product,loose)],Math.max(5,count));
 batch.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
 storageBatches.set(key,batch);scene.add(batch);return batch;
}
function renderStorageCartons(product,loose,slots){
 if(!slots.length)return;
 const batch=storageCartonBatch(product,loose,slots.length);
 batch.count=slots.length;batch.visible=true;
 slots.forEach((slot,index)=>{
  storagePosition.set(slot.x,slot.y,slot.z);
  storageRotation.setFromAxisAngle(storageUp,slot.angle);
  storageScale.set(slot.width,STORAGE_CARTON_HEIGHT,.46);
  storageMatrix.compose(storagePosition,storageRotation,storageScale);
  batch.setMatrixAt(index,storageMatrix);
 });
 batch.instanceMatrix.needsUpdate=true;batch.computeBoundingSphere();
}
function refreshBoxes(){
 for(const batch of storageBatches.values())batch.visible=false;
 for(const kind of STORAGE_KINDS){
  const bays=storageBayCount(kind);
  const racks=storageRacks[kind].filter(rack=>(!rack.requiresUpgrade||state.upgrades[rack.requiresUpgrade])&&
   (rack.bay===undefined||rack.bay<bays)).map(rack=>({rack,used:0}));
  const products=catalog.filter(product=>storageKind(product)===kind&&contentVisible(product));
  const cartons=new Map();
  // Grouper les cartons fermés sur un même meuble lorsque la place le permet.
  for(const product of products){
   const count=state.inventory[product.id].boxes;
   if(!count)continue;
   const location=(count>10?racks.find(({used})=>used===0):null)??
    racks.find(({rack,used})=>rack.slots.length-used>=count);
   if(!location)continue;
   cartons.set(product.id,location.rack.slots.slice(location.used,location.used+count));
   location.used+=count;
  }
  const free=racks.flatMap(({rack,used})=>rack.slots.slice(used));
  free.push(...racks.flatMap(({rack})=>rack.overflow));
  let next=0;
  storageOverflow[kind]=0;
  for(const product of products){
   const count=state.inventory[product.id].boxes;
   const slots=cartons.get(product.id)??free.slice(next,next+count);
   if(!cartons.has(product.id))next+=slots.length;
   renderStorageCartons(product,false,slots);
   storageOverflow[kind]+=count-slots.length;
  }
  // Les bacs de vrac utilisent les places restantes après les cartons fermés.
  for(const product of products){
   const count=Math.ceil(state.inventory[product.id].reserve/BOX_UNITS);
   if(!count)continue;
   const slots=free.slice(next,next+count);
   next+=slots.length;
   renderStorageCartons(product,true,slots);
   storageOverflow[kind]+=count-slots.length;
  }
 }
}
function sync(){
 hud();refreshDisplays();refreshBoxes();refreshExtension();updateLighting();
 if(checkoutVisual)renderCheckoutVisual(checkoutVisual.customer);
 const second=extraRegisters[0];
 const {x,z}=state.upgrades[FRONT_HALL]?REGISTER_ROW:second.origin;
 second.x=x;second.z=z;second.queueX=x+second.origin.queueX-second.origin.x;second.queueZ=z+second.origin.queueZ-second.origin.z;
 second.meshes.forEach((mesh,index)=>{
  const offset=second.offsets[index];mesh.position.x=x+offset.x;mesh.position.z=z+offset.z;
 });
 second.staff.group.position.x=x-.96;second.staff.group.position.z=z+.15;
 for(const register of extraRegisters)for(const mesh of register.meshes)mesh.visible=registerUnlocked(register);
 updateRegisterIndicators();
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
 const inventory=state.inventory[p.id];
 if(held.source!=="loose"){
  const cartons=Math.min(Math.floor(held.quantity/BOX_UNITS),MAX_BOXES_PER_PRODUCT-inventory.boxes,
   storageLimit(storageKind(p))-storageBoxes(storageKind(p)));
  if(cartons>0){inventory.boxes+=cartons;held.quantity-=cartons*BOX_UNITS;}
  if(held.source==="delivery"&&held.quantity>=BOX_UNITS){
   sync();refreshCarry();showReserve();toast("Réserve pleine ou limite par produit atteinte");return;
  }
 }
 inventory.reserve+=held.quantity;
 held=null;sync();refreshCarry();showReserve();
}
function takeCarton(p,amount,source="box"){
 const a=state.inventory[p.id];
 if(held||!atStorageFor(p)||!productAvailable(p)){toast("Dépose d’abord ce que tu portes et approche-toi de la réserve");return;}
 if(source==="box"&&a.boxes>0){
  const cartons=Math.min(amount,a.boxes,handCapacity());
  a.boxes-=cartons;held={id:p.id,quantity:cartons*BOX_UNITS,source:"box"};
 }else if(source==="loose"&&a.reserve>0){
  const quantity=Math.min(amount,a.reserve);
  a.reserve-=quantity;held={id:p.id,quantity,source:"loose"};
 }else{toast("Aucun produit disponible");return;}
 sync();refreshCarry();panel.style.display="none";
 toast(p.name+" · "+held.quantity+" articles en main. Va au rayon.");
}
function removeReserveUnits(inventory,quantity){
 const loose=Math.min(inventory.reserve,quantity);
 const remaining=quantity-loose;
 const opened=Math.ceil(remaining/BOX_UNITS);
 inventory.boxes-=opened;
 inventory.reserve+=opened*BOX_UNITS-remaining-loose;
}
function takeRestockBatch(p){
 if(held||!state.upgrades.fastRestock||!atStorageFor(p)||!productAvailable(p))return;
 const quantity=Math.min(FAST_RESTOCK_LIMIT,productStoredUnits(p));
 if(!quantity)return;
 removeReserveUnits(state.inventory[p.id],quantity);
 held={id:p.id,quantity,source:"loose"};
 sync();refreshCarry();panel.style.display="none";
 toast(quantity+" × "+p.name+" pris en réserve. Va au rayon.");
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
   if(amount>productStoredUnits(p)){toast("Le stock disponible a changé");showDisposal(p);return;}
   removeReserveUnits(a,amount);
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
const breakSign=new THREE.Mesh(new THREE.PlaneGeometry(2.3,.7),new THREE.MeshBasicMaterial({map:gameTexture(breakSignCanvas),side:THREE.DoubleSide}));
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
ceilingFixture(scene,20.95,-6,"staff");
for(const z of [3,-2,-8,-14,-20])ceilingFixture(scene,25.65,z,"logistics",1.55);
for(const x of [24.1,27.2]){
 cube(x,3.85,-24.15,.29,.21,.21,0x475569);
 cube(x,3.77,-24.27,.25,.075,.08,0xfff7db).material=zonePanel("logistics");
}
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
const trolleyMetal=standardMaterial({color:0xdc2626,metalness:.45,roughness:.35});
const trolleyRubber=standardMaterial({color:0x111827});
function trolleyPart(w,h,d,x,y,z,mat=trolleyMetal){
 const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
 m.position.set(x,y,z);handtruckVisual.add(m);return m;
}
const trolleyPlatform=trolleyPart(.85,.09,.6,0,.13,.03);
trolleyPart(.08,1.35,.08,-.36,.78,.24);
trolleyPart(.08,1.35,.08,.36,.78,.24);
trolleyPart(.8,.08,.08,0,1.44,.24);
for(const x of [-.42,.42]){
 const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.12,12),trolleyRubber);
 wheel.rotation.z=Math.PI/2;wheel.position.set(x,.17,.32);handtruckVisual.add(wheel);
}
const trolleyBoxes=[];
for(let i=0;i<TROLLEY_UPGRADES.at(-1).trolleyCapacity;i++){
 const box=trolleyPart(.67,.33,.49,0,.39,.02,standardMaterial({color:0xb98246}));
 box.visible=false;trolleyBoxes.push(box);
}
scene.add(handtruckVisual);
const handtruckHeldVisual=handtruckVisual.clone(true);
const heldPlatform=handtruckHeldVisual.children[handtruckVisual.children.indexOf(trolleyPlatform)];
const heldTrolleyBoxes=handtruckHeldVisual.children.slice(-trolleyBoxes.length);
camera.add(handtruckHeldVisual);
scene.add(camera);
const HANDTRUCK_PARKING={x:25.3,z:-24};
function canUseHandtruck(){
 return canLookAround()&&state.upgrades.handtruck&&
  (state.trolleyCargo.length>0||near(HANDTRUCK_PARKING.x,HANDTRUCK_PARKING.z,2.3));
}
function useHandtruck(){
 if(!canUseHandtruck())return;
 if(near(25.65,-24.3,3.2))showDeliveryDock();
 else showTrolley();
}
function updateHandtruck(){
 const purchased=!!state.upgrades.handtruck;
 const carrying=purchased&&state.trolleyCargo.length>0;
 handtruckVisual.visible=purchased&&!carrying;
 handtruckHeldVisual.visible=carrying;
 if(!purchased)return;
 handtruckVisual.position.set(HANDTRUCK_PARKING.x,0,HANDTRUCK_PARKING.z);
 handtruckVisual.rotation.y=0;
 // First-person attachment: in front of the camera, not behind the player's view.
 handtruckHeldVisual.position.set(0,-1.02,-1.95);
 handtruckHeldVisual.rotation.set(-.10,0,0);
 handtruckHeldVisual.scale.set(.95,.95,.95);
 const large=trolleyCapacity()>8||state.trolleyCargo.length>8;
 const wide=trolleyCapacity()>TROLLEY_BASE_CAPACITY||state.trolleyCargo.length>TROLLEY_BASE_CAPACITY;
 trolleyPlatform.scale.x=heldPlatform.scale.x=large?2.5:wide?1.65:1;
 trolleyPlatform.scale.z=heldPlatform.scale.z=large?1.65:1;
 heldTrolleyBoxes.forEach((box,i)=>{
  box.scale.setScalar(large?.73:1);
  box.position.x=large?(i%4-1.5)*.5:wide?(i%2===0?-.34:.34):0;
  box.position.y=large?.31+Math.floor(i/8)*.25:.39+(wide?Math.floor(i/2):i)*.35;
  box.position.z=large?(Math.floor(i/4)%2===0?-.19:.19):.02;
  box.visible=i<state.trolleyCargo.length;
  if(box.visible)labelDeliveryCarton(box,state.trolleyCargo[i].id);
 });
}
// Premier manutentionnaire : itinéraire quai → réserve.
const workerGroup=new THREE.Group();
const {legs:[workerLeftLeg,workerRightLeg],arms:[workerLeftArm,workerRightArm]}=personModel(workerGroup,
 {shirt:0xf59e0b,skin:0xe5ac83,hair:0x493126,style:3,uniform:true});
const workerCarton=mallPart(workerGroup,0,1.05,-.45,.6,.45,.5,standardMaterial({color:0xb98246}));
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
function takeDockCartons(p,limit){
 let quantity=0;
 for(let i=0;i<state.deliveryDock.length&&limit>0;){
  const item=state.deliveryDock[i];
  if(item.id!==p.id){i++;continue;}
  quantity+=item.qty;
  state.deliveryDock.splice(i,1);limit--;
 }
 return quantity;
}
function storeDockBatch(p,quantity){
 const inventory=state.inventory[p.id],kind=storageKind(p);
 const boxes=Math.max(0,Math.min(Math.floor(quantity/BOX_UNITS),MAX_BOXES_PER_PRODUCT-inventory.boxes,
  storageLimit(kind)-storageBoxes(kind)));
 inventory.boxes+=boxes;
 const remaining=quantity-boxes*BOX_UNITS;
 for(let i=0;i<Math.floor(remaining/BOX_UNITS);i++)state.deliveryDock.push({id:p.id,qty:BOX_UNITS});
 inventory.reserve+=remaining%BOX_UNITS;
 return boxes;
}
function dockBatchCapacity(p){
 return Math.max(0,Math.min(DOCK_CARRY_LIMIT,MAX_BOXES_PER_PRODUCT-state.inventory[p.id].boxes,
  storageLimit(storageKind(p))-storageBoxes(storageKind(p))));
}
function nextDockProduct(){
 let first;
 for(const item of state.deliveryDock){
  const product=catalog.find(p=>p.id===item.id);
  if(!product||!contentVisible(product)||!dockBatchCapacity(product))continue;
  if(!state.management.coldDockFirst||storageKind(product)==="cold")return product;
  first??=product;
 }
 return first;
}
let workerRoute=[],workerWaypoint=0,workerPhase="dock",workerCargo=null,workerWait=0,workerTalking=false,workerTalkTimer=0,workerWalkClock=0;
let workerBreakJourney=null,stockerBreakJourney=null;
const WORKER_BREAK_SEAT={x:22.2,z:-5.25},STOCKER_BREAK_SEAT={x:22.2,z:-6.75};
workerGroup.position.set(25.65,0,-23.8);
function workerTaskLabel(){
 if(employeeBreakLabel(workerBreakJourney))return employeeBreakLabel(workerBreakJourney);
 if(workerCargo){const p=catalog.find(p=>p.id===workerCargo.id);return "Transport de "+Math.ceil(workerCargo.qty/BOX_UNITS)+" carton(s)"+(p?" de "+p.name:"");}
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
 speakDialogue(message,"worker");
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
 const greeting="Salut "+state.playerName+" ! Tu as besoin de quelque chose ?";
 paragraph(state.workerName+" : "+greeting);
 speakDialogue(greeting,"worker");
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
const {legs:[stockerLegA,stockerLegB],arms:[stockerArmA,stockerArmB]}=personModel(stockerGroup,
 {shirt:0x16a34a,skin:0xc98b68,hair:0x241d22,woman:true,style:2,uniform:true});
const stockerCarton=mallPart(stockerGroup,0,1.05,-.4,.55,.42,.48,standardMaterial({color:0xb98246}));
scene.add(stockerGroup);
stockerGroup.position.set(13,0,5);
let stockerTarget=null,stockerPhase="idle",stockerCargo=null,stockerTimer=0,stockerWalk=0,stockerTalking=false;
function stockerNeeds(){
 const options=catalog.filter(p=>productAvailable(p)&&state.inventory[p.id].shelf<shelfCapacity(p)&&
  (state.inventory[p.id].boxes>0||state.inventory[p.id].reserve>0)&&!shelfJobTaken(p));
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
 const greeting="Salut "+state.playerName+" ! Je m’occupe des rayons.";
 paragraph(state.stockerName+" : "+greeting);
 speakDialogue(greeting,"stocker");
 paragraph("Présence : "+employeeStatus(state.stockerHired,state.stockerEnabled,state.stockerSentHomeDay,stockerShift())+".");
 paragraph("Mission : "+stockerTaskLabel()+".");
 const answer=message=>{
  panel.style.display="none";stockerTalking=false;
  toast(state.stockerName+" : "+message);speakDialogue(message,"stocker");
 };
 button(panel,"Tu fais quoi ?",()=>answer(stockerTaskLabel()));
 button(panel,"Des rayons ont besoin d’être remplis ?",()=>answer(stockerTaskLabel()));
 button(panel,"Reprends ton travail",()=>answer(employeeOnLunch(stockerShift())?"Je reprends à 13 h !":"D’accord, je m’en occupe !"));
 button(panel,"Tu peux rentrer chez toi",()=>{state.stockerSentHomeDay=state.day;save();answer("À demain !");});
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
    const p=catalog.find(p=>p.id===stockerCargo),a=state.inventory[p.id];
    stockerUnits=Math.max(0,Math.min(SHELF_CARRY_LIMIT*BOX_UNITS,productStoredUnits(p),shelfCapacity(p)-a.shelf));
    if(stockerUnits){removeReserveUnits(a,stockerUnits);stockerCarton.visible=true;}
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
    stockerCargo=null;stockerUnits=0;stockerCarton.visible=false;stockerPhase="idle";stockerTimer=2;sync();
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
 const dist=Math.hypot(dx,dz),step=dt*(stockerCarton.visible?1.55:1.9)*(state.upgrades.shelfTraining?1.1:1);
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
   const p=nextDockProduct();
   if(!p||!workerGo(storageWorkPoint(p),"storage")){workerWait=2;return;}
   workerCargo={id:p.id,qty:takeDockCartons(p,dockBatchCapacity(p))};workerCarton.visible=true;
   refreshDeliveryDock();sync();workerWait=.55;return;
  }else{workerPhase="dock";stop();return;}
 }
 const target=workerRoute[workerWaypoint];
 if(target){
  const dx=target.x-workerGroup.position.x,dz=target.z-workerGroup.position.z;
  const dist=Math.hypot(dx,dz),step=dt*(workerCargo?1.65*(state.upgrades.dockTraining?1.15:1):2.05);
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
  if(p){
   const boxes=storeDockBatch(p,workerCargo.qty);
   if(boxes)toast("Manutentionnaire · "+boxes+" carton(s) de "+p.name+" rangés");
  }
  workerCargo=null;workerCarton.visible=false;sync();refreshDeliveryDock();
 }
}
function refreshDeliveryDock(){
 const visibleDeliveries=state.deliveryDock.filter(it=>contentVisible(catalog.find(p=>p.id===it.id)));
 const n=visibleDeliveries.length;
 truckBody.visible=truckCab.visible=truckStripe.visible=n>0;
 dockCartons.forEach((m,i)=>{
  m.visible=i<Math.min(n,dockCartons.length);
  if(m.visible)labelDeliveryCarton(m,visibleDeliveries[i].id);
 });
}
function showDeliveryDock(){
 if(!near(25.65,-24.3,3.2)){toast("Approche-toi de la zone livraison");return;}
 openPanel("ZONE LIVRAISON — Déchargement");
 if(state.upgrades.handtruck){
  paragraph("DIABLE DE MANUTENTION — "+trolleyLoadLabel()+" chargés.");
  if(state.trolleyCargo.length)button(panel,"Voir les cartons sur le diable",showTrolley);
 }
 if(held){paragraph("Rends-toi dans la réserve correspondante pour ranger tes cartons.");return;}
 if(!state.deliveryDock.length){paragraph("Aucun camion à décharger pour le moment.");return;}
 paragraph(state.deliveryDock.length+" carton(s) à ranger. Chaque carton contient 10 produits.");
 for(const p of catalog.filter(contentVisible)){
  const qty=state.deliveryDock.filter(it=>it.id===p.id).length;
  if(!qty)continue;
  if(state.upgrades.handtruck&&state.trolleyCargo.length<trolleyCapacity())button(panel,"Charger sur le diable — "+p.name+" ("+qty+" disponibles)",()=>{
   const i=state.deliveryDock.findIndex(it=>it.id===p.id);
   if(i<0||held||!state.upgrades.handtruck||!near(25.65,-24.3,3.2)||state.trolleyCargo.length>=trolleyCapacity())return;
   state.deliveryDock.splice(i,1);state.trolleyCargo.push({id:p.id});
   sync();refreshDeliveryDock();showDeliveryDock();toast("Diable : "+trolleyLoadLabel());
  });
  const freeSlots=trolleyCapacity()-state.trolleyCargo.length;
  const batch=Math.min(qty,freeSlots);
  if(state.upgrades.handtruck&&batch>1)button(panel,"Charger "+batch+" cartons — "+p.name,()=>{
   if(held||!state.upgrades.handtruck||!near(25.65,-24.3,3.2))return;
   const count=Math.max(0,Math.min(batch,trolleyCapacity()-state.trolleyCargo.length));
   for(let i=0,loaded=0;i<state.deliveryDock.length&&loaded<count;){
    if(state.deliveryDock[i].id!==p.id){i++;continue;}
    state.deliveryDock.splice(i,1);state.trolleyCargo.push({id:p.id});loaded++;
   }
   sync();refreshDeliveryDock();showDeliveryDock();toast("Diable : "+trolleyLoadLabel());
  });
  const cartons=Math.min(qty,handCapacity());
  const pickUp=count=>{
   if(held||!near(25.65,-24.3,3.2))return;
   const quantity=takeDockCartons(p,Math.min(count,handCapacity()));
   if(!quantity)return;
   held={id:p.id,quantity,source:"delivery"};
   sync();refreshDeliveryDock();refreshCarry();panel.style.display="none";
   toast(p.name+" · à ranger dans "+storageName(storageKind(p)));
  };
  button(panel,"Prendre 1 carton — "+p.name+" ("+qty+" restant(s))",()=>pickUp(1));
  if(cartons>1)button(panel,"Prendre "+cartons+" cartons à la main — "+p.name,()=>pickUp(cartons));
 }
}
refreshDeliveryDock();
function showTrolley(){
 openPanel("Diable de manutention — "+trolleyLoadLabel());
 if(!state.upgrades.handtruck){paragraph("Achetable dans les améliorations pour 125 €.");return;}
 if(!state.trolleyCargo.length){paragraph("Diable vide. Charge-le au quai de déchargement.");return;}
 const kind=currentStorageKind();
 const localCartons=state.trolleyCargo.filter(it=>{
  const p=catalog.find(p=>p.id===it.id);
  return p&&contentVisible(p)&&storageKind(p)===kind;
 });
 if(localCartons.length>1)button(panel,"Ranger les cartons de cette réserve",()=>{
  if(currentStorageKind()!==kind)return;
  let placed=0;
  for(const it of localCartons){
   const i=state.trolleyCargo.indexOf(it);
   if(i<0)continue;
   const p=catalog.find(p=>p.id===it.id),inventory=state.inventory[it.id];
   if(inventory.boxes>=MAX_BOXES_PER_PRODUCT||storageBoxes(storageKind(p))>=storageLimit(kind))continue;
   inventory.boxes++;state.trolleyCargo.splice(i,1);placed++;
  }
  if(placed){sync();showTrolley();}
  toast(placed?placed+" carton(s) rangés":"Réserve pleine ou limite par produit atteinte");
 });
 for(const [i,it] of state.trolleyCargo.entries()){
  const p=catalog.find(p=>p.id===it.id);
  if(!contentVisible(p))continue;
  paragraph((i+1)+". "+(p?p.name:it.id)+" — "+(p?storageName(storageKind(p)):"Produit inconnu"));
  if(p&&atStorageFor(p)){
   button(panel,"Décharger "+p.name,()=>{
    if(state.trolleyCargo[i]!==it||!atStorageFor(p))return;
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
 if(storageOverflow[kind])paragraph(storageOverflow[kind]+" carton(s) supplémentaires accessibles dans cet inventaire.");
 if(state.upgrades.handtruck&&state.trolleyCargo.length)button(panel,"Décharger le diable ("+state.trolleyCargo.length+" cartons)",showTrolley);
 if(held){
  const p=catalog.find(p=>p.id===held.id);
  paragraph("Tu portes "+held.quantity+" × "+p.name+(held.source==="loose"?" (en vrac)":""));
  button(panel,held.source==="loose"?"Reposer les produits en vrac":held.source==="delivery"?"Ranger la livraison":"Reposer les produits",putBack);
  return;
 }
 for(const p of unlockedProducts().filter(p=>storageKind(p)===kind)){
  const a=state.inventory[p.id];
  paragraph("● "+p.name+" — "+stockAlert(p)+" | Cartons : "+a.boxes+"/"+MAX_BOXES_PER_PRODUCT+" ("+(a.boxes*BOX_UNITS)+" unités) | Espace vrac : "+a.reserve+" unités | Total réserve : "+(a.reserve+a.boxes*BOX_UNITS));
  if(a.boxes>0){
   const cartons=Math.min(a.boxes,handCapacity());
   button(panel,"Prendre un carton de "+p.name+" ("+BOX_UNITS+")",()=>takeCarton(p,1,"box"));
   if(cartons>1)button(panel,"Prendre "+cartons+" cartons — "+p.name,()=>takeCarton(p,cartons,"box"));
  }
  if(a.reserve>0)button(panel,"PRENDRE EN VRAC — "+p.name+" ("+Math.min(10,a.reserve)+")",()=>takeCarton(p,10,"loose"));
  const batch=Math.min(FAST_RESTOCK_LIMIT,productStoredUnits(p));
  if(state.upgrades.fastRestock&&batch>BOX_UNITS)button(panel,"Prendre un lot de "+batch+" — "+p.name,()=>takeRestockBatch(p));
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
 seatedAtCheckout=true;panel.style.display="none";updateRegisterIndicators();
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
 seatedAtCheckout=false;closeCheckoutUI();clearCheckoutVisual();updateRegisterIndicators();
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
 if(directorOpen()&&near(DIRECTOR_DESK.x,DIRECTOR_DESK.z,2.5)){showDirectorOffice();return;}
 if(securityOpen()&&(near(SECURITY_DESK.x,SECURITY_DESK.z,2.15)||securityChecks.length&&near(EXIT_GATE.x,EXIT_GATE.z,2))){showSecurityDesk();return;}
 if(state.upgrades[AUTO_SHOWROOM]&&near(-20,-15.5,2.6)){showAutoService();return;}
 if(openDepartmentCount()&&near(0,MALL_PLAZA_Z,3)){showMallMap();return;}
 const register=activeRegisters().find(r=>near(r.x,r.z,1.65));
 if(register){showAuxiliaryCheckout(register);return;}
 if(fridgeDoor&&playerLevel()>=4&&near(-8.5,-3.5,2.4)){
  fridgeOpen=!fridgeOpen;fridgeDoor.rotation.y=fridgeOpen?-1.15:0;
  playSound(fridgeOpen?"open":"close");
  toast(fridgeOpen?"Réfrigérateur ouvert":"Réfrigérateur fermé");return;
 }
 if(freezerLid&&playerLevel()>=4&&near(8.5,-3.5,3.1)){
  freezerOpen=!freezerOpen;freezerLid.rotation.z=freezerOpen?-.95:0;
  playSound(freezerOpen?"open":"close");
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
 paragraph("Qualité graphique");
 for(const [mode,name] of [["fluid","Fluide"],["balanced","Équilibrée"],["detail","Détaillée"]]){
  const b=button(panel,name+(graphicsMode===mode?" · Active":""),()=>{
   graphicsMode=mode;localStorage.setItem(GRAPHICS_KEY,mode);resizeGameView();showSettings();
  });
  b.disabled=graphicsMode===mode;
 }
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
 button(panel,"Audio",showAudioSettings);
 button(panel,"Retour au menu",showMainMenu);
}
let mouseLookRequested=false,mouseLookFallback=false,mousePosition=null;
function canLookAround(){
 return ageOverlay.style.display==="none"&&!paused&&!seatedAtCheckout&&!levelModalShowing&&panel.style.display==="none"&&checkoutUI.style.display==="none";
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

// Ouvrir le dialogue sur click, après la fin du geste tactile.
const interactionRaycaster=new THREE.Raycaster();
function pointInteractionRay(event){
 const rect=canvas.getBoundingClientRect();
 const pointer=new THREE.Vector2(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1);
 camera.updateMatrixWorld();
 interactionRaycaster.setFromCamera(pointer,camera);
}
function pointsAtHandtruck(event){
 if(!canUseHandtruck())return false;
 const model=state.trolleyCargo.length?handtruckHeldVisual:handtruckVisual;
 model.updateWorldMatrix(true,true);
 pointInteractionRay(event);
 return interactionRaycaster.intersectObjects(model.children.filter(part=>part.visible)).length>0;
}
let handtruckTapStart=null,handtruckTapDragged=false;
canvas.addEventListener("click",e=>{
 if(e.button!==0||document.pointerLockElement===canvas)return;
 if(checkoutUI.style.display!=="none"||panel.style.display!=="none")return;
 if(!handtruckTapDragged&&pointsAtHandtruck(e)){useHandtruck();return;}
 if(!cashier||!checkoutVisual?.models.length||(!seatedAtCheckout&&!near(6.5,6.5,3.5)))return;
 pointInteractionRay(e);
 const hits=interactionRaycaster.intersectObjects(checkoutVisual.models,true);
 // Le premier objet touché détermine l'article retiré, même au milieu du tapis.
 const hit=hits.find(h=>h.object.userData.checkoutArticle);
 if(hit)scanCheckoutArticle(hit.object.userData.checkoutSlot);
});
canvas.addEventListener("pointerdown",e=>{
 handtruckTapDragged=false;
 if(e.pointerType==="mouse"){
  const scanning=cashier&&checkoutVisual?.models.length&&near(6.5,6.5,3.5);
  if(e.button===0&&!scanning&&!pointsAtHandtruck(e))captureMouseLook();
  return;
 }
 if(lookPointer!==null)return;
 lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);
 handtruckTapStart={x:e.clientX,y:e.clientY};
});
canvas.addEventListener("pointermove",e=>{
 if(e.pointerType==="mouse"){
  if(!mouseLookFallback||!canLookAround())return;
  if(mousePosition)turnCamera(e.clientX-mousePosition.x,e.clientY-mousePosition.y,.0025*mouseSensitivity/100);
  mousePosition={x:e.clientX,y:e.clientY};
  return;
 }
 if(e.pointerId!==lookPointer)return;
 if(handtruckTapStart&&Math.hypot(e.clientX-handtruckTapStart.x,e.clientY-handtruckTapStart.y)>12)handtruckTapDragged=true;
 const dx=THREE.MathUtils.clamp(e.clientX-lastX,-65,65);
 const dy=THREE.MathUtils.clamp(e.clientY-lastY,-65,65);
 lastX=e.clientX;lastY=e.clientY;
 if(seatedAtCheckout)return;
 turnCamera(dx,dy);
});
function stopLook(e){if(e.pointerId===lookPointer){lookPointer=null;handtruckTapStart=null;}}
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
 if(ageOverlay.style.display!=="none")return;
 if(e.code==="Escape"&&(document.pointerLockElement===canvas||mouseLookFallback)){
  releaseMouseLook();return;
 }
 if(e.target?.closest?.("input, textarea, select, [contenteditable]")||e.ctrlKey||e.altKey||e.metaKey)return;
 if(e.code==="Escape"&&panel.style.display!=="none"){panel.style.display="none";e.preventDefault();return;}
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
  if(e.code==="KeyT"&&canUseHandtruck()){e.preventDefault();useHandtruck();}
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
 const entrance=Math.abs(x)<2.15&&z>9.0&&z<11.5;
 const forecourt=Math.abs(x)<PARKING_HALF_WIDTH-r&&z>10.38+r&&z<31-r;
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
 const hall=state.upgrades[FRONT_HALL]&&x>HALL_WEST+.2+r&&x<-9.45&&z>-11.8+r&&z<9.45-r;
 const hallDoor=state.upgrades[FRONT_HALL]&&Math.abs(x+10)<1.35&&z>2.5+r&&z<7.5-r;
 const auto=state.upgrades[AUTO_SHOWROOM]&&x>-29.8+r&&x<-10.2-r&&z>-21.8+r&&z<-11.45;
 const autoDoor=state.upgrades[AUTO_SHOWROOM]&&Math.abs(x+20)<2-r&&Math.abs(z+12)<1.1;
 const link=autoLinkOpen()&&x>-35.85+r&&x<-30+r&&z>GALLERY_LINK_Z-1.35+r&&z<SHOWROOM_LINK_Z+1.35-r;
 const linkDoor=autoLinkOpen()&&Math.abs(x+30)<1.35&&
  (Math.abs(z-SHOWROOM_LINK_Z)<1.5-r||Math.abs(z-GALLERY_LINK_Z)<1.5-r);
 if(!(shop||mall||mallDoor||reserve||cold||storageWing||electronicsReserve||electronicsReserveDoor||entrance||forecourt||reserveDoor||coldDoor||serviceDoor||serviceCorridor||rearDock||breakRoom||breakDoor||hall||hallDoor||auto||autoDoor||link||linkDoor))return true;
 const candidates=r<=COLLIDER_CELL_PADDING?colliderCells.get(colliderCell(x,z)):colliders;
 return candidates?.some(c=>x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ&&
  !c.disabled&&contentVisible(c)&&(!c.requiresUpgrade||state.upgrades[c.requiresUpgrade])&&
  (!c.lockedBy||!state.upgrades[c.lockedBy])&&(!c.requiresLicense||state.upgrades[c.requiresLicense])&&(!c.level||playerLevel()>=c.level)&&
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
let stepDistance=0;
function movePlayer(dt){
 if(seatedAtCheckout||panel.style.display!=="none")return;
 const f=Number(keys.forward)-Number(keys.backward)-joyY,s=Number(keys.right)-Number(keys.left)+joyX;
 if(!f&&!s)return;
 const len=Math.max(1,Math.hypot(f,s));
 const baseSpeed=state.upgrades.handtruck&&state.trolleyCargo.length?3.7:5.5;
 const speed=baseSpeed*(state.upgrades.fastMovement?1.25:1)*dt;
 const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)/len*speed;
 const dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)/len*speed;
 const {x,z}=camera.position;
 if(!blocked(camera.position.x+dx,camera.position.z))camera.position.x+=dx;
 if(!blocked(camera.position.x,camera.position.z+dz))camera.position.z+=dz;
 stepDistance+=Math.hypot(camera.position.x-x,camera.position.z-z);
 if(stepDistance>=1.85){
  stepDistance-=1.85;
  playSound(z>10.4&&Math.abs(x)<PARKING_HALF_WIDTH?"stepOutside":"step");
 }
}
// V0.5 — panier multi-produits, caisse manuelle et horaires 08h-20h
const customers=[],queue=[];let cashier=null,shopOpen=false,spawnTimer=0,dayTimer=0;
const MAX_CUSTOMERS=5,DAY_SECONDS=600,OPEN_HOUR=8,CLOSE_HOUR=20;
const PREOPEN_HOUR=7,PREOPEN_SECONDS=45; // Préparation matinale de 7 h à 8 h
let preopenTimer=0;
let lastHudMinute=-1,lastHudDay=0;
function updateTime(){
 const minute=Math.floor(state.hour*60);
 if(minute===lastHudMinute&&state.day===lastHudDay)return;
 lastHudMinute=minute;lastHudDay=state.day;
 updateLighting();
 $("day").textContent=state.day+" — "+dateLabel();
 $("hour").textContent=formatHour(state.hour);
 $("shopStatus").textContent=shopOpen?"OUVERT":"FERMÉ";
 $("shopStatus").style.color=shopOpen?"#4ade80":"#fca5a5";
}
function makeCustomer(){
 const group=new THREE.Group();
 const woman=Math.random()<.5;
 const shirts=[0xef4444,0x2563eb,0x16a34a,0xf59e0b,0x9333ea,0x0891b2,0x64748b];
 const skinTones=[0xf0c9a6,0xd9a884,0xb77c5c,0x8c593f];
 const hairColors=[0x251b18,0x553724,0x986d36,0x3a3435];
 const pick=items=>items[Math.floor(Math.random()*items.length)];
 const shirt=pick(shirts);
 const {head,legs:[l,r],arms:[armLeft,armRight]}=personModel(group,{
  shirt,skin:pick(skinTones),hair:pick(hairColors),woman,
  trousers:pick([0x334155,0x1e293b,0x475569,0x3f3f46]),style:pick(woman?[0,1,2]:[0,0,2,3])
 });
 function part(w,h,d,mat,x,y,z,parent=group){return mallPart(parent,x,y,z,w,h,d,mat);}
 if(Math.random()<.22){
  const fabric=standardMaterial({color:shirt});
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.151,12,8),fabric);
  cap.position.set(0,.124,0);cap.scale.y=.59;head.add(cap);
  part(.27,.022,.117,fabric,0,.094,-.145,head);
 }
 // Panier tenu dans la main avec des produits visibles au fur et à mesure des achats.
 const basketGroup=new THREE.Group();basketGroup.position.set(.46,.72,-.10);group.add(basketGroup);
 const basketMat=standardMaterial({color:[0x2563eb,0x16a34a,0xd97706][Math.floor(Math.random()*3)],roughness:.78});
 const basketRim=standardMaterial({color:0x1e293b,roughness:.75});
 part(.58,.055,.38,basketMat,0,0,0,basketGroup);
 for(const z of [-.17,.17])part(.58,.25,.04,basketMat,0,.15,z,basketGroup);
 for(const x of [-.27,.27])part(.04,.25,.38,basketMat,x,.15,0,basketGroup);
 for(const z of [-.18,.18])part(.60,.035,.035,basketRim,0,.29,z,basketGroup);
 for(const x of [-.23,.23])part(.035,.18,.04,basketRim,x,.39,0,basketGroup);
 part(.49,.035,.04,basketRim,0,.49,0,basketGroup);
 const basketCargo=[];
 for(let i=0;i<4;i++){
  const cargo=part(.15,.16,.13,standardMaterial({color:0xfacc15}),-.16+(i%3)*.16,.13+Math.floor(i/3)*.14,-.07+(i%2)*.13,basketGroup);
  cargo.visible=false;basketCargo.push(cargo);
 }
 // Sac d'achat qui remplace le panier uniquement après le paiement.
 const bagGroup=new THREE.Group();bagGroup.position.set(.43,.67,-.10);group.add(bagGroup);
 const bagMat=standardMaterial({color:0xd6b58b,roughness:1});
 const handleMat=standardMaterial({color:0x91674c,roughness:1});
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
 if(autoLinkOpen()&&first?.department&&Math.random()<.45){
  route.push({x:-11.8,z:5},{x:-20,z:-10.7},{x:-22.1,z:-14.6},{x:AUTO_LINK_X,z:SHOWROOM_LINK_Z},
   {x:AUTO_LINK_X,z:GALLERY_LINK_Z},{x:-17.8,z:GALLERY_LINK_Z},{x:0,z:MALL_PLAZA_Z});
 }
 for(const p of choices){
  const [x,z]=stockerShelfPosition(p);
  route.push({x,z,shop:p.id});
 }
 const distance=route.reduce((length,point,i)=>{
  const previous=i?route[i-1]:{x:0,z:12.5};
  return length+Math.hypot(point.x-previous.x,point.z-previous.z);
 },0);
 group.scale.setScalar((woman?.89:.95)+Math.random()*.15);
 group.position.set(0,0,12.5);scene.add(group);
 customers.push({
  group,route,waypoint:0,phase:"shopping",timer:0,basket:{},prices:{},total:0,scanned:0,
  speed,l,r,armLeft,armRight,head,basketGroup,basketCargo,bagGroup,priceTolerance:1.12+Math.random()*.33,
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
 c.bagGroup.visible=(c.phase==="leaving"||c.phase==="securityCheck")&&c.paid;
 c.head.rotation.y=Math.sin(c.visualClock*1.2)*.15;
 if(c.phase==="securityCheck"){
  c.l.rotation.x=c.r.rotation.x=0;
 }else if(c.phase==="choosing"){
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
 if(z>13.45||blocked(x,z,r))return true;
 return x+r>4.7&&x-r<9.45&&z+r>7.25&&z-r<9.95;
}
// Navigation A* sur grille invisible : évite les collisions avec les rayons et la caisse.
const NAV_STEP=.35,NAV_MIN_X=HALL_WEST,NAV_MIN_Z=MALL_MIN_Z,NAV_W=Math.ceil((MALL_HALF_WIDTH-NAV_MIN_X)/NAV_STEP),NAV_H=Math.ceil((13.6-NAV_MIN_Z)/NAV_STEP);
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
 const resources=new Set();
 c.group.traverse(o=>{
  if(o.isInstancedMesh)o.dispose();
  if(o.geometry)resources.add(o.geometry);
  if(o.material)resources.add(o.material);
 });
 for(const resource of resources)resource.dispose();
 const i=customers.indexOf(c);if(i!==-1)customers.splice(i,1);
}
// La file est un état indépendant : personne ne contourne la caisse côté personnel.
function teamAvatar(role,x,z,woman=false){
 const group=new THREE.Group();
 const shirt={shelf:0x168258,dock:0xe79b2f,security:0x263c56,checkout:0x185aa0}[role];
 const variant=Math.abs(Math.round(x*13+z*9))%4;
 const {legs,arms}=personModel(group,{shirt,woman,uniform:true,
  skin:[0xedb990,0x9e6e52,0xc89471,0x8c593f][variant],
  hair:[0x30201d,0x271b1a,0x865e37,0x553724][variant],
  style:woman?[2,1,0,1][variant]:[0,3,2,0][variant]});
 group.scale.setScalar(woman?.94:1);
 const carton=mallPart(group,0,1,-.32,.51,.32,.30,standardMaterial({color:0xa77543}));
 group.position.set(x,0,z);group.visible=false;scene.add(group);
 return {group,legs,arms,carton,stride:0};
}
const teamUnits=Object.entries(STAFF_PLANS).flatMap(([role,plan])=>plan.levels.map((level,index)=>{
 const start=role==="dock"?[25.65+(index%3)*.48,-23.8-index*.38]:
  role==="shelf"?[12.3+(index%3)*.58,4.8+Math.floor(index/3)*.7]:
  [index%2?1.3:-1.3,7.4-index*.65];
 return {role,id:role+(index+1),name:plan.label+" "+(index+1),level,wage:plan.wage,
  ...teamAvatar(role,...start,WOMEN_ON_STAFF.has(role+(index+1))),route:[],delay:index*.44,patrol:index,cargo:null,target:null};
}));
const SHELF_TEAMS={cold:"Frais et surgelés",dry:"Produits secs et informatique"};
const shelfRoster=teamUnits.filter(unit=>unit.role==="shelf");
function shelfTeam(unit){
 const assigned=state.management.shelfTeams?.[unit.id];
 return Object.hasOwn(SHELF_TEAMS,assigned)?assigned:(shelfRoster.indexOf(unit)%2===0?"dry":"cold");
}
function shelfJobTaken(product){
 return teamUnits.some(unit=>unit.role==="shelf"&&(unit.target===product||unit.cargo?.product===product));
}
function expandedTeamStatus(unit){
 if(!employeeWorking(expandedTeamShift(unit)))return employeeOnLunch(expandedTeamShift(unit))?"Pause déjeuner":"Hors service";
 if(unit.cargo)return (unit.role==="dock"?"Range en réserve · ":"Réapprovisionne · ")+unit.cargo.product.name;
 if(unit.target)return "Cherche en réserve · "+unit.target.name;
 if(unit.role==="dock")return unit.route.length?"En route vers le quai":"Disponible au quai";
 return "Disponible";
}
function showServiceBoard(){
 openPanel("Tableau de service · "+formatHour(state.hour));
 paragraph(state.deliveryDock.length+" carton(s) au quai");
 button(panel,state.management.coldDockFirst?"Déchargement · Frais en premier":"Déchargement · Ordre d’arrivée",()=>{
  state.management.coldDockFirst=!state.management.coldDockFirst;
  save();showServiceBoard();
 });
 paragraph("Manutention");
 paragraph(state.workerName+" · "+employeeStatus(state.workerHired,state.workerEnabled,state.workerSentHomeDay,workerShift())+" · "+workerTaskLabel());
 for(const unit of teamUnits.filter(unit=>unit.role==="dock"&&state.management.team?.[unit.id])){
  paragraph(employeeName(unit.id)+" · "+expandedTeamStatus(unit));
 }
 paragraph(state.stockerName+" · Mise en rayon polyvalente · "+employeeStatus(state.stockerHired,state.stockerEnabled,state.stockerSentHomeDay,stockerShift())+" · "+stockerTaskLabel());
 for(const [team,label] of Object.entries(SHELF_TEAMS)){
  const members=shelfRoster.filter(unit=>shelfTeam(unit)===team&&state.management.team?.[unit.id]);
  paragraph(label+" · "+members.length+"/5 recruté(s)");
  for(const unit of members)paragraph(employeeName(unit.id)+" · "+expandedTeamStatus(unit));
 }
 paragraph("Caisses");
 paragraph("Caisse 1 · "+(registerOpen()?"Ouverte · "+checkoutLineCount()+" en attente":"Fermée"));
 for(const register of activeRegisters())paragraph(register.label+" · "+(registerOpen(register)?"Ouverte · "+checkoutLineCount(register)+" en attente":"Fermée"));
 button(panel,"Gérer les files et le renfort",showCheckoutRush);
 button(panel,"Actualiser les statuts",showServiceBoard);
 button(panel,"Affecter les employés de rayon",()=>showTeamManagement("shelf"));
 button(panel,"Détail des horaires et missions",showEmployeeOverview);
 button(panel,"Retour au bureau du directeur",showDirectorOffice);
}
function markTeamWorked(role,id,wage){
 const worked=state.management.teamWorked??={};
 const key=role+":"+id;
 if(worked[key]?.day!==state.day){worked[key]={day:state.day,wage};save();}
}
function showTeamManagement(role="shelf"){
 openPanel("Recrutement et équipes");
 for(const [id,label] of [["shelf","Mise en rayon"],["dock","Manutention"],["checkout","Caissiers"],["security","Sécurité"]]){
  button(panel,label,()=>showTeamManagement(id));
 }
 if(role==="checkout"){
  const roster=[{id:"main",label:"Caisse 1",level:20},...extraRegisters.filter(r=>!r.self&&!r.legacy)];
  if(selfHelpUnlocked()){
   const hired=!!state.management.selfHelp;
   paragraph(employeeName("selfHelp")+" · Assistance libre-service · "+euro(SELF_HELP_WAGE)+" par journée de service");
   button(panel,hired?"Suspendre l’assistance":"Recruter "+employeeName("selfHelp"),()=>{
    state.management.selfHelp=!hired;save();showTeamManagement(role);
   });
  }
  const hired=roster.filter(r=>cashierHired(r.id)).length;
  paragraph(hired+" / 10 caissiers recrutés · 65 € par journée de service");
  for(const register of roster){
   const available=registerUnlocked(register),employed=cashierHired(register.id);
   paragraph(register.label+" · "+employeeName(register.id)+" · "+(employed?"Recruté":available?"Poste disponible":"Niveau "+register.level+(register.hall?" et hall des caisses":"")));
   if(!available)continue;
   button(panel,employed?"Libérer le poste":"Recruter · "+register.label,()=>{
    if(register.id==="second")state.management.extraCashier=false;
    (state.management.cashiers??={})[register.id]=!employed;
    save();showTeamManagement(role);
   });
  }
  return;
 }
 const roster=teamUnits.filter(unit=>unit.role===role),employees=state.management.team??={};
 paragraph(roster.filter(unit=>employees[unit.id]).length+" / "+roster.length+" recrutés · "+euro(STAFF_PLANS[role].wage)+" par journée de service");
 if(role==="dock")paragraph("Jusqu’à "+DOCK_CARRY_LIMIT+" cartons de la même référence par trajet.");
 if(role==="shelf")paragraph("Jusqu’à "+SHELF_CARRY_LIMIT*BOX_UNITS+" articles de la même référence par trajet.");
 if(role==="shelf")button(panel,"Gérer "+state.stockerName,showStockerManagement);
 if(role==="dock")button(panel,"Gérer "+state.workerName,showWorkerManagement);
 for(const unit of roster){
  const hired=!!employees[unit.id];
  const status=unit.cargo?"Transporte "+unit.cargo.product.name:unit.role==="security"?"En ronde":unit.route.length?"En déplacement":"Disponible";
  paragraph(employeeName(unit.id)+" · "+unit.name+" · "+(hired?(unit.group.visible?status:"Hors service"):"Niveau "+unit.level));
  if(role==="shelf")paragraph("Équipe · "+SHELF_TEAMS[shelfTeam(unit)]);
  if(playerLevel()<unit.level)continue;
  if(role==="shelf"&&hired){
   const team=shelfTeam(unit),otherTeam=team==="cold"?"dry":"cold";
   const otherRoster=shelfRoster.filter(other=>shelfTeam(other)===otherTeam);
   const vacant=otherRoster.find(other=>!employees[other.id]);
   const exchange=swap=>{
    const assignments=state.management.shelfTeams??={};
    assignments[unit.id]=otherTeam;assignments[swap.id]=team;
    save();showTeamManagement(role);
   };
   if(vacant)button(panel,"Affecter à l’équipe "+SHELF_TEAMS[otherTeam],()=>exchange(vacant));
   else{
    const picker=document.createElement("select");
    picker.setAttribute("aria-label","Échanger l’affectation de "+employeeName(unit.id));
    for(const other of otherRoster){
     const option=document.createElement("option");
     option.value=other.id;option.textContent=employeeName(other.id);picker.appendChild(option);
    }
    panel.appendChild(picker);
    button(panel,"Échanger les affectations",()=>exchange(otherRoster.find(other=>other.id===picker.value)??otherRoster[0]));
   }
  }
  button(panel,hired?"Libérer le poste":"Recruter "+employeeName(unit.id),()=>{
   employees[unit.id]=!hired;
   if(hired){returnTeamCargo(unit);unit.route=[];unit.target=null;}
   save();showTeamManagement(role);
  });
 }
}
function returnTeamCargo(unit){
 if(!unit.cargo)return;
 const {product,quantity}=unit.cargo;
 if(unit.role==="dock"){
  for(let i=0;i<Math.floor(quantity/BOX_UNITS);i++)state.deliveryDock.push({id:product.id,qty:BOX_UNITS});
  state.inventory[product.id].reserve+=quantity%BOX_UNITS;
 }
 else state.inventory[product.id].reserve+=quantity;
 unit.cargo=null;sync();refreshDeliveryDock();
}
function walkTeamRoute(unit,dt,speed){
 const target=unit.route[0],position=unit.group.position;
 if(!target)return;
 const dx=target.x-position.x,dz=target.z-position.z,dist=Math.hypot(dx,dz);
 const step=Math.min(dist,dt*speed);
 if(dist<=step){position.x=target.x;position.z=target.z;unit.route.shift();}
 else{position.x+=dx/dist*step;position.z+=dz/dist*step;}
 faceNpc(unit.group,dx,dz,dt);unit.stride+=step*5.3;
 const swing=Math.sin(unit.stride)*.33;
 unit.legs[0].rotation.x=swing;unit.legs[1].rotation.x=-swing;
 unit.arms[0].rotation.x=unit.cargo?-.70:-swing*.65;
 unit.arms[1].rotation.x=unit.cargo?-.70:swing*.65;
}
function teamRouteTo(unit,point){
 unit.route=staffRoute(unit.group,point);
 return unit.route.length>0;
}
function updateTeamJob(unit){
 if(unit.role==="security"){
  const points=[[-2.4,7.6],[-2.7,3.4],[2.75,3.4],[2.75,-2.65],[-2.8,-2.65]];
  if(state.upgrades[FRONT_HALL])points.splice(1,0,[-10.2,6.7],[-19,7.9],[-27,3.5],[-26,-9.4],[-12,5.1]);
  const point=points[unit.patrol++%points.length];
  teamRouteTo(unit,point);
  return;
 }
 if(unit.cargo){
  const {product,quantity}=unit.cargo,a=state.inventory[product.id];
  if(unit.role==="dock"){
   storeDockBatch(product,quantity);
  }else{
   const placed=Math.max(0,Math.min(quantity,shelfCapacity(product)-a.shelf));
   a.shelf+=placed;a.reserve+=quantity-placed;
  }
  unit.cargo=null;sync();refreshDeliveryDock();return;
 }
 if(unit.role==="dock"){
  const position=unit.group.position;
  if(Math.hypot(position.x-WORKER_DOCK[0],position.z-WORKER_DOCK[1])>.35){
   teamRouteTo(unit,WORKER_DOCK);return;
  }
  const product=nextDockProduct();
  if(!product)return;
  if(!teamRouteTo(unit,storageWorkPoint(product)))return;
  unit.cargo={product,quantity:takeDockCartons(product,dockBatchCapacity(product))};save();refreshDeliveryDock();
  return;
 }
 if(unit.target){
  const product=unit.target;unit.target=null;
  const quantity=Math.min(SHELF_CARRY_LIMIT*BOX_UNITS,productStoredUnits(product),shelfCapacity(product)-state.inventory[product.id].shelf);
  if(quantity<=0||!teamRouteTo(unit,stockerShelfPosition(product)))return;
  removeReserveUnits(state.inventory[product.id],quantity);
  unit.cargo={product,quantity};save();return;
 }
 const team=shelfTeam(unit);
 const product=unlockedProducts().filter(p=>(storageKind(p)==="cold"?"cold":"dry")===team&&
  state.inventory[p.id].shelf<shelfCapacity(p)&&productStoredUnits(p)>0&&stockerCargo!==p.id&&!shelfJobTaken(p))
  .sort((a,b)=>state.inventory[a.id].shelf-state.inventory[b.id].shelf)[0];
 if(product&&teamRouteTo(unit,storageWorkPoint(product)))unit.target=product;
}
function expandedTeamShift(unit){
 return unit.role==="security"?[8,20]:unit.role==="dock"?workerShift():stockerShift();
}
function updateExpandedTeam(dt){
 for(const unit of teamUnits){
  const active=!!state.management.team?.[unit.id]&&playerLevel()>=unit.level&&employeeWorking(expandedTeamShift(unit));
  unit.group.visible=active;unit.carton.visible=!!unit.cargo;
  if(!active||unit===assignedGuard)continue;
  markTeamWorked(unit.role,unit.id,unit.wage);
  if(unit.route.length){
   const trained=unit.role==="shelf"&&state.upgrades.shelfTraining?1.1:
    unit.role==="dock"&&unit.cargo&&state.upgrades.dockTraining?1.15:1;
   walkTeamRoute(unit,dt,(unit.cargo?1.55:1.85)*trained);
  }else{
   for(const leg of unit.legs)leg.rotation.x=0;
   unit.delay-=dt;
   if(unit.delay<=0){unit.delay=unit.role==="security"?1:2.5;updateTeamJob(unit);}
  }
 }
 for(const register of extraRegisters){
  if(!register.staff)continue;
  register.staff.group.visible=registerUnlocked(register)&&cashierOnDuty(register.id);
  if(register.staff.group.visible)markTeamWorked("checkout",register.id,65);
  register.staff.carton.visible=false;
 }
 mainCashierAvatar.group.visible=cashierOnDuty("main")&&!seatedAtCheckout;
 if(mainCashierAvatar.group.visible)markTeamWorked("checkout","main",65);
 mainCashierAvatar.carton.visible=false;
}

// Le hall prolonge le rang de la caisse 2 vers l’ouest.
const REGISTER_ROW={x:-12.8,z:1.2,spacing:3.2};
const extraRegisters=[
 {id:"second",label:"Caisse 2",level:20,x:-2.4,z:5.05,queueX:-1.15,queueZ:5.25,queue:[],client:null},
 {id:"legacyExpress",label:"Caisse 3 · express",level:110,x:2.1,z:3.9,queueX:1.05,queueZ:4.05,legacy:true,queue:[],client:null},
 ...[21,24,27,30,33,36,39,42].map((level,index)=>{
  const x=REGISTER_ROW.x-(index+1)*REGISTER_ROW.spacing,z=REGISTER_ROW.z;
  return {id:"lane"+(index+3),label:"Caisse "+(index+3),level,x,z,queueX:x+1.2,queueZ:z+.2,hall:true,queue:[],client:null};
 }),
 ...[26,34].map((level,index)=>{
  const x=-25+index*3.65,z=6.5;
  return {id:"self"+index,label:"Libre-service "+(index+1),level,x,z,queueX:x+1.2,queueZ:z+.2,hall:true,self:true,queue:[],client:null};
 }),
];
for(const register of extraRegisters){
 const {x,z,level}=register;
 register.origin={x,z,queueX:register.queueX,queueZ:register.queueZ};
 register.meshes=[
  cube(x,.54,z,1.1,1.08,1.45,register.self?0x0e7490:0x475569),
  cube(x,1.11,z,1.19,.11,1.54,0x172033),
  cube(x,1.32,z-.42,register.self?.49:.35,.31,.16,0x22c55e),
  cube(x+.48,1.23,z+.35,.10,.14,.49,0x94a3b8),
 ];
 register.indicator=register.meshes[2];
 register.closedSign=shelfSign(register.label.toUpperCase()+" · FERMÉE");
 register.closedSign.position.set(x,1.56,z+.3);scene.add(register.closedSign);register.meshes.push(register.closedSign);
 const sign=shelfSign(register.label.toUpperCase());
 sign.position.set(x,2.25,z);scene.add(sign);register.meshes.push(sign);
 if(register.hall){
  const stripe=mallPart(hallGroup,register.queueX,.02,z-.95,.78,.012,.10,laneStripe);
  register.meshes.push(stripe);
 }
 if(!register.self&&!register.legacy)register.staff=teamAvatar("checkout",x-.96,z+.15,WOMEN_ON_STAFF.has(register.id));
 const collider={minX:x-.59,maxX:x+.59,minZ:z-.77,maxZ:z+.77,level,
  requiresUpgrade:register.hall?FRONT_HALL:undefined,lockedBy:register.legacy||register.id==="second"?FRONT_HALL:undefined};
 colliders.push(collider);
 if(register.id==="second"){
  colliders.push({minX:REGISTER_ROW.x-.59,maxX:REGISTER_ROW.x+.59,minZ:REGISTER_ROW.z-.77,
   maxZ:REGISTER_ROW.z+.77,level,requiresUpgrade:FRONT_HALL});
  register.offsets=register.meshes.map(mesh=>({x:mesh.position.x-x,z:mesh.position.z-z}));
 }
}
function registerUnlocked(register){return playerLevel()>=register.level&&(!register.hall||state.upgrades[FRONT_HALL])&&(!register.legacy||!state.upgrades[FRONT_HALL]);}
function activeRegisters(){return extraRegisters.filter(registerUnlocked);}
function cashierHired(id){return !!state.management.cashiers?.[id]||(id==="second"&&!!state.management.extraCashier);}
function cashierAvailable(id){
 const offset=id==="main"?0:Number(id.replace("lane",""))||2;
 const lunch=offset%2===0?12:13;
 return cashierHired(id)&&state.hour>=8&&state.hour<20&&(state.hour<lunch||state.hour>=lunch+1);
}
function cashierOnDuty(id){
 return cashierAvailable(id)&&!state.management.cashierStandby?.[id];
}
function registerOpen(register){
 return register?registerUnlocked(register)&&(register.self||cashierOnDuty(register.id)):seatedAtCheckout||cashierOnDuty("main");
}
function updateRegisterIndicators(){
 for(const register of extraRegisters){
  const open=registerOpen(register);
  register.closedSign.visible=registerUnlocked(register)&&!open;
  register.indicator.material.color.setHex(open?0x22c55e:0xef4444);
 }
 mainClosedSign.visible=!registerOpen();
 terminalScreen.material.color.setHex(registerOpen()?0x22c55e:0xef4444);
 terminalScreen.material.emissive.setHex(registerOpen()?0x064e3b:0x641510);
}
function autoCheckoutSeconds(count){return (2+count*.55)*(state.upgrades.checkoutTraining?.8:1);}
const mainCashierAvatar=teamAvatar("checkout",7.42,7.48,true);

const selfAssistant={...teamAvatar("checkout",-22.9,6.2,true),route:[],job:null,delay:0};
selfAssistant.carton.visible=false;
function selfHelpUnlocked(){return playerLevel()>=SELF_HELP_LEVEL&&!!state.upgrades[FRONT_HALL];}
function resolveSelfIssue(register,client){
 if(register.client!==client||!client.selfIssue)return;
 client.selfIssue=null;
 if(near(register.x,register.z,8))toast(register.label+" · borne dépannée");
}
function updateSelfHelp(dt){
 const active=selfHelpUnlocked()&&state.management.selfHelp&&state.hour>=8&&
  (state.hour<closingHour()&&(!isSunday()||state.sundayMode==="morning")||closing);
 selfAssistant.group.visible=!!active;
 if(!active){selfAssistant.route=[];selfAssistant.job=null;return;}
 markTeamWorked("checkout","selfHelp",SELF_HELP_WAGE);
 const agent=selfAssistant;
 if(agent.job&&(agent.job.register.client!==agent.job.client||!agent.job.client.selfIssue)){
  agent.job=null;agent.route=[];
 }
 if(!agent.job){
  const register=activeRegisters().find(r=>r.self&&r.client?.selfIssue);
  if(!register)return;
  if(!teamRouteTo(agent,[register.queueX,register.queueZ+.8]))return;
  agent.job={register,client:register.client};agent.delay=1.4;
 }
 if(agent.route.length){walkTeamRoute(agent,dt,2.5);return;}
 for(const leg of agent.legs)leg.rotation.x=0;
 agent.delay-=dt;
 if(agent.delay<=0){
  resolveSelfIssue(agent.job.register,agent.job.client);agent.job=null;
 }
}
const securityChecks=[];
const AUDIO_SETTINGS_KEY="fba-audio";
const audioSettings={volume:.65,dialogue:true};
try{
 const saved=JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY));
 if(Number.isFinite(saved?.volume))audioSettings.volume=Math.min(1,Math.max(0,saved.volume));
 if(typeof saved?.dialogue==="boolean")audioSettings.dialogue=saved.dialogue;
}catch{}
let gameAudio,gameAudioGain,gameNoise,lastDialogue=-Infinity;
function enableGameAudio(){
 const Audio=window.AudioContext??window.webkitAudioContext;
 if(!Audio||gameAudio?.state==="running")return;
 try{
  if(!gameAudio){
   gameAudio=new Audio();
   gameAudioGain=gameAudio.createGain();
   gameAudioGain.gain.value=audioSettings.volume;
   gameAudioGain.connect(gameAudio.destination);
   gameNoise=gameAudio.createBuffer(1,Math.ceil(gameAudio.sampleRate*.32),gameAudio.sampleRate);
   const samples=gameNoise.getChannelData(0);
   for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
  }
  gameAudio.resume().catch(()=>{});
 }catch(e){console.warn("Audio du magasin",e);}
}
document.addEventListener("pointerdown",enableGameAudio);
document.addEventListener("keydown",enableGameAudio);
function audioPulse(frequency,end,seconds,level,delay=0,noise=false){
 const start=gameAudio.currentTime+delay;
 const source=noise?gameAudio.createBufferSource():gameAudio.createOscillator();
 const gain=gameAudio.createGain();
 if(noise){
  source.buffer=gameNoise;
  const filter=gameAudio.createBiquadFilter();
  filter.type="bandpass";filter.frequency.value=frequency;filter.Q.value=.65;
  source.connect(filter);filter.connect(gain);
 }else{
  source.type="sine";
  source.frequency.setValueAtTime(frequency,start);
  source.frequency.exponentialRampToValueAtTime(end,start+seconds);
  source.connect(gain);
 }
 gain.gain.setValueAtTime(.0001,start);
 gain.gain.linearRampToValueAtTime(level,start+.006);
 gain.gain.exponentialRampToValueAtTime(.0001,start+seconds);
 gain.connect(gameAudioGain);
 source.start(start);
 source.stop(start+seconds);
}
function playSound(effect){
 if(gameAudio?.state!=="running"||!audioSettings.volume)return;
 switch(effect){
  case "step":
  case "stepOutside":{
   const outside=effect==="stepOutside";
   audioPulse((outside?1050:580)+Math.random()*180,0,outside?.145:.09,outside?.14:.19,0,true);
   audioPulse(112,58,.077,.038);
   break;
  }
  case "scan":audioPulse(1570,1420,.092,.09);break;
  case "open":
   audioPulse(590,0,.18,.13,0,true);
   audioPulse(150,91,.073,.055);
   break;
  case "close":
   audioPulse(390,0,.12,.15,.05,true);
   audioPulse(125,63,.12,.08,.06);
   break;
  case "shopOpen":
   audioPulse(570,0,.15,.09,0,true);
   audioPulse(620,690,.13,.05,.04);
   audioPulse(880,970,.15,.04,.14);
   break;
  case "shopClose":
   audioPulse(290,0,.15,.14,.08,true);
   audioPulse(790,660,.12,.045);
   audioPulse(425,335,.18,.05,.12);
   break;
  case "alarm":
   audioPulse(810,810,.13,.12);
   audioPulse(630,630,.15,.12,.16);
   break;
 }
}
function speakDialogue(message,role,ambient=false){
 const synth=window.speechSynthesis,Utterance=window.SpeechSynthesisUtterance;
 if(!audioSettings.dialogue||!audioSettings.volume||!synth||!Utterance||document.hidden)return;
 const now=performance.now();
 if(ambient&&(synth.speaking||synth.pending||now-lastDialogue<6000))return;
 if(!ambient)synth.cancel();
 const line=new Utterance(message);
 line.lang="fr-FR";line.volume=audioSettings.volume*(ambient?.48:.85);
 const voice=synth.getVoices().find(voice=>voice.localService&&voice.lang==="fr-FR");
 if(voice)line.voice=voice;
 line.rate=role==="worker"?.95:1.03;line.pitch=role==="worker"?.84:role==="stocker"?1.13:1;
 lastDialogue=now;synth.speak(line);
}
function saveAudioSettings(){
 localStorage.setItem(AUDIO_SETTINGS_KEY,JSON.stringify(audioSettings));
 if(gameAudioGain)gameAudioGain.gain.value=audioSettings.volume;
 if(!audioSettings.volume||!audioSettings.dialogue)window.speechSynthesis?.cancel();
}
function showAudioSettings(){
 openPanel("Audio");
 const label=document.createElement("label"),value=document.createElement("span"),slider=document.createElement("input");
 slider.type="range";slider.min="0";slider.max="100";slider.step="5";slider.value=String(Math.round(audioSettings.volume*100));
 slider.style.cssText="display:block;width:100%;margin:12px 0;accent-color:#38bdf8";
 value.textContent="Volume général · "+slider.value+" %";
 slider.addEventListener("input",()=>{
  audioSettings.volume=Number(slider.value)/100;
  value.textContent="Volume général · "+slider.value+" %";
  saveAudioSettings();
 });
 label.append(value,slider);panel.appendChild(label);
 button(panel,"Voix des dialogues · "+(audioSettings.dialogue?"Activées":"Coupées"),()=>{
  audioSettings.dialogue=!audioSettings.dialogue;saveAudioSettings();showAudioSettings();
 });
 button(panel,"Tester le son du scanner",()=>playSound("scan"));
 button(panel,"Retour aux paramètres",showSettings);
}
function soundExitAlarm(){
 if(near(EXIT_GATE.x,EXIT_GATE.z,18))playSound("alarm");
}
// Incidents de vol : signalements des caméras, portiques et intervention simulée.
const theftIncidents=[];
let theftSequence=0;
function theftZone(product){
 if(product?.department)return DEPARTMENTS[product.department]?.name??"Galerie";
 const z=product?.z??0;
 if(z<-18)return "Électronique";
 if(z<-7)return "Petit-déjeuner / première extension";
 if(z<1)return "Rayons alimentaires";
 return "Supermarché";
}
function reportTheft(customer,product){
 const incident={id:++theftSequence,customer,product:product?.name??"Article",zone:theftZone(product),day:state.day,status:"en fuite",policeTimer:0,atGate:false};
 customer.theftIncident=incident;
 theftIncidents.unshift(incident);
 if(theftIncidents.length>30)theftIncidents.length=30;
 const seen=surveillance.detectAt(customer.group.position.x,customer.group.position.z);
 incident.camera=seen;
 if(seen){
  toast("VIDÉOSURVEILLANCE · Vol détecté — "+incident.zone);
  playSound("alert");
 }
 return incident;
}
function callPoliceForTheft(incident){
 if(!incident||incident.status!=="en fuite")return;
 incident.status="police appelée";
 incident.policeTimer=7;
 toast("Police contactée · intervention en cours — "+incident.zone);
}
function updateTheftPolice(dt){
 for(const incident of theftIncidents){
  if(incident.status!=="police appelée")continue;
  incident.policeTimer-=dt;
  if(incident.policeTimer>0)continue;
  incident.status="interpellé";
  const c=incident.customer;
  if(c&&customers.includes(c)){
   if(c.phase==="securityCheck"){
    const index=securityChecks.indexOf(c);
    if(index>=0)securityChecks.splice(index,1);
   }
   removeCustomer(c);
  }
  if(!securityChecks.length)gateIndicator.color.setHex(0x4ade80);
  toast("Police · voleur interpellé, article récupéré");
  const log=state.management.securityLog??=[];
  log.unshift({day:state.day,product:incident.product,checked:true,theft:true,zone:incident.zone});
  log.length=Math.min(log.length,20);save();
 }
}
function triggerSecurityCheck(customer){
 if(customer.theftIncident){
  customer.theftIncident.atGate=true;
  toast("ALARME PORTIQUE · Vol — "+customer.theftIncident.zone);
 }
 customer.phase="securityCheck";customer.securityWait=0;
 securityChecks.push(customer);
 gateIndicator.color.setHex(0xef4444);soundExitAlarm();
 if(!customer.theftIncident)customerComplaint(customer,"antivol","Le portique sonne. Mon achat est déjà payé.");
 toast("Portique antivol · vérification du ticket au poste de sécurité");
}
function finishSecurityCheck(customer,checked=true){
 if(customer.theftIncident)return;
 const index=securityChecks.indexOf(customer);
 if(index<0)return;
 securityChecks.splice(index,1);
 const product=catalog.find(p=>p.id===customer.activeTag);
 const log=state.management.securityLog??=[];
 log.unshift({day:state.day,product:product?.name??"Article",checked});
 log.length=Math.min(log.length,20);
 customer.activeTag=null;customer.securityChecked=true;customer.phase="leaving";
 if(!securityChecks.length)gateIndicator.color.setHex(0x4ade80);
 save();
 if(checked)toast("Ticket vérifié · antivol retiré");
}
let assignedGuard=null,assignedIncident=null,guardDelay=0;
function updateSecurityDesk(dt){
 const incident=securityChecks.find(c=>!c.theftIncident);
 if(!incident||assignedGuard&&!assignedGuard.group.visible){
  assignedGuard=null;assignedIncident=null;return;
 }
 if(assignedIncident!==incident){
  assignedGuard=teamUnits.filter(unit=>unit.role==="security"&&unit.group.visible).sort((a,b)=>
   a.group.position.distanceToSquared(incident.group.position)-b.group.position.distanceToSquared(incident.group.position))[0];
  if(!assignedGuard)return;
  if(!teamRouteTo(assignedGuard,[.85,EXIT_GATE.z-.65])){assignedGuard=null;return;}
  assignedIncident=incident;guardDelay=1.8;
 }
 if(assignedGuard.route.length){walkTeamRoute(assignedGuard,dt,2.6);return;}
 for(const leg of assignedGuard.legs)leg.rotation.x=0;
 guardDelay-=dt;
 if(guardDelay<=0){
  finishSecurityCheck(incident);
  assignedGuard=null;assignedIncident=null;
 }
}
function showSecurityDesk(){
 if(!securityOpen())return;
 openPanel("Poste de sécurité");
 button(panel,"Accéder aux caméras de surveillance",()=>surveillance.show());
 const thefts=theftIncidents.filter(i=>i.status!=="interpellé");
 paragraph("Alertes vol · "+thefts.length+" incident(s) en cours");
 for(const incident of thefts){
  paragraph("VOL · "+incident.zone+" · "+incident.product+" · "+(incident.atGate?"ALARME PORTIQUE":incident.camera?"Signalé par caméra":"Non détecté par caméra")+" · "+incident.status);
  if(incident.status==="en fuite")button(panel,"Appeler la police — "+incident.zone,()=>{callPoliceForTheft(incident);showSecurityDesk();});
 }
 paragraph("Portiques de sortie · "+securityChecks.length+" contrôle(s) en attente.");
 for(const customer of securityChecks){
  if(customer.theftIncident)continue;
  const product=catalog.find(p=>p.id===customer.activeTag);
  paragraph((product?.name??"Article")+" · achat payé, antivol encore actif");
  button(panel,"Vérifier le ticket et retirer l’antivol",()=>{
   finishSecurityCheck(customer);showSecurityDesk();
  });
 }
 const log=state.management.securityLog??[];
 if(log.length)paragraph("Derniers contrôles");
 for(const entry of log)paragraph("Jour "+entry.day+" · "+entry.product+" · "+(entry.checked?"ticket vérifié":"client reparti avant le contrôle"));
}

function approachingCustomerCount(register){
 return customers.filter(c=>c.phase==="approachingQueue"&&c.auxRegister===register).length;
}
function checkoutLineCount(register){
 return (register?.queue??queue).length+approachingCustomerCount(register);
}
function showCheckoutRush(){
 openPanel("Files et renfort en caisse");
 const waiting=customers.filter(c=>c.phase==="waitingRegister").length;
 if(waiting)paragraph(waiting+" client(s) cherchent une caisse ouverte.");
 for(const register of [undefined,...activeRegisters()]){
  const id=register?.id??"main",label=register?.label??"Caisse 1";
  const open=registerOpen(register);
  paragraph(label+" · "+(open?checkoutLineCount(register)+" en attente · env. "+Math.ceil(checkoutWorkAhead(register))+" s":"Fermée"));
  if(register?.self||!cashierHired(id))continue;
  if(!cashierAvailable(id)){paragraph("Caissier hors service");continue;}
  if(!register&&seatedAtCheckout)continue;
  const busy=!!(register?register.client:cashier)||checkoutLineCount(register)>0;
  const standby=!!state.management.cashierStandby?.[id];
  if(!standby&&busy)continue;
  button(panel,(standby?"Ouvrir en renfort · ":"Mettre en attente · ")+label,()=>{
   if(!cashierAvailable(id)||(!register&&seatedAtCheckout))return;
   if(!!state.management.cashierStandby?.[id]!==standby)return;
   if(!standby&&(checkoutLineCount(register)||(register?register.client:cashier)))return;
   (state.management.cashierStandby??={})[id]=!standby;
   if(standby)redistributeCheckoutLine(register);
   updateRegisterIndicators();save();showCheckoutRush();
  });
 }
 if(!registerOpen())paragraph("Tu peux aussi ouvrir la caisse 1 en t’asseyant au poste.");
 if(activeRegisters().some(r=>!r.self))button(panel,"Gérer les caissiers",()=>showTeamManagement("checkout"));
}
function auxiliaryCustomerCount(register){
 return register.queue.length+Number(!!register.client)+approachingCustomerCount(register);
}
function showAuxiliaryRegisters(){
 openPanel("Caisses supplémentaires");
 for(const register of activeRegisters()){
  button(panel,register.label+" · "+(registerOpen(register)?auxiliaryCustomerCount(register)+" client(s)":"Fermée"),()=>showAuxiliaryCheckout(register));
 }
 button(panel,"Recruter des caissiers",()=>showTeamManagement("checkout"));
}
function showAuxiliaryCheckout(register){
 if(!activeRegisters().includes(register))return;
 openPanel(register.label);
 if(!registerOpen(register)){
  paragraph("Caisse fermée · aucun caissier en service.");
  button(panel,"Recrutement et équipes",()=>showTeamManagement("checkout"));
  return;
 }
 if(register.self){
  paragraph("Borne autonome · 5 articles maximum.");
  if(register.client?.selfIssue){
   const client=register.client;
   paragraph(client.selfIssue);
   button(panel,"Dépanner la borne",()=>{resolveSelfIssue(register,client);showAuxiliaryCheckout(register);});
  }
  paragraph(auxiliaryCustomerCount(register)+" client(s) à cette borne.");
  button(panel,"Actualiser",()=>showAuxiliaryCheckout(register));
  return;
 }
 const client=register.client;
 paragraph(register.queue.length+" client(s) dans la file.");
 if(!client){paragraph("Aucun client au comptoir.");button(panel,"Actualiser",()=>showAuxiliaryCheckout(register));return;}
 const items=Object.entries(client.basket).flatMap(([id,n])=>Array(n).fill(id));
 if(register.staff&&cashierHired(register.id))paragraph("Caissier · "+employeeName(register.id));
 paragraph(client.scanned+" / "+items.length+" articles scannés · "+euro(client.total));
 if(client.scanned<items.length){
  const product=catalog.find(p=>p.id===items[client.scanned]);
  button(panel,"Scanner · "+product.name,()=>{
   if(!registerOpen(register)||register.client!==client)return;
   client.scanned++;playSound("scan");showAuxiliaryCheckout(register);
  });
 }else button(panel,"Encaisser "+euro(client.total),()=>{
  if(payAuxiliaryCheckout(register,client))showAuxiliaryCheckout(register);
 });
}
function payAuxiliaryCheckout(register,client){
 if(!registerOpen(register)||register.client!==client)return false;
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
  if(register.self&&client.selfIssue){
   client.selfWait+=dt;
   if(client.selfWait>=45){sendToExit(client);}
   return;
  }
  if(registerOpen(register)){
   client.timer-=dt;
   if(client.timer<=0){
    client.scanned=Object.values(client.basket).reduce((n,q)=>n+q,0);
    if(!register.self)markTeamWorked("checkout",register.id,65);
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
  const count=Object.values(client.basket).reduce((n,q)=>n+q,0);
  client.timer=register.self?3+count*.8:autoCheckoutSeconds(count);
  if(register.self&&Math.random()<.22){
   client.selfIssue=Math.random()<.5?"Article non reconnu par la balance.":"Code-barres illisible.";
   client.selfWait=0;
   customerComplaint(client,"selfHelp","J’ai besoin d’aide à la borne, s’il vous plaît !");
  }
  client.navTarget=null;client.navRoute=null;
  if(near(register.x,register.z,5))toast("Client · "+register.label);
 }else if(client.queueStall>10)sendToExit(client);
}
const CHECKOUT_APPROACH_FALLBACK={x:3.35,z:6.5};
function queueSpot(i,register){
 if(register)return {x:register.queueX,z:register.queueZ-Math.min(i+Number(!!register.client),register.hall||register.id==="second"&&state.upgrades[FRONT_HALL]?2:4)*.65};
 return {x:3.65,z:6.25-Math.min(i+Number(!!cashier),4)*.78};
}
function checkoutServiceEstimate(c,register){
 const count=Object.values(c.basket).reduce((sum,quantity)=>sum+quantity,0);
 if(register?.self)return 3+count*.8;
 if(!register&&seatedAtCheckout)return 4+count*1.4;
 return autoCheckoutSeconds(count);
}
function checkoutWorkAhead(register,queuedCustomer){
 const client=register?register.client:cashier;
 let seconds=0;
 if(client){
  seconds=!register&&seatedAtCheckout?checkoutServiceEstimate(client,register):Math.max(0,client.timer??0);
  if(client.selfIssue)seconds+=Math.max(0,45-(client.selfWait??0));
 }
 for(const customer of register?.queue??queue){
  if(customer===queuedCustomer)return seconds;
  seconds+=checkoutServiceEstimate(customer,register);
 }
 for(const customer of customers){
  if(customer.phase==="approachingQueue"&&customer.auxRegister===register)seconds+=checkoutServiceEstimate(customer,register);
 }
 return seconds;
}
function checkoutEstimate(c,register){
 const spot=queueSpot((register?.queue??queue).length,register);
 const walking=Math.hypot(c.group.position.x-spot.x,c.group.position.z-spot.z)/c.speed;
 return Math.max(walking,checkoutWorkAhead(register))+checkoutServiceEstimate(c,register);
}
function routeCustomerToRegister(c,register){
 c.auxRegister=register;
 c.phase="approachingQueue";c.queueStall=0;c.checkoutApproach=null;c.navTarget=null;c.navRoute=null;
}
function sendToQueue(c){
 if(c.phase==="waitingRegister"||c.phase==="approachingQueue"||c.phase==="queue"||c.phase==="checkout"||c.phase==="auxQueue"||c.phase==="auxCheckout")return;
 const count=Object.values(c.basket).reduce((n,q)=>n+q,0);
 if(count===0){sendToExit(c);return;}
 c.phase="waitingRegister";c.registerWait=0;
 assignOpenRegister(c,count);
}
function assignOpenRegister(c,count=Object.values(c.basket).reduce((n,q)=>n+q,0)){
 const available=activeRegisters().filter(r=>registerOpen(r)&&(!r.self||count<=5));
 if(registerOpen())available.unshift(undefined);
 let best,bestTime=Infinity;
 for(const register of available){
  const estimate=checkoutEstimate(c,register);
  if(estimate<bestTime){best=register;bestTime=estimate;}
 }
 if(bestTime<Infinity)routeCustomerToRegister(c,best);
}
function redistributeCheckoutLine(register){
 for(const c of customers){
  if(c.phase!=="queue"&&c.phase!=="auxQueue")continue;
  const currentTime=checkoutWorkAhead(c.auxRegister,c)+checkoutServiceEstimate(c,c.auxRegister);
  if(c.auxRegister===register||checkoutEstimate(c,register)+5>=currentTime)continue;
  const line=c.auxRegister?.queue??queue;
  const index=line.indexOf(c);
  if(index<0)continue;
  line.splice(index,1);
  routeCustomerToRegister(c,register);
 }
}
let checkoutRush=false,checkoutRushTimer=0;
function updateCheckoutRush(dt){
 checkoutRushTimer-=dt;
 if(checkoutRushTimer>0)return;
 checkoutRushTimer=1;
 const waiting=customers.filter(c=>c.phase==="waitingRegister");
 const overloaded=waiting.some(c=>c.registerWait>=8)||customers.some(c=>
  (c.phase==="queue"||c.phase==="auxQueue")&&(c.queueElapsed>=12||checkoutWorkAhead(c.auxRegister)>=22));
 if(overloaded&&!checkoutRush)toast("Attente en caisse · ouvre le panneau Files d’attente pour appeler un renfort");
 checkoutRush=overloaded;
}
function redirectClosedRegister(c){
 const register=c.auxRegister,line=register?.queue??queue;
 const index=line.indexOf(c);
 if(index>=0)line.splice(index,1);
 if(register?.client===c)register.client=null;
 if(c===cashier){cashier=null;closeCheckoutUI();clearCheckoutVisual();}
 c.auxRegister=undefined;c.phase="waitingRegister";c.registerWait=0;c.scanned=0;c.belt=null;
 c.selfIssue=null;c.navTarget=null;c.navRoute=null;c.checkoutElapsed=0;
 assignOpenRegister(c);
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
 if(c.paid&&securityOpen()&&!c.securityChecked){
  const tagged=Object.keys(c.basket).find(id=>TAGGED_PRODUCTS.has(id));
  c.activeTag=c.forgottenTag??(!c.manualCheckout&&tagged&&Math.random()<.20?tagged:null);
 }
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
  c.route=[{x:0,z:7.7},EXIT_GATE,{x:0,z:12.5}];
  return;
 }
 const index=queue.indexOf(c);if(index>=0)queue.splice(index,1);
 c.phase="leaving";c.waypoint=0;c.navTarget=null;c.navRoute=null;c.stuckTime=0;c.exitStall=0;
 c.route=[{x:0,z:8.5},EXIT_GATE,{x:0,z:12.5}];
}
function updateCustomers(dt){
 for(const c of [...customers]){
  updateCustomerVisual(c,dt);
  if(c.phase==="waitingRegister"){
   assignOpenRegister(c);
   if(c.phase==="waitingRegister"){
    c.registerWait+=dt;
    if(c.registerWait>=12)customerComplaint(c,"closed","Il n’y a aucune caisse ouverte.");
    if(c.registerWait>=45||closing)sendToExit(c);
   }
   continue;
  }
  const inLine=c.phase==="queue"||c.phase==="auxQueue";
  if((inLine||c.phase==="approachingQueue"||c.phase==="checkout"||c.phase==="auxCheckout")&&!registerOpen(c.auxRegister)){
   redirectClosedRegister(c);continue;
  }
  if(inLine||c.phase==="checkout"||c.phase==="auxCheckout"){
   c.queueElapsed+=dt;
   if(!inLine)c.checkoutElapsed+=dt;
   if(!c.waitPenalty&&(inLine?c.queueElapsed>25:c.checkoutElapsed>40)){
    c.waitPenalty=true;customerComplaint(c,"wait",inLine?"C’est long, cette file n’avance pas !":"Ça fait un moment que j’attends pour payer.",-3);
   }
   if(inLine&&c.queueElapsed>75){sendToExit(c);continue;}
  }
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
    else{
     if(t.shop)customerComplaint(c,"search","Je ne trouve pas le rayon "+catalog.find(p=>p.id===t.shop).name+".");
     if(c.waypoint>=c.route.length)sendToQueue(c);
    }
   }
  }else if(c.phase==="choosing"){
   c.timer-=dt;
   if(c.timer<=0){
    const a=state.inventory[c.productId];
    if(a){
     const quantity=Math.min(a.shelf,1+Math.floor(Math.random()*3));
     const product=catalog.find(p=>p.id===c.productId);
     if(quantity>0&&!c.theftIncident&&securityOpen()&&Math.random()<.018){
      a.shelf-=1;sync();reportTheft(c,product);sendToExit(c);
      continue;
     }
     if(quantity>0&&a.price>product.price*c.priceTolerance){
      customerComplaint(c,"price",product.name+" à "+euro(a.price)+" ? C’est trop cher.",-2);
     }else if(quantity>0){
      a.shelf-=quantity;c.basket[c.productId]=(c.basket[c.productId]||0)+quantity;
      c.prices[c.productId]=a.price;c.total+=quantity*a.price;sync();
     }else{
      c.missingProducts++;
      customerComplaint(c,"stock","Je ne trouve plus de "+product.name.toLowerCase()+".",-2);
     }
    }
    c.phase="shopping";
   }
  }else if(c.phase==="approachingQueue"){
   updateQueueApproach(c,dt);
  }else if(c.phase==="auxQueue"||c.phase==="auxCheckout"){
   updateAuxiliaryQueue(c,dt);
  }else if(c.phase==="queue"){

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
    c.timer=autoCheckoutSeconds(Object.values(c.basket).reduce((n,q)=>n+q,0));
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
   if(c===cashier&&!seatedAtCheckout&&!checkoutVisual&&cashierOnDuty("main")){
    c.timer-=dt;
    if(c.timer<=0){
     markTeamWorked("checkout","main",65);
     completeCheckoutPayment(c,Object.values(c.basket).reduce((n,q)=>n+q,0),true);
     continue;
    }
   }
   const belt=c.belt;
   if(belt?.refillDelay>0){
    belt.refillDelay=Math.max(0,belt.refillDelay-dt);
    if(belt.refillDelay===0){
     fillCheckoutSlots(belt);
     if(checkoutVisual?.customer===c)renderCheckoutVisual(c);
    }
   }
   if(c===cashier&&seatedAtCheckout&&panel.style.display==="none"&&checkoutUI.style.display==="none"&&
    (checkoutVisual?.customer!==c||(!checkoutVisual.models.length&&!belt?.refillDelay)))showCheckout();

   c.l.rotation.x=c.r.rotation.x=0;
  }else if(c.phase==="securityCheck"){
   c.securityWait+=dt;
   if(c.securityWait>=45)finishSecurityCheck(c,false);
  }else if(c.phase==="leaving"){
   const t=c.route[c.waypoint];
   if(!t){removeCustomer(c);continue;}
   const x=c.group.position.x,z=c.group.position.z;
   if(walk(c,t,dt)){
    c.waypoint++;c.exitStall=0;
    if(t===EXIT_GATE&&securityOpen()&&(c.activeTag||c.theftIncident))triggerSecurityCheck(c);
   }
   else{
    const moved=Math.hypot(c.group.position.x-x,c.group.position.z-z)>.003;
    c.exitStall=moved?0:(c.exitStall||0)+dt;
    if(c.exitStall>7){if(t===EXIT_GATE&&securityOpen()&&(c.activeTag||c.theftIncident))triggerSecurityCheck(c);else c.waypoint++;c.exitStall=0;c.navTarget=null;c.navRoute=null;}
   }
   if(c.phase==="leaving"&&c.waypoint>=c.route.length)removeCustomer(c);
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
  shopOpen=false;updateOpen();playSound("shopClose");toast("Fermé aux nouveaux clients");return;
 }
 if(state.hour>=closingHour()){toast("Horaire de fermeture dépassé");return;}
 dayStarted=true;shopOpen=true;spawnTimer=1;updateOpen();playSound("shopOpen");toast("Magasin ouvert — affluence "+customerTraffic().label.toLowerCase());
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
   if(spawnTimer<=0&&customers.length<customerLimit()){
    makeCustomer();spawnTimer=nextCustomerDelay();
   }
  }
  if(shopOpen&&state.hour>=closingHour()){shopOpen=false;playSound("shopClose");toast("Heure de fermeture atteinte — derniers clients en caisse");}
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
  const wages=Object.values(state.management.teamWorked??{}).reduce((sum,entry)=>sum+(entry.day===state.day?entry.wage:0),0);
  state.money-=wages;finance.charges+=wages;
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
window.addEventListener("resize",resizeGameView);
// La façade et les panneaux restent visibles. L'intérieur d'une boutique
// est chargé au rendu à l'approche, indépendamment du stock et de la navigation.
function updateGalleryRendering(){
 const {x,z}=camera.position;
 for(const [id,room] of annexGroups){
  const dx=Math.max(0,Math.abs(x-room.x)-MALL_ROOM/2);
  const dz=Math.max(0,Math.abs(z-room.z)-MALL_ROOM/2);
  const distance=room.furnishings.visible?7:5.5;
  room.furnishings.visible=room.group.visible&&!!state.upgrades[id]&&(surveillance.isOpen()||dx*dx+dz*dz<=distance*distance);
 }
 const deep=z<ANNEX_ENTRY-(renderingDeepGallery?5:7);
 if(deep===renderingDeepGallery)return;
 renderingDeepGallery=deep;
 resizeGameView();
}
const feedbackBubble=document.createElement("div");
Object.assign(feedbackBubble.style,{display:"none",position:"fixed",zIndex:"18",pointerEvents:"none",transform:"translate(-50%,-100%)",
 maxWidth:"min(240px,42vw)",padding:"7px 10px",borderRadius:"10px",background:"#f8fafc",color:"#172033",
 boxShadow:"0 2px 8px #0005",font:"600 13px system-ui",textAlign:"center"});
document.body.appendChild(feedbackBubble);
let nearbyComplaint=null;
const feedbackPosition=new THREE.Vector3();
function customerComplaint(c,reason,message,penalty=0){
 c.complaints??=new Set();
 if(c.complaints.has(reason))return;
 c.complaints.add(reason);
 const log=state.management.customerFeedback??=[];
 log.unshift({message,day:state.day,hour:state.hour});
 log.length=Math.min(log.length,16);
 if(penalty)changeSatisfaction(penalty);
 else save();
 if(near(c.group.position.x,c.group.position.z,13)){
  nearbyComplaint={c,time:3.6};feedbackBubble.textContent=message;
  if(near(c.group.position.x,c.group.position.z,5))speakDialogue(message,"customer",true);
 }
}
function showCustomerFeedback(){
 openPanel("Remarques des clients");
 const log=state.management.customerFeedback??[];
 if(!log.length)paragraph("Aucune remarque enregistrée.");
 for(const entry of log)paragraph("Jour "+entry.day+" · "+formatHour(entry.hour)+" · "+entry.message);
}
function renderCustomerFeedback(dt){
 if(nearbyComplaint){
  nearbyComplaint.time-=dt;
  if(nearbyComplaint.time<=0||!customers.includes(nearbyComplaint.c))nearbyComplaint=null;
 }
 feedbackBubble.style.display="none";
 if(!nearbyComplaint||panel.style.display!=="none")return;
 const position=nearbyComplaint.c.group.position;
 camera.updateMatrixWorld();
 feedbackPosition.copy(position);feedbackPosition.y+=2.25;feedbackPosition.project(camera);
 if(Math.abs(feedbackPosition.x)>.92||Math.abs(feedbackPosition.y)>.9||feedbackPosition.z<0||feedbackPosition.z>1)return;
 feedbackBubble.style.display="block";
 feedbackBubble.style.left=(50+50*feedbackPosition.x)+"%";
 feedbackBubble.style.top=(50-50*feedbackPosition.y)+"%";
}
const ageOverlay=document.createElement("div");
Object.assign(ageOverlay.style,{position:"fixed",inset:"0",zIndex:"200",display:"none",placeItems:"center",
 background:"#0f172a",color:"#f8fafc",overflowY:"auto",padding:"14px"});
const ageCard=document.createElement("form");
ageCard.setAttribute("role","dialog");ageCard.setAttribute("aria-modal","true");ageCard.setAttribute("aria-label","Vérification de l’âge");
Object.assign(ageCard.style,{boxSizing:"border-box",width:"min(100%,390px)",maxHeight:"100%",overflowY:"auto",
 padding:"20px",border:"1px solid #475569",borderRadius:"14px",background:"#172033",font:"15px system-ui"});
ageOverlay.appendChild(ageCard);document.body.appendChild(ageOverlay);
function showAgePrompt(){
 ageOverlay.style.display="grid";
 const heading=document.createElement("h2");heading.textContent="Année de naissance";
 const note=document.createElement("p");note.textContent="Elle sert à adapter les rayons à ton âge et reste dans ce navigateur.";
 const label=document.createElement("label");label.textContent="Ton année de naissance";
 const year=document.createElement("input");
 Object.assign(year,{type:"number",inputMode:"numeric",required:true,min:birthYearNow()-120,max:birthYearNow(),step:1});
 Object.assign(year.style,{display:"block",width:"100%",boxSizing:"border-box",padding:"8px",margin:"6px 0 12px"});
 label.appendChild(year);
 const status=document.createElement("p");status.setAttribute("role","status");
 const next=button(ageCard,"Continuer",()=>{});
 next.type="submit";
 ageCard.replaceChildren(heading,note,label,status,next);
 ageCard.addEventListener("submit",event=>{
  event.preventDefault();
  const value=Number(year.value);
  if(!validBirthYear(value)){status.textContent="Saisis une année de naissance valide.";return;}
  const difference=birthYearNow()-value;
  if(difference===18){
   ageCard.replaceChildren(heading,status);
   status.textContent="As-tu déjà eu 18 ans cette année ?";
   button(ageCard,"Oui, j’ai déjà 18 ans",()=>acceptAge(value,true)).type="button";
   button(ageCard,"Non, j’ai encore 17 ans",()=>acceptAge(value,false)).type="button";
  }else acceptAge(value,difference>18);
 });
 year.focus();
}
function saveAgeProfile(){
 try{localStorage.setItem(PROFILE_KEY,JSON.stringify(ageProfile));}
 catch(e){console.warn("Enregistrement du profil d’âge",e);}
}
function acceptAge(year,adultConfirmed){
 ageProfile={year,adultConfirmed};saveAgeProfile();
 if(adultContentAllowed())showAdultNotice();
 else closeAgePrompt();
}
function showAdultNotice(){
 ageOverlay.style.display="grid";
 const warning=document.createElement("p");
 warning.textContent="Le jeu peut contenir des accessoires à caractère sexuel dans le rayon Bien-être intime, accessible à partir du niveau "+ADULT_LEVEL+".";
 ageCard.replaceChildren(warning);
 const enter=button(ageCard,"Entrer dans le jeu",()=>{
  ageProfile.noticeSeen=true;saveAgeProfile();closeAgePrompt();
 });
 enter.type="button";enter.focus();
}
function closeAgePrompt(){
 ageOverlay.style.display="none";sync();refreshDeliveryDock();
}
const surveillance=installSurveillance({THREE,scene,camera,renderer,securityOpen,near,openPanel,paragraph,button,toast,releaseMouseLook,extensionUnlocked:()=>!!state.upgrades.store1,
 autoUnlocked:()=>!!state.upgrades[AUTO_SHOWROOM],departments:DEPARTMENTS.map(d=>({...d,unlocked:()=>!!state.upgrades[d.id]}))});
const clock=new THREE.Clock();
let contextLost=false,refreshOnResume=false;
function refreshWhenVisible(){
 if(!document.hidden)refreshOnResume=true;
 else window.speechSynthesis?.cancel();
}
document.addEventListener("visibilitychange",refreshWhenVisible);
window.addEventListener("pageshow",refreshWhenVisible);
renderer.domElement.addEventListener("webglcontextlost",event=>{
 event.preventDefault();
 contextLost=true;
});
renderer.domElement.addEventListener("webglcontextrestored",()=>{
 contextLost=false;
 refreshOnResume=true;
});
function animate(){
 requestAnimationFrame(animate);
 if(document.hidden||contextLost)return;
 if(refreshOnResume){
  refreshOnResume=false;
  renderer.resetState();
  resizeGameView();
  for(const texture of gameTextures)texture.needsUpdate=true;
  updateLighting();
  clock.start();
 }
 const dt=Math.min(clock.getDelta(),.05);
 const smooth=1-Math.exp(-14*dt);
 yaw+=(targetYaw-yaw)*smooth;pitch+=(targetPitch-pitch)*smooth;
 camera.rotation.y=yaw;camera.rotation.x=pitch;
 if(!paused&&ageOverlay.style.display==="none"){
  movePlayer(dt);updateConstruction(dt);business(dt);updateBakery();updateCustomers(dt);updateWorker(dt);updateStocker(dt);
  updateExpandedTeam(dt);updateSelfHelp(dt);updateSecurityDesk(dt);updateTheftPolice(dt);updateRegisterIndicators();updateCheckoutRush(dt);
 }
 seatButton.style.display=seatedAtCheckout||near(7.3,6.5,3.4)?"block":"none";
 updateHandtruck();
 handtruckButton.style.display=canUseHandtruck()?"block":"none";
 checkoutRushButton.style.display=checkoutRush&&panel.style.display==="none"&&checkoutUI.style.display==="none"?"block":"none";
 updateGalleryRendering();
 if(bakeryScene&&state.upgrades[BAKERY_ID]){
  bakeryScene.baker.visible=bakerOnDuty();
  const batch=state.management.bakery?.batch;
  bakeryScene.glass.emissiveIntensity=batch&&state.day*1440+state.hour*60<batch.ready ? .9 : 0;
 }
 renderCustomerFeedback(dt);
 if(!surveillance.render())renderer.render(scene,camera);
}
batchShelfDisplays();indexColliders();sync();updateStoreSigns();updateOpen();updateConstructionUI();
if(!ageProfile)showAgePrompt();
else if(adultContentAllowed()&&!ageProfile.noticeSeen)showAdultNotice();
animate();toast("Business Empire Simulator V0.14.34 !");
