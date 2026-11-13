// FBA Supermarket — PC de vidéosurveillance (V0.14.29)
export function installSurveillance({THREE,scene,camera,renderer,securityOpen,near,openPanel,paragraph,button,toast,releaseMouseLook,departments=[],extensionUnlocked=()=>true}){
 const stations=[
  {name:"Entrée / portiques",x:0,z:8.6,look:[0,1.1,3]},
  {name:"Caisses",x:7.5,z:8.5,look:[7,1,-1]},
  {name:"Rayons alimentaires",x:0,z:-1.5,look:[0,1,-6]},
  {name:"Électronique",x:0,z:-26,look:[0,1,-31]},
  {name:"Réserve",x:12,z:5,look:[13,1,11]},
  {name:"Zone de sortie",x:-3,z:8,look:[0,1,9]},
  {name:"Chambre froide",x:18.4,z:3.5,look:[18.4,1.3,8.6]},
  {name:"Zone de livraison",x:26,z:13,look:[24,1.2,7]},
  {name:"Première extension",x:0,z:-13.5,look:[0,1.2,-8],unlocked:extensionUnlocked},
  {name:"Vue générale des caisses",x:3.5,z:10,look:[5,1.15,4],wide:true}
 ];
 departments.forEach((d,i)=>stations.push({name:"Galerie · "+d.name,x:d.x,z:d.z,look:[d.x,1.15,d.front+1.5],department:d}));
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const PTZ_KEY="fba-cctv-orientations-v1";
 let savedAngles={};
 try{savedAngles=JSON.parse(localStorage.getItem(PTZ_KEY)||"{}")||{};}catch{}
 stations.forEach((station,i)=>{
  const originZ=station.department?station.z-2.8:station.z;
  const dx=station.look[0]-station.x,dy=station.look[1]-2.92,dz=station.look[2]-(originZ+.42);
  station.defaultYaw=Math.atan2(dx,dz);
  station.defaultPitch=Math.atan2(dy,Math.hypot(dx,dz));
  station.yaw=Number.isFinite(savedAngles[i]?.yaw)?savedAngles[i].yaw:station.defaultYaw;
  station.pitch=Number.isFinite(savedAngles[i]?.pitch)?savedAngles[i].pitch:station.defaultPitch;
 });
 const staff=["Camille — rayons","Rayan — caisses","Nora — incidents"];
 const position={x:-13,z:8.1};
 let active=-1,opened=false;
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
  fixture.position.set(station.x,3.05,station.department?station.z-2.8:station.z);
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
 panel.innerHTML='<div style="position:absolute;top:0;left:0;right:0;background:#07111de8;padding:8px;pointer-events:auto;max-height:30vh;overflow:auto"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><strong>PC SÉCURITÉ · DIRECT</strong><button id="fbaCctvClose" style="padding:7px 12px">Quitter ✕</button></div><div id="fbaCctvNow" style="margin:4px 0"></div><div id="fbaCctvButtons" style="display:flex;gap:5px;flex-wrap:wrap"></div></div><div style="position:absolute;bottom:8px;left:10px;background:#07111dc9;padding:6px;border-radius:5px;pointer-events:none">● EN DIRECT · 3 opérateurs</div>';
 document.body.appendChild(panel);
 const controls=document.createElement("div");
 Object.assign(controls.style,{position:"absolute",right:"10px",bottom:"10px",display:"grid",gridTemplateColumns:"repeat(3,42px)",gap:"5px",pointerEvents:"auto",background:"#07111dcc",padding:"8px",borderRadius:"10px"});
 panel.appendChild(controls);
 const adjust=(yaw,pitch)=>{
  if(active<0)return;
  const station=stations[active];
  station.yaw+=yaw;station.pitch=clamp(station.pitch+pitch,-1.35,1.1);
  station.fixture.rotation.y=station.yaw;
  try{localStorage.setItem(PTZ_KEY,JSON.stringify(Object.fromEntries(stations.map((s,i)=>[i,{yaw:s.yaw,pitch:s.pitch}]))));}catch{}
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
  const keys={ArrowLeft:[-.08,0],ArrowRight:[.08,0],ArrowUp:[0,.07],ArrowDown:[0,-.07]};
  if(keys[e.key]){e.preventDefault();adjust(...keys[e.key]);}
 });
 let drag=null;
 renderer.domElement.addEventListener("pointerdown",e=>{if(!opened)return;drag={x:e.clientX,y:e.clientY,id:e.pointerId};renderer.domElement.setPointerCapture?.(e.pointerId);});
 renderer.domElement.addEventListener("pointermove",e=>{if(!opened||!drag||drag.id!==e.pointerId)return;adjust((e.clientX-drag.x)*.005,(drag.y-e.clientY)*.004);drag.x=e.clientX;drag.y=e.clientY;});
 renderer.domElement.addEventListener("pointerup",()=>drag=null);
 renderer.domElement.addEventListener("pointercancel",()=>drag=null);
 const buttons=[];
 stations.forEach((station,i)=>{
  const b=document.createElement("button");b.textContent="CAM "+String(i+1).padStart(2,"0")+" · "+station.name;
  Object.assign(b.style,{padding:"6px",borderRadius:"5px",border:"1px solid #38bdf8",background:"#12273c",color:"white",cursor:"pointer",fontSize:"11px"});
  b.addEventListener("click",()=>select(i));btns.appendChild(b);buttons.push(b);
 });
 function select(i){
  const station=stations[i];
  if((station.department&&!station.department.unlocked())||(station.unlocked&&!station.unlocked())){
   toast("Cette zone de galerie n'est pas encore ouverte.");return;
  }
  active=i;
  panel.querySelector("#fbaCctvNow").textContent="CAM "+String(i+1).padStart(2,"0")+" — "+station.name;
  buttons.forEach((b,j)=>b.style.background=j===i?"#075985":"#12273c");
 }
 function show(){
  if(!securityOpen()){toast("PC Sécurité disponible au niveau 22 avec le hall débloqué.");return;}
  releaseMouseLook();opened=true;panel.style.display="block";select(0);
 }
 function showDesk(){
  if(!securityOpen())return;
  openPanel("Local de vidéosurveillance");
  paragraph("Trois opérateurs · "+stations.length+" caméras, dont une par zone de galerie.");
  button(document.querySelector("#panel")||document.body,"Voir les caméras en direct",show);
 }
 // Rend la vue CCTV sur le moteur 3D existant, sans créer un second contexte WebGL.
 function render(){
  if(!opened||active<0)return false;
  const s=stations[active];
  cctv.position.set(s.fixture.position.x,2.92,s.fixture.position.z+.42);
  cctv.fov=s.wide?95:66;
  cctv.rotation.order="YXZ";cctv.rotation.set(-s.pitch,s.yaw,0);
  cctv.aspect=camera.aspect;cctv.updateProjectionMatrix();
  renderer.render(scene,cctv);
  return true;
 }
 return {show,showDesk,render,isOpen:()=>opened,nearRoom:()=>near(position.x,position.z,3.5)};
}
