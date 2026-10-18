/* =====================================================
   Roblox Tier List – app.js (version 2)
   Site statique : aucune dépendance, aucun serveur.
   Projet de fans, non affilié à Roblox Corporation.
   ===================================================== */
(function () {
  "use strict";

  /* ===================================================
     1. RÉGLAGES
     =================================================== */

  var RANKS = ["S", "A", "B", "C", "D"];
  var RANK_COLORS = { S: "#ff5d73", A: "#ffa94d", B: "#ffe066", C: "#69db7c", D: "#4dabf7" };
  var MAX_TIERS = 12;
  var PAGE_SIZE = 24;     /* jeux affichés par page dans le catalogue */
  var POOL_SIZE = 60;     /* jeux affichés par page dans la réserve */
  var MAX_CUSTOM = 500;   /* jeux ajoutables par l'utilisateur */

  var CATEGORIES = [
    { id: "anime", label: "Anime", icon: "⚔️", colors: ["#ec4899", "#8b5cf6"] },
    { id: "horreur", label: "Horreur", icon: "👻", colors: ["#ef4444", "#4c1d95"] },
    { id: "simulateur", label: "Simulateurs", icon: "🐾", colors: ["#22c55e", "#0ea5e9"] },
    { id: "tycoon", label: "Tycoon", icon: "🏭", colors: ["#f59e0b", "#8b5cf6"] },
    { id: "rp", label: "Jeux de rôle (RP)", icon: "🏠", colors: ["#f472b6", "#38bdf8"] },
    { id: "survie", label: "Survie", icon: "🌲", colors: ["#16a34a", "#1e3a8a"] },
    { id: "fps", label: "FPS / Tir", icon: "🔫", colors: ["#64748b", "#8b5cf6"] },
    { id: "combat", label: "Combat", icon: "🥊", colors: ["#f43f5e", "#2563eb"] },
    { id: "obby", label: "Obby / Parkour", icon: "🏃", colors: ["#06b6d4", "#7c3aed"] },
    { id: "course", label: "Course", icon: "🏎️", colors: ["#f97316", "#3b82f6"] },
    { id: "sport", label: "Sport", icon: "⚽", colors: ["#10b981", "#6366f1"] },
    { id: "aventure", label: "Aventure", icon: "🗺️", colors: ["#eab308", "#7c3aed"] },
    { id: "strategie", label: "Stratégie", icon: "♟️", colors: ["#3b82f6", "#a855f7"] },
    { id: "amis", label: "Entre amis", icon: "🎉", colors: ["#a855f7", "#22d3ee"] },
    { id: "autres", label: "Autres genres", icon: "✨", colors: ["#6366f1", "#14b8a6"] }
  ];

  var catById = {};
  CATEGORIES.forEach(function (c) { catById[c.id] = c; });

  /* ---------------------------------------------------
     SOURCES DE CODES
     Format : identifiant du jeu : { site: "nom du site", url: "adresse" }
     Je n'ai pas pu vérifier ces pages en direct : clique sur
     chacune. Si un lien ne marche pas, supprime sa ligne : la
     fiche affichera « Source de codes non disponible ».
     --------------------------------------------------- */
  var CODE_SOURCES = {
    bloxfruits: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-blox-fruits-codes/" },
    adoptme: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-adopt-me-codes/" },
    ps99: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-pet-simulator-99-codes/" },
    beeswarm: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-bee-swarm-simulator-codes/" },
    mm2: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-murder-mystery-2-codes/" },
    royalehigh: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-royale-high-codes/" },
    animeadventures: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-anime-adventures-codes/" },
    shindolife: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-shindo-life-codes/" },
    fisch: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-fisch-codes/" },
    growagarden: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-grow-a-garden-codes/" },
    blade: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-blade-ball-codes/" },
    dti: { site: "Pro Game Guides", url: "https://progameguides.com/roblox/roblox-dress-to-impress-codes/" }
  };

  /* ===================================================
     2. OUTILS (déclarés en premier car utilisés partout)
     =================================================== */

  function $(id) { return document.getElementById(id); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function norm(s) {
    return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function slug(s) {
    return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function uid() { return Math.random().toString(36).slice(2, 9); }

  function catLabel(id) { return catById[id] ? catById[id].label : id; }

  function initials(name) {
    var words = name.replace(/[^A-Za-z0-9 ]/g, "").split(" ").filter(Boolean);
    if (!words.length) return "?";
    if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
    return words[0].slice(0, 2).toUpperCase();
  }

  function thumbStyle(g) {
    var c = catById[g.cat] ? catById[g.cat].colors : ["#8b5cf6", "#38bdf8"];
    return "background:linear-gradient(135deg," + c[0] + "," + c[1] + ")";
  }

  function searchUrl(g) {
    return "https://www.roblox.com/discover/?Keyword=" + encodeURIComponent(g.name);
  }

  function gameUrl(g) {
    if (g.placeId) return "https://www.roblox.com/games/" + g.placeId;
    return searchUrl(g);
  }

  function rankLabel(g) { return g.rank === "none" ? "Non classé" : g.rank; }

  function rankIdx(r) { return r === "none" ? RANKS.length : RANKS.indexOf(r); }

  function textOn(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = n >> 16, gr = (n >> 8) & 255, b = n & 255;
    return (0.299 * r + 0.587 * gr + 0.114 * b) > 150 ? "#10101f" : "#ffffff";
  }

  /* Accepte un lien roblox.com/games/NOMBRE… ou un simple nombre. */
  function parseRobloxUrl(s) {
    s = String(s || "").trim();
    if (!s) return { ok: true, placeId: null };
    if (/^\d{5,16}$/.test(s)) return { ok: true, placeId: Number(s) };
    var m = s.match(/^(?:https?:\/\/)?(?:www\.)?roblox\.com\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?games\/(\d{1,16})/i);
    if (m) return { ok: true, placeId: Number(m[1]) };
    return { ok: false, placeId: null };
  }

  /* Stockage local, avec repli en mémoire si le navigateur le bloque */
  var memory = {};
  var store = {
    get: function (key, fallback) {
      try {
        var v = localStorage.getItem(key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) {
        return key in memory ? memory[key] : fallback;
      }
    },
    set: function (key, value) {
      memory[key] = value;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignoré */ }
    }
  };

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return fallbackCopy(text); });
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function copyAndToast(text, message) {
    copyText(text).then(function (ok) {
      toast(ok ? message : "Copie impossible : sélectionne le texte et copie-le à la main.");
    });
  }

  var toastTimer = null;
  function toast(message) {
    var t = $("toast");
    t.textContent = message;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2800);
  }

  function toB64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function fromB64(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  /* ===================================================
     3. CATALOGUE
     ===================================================
     PARTIE A : jeux avec fiche détaillée et rang éditorial.
     Ne change JAMAIS l'identifiant (1er champ) d'un jeu
     existant : il sert aux favoris et aux Tier Lists.
     =================================================== */

  function G(id, name, cat, genre, rank, placeId, desc, pros, cons) {
    return { id: id, name: name, cat: cat, genre: genre, rank: rank, placeId: placeId, desc: desc, pros: pros, cons: cons, codes: [] };
  }

  var GAMES = [
    /* ---- Anime ---- */
    G("bloxfruits", "Blox Fruits", "anime", "Action-RPG, aventure sur les mers", "S", 2753915549,
      "Inspiré des mangas de pirates : explore des îles, mange des Fruits du Démon, affronte des boss et monte en niveau.",
      ["Progression très longue", "Beaucoup de styles de combat"],
      ["Beaucoup de répétition (grind)", "Les premiers niveaux peuvent être difficiles"]),
    G("animeadventures", "Anime Adventures", "anime", "Tower defense avec personnages d'anime", "A", 8304191830,
      "Invoque des personnages inspirés de l'animation japonaise et place-les sur la carte pour arrêter les vagues d'ennemis.",
      ["Grande collection de personnages", "Jouable en coopération"],
      ["Invocations basées sur la chance", "Certaines unités sont longues à obtenir"]),
    G("animevanguards", "Anime Vanguards", "anime", "Tower defense avec personnages d'anime", "A", 16146832113,
      "Un autre tower defense à thème anime : construis une équipe, améliore tes unités et progresse de niveau en niveau.",
      ["Combats spectaculaires", "Se joue seul ou à plusieurs"],
      ["Progression lente", "Dépend de la chance pour les meilleures unités"]),
    G("shindolife", "Shindo Life", "anime", "Combat et aventure inspirés des ninjas", "B", 4616652839,
      "Choisis un pouvoir, fais des missions et affronte d'autres joueurs dans un monde inspiré des mangas de ninjas.",
      ["Beaucoup de pouvoirs différents", "Combats rapides"],
      ["Peut sembler confus au début", "Le contenu change souvent"]),

    /* ---- Horreur ---- */
    G("doors", "Doors", "horreur", "Horreur coopérative, exploration de chambres", "S", 6516141723,
      "Traverse un hôtel hanté chambre après chambre en évitant des monstres et en résolvant des énigmes.",
      ["Ambiance très réussie", "Se joue seul ou en équipe"],
      ["Peut faire sursauter", "Une partie complète est assez longue"]),
    G("piggy", "Piggy", "horreur", "Horreur et évasion en équipe", "B", 4623386862,
      "Survivants contre un monstre : trouve des objets, résous des énigmes et échappe-toi avant d'être attrapé.",
      ["Chapitres variés", "Sympa à jouer entre amis"],
      ["Peut être stressant", "La qualité varie selon les modes"]),
    G("pressure", "Pressure", "horreur", "Horreur coopérative sous-marine", "A", 12552538292,
      "Explore une base sous-marine plongée dans le noir, récupère des objets et évite les créatures qui rôdent.",
      ["Atmosphère pesante", "La coopération est utile"],
      ["Demande de la concentration", "Sursauts fréquents"]),
    G("mimic", "The Mimic", "horreur", "Horreur à chapitres, folklore japonais", "A", 6243699076,
      "Une aventure en chapitres basée sur des légendes japonaises, à parcourir seul ou en groupe.",
      ["Histoire marquante", "Univers visuel soigné"],
      ["Peut être effrayant", "Certains chapitres demandent de l'endurance"]),
    G("breakin", "Break In (Story)", "horreur", "Aventure et défense en histoire", "C", 4620170611,
      "Protège une maison et ses habitants contre un méchant dans une histoire à chapitres.",
      ["Accessible aux plus jeunes joueurs", "Histoire facile à suivre"],
      ["Moins de profondeur que d'autres jeux", "Certains passages se répètent"]),

    /* ---- Simulateurs ---- */
    G("ps99", "Pet Simulator 99", "simulateur", "Collection de compagnons et récolte", "S", 8737899170,
      "Récolte des pièces, fais éclore des œufs et collectionne des compagnons de plus en plus rares dans des zones à débloquer.",
      ["Très grande collection", "Se joue en groupe"],
      ["Dépend de la chance", "Peut pousser à dépenser des Robux"]),
    G("beeswarm", "Bee Swarm Simulator", "simulateur", "Récolte de miel et élevage d'abeilles", "A", 1537690962,
      "Élève des abeilles, récolte du pollen dans les champs de fleurs et transforme-le en miel.",
      ["Progression variée", "Nombreuses quêtes"],
      ["Démarrage lent", "Demande beaucoup de temps de jeu"]),
    G("growagarden", "Grow a Garden", "simulateur", "Jardinage et collection", "A", 126884695634066,
      "Plante des graines, fais pousser des cultures, vends tes récoltes et agrandis ton jardin.",
      ["Rythme détendu", "Simple à comprendre"],
      ["Beaucoup d'attente entre les récoltes", "Les événements changent souvent"]),
    G("fisch", "Fisch", "simulateur", "Pêche et exploration", "A", 16732694052,
      "Pêche dans différentes zones, améliore ton matériel et explore le monde pour attraper des poissons rares.",
      ["Ambiance relaxante", "Beaucoup de poissons à découvrir"],
      ["Répétitif à la longue", "Progression lente"]),

    /* ---- Tycoon ---- */
    G("themepark", "Theme Park Tycoon 2", "tycoon", "Construction de parc d'attractions", "A", 69184822,
      "Construis et gère ton propre parc : manèges, décors, chemins et boutiques, avec beaucoup de liberté de création.",
      ["Énormément de liberté", "Idéal pour les créatifs"],
      ["Prise en main assez longue", "Demande de la patience"]),
    G("lumber", "Lumber Tycoon 2", "tycoon", "Bûcheronnage, construction et commerce", "B", 13822889,
      "Coupe du bois, vends-le et construis la maison de tes rêves dans un monde très libre.",
      ["Mode bac à sable", "Construction libre"],
      ["Graphismes anciens", "Interface peu intuitive"]),
    G("restaurant", "Restaurant Tycoon 2", "tycoon", "Gestion de restaurant", "C", 3398014311,
      "Décore ton restaurant, engage du personnel et développe ton activité.",
      ["Décoration personnalisable", "Jeu calme"],
      ["Rythme lent", "Peut devenir répétitif"]),

    /* ---- Jeux de rôle ---- */
    G("brookhaven", "Brookhaven RP", "rp", "Jeu de rôle dans une ville", "S", 4924922222,
      "Vis une autre vie dans une ville : maisons, véhicules, métiers et rencontres entre joueurs.",
      ["Très facile à prendre en main", "Idéal pour inventer des scénarios"],
      ["Pas d'objectifs précis", "L'ambiance dépend des joueurs présents"]),
    G("adoptme", "Adopt Me!", "rp", "Jeu de rôle familial, animaux de compagnie", "S", 920587237,
      "Adopte et élève des animaux, décore ta maison et échange avec d'autres joueurs.",
      ["Accessible à tous", "Événements saisonniers"],
      ["Les échanges demandent de la prudence", "Certains objets sont difficiles à obtenir"]),
    G("bloxburg", "Welcome to Bloxburg", "rp", "Construction de maison et vie de ville", "A", 185655149,
      "Construis ta maison, trouve un métier et vis ta vie dans une petite ville.",
      ["Outils de construction poussés", "Très créatif"],
      ["Accès payant en Robux", "Il faut gagner de l'argent en jeu au début"]),
    G("royalehigh", "Royale High", "rp", "Jeu de rôle, mode et école", "B", 735030788,
      "Va à l'école, collectionne des tenues et explore des mondes féeriques.",
      ["Beaucoup de vêtements", "Univers féérique"],
      ["Monnaies longues à gagner", "Quelques éléments payants"]),
    G("dti", "Dress to Impress", "rp", "Mode et défilé", "A", 15101393044,
      "Crée une tenue sur un thème donné puis défile devant les autres joueurs qui votent.",
      ["Très créatif", "Parties courtes"],
      ["Dépend des votes des joueurs", "Certains objets sont payants"]),
    G("pizza", "Work at a Pizza Place", "rp", "Jeux de rôle, métiers en équipe", "B", 192800,
      "Travaille dans une pizzeria : prépare, cuisine et livre des pizzas avec les autres joueurs.",
      ["Esprit d'équipe", "Simple à jouer"],
      ["Graphismes simples", "Tâches répétitives"]),

    /* ---- Survie ---- */
    G("nds", "Natural Disaster Survival", "survie", "Survie face aux catastrophes naturelles", "C", 189707,
      "Survis à des catastrophes comme les tornades, les tsunamis ou les météorites sur une carte différente à chaque manche.",
      ["Parties courtes", "Très simple à comprendre"],
      ["Contenu limité", "Peu de progression"]),
    G("evade", "Evade", "survie", "Course-poursuite contre des ennemis", "B", 9872472334,
      "Cours, saute et esquive des ennemis qui te poursuivent sur des cartes variées.",
      ["Parties rapides", "Très dynamique"],
      ["Peut être frustrant", "Demande de bons réflexes"]),
    G("99nights", "99 Nights in the Forest", "survie", "Survie coopérative en forêt", "A", 79546208627805,
      "Survis plusieurs nuits dans une forêt hostile : récolte des ressources, construis un camp et protège-toi des créatures.",
      ["Idéal en équipe", "Ambiance tendue"],
      ["Difficile en solo", "Demande de bien s'organiser"]),

    /* ---- Obby ---- */
    G("toh", "Tower of Hell", "obby", "Parcours d'obstacles en tour", "A", 1962086868,
      "Atteins le sommet d'une tour d'obstacles avant la fin du temps imparti, sans points de contrôle.",
      ["Défi exigeant", "Parties courtes"],
      ["Très frustrant", "Demande de la précision"]),
    G("speedrun4", "Speed Run 4", "obby", "Parcours de vitesse", "C", null,
      "Un parcours où l'on court, saute et glisse à travers des niveaux pour battre ses propres temps.",
      ["Facile à reprendre", "Bon pour progresser"],
      ["Contenu répétitif", "Demande de la précision"]),

    /* ---- FPS / Tir ---- */
    G("arsenal", "Arsenal", "fps", "Jeu de tir rapide", "A", 286090429,
      "Affronte d'autres joueurs dans des parties courtes : à chaque élimination, tu changes d'arme.",
      ["Parties très rapides", "Armes variées"],
      ["Public très compétitif", "Peut être chaotique"]),
    G("rivals", "Rivals", "fps", "Duels de tir en équipe", "S", 17625359962,
      "Des duels de tir à la première personne, en 1 contre 1 ou en équipe, avec un système de classement.",
      ["Compétitif", "Matchs courts"],
      ["Niveau élevé", "Demande de l'entraînement"]),

    /* ---- Combat ---- */
    G("blade", "Blade Ball", "combat", "Jeu de réflexes avec une balle", "A", 13772394625,
      "Renvoie la balle qui te cible avec ton épée : le dernier joueur en vie gagne.",
      ["Règles simples", "Parties rapides"],
      ["Dépend de la connexion", "Peut être stressant"]),
    G("tsb", "The Strongest Battlegrounds", "combat", "Arène de combat inspirée des mangas", "A", 10449761463,
      "Choisis un personnage aux pouvoirs spectaculaires et affronte d'autres joueurs dans une arène.",
      ["Combats spectaculaires", "Technique à maîtriser"],
      ["Courbe d'apprentissage", "Public compétitif"]),

    /* ---- Entre amis ---- */
    G("mm2", "Murder Mystery 2", "amis", "Déduction et survie entre amis", "S", 142823291,
      "Un joueur est le meurtrier, un autre le shérif, tous les autres sont innocents : survis ou démasque le coupable.",
      ["Parfait entre amis", "Manches courtes"],
      ["L'ambiance varie selon les joueurs", "Les objets rares sont très convoités"]),
    G("buildaboat", "Build A Boat For Treasure", "amis", "Construction de bateau en groupe", "A", 537413528,
      "Construis un bateau avec tes amis puis navigue le long d'une rivière pour atteindre le trésor.",
      ["Créatif", "Super en groupe"],
      ["Trajets longs", "Peut être répétitif"]),

    /* ---- Autres genres / Stratégie ---- */
    G("jailbreak", "Jailbreak", "autres", "Policiers contre voleurs en monde ouvert", "A", 606849621,
      "Évade-toi de prison puis braque des lieux, ou deviens policier pour arrêter les criminels.",
      ["Monde ouvert", "Véhicules variés"],
      ["Certains éléments sont payants", "Peut être chaotique"]),
    G("tds", "Tower Defense Simulator", "strategie", "Tower defense coopératif", "A", 3260590327,
      "Place des tours pour défendre ta base contre des vagues d'ennemis, seul ou avec d'autres joueurs.",
      ["Stratégique", "Coopératif"],
      ["Progression lente", "Certaines tours sont difficiles à obtenir"])
  ];

  /* ---------------------------------------------------
     PARTIE B : jeux « Non classé » (une ligne par jeu).

     POUR AJOUTER UN JEU : ajoute une ligne dans la bonne
     catégorie ci-dessous.
       "Nom du jeu",                      ← sans lien direct
       ["Nom du jeu", 123456789],         ← avec l'identifiant Roblox
     L'identifiant est le nombre dans le lien du jeu :
     roblox.com/games/123456789/Nom
     Un nom au hasard n'est jamais ajouté : si le jeu existe déjà
     dans le catalogue, la ligne est ignorée.
     --------------------------------------------------- */
  var EXTRA = {
    anime: [
      ["Anime Defenders", 17017769292], ["All Star Tower Defense", 4646477729],
      ["King Legacy", 4520749081], ["Project Slayers", 5956785391], ["Type Soul", 14067600077],
      ["Ro-Ghoul", 914010731], ["Ninja Legends", 3956818381],
      "Anime Fighters Simulator", "Anime Last Stand", "Anime Champions Simulator",
      "Anime Warriors Simulator", "Anime Dimensions", "Anime Souls Simulator", "Anime Lifting Simulator",
      "Demonfall", "Grand Piece Online", "A One Piece Game", "Fruit Battlegrounds", "Haze Piece",
      "Jujutsu Shenanigans", "Untitled Attack on Titan", "Attack on Titan Revolution",
      "Dragon Ball Z Final Stand", "Heroes Battlegrounds", "Heroes Online",
      "Boku no Roblox: Remastered", "Sakura Stand"
    ],
    horreur: [
      "Break In 2", "The Rake REMASTERED", "Apeirophobia", "Flicker", "Identity Fraud",
      "Midnight Horrors", "Dead Silence", "Rainbow Friends", "Specter", "Forsaken",
      "Survive the Killer", "Nico's Nextbots", "The Intruder", "Dandy's World",
      "Stop It, Slender!", "Zombie Attack", "Zombie Uprising", "Dusty Trip", "Ghost Simulator"
    ],
    simulateur: [
      ["Pet Simulator X", 6284583030], ["Bubble Gum Simulator", 2512643572],
      "Mining Simulator 2", "Saber Simulator", "Magnet Simulator", "Strongman Simulator",
      "Weight Lifting Simulator 3", "Muscle Legends", "Pet Catchers", "Unboxing Simulator",
      "Giant Simulator", "Farming and Friends", "Welcome to Farmtown", "Sword Factory X",
      "Steal a Brainrot", "Sol's RNG", "Escape Tsunami For Brainrots", "Treasure Hunt Simulator"
    ],
    tycoon: [
      ["Car Dealership Tycoon", 1554960397],
      "Retail Tycoon 2", "Pizza Factory Tycoon", "Millionaire Empire Tycoon", "Army Tycoon",
      "Super Hero Tycoon", "My Restaurant!", "Cook Burgers", "War Tycoon", "Miners Haven"
    ],
    rp: [
      ["MeepCity", 370731277],
      "Berry Avenue", "Livetopia", "Roville", "Ro-Citizens", "Emergency Response: Liberty County",
      "Greenville", "Southwest Florida", "Neighborhood of Robloxia", "Roblox High School 2",
      "Fashion Famous", "SCP: Site Roleplay", "BlockSpin"
    ],
    survie: [
      "Booga Booga", "The Isle", "The Wild West", "Shark Bite", "Sharkbite 2",
      "Apocalypse Rising 2", "Raise a Floppa", "Fallen Survival", "Zombie Rush", "Super Bomb Survival"
    ],
    fps: [
      ["Phantom Forces", 292439477], ["Bad Business", 3233893879],
      ["Counter Blox", 301549746], ["Big Paintball", 3527629287],
      "Entry Point", "Frontlines", "Criminality", "Aimblox", "Rush Point", "Strucid",
      "Energy Assault", "Blackhawk Rescue Mission 5", "Island Royale"
    ],
    combat: [
      ["Slap Battles", 9431156611], ["Da Hood", 2788229376], ["Roblox BedWars", 6872265039],
      "Combat Warriors", "Untitled Boxing Game", "Boxing Beta", "Rogue Lineage",
      "Elemental Battlegrounds", "Pixel Blade"
    ],
    obby: [
      "Mega Easy Obby", "Tower of Misery", "Obby But You're on a Bike", "Difficulty Chart Obby",
      "Steep Steps", "Juke's Towers of Hell", "Flood Escape 2", "Climb and Jump Tower",
      "Obby Creator", "Be Crushed by a Speeding Wall", "Escape Room"
    ],
    course: [
      ["Vehicle Simulator", 171391948], ["Driving Empire", 3351674303], ["Legends of Speed", 3101667897],
      "Car Crushers 2", "Ultimate Driving: Westover Islands", "Midnight Racing: Tokyo",
      "Drive World", "Race Clicker", "Bike of Hell"
    ],
    sport: [
      ["Football Fusion 2", 8204899140],
      "Blue Lock Rivals", "Basketball Legends", "Volleyball 4.2", "Volleyball Legends",
      "Super Striker League", "Ultimate Football", "Legendary Football", "RB World 4",
      "Golf It!", "Super Golf!", "Hoopz", "Basketball Zero", "TPS Street Soccer", "Tennis Zero"
    ],
    aventure: [
      ["Dungeon Quest", 2414851778], ["Deepwoken", 4111023553], ["Arcane Odyssey", 3272915504],
      ["Islands", 4872321990],
      "Treasure Quest", "Skyblock", "World // Zero", "Dragon Adventures", "Wild Horse Islands",
      "Wild Savannah", "Creatures of Sonaria", "Ability Wars"
    ],
    strategie: [
      "Toilet Tower Defense", "Tower Battles", "Tower Heroes", "Rise of Nations",
      "Plants vs Brainrots", "Doomspire Defenders"
    ],
    amis: [
      ["Flee the Facility", 893973440], ["Funky Friday", 6447798030],
      "Epic Minigames", "Hide and Seek Extreme", "Speed Draw!", "Ink Game", "Sword Fights on the Heights"
    ],
    autres: [
      ["Mad City", 1224212277], ["Prison Life", 155615604], ["Pls Donate", 8737602449],
      "Catalog Avatar Creator", "Mic Up"
    ]
  };

  var AUTO_DESC = "Expérience Roblox présente dans ce catalogue sans description détaillée ni rang éditorial. Consulte sa page Roblox pour en savoir plus.";

  var byId = {};
  var seenSlugs = {};
  GAMES.forEach(function (g) { byId[g.id] = g; seenSlugs[slug(g.name)] = true; });

  Object.keys(EXTRA).forEach(function (cat) {
    EXTRA[cat].forEach(function (entry) {
      var name = typeof entry === "string" ? entry : entry[0];
      var placeId = typeof entry === "string" ? null : entry[1];
      var s = slug(name);
      if (!s || seenSlugs[s]) return;
      seenSlugs[s] = true;
      var g = {
        id: "x-" + s, name: name, cat: cat, genre: catLabel(cat), rank: "none",
        placeId: placeId, desc: AUTO_DESC, pros: [], cons: [], codes: []
      };
      GAMES.push(g);
      byId[g.id] = g;
    });
  });

  /* ---- Jeux ajoutés par l'utilisateur (stockés dans le navigateur) ---- */
  function addToCatalog(g) {
    GAMES.push(g);
    byId[g.id] = g;
  }

  function makeCustom(o) {
    if (!o || typeof o.name !== "string" || !o.name.trim()) return null;
    var id = typeof o.id === "string" && /^u-[a-z0-9]{3,12}$/.test(o.id) ? o.id : "u-" + uid();
    return {
      id: id,
      name: o.name.trim().slice(0, 60),
      cat: catById[o.cat] ? o.cat : "autres",
      genre: "Ajouté par toi",
      rank: "none",
      placeId: typeof o.placeId === "number" && o.placeId > 0 ? o.placeId : null,
      desc: String(o.desc || "").slice(0, 200) || "Jeu ajouté manuellement par toi. Consulte sa page Roblox pour en savoir plus.",
      pros: [], cons: [], codes: [], custom: true
    };
  }

  (store.get("rtl_custom", []) || []).forEach(function (o) {
    var g = makeCustom(o);
    if (g && !byId[g.id]) addToCatalog(g);
  });

  function persistCustom() {
    store.set("rtl_custom", GAMES.filter(function (g) { return g.custom; }).map(function (g) {
      return { id: g.id, name: g.name, cat: g.cat, placeId: g.placeId, desc: g.desc };
    }));
  }

  function customCount() { return GAMES.filter(function (g) { return g.custom; }).length; }

  /* ===================================================
     4. ÉTAT
     =================================================== */

  var favs = (store.get("rtl_favs", []) || []).filter(function (id) { return byId[id]; });
  var lists = [];
  var userCodes = store.get("rtl_codes", {}) || {};
  var tl = null;
  var selected = null;
  var draggedId = null;
  var sharedList = null;
  var currentKey = "home";
  var currentGameId = null;
  var editingTierId = null;
  var lastFocus = null;
  var poolLimit = POOL_SIZE;

  var filters = { q: "", cat: "all", rank: "all", sort: "rank", favOnly: false, limit: PAGE_SIZE };

  function isFav(id) { return favs.indexOf(id) !== -1; }

  function cleanList(o) {
    if (!o || !Array.isArray(o.tiers)) return null;
    var seen = {};
    var tiers = o.tiers.slice(0, MAX_TIERS).map(function (t) {
      t = t || {};
      var games = (Array.isArray(t.games) ? t.games : []).filter(function (id) {
        if (!byId[id] || seen[id]) return false;
        seen[id] = true;
        return true;
      });
      return {
        id: typeof t.id === "string" && t.id ? t.id.slice(0, 20) : uid(),
        name: String(t.name == null ? "" : t.name).slice(0, 20),
        color: /^#[0-9a-f]{6}$/i.test(t.color) ? t.color : "#8b5cf6",
        games: games
      };
    });
    if (!tiers.length) return null;
    return {
      id: typeof o.id === "string" && o.id ? o.id.slice(0, 20) : uid(),
      title: String(o.title || "").slice(0, 60),
      tiers: tiers,
      updated: Number(o.updated) || Date.now()
    };
  }

  function defaultTiers() {
    return RANKS.map(function (r) {
      return { id: uid(), name: r, color: RANK_COLORS[r], games: [] };
    });
  }

  function newList() {
    return { id: uid(), title: "", tiers: defaultTiers(), updated: Date.now() };
  }

  lists = (store.get("rtl_lists", []) || []).map(cleanList).filter(Boolean);
  tl = cleanList(store.get("rtl_draft", null)) || newList();

  function saveDraft() { store.set("rtl_draft", tl); }
  function saveFavs() { store.set("rtl_favs", favs); }

  function placedIds() {
    var set = {};
    tl.tiers.forEach(function (t) { t.games.forEach(function (id) { set[id] = true; }); });
    return set;
  }

  function placedCount() { return Object.keys(placedIds()).length; }

  /* ---- Partage par lien ---- */
  function encodeList(l) {
    var data = {
      v: 1,
      t: l.title,
      r: l.tiers.map(function (t) { return [t.name, t.color.replace("#", ""), t.games]; })
    };
    return toB64(JSON.stringify(data));
  }

  function decodeList(s) {
    try {
      var d = JSON.parse(fromB64(s));
      if (!d || !Array.isArray(d.r)) return null;
      return cleanList({
        title: d.t,
        tiers: d.r.map(function (r) { return { name: r[0], color: "#" + r[1], games: r[2] }; })
      });
    } catch (e) {
      return null;
    }
  }

  function baseUrl() { return location.href.split("#")[0]; }
  function shareUrl(l) { return baseUrl() + "#/partage/" + encodeList(l); }

  /* ===================================================
     5. AFFICHAGE : briques communes
     =================================================== */

  function gameCard(g) {
    var fav = isFav(g.id);
    return '<article class="game-card">' +
      '<span class="rank-pill" data-rank="' + g.rank + '" title="' + (g.rank === "none" ? "Non classé" : "Rang " + g.rank) + '">' + rankLabel(g) + "</span>" +
      '<div class="game-thumb" style="' + thumbStyle(g) + '" aria-hidden="true">' + esc(initials(g.name)) + "</div>" +
      '<div class="game-card-body">' +
        '<div class="tag-row"><span class="tag">' + esc(catLabel(g.cat)) + "</span>" + (g.custom ? '<span class="tag tag-custom">Ajouté par toi</span>' : "") + "</div>" +
        "<h3>" + esc(g.name) + "</h3>" +
        '<p class="game-card-genre">' + esc(g.genre) + "</p>" +
        '<p class="game-card-desc">' + esc(g.desc) + "</p>" +
        '<div class="game-card-actions">' +
          '<button type="button" class="btn btn-secondary btn-small" data-action="open" data-id="' + esc(g.id) + '">Voir la fiche</button>' +
          '<button type="button" class="fav-btn' + (fav ? " active" : "") + '" data-action="fav" data-id="' + esc(g.id) + '" aria-pressed="' + fav + '" aria-label="' + (fav ? "Retirer " : "Ajouter ") + esc(g.name) + (fav ? " des favoris" : " aux favoris") + '">' + (fav ? "♥" : "♡") + "</button>" +
        "</div>" +
      "</div></article>";
  }

  function miniGame(g, draggable, isSelected) {
    return '<div class="tier-game' + (isSelected ? " selected" : "") + '" role="button" tabindex="0" data-id="' + esc(g.id) + '" title="' + esc(g.name) + '"' +
      (draggable ? ' draggable="true"' : "") + (draggable ? ' aria-pressed="' + !!isSelected + '"' : "") + ">" +
      '<span class="mini-thumb" style="' + thumbStyle(g) + '">' + esc(initials(g.name)) + "</span>" +
      '<span class="mini-name">' + esc(g.name) + "</span></div>";
  }

  function tierRow(t, readonly) {
    var items = t.games.map(function (id) {
      return miniGame(byId[id], !readonly, !readonly && selected === id);
    }).join("");
    if (!items) {
      items = '<span class="tier-empty">' + (readonly ? "Aucun jeu dans ce rang" : "Dépose des jeux ici") + "</span>";
    }
    return '<div class="tier-row">' +
      '<div class="tier-label" style="background:' + t.color + ";color:" + textOn(t.color) + '">' +
        '<span class="tier-name">' + (esc(t.name) || "?") + "</span>" +
        (readonly ? "" : '<button type="button" class="tier-edit" data-action="tier-edit" data-tier="' + esc(t.id) + '">Modifier</button>') +
      "</div>" +
      '<div class="tier-items" data-drop="tier" data-tier="' + esc(t.id) + '">' + items + "</div></div>";
  }

  function updateStats() {
    $("stat-games").textContent = GAMES.length;
    $("stat-categories").textContent = CATEGORIES.length;
    $("stat-lists").textContent = lists.length;
    $("fav-count").textContent = favs.length;
  }

  /* ===================================================
     6. VUES
     =================================================== */

  /* ---- Accueil ---- */
  function renderHome() {
    $("home-categories").innerHTML = CATEGORIES.map(function (c) {
      var n = GAMES.filter(function (g) { return g.cat === c.id; }).length;
      return '<button type="button" class="category-card" data-action="filter-cat" data-cat="' + c.id + '">' +
        '<span class="cat-icon">' + c.icon + '</span><span class="cat-name">' + esc(c.label) + "</span>" +
        '<span class="cat-count">' + n + " jeu" + (n > 1 ? "x" : "") + "</span></button>";
    }).join("");

    var top = GAMES.filter(function (g) { return g.rank === "S"; }).slice(0, 6);
    $("home-top").innerHTML = top.map(gameCard).join("");
  }

  /* ---- Catalogue ---- */
  function syncCatalogControls() {
    $("search-input").value = filters.q;
    $("rank-filter").value = filters.rank;
    $("sort-select").value = filters.sort;
    $("fav-only").checked = filters.favOnly;
  }

  function getFiltered() {
    var q = norm(filters.q.trim());
    var list = GAMES.filter(function (g) {
      if (filters.cat !== "all" && g.cat !== filters.cat) return false;
      if (filters.rank !== "all" && g.rank !== filters.rank) return false;
      if (filters.favOnly && !isFav(g.id)) return false;
      if (q) {
        var hay = norm(g.name + " " + g.genre + " " + g.desc + " " + catLabel(g.cat));
        return q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
      }
      return true;
    });
    list.sort(function (a, b) {
      if (filters.sort === "name") return a.name.localeCompare(b.name, "fr");
      if (filters.sort === "category") {
        return catLabel(a.cat).localeCompare(catLabel(b.cat), "fr") || a.name.localeCompare(b.name, "fr");
      }
      return rankIdx(a.rank) - rankIdx(b.rank) || a.name.localeCompare(b.name, "fr");
    });
    return list;
  }

  function renderCatalog() {
    var chips = '<button type="button" class="chip' + (filters.cat === "all" ? " active" : "") + '" data-action="filter-cat" data-cat="all">Toutes</button>';
    chips += CATEGORIES.map(function (c) {
      return '<button type="button" class="chip' + (filters.cat === c.id ? " active" : "") + '" data-action="filter-cat" data-cat="' + c.id + '">' + c.icon + " " + esc(c.label) + "</button>";
    }).join("");
    $("category-filters").innerHTML = chips;

    var list = getFiltered();
    var n = list.length;
    var shown = list.slice(0, filters.limit);
    $("results-count").textContent = n === 0
      ? "0 jeu trouvé"
      : "Affichage de " + shown.length + " jeu" + (shown.length > 1 ? "x" : "") + " sur " + n;
    $("games-grid").innerHTML = shown.map(gameCard).join("");
    $("empty-state").hidden = n !== 0;

    var more = $("load-more");
    var rest = n - shown.length;
    more.hidden = rest <= 0;
    if (rest > 0) more.textContent = "Charger plus de jeux (" + rest + " restant" + (rest > 1 ? "s" : "") + ")";

    renderCustomList();
  }

  function resetLimit() { filters.limit = PAGE_SIZE; }

  /* ---- Mes jeux ajoutés ---- */
  function renderCustomList() {
    var cust = GAMES.filter(function (g) { return g.custom; });
    $("custom-count").textContent = cust.length ? "(" + cust.length + ")" : "";
    $("custom-empty").hidden = cust.length > 0;
    $("custom-list").innerHTML = cust.map(function (g) {
      return '<li class="custom-item"><div class="custom-info"><span class="custom-name">' + esc(g.name) + '</span><span class="custom-cat">' + esc(catLabel(g.cat)) + (g.placeId ? " · lien Roblox direct" : " · recherche Roblox") + "</span></div>" +
        '<div class="code-item-buttons">' +
          '<button type="button" class="btn btn-secondary btn-small" data-action="open" data-id="' + esc(g.id) + '">Fiche</button>' +
          '<button type="button" class="btn btn-danger btn-small" data-action="del-custom" data-id="' + esc(g.id) + '" aria-label="Supprimer ' + esc(g.name) + '">✕</button>' +
        "</div></li>";
    }).join("");
  }

  /* Résultat : "ok", "dup" ou "max" */
  function addCustom(name, cat, placeId, desc) {
    if (customCount() >= MAX_CUSTOM) return "max";
    var n = norm(name.trim());
    var exists = GAMES.some(function (g) { return norm(g.name) === n; });
    if (exists) return "dup";
    var g = makeCustom({ name: name, cat: cat, placeId: placeId, desc: desc });
    if (!g) return "dup";
    addToCatalog(g);
    return "ok";
  }

  function afterCatalogChange() {
    persistCustom();
    updateStats();
    if (currentKey === "catalog") renderCatalog(); else renderCustomList();
  }

  function removeCustom(id) {
    var g = byId[id];
    if (!g || !g.custom) return;
    if (!confirm("Supprimer le jeu « " + g.name + " » ? Il sera aussi retiré de tes favoris et de tes Tier Lists.")) return;
    GAMES = GAMES.filter(function (x) { return x.id !== id; });
    delete byId[id];
    favs = favs.filter(function (x) { return x !== id; });
    saveFavs();
    tl.tiers.forEach(function (t) { t.games = t.games.filter(function (x) { return x !== id; }); });
    lists.forEach(function (l) {
      l.tiers.forEach(function (t) { t.games = t.games.filter(function (x) { return x !== id; }); });
    });
    store.set("rtl_lists", lists);
    saveDraft();
    if (selected === id) selected = null;
    if (!$("game-modal").hidden && currentGameId === id) closeModal($("game-modal"));
    afterCatalogChange();
    toast("Jeu supprimé.");
  }

  /* ---- Classement général ---- */
  function rankedTiers(cat, useRandomIds) {
    return RANKS.map(function (r) {
      return {
        id: useRandomIds ? uid() : r, name: r, color: RANK_COLORS[r],
        games: GAMES.filter(function (g) { return g.rank === r && (cat === "all" || g.cat === cat); }).map(function (g) { return g.id; })
      };
    });
  }

  function renderRanking() {
    var cat = $("ranking-category").value || "all";
    $("ranking-board").innerHTML = rankedTiers(cat, false).map(function (t) { return tierRow(t, true); }).join("");
  }

  function rankingToCreator() {
    if (placedCount() > 0 && !confirm("Remplacer ta Tier List en cours par ce classement ?")) return;
    var cat = $("ranking-category").value || "all";
    tl = cleanList({
      id: uid(),
      title: cat === "all" ? "Classement général" : "Classement – " + catLabel(cat),
      tiers: rankedTiers(cat, true)
    });
    selected = null;
    saveDraft();
    location.hash = "#/createur";
    toast("Classement copié dans le créateur.");
  }

  /* ---- Favoris ---- */
  function renderFavorites() {
    var list = GAMES.filter(function (g) { return isFav(g.id); });
    $("favorites-grid").innerHTML = list.map(gameCard).join("");
    $("favorites-empty").hidden = list.length !== 0;
  }

  /* ---- Créateur de Tier List ---- */
  function syncEditorTitle() { $("tl-title").value = tl.title || ""; }

  function renderBoard() {
    $("tl-board").classList.toggle("has-selection", !!selected);
    document.querySelector("#view-tierlist .pool-section").classList.toggle("has-selection-pool", !!selected);
    $("tl-board").innerHTML = tl.tiers.map(function (t) { return tierRow(t, false); }).join("");

    var hint = $("tl-selected-hint");
    if (selected && byId[selected]) {
      hint.textContent = "Jeu sélectionné : " + byId[selected].name + ". Touche un rang (ou la réserve) pour le placer.";
      hint.hidden = false;
    } else {
      hint.hidden = true;
    }
  }

  function renderPool() {
    var placed = placedIds();
    var q = norm($("tl-pool-search").value.trim());
    var cat = $("tl-pool-category").value || "all";
    var all = GAMES.filter(function (g) { return !placed[g.id]; });
    var list = all.filter(function (g) {
      if (cat !== "all" && g.cat !== cat) return false;
      if (q && norm(g.name + " " + catLabel(g.cat)).indexOf(q) === -1) return false;
      return true;
    });
    list.sort(function (a, b) {
      return rankIdx(a.rank) - rankIdx(b.rank) || a.name.localeCompare(b.name, "fr");
    });
    var shown = list.slice(0, poolLimit);
    var rest = list.length - shown.length;
    $("tl-pool-count").textContent = "(" + list.length + ")";
    $("tl-pool").innerHTML = shown.length
      ? shown.map(function (g) { return miniGame(g, true, selected === g.id); }).join("")
      : '<span class="tier-empty">' + (all.length ? "Aucun jeu ne correspond au filtre." : "Tous les jeux sont classés !") + "</span>";
    var more = $("tl-pool-more");
    more.hidden = rest <= 0;
    if (rest > 0) more.textContent = "Afficher plus de jeux (" + rest + " restant" + (rest > 1 ? "s" : "") + ")";
  }

  function renderEditor() {
    renderBoard();
    renderPool();
  }

  function renderSaved() {
    var box = $("tl-saved-list");
    $("tl-saved-empty").hidden = lists.length !== 0;
    box.innerHTML = lists.map(function (l) {
      var n = 0;
      l.tiers.forEach(function (t) { n += t.games.length; });
      var date = new Date(l.updated).toLocaleDateString("fr-FR");
      return '<div class="saved-item"><h3>' + esc(l.title || "Sans titre") + "</h3>" +
        "<p>" + n + " jeu" + (n > 1 ? "x" : "") + " classé" + (n > 1 ? "s" : "") + " · " + l.tiers.length + " rangs · " + date + "</p>" +
        '<div class="saved-item-actions">' +
          '<button type="button" class="btn btn-primary btn-small" data-action="load-list" data-id="' + esc(l.id) + '">Ouvrir</button>' +
          '<button type="button" class="btn btn-accent btn-small" data-action="share-list" data-id="' + esc(l.id) + '">Partager</button>' +
          '<button type="button" class="btn btn-secondary btn-small" data-action="dup-list" data-id="' + esc(l.id) + '">Dupliquer</button>' +
          '<button type="button" class="btn btn-danger btn-small" data-action="del-list" data-id="' + esc(l.id) + '">Supprimer</button>' +
        "</div></div>";
    }).join("");
  }

  function moveGame(id, tierId) {
    tl.tiers.forEach(function (t) {
      t.games = t.games.filter(function (x) { return x !== id; });
    });
    if (tierId) {
      var target = tl.tiers.filter(function (t) { return t.id === tierId; })[0];
      if (target) target.games.push(id);
    }
    selected = null;
    saveDraft();
    renderEditor();
  }

  function zoneTier(zone) {
    return zone.dataset.drop === "pool" ? null : zone.dataset.tier;
  }

  function saveCurrent() {
    tl.title = ($("tl-title").value.trim() || "Ma Tier List").slice(0, 60);
    $("tl-title").value = tl.title;
    tl.updated = Date.now();
    var copy = clone(tl);
    var idx = -1;
    lists.forEach(function (l, i) { if (l.id === tl.id) idx = i; });
    if (idx >= 0) lists[idx] = copy; else lists.unshift(copy);
    store.set("rtl_lists", lists);
    saveDraft();
    renderSaved();
    updateStats();
    toast("Tier List sauvegardée ✔");
  }

  function findList(id) {
    return lists.filter(function (l) { return l.id === id; })[0];
  }

  function loadList(id) {
    var l = findList(id);
    if (!l) return;
    tl = cleanList(clone(l));
    selected = null;
    saveDraft();
    syncEditorTitle();
    renderEditor();
    window.scrollTo(0, 0);
    toast("Tier List ouverte : « " + (tl.title || "Sans titre") + " »");
  }

  function dupList(id) {
    var l = findList(id);
    if (!l) return;
    var c = cleanList(clone(l));
    c.id = uid();
    c.title = ((c.title || "Sans titre") + " (copie)").slice(0, 60);
    c.updated = Date.now();
    lists.unshift(c);
    store.set("rtl_lists", lists);
    renderSaved();
    updateStats();
    toast("Tier List dupliquée.");
  }

  function delList(id) {
    var l = findList(id);
    if (!l) return;
    if (!confirm("Supprimer la Tier List « " + (l.title || "Sans titre") + " » ?")) return;
    lists = lists.filter(function (x) { return x.id !== id; });
    store.set("rtl_lists", lists);
    renderSaved();
    updateStats();
    toast("Tier List supprimée.");
  }

  /* ---- Tier List partagée ---- */
  function renderShared(data) {
    var list = data ? decodeList(data) : null;
    sharedList = list;
    $("shared-error").hidden = !!list;
    $("shared-board").hidden = !list;
    document.querySelector(".shared-actions").hidden = !list;
    if (!list) {
      $("shared-title").textContent = "Tier List introuvable";
      $("shared-meta").textContent = "";
      return;
    }
    var n = 0;
    list.tiers.forEach(function (t) { n += t.games.length; });
    $("shared-title").textContent = list.title || "Tier List sans titre";
    $("shared-meta").textContent = n + " jeu" + (n > 1 ? "x" : "") + " classé" + (n > 1 ? "s" : "") + " dans " + list.tiers.length + " rangs";
    $("shared-board").innerHTML = list.tiers.map(function (t) { return tierRow(t, true); }).join("");
  }

  function duplicateShared() {
    if (!sharedList) return;
    if (placedCount() > 0 && !confirm("Remplacer ta Tier List en cours par cette copie ?")) return;
    tl = cleanList(clone(sharedList));
    tl.id = uid();
    tl.title = (tl.title ? tl.title + " (copie)" : "Copie").slice(0, 60);
    selected = null;
    saveDraft();
    location.hash = "#/createur";
    toast("Tier List dupliquée : tu peux la modifier.");
  }

  /* ===================================================
     7. FENÊTRES (modales)
     =================================================== */

  function openModal(m) {
    lastFocus = document.activeElement;
    m.hidden = false;
    document.body.style.overflow = "hidden";
    var c = m.querySelector(".modal-close");
    if (c) c.focus();
  }

  function closeModal(m) {
    m.hidden = true;
    if (!document.querySelector(".modal:not([hidden])")) document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) {
      try { lastFocus.focus(); } catch (e) { /* ignoré */ }
    }
  }

  /* ---- Fiche de jeu ---- */
  function codeItem(code) {
    return '<li class="code-item"><div><code>' + esc(code) + '</code><span class="code-note">Ajouté par toi – non vérifié</span></div>' +
      '<div class="code-item-buttons">' +
      '<button type="button" class="btn btn-primary btn-small" data-copy="' + esc(code) + '">Copier</button>' +
      '<button type="button" class="btn btn-danger btn-small" data-action="del-code" data-code="' + esc(code) + '" aria-label="Retirer le code ' + esc(code) + '">✕</button>' +
      "</div></li>";
  }

  function renderCodes(g) {
    var user = userCodes[g.id] || [];
    $("gd-codes").innerHTML = user.length
      ? user.map(codeItem).join("")
      : '<li class="muted small">Aucun code noté pour le moment.</li>';
  }

  function renderCodeSource(g) {
    var src = CODE_SOURCES[g.id];
    var link = $("gd-codes-link");
    var note = $("gd-codes-source-note");
    if (src && src.url) {
      link.href = src.url;
      link.hidden = false;
      note.className = "muted small";
      note.textContent = "Source externe : " + src.site + ". La page s'ouvre dans un nouvel onglet et n'est pas gérée par ce site.";
    } else {
      link.hidden = true;
      link.removeAttribute("href");
      note.className = "codes-unavailable";
      note.textContent = "Source de codes non disponible";
    }
  }

  function updateModalFav() {
    var fav = isFav(currentGameId);
    $("gd-fav").textContent = fav ? "♥ Retirer des favoris" : "♡ Ajouter aux favoris";
  }

  function openGame(id) {
    var g = byId[id];
    if (!g) return;
    currentGameId = id;
    var thumb = $("gd-thumb");
    thumb.setAttribute("style", thumbStyle(g));
    thumb.textContent = initials(g.name);
    $("gd-category").textContent = catLabel(g.cat);
    var pill = $("gd-rank");
    pill.textContent = rankLabel(g);
    pill.setAttribute("data-rank", g.rank);
    $("gd-custom-tag").hidden = !g.custom;
    $("game-modal-title").textContent = g.name;
    $("gd-genre").textContent = g.genre;
    $("gd-description").textContent = g.desc;

    var hasDetails = g.pros.length || g.cons.length;
    $("gd-pros-cons").hidden = !hasDetails;
    $("gd-pros").innerHTML = g.pros.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
    $("gd-cons").innerHTML = g.cons.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");

    var main = $("gd-roblox-link");
    var search = $("gd-search-link");
    main.href = gameUrl(g);
    search.href = searchUrl(g);
    if (g.placeId) {
      main.textContent = "Ouvrir sur Roblox ↗";
      search.hidden = false;
      $("gd-link-note").textContent = "Lien direct vers la page du jeu (identifiant " + g.placeId + "). Si ce lien n'ouvre pas le bon jeu, utilise la recherche.";
    } else {
      main.textContent = "Rechercher sur Roblox ↗";
      search.hidden = true;
      $("gd-link-note").textContent = "Pas de lien direct connu pour ce jeu : le bouton lance une recherche Roblox par nom.";
    }

    renderCodeSource(g);
    renderCodes(g);
    updateModalFav();
    openModal($("game-modal"));
  }

  function toggleFav(id) {
    var i = favs.indexOf(id);
    if (i >= 0) favs.splice(i, 1); else favs.push(id);
    saveFavs();
    updateStats();
    if (!$("game-modal").hidden && currentGameId === id) updateModalFav();
    renderView(currentKey);
    toast(i >= 0 ? "Retiré des favoris." : "Ajouté aux favoris ♥");
  }

  /* ---- Partage ---- */
  function openShare(list) {
    var url = shareUrl(list);
    $("share-link").value = url;
    var info = "Lien de " + url.length + " caractères.";
    if (url.length > 2000) info += " Il est assez long : certains services de messagerie pourraient le couper.";
    var custom = 0;
    list.tiers.forEach(function (t) {
      t.games.forEach(function (id) { if (byId[id] && byId[id].custom) custom++; });
    });
    if (custom) info += " Attention : " + custom + " jeu" + (custom > 1 ? "x" : "") + " ajouté" + (custom > 1 ? "s" : "") + " par toi n'apparaîtr" + (custom > 1 ? "ont" : "a") + " pas chez les personnes qui reçoivent le lien.";
    if (location.protocol === "file:") info += " Ce lien ne marchera pour d'autres personnes qu'une fois le site publié en ligne.";
    $("share-info").textContent = info;
    openModal($("share-modal"));
  }

  /* ---- Modification d'un rang ---- */
  function openTierModal(id) {
    var t = tl.tiers.filter(function (x) { return x.id === id; })[0];
    if (!t) return;
    editingTierId = id;
    $("tier-edit-name").value = t.name;
    $("tier-edit-color").value = t.color;
    openModal($("tier-modal"));
  }

  function editingTier() {
    return tl.tiers.filter(function (x) { return x.id === editingTierId; })[0];
  }

  function moveTier(delta) {
    var i = -1;
    tl.tiers.forEach(function (t, idx) { if (t.id === editingTierId) i = idx; });
    var j = i + delta;
    if (i < 0 || j < 0 || j >= tl.tiers.length) return;
    var tmp = tl.tiers[i];
    tl.tiers[i] = tl.tiers[j];
    tl.tiers[j] = tmp;
    saveDraft();
    renderEditor();
  }

  /* ===================================================
     8. NAVIGATION
     =================================================== */

  var ROUTES = { "": "home", catalogue: "catalog", classement: "ranking", createur: "tierlist", favoris: "favorites", partage: "shared" };
  var TITLES = {
    home: "Roblox Tier List – Classe et découvre les meilleurs jeux Roblox",
    catalog: "Catalogue – Roblox Tier List",
    ranking: "Classement général – Roblox Tier List",
    tierlist: "Créateur de Tier List – Roblox Tier List",
    favorites: "Mes favoris – Roblox Tier List",
    shared: "Tier List partagée – Roblox Tier List"
  };

  function renderView(key, data) {
    if (key === "home") renderHome();
    else if (key === "catalog") renderCatalog();
    else if (key === "ranking") renderRanking();
    else if (key === "tierlist") { renderEditor(); renderSaved(); }
    else if (key === "favorites") renderFavorites();
    else if (key === "shared") { if (data !== undefined) renderShared(data); }
  }

  function route() {
    var raw = location.hash.replace(/^#\/?/, "");
    var parts = raw.split("/");
    var key = Object.prototype.hasOwnProperty.call(ROUTES, parts[0]) ? ROUTES[parts[0]] : "home";
    currentKey = key;

    document.querySelectorAll(".view").forEach(function (v) {
      v.hidden = v.getAttribute("data-view") !== key;
    });
    document.querySelectorAll("[data-nav]").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("data-nav") === key);
    });
    document.title = TITLES[key];

    $("main-nav").classList.remove("open");
    $("nav-toggle").setAttribute("aria-expanded", "false");

    if (key === "catalog") syncCatalogControls();
    if (key === "tierlist") { syncEditorTitle(); poolLimit = POOL_SIZE; }
    renderView(key, key === "shared" ? parts.slice(1).join("/") : undefined);
    window.scrollTo(0, 0);
  }

  /* ===================================================
     9. ÉVÉNEMENTS
     =================================================== */

  function handleAction(node) {
    var a = node.getAttribute("data-action");
    var id = node.getAttribute("data-id");
    if (a === "open") openGame(id);
    else if (a === "fav") toggleFav(id);
    else if (a === "filter-cat") {
      filters.cat = node.getAttribute("data-cat");
      resetLimit();
      if (currentKey === "catalog") renderCatalog(); else location.hash = "#/catalogue";
    }
    else if (a === "tier-edit") openTierModal(node.getAttribute("data-tier"));
    else if (a === "load-list") loadList(id);
    else if (a === "share-list") { var l = findList(id); if (l) openShare(l); }
    else if (a === "dup-list") dupList(id);
    else if (a === "del-list") delList(id);
    else if (a === "del-custom") removeCustom(id);
    else if (a === "del-code") {
      var code = node.getAttribute("data-code");
      userCodes[currentGameId] = (userCodes[currentGameId] || []).filter(function (c) { return c !== code; });
      store.set("rtl_codes", userCodes);
      renderCodes(byId[currentGameId]);
    }
  }

  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!(t instanceof Element)) return;

    var closeBtn = t.closest("[data-close-modal]");
    if (closeBtn) { closeModal(closeBtn.closest(".modal")); return; }

    var copyBtn = t.closest("[data-copy]");
    if (copyBtn) {
      var code = copyBtn.getAttribute("data-copy");
      copyAndToast(code, "Code copié : " + code);
      return;
    }

    var actionNode = t.closest("[data-action]");
    if (actionNode) { handleAction(actionNode); return; }

    var gameEl = t.closest(".tier-game");
    if (gameEl) {
      if (gameEl.closest(".tier-board-readonly")) {
        openGame(gameEl.getAttribute("data-id"));
      } else if (t.closest("#view-tierlist")) {
        var gid = gameEl.getAttribute("data-id");
        selected = selected === gid ? null : gid;
        renderEditor();
      }
      return;
    }

    if (selected && t.closest("#view-tierlist")) {
      var zone = t.closest("[data-drop]");
      if (zone) moveGame(selected, zoneTier(zone));
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      var open = document.querySelector(".modal:not([hidden])");
      if (open) closeModal(open);
      return;
    }
    if ((e.key === "Enter" || e.key === " ") && e.target instanceof Element && e.target.classList.contains("tier-game")) {
      e.preventDefault();
      e.target.click();
    }
  });

  /* Glisser-déposer (ordinateur) */
  document.addEventListener("dragstart", function (e) {
    if (!(e.target instanceof Element)) return;
    var g = e.target.closest('.tier-game[draggable="true"]');
    if (!g) return;
    draggedId = g.getAttribute("data-id");
    e.dataTransfer.setData("text/plain", draggedId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(function () { g.classList.add("dragging"); }, 0);
  });

  document.addEventListener("dragover", function (e) {
    if (!draggedId || !(e.target instanceof Element)) return;
    var zone = e.target.closest("[data-drop]");
    if (!zone) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    zone.classList.add("drag-over");
  });

  document.addEventListener("dragleave", function (e) {
    if (!(e.target instanceof Element)) return;
    var zone = e.target.closest("[data-drop]");
    if (zone && !zone.contains(e.relatedTarget)) zone.classList.remove("drag-over");
  });

  document.addEventListener("drop", function (e) {
    if (!(e.target instanceof Element)) return;
    var zone = e.target.closest("[data-drop]");
    if (!zone) return;
    e.preventDefault();
    var id = draggedId || e.dataTransfer.getData("text/plain");
    draggedId = null;
    if (byId[id]) moveGame(id, zoneTier(zone));
  });

  document.addEventListener("dragend", function () {
    draggedId = null;
    document.querySelectorAll(".dragging").forEach(function (n) { n.classList.remove("dragging"); });
    document.querySelectorAll(".drag-over").forEach(function (n) { n.classList.remove("drag-over"); });
  });

  /* ===================================================
     10. DÉMARRAGE
     =================================================== */

  /* ---- Import automatique du catalogue games.json ---- */
  function loadImportedGames() {
    return fetch("games.json?update=" + Date.now(), { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(function (data) {
        var imported = Array.isArray(data) ? data : data.games;
        if (!Array.isArray(imported)) throw new Error("Format games.json invalide");

        var existingPlaces = {};
        var existingNames = {};
        GAMES.forEach(function (g) {
          if (g.placeId) existingPlaces[String(g.placeId)] = true;
          if (g.name) existingNames[slug(g.name)] = true;
        });

        var added = 0;
        imported.forEach(function (item) {
          if (!item || typeof item.name !== "string" || !item.name.trim()) return;

          var name = item.name.trim();
          var nameKey = slug(name);
          var placeId = Number(item.placeId);
          var placeKey = placeId > 0 ? String(placeId) : "";

          if (!nameKey || existingNames[nameKey]) return;
          if (placeKey && existingPlaces[placeKey]) return;

          var id = "imported-" + (placeKey || nameKey);
          if (byId[id]) return;

          var cat = catById[item.cat] ? item.cat : "autres";
          addToCatalog({
            id: id,
            name: name,
            cat: cat,
            genre: item.genre || catLabel(cat),
            rank: "none",
            placeId: placeKey ? placeId : null,
            desc: item.desc || AUTO_DESC,
            pros: Array.isArray(item.pros) ? item.pros : [],
            cons: Array.isArray(item.cons) ? item.cons : [],
            codes: Array.isArray(item.codes) ? item.codes : [],
            source: item.source || "Roblox Search"
          });

          existingNames[nameKey] = true;
          if (placeKey) existingPlaces[placeKey] = true;
          added++;
        });

        console.log("Catalogue automatique : " + added + " jeu(x) ajouté(s).");
      })
      .catch(function (error) {
        console.warn("Import du catalogue indisponible ; catalogue local conservé :", error);
      });
  }

  function init() {
    /* Listes déroulantes de catégories */
    var allOption = '<option value="all">Toutes les catégories</option>';
    var catOptions = CATEGORIES.map(function (c) { return '<option value="' + c.id + '">' + esc(c.label) + "</option>"; }).join("");
    $("ranking-category").innerHTML = allOption + catOptions;
    $("tl-pool-category").innerHTML = allOption + catOptions;
    $("ag-cat").innerHTML = catOptions;
    $("bulk-cat").innerHTML = catOptions;
    $("ag-cat").value = "autres";
    $("bulk-cat").value = "autres";

    /* Menu mobile */
    $("nav-toggle").addEventListener("click", function () {
      var open = $("main-nav").classList.toggle("open");
      this.setAttribute("aria-expanded", open ? "true" : "false");
    });

    /* Catalogue */
    $("search-input").addEventListener("input", function () { filters.q = this.value; resetLimit(); renderCatalog(); });
    $("rank-filter").addEventListener("change", function () { filters.rank = this.value; resetLimit(); renderCatalog(); });
    $("sort-select").addEventListener("change", function () { filters.sort = this.value; resetLimit(); renderCatalog(); });
    $("fav-only").addEventListener("change", function () { filters.favOnly = this.checked; resetLimit(); renderCatalog(); });
    $("load-more").addEventListener("click", function () { filters.limit += PAGE_SIZE; renderCatalog(); });
    $("reset-filters").addEventListener("click", function () {
      filters = { q: "", cat: "all", rank: "all", sort: "rank", favOnly: false, limit: PAGE_SIZE };
      syncCatalogControls();
      renderCatalog();
    });

    /* Ajout d'un jeu */
    $("add-game-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("ag-name").value.trim();
      if (!name) { toast("Donne un nom au jeu."); $("ag-name").focus(); return; }
      var p = parseRobloxUrl($("ag-url").value);
      if (!p.ok) { toast("Lien Roblox non reconnu. Utilise un lien roblox.com/games/…"); return; }
      var r = addCustom(name, $("ag-cat").value, p.placeId, $("ag-desc").value.trim());
      if (r === "dup") { toast("Un jeu portant ce nom existe déjà."); return; }
      if (r === "max") { toast("Limite de " + MAX_CUSTOM + " jeux ajoutés atteinte."); return; }
      $("ag-name").value = "";
      $("ag-url").value = "";
      $("ag-desc").value = "";
      afterCatalogChange();
      toast("Jeu ajouté ✔");
    });

    /* Ajout en lot */
    $("bulk-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var lines = $("bulk-text").value.split(/\r?\n/).filter(function (l) { return l.trim(); });
      if (!lines.length) { toast("Colle au moins une ligne."); return; }
      if (lines.length > 100) { toast("Maximum 100 lignes à la fois."); return; }
      var cat = $("bulk-cat").value;
      var added = 0, skipped = 0;
      lines.forEach(function (line) {
        var parts = line.split("|");
        var name = parts[0].trim();
        var p = parseRobloxUrl(parts.slice(1).join("|"));
        if (!name || !p.ok) { skipped++; return; }
        if (addCustom(name, cat, p.placeId, "") === "ok") added++; else skipped++;
      });
      if (added) $("bulk-text").value = "";
      afterCatalogChange();
      toast(added + " jeu" + (added > 1 ? "x" : "") + " ajouté" + (added > 1 ? "s" : "") + (skipped ? ", " + skipped + " ignoré" + (skipped > 1 ? "s" : "") + " (doublon ou lien invalide)" : "") + ".");
    });

    /* Classement */
    $("ranking-category").addEventListener("change", renderRanking);
    $("ranking-to-creator").addEventListener("click", rankingToCreator);

    /* Créateur */
    $("tl-title").addEventListener("input", function () { tl.title = this.value.slice(0, 60); saveDraft(); });
    $("tl-save").addEventListener("click", saveCurrent);
    $("tl-share").addEventListener("click", function () {
      tl.title = $("tl-title").value.trim().slice(0, 60);
      saveDraft();
      openShare(tl);
    });
    $("tl-new").addEventListener("click", function () {
      if (placedCount() > 0 && !confirm("Commencer une nouvelle liste ? Les changements non sauvegardés seront perdus.")) return;
      tl = newList();
      selected = null;
      saveDraft();
      syncEditorTitle();
      renderEditor();
      toast("Nouvelle Tier List prête.");
    });
    $("tl-reset").addEventListener("click", function () {
      tl.tiers.forEach(function (t) { t.games = []; });
      selected = null;
      saveDraft();
      renderEditor();
      toast("Tous les jeux sont revenus dans la réserve.");
    });
    $("tl-pool-search").addEventListener("input", function () { poolLimit = POOL_SIZE; renderPool(); });
    $("tl-pool-category").addEventListener("change", function () { poolLimit = POOL_SIZE; renderPool(); });
    $("tl-pool-more").addEventListener("click", function () { poolLimit += POOL_SIZE; renderPool(); });

    $("tl-add-tier-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = $("tl-new-tier-name");
      var name = nameInput.value.trim();
      if (!name) { toast("Donne un nom au rang."); nameInput.focus(); return; }
      if (tl.tiers.length >= MAX_TIERS) { toast("Maximum " + MAX_TIERS + " rangs."); return; }
      tl.tiers.push({ id: uid(), name: name.slice(0, 20), color: $("tl-new-tier-color").value, games: [] });
      nameInput.value = "";
      saveDraft();
      renderEditor();
      toast("Rang ajouté.");
    });

    /* Fenêtre de modification d'un rang */
    $("tier-edit-save").addEventListener("click", function () {
      var t = editingTier();
      if (!t) return;
      var name = $("tier-edit-name").value.trim();
      if (!name) { toast("Le nom du rang ne peut pas être vide."); return; }
      t.name = name.slice(0, 20);
      t.color = $("tier-edit-color").value;
      saveDraft();
      renderEditor();
      closeModal($("tier-modal"));
    });
    $("tier-edit-up").addEventListener("click", function () { moveTier(-1); });
    $("tier-edit-down").addEventListener("click", function () { moveTier(1); });
    $("tier-edit-delete").addEventListener("click", function () {
      var t = editingTier();
      if (!t) return;
      if (tl.tiers.length <= 1) { toast("Il faut garder au moins un rang."); return; }
      if (!confirm("Supprimer le rang « " + t.name + " » ? Ses jeux retourneront dans la réserve.")) return;
      tl.tiers = tl.tiers.filter(function (x) { return x.id !== editingTierId; });
      saveDraft();
      renderEditor();
      closeModal($("tier-modal"));
      toast("Rang supprimé.");
    });

    /* Fiche de jeu */
    $("gd-fav").addEventListener("click", function () { if (currentGameId) toggleFav(currentGameId); });
    $("gd-code-form").addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("gd-code-input");
      var code = input.value.trim();
      if (!code || !currentGameId) return;
      var user = userCodes[currentGameId] || [];
      if (user.indexOf(code) !== -1) { toast("Ce code est déjà dans ta liste."); return; }
      user.push(code);
      userCodes[currentGameId] = user;
      store.set("rtl_codes", userCodes);
      input.value = "";
      renderCodes(byId[currentGameId]);
      toast("Code noté.");
    });

    /* Fenêtre de partage */
    $("share-copy").addEventListener("click", function () {
      copyAndToast($("share-link").value, "Lien copié ✔");
    });
    $("share-link").addEventListener("focus", function () { this.select(); });
    if (navigator.share) {
      $("share-native").hidden = false;
      $("share-native").addEventListener("click", function () {
        navigator.share({ title: "Ma Tier List Roblox", url: $("share-link").value }).catch(function () { /* annulé */ });
      });
    }

    /* Page de partage */
    $("shared-duplicate").addEventListener("click", duplicateShared);
    $("shared-copy-link").addEventListener("click", function () {
      copyAndToast(location.href, "Lien copié ✔");
    });

    updateStats();
    window.addEventListener("hashchange", route);
    route();
  }

  loadImportedGames().then(function () { init(); });
})();