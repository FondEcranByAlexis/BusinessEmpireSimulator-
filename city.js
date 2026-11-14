// FBA City V0.15.00 — 2 km × 2 km, generation deterministe par quartiers.
// Tous les placements de logements et routes sont reproductibles et independants du niveau.
export const CITY_BOUNDS={minX:-1000,maxX:1000,minZ:75,maxZ:2075,size:2000};
const BLOCK=100,CHUNK=200;
const hash=(x,z,s=0)=>{let v=Math.imul(x+947,374761393)^Math.imul(z+191,668265263)^Math.imul(s+17,1274126177);v=Math.imul(v^(v>>>13),1274126177);return ((v^(v>>>16))>>>0)/4294967295;};
export function cityAddress(b){return b.address||("Résidence "+String(b.id).padStart(3,"0"));}
export function cityBuildingAt(x,z){
 if(x<CITY_BOUNDS.minX||x>CITY_BOUNDS.maxX||z<CITY_BOUNDS.minZ||z>CITY_BOUNDS.maxZ)return null;
 const col=Math.floor((x-CITY_BOUNDS.minX)/BLOCK),row=Math.floor((z-CITY_BOUNDS.minZ)/BLOCK);
 const blockX=CITY_BOUNDS.minX+col*BLOCK,blockZ=CITY_BOUNDS.minZ+row*BLOCK;
 const buildings=cityBuildingsForBlock(col,row);
 return buildings.find(b=>Math.abs(x-b.x)<b.w/2-.1&&Math.abs(z-b.z)<b.d/2-.1)||null;
}
export function cityBuildingsForBlock(col,row){
 if(col<0||col>=20||row<0||row>=20)return [];
 // Les routes couvrent les limites de chaque bloc ; les constructions sont en retrait.
 const x0=CITY_BOUNDS.minX+col*BLOCK,z0=CITY_BOUNDS.minZ+row*BLOCK;
 const variant=hash(col,row);
 const result=[];
 for(let ix=0;ix<2;ix++)for(let iz=0;iz<2;iz++){
  const w=variant>.72?24:28,d=variant<.3?27:30;
  const x=x0+25+ix*50,z=z0+25+iz*50;
  const id=row*80+col*4+iz*2+ix+1;
  const floors=2+Math.floor(hash(col*13+ix,row*11+iz)*3);
  const residential=hash(col+iz,row+ix,3)>.18;
  result.push({id,x,z,w,d,floors,type:residential?"logement":"commerce",
   address:(residential?"Résidence ":"Commerce ")+String(id).padStart(3,"0"),
   entrance:{x,z:z-d/2},stair:{x:x-w/2+4,z:z-2}});
 }
 return result;
}
export function cityRoadLineX(x){return Math.round((x-CITY_BOUNDS.minX)/BLOCK)*BLOCK+CITY_BOUNDS.minX;}
export function cityRoadLineZ(z){return Math.round((z-CITY_BOUNDS.minZ)/BLOCK)*BLOCK+CITY_BOUNDS.minZ;}
export function installCity({THREE,scene}){
 const root=new THREE.Group();root.name="FBA City 2x2";scene.add(root);
 const materials={
  grass:new THREE.MeshLambertMaterial({color:0x637b63}),
  asphalt:new THREE.MeshLambertMaterial({color:0x303944}),
  paving:new THREE.MeshLambertMaterial({color:0xa6b2bd}),
  marking:new THREE.MeshBasicMaterial({color:0xf4eee1}),
  facade:new THREE.MeshLambertMaterial({color:0xd5d9d8}),
  facadeAlt:new THREE.MeshLambertMaterial({color:0xb8c4c9}),
  window:new THREE.MeshLambertMaterial({color:0x608aa4,transparent:true,opacity:.75}),
  door:new THREE.MeshLambertMaterial({color:0x685446}),
  steel:new THREE.MeshLambertMaterial({color:0x64748b}),
  floor:new THREE.MeshLambertMaterial({color:0xb7b0a2}),
  roof:new THREE.MeshLambertMaterial({color:0x475569}),
  red:new THREE.MeshBasicMaterial({color:0xe11d48}),
  amber:new THREE.MeshBasicMaterial({color:0xfbbf24}),
  green:new THREE.MeshBasicMaterial({color:0x22c55e}),
  tree:new THREE.MeshLambertMaterial({color:0x346c43}),
  trunk:new THREE.MeshLambertMaterial({color:0x624d35}),
  vehicle:[0x2563eb,0xc2410c,0x0f766e,0xe2e8f0,0x881337].map(color=>new THREE.MeshLambertMaterial({color})),
  tire:new THREE.MeshLambertMaterial({color:0x151a21}),
  rear:new THREE.MeshBasicMaterial({color:0xef4444})
 };
 const geometry=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,8),
  cone=new THREE.ConeGeometry(1,1,8),sphere=new THREE.SphereGeometry(1,10,8);
 const active=new Map(),traffic=[];
 const make=(parent,material,x,y,z,w,h,d,geo=geometry)=>{
  const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
 };
 // Terrain de fond tres leger ; les routes sont instanciees localement.
 make(root,materials.grass,0,-.22,1075,2000,.30,2000);
 function building(group,b){
  const {x,z,w,d,floors}=b,h=floors*3.1;
  const mat=b.id%3===0?materials.facadeAlt:materials.facade;
  const child=new THREE.Group();child.position.set(x,0,z);group.add(child);
  make(child,materials.floor,0,-.01,0,w,.15,d);
  make(child,mat,-w/2,h/2,0,.28,h,d);
  make(child,mat,w/2,h/2,0,.28,h,d);
  make(child,mat,0,h/2,d/2,w,h,.28);
  // Entree centrale reelle: ouverture de 2.6 m, linteau uniquement au-dessus.
  make(child,mat,-(w+2.6)/4,h/2,-d/2,(w-2.6)/2,h,.28);
  make(child,mat,(w+2.6)/4,h/2,-d/2,(w-2.6)/2,h,.28);
  make(child,mat,0,(h+2.7)/2,-d/2,2.6,h-2.7,.28);
  const door=make(child,materials.door,1.2,1.25,-d/2+.1,.06,2.5,1.18);
  make(child,materials.steel,1.22,1.1,-d/2+.7,.08,.10,.06);
  // Halls, escaliers et planchers d'etages. L'escalier prend l'aile gauche,
  // les paliers desservent des appartements avec passages au centre.
  for(let level=0;level<floors;level++){
   const y=level*3.1;
   if(level>0){
    make(child,materials.floor,0,y,0,w-.5,.16,d-.6);
   }
   for(let k=0;k<14;k++){
    const xstep=-w/2+2.35+k%7*.33,ystep=y+(k/14)*3.05;
    const zstep=k<7?-.6:-1.7;
    make(child,materials.steel,xstep,ystep+.10,zstep,.36,.20,1);
   }
   // Portes de logements en retrait du palier et ouvertures dans les cloisons.
   for(const side of [-1,1]){
    make(child,materials.facadeAlt,side*(w/4+1),y+1.45,3,.16,2.9,d/2-5);
    make(child,materials.door,side*2.7,y+1.1,3,.07,2.2,1.1);
    // Mobilier interieur simple : lit, armoire et table.
    make(child,materials.floor,side*(w/2-3),y+.4,5,1.9,.65,2.2);
    make(child,materials.steel,side*(w/2-2),y+1.05,-3,.8,2.1,.65);
   }
   make(child,materials.window,0,y+1.6,-d/2-.19,1.2,1.3,.04);
   for(const side of [-1,1]){
    make(child,materials.window,side*w*.32,y+1.6,-d/2-.19,1.3,1.45,.06);
    make(child,materials.window,side*w*.32,y+1.6,d/2+.19,1.3,1.45,.06);
   }
  }
  make(child,materials.roof,0,h+.12,0,w+.45,.24,d+.45);
  // Numero de rue lisible depuis la porte.
  const plate=make(child,materials.steel,-1.55,2.1,-d/2-.20,.55,.38,.06);
  plate.userData.buildingId=b.id;
 }
 function trafficLight(parent,x,z,axis){
  const pole=make(parent,materials.steel,x,2.2,z,.14,4.4,.14);
  const box=make(parent,materials.roof,x,4.65,z,.42,1.15,.40);
  const lamps=[];
  for(const [j,mat] of [[0,materials.red],[1,materials.amber],[2,materials.green]]){
   const lamp=make(parent,mat,x,5.02-j*.34,z-.21,.23,.23,.05);
   lamp.visible=j===0;lamps.push(lamp);
  }
  return {lamps,axis,pole,box};
 }
 function car(parent,x,z,axis,i){
  const group=new THREE.Group();group.position.set(x,0,z);parent.add(group);
  if(axis==="x")group.rotation.y=Math.PI/2;
  const color=materials.vehicle[i%materials.vehicle.length];
  make(group,color,0,.58,0,1.65,.57,3.25);
  make(group,color,0,1.06,-.22,1.3,.57,1.7);
  make(group,materials.window,0,1.16,-.30,1.31,.33,1.2);
  for(const side of [-1,1])for(const front of [-1,1]){
   const wheel=make(group,materials.tire,side*.78,.27,front*1.12,.24,.45,.45,sphere);
  }
  for(const side of [-.55,.55]){
   make(group,materials.marking,side,.65,-1.66,.32,.19,.05);
   make(group,materials.rear,side,.65,1.66,.32,.18,.05);
  }
  const speed=4+hash(i,Math.floor(x+z))*5;
  return {group,axis,speed,phase:hash(i,Math.floor(z+x))*200,originX:x,originZ:z,lights:[]};
 }
 function chunk(cx,cz){
  const group=new THREE.Group();group.name="Quartier "+cx+","+cz;root.add(group);
  const x0=CITY_BOUNDS.minX+cx*CHUNK,z0=CITY_BOUNDS.minZ+cz*CHUNK;
  const localTraffic=[],lights=[];
  for(let bx=0;bx<2;bx++)for(let bz=0;bz<2;bz++){
   const x=x0+bx*100,z=z0+bz*100;
   make(group,materials.asphalt,x+.7,.01,z+50,10,.06,100);
   make(group,materials.asphalt,x+50,.01,z+.7,100,.06,10);
   make(group,materials.paving,x+13,.04,z+50,3,.09,98);
   make(group,materials.paving,x+50,.04,z+13,98,.09,3);
   for(const dx of [20,40,60,80]){
    make(group,materials.marking,x+dx,.09,z+1.2,2.8,.016,.12);
    make(group,materials.marking,x+1.2,.09,z+dx,.12,.016,2.8);
   }
   // Passages pietons a chaque carrefour.
   for(let p=-3;p<=3;p++){
    make(group,materials.marking,x+p*1.05,.09,z+6.5,.64,.018,2.6);
    make(group,materials.marking,x+6.5,.09,z+p*1.05,2.6,.018,.64);
   }
   lights.push(trafficLight(group,x+9,z+9,"z"));
   for(const b of cityBuildingsForBlock(cx*2+bx,cz*2+bz))building(group,b);
   for(const tx of [x+12,x+92])for(const tz of [z+30,z+75]){
    make(group,materials.trunk,tx,1.15,tz,.37,2.3,.37,cylinder);
    make(group,materials.tree,tx,3.20,tz,2.3,3.1,2.3,cone);
   }
   // Deux voitures par sous-bloc, sans collision physique: elles ne coincent
   // pas le joueur. Mouvement local sur les axes, avec arret aux feux.
   localTraffic.push(car(group,x+25,z+4.3,"x",bx+bz*4+cx*7+cz*17));
   localTraffic.push(car(group,x+4.3,z+55,"z",bx+bz*4+cx*9+cz*11+2));
  }
  active.set(cx+","+cz,{group,traffic:localTraffic,lights,cx,cz});
 }
 const visibleRadius=1;
 let lastKey="";
 function update(position,time=0){
  const px=position.x,pz=position.z;
  const cx=Math.floor((px-CITY_BOUNDS.minX)/CHUNK),cz=Math.floor((pz-CITY_BOUNDS.minZ)/CHUNK);
  const key=cx+","+cz;
  // Limiter la creation d'objets : seulement 3x3 quartiers autour du joueur.
  if(key!==lastKey){
   lastKey=key;
   for(let ix=cx-visibleRadius;ix<=cx+visibleRadius;ix++)for(let iz=cz-visibleRadius;iz<=cz+visibleRadius;iz++){
    if(ix<0||iz<0||ix>=10||iz>=10)continue;
    if(!active.has(ix+","+iz))chunk(ix,iz);
   }
   for(const [k,item] of active){
    if(Math.abs(item.cx-cx)>visibleRadius||Math.abs(item.cz-cz)>visibleRadius){
     root.remove(item.group);active.delete(k);
    }
   }
  }
  const phase=(time||0)/1000;
  for(const item of active.values()){
   for(const light of item.lights){
    const cycle=phase%28;
    const which=cycle<12?2:cycle<15?1:0;
    light.lamps.forEach((m,i)=>m.visible=i===which);
   }
   for(const c of item.traffic){
    const travel=(phase*c.speed+c.phase)%85;
    // feu rouge = voiture arretee avant le carrefour.
    const cycle=phase%28,limited=cycle>=15?Math.min(travel,76):travel;
    if(c.axis==="x")c.group.position.x=c.originX+(limited-42);
    else c.group.position.z=c.originZ+(limited-42);
   }
  }
 }
 // Activer la vue au point d'entree urbain et ne regenerer qu'au changement
 // de secteur ; renderer.frustumCulled limite le cout des maillages.
 return {root,bounds:CITY_BOUNDS,buildingsForBlock:cityBuildingsForBlock,buildingAt:cityBuildingAt,update,
  listBuildings:()=>{const out=[];for(let x=0;x<20;x++)for(let z=0;z<20;z++)out.push(...cityBuildingsForBlock(x,z));return out;}};
}
