// FBA Livraisons V0.15.02 — missions locales, véhicule, sauvegarde et récompenses.
import {makeDeliveryVan} from "./delivery-van.js?v=0.15.02";
import {cityBuildingsForBlock} from "./city.js?v=0.15.02";
export function installHomeDeliveries(o){
 const {THREE,scene,state,camera,playerLevel,blocked,notify,save,sync,checkLevelUp,openPanel,paragraph,button,panel,getControls,setHeading,clearLook,resetFloor}=o;
 const PRICE=1800,DEPOT={x:-24,z:40};
 const van=makeDeliveryVan({THREE,scene});van.setPosition(DEPOT.x,DEPOT.z,Math.PI);
 let driving=false,heading=Math.PI,speed=0;
 state.homeDelivery??={completed:0,active:null};
 const el=document.createElement("div");
 el.style.cssText="position:fixed;right:7px;top:48px;max-width:180px;z-index:12;background:#0f172add;color:#fff;border:1px solid #0891b2;border-radius:7px;padding:5px 7px;font:600 11px system-ui;pointer-events:none;display:none";
 document.body.append(el);
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
  driving=true;speed=0;heading=van.position.yaw;
  panel.style.display="none";clearLook();
  setHeading(heading,van.position.x+Math.sin(heading)*5,3.6,van.position.z+Math.cos(heading)*5);
  notify("Fourgon : avance/recul et gauche/droite ; Interagir pour descendre");
 }
 function exit(){
  if(!driving)return false;
  const pos=van.position,x=pos.x+Math.cos(heading)*2.3,z=pos.z-Math.sin(heading)*2.3;
  if(blocked(x,z,.4)){notify("Arrête-toi dans une zone dégagée");return true;}
  driving=false;speed=0;resetFloor();
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
  if(!nearVan(5)||Math.hypot(van.position.x-DEPOT.x,van.position.z-DEPOT.z)>10){
   notify("Le colis se charge auprès du fourgon sur le parking du magasin");return;
  }
  job().stage="loaded";sync();show();notify("Colis chargé : rejoins l'adresse du client");
 }
 function nearCustomer(){
  const j=job();return !!j&&j.stage==="loaded"&&!driving&&dist(j.x,j.z)<4.8&&Math.abs(camera.position.y-1.7)<2.3;
 }
 function finish(){
  if(!nearCustomer())return false;
  const j=job(),fee=Math.round(j.fee);
  state.money+=fee;state.finance.revenue+=fee;state.finance.transactions++;
  state.homeDelivery.completed=(state.homeDelivery.completed||0)+1;
  state.homeDelivery.active=null;state.cityMapTarget=null;
  o.awardDelivery?.();sync();checkLevelUp();notify("Commande "+j.id+" livrée : +"+fee+" €");return true;
 }
 function interact(){
  if(driving)return exit();
  if(finish())return true;
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
  paragraph("Fourgon au départ : parking X −24 / Z 40. Carte interactive dans le menu.");
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
   if(nearCustomer())button(panel,"Remettre la commande au client",()=>{finish();show();});
   button(panel,"Voir l'adresse sur la carte",o.showMap);
  }
  if(!nearVan(9))button(panel,"Rappeler le fourgon au parking",()=>{
   van.setPosition(DEPOT.x,DEPOT.z,Math.PI);heading=Math.PI;speed=0;sync();show();
  });
  button(panel,"Retour au menu",o.showMenu);
 }
 return {van,show,move,interact,enter,exit,refresh,isDriving:()=>driving,job,nearCustomer};
}
