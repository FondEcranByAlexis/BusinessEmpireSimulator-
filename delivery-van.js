// FBA GAMES — véhicule léger de livraison locale (V0.15.02).
// Une instance uniquement ; aucune dépendance à un modèle externe.
export function makeDeliveryVan({THREE,scene}){
 const root=new THREE.Group();root.name="FBA Livraison";scene.add(root);
 const mats={
  body:new THREE.MeshStandardMaterial({color:0xf8fafc,metalness:.25,roughness:.55}),
  trim:new THREE.MeshStandardMaterial({color:0x1e293b,metalness:.35,roughness:.55}),
  window:new THREE.MeshStandardMaterial({color:0x53819b,metalness:.2,roughness:.16,transparent:true,opacity:.88}),
  tire:new THREE.MeshStandardMaterial({color:0x131820,roughness:.91}),
  wheel:new THREE.MeshStandardMaterial({color:0x94a3b8,metalness:.7,roughness:.3}),
  blue:new THREE.MeshStandardMaterial({color:0x0284c7,metalness:.3,roughness:.42}),
  head:new THREE.MeshBasicMaterial({color:0xfff7d6}),
  tail:new THREE.MeshBasicMaterial({color:0xef4444})
 };
 const cube=(x,y,z,w,h,d,mat)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);root.add(mesh);return mesh;
 };
 cube(0,.95,.0,1.95,1.32,4.25,mats.body);
 cube(0,2.02,.38,1.95,.88,3.45,mats.body);
 cube(0,1.68,-1.39,1.69,.70,.045,mats.window);
 for(const sign of [-1,1]){
  cube(sign*.987,1.70,-.86,.05,.56,.80,mats.window);
  cube(sign*.985,1.7,.88,.05,.52,1.00,mats.body);
  cube(sign*.84,.65,-1.85,.16,.18,.11,mats.head);
  cube(sign*.84,.70,2.12,.16,.20,.11,mats.tail);
  for(const z of [-1.39,1.34]){
   const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.38,.38,.18,12),mats.tire);
   wheel.rotation.z=Math.PI/2;wheel.position.set(sign*1.04,.41,z);root.add(wheel);
   const hub=new THREE.Mesh(new THREE.CylinderGeometry(.20,.20,.195,12),mats.wheel);
   hub.rotation.z=Math.PI/2;hub.position.set(sign*1.05,.41,z);root.add(hub);
  }
 }
 cube(0,1.19,2.135,1.78,.10,.08,mats.blue);
 cube(0,.70,-2.13,1.73,.16,.10,mats.trim);
 cube(0,.67,2.14,1.73,.16,.12,mats.trim);
 // Identité FBA, visible des deux côtés du fourgon.
 for(const side of [-1,1]){
  const label=new THREE.Mesh(new THREE.PlaneGeometry(1.45,.60),new THREE.MeshBasicMaterial({color:0x0284c7,side:THREE.DoubleSide}));
  label.rotation.y=side*Math.PI/2;label.position.set(side*1.00,1.53,.58);root.add(label);
 }
 const info={root,x:-24,z:40,yaw:Math.PI,occupied:false};
 function update(){
  root.position.set(info.x,0,info.z);root.rotation.y=info.yaw;
 }
 update();
 return {...info,update,
  get position(){return {x:info.x,z:info.z,yaw:info.yaw}},
  setPosition(x,z,yaw){info.x=x;info.z=z;info.yaw=yaw;update();}
 };
}
