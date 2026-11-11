import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";
// Business Empire Simulator V0.9.50 — version synchronisée
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
// Deux gondoles de 30 emplacements pour chaque produit de départ.
function shelfCapacity(p){return !p.level&&p.kind!=="extension"?CAPACITY*2:CAPACITY;}
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
const MAX_BOXES_PER_PRODUCT=5;
function productStoredUnits(p){const a=state.inventory[p.id];return a.boxes*BOX_UNITS+a.reserve;}
function stockAlert(p){
 const a=state.inventory[p.id],available=productStoredUnits(p)+a.shelf;
 return available===0?"RUPTURE":available<=10?"STOCK FAIBLE":"OK";
}
function canOrderBox(p){
 return reserveBoxes()<reserveLimit()&&(!p||state.inventory[p.id].boxes<MAX_BOXES_PER_PRODUCT);
}
function orderBlockReason(p){
 if(state.inventory[p.id].boxes>=MAX_BOXES_PER_PRODUCT)return "Maximum de 5 cartons de "+p.name+" atteint";
 if(reserveBoxes()>=reserveLimit())return "Réserve pleine — améliore sa capacité";
 return "";
}
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
   if(Array.isArray(current.supplierOrders))s.supplierOrders=current.supplierOrders.filter(o=>o&&Array.isArray(o.items)&&Number.isFinite(o.due));
   if(Array.isArray(current.deliveryDock))s.deliveryDock=current.deliveryDock.filter(it=>it&&typeof it.id==="string"&&Number.isFinite(it.qty));
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
     s.inventory[p.id].shelf=Math.min(shelfCapacity(p),count);
     s.inventory[p.id].reserve=Math.max(0,count-shelfCapacity(p));
    });
   }
  }
 }catch(e){console.warn("Chargement sauvegarde",e);}
 return s;
}
const state=load();
state.supplierOrders=Array.isArray(state.supplierOrders)?state.supplierOrders:[];
state.deliveryDock=Array.isArray(state.deliveryDock)?state.deliveryDock:[];
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
// Panier fournisseurs : paiement groupé, délai normal 30 s ou express 5 s.
const supplierCart={};
function pendingBoxes(id){return state.supplierOrders.reduce((n,o)=>n+o.items.reduce((m,it)=>m+(it.id===id?it.qty:0),0),0)+state.deliveryDock.filter(it=>it.id===id).length;}
function pendingTotal(){return state.supplierOrders.reduce((n,o)=>n+o.items.reduce((m,it)=>m+it.qty,0),0)+state.deliveryDock.length;}
function cartCount(){return Object.values(supplierCart).reduce((n,v)=>n+v,0);}
function cartSubtotal(){return catalog.reduce((n,p)=>n+(supplierCart[p.id]||0)*p.cost*BOX_UNITS,0);}
function cartCapacity(){return reserveLimit()-reserveBoxes()-pendingTotal();}
function addSupplierItem(p){
 const count=state.inventory[p.id].boxes+pendingBoxes(p.id)+(supplierCart[p.id]||0);
 if(count>=MAX_BOXES_PER_PRODUCT){toast("Maximum de 5 cartons, commandes en attente incluses");return;}
 if(cartCount()>=reserveLimit()-reserveBoxes()-pendingTotal()){toast("Capacité de réserve insuffisante");return;}
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
 if(items.reduce((n,it)=>n+it.qty,0)>cartCapacity()){toast("Capacité de réserve insuffisante");return;}
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
 paragraph("Ajoute tes cartons, puis choisis le mode de livraison au paiement. Limite : 5 cartons par produit, commandes en attente comprises.");
 for(const p of unlockedProducts()){
  const a=state.inventory[p.id],qty=supplierCart[p.id]||0,pending=pendingBoxes(p.id);
  paragraph(p.name+" | "+a.boxes+"/5 en réserve | "+pending+" en livraison | Panier : "+qty+" | "+euro(p.cost*BOX_UNITS)+"/carton");
  const add=button(panel,"+ Ajouter 1 carton de "+p.name,()=>addSupplierItem(p));
  add.disabled=a.boxes+pending+qty>=MAX_BOXES_PER_PRODUCT||cartCapacity()<=cartCount();
  if(add.disabled)add.style.opacity=".45";
  if(qty)button(panel,"− Retirer 1 carton de "+p.name,()=>{supplierCart[p.id]--;if(!supplierCart[p.id])delete supplierCart[p.id];showOrders();});
 }
 paragraph("SOUS-TOTAL : "+euro(cartSubtotal())+" — "+cartCount()+" carton(s)");
 if(cartCount()){
  button(panel,"PAYER — Normale 30 s : "+euro(cartSubtotal()),()=>checkoutSupplier(false));
  button(panel,"PAYER — Express 5 s (+20 %) : "+euro(Math.round(cartSubtotal()*120)/100),()=>checkoutSupplier(true));
 }
 if(state.deliveryDock.length)paragraph("CAMION À DÉCHARGER : "+state.deliveryDock.length+" carton(s) — zone livraison près de la réserve.");
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
 unlockedProducts().forEach(p=>{
  const a=state.inventory[p.id];
  paragraph(p.name+" — "+stockAlert(p)+" | Rayon "+a.shelf+"/"+shelfCapacity(p)+" | "+(p.kind==="froid"||p.kind==="congelateur"||p.kind==="fruits"?"Chambre froide":"Réserve sèche")+" : "+a.boxes+"/5 cartons + "+a.reserve+" en vrac | "+a.price+" €");
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
  for(const p of unlockedProducts())state.inventory[p.id].shelf=shelfCapacity(p);
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
function closeCheckoutUI(){checkoutUI.style.display="none";}
let checkoutVisual=null;
function clearCheckoutVisual(){
 if(!checkoutVisual)return;
 for(const m of checkoutVisual.models){scene.remove(m);m.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
 checkoutVisual=null;
}
function renderCheckoutVisual(c){
 if(checkoutVisual?.customer===c&&checkoutVisual.scanned===c.scanned)return;
 clearCheckoutVisual();
 const ids=Object.entries(c.basket).flatMap(([id,q])=>Array(Math.max(0,q)).fill(id));
 const models=[];
 ids.slice(c.scanned,c.scanned+5).forEach((id,i)=>{
  const p=catalog.find(x=>x.id===id);if(!p)return;
  const m=productModel(p);m.scale.setScalar(.7);
  m.position.set(5.24+i*.23,1.28,6.44);
  m.userData.checkoutArticle=true;
  m.traverse(o=>{o.userData.checkoutArticle=true;});
  scene.add(m);models.push(m);
 });
 checkoutVisual={customer:c,scanned:c.scanned,models};
}
function scanCheckoutArticle(){
 const c=cashier;if(!c||c.phase!=="checkout")return;
 const count=Object.values(c.basket).reduce((n,q)=>n+q,0);
 if(c.scanned>=count)return;
 c.scanned++;
 renderCheckoutVisual(c);
 toast(c.scanned===count?"Tous les articles sont scannés":"Bip ! Article scanné");
 if(checkoutUI.style.display!=="none")showCheckout();
}
function showCheckout(){
 if(!cashier){closeCheckoutUI();clearCheckoutVisual();toast("Aucun client à encaisser");return;}
 if(!near(6.5,6.5,3.5)){toast("Approche-toi de la caisse");return;}
 panel.style.display="none";
 checkoutUI.replaceChildren();checkoutUI.style.display="block";
 const c=cashier,count=Object.values(c.basket).reduce((n,q)=>n+q,0);
 checkoutText("CAISSE FBA SUPERMARKET",true);
 if(!count){checkoutText("Panier vide");checkoutButton("Terminer",()=>finishCheckout(c));return;}
 renderCheckoutVisual(c);
 checkoutText("Articles : "+c.scanned+" / "+count);
 checkoutText("Total : "+euro(c.total),true);
 if(c.scanned<count){
  checkoutText("Touche un article sur le tapis pour le scanner.");
  checkoutButton("Scanner l'article suivant",scanCheckoutArticle);
 }else{
  checkoutText("Scan terminé — terminal bancaire prêt.");
  checkoutButton("Payer par carte",()=>showPayment(c,count));
 }
 checkoutButton("Fermer la fenêtre",closeCheckoutUI);
}
function completeCheckoutPayment(c,count){
 if(c!==cashier)return;
 state.money+=c.total;state.sales+=count;
 finance.revenue+=c.total;finance.transactions++;
 sync();finishCheckout(c);
 toast("Paiement accepté : +"+euro(c.total));
}
function showPayment(c,count){
 if(c!==cashier)return;
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
  checkoutUI.replaceChildren();checkoutUI.style.display="block";
  checkoutText("FBA — TERMINAL BANCAIRE",true);
  checkoutText("Total à encaisser : "+euro(c.total),true);
  if(!amountConfirmed){
   checkoutText("1. Saisis le montant en euros (ex. 30 = 30 €).");
   const amountDisplay=document.createElement("div");
   Object.assign(amountDisplay.style,{fontSize:"18px",fontWeight:"bold",margin:"9px 0"});
   checkoutUI.appendChild(amountDisplay);
   const grid=document.createElement("div");
   Object.assign(grid.style,{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:"5px"});
   checkoutUI.appendChild(grid);
   for(const digit of ["1","2","3","4","5","6","7","8","9","C","0","⌫"]){
    const b=document.createElement("button");b.textContent=digit;
    Object.assign(b.style,{minHeight:"40px",padding:"7px",fontSize:"19px",fontWeight:"bold",touchAction:"manipulation",background:"#334155",color:"#fff",border:"1px solid #64748b",borderRadius:"7px"});
    b.type="button";
    // Uniquement click : le navigateur déduplique les interactions tactiles.
    // Ne pas mélanger pointerup et click (double frappe sur certains Android).
    b.addEventListener("click",e=>{
     e.preventDefault();e.stopPropagation();
     entered=digit==="C"?"":digit==="⌫"?entered.slice(0,-1):(entered+digit).slice(0,7);
     updateAmount();
    });
    grid.appendChild(b);
   }
   const ok=checkoutButton("Valider le montant",()=>{if(Math.round(Number(entered)*100)!==expected){toast("Saisis le montant exact");return;}amountConfirmed=true;draw();});
   ok.disabled=Math.round(Number(entered)*100)!==expected;
   ok.style.opacity=Math.round(Number(entered)*100)===expected?"1":".45";
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
 closeCheckoutUI();clearCheckoutVisual();cashier=null;c.phase="leaving";c.waypoint=0;
 // Sortie par le couloir central : ne jamais couper à travers le comptoir.
 c.route=[{x:3.65,z:6.25},{x:3.1,z:8.6},{x:0,z:8.6},{x:0,z:12.5}];
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
let storeLightsOn=true,stockroomLightsOn=true,coldRoomLightsOn=true;
const ceilingLights=new THREE.Group();scene.add(ceilingLights);
function ceilingLamp(x,z){
 const lamp=new THREE.PointLight(0xfff4db,0,9,1.8);lamp.position.set(x,4.45,z);ceilingLights.add(lamp);return lamp;
}
const lamps=[];
for(const x of [-6,0,6])for(const z of [-6,0,6])lamps.push({light:ceilingLamp(x,z),extension:false});
for(const x of [-6,0,6])for(const z of [-14,-19])lamps.push({light:ceilingLamp(x,z),extension:true});
for(const x of [11.6,13.8])for(const z of [3.5,7.5,11.5,15])lamps.push({light:ceilingLamp(x,z),stockroom:true});
for(const x of [17.2,21.6])for(const z of [5,11,15])lamps.push({light:ceilingLamp(x,z),coldroom:true});
function updateLighting(){
 const hour=state.hour;
 const daylight=Math.max(.12,Math.min(1,(20-hour)/3.5));
 scene.background.setRGB(.055+.55*daylight,.09+.69*daylight,.17+.74*daylight);
 sun.intensity=.12+1.28*daylight;
 ambient.intensity=.25+1.95*daylight;
 for(const l of lamps)l.light.intensity=l.stockroom?(stockroomLightsOn?1.7:0):l.coldroom?(coldRoomLightsOn?1.8:0):(storeLightsOn&&(!l.extension||state.upgrades.store1)?1.35:0);
 if(typeof coldLightGlow!=="undefined")coldLightGlow.intensity=coldRoomLightsOn?1.8:0;
 if(typeof coldLight!=="undefined")coldLight.material.color.setHex(coldRoomLightsOn?0xf8fafc:0x64748b);
 if(typeof extendedColdLights!=="undefined")extendedColdLights.forEach(m=>m.material.color.setHex(coldRoomLightsOn?0xf8fafc:0x64748b));
}
const colliders=[];
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
cube(12.65,-.15,5.5,5.3,.3,8,0xb9c1c8);
cube(12.65,5.1,5.5,5.3,.2,8,0xf1f5f9);
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
cube(24,2.5,9.25,.3,5,15.5,0xcbd5e1,true);
cube(19.65,2.5,1.5,8.7,5,.3,0xcbd5e1,true);
cube(19.65,2.5,17,8.7,5,.3,0xcbd5e1,true);
// Extension de la chambre froide vers l'arrière et l'est.
cube(15.3,2.5,13.25,.3,5,7.5,0xdbeafe,true);
cube(19.65,-.15,13.25,8.7,.3,7.5,0x9ccbdc);
cube(19.65,5.1,13.25,8.7,.2,7.5,0xe0f2fe);
cube(22.7,-.15,5.5,2.6,.3,8,0x9ccbdc);
cube(22.7,5.1,5.5,2.6,.2,8,0xe0f2fe);
const extendedColdLights=[];
for(const x of [17.2,21.6])for(const z of [11,15])extendedColdLights.push(cube(x,4.87,z,2.0,.04,.55,0xf8fafc));
for(const x of [11.6,13.8])for(const z of [11.5,15])cube(x,4.87,z,1.5,.04,.5,0xfff7db);
for(const x of [16.6,22.5])for(const z of [11,14.8]){
 for(const y of [.65,1.7,2.75])cube(x,y,z,1.45,.09,1.5,0x94a3b8);
 for(const dx of [-.65,.65])for(const dz of [-.65,.65])cube(x+dx,1.6,z+dz,.07,3.2,.07,0x64748b);
}
// Sol antidérapant et plinthes sanitaires.
// Revêtement continu, posé légèrement au-dessus des anciens dallages pour supprimer les démarcations.
const coldFloor=cube(19.65,.055,9.25,8.65,.11,15.45,0xb7dce8);
cube(19.65,.14,1.75,8.4,.23,.08,0x64748b);
cube(19.65,.14,16.82,8.4,.23,.08,0x64748b);
// Plinthes sanitaires le long de la cloison, de part et d’autre de la porte froide.
cube(15.48,.14,2.9,.08,.23,2.6,0x64748b);
cube(15.48,.14,11.75,.08,.23,10.0,0x64748b);
cube(23.82,.14,9.25,.08,.23,15.0,0x64748b);
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
cube(12.65,-.15,12.8,5.3,.3,7.0,0xb9c1c8);
cube(12.65,5.1,12.8,5.3,.2,7.0,0xf1f5f9);
cube(10,2.5,12.8,.3,5,7,0xe2e8f0,true);
// Fond ouvert vers le sas de livraison.
cube(11,2.5,17.05,2.0,5,.3,0xe2e8f0,true);
cube(14.55,2.5,17.05,1.5,5,.3,0xe2e8f0,true);
cube(12.75,4.2,17.05,2.1,1.6,.3,0xe2e8f0);
// Rayonnages de réserve agrandie, de type magasin : 3 plateaux.
for(const x of [11.0,14.3])for(const z of [11.0,14.3]){
 for(const y of [.7,1.75,2.8])cube(x,y,z,.85,.09,1.4,0x94a3b8);
 for(const dx of [-.37,.37])for(const dz of [-.62,.62])cube(x+dx,1.65,z+dz,.06,3.3,.06,0x64748b);
}
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
 // Chaque étagère vide possède son propre repère.
 const sign=shelfSign("Rayon disponible");
 sign.position.set(0,2.65,0);rack.add(sign);
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
// Gondoles d'extension avec allées libres, uniquement visibles après achat.
for(const x of [-5,0,5])for(const z of [-19]){
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
 // Panneau pour distinguer les étagères encore sans catégorie attribuée.
 const availableSign=shelfSign("Rayon disponible");
 availableSign.position.set(0,2.65,0);rack.add(availableSign);
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
const entranceBrand=brandPanel("FBA SUPERMARKET","BUSINESS EMPIRE SIMULATOR",5.6,1.25);
// Face extérieure du mur d’entrée (z positif), texte orienté vers le visiteur.
entranceBrand.position.set(0,4.24,10.20);scene.add(entranceBrand);
// Enseigne au-dessus de l’entrée de la réserve, face au magasin.
const reserveBrand=brandPanel("ZONE STOCKAGE","RÉSERVE — PRODUITS SECS",2.9,.67);
reserveBrand.position.set(9.78,4.15,5.5);reserveBrand.rotation.y=-Math.PI/2;scene.add(reserveBrand);
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
 const c=document.createElement("canvas");c.width=512;c.height=512;
 const x=c.getContext("2d");
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
 }else if(p.id==="pommes"){
  add(new THREE.SphereGeometry(.18,12,10),base);
  add(new THREE.CylinderGeometry(.018,.025,.09,6),new THREE.MeshStandardMaterial({color:0x365314}),0,.18,0);
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
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=192;
  const ctx=canvas.getContext("2d");
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
const displays={},extraShelves=[];
let freezerLid=null,freezerOpen=false;
let fridgeDoor=null,fridgeOpen=false;
for(const p of catalog){
 displays[p.id]=[];
 if(p.kind==="extension")continue;
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
function addShelfGuide(p,x,z){
 const group=new THREE.Group();group.position.set(x,0,z);
 const sign=shelfSign(p.name);sign.position.set(0,2.72,0);group.add(sign);
 // Balise lumineuse sur toute la hauteur et la largeur du meuble, visible à travers les murs.
 const isCompact=!!p.level&&p.kind!=="extension"&&p.kind!=="froid"&&p.kind!=="congelateur";
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
  guide.group.visible=productAvailable(guide.p)&&(guide.p.kind!=="extension"||!!state.upgrades.store1);
  guide.highlight.visible=active;
  guide.sign.visible=guide.group.visible;
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

for(const p of catalog.filter(p=>p.kind!=="extension"))for(const z of (p.level?[p.z]:[-4,1]))addShelfGuide(p,p.x,z);
function refreshDisplays(){
 for(const p of catalog)displays[p.id].forEach((m,i)=>{
  const stock=state.inventory[p.id].shelf;
  // Les 30 articles du stock commun sont répartis entre les deux meubles de départ.
  const visible=p.level||p.kind==="extension"?i<stock:i<stock;
  m.visible=productAvailable(p)&&visible;
 });
 for(const e of extraShelves)e.group.visible=playerLevel()>=e.level;
 for(const p of catalog.filter(p=>p.kind==="extension")){const g=extensionProductGroups[p.id];if(g)g.visible=!!state.upgrades.store1;}
 updateShelfGuides();
}
cube(6.5,.55,6.5,3,1.1,1.3,0x475569,true);
cube(6.5,1.13,6.5,3.1,.12,1.4,0x1e293b);
// Écran et clavier côté employé (vers l'entrée, z positif), pas côté rayons.
cube(7.3,1.45,6.5,.6,.55,.2,0x0f172a);
const terminalScreen=cube(7.3,1.5,6.64,.48,.3,.045,0x22c55e);
terminalScreen.material.emissive=new THREE.Color(0x064e3b);
const terminalKeyboard=cube(7.3,1.22,6.86,.65,.035,.24,0x94a3b8);
// V0.9.50 — Équipements réalistes de la caisse, purement visuels.
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
cube(12.8,.1,5.5,3.5,.2,5.8,0x8b5e3c);
// Représentation 3D : jusqu'à 3 cartons par produit, plus un lot ouvert
const boxes={},reserveModels={};
const coldProduct=p=>p.kind==="froid"||p.kind==="congelateur"||p.kind==="fruits";
// Chaque produit froid occupe un module de rayonnage inox existant.
// Les cartons reposent sur les plateaux (y = .65, 1.70 et 2.75).
const coldSlots={
 fromage:{x:16.35,z:3.1},
 surgeles:{x:20.15,z:3.1},
 pommes:{x:16.35,z:7.8}
};
for(const [i,p] of catalog.entries()){
 boxes[p.id]=[];
 const cold=coldProduct(p);
 const slot=cold?coldSlots[p.id]:null;
 for(let j=0;j<MAX_BOXES_PER_PRODUCT;j++){
  const mesh=cube(cold?slot.x+(j%2===0?-.34:.34):11.3+(i%4)*.85+(j%2===0?-.18:.18),
   cold?[1.025,1.025,2.075,2.075,3.125][j]:.48+Math.floor(j/2)*.68,
   cold?slot.z:3.3+Math.floor(i/4)*1.55,
   cold?.56:.34,.65,.7,0xb98246);
  const band=new THREE.Mesh(new THREE.BoxGeometry(cold?.44:.26,.085,.025),new THREE.MeshStandardMaterial({color:p.color,roughness:.7}));
  band.position.set(0,.16,.363);mesh.add(band);
  boxes[p.id].push(mesh);
 }
 // Le lot ouvert est posé sur le quatrième module, pas sur le sol.
 const looseSlot=cold?{x:20.15,z:7.8}:null;
 reserveModels[p.id]=cube(cold?looseSlot.x+(Object.keys(coldSlots).indexOf(p.id)-1)*.43:11.3+(i%4)*.85,
  cold?1.05:.25,
  cold?looseSlot.z:4.1+Math.floor(i/4)*1.55,
  .42,.4,.45,p.color);
}
function refreshBoxes(){
 catalog.forEach(p=>{
  const a=state.inventory[p.id];
  boxes[p.id].forEach((m,i)=>m.visible=i<Math.min(MAX_BOXES_PER_PRODUCT,a.boxes));
  reserveModels[p.id].visible=a.reserve>0;
 });
}
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
 carryLabel.textContent=p?(held.source==="loose"?"Produits en vrac : ":held.source==="delivery"?"Livraison : ":"Carton : ")+p.name+" — "+held.quantity+" produit(s)":"";
 updateShelfGuides();
}
function near(x,z,r=2.5){return Math.hypot(camera.position.x-x,camera.position.z-z)<=r;}
function atReserve(){return camera.position.x>10.35&&camera.position.x<15.05&&camera.position.z>1.8&&camera.position.z<16.85;}
function atColdRoom(){return camera.position.x>15.55&&camera.position.x<23.75&&camera.position.z>1.8&&camera.position.z<16.8;}
function atStorageFor(p){return coldProduct(p)?atColdRoom():atReserve();}
function putBack(){
 if(!held)return;
 if(held.source==="delivery"&&held.quantity===BOX_UNITS){state.inventory[held.id].boxes++;}
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
   sync();showReserve();toast(amount+" × "+p.name+" jetés");
  });
  button(panel,"Annuler",showReserve);
 });
 button(panel,"Annuler",showReserve);
}
// Quai logistique : zone de réception et camion visibles côté arrière de la réserve.
const dockFloor=cube(12.65,.045,18.4,4.4,.09,4.7,0x64748b);
// Sol de raccordement continu entre réserve et quai, sans vide.
cube(12.65,-.15,16.9,5.3,.3,2.1,0xb9c1c8);
// Sas fermé : murs latéraux continus de la réserve jusqu’au quai, plafond et seuil.
cube(10.0,2.5,18.3,.3,5,3.0,0xe2e8f0,true);
cube(15.3,2.5,18.3,.3,5,3.0,0xe2e8f0,true);
cube(12.65,5.1,18.3,5.3,.2,3.0,0xf1f5f9);
// Retour de murs et habillage du seuil pour éviter les fentes entre bâtiment et quai.
cube(10.0,2.5,16.9,.3,5,.6,0xe2e8f0,true);
cube(15.3,2.5,16.9,.3,5,.6,0xe2e8f0,true);
cube(12.65,.12,17.12,1.8,.08,.65,0x64748b);
const dockMark=cube(12.65,.105,17.4,4.0,.018,.09,0xfacc15);
const deliveryTruck=new THREE.Group();scene.add(deliveryTruck);
const truckBody=cube(12.65,1.65,23.5,3.5,2.8,4.2,0xe2e8f0);
const truckCab=cube(12.65,1.15,26.1,3.2,2,1.3,0x2563eb);
const truckStripe=cube(12.65,2.45,25.61,2.5,.3,.05,0xfacc15);
const dockCartons=[];
for(let i=0;i<8;i++){
 const m=cube(11.55+(i%3)*1.05,.4+Math.floor(i/3)*.7,18.5,.72,.65,.72,0xb98246);
 dockCartons.push(m);
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
 if(!near(12.65,18.5,2.6)){toast("Approche-toi de la zone livraison");return;}
 openPanel("ZONE LIVRAISON — Déchargement");
 if(held){paragraph("Rends-toi dans la réserve correspondante pour ranger ton carton.");return;}
 if(!state.deliveryDock.length){paragraph("Aucun camion à décharger pour le moment.");return;}
 paragraph(state.deliveryDock.length+" carton(s) à ranger. Chaque carton contient 10 produits.");
 for(const p of catalog){
  const qty=state.deliveryDock.filter(it=>it.id===p.id).length;
  if(!qty)continue;
  button(panel,"Prendre 1 carton — "+p.name+" ("+qty+" restant(s))",()=>{
   const i=state.deliveryDock.findIndex(it=>it.id===p.id);
   if(i<0||held)return;
   state.deliveryDock.splice(i,1);held={id:p.id,quantity:BOX_UNITS,source:"delivery"};
   sync();refreshDeliveryDock();refreshCarry();panel.style.display="none";
   toast("Carton de "+p.name+" : range-le dans "+(coldProduct(p)?"la chambre froide":"la réserve sèche"));
  });
 }
}
refreshDeliveryDock();
function showReserve(){
 if(!atReserve()&&!atColdRoom()){toast("Approche-toi de la réserve ou de la chambre froide");return;}
 openPanel(atColdRoom()?"Chambre froide — produits frais et surgelés":"Réserve — produits secs");
 if(held){
  const p=catalog.find(p=>p.id===held.id);
  paragraph("Tu portes "+held.quantity+" × "+p.name+(held.source==="loose"?" (en vrac)":" (carton)"));
  button(panel,held.source==="loose"?"Reposer les produits en vrac":held.source==="delivery"?"Ranger le carton livré":"Reposer le carton",putBack);
  return;
 }
 for(const p of unlockedProducts().filter(p=>coldProduct(p)===atColdRoom())){
  const a=state.inventory[p.id];
  paragraph("● "+p.name+" — "+stockAlert(p)+" | Cartons : "+a.boxes+"/5 ("+(a.boxes*BOX_UNITS)+" unités) | Espace vrac : "+a.reserve+" unités | Total réserve : "+(a.reserve+a.boxes*BOX_UNITS));
  if(a.boxes>0)button(panel,"Prendre un carton de "+p.name+" (10)",()=>takeCarton(p,10,"box"));
  if(a.reserve>0)button(panel,"PRENDRE EN VRAC — "+p.name+" ("+Math.min(10,a.reserve)+")",()=>takeCarton(p,10,"loose"));
  if(a.boxes>0||a.reserve>0)button(panel,"Jeter des "+p.name,()=>showDisposal(p));
 }
}
function interact(){
 if(held){
  const p=catalog.find(p=>p.id===held.id);
  if(productAvailable(p)&&(p.level?near(p.x,p.z,2.2):(near(p.x,1,3.2)||near(p.x,-4,3.2)))){
   const a=state.inventory[p.id],space=Math.max(0,shelfCapacity(p)-a.shelf);
   if(!space){toast("Rayons "+p.name+" pleins");return;}
   const placed=Math.min(space,held.quantity);
   a.shelf+=placed;held.quantity-=placed;
   if(held.quantity===0)held=null;
   sync();refreshCarry();
   toast(placed+" × "+p.name+" placés"+(held?" — "+held.quantity+" restants":""));
   return;
  }
  if(atReserve()||atColdRoom()){if(!atStorageFor(p)){toast("Ce carton appartient à "+(coldProduct(p)?"la chambre froide":"la réserve sèche"));return;}showReserve();return;}
  toast("Suis le rayon "+p.name+" surligné en bleu puis appuie sur Interagir");
  return;
 }
 if(near(12.65,18.5,2.6)){showDeliveryDock();return;}
 if(near(15.0,7.35,1.15)&&camera.position.x<15.3&&camera.position.x>13.7){toggleColdRoomLights();return;}
 if(near(10.2,7.8,1.45)&&camera.position.x>10.2){toggleStockroomLights();return;}
 if(atReserve()||atColdRoom()){showReserve();return;}
 if(fridgeDoor&&playerLevel()>=4&&near(-8.5,-3.5,2.4)){
  fridgeOpen=!fridgeOpen;fridgeDoor.rotation.y=fridgeOpen?-1.15:0;
  toast(fridgeOpen?"Réfrigérateur ouvert":"Réfrigérateur fermé");return;
 }
 if(freezerLid&&playerLevel()>=4&&near(8.5,-3.5,3.1)){
  freezerOpen=!freezerOpen;freezerLid.rotation.z=freezerOpen?-.95:0;
  toast(freezerOpen?"Congélateur ouvert":"Congélateur fermé");return;
 }
 if(near(8.08,6.93,1.15)){toggleLights();return;}
 if(near(7.3,6.5,3.4)){if(cashier)showCheckout();else showComputer();return;}
 toast("Approche-toi de la réserve, de la chambre froide ou de la caisse");
}
refreshCarry();
// Commandes de déplacement et caméra lissée
let yaw=0,pitch=0,targetYaw=0,targetPitch=0,lookPointer=null,lastX=0,lastY=0;
const keys={forward:false,backward:false,left:false,right:false};
const canvas=renderer.domElement;canvas.style.touchAction="none";
// Un toucher sur un article 3D déclenche directement son scan.
const checkoutRaycaster=new THREE.Raycaster();
canvas.addEventListener("pointerup",e=>{
 if(!cashier||!checkoutVisual?.models.length||!near(6.5,6.5,3.5))return;
 const rect=canvas.getBoundingClientRect();
 const pointer=new THREE.Vector2(((e.clientX-rect.left)/rect.width)*2-1,-((e.clientY-rect.top)/rect.height)*2+1);
 checkoutRaycaster.setFromCamera(pointer,camera);
 const hits=checkoutRaycaster.intersectObjects(checkoutVisual.models,true);
 if(hits.length&&hits[0].object.userData.checkoutArticle)scanCheckoutArticle();
});
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
 // Plan : vente, réserve sèche agrandie, chambre froide et quai arrière.
 if(x< -9.45+r||z<(state.upgrades.store1?-21.45:-9.45)+r)return true;
 const shop=x<=9.45&&z<=9.45;
 const reserve=x>10.35&&x<15.05&&z>1.8&&z<16.85;
 const cold=x>15.55&&x<23.75&&z>1.8&&z<16.8;
 const dock=x>10.45&&x<14.85&&z>=16.65&&z<20.75;
 const entrance=Math.abs(x)<2.15&&z>9.0&&z<13.45;
 const reserveDoor=x>=9.45-r&&x<=10.55+r&&z>4.05+r&&z<6.95-r;
 const coldDoor=x>=15.0-r&&x<=15.6+r&&z>4.25+r&&z<6.65-r;
 const dockDoor=x>11.8&&x<13.7&&z>16.6&&z<17.4;
 if(!(shop||reserve||cold||dock||entrance||reserveDoor||coldDoor||dockDoor))return true;
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
function updateTime(){
 updateLighting();
 $("day").textContent=state.day;
 $("hour").textContent=formatHour(state.hour);
 $("shopStatus").textContent=shopOpen?"OUVERT":"FERMÉ";
 $("shopStatus").style.color=shopOpen?"#4ade80":"#fca5a5";
}
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
 // Accès caisse depuis l’allée centrale, sans diagonale à travers le meuble.
 route.push({x:3.65,z:6.25});
 customers.push({group,route,waypoint:0,phase:"shopping",timer:0,basket:{},prices:{},total:0,scanned:0,speed:1.2+Math.random()*.35,l,r,walkTime:0,paymentMethod:Math.random()<.7?"cash":"card",stuckTime:0,shoppingTime:0,lastNavX:0,lastNavZ:12.5});
}
// Zone réservée au personnel derrière la caisse : interdite aux clients.
// Le joueur conserve son accès à l'ordinateur et au poste de travail.
function customerBlocked(x,z,r=.28){
 if(blocked(x,z,r))return true;
 return x+r>4.7&&x-r<9.45&&z+r>7.25&&z-r<9.95;
}
// Navigation A* sur grille invisible : évite les collisions avec les rayons et la caisse.
const NAV_STEP=.35,NAV_MIN_X=-9.1,NAV_MIN_Z=-21.1,NAV_W=69,NAV_H=99;
function navNode(x,z){
 return {i:Math.max(0,Math.min(NAV_W-1,Math.round((x-NAV_MIN_X)/NAV_STEP))),
 j:Math.max(0,Math.min(NAV_H-1,Math.round((z-NAV_MIN_Z)/NAV_STEP)))};
}
function navPoint(i,j){return {x:NAV_MIN_X+i*NAV_STEP,z:NAV_MIN_Z+j*NAV_STEP};}
function navPath(from,to){
 const start=navNode(from.x,from.z),goal=navNode(to.x,to.z);
 const free=(i,j)=>i>=0&&j>=0&&i<NAV_W&&j<NAV_H&&!customerBlocked(NAV_MIN_X+i*NAV_STEP,NAV_MIN_Z+j*NAV_STEP,.28);
 const nearest=n=>{
  if(free(n.i,n.j))return n;
  for(let radius=1;radius<=12;radius++){
   let best=null,dist=Infinity;
   for(let di=-radius;di<=radius;di++)for(let dj=-radius;dj<=radius;dj++){
    if(Math.max(Math.abs(di),Math.abs(dj))!==radius||!free(n.i+di,n.j+dj))continue;
    const d=di*di+dj*dj;if(d<dist){dist=d;best={i:n.i+di,j:n.j+dj};}
   }
   if(best)return best;
  }
  return null;
 };
 const a=nearest(start),b=nearest(goal);if(!a||!b)return [];
 const key=(i,j)=>i+","+j,goalKey=key(b.i,b.j);
 const open=[{i:a.i,j:a.j,g:0,f:Math.hypot(b.i-a.i,b.j-a.j)}];
 const best=new Map([[key(a.i,a.j),0]]),parents=new Map(),closed=new Set();
 while(open.length){
  let index=0;for(let k=1;k<open.length;k++)if(open[k].f<open[index].f)index=k;
  const n=open.splice(index,1)[0],nk=key(n.i,n.j);
  if(closed.has(nk))continue;
  if(nk===goalKey){
   const path=[];let cursor=nk;
   while(cursor&&cursor!==key(a.i,a.j)){
    const [i,j]=cursor.split(",").map(Number);path.push(navPoint(i,j));cursor=parents.get(cursor);
   }
   path.reverse();
   if(!customerBlocked(to.x,to.z,.28))path.push({x:to.x,z:to.z});
   return path;
  }
  closed.add(nk);
  for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const i=n.i+di,j=n.j+dj,k=key(i,j);
   if(!free(i,j)||closed.has(k))continue;
   const g=n.g+1;if(g>=(best.get(k)??Infinity))continue;
   best.set(k,g);parents.set(k,nk);
   open.push({i,j,g,f:g+Math.hypot(b.i-i,b.j-j)});
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
 while(c.navIndex<route.length&&Math.hypot(route[c.navIndex].x-p.x,route[c.navIndex].z-p.z)<.18)c.navIndex++;
 if(c.navIndex>=route.length){
  c.navTarget=null;c.navRoute=null;
  return Math.hypot(p.x-t.x,p.z-t.z)<.4;
 }
 const w=route[c.navIndex],dx=w.x-p.x,dz=w.z-p.z,dist=Math.hypot(dx,dz);
 const step=Math.min(c.speed*dt,dist),nx=p.x+dx/dist*step,nz=p.z+dz/dist*step;
 if(customerBlocked(nx,nz,.25)){
  c.stuckTime=(c.stuckTime||0)+dt;
  if(c.stuckTime>.35){c.navTarget=null;c.navRoute=null;c.stuckTime=0;}
  return false;
 }
 p.x=nx;p.z=nz;c.stuckTime=0;
 c.group.rotation.y=Math.atan2(-dx,-dz);
 c.walkTime+=dt*9;c.l.rotation.x=Math.sin(c.walkTime)*.4;c.r.rotation.x=-Math.sin(c.walkTime)*.4;
 return false;
}
function removeCustomer(c){
 scene.remove(c.group);
 c.group.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose();});
 const i=customers.indexOf(c);if(i!==-1)customers.splice(i,1);
}
// La file est un état indépendant : personne ne contourne la caisse côté personnel.
const CHECKOUT_SPOT={x:3.65,z:6.25};
function queueSpot(i){return {x:3.65,z:6.25-Math.min(i,4)*.65};}
function sendToQueue(c){
 if(c.phase==="queue"||c.phase==="checkout")return;
 c.phase="queue";c.queueStall=0;c.navTarget=null;c.navRoute=null;
 if(!queue.includes(c))queue.push(c);
}
function sendToExit(c){
 const index=queue.indexOf(c);if(index>=0)queue.splice(index,1);
 c.phase="leaving";c.waypoint=0;c.navTarget=null;c.navRoute=null;c.stuckTime=0;
 c.route=[{x:3.65,z:6.25},{x:3.1,z:8.5},{x:0,z:8.5},{x:0,z:12.5}];
}
function updateCustomers(dt){
 for(const c of [...customers]){
  if(c.phase==="shopping"){
   c.shoppingTime=(c.shoppingTime||0)+dt;
   if(c.shoppingTime>42){sendToQueue(c);continue;}
   const t=c.route[c.waypoint];
   if(!t){sendToQueue(c);continue;}
   const beforeX=c.group.position.x,beforeZ=c.group.position.z;
   const arrived=walk(c,t,dt);
   const moved=Math.hypot(c.group.position.x-beforeX,c.group.position.z-beforeZ)>.003;
   c.shoppingStall=moved?0:(c.shoppingStall||0)+dt;
   if(arrived||c.shoppingStall>6){
    c.shoppingStall=0;c.waypoint++;c.navTarget=null;c.navRoute=null;
    if(arrived&&t.shop){c.phase="choosing";c.timer=1.5;c.productId=t.shop;}
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
     }
    }
    c.phase="shopping";
   }
  }else if(c.phase==="queue"){
   const i=queue.indexOf(c);
   if(i<0){sendToExit(c);continue;}
   const target=queueSpot(i),p=c.group.position;
   const beforeX=p.x,beforeZ=p.z;
   const arrived=walk(c,target,dt);
   const moved=Math.hypot(p.x-beforeX,p.z-beforeZ)>.003;
   c.queueStall=moved?0:(c.queueStall||0)+dt;
   if(i===0&&!cashier&&(arrived||Math.hypot(p.x-target.x,p.z-target.z)<.45)){
    queue.shift();cashier=c;c.phase="checkout";c.scanned=0;c.queueStall=0;
    c.navTarget=null;c.navRoute=null;
    toast("Client en caisse : utilise Interagir");
   }else if(c.queueStall>5){
    c.queueStall=0;c.navTarget=null;c.navRoute=null;
    // Déblocage local sans passage derrière le comptoir.
    if(i===0&&!cashier&&!customerBlocked(CHECKOUT_SPOT.x,CHECKOUT_SPOT.z,.3)){
     p.set(CHECKOUT_SPOT.x,0,CHECKOUT_SPOT.z);
     queue.shift();cashier=c;c.phase="checkout";c.scanned=0;
     toast("Client arrivé à la caisse");
    }else if(i>0){
     // Les suivants attendent leur tour sans tenter de traverser les obstacles.
     c.l.rotation.x=c.r.rotation.x=0;
    }else sendToExit(c);
   }
  }else if(c.phase==="checkout"){
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
sync();updateOpen();animate();toast("Business Empire Simulator V0.9.50 !");
