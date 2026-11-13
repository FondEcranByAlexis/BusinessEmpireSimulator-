// FBA Supermarket — PC de vidéosurveillance (V0.14.26)
export function installSurveillance({THREE,scene,camera,renderer,securityOpen,near,openPanel,paragraph,button,toast,releaseMouseLook,departments=[]}){
 const stations=[
  {name:"Entrée / portiques",x:0,z:8.6,look:[0,1.1,3]},
  {name:"Caisses",x:7.5,z:8.5,look:[7,1,-1]},
  {name:"Rayons alimentaires",x:0,z:-1.5,look:[0,1,-6]},
  {name:"Électronique",x:0,z:-26,look:[0,1,-31]},
  {name:"Réserve",x:12,z:5,look:[13,1,11]},
  {name:"Zone de sortie",x:-3,z:8,look:[0,1,9]}
 ];
 departments.forEach((d,i)=>stations.push({name:"Galerie · "+d.name,x:d.x,z:d.z,look:[d.x,1.15,d.z-2],department:d}));
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
 const panel=document.createElement("div");
 Object.assign(panel.style,{display:"none",position:"fixed",inset:"0",zIndex:"95",pointerEvents:"none",color:"#fff",font:"13px system-ui"});
 panel.innerHTML='<div style="position:absolute;top:0;left:0;right:0;background:#07111de8;padding:8px;pointer-events:auto;max-height:30vh;overflow:auto"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><strong>PC SÉCURITÉ · DIRECT</strong><button id="fbaCctvClose" style="padding:7px 12px">Quitter ✕</button></div><div id="fbaCctvNow" style="margin:4px 0"></div><div id="fbaCctvButtons" style="display:flex;gap:5px;flex-wrap:wrap"></div></div><div style="position:absolute;bottom:8px;left:10px;background:#07111dc9;padding:6px;border-radius:5px;pointer-events:none">● EN DIRECT · 3 opérateurs</div>';
 document.body.appendChild(panel);
 const btns=panel.querySelector("#fbaCctvButtons");
 const close=()=>{opened=false;active=-1;panel.style.display="none";};
 panel.querySelector("#fbaCctvClose").addEventListener("click",close);
 window.addEventListener("keydown",e=>{if(e.key==="Escape"&&opened){e.preventDefault();close();}});
 const buttons=[];
 stations.forEach((station,i)=>{
  const b=document.createElement("button");b.textContent="CAM "+String(i+1).padStart(2,"0")+" · "+station.name;
  Object.assign(b.style,{padding:"6px",borderRadius:"5px",border:"1px solid #38bdf8",background:"#12273c",color:"white",cursor:"pointer",fontSize:"11px"});
  b.addEventListener("click",()=>select(i));btns.appendChild(b);buttons.push(b);
 });
 function select(i){
  const station=stations[i];
  if(station.department&&!station.department.unlocked()){
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
  cctv.position.set(s.x,3.2,s.z);cctv.lookAt(...s.look);
  cctv.aspect=camera.aspect;cctv.updateProjectionMatrix();
  renderer.render(scene,cctv);
  return true;
 }
 return {show,showDesk,render,isOpen:()=>opened,nearRoom:()=>near(position.x,position.z,3.5)};
}
