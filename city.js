// FBA City V0.18.60 — feux stop persistants pendant les arrêts.
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
  rear:new THREE.MeshBasicMaterial({color:0x9f1515}),
  brake:new THREE.MeshBasicMaterial({color:0xff3030,toneMapped:false,depthTest:false,depthWrite:false})
 };
 const geometry=new THREE.BoxGeometry(1,1,1),cylinder=new THREE.CylinderGeometry(1,1,1,8),
  cone=new THREE.ConeGeometry(1,1,8),sphere=new THREE.SphereGeometry(1,10,8);
 const active=new Map(),traffic=[];
 // Silhouettes piétonnes légères : uniquement sur les trottoirs des quartiers proches.
 const pedestrianClothes=[0x1e40af,0x9a3412,0x047857,0x6b21a8].map(color=>new THREE.MeshLambertMaterial({color}));
 const pedestrianSkin=new THREE.MeshLambertMaterial({color:0xdcb697});
 function createPedestrian(parent,x,z,alongZ,seed){
  const g=new THREE.Group();parent.add(g);
  const clothes=pedestrianClothes[seed%pedestrianClothes.length];
  make(g,clothes,0,1.08,0,.46,.9,.34);
  make(g,pedestrianSkin,0,1.76,0,.33,.35,.32,sphere);
  const legs=[],arms=[];
  for(const side of [-1,1]){
   const leg=make(g,materials.steel,side*.14,.40,0,.14,.7,.19);
   legs.push(leg);
   const arm=new THREE.Group();arm.position.set(side*.29,1.42,0);g.add(arm);
   make(arm,clothes,side*.04,-.30,0,.15,.62,.19);
   arms.push(arm);
  }
  g.position.set(x,0,z);
  return {g,legs,arms,alongZ,originX:x,originZ:z,phase:seed*1.8,seed};
 }

 const make=(parent,material,x,y,z,w,h,d,geo=geometry)=>{
  const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
 };
 // Terrain de fond tres leger ; les routes sont instanciees localement.
 make(root,materials.grass,0,-.22,1075,2000,.30,2000);
 function building(group,b,detail=true){
  const {x,z,w,d,floors}=b,h=floors*3.1;
  const mat=b.id%3===0?materials.facadeAlt:materials.facade;
  const child=new THREE.Group();child.position.set(x,0,z);group.add(child);
  if(!detail){
   // Silhouette economique des quartiers distants (3 meshes/immeuble).
   make(child,mat,0,h/2,0,w,h,d);
   make(child,materials.roof,0,h+.12,0,w+.45,.24,d+.45);
   // À distance, pas de grand panneau vitré traversant la façade :
   // ce rectangle bleu créait un artefact très visible sur les immeubles.
   for(const side of [-1,1])for(let floor=0;floor<floors;floor++)
    make(child,materials.window,side*w*.31,floor*3.1+1.65,-d/2-.18,1.18,1.32,.035);
   return;
  }
  make(child,materials.floor,0,-.01,0,w,.15,d);
  make(child,mat,-w/2,h/2,0,.28,h,d);
  make(child,mat,w/2,h/2,0,.28,h,d);
  make(child,mat,0,h/2,d/2,w,h,.28);
  // Entree centrale reelle: ouverture de 2.6 m, linteau uniquement au-dessus.
  make(child,mat,-(w+2.6)/4,h/2,-d/2,(w-2.6)/2,h,.28);
  make(child,mat,(w+2.6)/4,h/2,-d/2,(w-2.6)/2,h,.28);
  make(child,mat,0,(h+2.7)/2,-d/2,2.6,h-2.7,.28);
  // Porte pleine, fermée par défaut, articulée sur une charnière.
  // Les joueurs doivent interagir pour ouvrir/fermer le battant.
  make(child,materials.steel,-1.32,1.38,-d/2+.08,.12,2.75,.17);
  make(child,materials.steel,1.32,1.38,-d/2+.08,.12,2.75,.17);
  make(child,materials.steel,0,2.73,-d/2+.08,2.72,.11,.17);
  make(child,materials.steel,0,.12,-d/2-.18,2.7,.15,.55);
  const hinge=new THREE.Group();
  hinge.position.set(-1.25,0,-d/2+.09);child.add(hinge);
  make(hinge,materials.door,1.25,1.37,0,2.47,2.65,.13);
  make(hinge,materials.steel,2.23,1.17,-.09,.10,.07,.07);
  make(hinge,materials.steel,2.23,1.17,.09,.10,.07,.07);
  const registry=group.userData.doors??(group.userData.doors=[]);
  registry.push({x,z:z-d/2,hinge,opened:false});
  // V0.15.01 : véritables planchers avec trémie d'escalier et marches
  // montables en première personne. Chaque volée relie deux étages.
  const stairX=-w/2+4,stairStart=-7.2,stairEnd=3.0,stairWidth=2.2;
  const innerW=w-.5,innerD=d-.6;
  for(let level=0;level<floors;level++){
   const y=level*3.1;
   if(level>0){
    // Ouverture de la cage d'escalier : quatre dalles, pas de plancher
    // traversant les marches. Les étages restent de vraies surfaces.
    const left=-innerW/2,right=innerW/2;
    const a=stairX-stairWidth/2,b=stairX+stairWidth/2;
    make(child,materials.floor,(left+a)/2,y,0,a-left,.18,innerD);
    make(child,materials.floor,(b+right)/2,y,0,right-b,.18,innerD);
    const front=-innerD/2,back=innerD/2;
    make(child,materials.floor,stairX,y,(front+stairStart-.45)/2,stairWidth,.18,stairStart-.45-front);
    make(child,materials.floor,stairX,y,(back+stairEnd+.45)/2,stairWidth,.18,back-(stairEnd+.45));
   }
   if(level<floors-1){
    const risingToBack=level%2===0,steps=15;
    const length=stairEnd-stairStart;
    // Deux volées adjacentes : chacune occupe son côté de la cage.
    // Le palier permet de choisir montée ou descente sans superposer les marches.
    const flightX=stairX+(level%2===0?-.56:.56),flightWidth=.98;
    for(let k=0;k<steps;k++){
     const fraction=(k+1)/steps,stepY=y+fraction*3.1;
     const stepZ=risingToBack?stairStart+(k+.5)*length/steps:
       stairEnd-(k+.5)*length/steps;
     make(child,materials.steel,flightX,stepY-.105,stepZ,flightWidth,.21,length/steps+.025);
    }
    // Main courante le long de la montée.
    for(const side of [-1,1]){
     for(let k=0;k<steps;k+=3){
      const t=(k+1)/steps;
      const rz=risingToBack?stairStart+t*length:stairEnd-t*length;
      make(child,materials.steel,flightX+side*(flightWidth/2+.04),y+3.1*t+.48,rz,.042,.96,.042);
     }
    }
   }
   // Portes de logements en retrait du palier et ouvertures dans les cloisons.
   for(const side of [-1,1]){
    make(child,materials.facadeAlt,side*(w/4+1),y+1.45,3,.16,2.9,d/2-5);
    make(child,materials.door,side*2.7,y+1.1,3,.07,2.2,1.1);
    // Mobilier interieur simple : lit, armoire et table.
    make(child,materials.floor,side*(w/2-3),y+.4,5,1.9,.65,2.2);
    make(child,materials.steel,side*(w/2-2),y+1.05,-3,.8,2.1,.65);
   }
   // Pas de vitrage central : l'entrée doit rester une porte pleine.
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
 function car(parent,x,z,axis,i,blockX,blockZ,carIndex){
  const group=new THREE.Group();group.position.set(x,0,z);parent.add(group);
  if(axis==="x")group.rotation.y=Math.PI/2;
  const color=materials.vehicle[i%materials.vehicle.length];
  make(group,color,0,.58,0,1.65,.57,3.25);
  make(group,color,0,1.06,-.22,1.3,.57,1.7);
  make(group,materials.window,0,1.16,-.30,1.31,.33,1.2);
  for(const side of [-1,1])for(const front of [-1,1]){
   const wheel=make(group,materials.tire,side*.78,.27,front*1.12,.24,.45,.45,sphere);
  }
  // Feux stop distincts, visibles depuis l'arrière et les côtés.
  const brakeLights=[];
  for(const side of [-.55,.55]){
   make(group,materials.marking,side,.65,-1.66,.32,.19,.05);
   make(group,materials.rear,side,.65,1.66,.32,.18,.05);
   const brake=make(group,materials.brake,side,.67,1.83,.48,.31,.10);
   brake.visible=false;brakeLights.push(brake);
  }
  const centerBrake=make(group,materials.brake,0,1.29,1.13,.74,.15,.15);
  centerBrake.visible=false;brakeLights.push(centerBrake);
  // Deux voitures par îlot : même allure et espacement d'un demi-tour de
  // circuit. Elles ne peuvent donc pas se dépasser ou se superposer.
  const speed=5+hash(Math.round(blockX),Math.round(blockZ))*2.5;
  const circuitLength=4*((95.7-4.3-2*3.2)+Math.PI*3.2/2);
  const phase=hash(Math.round(blockX),Math.round(blockZ),31)*circuitLength+
   carIndex*circuitLength/2;
  return {group,axis,speed,phase,originX:x,originZ:z,blockX,blockZ,lights:[],brakeLights,braking:false};
 }
 function chunk(cx,cz,detail){
  const group=new THREE.Group();group.name="Quartier "+cx+","+cz;root.add(group);
  const x0=CITY_BOUNDS.minX+cx*CHUNK,z0=CITY_BOUNDS.minZ+cz*CHUNK;
  const localTraffic=[],lights=[],pedestrians=[];
  for(let bx=0;bx<2;bx++)for(let bz=0;bz<2;bz++){
   const x=x0+bx*100,z=z0+bz*100;
   make(group,materials.asphalt,x+.7,.01,z+50,10,.06,100);
   make(group,materials.asphalt,x+50,.01,z+.7,100,.06,10);
   // Les trottoirs restent dans l'îlot, sans déborder sur les chaussées
   // transversales : ancien segment de 98 m empiétait sur les voies urbaines.
   make(group,materials.paving,x+13,.04,z+50,3,.09,68);
   make(group,materials.paving,x+50,.04,z+13,68,.09,3);
   for(const dx of [20,40,60,80]){
    make(group,materials.marking,x+dx,.09,z+1.2,2.8,.016,.12);
    make(group,materials.marking,x+1.2,.09,z+dx,.12,.016,2.8);
   }
   // Quatre passages PAR îlot, uniquement SUR les deux chaussées
   // réellement construites : deux sur la rue horizontale, deux sur la
   // verticale. Aucun décalage négatif hors de la zone chargée.
   for(let p=-3;p<=3;p++){
    for(const offset of [13.5,86.5]){
     make(group,materials.marking,x+offset,.09,z+p*1.05,2.6,.018,.64);
     make(group,materials.marking,x+p*1.05,.09,z+offset,.64,.018,2.6);
    }
   }
   // Feux sur chaque axe et pour les deux sens de circulation.
   if(detail){
    lights.push(trafficLight(group,x+9,z+9,"z"));
    lights.push(trafficLight(group,x-9,z-9,"z"));
    lights.push(trafficLight(group,x+9,z-9,"x"));
    lights.push(trafficLight(group,x-9,z+9,"x"));
   }
   for(const b of cityBuildingsForBlock(cx*2+bx,cz*2+bz))building(group,b,detail);
   // Hors de l'emprise des bâtiments (façade à x+11 environ).
   for(const tx of [x+8.5,x+91.5])for(const tz of [z+30,z+75]){
    make(group,materials.trunk,tx,1.15,tz,.37,2.3,.37,cylinder);
    make(group,materials.tree,tx,3.20,tz,2.3,3.1,2.3,cone);
   }
   // Mobilier rehaussé au bord du chemin piéton vertical (X=13),
   // dans la percée entre les façades (Z=40..60), entièrement hors route.
   // Deux implantations par sous-bloc, dont une près du trottoir.
   if(detail){
    const benchX=x+16.2,benchZ=z+48;
    // Banquette en bois contrasté : dossier, assise et quatre pieds.
    make(group,materials.door,benchX,.68,benchZ,2.0,.18,.74);
    make(group,materials.door,benchX,1.12,benchZ+.32,2.0,.92,.13);
    for(const dx of [-.77,.77])for(const dz of [-.24,.24])
     make(group,materials.steel,benchX+dx,.33,benchZ+dz,.12,.66,.12);
    // Corbeille avec couvercle sombre, facilement reconnaissable.
    const binX=x+16.2,binZ=z+53.2;
    make(group,materials.steel,binX,.53,binZ,.68,1.06,.68,cylinder);
    make(group,materials.roof,binX,1.1,binZ,.84,.12,.84,cylinder);
    // Jardinière visible avec végétation haute, en dehors de l'allée.
    const potX=x+17.3,potZ=z+44.5;
    make(group,materials.facadeAlt,potX,.40,potZ,1.65,.80,1.65);
    make(group,materials.grass,potX,.85,potZ,1.42,.12,1.42);
    make(group,materials.tree,potX,1.72,potZ,1.40,1.85,1.40,sphere);
   }
   // Deux voitures par sous-bloc, sans collision physique: elles ne coincent
   // pas le joueur. Mouvement local sur les axes, avec arret aux feux.
   if(detail){
    localTraffic.push(car(group,x+25,z+4.3,"x",bx+bz*4+cx*7+cz*17,x,z,0));
    localTraffic.push(car(group,x+4.3,z+55,"z",bx+bz*4+cx*9+cz*11+2,x,z,1));
    // Deux piétons sur les segments de trottoir dégagés entre bâtiments.
    // Petites allées de 6 m : aucune traversée de route ou de stationnement.
    const seed=(bx+bz*2+cx*3+cz*7);
    pedestrians.push(createPedestrian(group,x+13,z+50,true,seed));
    pedestrians.push(createPedestrian(group,x+50,z+13,false,seed+1));
   }
  }
  active.set(cx+","+cz,{group,traffic:localTraffic,lights,pedestrians,cx,cz,detail});
 }
 const visibleRadius=1;
 let lastKey="",lastTrafficTime=null;
 function update(position,time=0){
  const px=position.x,pz=position.z;
  // Le parking rejoint la ville par Z=75. Si le joueur passe juste sous
  // cette limite, garder le premier quartier chargé au lieu de basculer
  // en indice -1 (ce qui faisait disparaître immeubles, portes et voitures).
  const cx=Math.max(0,Math.min(9,Math.floor((px-CITY_BOUNDS.minX)/CHUNK)));
  const cz=Math.max(0,Math.min(9,Math.floor((pz-CITY_BOUNDS.minZ)/CHUNK)));
  const key=cx+","+cz;
  // Limiter la creation d'objets : seulement 3x3 quartiers autour du joueur.
  if(key!==lastKey){
   lastKey=key;
   for(let ix=cx-visibleRadius;ix<=cx+visibleRadius;ix++)for(let iz=cz-visibleRadius;iz<=cz+visibleRadius;iz++){
    if(ix<0||iz<0||ix>=10||iz>=10)continue;
    const detail=ix===cx&&iz===cz;
    const existing=active.get(ix+","+iz);
    if(existing&&existing.detail!==detail){
     root.remove(existing.group);active.delete(ix+","+iz);
    }
    if(!active.has(ix+","+iz))chunk(ix,iz,detail);
   }
   for(const [k,item] of active){
    if(Math.abs(item.cx-cx)>visibleRadius||Math.abs(item.cz-cz)>visibleRadius){
     root.remove(item.group);active.delete(k);
    }
   }
  }
  const phase=(time||0)/1000;
  const trafficDt=lastTrafficTime===null?0:Math.max(0,Math.min(.1,(time-lastTrafficTime)/1000));
  lastTrafficTime=time;
  for(const item of active.values()){
   // Animation procédurale réversible, sans colliseurs ni interactions.
   for(const p of item.pedestrians){
    // Déplacement borné sur 5.6 m avec pauses aux extrémités :
    // marche, arrêt, demi-tour, puis reprise (sans traverser la route).
    const cycle=phase*(.52+(p.seed%3)*.075)+p.phase;
    const travel=Math.sin(cycle);
    const waiting=Math.abs(Math.cos(cycle))<.22;
    const offset=travel*2.8;
    p.g.position.x=p.originX+(p.alongZ?0:offset);
    p.g.position.z=p.originZ+(p.alongZ?offset:0);
    const forward=Math.cos(cycle)>0;
    p.g.rotation.y=p.alongZ?(forward?Math.PI:0):(forward?Math.PI/2:-Math.PI/2);
    const stride=waiting?0:Math.sin(phase*5.6+p.phase)*.26;
    p.legs[0].rotation.x=stride;
    p.legs[1].rotation.x=-stride;
    p.arms[0].rotation.x=-stride*.75;
    p.arms[1].rotation.x=stride*.75;
   }
   for(const light of item.lights){
    const cycle=phase%30;
    const green=light.axis==="x"?cycle>=15&&cycle<27:cycle<12;
    const amber=light.axis==="x"?cycle>=27:cycle>=12&&cycle<15;
    const which=green?2:amber?1:0;
    light.lamps.forEach((m,i)=>m.visible=i===which);
   }
   for(const c of item.traffic){
    // Voie à droite, trajectoire arrondie et cap tangent à la route.
    const min=4.3,max=95.7,radius=3.2;
    const straight=max-min-2*radius,turn=Math.PI*radius/2;
    const lap=4*(straight+turn);
    const nextDistance=((c.distance??c.phase)+trafficDt*c.speed)%lap;
    let distance=nextDistance,lx=min+radius,lz=min,dx=1,dz=0;
    for(let side=0;side<4;side++){
     if(distance<straight){
      const v=distance;
      if(side===0){lx=min+radius+v;lz=min;dx=1;dz=0;}
      else if(side===1){lx=max;lz=min+radius+v;dx=0;dz=1;}
      else if(side===2){lx=max-radius-v;lz=max;dx=-1;dz=0;}
      else{lx=min;lz=max-radius-v;dx=0;dz=-1;}
      break;
     }
     distance-=straight;
     if(distance<turn){
      const a=distance/radius;
      if(side===0){lx=max-radius+radius*Math.sin(a);lz=min+radius-radius*Math.cos(a);dx=Math.cos(a);dz=Math.sin(a);}
      else if(side===1){lx=max-radius+radius*Math.cos(a);lz=max-radius+radius*Math.sin(a);dx=-Math.sin(a);dz=Math.cos(a);}
      else if(side===2){lx=min+radius-radius*Math.sin(a);lz=max-radius+radius*Math.cos(a);dx=-Math.cos(a);dz=-Math.sin(a);}
      else{lx=min+radius-radius*Math.cos(a);lz=min+radius-radius*Math.sin(a);dx=Math.sin(a);dz=-Math.cos(a);}
      break;
     }
     distance-=turn;
    }
    const heading=Math.atan2(-dx,-dz);
    const nextX=c.blockX+lx,nextZ=c.blockZ+lz;
    // Les voitures ne doivent pas traverser le joueur immobile.
    // Elles gardent leur position précédente tant que la zone est occupée.
    const px=position.x,pz=position.z;
    // Toujours céder le passage au joueur, même lorsqu'il avance
    // en direction de la voiture. Aucune exception si elle était déjà proche.
    const safetyRadius=2.55;
    // Tenir compte de la carrosserie déjà arrêtée et de la prochaine position.
    // Sinon le seuil peut osciller à chaque image et laisser les feux éteints.
    const nearPlayer=Math.min(
     Math.hypot(nextX-px,nextZ-pz),
     Math.hypot(c.group.position.x-px,c.group.position.z-pz)
    )<safetyRadius;
    c.braking=nearPlayer;
    for(const lamp of c.brakeLights)lamp.visible=c.braking;
    if(!nearPlayer){
     c.distance=nextDistance;
     c.group.position.x=nextX;
     c.group.position.z=nextZ;
     c.group.rotation.y=heading;
    }
    c.positionReady=true;
   }
  }
 }
 // Entrées manuelles : chercher les portes des quartiers actifs, y compris
 // lorsque le joueur se trouve juste à l'extérieur du bâtiment.
 function entranceNear(x,z,range=2.8){
  let nearest=null,dist=range;
  for(const item of active.values())for(const door of item.group.userData.doors??[]){
   const d=Math.hypot(x-door.x,z-door.z);
   if(d<dist){dist=d;nearest=door;}
  }
  return nearest;
 }
 function toggleEntranceAt(x,z){
  const door=entranceNear(x,z);
  if(!door)return null;
  door.opened=!door.opened;
  door.hinge.rotation.y=door.opened?-Math.PI*.55:0;
  return door.opened;
 }
 function entranceClosedAt(x,z){
  const door=entranceNear(x,z,2.2);
  return !!door&&!door.opened;
 }
 // Collision douce contre les carrosseries : pas de traversée du véhicule.
 function vehicleBlocked(x,z,r=.32,fromX=null,fromZ=null){
  for(const sector of active.values())for(const c of sector.traffic){
   if(!c.group.visible)continue;
   // Collision circulaire : fonctionne dans les virages et dans les
   // quatre sens, sans rectangle orienté selon l'ancien axe du véhicule.
   const radius=1.85+r;
   const distance=Math.hypot(x-c.group.position.x,z-c.group.position.z);
   if(distance>=radius)continue;
   // Lorsque le joueur est déjà trop proche, autoriser uniquement le recul
   // (sinon il resterait définitivement emprisonné dans la collision).
   if(Number.isFinite(fromX)&&Number.isFinite(fromZ)){
    const current=Math.hypot(fromX-c.group.position.x,fromZ-c.group.position.z);
    if(distance>current+.0001)continue;
   }
   return true;
  }
  return false;
 }
 // Lecture seule pour les traversées piétonnes extérieures : aucun effet
 // sur les trajectoires, collisions, vitesses ou feux des voitures.
 function vehicleNear(x,z,r=4){
  for(const sector of active.values())for(const car of sector.traffic){
   if(car.group.visible&&Math.hypot(car.group.position.x-x,car.group.position.z-z)<r)return true;
  }
  return false;
 }
 // Activer la vue au point d'entree urbain et ne regenerer qu'au changement
 // de secteur ; renderer.frustumCulled limite le cout des maillages.
 return {root,bounds:CITY_BOUNDS,buildingsForBlock:cityBuildingsForBlock,buildingAt:cityBuildingAt,update,vehicleBlocked,vehicleNear,toggleEntranceAt,entranceClosedAt,
  listBuildings:()=>{const out=[];for(let x=0;x<20;x++)for(let z=0;z<20;z++)out.push(...cityBuildingsForBlock(x,z));return out;}};
}
