// Business Empire Simulator V0.18.39 — correction du panneau d'accès réservé d'implantation des équipements de sécurité du bâtiment.
// Accessoires visuels sans collisions : ils n'altèrent ni les chemins des employés,
// ni les accès aux rayons, ni les points de livraison.
export function installBuildingSafety({THREE,scene,camera,notify}){
 const root=new THREE.Group();root.name="BES — Sécurité du bâtiment";scene.add(root);
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.72,...extra});
 const red=mat(0xc91f27),dark=mat(0x273449),metal=mat(0xcbd5e1,{metalness:.4,roughness:.4});
 const green=mat(0x087c42,{emissive:0x024b26,emissiveIntensity:.35});
 const glow=new THREE.MeshBasicMaterial({color:0xcaffdf, toneMapped:false});
 const white=new THREE.MeshBasicMaterial({color:0xffffff});
 const items=[];
 function block(parent,x,y,z,w,h,d,material){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z);parent.add(mesh);return mesh;
 }
 function label(parent,text,w=.95,h=.26,background="#166534",foreground="#ffffff"){
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=144;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle=background;ctx.fillRect(0,0,512,144);
  ctx.strokeStyle="#ffffff";ctx.lineWidth=9;ctx.strokeRect(6,6,500,132);
  ctx.fillStyle=foreground;ctx.font="bold 52px Arial";ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillText(text,256,75,470);
  const texture=new THREE.CanvasTexture(canvas);
  texture.colorSpace=THREE.SRGBColorSpace;
  // Deux véritables faces lisibles : jamais de texture vue par son verso (texte inversé).
  const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide,depthWrite:false});
  const front=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
  front.position.z=.009;parent.add(front);
  const reverse=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);
  reverse.rotation.y=Math.PI;reverse.position.z=-.009;parent.add(reverse);
  return front;
 }
 function extinguisher(x,z,rotation,name){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);
  block(g,0,1.37,-.025,.39,.86,.09,dark); // panneau support mural
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.105,.11,.52,12),red);
  body.position.set(0,1.17,.15);g.add(body);
  block(g,0,1.45,.15,.18,.09,.13,red);
  block(g,0,1.55,.15,.055,.12,.07,metal);
  const hose=new THREE.Mesh(new THREE.TorusGeometry(.085,.013,5,12,Math.PI),dark);
  hose.position.set(.105,1.37,.24);hose.rotation.z=Math.PI/2;g.add(hose);
  const sign=label(g,"EXTINCTEUR",.70,.21,"#b91c1c");sign.position.set(0,1.82,.14);
  items.push({x,z,name:"Extincteur — "+name,kind:"ext"});
 }
 function exitSign(x,z,rotation,title){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);
  block(g,0,3.35,0,1.65,.44,.09,green);
  const s=label(g,title,1.54,.34,"#087c42");s.position.set(0,3.35,.065);
  block(g,0,3.08,.02,.24,.08,.12,glow);
  items.push({x,z,name:title,kind:"exit"});
 }
 function emergencyLight(x,z){
  const g=new THREE.Group();g.position.set(x,0,z);root.add(g);
  // Bloc de secours visible depuis le sol : lentille lumineuse et éclairage local.
  block(g,0,4.62,0,.78,.22,.34,metal);
  block(g,0,4.49,.19,.65,.13,.045,glow);
  for(const offset of [-.24,.24]){
   const bulb=new THREE.Mesh(new THREE.SphereGeometry(.105,10,8),glow);
   bulb.position.set(offset,4.43,.23);g.add(bulb);
  }
  const marker=label(g,"SECOURS",.64,.17,"#087c42");marker.position.set(0,4.20,.22);
  // Pas d'ombre portée : éclairage léger sur téléphone comme sur PC.
  const light=new THREE.PointLight(0xbaffdf,1.65,5.5,2);
  light.position.set(0,4.32,.24);light.castShadow=false;g.add(light);
 }
 function evacuationPlan(x,z,rotation){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);
  block(g,0,1.65,0,.84,1.12,.045,dark);
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=680;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#f8fafc";ctx.fillRect(0,0,512,680);
  ctx.fillStyle="#047857";ctx.fillRect(0,0,512,90);
  ctx.fillStyle="#ffffff";ctx.font="bold 36px Arial";ctx.textAlign="center";ctx.fillText("PLAN D'ÉVACUATION",256,55);
  ctx.strokeStyle="#334155";ctx.lineWidth=16;ctx.strokeRect(54,144,404,385);
  ctx.strokeStyle="#94a3b8";ctx.lineWidth=9;
  for(const x of [158,260,360]){ctx.beginPath();ctx.moveTo(x,153);ctx.lineTo(x,420);ctx.stroke();}
  ctx.strokeStyle="#16a34a";ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(256,452);ctx.lineTo(256,575);ctx.stroke();
  ctx.fillStyle="#15803d";ctx.beginPath();ctx.moveTo(225,562);ctx.lineTo(287,562);ctx.lineTo(256,604);ctx.fill();
  ctx.font="bold 23px Arial";ctx.fillStyle="#0f172a";ctx.fillText("Sortie principale",256,645);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(.78,1.04),new THREE.MeshBasicMaterial({map:texture,side:THREE.FrontSide}));
  panel.position.z=.045;panel.position.y=1.65;g.add(panel);
  items.push({x,z,name:"Plan d'évacuation",kind:"plan"});
 }
 function staffMark(x,z,rotation){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);
  // Fixé à hauteur de regard sur le mur permanent juste avant l'entrée de la réserve (côté magasin).
  const back=block(g,0,2.28,0,2.16,.44,.09,dark);
  const s=label(g,"ACCÈS PERSONNEL",2.06,.35,"#1e3a8a");s.position.set(0,2.28,.065);
  // Contraste constant, même lorsque les lumières du magasin sont éteintes.
  items.push({x,z,name:"Accès réservé au personnel",kind:"staff"});
 }
 // Placement en bordure de circulation. Aucun colliseur ajouté.
 extinguisher(-9.78,8.15,Math.PI/2,"entrée de la surface de vente");
 extinguisher(9.78,7.75,-Math.PI/2,"près de l’entrée du magasin");
 // Mur permanent nord de réserve (z=1.5) : pas dans la baie d’accès x=10, z=4..7.
 extinguisher(12.65,1.72,0,"réserve sèche");
 // Face intérieure du mur de la zone logistique x≈24.
 extinguisher(23.82,-18.2,-Math.PI/2,"zone de livraison");
 exitSign(0,9.02,Math.PI,"SORTIE  ↓");
 exitSign(25.5,-23.7,0,"ISSUE / QUAI");
 emergencyLight(-6,7.3);emergencyLight(6,7.3);
 emergencyLight(12,9.3);emergencyLight(25.5,-22.5);
 // Mur de façade permanente côté surface de vente, hors paroi d’extension.
 evacuationPlan(-6.4,9.73,Math.PI);
 // Entrée de zone réservée : mur côté vente x=9.78, avant la baie vers la réserve z≈4..7.
 // Décalé du panneau ZONE STOCKAGE situé au-dessus de la baie et de l'extincteur près de l'entrée.
 staffMark(9.76,2.72,-Math.PI/2);
 function nearby(maxDistance=1.65){
  let closest=null,best=maxDistance;
  for(const item of items){
   const d=Math.hypot(camera.position.x-item.x,camera.position.z-item.z);
   if(d<best){best=d;closest=item;}
  }
  return closest;
 }
 function interact(){
  const target=nearby();
  if(!target)return false;
  if(target.kind==="ext")notify(target.name+" · équipement de sécurité installé. Aucun incendie en cours.");
  else if(target.kind==="plan")notify("Plan d'évacuation : repérez les issues et gardez les passages libres.");
  else if(target.kind==="staff")notify("Accès du personnel : laissez le passage logistique dégagé.");
  else notify(target.name+" · sortie signalée. Suivez les accès existants.");
  return true;
 }
 return {nearby,interact};
}
