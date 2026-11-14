// FBA Livraisons V0.15.05 — missions locales, véhicule, sauvegarde et récompenses.
import {makeDeliveryVan} from "./delivery-van.js?v=0.15.05";
import {cityBuildingsForBlock} from "./city.js?v=0.15.05";
export function installHomeDeliveries(o){
 const {THREE,scene,state,camera,playerLevel,blocked,notify,save,sync,checkLevelUp,openPanel,paragraph,button,panel,getControls,setHeading,clearLook,resetFloor}=o;
 const PRICE=1800,DEPOT={x:-24,z:40};
 const van=makeDeliveryVan({THREE,scene});van.setPosition(DEPOT.x,DEPOT.z,Math.PI);
 let driving=false,heading=Math.PI,speed=0;
 state.homeDelivery??={completed:0,active:null};
 // Place réservée aux livraisons : peinture au sol et panneau près du fourgon.
 // Elle est attachée à la scène du supermarché, sans collision bloquante.
 const bay=new THREE.Group();bay.name="Emplacement réservé — FBA Livraisons";scene.add(bay);
 const paint=new THREE.MeshBasicMaterial({color:0x38bdf8,depthWrite:false,side:THREE.DoubleSide});
 const ground=new THREE.MeshBasicMaterial({color:0x075985,transparent:true,opacity:.7,depthWrite:false});
 const metal=new THREE.MeshStandardMaterial({color:0x64748b,roughness:.7});
 const mark=(x,z,w,d,mat,y=.075)=>{
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
  m.rotation.x=-Math.PI/2;m.position.set(x,y,z);bay.add(m);return m;
 };
 mark(DEPOT.x,DEPOT.z,4.3,7.5,ground,.047);
 for(const offset of [-2.15,2.15])mark(DEPOT.x+offset,DEPOT.z,.13,7.5,paint,.087);
 for(const offset of [-3.75,3.75])mark(DEPOT.x,DEPOT.z+offset,4.3,.13,paint,.087);
 // Panneau à l'extérieur de la place, pour ne pas barrer l'accès au fourgon.
 const pole=new THREE.Mesh(new THREE.BoxGeometry(.10,2.8,.10),metal);
 pole.position.set(DEPOT.x-3.05,1.4,DEPOT.z);bay.add(pole);
 const signCanvas=document.createElement("canvas");signCanvas.width=512;signCanvas.height=256;
 const ctx=signCanvas.getContext("2d");
 ctx.fillStyle="#075985";ctx.fillRect(0,0,512,256);
 ctx.strokeStyle="#e0f2fe";ctx.lineWidth=12;ctx.strokeRect(8,8,496,240);
 ctx.fillStyle="#ffffff";ctx.textAlign="center";ctx.font="bold 60px system-ui";ctx.fillText("FBA LIVRAISONS",256,107);
 ctx.font="bold 43px system-ui";ctx.fillText("PLACE RÉSERVÉE",256,174);
 const texture=new THREE.CanvasTexture(signCanvas);texture.colorSpace=THREE.SRGBColorSpace;
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.5,1.25),
  new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
 sign.position.set(DEPOT.x-3.05,2.58,DEPOT.z);bay.add(sign);
 const actionButton=document.createElement("button");
 actionButton.id="fbaDeliveryAction";
 actionButton.style.cssText="position:fixed;right:8px;bottom:26%;z-index:24;border:1px solid #67e8f9;background:#0369a1;color:#fff;border-radius:9px;padding:9px 13px;font:700 12px system-ui;box-shadow:0 3px 12px #0009;display:none;touch-action:manipulation";
 document.body.append(actionButton);
 let actionMode="";
 actionButton.addEventListener("click",()=>{
  if(actionMode==="deliver")finish();
  else if(actionMode==="pickup")pickupAtBay();
 });
 function nearBay(radius=5.5){
  return !driving&&Math.hypot(camera.position.x-DEPOT.x,camera.position.z-DEPOT.z)<radius;
 }
 function parkedAtBay(){
  const p=van.position;return Math.hypot(p.x-DEPOT.x,p.z-DEPOT.z)<5.4;
 }
 function pickupAtBay(){
  if(driving||!valid()||!nearBay()||!parkedAtBay()){
   notify("Stationne le fourgon sur la place FBA Livraisons et approche-toi.");return;
  }
  if(!job())state.homeDelivery.active=next();
  if(job().stage!=="accepted"){notify("La commande est déjà dans le véhicule");return;}
  job().stage="loaded";
  state.cityMapTarget={x:job().x,z:job().z};
  rebuildRoute();sync();panel.style.display="none";
  notify("Commande n°"+job().id+" récupérée — suis le GPS !");
 }

 const el=document.createElement("div");
 el.style.cssText="position:fixed;right:7px;top:48px;max-width:180px;z-index:12;background:#0f172add;color:#fff;border:1px solid #0891b2;border-radius:7px;padding:5px 7px;font:600 11px system-ui;pointer-events:none;display:none";
 document.body.append(el);
 // Guidage GPS : flèche orientée selon la caméra ou le véhicule, et parcours
 // routier sur la grille de 100 m de FBA City. Aucun GPS externe nécessaire.
 const guidance=document.createElement("div");
 guidance.id="fbaDeliveryGuidance";
 guidance.style.cssText="position:fixed;top:68px;left:50%;transform:translateX(-50%);z-index:18;display:none;pointer-events:none;text-align:center;color:#f8fafc;font:700 11px system-ui;text-shadow:0 1px 4px #000";
 const arrow=document.createElement("div");
 arrow.textContent="➤";
 arrow.style.cssText="width:42px;height:42px;margin:auto;font:700 36px/42px system-ui;color:#22d3ee;filter:drop-shadow(0 1px 4px #000);transition:transform .1s linear";
 const detail=document.createElement("div");
 detail.style.cssText="max-width:240px;padding:5px 9px;border:1px solid #0891b2;border-radius:8px;background:#0f172aeb;white-space:nowrap;overflow:hidden;text-overflow:ellipsis";
 guidance.append(arrow,detail);document.body.append(guidance);
 const routeGroup=new THREE.Group();routeGroup.name="FBA Livraison GPS";scene.add(routeGroup);
 const routeMaterial=new THREE.LineBasicMaterial({color:0x22d3ee,transparent:true,opacity:.88,depthTest:false});
 let route=[],routeIndex=1,routeSignature="",lastReroute=0;
 const d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 const roadX=x=>Math.max(-1000,Math.min(1000,Math.round((x+1000)/100)*100-1000));
 const roadZ=z=>Math.max(75,Math.min(2075,Math.round((z-75)/100)*100+75));
 function clearRoute(){
  for(const child of routeGroup.children){routeGroup.remove(child);child.geometry.dispose();}
  route=[];routeIndex=1;routeSignature="";
 }
 function calculateRoute(from,to){
  const fromRoadZ=roadZ(from.z),toRoadZ=roadZ(to.z),axisX=roadX(from.x);
  // Aller sur la chaussée puis suivre les axes de rues ; aucun long
  // segment diagonal traversant le centre des immeubles.
  const nodes=[
   {...from},{x:from.x,z:fromRoadZ},{x:axisX,z:fromRoadZ},
   {x:axisX,z:toRoadZ},{x:to.x,z:toRoadZ},{...to}
  ];
  const clean=[];
  for(const p of nodes)if(!clean.length||d2(clean.at(-1),p)>.2)clean.push(p);
  return clean;
 }
 function routeStart(){return driving?van.position:{x:camera.position.x,z:camera.position.z};}
 function routeDestination(j){
  return j.stage==="accepted"?{x:van.position.x,z:van.position.z}: {x:j.x,z:j.z};
 }
 function drawRoute(){
  for(const child of routeGroup.children){routeGroup.remove(child);child.geometry.dispose();}
  if(route.length<2)return;
  // Marquage routier par segments lumineux, sans une multitude de meshes.
  // L'affichage des lignes en ville reste volontairement léger sur Android.
  const verts=[];
  for(let i=0;i<route.length-1;i++){
   const a=route[i],b=route[i+1],length=d2(a,b);
   const dx=(b.x-a.x)/length,dz=(b.z-a.z)/length;
   for(let t=0;t<length;t+=10){
    const end=Math.min(length,t+5);
    verts.push(a.x+dx*t,.15,a.z+dz*t,a.x+dx*end,.15,a.z+dz*end);
   }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
  const lines=new THREE.LineSegments(geo,routeMaterial);lines.renderOrder=30;
  lines.frustumCulled=false;routeGroup.add(lines);
 }
 function rebuildRoute(){
  const j=job();
  if(!j||j.stage!=="loaded"){clearRoute();return;}
  const start=routeStart(),destination=routeDestination(j);
  route=calculateRoute(start,destination);routeIndex=1;
  routeSignature=j.id+":"+j.stage;lastReroute=performance.now();drawRoute();
 }
 function angle(a){return Math.atan2(-a.x,-a.z);}
 function normalize(a){return Math.atan2(Math.sin(a),Math.cos(a));}
 function updateGuidance(){
  const j=job(),active=j&&j.stage==="loaded";
  guidance.style.display=active?"block":"none";
  routeGroup.visible=!!active;
  if(!active){if(route.length)clearRoute();return;}
  const pos=routeStart(),dest=routeDestination(j);
  if(routeSignature!==j.id+":"+j.stage||route.length<2)rebuildRoute();
  if(!route.length)return;
  while(routeIndex<route.length-1&&d2(pos,route[routeIndex])<13)routeIndex++;
  // Si le joueur quitte le parcours, redessiner depuis sa position réelle.
  // Fréquence limitée pour éviter les recalculs en continu sur mobile.
  const now=performance.now();
  if(routeIndex<route.length&&d2(pos,route[routeIndex])>115&&now-lastReroute>1800)rebuildRoute();
  const waypoint=route[routeIndex]||dest;
  const relative={x:waypoint.x-pos.x,z:waypoint.z-pos.z};
  const face=driving?heading:o.getHeading();
  // Le glyphe ➤ pointe vers la droite : +PI/2 le remet vers l'avant.
  const headingAngle=angle(relative),rotation=normalize(face-headingAngle)-Math.PI/2;
  arrow.style.transform="rotate("+rotation+"rad)";
  const metres=Math.round(d2(pos,dest));
  let remaining=d2(pos,waypoint);
  for(let k=routeIndex;k<route.length-1;k++)remaining+=d2(route[k],route[k+1]);
  detail.textContent=j.address+" · "+Math.round(remaining)+" m de trajet ("+metres+" m direct)";
 }
 const dist=(x,z)=>Math.hypot(camera.position.x-x,camera.position.z-z);
 const nearVan=(r=5)=>dist(van.position.x,van.position.z)<r;
 const valid=()=>playerLevel()>=2&&!!state.upgrades.homeDeliveryVan;
 const job=()=>state.homeDelivery.active;
 function next(){
  const n=state.homeDelivery.completed||0;
  const sites=[[9,1],[10,2],[8,2],[11,3],[9,4],[12,4],[6,5],[13,6],[5,8],[15,7]];
  const [col,row]=sites[n%sites.length],b=cityBuildingsForBlock(col,row)[n%4];
  const x=b.entrance.x,z=b.entrance.z-2.7;
  return {id:n+1,buildingId:b.id,address:b.address,x,z,floor:0,
   fee:160+Math.round(Math.hypot(b.x,b.z-35)*.15),stage:"accepted"};
 }
 function refresh(){
  updateGuidance();
  bay.visible=!!state.upgrades.homeDeliveryVan;
  const atCustomer=nearCustomer(),atPickup=valid()&&nearBay()&&parkedAtBay()&&
   (!job()||job().stage==="accepted");
  actionMode=atCustomer?"deliver":atPickup?"pickup":"";
  actionButton.style.display=actionMode&&panel.style.display==="none"?"block":"none";
  if(actionMode==="deliver")actionButton.textContent="Livrer";
  else if(actionMode==="pickup")actionButton.textContent=job()?"Charger la commande":"Récupérer une commande";
  van.root.visible=!!state.upgrades.homeDeliveryVan;
  if(!state.upgrades.homeDeliveryVan){el.style.display="none";return;}
  const j=job();el.style.display="block";
  el.textContent=driving?"FOURGON FBA · "+Math.round(Math.abs(speed)*3.6)+" km/h":
   j?(j.stage==="loaded"?"LIVRAISON":"COLIS À CHARGER")+
    " · "+Math.round(dist(j.x,j.z))+" m":"FOURGON FBA";
 }
 function enter(){
  if(!valid()){notify("Achète les livraisons au niveau 2");return;}
  if(o.isHeld()){notify("Dépose ton carton avant de conduire");return;}
  if(!nearVan(4.5)){notify("Approche-toi du fourgon");return;}
  driving=true;speed=0;heading=van.position.yaw;rebuildRoute();
  panel.style.display="none";clearLook();
  setHeading(heading,van.position.x+Math.sin(heading)*5,3.6,van.position.z+Math.cos(heading)*5);
  notify("Fourgon : avance/recul et gauche/droite ; Interagir pour descendre");
 }
 function exit(){
  if(!driving)return false;
  const pos=van.position,x=pos.x+Math.cos(heading)*2.3,z=pos.z-Math.sin(heading)*2.3;
  if(blocked(x,z,.4)){notify("Arrête-toi dans une zone dégagée");return true;}
  driving=false;speed=0;resetFloor();rebuildRoute();
  setHeading(heading,x,1.7,z);notify("Tu es descendu du fourgon");
  return true;
 }
 function move(dt,keys,joyX,joyY){
  if(!driving)return false;
  const forward=Number(keys.forward)-Number(keys.backward)-joyY;
  const turn=Number(keys.right)-Number(keys.left)+joyX;
  const target=forward>.1?17*forward:forward<-.1?6*forward:0;
  speed+=Math.max(-19*dt,Math.min(19*dt,target-speed));
  if(Math.abs(speed)<.04)speed=0;
  heading-=turn*dt*1.05*Math.min(1,Math.abs(speed)/4)*(speed<0?-1:1);
  const old=van.position,nx=old.x-Math.sin(heading)*speed*dt,nz=old.z-Math.cos(heading)*speed*dt;
  if(!blocked(nx,nz,1.25))van.setPosition(nx,nz,heading);
  else{speed=0;van.setPosition(old.x,old.z,heading);}
  const p=van.position;
  setHeading(heading,p.x+Math.sin(heading)*5,3.6,p.z+Math.cos(heading)*5);
  return true;
 }
 function accept(){
  if(!valid()||job())return;
  state.homeDelivery.active=next();
  state.cityMapTarget={x:job().x,z:job().z};
  sync();show();notify("Commande reçue : charge le colis au parking du magasin");
 }
 function load(){
  if(!job()||job().stage!=="accepted")return;
  if(!nearBay()||!parkedAtBay()){
   notify("Le colis se charge auprès du fourgon sur le parking du magasin");return;
  }
  job().stage="loaded";rebuildRoute();sync();show();notify("Colis chargé : suis la flèche GPS jusqu'au client");
 }
 function nearCustomer(){
  const j=job();return !!j&&j.stage==="loaded"&&!driving&&dist(j.x,j.z)<4.8&&Math.abs(camera.position.y-1.7)<2.3;
 }
 function finish(){
  if(!nearCustomer())return false;
  const j=job(),fee=Math.round(j.fee);
  state.money+=fee;state.finance.revenue+=fee;state.finance.transactions++;
  state.homeDelivery.completed=(state.homeDelivery.completed||0)+1;
  state.homeDelivery.active=null;state.cityMapTarget=null;clearRoute();
  o.awardDelivery?.();sync();checkLevelUp();notify("Commande "+j.id+" livrée : +"+fee+" €");return true;
 }
 function interact(){
  if(driving)return exit();
  if(finish())return true;
  if(valid()&&nearBay()&&parkedAtBay()&&(!job()||job().stage==="accepted")){
   pickupAtBay();return true;
  }
  if(state.upgrades.homeDeliveryVan&&nearVan(4.7)){show();return true;}
  return false;
 }
 function show(){
  openPanel("FBA — Livraisons à domicile");
  paragraph("Missions terminées : "+(state.homeDelivery.completed||0)+
   " · Fourgon : "+(state.upgrades.homeDeliveryVan?"acquis":"non acquis"));
  if(playerLevel()<2&&!state.upgrades.homeDeliveryVan){
   paragraph("Le service se débloque au niveau 2.");button(panel,"Retour",o.showMenu);return;
  }
  if(!state.upgrades.homeDeliveryVan){
   paragraph("Achat unique : camionnette et service pour "+PRICE+" €.");
   const buy=button(panel,"Acheter le service + le fourgon — "+PRICE+" €",()=>{
    if(state.money<PRICE){notify("Argent insuffisant");return;}
    state.money-=PRICE;state.upgrades.homeDeliveryVan=true;
    sync();show();notify("Livraisons débloquées ! Fourgon au parking.");
   });
   buy.disabled=state.money<PRICE;
   return;
  }
  paragraph("Place réservée FBA Livraisons : parking X −24 / Z 40, panneau bleu.");
  paragraph("Pour récupérer un colis, gare le fourgon dans la place et utilise « Récupérer une commande ».");
  if(valid()&&nearBay()&&parkedAtBay()&&(!job()||job().stage==="accepted"))
   button(panel,job()?"Charger la commande":"Récupérer une commande",pickupAtBay);
  if(driving){button(panel,"Descendre du fourgon",()=>{exit();panel.style.display="none";});return;}
  if(nearVan(4.5))button(panel,"Conduire le fourgon",enter);
  const active=job();
  if(!active){
   const candidate=next();
   paragraph("Prochain client : "+candidate.address+" · prime "+candidate.fee+" €");
   button(panel,"Accepter une commande",accept);
  }else{
   paragraph("Commande "+active.id+" : "+active.address+", rez-de-chaussée.");
   paragraph("Prime : "+active.fee+" € · Distance : "+Math.round(dist(active.x,active.z))+" m");
   paragraph(active.stage==="accepted"?"Statut : charger le colis au parking":"Statut : colis chargé");
   if(active.stage==="accepted")button(panel,"Charger le colis",load);
   if(nearCustomer())button(panel,"Livrer",()=>{finish();show();});
   button(panel,"Voir l'adresse sur la carte",o.showMap);
  }
  if(!nearVan(9))button(panel,"Rappeler le fourgon au parking",()=>{
   van.setPosition(DEPOT.x,DEPOT.z,Math.PI);heading=Math.PI;speed=0;sync();show();
  });
  button(panel,"Retour au menu",o.showMenu);
 }
 return {van,show,move,interact,enter,exit,refresh,updateGuidance,isDriving:()=>driving,job,nearCustomer};
}
