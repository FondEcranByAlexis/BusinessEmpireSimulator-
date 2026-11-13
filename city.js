// FBA City — première périphérie urbaine, décor optimisé sans textures externes.
export function installCity({THREE,scene}){
 const root=new THREE.Group();root.name="FBA City";root.position.z+=65;scene.add(root);
 const mats={road:0x303944,walk:0xabb6bf,grass:0x638b61,wall:0xd8d3c9,roof:0x495769,glass:0x779bb1,tree:0x35734d,wood:0x765d49,mark:0xe8e6d7};
 const material={};for(const [k,v] of Object.entries(mats))material[k]=new THREE.MeshLambertMaterial({color:v});
 const box=(x,y,z,w,h,d,mat)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material[mat]);m.position.set(x,y,z);root.add(m);return m};
 // Quartier décalé au-delà de la zone logistique pour éviter les chevauchements avec les réserves.
 box(0,-.18,79,210,.2,125,"grass");
 box(0,-.055,46,210,.12,12,"road");
 box(0,-.045,66,210,.12,10,"road");
 box(-75,-.04,79,9,.12,125,"road");
 box(75,-.04,79,9,.12,125,"road");
 for(const z of [38.6,53.3,58.8,73.2])box(0,.015,z,210,.04,2.2,"walk");
 for(const x of [-82,-68,68,82])box(x,.015,79,2,.04,125,"walk");
 for(let x=-98;x<=98;x+=12){box(x,.035,46,5,.015,.16,"mark");box(x,.035,66,5,.015,.16,"mark")}
 for(let z=24;z<135;z+=12){box(-75,.035,z,.16,.015,5,"mark");box(75,.035,z,.16,.015,5,"mark")}
 // Immeubles, maisons et commerces de quartier.
 const blocks=[[-52,83,13,13,12],[-30,88,15,12,17],[-8,89,14,14,11],[15,91,15,15,20],[40,88,17,13,15],[58,92,12,12,11],[-52,119,16,14,16],[-27,120,14,12,10],[0,120,18,14,21],[29,121,17,13,13],[54,121,16,15,18]];
 blocks.forEach(([x,z,w,d,h],i)=>{
  // Façades creuses : entrée centrale ouverte et rez-de-chaussée visitable.
  box(x,.04,z,w,.08,d,"walk");
  box(x-w/2,h/2,z,.3,h,d,"wall");
  box(x+w/2,h/2,z,.3,h,d,"wall");
  box(x,h/2,z+d/2,w,h,.3,"wall");
  const door=2.6, side=(w-door)/2;
  box(x-(door+side)/2,h/2,z-d/2,side,h,.3,"wall");
  box(x+(door+side)/2,h/2,z-d/2,side,h,.3,"wall");
  box(x,h-1.45,z-d/2,door,h-2.9,.3,"wall");
  box(x,h+.35,z,w+.6,.7,d+.6,"roof");
  for(let floor=0;floor<Math.floor(h/3);floor++)for(let col=-1;col<=1;col++){
   if(col!==0)box(x+col*w*.25,3.8+floor*3,z-d/2-.19,1.3,1.45,.08,"glass");
  }
  // L’ouverture centrale est libre : aucune porte décorative ne bloque le passage.
 });
 // Arbres et éclairage urbain, géométries partagées pour limiter les appels de rendu.
 const trunk=new THREE.CylinderGeometry(.18,.25,2.2,6),crown=new THREE.ConeGeometry(1.55,3.4,7);
 for(const x of [-94,-60,-43,-19,8,35,61,95])for(const z of [59,105]){
  const t=new THREE.Mesh(trunk,material.wood);t.position.set(x,1.1,z);root.add(t);
  const c=new THREE.Mesh(crown,material.tree);c.position.set(x,3.4,z);root.add(c);
 }
 for(const x of [-58,-20,20,58]){box(x,2.3,55,.16,4.6,.16,"roof");box(x,4.6,55,1.1,.18,.45,"mark")}
 return root;
}
