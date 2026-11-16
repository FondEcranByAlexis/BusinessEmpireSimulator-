// Accueil indépendant du gameplay — BES V0.18.10
export function installStartScreen(config){
 const {hasSave,onShow,onContinue,onNewGame,getSettings,onGraphics,onVolume,onSensitivity,onFullscreen,getSlots,activeSlot,onSelectSlot,onDeleteSlot}=config;
 let existing=hasSave;
 const overlay=document.createElement("div");
 overlay.id="bes-start-screen";
 overlay.style.cssText="position:fixed;inset:0;z-index:250;background:linear-gradient(135deg,#071321ee,#132f47f2),radial-gradient(circle at 75% 30%,#1d4d78,#071321);display:grid;place-items:center;padding:20px;color:#fff;font-family:Arial,sans-serif;overflow:auto";
 const card=document.createElement("main");
 card.style.cssText="width:min(440px,100%);max-height:90vh;overflow:auto;padding:30px 26px;background:#0d2036ee;border:1px solid #3b5873;border-radius:20px;box-shadow:0 20px 65px #0009;text-align:center";
 const brand=document.createElement("div");brand.textContent="FBA GAMES";brand.style.cssText="font-size:13px;letter-spacing:4px;color:#38bdf8;font-weight:800";
 const title=document.createElement("h1");title.textContent="BUSINESS EMPIRE SIMULATOR";title.style.cssText="font-size:clamp(26px,5vw,36px);line-height:1.1;margin:18px 0 8px";
 const tagline=document.createElement("p");tagline.textContent="Ton supermarché, ta gestion, ton empire.";tagline.style.cssText="color:#cbd5e1;font-size:13px;margin-bottom:24px";
 const buttons=document.createElement("div");
 const footer=document.createElement("p");footer.textContent="V0.18.10 · FBA GAMES · FondEcranByAlexis";footer.style.cssText="font-size:11px;color:#94a3b8;margin-top:24px";
 card.append(brand,title,tagline,buttons,footer);overlay.appendChild(card);document.body.appendChild(overlay);
 function add(label,fn,secondary=false){
  const b=document.createElement("button");b.type="button";b.textContent=label;
  b.style.cssText="display:block;width:100%;min-height:45px;padding:12px;margin:9px 0;border:1px solid #4a6885;border-radius:10px;background:"+(secondary?"#263a51":"#2563eb")+";color:#fff;font-size:14px;font-weight:700;cursor:pointer";
  b.addEventListener("click",fn);buttons.appendChild(b);return b;
 }
 function page(name,subtitle){
  buttons.replaceChildren();
  const h=document.createElement("h2");h.textContent=name;h.style.cssText="font-size:18px;margin:12px 0";buttons.appendChild(h);
  if(subtitle){const p=document.createElement("p");p.textContent=subtitle;p.style.cssText="font-size:13px;color:#cbd5e1;line-height:1.6;margin:12px 0";buttons.appendChild(p);}
 }
 function close(){overlay.style.display="none";existing=true;onContinue();}
 function newGame(){showSlots(true);}
 function slotsLabel(slot){
  if(!slot.exists)return "Emplacement "+slot.id+" · Vide";
  return "Emplacement "+slot.id+" · Jour "+slot.day+" · "+slot.store+" · "+slot.money+" €";
 }
 function showSlots(creating=false){
  const slots=getSlots();
  page(creating?"Créer une nouvelle partie":"Choisir une sauvegarde",creating?
   "Choisis un emplacement. Une partie existante ne sera remplacée qu’après confirmation.":
   "Les trois parties sont indépendantes et enregistrées dans ce navigateur.");
  for(const slot of slots){
   add(slotsLabel(slot)+(slot.id===activeSlot?" · Actif":""),()=>{
    if(creating){
     if(slot.exists)confirmReplace(slot);
     else onSelectSlot(slot.id,true,false);
    }else{
     if(!slot.exists){showSlots(false);return;}
     if(slot.id===activeSlot){overlay.style.display="none";onContinue();}
     else onSelectSlot(slot.id,false,false);
    }
   },!slot.exists&&!creating);
  }
  if(!creating)add("Supprimer une sauvegarde",showDeleteSlots,true);
  add("← Retour",home,true);
 }
 function showDeleteSlots(){
  page("Supprimer une sauvegarde","Choisis l’emplacement à effacer. Cette action ne concerne pas les autres parties.");
  for(const slot of getSlots()){
   if(slot.exists)add("Supprimer · "+slotsLabel(slot),()=>confirmDelete(slot),true);
  }
  add("← Retour",()=>showSlots(false),true);
 }
 function confirmDelete(slot){
  page("Confirmer la suppression","ATTENTION : "+slotsLabel(slot)+" sera supprimé définitivement. Les autres sauvegardes resteront intactes.");
  const confirmation=document.createElement("input");
  confirmation.type="text";confirmation.placeholder="Écris SUPPRIMER";
  confirmation.setAttribute("aria-label","Confirmer en écrivant SUPPRIMER");
  confirmation.style.cssText="display:block;width:100%;box-sizing:border-box;padding:11px;background:#142336;color:#fff;border:1px solid #64748b;border-radius:8px;margin:12px 0";
  buttons.appendChild(confirmation);
  const erase=add("Supprimer définitivement l’emplacement "+slot.id,()=>{if(onDeleteSlot(slot.id)!==false)showSlots(false);},true);
  erase.disabled=true;erase.style.opacity=".4";
  confirmation.addEventListener("input",()=>{erase.disabled=confirmation.value.trim().toUpperCase()!=="SUPPRIMER";erase.style.opacity=erase.disabled?".4":"1";});
  add("Annuler",()=>showDeleteSlots(),true);
 }
 function confirmReplace(slot){
  page("Remplacer l’emplacement "+slot.id,"Cette action effacera uniquement cette partie : "+slotsLabel(slot)+". Les autres emplacements seront conservés.");
  add("Confirmer le remplacement",()=>onSelectSlot(slot.id,true,true));
  add("Annuler",()=>showSlots(true),true);
 }
 function slider(label,value,cb){
  const wrapper=document.createElement("label");wrapper.style.cssText="display:block;text-align:left;font-size:13px;margin:12px 0";
  const labelText=document.createElement("span");
  const input=document.createElement("input");input.type="range";input.min=label==="Volume"?"0":"10";input.max=label==="Volume"?"100":"150";input.step="5";input.value=String(value);
  input.style.cssText="display:block;width:100%;accent-color:#38bdf8";
  function update(){labelText.textContent=label+" · "+input.value+" %";}
  input.addEventListener("input",()=>{update();cb(Number(input.value));});update();wrapper.append(labelText,input);buttons.appendChild(wrapper);
 }
 function settings(){
  page("Paramètres","Les réglages sont sauvegardés sur cet appareil.");
  const s=getSettings();
  for(const [key,name] of [["fluid","Fluide"],["balanced","Équilibrée"],["detail","Détaillée"]])
   add("Graphismes · "+name+(s.graphics===key?" ✓":""),()=>{onGraphics(key);settings();},s.graphics!==key);
  slider("Volume",s.volume,onVolume);
  slider("Sensibilité souris",s.sensitivity,onSensitivity);
  add("Plein écran",onFullscreen,true);add("← Retour",home,true);
 }
 const tutorialSteps=[
  ["Bienvenue dans ton supermarché","Tu débutes avec ton propre magasin. Ton objectif : satisfaire les clients, vendre des produits et développer ton commerce à ton rythme."],
  ["Se déplacer et interagir","Utilise ZQSD / WASD pour avancer, la souris pour regarder et E pour interagir. Appuie sur M pour ouvrir le menu et F pour parler aux clients."],
  ["Commander et remplir les rayons","Ouvre MAGASIN puis Fournisseurs pour acheter des cartons. Réceptionne les livraisons et remplis les rayons depuis la réserve. Tu pourras ensuite recruter du personnel."],
  ["Accueillir les clients et encaisser","Ouvre ton magasin, observe les clients et passe à la caisse pour encaisser. Les demandes clients sont accessibles depuis MAGASIN · Gestion."],
  ["Développer ton empire","Gagne de l’argent et des points, débloque des licences, des rayons et des extensions. Tu peux avancer sans te presser : la partie est enregistrée dans son emplacement."]
 ];
 function tutorial(newPlayer=false,index=0){
  const step=tutorialSteps[index];
  page("Tutoriel · "+(index+1)+"/"+tutorialSteps.length,step[0]+" — "+step[1]);
  if(index+1<tutorialSteps.length)add("Suivant",()=>tutorial(newPlayer,index+1));
  else add(newPlayer?"Commencer ma partie":"Terminer",()=>{if(newPlayer){overlay.style.display="none";existing=true;onNewGame(false);}else home();});
  add(newPlayer?"Passer le tutoriel":"← Retour à l’accueil",()=>{
   if(newPlayer){overlay.style.display="none";existing=true;onNewGame(false);}else home();
  },true);
 }
 function tutorialIntro(newGame=false){
  page("Tutoriel interactif","Une formation pratique : explorer, commander, réceptionner, ranger en réserve, remplir un rayon, ouvrir le magasin et encaisser ton premier client. Suis les flèches pour rejoindre les zones utiles.");
  add("▶ Commencer le tutoriel",()=>{
   overlay.style.display="none";
   existing=true;
   if(newGame)onNewGame(false,true);
   else onContinue(true);
  });
  add(newGame?"Passer et jouer":"← Retour à l’accueil",()=>{
   if(newGame){overlay.style.display="none";existing=true;onNewGame(false,false);}
   else home();
  },true);
 }
 function help(){page("Commandes / Aide","ZQSD / WASD / flèches : avancer · Souris : regarder · E : interagir · F : parler aux clients · M : menu · Échap : libérer la souris.");add("← Retour",home,true);}
 function credits(){page("Crédits","BUSINESS EMPIRE SIMULATOR — développé pour FBA GAMES par FondEcranByAlexis.");add("← Retour",home,true);}
 function home(){
  onShow?.();
  overlay.style.display="grid";page("Choisis ta partie",existing?"Sauvegarde disponible dans ce navigateur.":"Aucune ancienne sauvegarde détectée.");
  if(existing)add("▶ Continuer · Emplacement "+activeSlot,close);
  add("▣ Choisir une sauvegarde",()=>showSlots(false),true);
  add("＋ Nouvelle partie",newGame);
  add("⚙ Paramètres",settings,true);
  add("⌨ Commandes / Aide",help,true);
  add("📘 Tutoriel interactif",()=>tutorialIntro(false),true);
  add("★ Crédits",credits,true);
 }
 home();
 return {show:home,beginNew:()=>tutorialIntro(true)};
}
