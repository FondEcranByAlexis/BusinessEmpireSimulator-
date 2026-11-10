import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js";
// Business Empire Simulator V0.4 — marchandises et rayons
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
 return {money:5000,day:1,sales:0,inventory};
}
function load(){
 const s=initial();
 try{
  const current=JSON.parse(localStorage.getItem(SAVE));
  if(current?.inventory){
   for(const k of ["money","day","sales"])if(Number.isFinite(current[k])&&current[k]>=0)s[k]=current[k];
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
  state.money-=cost;state.inventory[p.id].boxes++;
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
button(actions,"Interagir",interact).style.background="#15803d";
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
const boxes={};
catalog.forEach((p,i)=>boxes[p.id]=cube(-8.3+i*.8,.55,6.5,.65,.65,.65,0xb98246));
function refreshBoxes(){catalog.forEach(p=>boxes[p.id].visible=state.inventory[p.id].boxes>0);}
const signCanvas=document.createElement("canvas");signCanvas.width=512;signCanvas.height=128;
const ctx=signCanvas.getContext("2d");ctx.fillStyle="#0f172a";ctx.fillRect(0,0,512,128);
ctx.fillStyle="#38bdf8";ctx.font="bold 34px Arial";ctx.textAlign="center";ctx.fillText("BUSINESS EMPIRE",256,78);
const sign=new THREE.Mesh(new THREE.PlaneGeometry(5,1.25),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(signCanvas),side:THREE.DoubleSide}));
sign.position.set(0,3.5,-9.8);scene.add(sign);
function sync(){hud();refreshDisplays();refreshBoxes();save();}
// Interactions physiques simplifiées
let held=null;
function near(x,z,r=2.5){return Math.hypot(camera.position.x-x,camera.position.z-z)<=r;}
function interact(){
 if(held){
  const p=catalog.find(p=>p.id===held);
  if(p&&(near(p.x,1)||near(p.x,-4))){
   const a=state.inventory[p.id];
   if(a.shelf>=CAPACITY){toast("Rayons pleins");return;}
   a.shelf++;held=null;sync();toast("Produit placé : "+p.name);return;
  }
  if(near(-7.5,6.5,3)){state.inventory[held].reserve++;held=null;sync();toast("Produit remis en réserve");return;}
  toast("Approche-toi du rayon "+p.name);return;
 }
 if(!near(-7.5,6.5,3)){toast("Approche-toi de la réserve");return;}
 const box=catalog.find(p=>state.inventory[p.id].boxes>0);
 if(box){
  state.inventory[box.id].boxes--;state.inventory[box.id].reserve+=BOX_UNITS;
  sync();toast("Carton ouvert : 10 "+box.name);return;
 }
 const p=catalog.find(p=>state.inventory[p.id].reserve>0);
 if(!p){toast("Réserve vide");return;}
 state.inventory[p.id].reserve--;held=p.id;sync();toast(p.name+" en main — va au rayon");
}
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
// Clients : sélection de produit et paiement après passage en caisse
const customers=[],queue=[];let cashier=null,shopOpen=false,spawnTimer=0,dayTimer=0;
const MAX_CUSTOMERS=5;
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
 const p=catalog[Math.floor(Math.random()*catalog.length)];
 const aisleX=p.x===5?2.5:p.x-2.5;
 const route=[
  {x:0,z:8},{x:aisleX,z:8},{x:aisleX,z:3.2},
  {x:aisleX,z:-1.5,shop:true},{x:aisleX,z:-6.5},
  {x:8.3,z:-6.5},{x:8.3,z:4.5},{x:5.2,z:4.5}
 ];
 customers.push({group,route,waypoint:0,phase:"shopping",timer:0,productId:p.id,items:0,speed:1.2+Math.random()*.35,l,r,walkTime:0});
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
   if(walk(c,t,dt)){
    c.waypoint++;
    if(t.shop){c.phase="choosing";c.timer=2;}
    else if(c.waypoint>=c.route.length){c.phase="queue";queue.push(c);}
   }
  }else if(c.phase==="choosing"){
   c.timer-=dt;
   if(c.timer<=0){
    const a=state.inventory[c.productId];
    if(a.shelf>0){a.shelf--;c.items++;sync();}
    c.phase="shopping";
   }
  }else if(c.phase==="queue"){
   const i=queue.indexOf(c);
   if(i===0&&!cashier){queue.shift();cashier=c;c.phase="checkout";c.timer=3;}
   else walk(c,{x:5.2-Math.max(0,i)*.9,z:4.5},dt);
  }else if(c.phase==="checkout"){
   if(!walk(c,{x:5.2,z:4.5},dt))continue;
   c.timer-=dt;
   if(c.timer<=0){
    const amount=c.items*state.inventory[c.productId].price;
    state.money+=amount;state.sales+=c.items;sync();
    toast(c.items?"Paiement reçu : +"+amount+" €":"Client reparti sans achat");
    cashier=null;c.phase="leaving";c.waypoint=0;
    c.route=[{x:5.2,z:8},{x:0,z:8},{x:0,z:12.5}];
   }
  }else if(c.phase==="leaving"){
   if(walk(c,c.route[c.waypoint],dt)){
    c.waypoint++;if(c.waypoint>=c.route.length)removeCustomer(c);
   }
  }
 }
}
const openButton=$("openShop");
function updateOpen(){openButton.textContent=shopOpen?"Fermer le magasin":"Ouvrir le magasin";}
openButton.addEventListener("click",()=>{
 shopOpen=!shopOpen;updateOpen();
 if(shopOpen){spawnTimer=1;toast("Magasin ouvert");}
 else toast("Fermé aux nouveaux clients");
});
function business(dt){
 if(!shopOpen)return;
 dayTimer+=dt;spawnTimer-=dt;
 if(spawnTimer<=0&&customers.length<MAX_CUSTOMERS){makeCustomer();spawnTimer=7+Math.random()*5;}
 if(dayTimer>=180){dayTimer-=180;state.day++;sync();toast("Jour "+state.day);}
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
sync();updateOpen();animate();toast("Business Empire Simulator V0.4 !");
