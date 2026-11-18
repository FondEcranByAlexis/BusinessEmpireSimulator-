// BES V0.18.62 — accès piéton extérieur sans traversée des murs du magasin.
// Leurs déplacements ne modifient ni les clients/caisse, ni les collisions,
// ni le trafic et le stationnement validés.
export function installStoreApproachPedestrians({THREE,scene,getStoreStatus,vehicleNear,isWalkable,getPlayerPosition}){
 const root=new THREE.Group();root.name="Passants — ville vers supermarché";scene.add(root);
 const colors=[0x375a89,0x9a5834,0x357866,0x805789];
 const skin=new THREE.MeshLambertMaterial({color:0xd9ae8d});
 const pants=new THREE.MeshLambertMaterial({color:0x303b4b});
 const floor=new THREE.BoxGeometry(1,1,1);
 // X=13 traversait l'aile de réserve (X=10.35..15.05 ; Z=1.8..23.45)
 // et certains volumes construits. L'accès longe désormais le bord
 // extérieur de la chaussée (X=9.2, hors façade), avant d'atteindre
 // le parvis libre au nord de l'entrée du magasin (Z>10.38).
 // Départ plus éloigné de la traversée urbaine pour éviter l'apparition
 // juste devant le passage piétons.
 const APPROACH_X=9.2;
 const route=[
  {x:APPROACH_X,z:205},{x:APPROACH_X,z:165},{x:APPROACH_X,z:130},{x:APPROACH_X,z:105},
  {x:APPROACH_X,z:84.5},{x:APPROACH_X,z:72},
  {x:APPROACH_X,z:50},{x:APPROACH_X,z:30},
  {x:APPROACH_X,z:15.5},{x:4,z:12.2},{x:1.7,z:12.2}
 ];
 const walkers=[];
 const part=(group,material,x,y,z,w,h,d)=>{
  const mesh=new THREE.Mesh(floor,material);
  mesh.position.set(x,y,z);mesh.scale.set(w,h,d);group.add(mesh);return mesh;
 };
 for(let n=0;n<4;n++){
  const group=new THREE.Group();root.add(group);group.visible=false;
  const shirt=new THREE.MeshLambertMaterial({color:colors[n%colors.length]});
  part(group,shirt,0,1.22,0,.44,.77,.31);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.17,10,8),skin);
  head.position.y=1.78;group.add(head);
  const legs=[],arms=[];
  for(const side of [-1,1]){
   const leg=new THREE.Group();leg.position.set(side*.12,.87,0);group.add(leg);
   part(leg,pants,0,-.39,0,.16,.74,.19);legs.push(leg);
   const arm=new THREE.Group();arm.position.set(side*.30,1.52,0);group.add(arm);
   part(arm,shirt,0,-.27,0,.14,.55,.18);arms.push(arm);
  }
  walkers.push({group,legs,arms,routeIndex:0,returning:false,state:"inactive",speed:1.65+(n%3)*.17,wait:0,step:0});
 }
 let timer=7;
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function disappear(p){
  p.state="inactive";p.group.visible=false;p.returning=false;p.routeIndex=0;p.wait=0;
 }
 function spawn(){
  const p=walkers.find(w=>w.state==="inactive");
  if(!p)return;
  const start=route[0];
  // Apparition véritablement en ville, hors de la vue immédiate du joueur.
  // Si le joueur s'y trouve, reporter l'apparition plutôt que téléporter un PNJ.
  const player=getPlayerPosition?.();
  if(player&&Math.hypot(player.x-start.x,player.z-start.z)<48)return;
  if(isWalkable&&!isWalkable(start.x,start.z,.48))return;
  p.group.position.set(start.x,0,start.z);
  p.group.visible=true;p.state="walking";p.returning=false;p.routeIndex=1;p.wait=0;
 }
 function tick(dt){
  const status=getStoreStatus?.()??{open:false,hour:0};
  const open=!!status.open&&status.hour>=8&&status.hour<20;
  if(open){
   timer-=dt;
   if(timer<=0){spawn();timer=18+(walkers.filter(p=>p.state!=="inactive").length*4);}
  }else timer=Math.min(timer,8);
  for(const p of walkers){
   if(p.state==="inactive")continue;
   if(p.state==="waiting"){
    p.wait-=dt;
    if(p.wait<=0){
     p.returning=true;p.routeIndex=route.length-2;p.state="walking";
    }
    continue;
   }
   const target=route[p.routeIndex];if(!target){disappear(p);continue;}
   const pos=p.group.position;
   const dx=target.x-pos.x,dz=target.z-pos.z;
   const d=Math.hypot(dx,dz);
   if(d<.08){
    pos.x=target.x;pos.z=target.z;
    if(p.returning){p.routeIndex--;if(p.routeIndex<0)disappear(p);}
    else{p.routeIndex++;if(p.routeIndex>=route.length){
     p.state="waiting";p.wait=open?4+(p.speed*2):.5;
    }}
    continue;
   }
   // Attendre avant de traverser Z=79 dans les deux sens.
   const crossing=(pos.z>=72&&pos.z<=85)&&(target.z>=72&&target.z<=85);
   if(crossing&&vehicleNear?.(APPROACH_X,79,7)){
    p.legs[0].rotation.x=p.legs[1].rotation.x=0;
    p.arms[0].rotation.x=p.arms[1].rotation.x=0;
    continue;
   }
   const step=Math.min(d,p.speed*dt);
   const nx=pos.x+dx/d*step,nz=pos.z+dz/d*step;
   // Utiliser les MÊMES volumes de collision que le joueur.
   // Ne plus traverser un mur en suivant uniquement des coordonnées visuelles.
   if(isWalkable&&!isWalkable(nx,nz,.48)){
    p.legs[0].rotation.x=p.legs[1].rotation.x=0;
    p.arms[0].rotation.x=p.arms[1].rotation.x=0;
    continue;
   }
   pos.x=nx;pos.z=nz;
   // Modèle orienté vers -Z au repos.
   p.group.rotation.y=Math.atan2(-dx,-dz);
   p.step+=dt*7;
   const gait=Math.sin(p.step)*.30;
   p.legs[0].rotation.x=gait;p.legs[1].rotation.x=-gait;
   p.arms[0].rotation.x=-gait*.65;p.arms[1].rotation.x=gait*.65;
  }
 }
 return {update:tick};
}
