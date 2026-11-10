import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";
// Business Empire Simulator V0.5 — caisse manuelle, paniers, finances et horaires
const $=id=>document.getElementById(id);
const SAVE="business-empire-v04", LEGACY="business-empire-v02";
const catalog=[
 {id:"eau",name:"Eau",cost:2,price:4,color:0x38bdf8,x:-5},
 {id:"pates",name:"Pâtes",cost:3,price:6,color:0xfacc15,x:0},
 {id:"savon",name:"Savon",cost:5,price:10,color:0x4ade80,x:5}
];
const CAPACITY=30, BOX_UNITS=10;
function initial(){
 const inventory={};
 catalog.forEach(p=>inventory[p.id]={shelf:10,reserve:0,boxes:0,price:p.price});
 return {money:5000,day:1,sales:0,inventory,finance:{revenue:0,supplies:0,charges:0,transactions:0},hour:8};
}
function load(){
 const s=initial();
 try{
  const current=JSON.parse(localStorage.getItem(SAVE));
  if(current?.inventory){
   for(const k of ["money","day","sales"])if(Number.isFinite(current[k])&&current[k]>=0)s[k]=current[k];
   if(current.finance)for(const k of Object.keys(s.finance))if(Number.isFinite(current.finance[k])&&current.finance[k]>=0)s.finance[k]=current.finance[k];
   if(Number.isFinite(current.hour))s.hour=Math.min(22,Math.max(8,current.hour));
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
 catalog.forEach(p=>button(panel,p.name+" : "+(p.cost*10)+" €",()=>{
  const cost=p.cost*10;
  if(state.money<cost){toast("Trésorerie insuffisante");return;}
  state.money-=cost;finance.supplies+=cost;state.inventory[p.id].boxes++;
  sync();showOrders();toast("Carton livré : "+p.name);
 }));
}
function showStocks(){
 openPanel("Stocks");
 catalog.forEach(p=>{
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
button(actions,"Stocks",showStocks);
button(actions,"Prix",showPrices);
button(actions,"Réserve",showReserve);
button(actions,"Bilan",showFinance);
button(actions,"Caisse",showCheckout);
button(actions,"Interagir",interact).style.background="#15803d";

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
cube(10,2.5,0,.3,5,20,0xe2e8f0,true);
cube(0,2.5,-10,20,5,.3,0xe2e8f0,true);
cube(-6,2.5,10,8,5,.3,0xe2e8f0,true);
cube(6,2.5,10,8,5,.3,0xe2e8f0,true);
cube(0,4.2,10,4,1.6,.3,0xe2e8f0);
cube(0,-.17,12,8,.3,5,0x94a3b8);
cube(0,.015,8.5,3,.03,2,0x334155);
for(const x of [-6,0,6])for(const z of [-6,0,6])cube(x,4.94,z,2.8,.05,.5,0xffffff);
const displays={};
for(const p of catalog){
 displays[p.id]=[];
 for(const z of [-4,1]){
  const metal=new THREE.MeshStandardMaterial({color:0x64748b,metalness:.3});
  const mat=new THREE.MeshStandardMaterial({color:p.color});
  const group=new THREE.Group();group.position.set(p.x,0,z);
  for(const x of [-1.15,1.15])for(const dz of [-.4,.4]){
   const post=new THREE.Mesh(new THREE.BoxGeometry(.08,2.4,.08),metal);
   post.position.set(x,1.2,dz);group.add(post);
  }
  for(let level=0;level<3;level++){
   const y=.45+level*.75;
   const plank=new THREE.Mesh(new THREE.BoxGeometry(2.4,.1,1),metal);plank.position.y=y;group.add(plank);
   for(let i=0;i<5;i++){
    const item=new THREE.Mesh(new THREE.BoxGeometry(.3,.4,.45),mat);
    item.position.set(-.9+i*.45,y+.25,0);group.add(item);displays[p.id].push(item);
   }
  }
  scene.add(group);
  colliders.push({minX:p.x-1.3,maxX:p.x+1.3,minZ:z-.65,maxZ:z+.65});
 }
}
function refreshDisplays(){
 for(const p of catalog)displays[p.id].forEach((m,i)=>m.visible=i<state.inventory[p.id].shelf);
}
cube(6.5,.55,6.5,3,1.1,1.3,0x475569,true);
cube(6.5,1.13,6.5,3.1,.12,1.4,0x1e293b);
cube(7.3,1.45,6.5,.6,.55,.2,0x0f172a);
cube(7.3,1.5,6.37,.48,.3,.05,0x38bdf8);
cube(-7.5,.1,6.5,3,.2,2.5,0x8b5e3c);
// Représentation 3D : jusqu'à 3 cartons par produit, plus un lot ouvert
const boxes={},reserveModels={};
for(const [i,p] of catalog.entries()){
 boxes[p.id]=[];
 for(let j=0;j<3;j++){
  const mesh=cube(-8.5+i*.9,.48+j*.68,6.5,.7,.65,.7,0xb98246);
  const band=new THREE.Mesh(new THREE.BoxGeometry(.72,.13,.72),new THREE.MeshStandardMaterial({color:p.color}));
  band.position.y=.18;mesh.add(band);
  boxes[p.id].push(mesh);
 }
 reserveModels[p.id]=cube(-8.5+i*.9,.25,7.4,.55,.4,.45,p.color);
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
function sync(){hud();refreshDisplays();refreshBoxes();save();}
// V0.4.2 — transport de cartons entiers, remplissage en lot
// held = {id, quantity}. Une unité d'ancienne réserve peut être regroupée en lot.
let held=null;
const carryLabel=document.createElement("div");
Object.assign(carryLabel.style,{
 position:"fixed",left:"50%",bottom:"100px",transform:"translateX(-50%)",
 zIndex:"13",padding:"8px 12px",borderRadius:"9px",background:"#0f172ae8",
 border:"1px solid #38bdf8",color:"white",fontSize:"12px",fontWeight:"bold",
 pointerEvents:"none",maxWidth:"65vw",textAlign:"center"
});
document.body.appendChild(carryLabel);
function refreshCarry(){
 const p=held&&catalog.find(p=>p.id===held.id);
 carryLabel.textContent=p?"Carton : "+p.name+" ("+held.quantity+" produit(s))":"Mains libres";
}
function near(x,z,r=2.5){return Math.hypot(camera.position.x-x,camera.position.z-z)<=r;}
function atReserve(){return near(-7.5,6.5,3.3);}
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
 for(const p of catalog){
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
  if(near(p.x,1,3.2)||near(p.x,-4,3.2)){
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
 if(atReserve()){showReserve();return;}
 toast("Va à la réserve pour prendre un carton");
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
for(const k of Object.keys(keys)){
 const b=$(k);
 b.addEventListener("pointerdown",e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[k]=true;});
 for(const type of ["pointerup","pointercancel","lostpointercapture"])b.addEventListener(type,()=>keys[k]=false);
}
const keyMap={KeyW:"forward",KeyZ:"forward",ArrowUp:"forward",KeyS:"backward",ArrowDown:"backward",KeyA:"left",KeyQ:"left",ArrowLeft:"left",KeyD:"right",ArrowRight:"right"};
document.addEventListener("keydown",e=>{if(keyMap[e.code]){keys[keyMap[e.code]]=true;e.preventDefault();}});
document.addEventListener("keyup",e=>{if(keyMap[e.code])keys[keyMap[e.code]]=false;});
window.addEventListener("blur",()=>{Object.keys(keys).forEach(k=>keys[k]=false);lookPointer=null;});
function blocked(x,z,r=.4){
 if(x< -9.45+r||x>9.45-r||z< -9.45+r||z>13.8-r)return true;
 return colliders.some(c=>x+r>c.minX&&x-r<c.maxX&&z+r>c.minZ&&z-r<c.maxZ);
}
function movePlayer(dt){
 if(panel.style.display!=="none")return;
 const f=Number(keys.forward)-Number(keys.backward),s=Number(keys.right)-Number(keys.left);
 if(!f&&!s)return;
 const len=Math.hypot(f,s),speed=3.3*dt;
 const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)/len*speed;
 const dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)/len*speed;
 if(!blocked(camera.position.x+dx,camera.position.z))camera.position.x+=dx;
 if(!blocked(camera.position.x,camera.position.z+dz))camera.position.z+=dz;
}
// V0.5 — panier multi-produits, caisse manuelle et horaires 08h-20h
const customers=[],queue=[];let cashier=null,shopOpen=false,spawnTimer=0,dayTimer=0;
const MAX_CUSTOMERS=5,DAY_SECONDS=180,OPEN_HOUR=8,CLOSE_HOUR=20;
const timeLabel=document.createElement("div");
Object.assign(timeLabel.style,{position:"fixed",top:"80px",left:"12px",zIndex:"11",padding:"6px 10px",background:"#0f172acb",borderRadius:"8px",color:"white",fontSize:"12px",pointerEvents:"none"});
document.body.appendChild(timeLabel);
function updateTime(){timeLabel.textContent="Jour "+state.day+" — "+formatHour(state.hour)+" — "+(shopOpen?"OUVERT":"FERMÉ");}
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
 const choices=[...catalog].sort(()=>Math.random()-.5).slice(0,1+Math.floor(Math.random()*catalog.length));
 const route=[{x:0,z:8}];
 for(const p of choices){
  const aisleX=p.x===5?2.5:p.x-2.5;
  route.push({x:aisleX,z:8},{x:aisleX,z:3.2},{x:aisleX,z:-1.5,shop:p.id},{x:aisleX,z:-6.5},{x:8.3,z:-6.5},{x:8.3,z:8});
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
    toast("Client en caisse : utilise le bouton Caisse");
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
function updateOpen(){openButton.textContent=shopOpen?"Fermer le magasin":"Ouvrir le magasin";updateTime();}
openButton.addEventListener("click",()=>{
 if(shopOpen){shopOpen=false;updateOpen();toast("Fermé aux nouveaux clients");return;}
 if(state.hour>=CLOSE_HOUR){toast("Journée terminée : attends le lendemain");return;}
 shopOpen=true;spawnTimer=1;updateOpen();toast("Magasin ouvert");
});
function business(dt){
 // Horloge continue pendant la journée, même si le magasin est fermé.
 dayTimer+=dt;
 state.hour=OPEN_HOUR+Math.min(dayTimer/DAY_SECONDS,1)*(CLOSE_HOUR-OPEN_HOUR);
 if(shopOpen){
  spawnTimer-=dt;
  if(spawnTimer<=0&&customers.length<MAX_CUSTOMERS){
   makeCustomer();spawnTimer=7+Math.random()*5;
  }
 }
 if(dayTimer>=DAY_SECONDS){
  dayTimer=0;state.hour=OPEN_HOUR;state.day++;
  state.money-=DAILY_CHARGES;finance.charges+=DAILY_CHARGES;
  shopOpen=false;updateOpen();sync();
  toast("Jour "+state.day+" : charges "+euro(DAILY_CHARGES));
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
 movePlayer(dt);business(dt);updateCustomers(dt);renderer.render(scene,camera);
}
sync();updateOpen();animate();toast("Business Empire Simulator V0.5 !");
