// Accueil indépendant du gameplay — BES V0.17.65
export function installStartScreen(config){
 const {hasSave,onShow,onContinue,onNewGame,getSettings,onGraphics,onVolume,onSensitivity,onFullscreen}=config;
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
 const footer=document.createElement("p");footer.textContent="V0.17.65 · FBA GAMES · FondEcranByAlexis";footer.style.cssText="font-size:11px;color:#94a3b8;margin-top:24px";
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
 function newGame(){
  if(!existing){overlay.style.display="none";existing=true;onNewGame(false);return;}
  page("Confirmer la nouvelle partie","Attention : la sauvegarde actuelle sera remplacée. Cette opération est irréversible.");
  add("Confirmer · remplacer ma partie",()=>{onNewGame(true);});
  add("Annuler",home,true);
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
 function help(){page("Commandes / Aide","ZQSD / WASD / flèches : avancer · Souris : regarder · E : interagir · F : parler aux clients · M : menu · Échap : libérer la souris.");add("← Retour",home,true);}
 function credits(){page("Crédits","BUSINESS EMPIRE SIMULATOR — développé pour FBA GAMES par FondEcranByAlexis.");add("← Retour",home,true);}
 function home(){
  onShow?.();
  overlay.style.display="grid";page("Choisis ta partie",existing?"Sauvegarde disponible dans ce navigateur.":"Aucune ancienne sauvegarde détectée.");
  if(existing)add("▶ Continuer la partie",close);
  add("＋ Nouvelle partie",newGame);
  add("⚙ Paramètres",settings,true);
  add("⌨ Commandes / Aide",help,true);
  add("★ Crédits",credits,true);
 }
 home();
 return {show:home,beginNew:()=>{overlay.style.display="none";existing=true;onNewGame(false);}};
}
