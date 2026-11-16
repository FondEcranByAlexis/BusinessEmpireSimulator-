// Business Empire Simulator V0.18.20 — parcours d'initiation guidé dans le vrai magasin.
// Les étapes s'accomplissent avec des événements du jeu, jamais avec un bouton "Valider".
export function createPlayableTutorial({getPosition,getHeading,getCartCount,getReserveTarget,isStoreOpen,isGameplayReady,onFinish}){
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
  {title:"Voir les demandes clients",instruction:"Ouvre MAGASIN · Gestion → Demandes des clients.",event:"requests",hint:"Tu pourras y suivre les produits demandés et les ruptures."},
  {title:"Rejoindre la réserve",instruction:"Avec ton carton en main, suis la flèche jusqu’à la réserve correspondant à son produit.",event:"arrive",target:"reserve",hint:"Chaque type de produit possède sa propre zone de stockage."},
  {title:"Ranger le carton",instruction:"Dans la bonne réserve, appuie sur E puis sur « Ranger la livraison ».",event:"store",hint:"Le carton doit réellement être enregistré dans la réserve."},
  {title:"Reprendre un carton",instruction:"Dans la réserve, reprends un carton de produits avec « PRENDRE LE CARTON ».",event:"take",hint:"Tu vas apprendre à remplir les rayons."},
  {title:"Remplir un rayon",instruction:"Va près du rayon du produit, ouvre le carton si nécessaire puis place au moins un article.",event:"restock",hint:"Suis les repères du rayon ; si celui-ci est déjà plein, choisis un autre produit."},
  {title:"Ouvrir le supermarché",instruction:"Quand il est 8 h, utilise « Ouvrir le magasin ». Tu peux explorer en attendant.",event:"open",hint:"La première ouverture se fait à 8 h ; elle lance l’arrivée des clients."},
  {title:"Rejoindre la caisse",instruction:"Suis la flèche jusqu’à la caisse principale.",event:"arrive",target:{x:6.5,z:6.5,radius:3.2},hint:"Installe-toi au poste de caisse pour accueillir le prochain client."},
  {title:"Encaisser un client",instruction:"Scanne ses articles et termine un paiement par carte ou en espèces.",event:"sale",hint:"La première vente doit être réalisée par toi, pas par un employé."}
 ];
 const overlay=document.createElement("aside");
 overlay.id="bes-playable-tutorial";overlay.setAttribute("aria-label","Tutoriel interactif");
 overlay.style.cssText="position:fixed;right:12px;top:195px;width:min(330px,calc(100vw - 24px));z-index:180;background:#0c2034f2;border:1px solid #38bdf8;border-radius:12px;box-shadow:0 8px 30px #0009;padding:12px;color:#fff;font:13px/1.45 Arial,sans-serif;pointer-events:auto;display:none;max-height:calc(100vh - 210px);overflow:auto";
 const header=document.createElement("strong"),title=document.createElement("h2"),instruction=document.createElement("p"),hint=document.createElement("p");
 header.style.color="#7dd3fc";title.style.cssText="font-size:16px;margin:8px 0";hint.style.cssText="color:#cbd5e1;margin-top:7px";
 const arrow=document.createElement("div");arrow.style.cssText="display:none;align-items:center;justify-content:center;gap:15px;margin:10px 0;padding:9px;background:#163b51;border:1px solid #22d3ee;border-radius:10px";
 const symbol=document.createElement("span");symbol.textContent="↑";symbol.style.cssText="display:inline-block;font-size:34px;font-weight:900;color:#67e8f9;line-height:1;transition:transform .12s linear";
 const distance=document.createElement("span");distance.style.cssText="font-weight:700;font-size:13px";arrow.append(symbol,distance);
 const objectives=document.createElement("div");objectives.style.cssText="margin:9px 0;padding:8px;background:#102b43;border:1px solid #334155;border-radius:8px;max-height:150px;overflow-y:auto";
 const objectiveTitle=document.createElement("strong");objectiveTitle.textContent="OBJECTIFS DE FORMATION";objectiveTitle.style.cssText="font-size:11px;color:#7dd3fc";
 const list=document.createElement("div");list.setAttribute("aria-label","Objectifs à accomplir");objectives.append(objectiveTitle,list);
 const collapse=document.createElement("button");
 collapse.type="button";collapse.textContent="Réduire le tutoriel";
 collapse.style.cssText="padding:6px 9px;margin:7px 0;background:#1e3a5f;color:white;border:1px solid #64748b;border-radius:7px;cursor:pointer";
 let compact=false;
 collapse.addEventListener("click",()=>{
  compact=!compact;
  collapse.textContent=compact?"Afficher les objectifs":"Réduire le tutoriel";
  instruction.style.display=compact?"none":"";
  hint.style.display=compact?"none":"";
  objectives.style.display=compact?"none":"";
  overlay.style.maxHeight=compact?"110px":"calc(100vh - 210px)";
 });
 const controls=document.createElement("div");controls.style.cssText="display:flex;gap:7px;margin-top:9px;flex-wrap:wrap";
 const skip=document.createElement("button");skip.type="button";skip.textContent="Passer le tutoriel";
 skip.style.cssText="padding:8px 12px;background:#334155;color:white;border:1px solid #64748b;border-radius:7px;cursor:pointer";
 overlay.append(header,title,collapse,instruction,hint,arrow,objectives,controls);document.body.appendChild(overlay);
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
  const setting=steps[step].target;
  const target=setting==="reserve"?getReserveTarget():setting;
  if(!target){arrow.style.display="none";return;}
  arrow.style.display="flex";
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
  const target=current.target==="reserve"?getReserveTarget():current.target;
  if(target&&Math.hypot(p.x-target.x,p.z-target.z)<=target.radius)notify("arrive");
  if(current.event==="open"&&isStoreOpen())notify("open");
  updateArrow();
 }
 skip.addEventListener("click",()=>stop(false));
 return {start,stop,notify,tick,isActive:()=>active,wasStarted:()=>started};
}
