// BES V0.18.40 — circulation du parking du supermarché.
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
 let elapsed=0,spawnElapsed=0,sequence=0;
 const start={x:-9,z:91},junction={x:-9,z:55};
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function reserved(slot){return cars.some(car=>car.slot===slot&&car.state!=="inactive");}
 function chooseSlot(){
  const free=positions.filter(slot=>!reserved(slot));
  return free.length?free[(sequence*3+1)%free.length]:null;
 }
 function startTrip(car){
  const slot=chooseSlot();if(!slot)return;
  car.slot=slot;car.group.position.set(start.x,0,start.z);
  car.group.visible=true;car.state="arriving";car.index=0;car.stay=35+(sequence%4)*13;
  car.speed=4.5+(sequence%3)*.5;
  car.route=[junction,{x:slot.x,z:55},slot];
  sequence++;
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
  elapsed+=dt;spawnElapsed+=dt;
  if(spawnElapsed>18){
   spawnElapsed=0;
   const inactive=cars.find(car=>car.state==="inactive");
   if(inactive)startTrip(inactive);
  }
  for(const car of cars){
   if(car.state==="inactive")continue;
   if(car.state==="parked"){
    car.stay-=dt;
    if(car.stay<=0){
     car.state="leaving";car.index=0;
     car.route=[{x:car.slot.x,z:55},junction,start];
    }
    continue;
   }
   const target=car.route[car.index];if(!target)continue;
   if(moveTo(car,target,dt,camera.position)){
    car.index++;
    if(car.index===car.route.length){
     if(car.state==="arriving"){
      car.state="parked";car.group.position.set(car.slot.x,0,car.slot.z);
      // Stationnement dans l'axe des bandes blanches, pas au milieu d'une voie.
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
