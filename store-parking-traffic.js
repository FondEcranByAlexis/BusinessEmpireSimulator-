// BES V0.18.44 — accès direct au parking, sans traversée des bordures urbaines.
// Trois véhicules légers au maximum, en basse géométrie pour PC et téléphone.
// Aucune modification des voitures, des feux ou des carrefours de FBA City.
export function installStoreParkingTraffic({THREE,scene,camera,getDeliveryVan}){
 const root=new THREE.Group();root.name="Voitures clients — parking magasin";scene.add(root);
 const bodyMats=[0x2563eb,0xb45309,0x0f766e,0x831843,0x64748b].map(color=>new THREE.MeshLambertMaterial({color}));
 const glass=new THREE.MeshLambertMaterial({color:0x334e64});
 const rubber=new THREE.MeshLambertMaterial({color:0x151a21});
 const red=new THREE.MeshBasicMaterial({color:0xef4444});
 const white=new THREE.MeshBasicMaterial({color:0xf8fafc});
 const cube=new THREE.BoxGeometry(1,1,1);
 const wheel=new THREE.CylinderGeometry(.27,.27,.18,10);
 const positions=[
  {x:-43.5,z:48},{x:-37.5,z:48},{x:-31.5,z:48},
  {x:-16.5,z:48},{x:-40.5,z:60},{x:-34.5,z:60},
  {x:-28.5,z:60},{x:-19.5,z:60}
 ];
 // La place FBA Livraisons est x=-24 / z=48. Ne jamais l'attribuer à une voiture cliente.
 const cars=[];
 function part(parent,geometry,material,x,y,z,sx=1,sy=1,sz=1){
  const mesh=new THREE.Mesh(geometry,material);
  mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;
 }
 function makeCar(index){
  const group=new THREE.Group();root.add(group);
  const body=bodyMats[index%bodyMats.length];
  part(group,cube,body,0,.66,0,1.75,.55,3.9);
  part(group,cube,body,0,1.1,-.27,1.45,.47,1.8);
  part(group,cube,glass,0,1.18,-.32,1.47,.26,1.36);
  for(const side of [-1,1])for(const dz of [-1.23,1.23]){
   const w=part(group,wheel,rubber,side*.87,.27,dz);
   w.rotation.z=Math.PI/2;
  }
  for(const side of [-.59,.59]){
   part(group,cube,white,side,.72,-1.97,.28,.15,.05);
   part(group,cube,red,side,.72,1.97,.28,.13,.05);
  }
  group.visible=false;
  return {group,state:"inactive",slot:null,route:[],index:0,stay:0,speed:0,parked:false};
 }
 for(let i=0;i<3;i++)cars.push(makeCar(i));
 let spawnElapsed=0,sequence=0;
 // Raccordement à la voie d'accès asphaltée (largeur 19.6 m, X=-9.8..9.8).
 // Pour éviter le trottoir et les arbres à Z≈75, aucun virage ni déplacement
 // transversal n'est effectué dans la ville : la voiture descend en ligne
 // droite sur sa voie jusqu'au coeur du parking (Z=55).
 // Entrée X=-2.9, sortie distincte X=4.3 (trajet de sortie V0.18.42 conservé).
 // Sens unique, places, accès du fourgon et comportement interne inchangés.
 const start={x:-2.9,z:95},entryTurn={x:-2.9,z:55};
 const junction={x:-9,z:55};
 const outboundWest={x:-52,z:55},outboundNorth={x:-52,z:72.1};
 const outboundEast={x:-9,z:72.1};
 const exitTurn={x:4.3,z:72.1},exitRoad={x:4.3,z:95};
 const moving=car=>car.state==="arriving"||car.state==="leaving";
 const trafficBusy=()=>cars.some(moving);
 // Marquages directionnels sur les deux allées, non collidants.
 const arrowMaterial=new THREE.MeshBasicMaterial({color:0xf8fafc,side:THREE.DoubleSide,depthWrite:false});
 function arrow(x,z,west){
  const sign=new THREE.Group();sign.position.set(x,.039,z);root.add(sign);
  const shaft=new THREE.Mesh(new THREE.PlaneGeometry(1.3,.13),arrowMaterial);
  shaft.rotation.x=-Math.PI/2;shaft.rotation.z=0;sign.add(shaft);
  const triangle=new THREE.Mesh(new THREE.PlaneGeometry(.55,.55),arrowMaterial);
  triangle.rotation.x=-Math.PI/2;
  triangle.position.x=west?-.85:.85;sign.add(triangle);
 }
 for(const x of [-17,-29,-41]){arrow(x,55,true);arrow(x,74,false);}

 function reserved(slot){return cars.some(car=>car.slot===slot&&car.state!=="inactive");}
 function chooseSlot(){
  const free=positions.filter(slot=>!reserved(slot));
  return free.length?free[(sequence*3+1)%free.length]:null;
 }
 function startTrip(car){
  if(trafficBusy())return false;
  const slot=chooseSlot();if(!slot)return false;
  car.slot=slot;car.group.position.set(start.x,0,start.z);
  car.group.visible=true;car.state="arriving";car.index=0;car.stay=35+(sequence%4)*13;
  car.speed=4.5+(sequence%3)*.5;
  car.route=[entryTurn,junction,{x:slot.x,z:55},slot];
  sequence++;
  return true;
 }
 function moveTo(car,target,dt,player){
  const p=car.group.position,dx=target.x-p.x,dz=target.z-p.z;
  const distance=Math.hypot(dx,dz);
  if(distance<.07){p.x=target.x;p.z=target.z;return true;}
  const movement=Math.min(distance,car.speed*dt);
  const nx=p.x+dx/distance*movement,nz=p.z+dz/distance*movement;
  // Priorité au joueur et au fourgon FBA, même pendant les manœuvres.
  if(Math.hypot(nx-player.x,nz-player.z)<2.7)return false;
  const van=getDeliveryVan?.();
  if(van&&Math.hypot(nx-van.x,nz-van.z)<3.5)return false;
  for(const other of cars){
   if(other===car||!other.group.visible)continue;
   if(Math.hypot(nx-other.group.position.x,nz-other.group.position.z)<3.5)return false;
  }
  p.x=nx;p.z=nz;car.group.rotation.y=Math.atan2(-dx,-dz);
  return movement>=distance-.07;
 }
 function update(dt){
  spawnElapsed+=dt;
  // Une seule voiture effectue une manoeuvre dans les voies communes.
  // Les véhicules déjà stationnés peuvent attendre sans se mettre en travers.
  if(!trafficBusy()){
   const leaving=cars.find(car=>car.state==="parked"&&car.stay<=0);
   if(leaving){
    leaving.state="leaving";leaving.index=0;
    // Tous les départs suivent le sens unique OUEST puis NORD puis EST.
    leaving.route=[{x:leaving.slot.x,z:55},outboundWest,outboundNorth,outboundEast,exitTurn,exitRoad];
   }else if(spawnElapsed>=18){
    const inactive=cars.find(car=>car.state==="inactive");
    if(inactive&&startTrip(inactive))spawnElapsed=0;
   }
  }
  for(const car of cars){
   if(car.state==="inactive")continue;
   if(car.state==="parked"){
    car.stay=Math.max(0,car.stay-dt);
    continue;
   }
   const target=car.route[car.index];if(!target)continue;
   if(moveTo(car,target,dt,camera.position)){
    car.index++;
    if(car.index===car.route.length){
     if(car.state==="arriving"){
      car.state="parked";car.group.position.set(car.slot.x,0,car.slot.z);
      car.group.rotation.y=car.slot.z===48?0:Math.PI;
     }else{
      car.group.visible=false;car.state="inactive";car.slot=null;
     }
    }
   }
  }
 }
 function blocked(x,z,r=.3,fromX,fromZ){
  for(const car of cars){
   if(!car.group.visible)continue;
   const d=Math.hypot(x-car.group.position.x,z-car.group.position.z);
   if(d>=2.0+r)continue;
   if(Number.isFinite(fromX)&&Number.isFinite(fromZ)){
    const before=Math.hypot(fromX-car.group.position.x,fromZ-car.group.position.z);
    if(d>before+.001)continue;
   }
   return true;
  }
  return false;
 }
 return {update,blocked,spots:positions};
}
