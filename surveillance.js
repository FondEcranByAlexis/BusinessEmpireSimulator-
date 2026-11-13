// FBA Supermarket — PC de vidéosurveillance (V0.14.35)
export function installSurveillance({THREE,scene,camera,renderer,securityOpen,near,openPanel,paragraph,button,toast,releaseMouseLook,departments=[],extensionUnlocked=()=>true,autoUnlocked=()=>false}){
 const stations=[
  {name:"Entrée / portiques",x:0,z:8.6,look:[0,1.1,3]},
  {name:"Caisses",x:7.5,z:8.5,look:[7,1,-1]},
  {name:"Rayons alimentaires",x:0,z:-1.5,look:[0,1,-6]},
  {name:"Électronique",x:0,z:-26,look:[0,1,-31]},
  {name:"Réserve",x:12,z:5,look:[13,1,11]},
  {name:"Zone de sortie",x:-3,z:8,look:[0,1,9]},
  {name:"Chambre froide",x:18.4,z:3.5,look:[18.4,1.3,8.6]},
  {name:"Zone de livraison",x:26,z:-10,look:[26,1.2,-17]},
  {name:"Première extension",x:0,z:-13.5,look:[0,1.2,-8],unlocked:extensionUnlocked},
  {name:"Vue générale des caisses",x:3.5,z:10,look:[5,1.15,4],wide:true}
 ];
 departments.forEach((d,i)=>stations.push({name:"Galerie · "+d.name,x:d.x,z:d.z,look:[d.x,1.15,d.front+1.5],department:d}));
 // Deux caméras par zone, placées aux extrémités et orientées l'une vers l'autre.
 // Les nouvelles caméras sont ajoutées après les anciennes pour préserver les réglages sauvegardés.
 const originals=[...stations];
 for(const station of originals){
  const firstZ=station.fixtureZ??(station.department?station.z-2.8:station.z);
  const secondZ=station.department?station.z+2.8:station.z+(station.name==="Zone de livraison"?-6:4);
  stations.push({
   name:station.name+" · opposée",x:station.x,z:secondZ,
   fixtureZ:secondZ,
   look:[station.x,1.2,firstZ],
   department:station.department,unlocked:station.unlocked,wide:station.wide
  });
 }
 // Supprimer les anciennes CAM 30, 31, 35 et 39 (numérotation V0.14.35).
 const removed=new Set([29,30,34,38]);
 const retained=stations.map((station,index)=>({...station,legacyIndex:index})).filter(station=>!removed.has(station.legacyIndex));
 stations.length=0;stations.push(...retained);
 // Showroom automobile : deux angles opposés dans le volume intérieur x=-30..-10, z=-22..-12.
 stations.push(
  {name:"Zone automobile · côté ouest",x:-28.3,z:-20.2,look:[-12.3,1.2,-14.1],unlocked:autoUnlocked},
  {name:"Zone automobile · côté est",x:-11.7,z:-13.8,look:[-27.5,1.2,-19.7],unlocked:autoUnlocked}
 );
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const PTZ_KEY="fba-cctv-orientations-v1";
 let savedAngles={};
 try{savedAngles=JSON.parse(localStorage.getItem(PTZ_KEY)||"{}")||{};}catch{}
 stations.forEach((station,i)=>{
  const originZ=station.fixtureZ??(station.department?station.z-2.8:station.z);
  const dx=station.look[0]-station.x,dy=station.look[1]-3.32,dz=station.look[2]-(originZ+.42);
  station.defaultYaw=Math.atan2(dx,dz);
  station.defaultPitch=Math.atan2(dy,Math.hypot(dx,dz));
  station.yaw=Number.isFinite(savedAngles[station.legacyIndex??(100+i)]?.yaw)?savedAngles[i].yaw:station.defaultYaw;
  station.pitch=Number.isFinite(savedAngles[station.legacyIndex??(100+i)]?.pitch)?savedAngles[i].pitch:station.defaultPitch;
 });
 const staff=["Camille — rayons","Rayan — caisses","Nora — incidents"];
 const position={x:-13,z:8.1};
 let active=-1,opened=false,page=0;
 const PER_PAGE=6;
 const cctv=new THREE.PerspectiveCamera(66,1,0.1,120);
 const root=new THREE.Group();root.position.set(position.x,0,position.z);scene.add(root);
 const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.75});
 const floor=mat(0x253449),desk=mat(0x4b5563),screen=mat(0x0b1220),glow=new THREE.MeshBasicMaterial({color:0x38bdf8});
 const cube=(w,h,d,m,x,y,z)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);root.add(mesh);return mesh;};
 // Poste physique : trois opérateurs, trois écrans et mobilier.
 cube(5,.12,2.1,floor,0,.06,0);
 for(let i=0;i<3;i++){
  const x=(i-1)*1.45;
  cube(1.25,.12,.65,desk,x,.82,-.48);
  cube(.68,.43,.055,screen,x,1.14,-.75);
  cube(.57,.29,.008,glow,x,1.14,-.718);
  cube(.13,.32,.13,desk,x,.94,-.69);
  cube(.52,.12,.42,desk,x,.43,.4);
  cube(.3,.65,.27,mat([0x2563eb,0x16a34a,0x7c3aed][i]),x,1.04,.43);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),mat(0xd8aa86));
  head.position.set(x,1.51,.43);root.add(head);
 }
 // Caméras physiques visibles au plafond, avec support et objectif orienté vers l'entrée.
 const cameraBody=new THREE.MeshStandardMaterial({color:0xe2e8f0,metalness:.35,roughness:.35});
 const cameraLens=new THREE.MeshStandardMaterial({color:0x111827,metalness:.2,roughness:.2});
 const cameraLight=new THREE.MeshBasicMaterial({color:0x22c55e});
 for(const station of stations){
  const fixture=new THREE.Group();
  // En galerie, installer la caméra dans le fond du local, orientée vers l'entrée (+Z).
  fixture.position.set(station.x,3.45,station.fixtureZ??(station.department?station.z-2.8:station.z));
  const mount=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.3,10),cameraBody);
  mount.position.y=.17;fixture.add(mount);
  const housing=new THREE.Mesh(new THREE.BoxGeometry(.34,.18,.42),cameraBody);
  housing.position.set(0,0,.14);fixture.add(housing);
  const lens=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.045,12),cameraLens);
  lens.rotation.x=Math.PI/2;lens.position.set(0,0,.365);fixture.add(lens);
  const led=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),cameraLight);
  led.position.set(.12,.04,.365);fixture.add(led);
  const target=new THREE.Vector3(...station.look);
  fixture.rotation.y=Math.atan2(target.x-fixture.position.x,target.z-fixture.position.z);
  scene.add(fixture);
  station.fixture=fixture;
  fixture.rotation.y=station.yaw;
 }
 const panel=document.createElement("div");
 Object.assign(panel.style,{display:"none",position:"fixed",inset:"0",zIndex:"95",pointerEvents:"none",color:"#fff",font:"13px system-ui"});
 panel.innerHTML='<div style="position:absolute;top:0;left:0;right:0;background:#07111de8;padding:8px;pointer-events:auto"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><strong>PC SÉCURITÉ · 6 CAMÉRAS</strong><button id="fbaCctvClose" style="padding:7px 12px">Quitter ✕</button></div><div style="display:flex;align-items:center;gap:8px;margin-top:5px"><button id="fbaCctvPrev">◀ Précédent</button><strong id="fbaCctvPage"></strong><button id="fbaCctvNext">Suivant ▶</button><span id="fbaCctvNow"></span></div></div><div id="fbaCctvTiles" style="position:absolute;inset:78px 0 0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));pointer-events:none"></div>';
 document.body.appendChild(panel);
 const controls=document.createElement("div");
 Object.assign(controls.style,{position:"absolute",right:"10px",top:"88px",display:"grid",gridTemplateColumns:"repeat(3,42px)",gap:"5px",pointerEvents:"auto",background:"#07111dcc",padding:"8px",borderRadius:"10px"});
 panel.appendChild(controls);
 const adjust=(yaw,pitch)=>{
  if(active<0)return;
  const station=stations[active];
  station.yaw+=yaw;station.pitch=clamp(station.pitch+pitch,-1.35,1.1);
  station.fixture.rotation.y=station.yaw;
  try{localStorage.setItem(PTZ_KEY,JSON.stringify(Object.fromEntries(stations.map((s,i)=>[s.legacyIndex??(100+i),{yaw:s.yaw,pitch:s.pitch}]))));}catch{}
 };
 const control=(symbol,dy,dp)=>{
  const b=document.createElement("button");b.textContent=symbol;
  Object.assign(b.style,{height:"38px",minWidth:"38px",fontSize:"19px",background:"#164e63",color:"white",border:"1px solid #67e8f9",borderRadius:"6px",cursor:"pointer"});
  if(symbol==="↺")b.addEventListener("click",()=>{if(active<0)return;const a=stations[active];adjust(a.defaultYaw-a.yaw,a.defaultPitch-a.pitch);});
  else b.addEventListener("click",()=>adjust(dy,dp));
  controls.appendChild(b);
 };
 control("↺",0,0);control("↑",0,.09);control("·",0,0);
 control("←",-.12,0);control("↓",0,-.09);control("→",.12,0);
 const btns=panel.querySelector("#fbaCctvButtons");
 const close=()=>{opened=false;active=-1;panel.style.display="none";};
 panel.querySelector("#fbaCctvClose").addEventListener("click",close);
 window.addEventListener("keydown",e=>{
  if(!opened)return;
  if(e.key==="Escape"){e.preventDefault();close();return;}
  const keys={ArrowLeft:[.08,0],ArrowRight:[-.08,0],ArrowUp:[0,.07],ArrowDown:[0,-.07]};
  if(keys[e.key]){e.preventDefault();adjust(...keys[e.key]);}
 });
 let drag=null;
 renderer.domElement.addEventListener("pointerdown",e=>{if(!opened)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};renderer.domElement.setPointerCapture?.(e.pointerId);});
 renderer.domElement.addEventListener("pointermove",e=>{if(!opened||!drag||drag.id!==e.pointerId)return;adjust((e.clientX-drag.x)*.005,(drag.y-e.clientY)*.004);drag.x=e.clientX;drag.y=e.clientY;});
 renderer.domElement.addEventListener("pointerup",()=>drag=null);
 renderer.domElement.addEventListener("pointercancel",()=>drag=null);
 const tiles=panel.querySelector("#fbaCctvTiles");
 const buttons=[];
 for(let i=0;i<PER_PAGE;i++){
  const b=document.createElement("button");
  Object.assign(b.style,{alignSelf:"start",justifySelf:"start",margin:"6px",padding:"5px 8px",background:"#07111de8",border:"1px solid #38bdf8",borderRadius:"5px",color:"white",fontSize:"11px",pointerEvents:"auto",cursor:"pointer",maxWidth:"90%"});
  b.addEventListener("click",()=>select(page*PER_PAGE+i));
  tiles.appendChild(b);buttons.push(b);
 }
 const locked=station=>(station.department&&!station.department.unlocked())||(station.unlocked&&!station.unlocked());
 const pageCount=Math.ceil(stations.length/PER_PAGE);
 function refreshPage(){
  panel.querySelector("#fbaCctvPage").textContent="Écran "+(page+1)+" / "+pageCount;
  panel.querySelector("#fbaCctvPrev").disabled=page===0;
  panel.querySelector("#fbaCctvNext").disabled=page>=pageCount-1;
  buttons.forEach((b,j)=>{
   const i=page*PER_PAGE+j,station=stations[i];
   b.style.display=station?"block":"none";
   if(!station)return;
   b.textContent="CAM "+String(i+1).padStart(2,"0")+" · "+station.name+(locked(station)?" · VERROUILLÉE":"");
   b.style.background=active===i?"#075985":"#07111de8";
  });
 }
 function select(i){
  const station=stations[i];if(!station)return;
  if(locked(station)){toast("Cette zone n'est pas encore ouverte.");return;}
  active=i;page=Math.floor(i/PER_PAGE);
  panel.querySelector("#fbaCctvNow").textContent="· Orientation : CAM "+String(i+1).padStart(2,"0");
  refreshPage();
 }
 panel.querySelector("#fbaCctvPrev").addEventListener("click",()=>{if(page>0){page--;active=page*PER_PAGE;refreshPage();}});
 panel.querySelector("#fbaCctvNext").addEventListener("click",()=>{if(page<pageCount-1){page++;active=page*PER_PAGE;refreshPage();}});
 function show(){
  if(!securityOpen()){toast("PC Sécurité disponible au niveau 22 avec le hall débloqué.");return;}
  releaseMouseLook();opened=true;page=0;panel.style.display="block";select(0);refreshPage();
 }
 function showDesk(){
  if(!securityOpen())return;
  openPanel("Local de vidéosurveillance");
  paragraph("Trois opérateurs · "+stations.length+" caméras, dont une par zone de galerie.");
  button(document.querySelector("#panel")||document.body,"Voir les caméras en direct",show);
 }
 // Rend la vue CCTV sur le moteur 3D existant, sans créer un second contexte WebGL.
 function render(){
  if(!opened)return false;
  const size=renderer.getSize(new THREE.Vector2());
  const w=size.x,h=size.y,top=78;
  const availableHeight=Math.max(1,h-top);
  const tileW=w/3,tileH=availableHeight/2;
  const previousAutoClear=renderer.autoClear;
  renderer.autoClear=false;
  renderer.setScissorTest(true);
  try{
   for(let j=0;j<PER_PAGE;j++){
    const i=page*PER_PAGE+j,station=stations[i];
    const col=j%3,row=Math.floor(j/3);
    const x=Math.floor(col*tileW),y=Math.floor((1-row)*tileH);
    const vw=Math.ceil(tileW),vh=Math.ceil(tileH);
    renderer.setViewport(x,y,vw,vh);
    renderer.setScissor(x,y,vw,vh);
    renderer.setClearColor(0x07111d,1);renderer.clear(true,true,true);
    if(!station||locked(station))continue;
    cctv.position.set(station.fixture.position.x,3.32,station.fixture.position.z+.42);
    cctv.fov=station.wide?95:66;
    cctv.lookAt(cctv.position.x+Math.sin(station.yaw)*Math.cos(station.pitch),cctv.position.y+Math.sin(station.pitch),cctv.position.z+Math.cos(station.yaw)*Math.cos(station.pitch));
    cctv.aspect=vw/vh;cctv.updateProjectionMatrix();
    renderer.render(scene,cctv);
   }
  }finally{
   renderer.setScissorTest(false);
   renderer.setViewport(0,0,w,h);
   renderer.autoClear=previousAutoClear;
  }
  return true;
 }
 function detectAt(x,z){
  // Détection de proximité dans le champ de vision horizontal de la caméra.
  return stations.some(station=>{
   if(station.department&&!station.department.unlocked())return false;
   if(station.unlocked&&!station.unlocked())return false;
   const px=station.fixture.position.x,pz=station.fixture.position.z+.42;
   const dx=x-px,dz=z-pz,dist=Math.hypot(dx,dz);
   if(dist<.5||dist>11)return false;
   const delta=Math.atan2(Math.sin(Math.atan2(dx,dz)-station.yaw),Math.cos(Math.atan2(dx,dz)-station.yaw));
   return Math.abs(delta)<(station.wide?95:66)*Math.PI/360;
  });
 }
 return {show,showDesk,render,detectAt,isOpen:()=>opened,nearRoom:()=>near(position.x,position.z,3.5)};
}
