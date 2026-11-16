// Business Empire Simulator V0.17.90 — parcours d'initiation guidé dans le vrai magasin.
// Les étapes s'accomplissent avec des événements du jeu, jamais avec un bouton "Valider".
export function createPlayableTutorial({getPosition,getHeading,getCartCount,isGameplayReady,onFinish}){
 const steps=[
  {title:"Premiers pas",instruction:"Déplace-toi de 3 mètres avec ZQSD / WASD ou les flèches.",event:"walk",hint:"Explore le magasin à ton rythme."},
  {title:"Menu principal",instruction:"Appuie sur M ou sur « ☰ Menu ».",event:"menu",hint:"Tous tes outils de gestion sont regroupés ici."},
  {title:"Vérifier les rayons",instruction:"MAGASIN · Gestion → Stocks.",event:"stocks",hint:"Avant toute commande, regarde les quantités restantes."},
  {title:"Rejoindre l'ordinateur",instruction:"Dirige-toi vers l'ordinateur de caisse en suivant la flèche.",event:"arrive",target:{x:7.3,z:6.5,radius:3},hint:"Suis l'indicateur de direction et de distance."},
  {title:"Consulter les fournisseurs",instruction:"Ouvre le panneau Fournisseurs depuis la gestion ou l'ordinateur.",event:"suppliers",hint:"Découvre les produits, les prix et les délais."},
  {title:"Préparer une commande",instruction:"Ajoute au moins un carton au panier fournisseur.",event:"cart",hint:"Choisis un produit abordable ; aucun article particulier n'est imposé."},
  {title:"Passer une commande",instruction:"Confirme une commande normale ou express, selon ton choix.",event:"order",hint:"Le prix est débité normalement : cette commande fait partie de ta partie."},
  {title:"Attendre la livraison",instruction:"La livraison arrivera après le délai indiqué. Tu peux explorer en attendant.",event:"delivered",hint:"Livraison express : environ 5 s ; normale : environ 30 s."},
  {title:"Rejoindre le quai",instruction:"Suis la flèche jusqu'à la zone de livraison.",event:"arrive",target:{x:25.65,z:-24.3,radius:3.1},hint:"Avance jusqu'au quai, à l'arrière du magasin."},
  {title:"Inspecter la livraison",instruction:"Approche-toi du quai et ouvre « Zone livraison » avec E.",event:"dock",hint:"Vérifie les cartons reçus avant de les ranger."},
  {title:"Prendre un carton",instruction:"Dans la zone livraison, clique sur « Prendre 1 carton ».",event:"pickup",hint:"Le carton peut ensuite être rangé dans sa réserve correspondante."},
  {title:"Découvrir le recrutement",instruction:"Ouvre ÉQUIPE · Personnel → Recrutement et équipes.",event:"recruitment",hint:"Les postes se débloquent au fil des niveaux. Pas de recrutement obligatoire."},
  {title:"Voir les demandes clients",instruction:"Ouvre MAGASIN · Gestion → Demandes des clients.",event:"requests",hint:"Tu pourras y suivre les produits demandés et les ruptures."}
 ];
 const overlay=document.createElement("aside");
 overlay.id="bes-playable-tutorial";overlay.setAttribute("aria-label","Tutoriel interactif");
 overlay.style.cssText="position:fixed;right:12px;top:82px;width:min(330px,calc(100vw - 24px));z-index:180;background:#0c2034f2;border:1px solid #38bdf8;border-radius:12px;box-shadow:0 8px 30px #0009;padding:12px;color:#fff;font:13px/1.45 Arial,sans-serif;pointer-events:auto;display:none;max-height:65vh;overflow:auto";
 const header=document.createElement("strong"),title=document.createElement("h2"),instruction=document.createElement("p"),hint=document.createElement("p");
 header.style.color="#7dd3fc";title.style.cssText="font-size:16px;margin:8px 0";hint.style.cssText="color:#cbd5e1;margin-top:7px";
 const arrow=document.createElement("div");arrow.style.cssText="display:none;align-items:center;justify-content:center;gap:15px;margin:10px 0;padding:9px;background:#163b51;border:1px solid #22d3ee;border-radius:10px";
 const symbol=document.createElement("span");symbol.textContent="↑";symbol.style.cssText="display:inline-block;font-size:34px;font-weight:900;color:#67e8f9;line-height:1;transition:transform .12s linear";
 const distance=document.createElement("span");distance.style.cssText="font-weight:700;font-size:13px";arrow.append(symbol,distance);
 const objectives=document.createElement("div");objectives.style.cssText="margin:9px 0;padding:8px;background:#102b43;border:1px solid #334155;border-radius:8px;max-height:150px;overflow-y:auto";
 const objectiveTitle=document.createElement("strong");objectiveTitle.textContent="OBJECTIFS DE FORMATION";objectiveTitle.style.cssText="font-size:11px;color:#7dd3fc";
 const list=document.createElement("div");list.setAttribute("aria-label","Objectifs à accomplir");objectives.append(objectiveTitle,list);
 const controls=document.createElement("div");controls.style.cssText="display:flex;gap:7px;margin-top:9px;flex-wrap:wrap";
 const skip=document.createElement("button");skip.type="button";skip.textContent="Passer le tutoriel";
 skip.style.cssText="padding:8px 12px;background:#334155;color:white;border:1px solid #64748b;border-radius:7px;cursor:pointer";
 overlay.append(header,title,instruction,hint,arrow,objectives,controls);document.body.appendChild(overlay);
 let active=false,step=0,startPosition=null,started=false;
 function draw(){
  overlay.style.display=active?"block":"none";
  if(!active)return;
  controls.replaceChildren();
  list.replaceChildren();
  steps.forEach((goal,i)=>{
   const line=document.createElement("div");line.textContent=(i<step?"✓ ":i===step?"➜ ":"○ ")+(i+1)+". "+goal.title;
   line.style.cssText="padding:3px 0;font-size:11px;color:"+(i<step?"#86efac":i===step?"#fff":"#94a3b8")+";font-weight:"+(i===step?"700":"400");
   list.appendChild(line);
  });
  if(step>=steps.length){
   header.textContent="FORMATION TERMINÉE";title.textContent="À toi de jouer !";
   instruction.textContent="Tu sais explorer, commander, réceptionner un carton et consulter ton équipe.";
   hint.textContent="La partie continue normalement, sans restriction.";
   arrow.style.display="none";
   const done=document.createElement("button");done.type="button";done.textContent="Terminer le tutoriel";
   done.style.cssText="padding:9px 12px;background:#2563eb;color:#fff;border:0;border-radius:8px;font-weight:700";
   done.addEventListener("click",()=>stop(true));controls.append(done);
   return;
  }
  header.textContent="TUTORIEL INTERACTIF · "+(step+1)+"/"+steps.length;
  const goal=steps[step];title.textContent=goal.title;instruction.textContent=goal.instruction;hint.textContent=goal.hint;
  arrow.style.display=goal.target?"flex":"none";controls.append(skip);
  updateArrow();
 }
 function updateArrow(){
  if(!active||step>=steps.length)return;
  const target=steps[step].target;if(!target)return;
  const p=getPosition();const dx=target.x-p.x,dz=target.z-p.z;
  const meters=Math.hypot(dx,dz);
  const desired=Math.atan2(-dx,-dz);
  const heading=getHeading();
  const turn=Math.atan2(Math.sin(desired-heading),Math.cos(desired-heading));
  symbol.style.transform="rotate("+turn+"rad)";
  distance.textContent="Destination · "+Math.round(meters)+" m";
 }
 function start(){active=true;started=true;step=0;const p=getPosition();startPosition={x:p.x,z:p.z};draw();}
 function stop(completed=false){if(!active)return;active=false;draw();onFinish?.(completed);}
 function notify(event){
  if(!active||step>=steps.length||!isGameplayReady())return;
  if(steps[step].event!==event)return;
  step++;draw();
 }
 function tick(){
  if(!active||step>=steps.length||!isGameplayReady())return;
  const current=steps[step],p=getPosition();
  if(current.event==="cart"&&getCartCount()>0)notify("cart");
  if(current.event==="walk"&&startPosition&&Math.hypot(p.x-startPosition.x,p.z-startPosition.z)>=3)notify("walk");
  if(current.target&&Math.hypot(p.x-current.target.x,p.z-current.target.z)<=current.target.radius)notify("arrive");
  updateArrow();
 }
 skip.addEventListener("click",()=>stop(false));
 return {start,stop,notify,tick,isActive:()=>active,wasStarted:()=>started};
}
