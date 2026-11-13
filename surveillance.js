// FBA Supermarket — PC de vidéosurveillance (V0.14.25)
export function installSurveillance({THREE,scene,camera,renderer,securityOpen,near,openPanel,paragraph,button,toast,releaseMouseLook}){
 const stations=[
  {name:"Entrée / portiques",x:0,z:8.6,look:[0,1.1,3]},
  {name:"Caisses",x:7.5,z:8.5,look:[7,1,-1]},
  {name:"Rayons alimentaires",x:0,z:-1.5,look:[0,1,-6]},
  {name:"Électronique",x:0,z:-26,look:[0,1,-31]},
  {name:"Réserve",x:12,z:5,look:[13,1,11]},
  {name:"Zone de sortie",x:-3,z:8,look:[0,1,9]}
 ];
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
 Object.assign(panel.style,{display:"none",position:"fixed",inset:"0",zIndex:"95",background:"#07111de8",color:"#fff",font:"14px system-ui",padding:"12px",overflow:"auto"});
 panel.innerHTML='<div style="max-width:760px;margin:auto"><h2 style="margin:0 0 6px">PC SÉCURITÉ — FBA SUPERMARKET</h2><p id="fbaCctvStaff"></p><p>Sélectionne une caméra pour regarder le magasin en direct. Échap pour quitter.</p><div id="fbaCctvButtons" style="display:flex;gap:8px;flex-wrap:wrap"></div><p id="fbaCctvNow"></p><button id="fbaCctvClose" style="padding:12px 20px">Quitter la surveillance</button></div>';
 document.body.appendChild(panel);
 const btns=panel.querySelector("#fbaCctvButtons");
 panel.querySelector("#fbaCctvStaff").textContent="3 agents : "+staff.join(" · ");
 const close=()=>{opened=false;active=-1;panel.style.display="none";};
 panel.querySelector("#fbaCctvClose").addEventListener("click",close);
 window.addEventListener("keydown",e=>{if(e.key==="Escape"&&opened){e.preventDefault();close();}});
 stations.forEach((station,i)=>{
  const b=document.createElement("button");b.textContent="CAM "+(i+1)+" · "+station.name;
  Object.assign(b.style,{padding:"10px",borderRadius:"8px",border:"1px solid #38bdf8",background:"#12273c",color:"white",cursor:"pointer"});
  b.addEventListener("click",()=>{active=i;panel.querySelector("#fbaCctvNow").textContent="DIRECT — "+station.name;});
  btns.appendChild(b);
 });
 function show(){
  if(!securityOpen()){toast("PC Sécurité disponible à partir du niveau 22 avec le hall débloqué.");return;}
  releaseMouseLook();opened=true;active=0;panel.style.display="block";
  panel.querySelector("#fbaCctvNow").textContent="DIRECT — "+stations[0].name;
 }
 function showDesk(){
  if(!securityOpen())return;
  openPanel("Local de vidéosurveillance");
  paragraph("3 agents de surveillance en service : "+staff.join(", ")+".");
  paragraph("Six caméras couvrent les accès, les caisses, les rayons et les réserves.");
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
