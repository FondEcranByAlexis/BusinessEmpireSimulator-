// Business Empire Simulator V0.17.80 — tutoriel réellement jouable.
export function createPlayableTutorial({getPosition,isGameplayReady,onFinish}){
 const steps=[
  {title:"Découvre ton magasin",instruction:"Déplace-toi de quelques mètres avec ZQSD / WASD ou les flèches.",hint:"Marche dans le magasin pour découvrir les déplacements.",event:"walk"},
  {title:"Ouvre le menu",instruction:"Appuie sur M ou sur « ☰ Menu » pour ouvrir le menu principal.",hint:"Le menu centralise toutes les fonctions.",event:"menu"},
  {title:"Consulte les fournisseurs",instruction:"Dans MAGASIN · Gestion, ouvre « Fournisseurs ».",hint:"Les fournisseurs permettent de commander des produits pour tes rayons.",event:"suppliers"},
  {title:"Découvre les demandes clients",instruction:"Reviens dans MAGASIN · Gestion et ouvre « Demandes des clients ».",hint:"Tu retrouveras les demandes et les produits recherchés par tes clients.",event:"requests"}
 ];
 const overlay=document.createElement("aside");
 overlay.id="bes-playable-tutorial";
 overlay.setAttribute("aria-label","Tutoriel interactif");
 overlay.style.cssText="position:fixed;right:12px;top:94px;width:min(300px,calc(100vw - 24px));z-index:180;background:#0c2034f2;border:1px solid #38bdf8;border-radius:12px;box-shadow:0 8px 30px #0009;padding:14px;color:white;font:13px/1.5 Arial,sans-serif;pointer-events:auto;display:none;max-height:55vh;overflow:auto";
 const header=document.createElement("strong"),title=document.createElement("h2"),instruction=document.createElement("p"),hint=document.createElement("p");
 header.style.color="#7dd3fc";title.style.cssText="font-size:17px;margin:8px 0";hint.style.cssText="color:#cbd5e1;margin-top:8px";
 const controls=document.createElement("div");controls.style.cssText="display:flex;gap:7px;margin-top:12px;flex-wrap:wrap";
 const skip=document.createElement("button");skip.type="button";skip.textContent="Passer le tutoriel";
 skip.style.cssText="padding:8px 12px;background:#334155;color:white;border:1px solid #64748b;border-radius:7px;cursor:pointer";
 controls.appendChild(skip);
 overlay.append(header,title,instruction,hint,controls);document.body.appendChild(overlay);
 let active=false,step=0,startingPosition=null,started=false;
 function render(){
  overlay.style.display=active?"block":"none";
  if(!active)return;
  if(step===steps.length){
   header.textContent="FORMATION TERMINÉE";
   title.textContent="À toi de jouer !";
   instruction.textContent="Tu sais te déplacer, utiliser le menu et trouver les fournisseurs et les demandes clients.";
   hint.textContent="Tu peux maintenant gérer ton supermarché librement.";
   controls.replaceChildren();
   const finish=document.createElement("button");finish.textContent="Terminer le tutoriel";
   finish.style.cssText="padding:10px;background:#2563eb;color:white;border:0;border-radius:7px;font-weight:bold;cursor:pointer";
   finish.addEventListener("click",()=>stop(true));controls.appendChild(finish);return;
  }
  controls.replaceChildren(skip);
  const current=steps[step];
  header.textContent="TUTORIEL INTERACTIF · "+(step+1)+"/"+steps.length;
  title.textContent=current.title;instruction.textContent=current.instruction;hint.textContent=current.hint;
 }
 function start(){
  step=0;active=true;started=true;
  const p=getPosition();startingPosition={x:p.x,z:p.z};
  render();
 }
 function stop(completed=false){
  active=false;render();onFinish?.(completed);
 }
 function notify(event){
  if(!active||step>=steps.length||!isGameplayReady())return;
  if(steps[step].event!==event)return;
  step++;render();
 }
 function tick(){
  if(!active||step!==0||!isGameplayReady())return;
  const p=getPosition();
  if(startingPosition&&Math.hypot(p.x-startingPosition.x,p.z-startingPosition.z)>=2.5)notify("walk");
 }
 skip.addEventListener("click",()=>stop(false));
 return {start,stop,notify,tick,isActive:()=>active,wasStarted:()=>started};
}
