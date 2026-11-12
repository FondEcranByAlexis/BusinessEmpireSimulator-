// Rayons des extensions. Chaque fiche précise la référence, le prix d’achat
// à l’unité, le prix de vente initial et, si nécessaire, la zone de stockage.
export const EARLY_PRODUCTS = [
  ["confiture", "Confitures", 5, 11, 11, -7.5, -11.3, 2],
  ["pate_tartiner", "Pâtes à tartiner", 6, 13, 11, -3.5, -11.3, 2],
  ["granola", "Granola", 4, 10, 11, 3.5, -11.3, 2],
  ["sirop", "Sirops", 5, 11, 16, 7.5, -11.3, 2],
  ["capsules", "Cafés en capsules", 7, 15, 16, -3.5, -21, 0],
  ["biscuits_matin", "Biscuits petit-déjeuner", 4, 9, 16, 3.5, -21, 0],
];

// Une licence est une fiche [niveau, nom, prix]. Les produits du département
// qui l'utilisent en reprennent l'index. Les deux dernières entrées donnent
// le niveau minimum du produit et sa zone logistique, si différente du sec.
export const DEPARTMENTS = [
  { name:"Boissons et petit-déjeuner", licenses:[[12,"Boissons fraîches",1200]], products:[
    ["sodas","Sodas",3,8,0],["eaux_aromatisees","Eaux aromatisées",3,7,0],["thes_glaces","Thés glacés",4,9,0],
  ]},
  { name:"Boulangerie", licenses:[[21,"Boulangerie",1800],[26,"Crèmerie",2000]], products:[
    ["pain","Pains",2,5,0],["viennoiseries","Viennoiseries",3,7,0],["patisseries","Pâtisseries emballées",5,11,0],
    ["yaourts","Yaourts",4,9,1,26,"cold"],["beurre","Beurres",5,12,1,26,"cold"],["desserts_frais","Desserts frais",6,14,1,26,"cold"],
  ]},
  { name:"Primeur et traiteur", licenses:[[32,"Traiteur",2400]], products:[
    ["poires","Poires",4,9,"fruitLicense",31,"cold"],["oranges","Oranges",4,10,"fruitLicense",31,"cold"],
    ["tomates","Tomates",5,11,"fruitLicense",31,"cold"],["carottes","Carottes",3,7,"fruitLicense",31,"cold"],
    ["salades","Salades préparées",7,15,0,32,"cold"],["sandwichs","Sandwichs",6,13,0,32,"cold"],["plats_prepares","Plats préparés",9,19,0,32,"cold"],
  ]},
  { name:"Hygiène et entretien", licenses:[[41,"Entretien",2800],[46,"Hygiène",2900]], products:[
    ["lessives","Lessives",9,19,0],["liquide_vaisselle","Liquides vaisselle",5,11,0],["nettoyants","Nettoyants",6,14,0],
    ["shampoings","Shampoings",7,16,1,46],["dentifrices","Dentifrices",5,11,1,46],["deodorants","Déodorants",7,15,1,46],
  ]},
  { name:"Boucherie et charcuterie", licenses:[[51,"Boucherie-charcuterie",3600]], products:[
    ["viandes","Viandes",12,26,0,51,"cold"],["jambons","Jambons",10,22,0,51,"cold"],["terrines","Terrines",8,18,0,51,"cold"],
  ]},
  { name:"Poissonnerie et surgelés", licenses:[[61,"Poissonnerie",4400]], products:[
    ["poissons","Poissons",14,31,0,61,"cold"],["crevettes","Crevettes",12,27,0,61,"cold"],["coquillages","Coquillages",11,25,0,61,"cold"],
    ["legumes_surgeles","Légumes surgelés",6,13,"freshLicense",66,"cold"],["glaces","Glaces",8,17,"freshLicense",66,"cold"],
    ["mer_surgeles","Produits de la mer surgelés",12,25,"freshLicense",66,"cold"],
  ]},
  { name:"Jeux vidéo", licenses:[[71,"Jeux et accessoires",5400,"consoles"]], products:[
    ["consoles_jeu","Consoles",135,279,"consoles",72,"electronics"],["jeux_video","Jeux vidéo",25,55,0,72,"electronics"],
    ["manettes","Manettes",24,49,0,72,"electronics"],["stations_charge","Stations de charge",17,38,0,72,"electronics"],
  ]},
  { name:"Bébé et animalerie", licenses:[[81,"Puériculture",6200],[84,"Animalerie",6400]], products:[
    ["couches","Couches",12,27,0],["lingettes","Lingettes",5,12,0],["biberons","Biberons",8,17,0],
    ["croquettes","Croquettes",13,29,1],["litieres","Litières",11,25,1],["accessoires_animaux","Accessoires pour animaux",10,23,1],
    ["purees_bebe","Purées fraîches bébé",6,13,0,88,"cold"],["compotes_bebe","Compotes fraîches bébé",5,12,0,88,"cold"],
  ]},
  { name:"Maison et électroménager", licenses:[[91,"Petit électroménager",7200],[96,"Arts de la table",7500]], products:[
    ["grille_pains","Grille-pains",21,45,0,91,"electronics"],["bouilloires","Bouilloires",19,42,0,91,"electronics"],
    ["robots","Robots de cuisine",60,135,0,91,"electronics"],["filtres","Filtres de remplacement",10,23,0,94],
    ["vaisselle","Vaisselle",17,38,1,96],["couverts","Couverts",10,23,1,96],["verrerie","Verrerie",14,32,1,96],
  ]},
  { name:"Retrait des commandes", products:[] },
  { name:"Cuisines du monde", licenses:[[111,"Épiceries du monde",9000],[116,"Spécialités fraîches",9500]], products:[
    ["epices_monde","Épices du monde",7,16,0],["sauces_monde","Sauces du monde",8,18,0],["nouilles","Nouilles",5,12,0],
    ["sans_gluten","Pâtes sans gluten",7,16,0,114],["raviolis","Raviolis frais",9,21,1,116,"cold"],
    ["mezze","Mezze",9,20,1,116,"cold"],["sauces_fraiches","Sauces fraîches",8,18,1,116,"cold"],
  ]},
  { name:"Jardin et bricolage", licenses:[[121,"Jardin",10000],[126,"Bricolage",10500]], products:[
    ["semences","Semences",5,12,0],["terreaux","Terreaux",10,22,0],["outils_jardin","Outils de jardin",15,33,0],
    ["aromates","Plantes aromatiques",7,15,0,122],["outils","Outils",20,44,1,126],
    ["quincaillerie","Quincaillerie",11,25,1,126],["consommables","Consommables de bricolage",10,23,1,126],
  ]},
  { name:"Textile, fournitures et sport", licenses:[[131,"Textile",11200],[134,"Papeterie",11500],[137,"Sport",11900]], products:[
    ["chaussettes","Chaussettes",7,16,0],["vetements","Vêtements",18,39,0],["linge","Linge de maison",20,45,0],
    ["cahiers","Cahiers",5,12,1],["fournitures","Fournitures",9,21,1],["encres","Cartouches d’encre",16,35,1],
    ["ballons","Ballons",12,26,2,137],["gourdes","Gourdes",10,23,2,137],
    ["batons_rando","Bâtons de randonnée",16,35,2,138],["lampes_rando","Lampes frontales",15,33,2,138],
  ]},
  { name:"Réception et entrepôt", products:[] },
  { name:"Hall de caisses", products:[] },
  { name:"Marque du magasin et vrac", licenses:[[161,"Marque propre",15000],[164,"Vrac",15600]], products:[
    ["cereales_maison","Céréales sous enseigne",7,16,0],["dessert_maison","Dessert sous enseigne",8,18,0,161,"cold"],
    ["cereales_vrac","Céréales en vrac",7,15,1],["legumineuses_vrac","Légumineuses en vrac",7,15,1],
    ["fruits_secs_vrac","Fruits secs en vrac",10,22,1],
  ]},
  { name:"Espace professionnels", products:[] },
  { name:"Centre d’expédition", products:[] },
  { name:"Aile premium et événementielle", products:[] },
];

export const ANNEX_ENTRY = -34;
export const MALL_GRID = 12;
export const MALL_ROOM = 9;
export const MALL_MIN_Z = ANNEX_ENTRY - 5 * MALL_GRID;
export const MALL_HALF_WIDTH = 2.5 * MALL_GRID;
export const MALL_PLAZA_Z = ANNEX_ENTRY - 2.5 * MALL_GRID;

// Les premières ouvertures bordent l’entrée. L’axe central et la place
// restent libres lorsque les dix-neuf départements sont ouverts.
const cells = [
  [-1,0],[1,0],[-2,0],[2,0],
  [-1,1],[1,1],[-2,1],[2,1],
  [-2,2],[2,2],
  [-1,3],[1,3],[-2,3],[2,3],
  [0,4],[-1,4],[1,4],[-2,4],[2,4],
];
export function departmentLocation(index) {
  const [column, row] = cells[index];
  const x = column * MALL_GRID;
  const z = ANNEX_ENTRY - (row + .5) * MALL_GRID;
  return { column, row, x, z, front: z + MALL_ROOM / 2 };
}
