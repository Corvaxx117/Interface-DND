import {
  caracteristiquesPersonnages,
  chargerArmesForce,
  chargerArmesDexterite,
  chargerSorts,
  getArmesEtSortsPourPersonnage,
} from "./weapons-and-spells.js";

let armesForce = [];
let armesDexterite = [];
let sorts = [];

// Charger toutes les données nécessaires
async function chargerDonnees() {
  try {
    const [armesForceData, armesDexteriteData, sortsData] = await Promise.all([
      chargerArmesForce(),
      chargerArmesDexterite(),
      chargerSorts(),
    ]);

    if (!armesForceData || !armesDexteriteData || !sortsData) {
      throw new Error("Les données des armes ou des sorts sont introuvables.");
    }

    armesForce = armesForceData;
    armesDexterite = armesDexteriteData;
    sorts = sortsData;

    if (!armesForce.length || !armesDexterite.length || !sorts.length) {
      console.error("Les données des armes ou des sorts sont vides.");
    }
  } catch (error) {
    console.error("Erreur lors du chargement des données :", error);
  }
}

// Ajouter les bonus de force ou de dextérité aux dégâts
function appliquerBonus(personnage, armeId, degatsBase) {
  const caracteristiques = caracteristiquesPersonnages[personnage];
  if (!caracteristiques) return degatsBase;

  const estArmeForce = armesForce.some((arme) => arme.id === armeId);
  const estArmeDexterite = armesDexterite.some((arme) => arme.id === armeId);

  if (estArmeForce) {
    return degatsBase + caracteristiques.force; // Ajoute le bonus de force
  }
  if (estArmeDexterite) {
    return degatsBase + caracteristiques.dexterite; // Ajoute le bonus de dextérité
  }
  return degatsBase;
}

// Recalculer les dégâts
function recalculerDegats() {
  let totalDegats = 0;
  const personnage = obtenirNomPersonnage();
  const activeValuesByWeaponOrSpell = {};

  document.querySelectorAll(".cell.active").forEach((activeCell) => {
    const activeWeaponOrSpell =
      activeCell.getAttribute("data-weapon") || activeCell.getAttribute("data-spell");
    const activeDiceType = activeCell.getAttribute("data-dice");
    const activeValue = parseInt(activeCell.textContent, 10);

    if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell]) {
      activeValuesByWeaponOrSpell[activeWeaponOrSpell] = {};
    }

    if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType]) {
      activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] = 0;
    }

    activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] += activeValue;
  });

  for (const [weaponOrSpell, diceValues] of Object.entries(activeValuesByWeaponOrSpell)) {
    const armeOuSort =
      armesForce.find((a) => a.id === weaponOrSpell) ||
      armesDexterite.find((a) => a.id === weaponOrSpell) ||
      sorts.find((s) => s.id === weaponOrSpell);
    if (!armeOuSort) continue;

    let result = 0;

    // Analyse la formule pour récupérer les multiplicateurs et types de dés
    const formule = armeOuSort.formule.match(/(\d+)D(\d+)/g);
    if (formule) {
      formule.forEach((part) => {
        const [_, multiplicateur, typeDe] = part.match(/(\d+)D(\d+)/);
        const count = diceValues[`D${typeDe}`] || 0;
        result += count * parseInt(multiplicateur, 10);
      });
    }

    // Appliquer le bonus de force ou de dextérité
    result = appliquerBonus(personnage, weaponOrSpell, result);

    document.getElementById(`result-${weaponOrSpell}`).textContent = `Dégâts : ${result}`;
    totalDegats += result;
  }

  // Vérifie si le bouton "Coup critique" est actif
  const critiqueBtn = document.getElementById("critique-btn");
  if (critiqueBtn.classList.contains("active")) {
    totalDegats *= 2; // Multiplie les dégâts par deux si le bouton est actif
  }

  document.getElementById("resultat").textContent = totalDegats;
}

// Générer les tableaux pour un personnage
function genererTableauxPourPersonnage(personnage) {
  const sectionArmes = document.querySelector(".attack-type:nth-of-type(1)");
  const sectionSorts = document.querySelector(".attack-type:nth-of-type(2)");

  // Vérifie que les sections existent avant de les manipuler
  if (!sectionArmes || !sectionSorts) {
    console.error("Les sections pour les armes et sorts sont introuvables dans le HTML.");
    return;
  }

  // Supprime uniquement le contenu dynamique des sections, sans toucher aux <h2>
  sectionArmes.querySelectorAll(".tab-container").forEach((el) => el.remove());
  sectionSorts.querySelectorAll(".tab-container").forEach((el) => el.remove());

  const { armes: armesPersonnage, sorts: sortsPersonnage } =
    getArmesEtSortsPourPersonnage(personnage);

  // Vérifie que les données nécessaires sont chargées
  if (!armesForce || !armesDexterite || !sorts) {
    console.error("Les données des armes ou des sorts ne sont pas chargées.");
    return;
  }

  armesPersonnage.forEach((armeId) => {
    const arme =
      armesForce.find((a) => a.id === armeId) || armesDexterite.find((a) => a.id === armeId);
    if (!arme) {
      console.warn(`Arme avec l'ID "${armeId}" introuvable.`);
      return;
    }

    const container = document.createElement("div");
    container.classList.add("tab-container");

    const resultContainer = document.createElement("div");
    resultContainer.classList.add("result-container");
    resultContainer.innerHTML = `
      <p>${arme.nom} (${arme.formule})</p>
      <p class="result" id="result-${arme.id}">0</p>
    `;
    container.appendChild(resultContainer);

    Object.entries(arme.des).forEach(([typeDe, maxValeur]) => {
      const diceContainer = document.createElement("div");
      diceContainer.classList.add("dice-container");

      const table = document.createElement("table");
      const row = document.createElement("tr");

      for (let i = 1; i <= maxValeur; i++) {
        const cell = document.createElement("td");
        cell.classList.add("cell");
        cell.setAttribute("data-weapon", arme.id);
        cell.setAttribute("data-dice", typeDe);
        cell.textContent = i;
        row.appendChild(cell);
      }

      table.appendChild(row);
      diceContainer.appendChild(table);
      container.appendChild(diceContainer);
    });

    sectionArmes.appendChild(container);
  });

  sortsPersonnage.forEach((sortId) => {
    const sort = sorts.find((s) => s.id === sortId);
    if (!sort) {
      console.warn(`Sort avec l'ID "${sortId}" introuvable.`);
      return;
    }

    const container = document.createElement("div");
    container.classList.add("tab-container");

    const resultContainer = document.createElement("div");
    resultContainer.classList.add("result-container");
    resultContainer.innerHTML = `
      <p>${sort.nom} (${sort.formule})</p>
      <p class="result" id="result-${sort.id}">0</p>
    `;
    container.appendChild(resultContainer);

    Object.entries(sort.des).forEach(([typeDe, maxValeur]) => {
      const diceContainer = document.createElement("div");
      diceContainer.classList.add("dice-container");

      const table = document.createElement("table");
      const row = document.createElement("tr");

      for (let i = 1; i <= maxValeur; i++) {
        const cell = document.createElement("td");
        cell.classList.add("cell");
        cell.setAttribute("data-spell", sort.id);
        cell.setAttribute("data-dice", typeDe);
        cell.textContent = i;
        row.appendChild(cell);
      }

      table.appendChild(row);
      diceContainer.appendChild(table);
      container.appendChild(diceContainer);
    });

    sectionSorts.appendChild(container);
  });

  activerInteractions(); // Active les interactions sur les cellules
}

// Charger les données au démarrage
document.addEventListener("DOMContentLoaded", async () => {
  await chargerDonnees();
  const personnage = obtenirNomPersonnage();
  if (personnage) {
    genererTableauxPourPersonnage(personnage);
  }
  mettreAJourCerclesSorts();
});

document.addEventListener("mousemove", function (e) {
  let x = (e.clientX / window.innerWidth) * 100;
  let y = (e.clientY / window.innerHeight) * 100;

  document.documentElement.style.setProperty("--mouse-x", x + "%");
  document.documentElement.style.setProperty("--mouse-y", y + "%");
});

let totalDegats = 0; // Variable pour stocker la somme des dégâts

// Limites de sorts par personnage
const sortsMax = {
  Aodhan: 6,
  Mival: 5,
  Pavel: 4,
  Thorek: 5,
  Zinok: 6,
};

let sortsUtilises = 0; // Compteur de sorts utilisés

// Fonction pour vérifier si le personnage peut encore lancer un sort
function verifierLimiteSorts(personnage) {
  return sortsUtilises < sortsMax[personnage]; // Retourne false si la limite est atteinte
}

// Fonction pour normaliser le nom du personnage
function normaliserNomPersonnage(nom) {
  return nom.split(" ")[0].trim(); // Prend uniquement le premier mot du nom
}

// Fonction pour récupérer le nom du personnage à partir du nav actift data-personnage
function obtenirNomPersonnage() {
  const navActif = document.querySelector("nav a.visited");
  return navActif ? navActif.textContent.trim() : null;
  null;
}

// Fonction pour sauvegarder le compteur de sorts utilisés dans le local storage
function sauvegarderSortsUtilises(personnage) {
  const data = JSON.parse(localStorage.getItem("sortsUtilises")) || {};
  data[personnage] = sortsUtilises;
  localStorage.setItem("sortsUtilises", JSON.stringify(data));
}

// Fonction pour restaurer le compteur de sorts utilisés depuis le local storage
function restaurerSortsUtilises(personnage) {
  const data = JSON.parse(localStorage.getItem("sortsUtilises")) || {};
  return data[personnage] || 0;
}

// Fonction pour réinitialiser les sorts de tous les personnages
function reinitialiserTousLesSorts() {
  const data = {};
  Object.keys(sortsMax).forEach((personnage) => {
    data[personnage] = 0; // Réinitialise le compteur de sorts utilisés à 0
  });
  localStorage.setItem("sortsUtilises", JSON.stringify(data));
  alert("Tous les sorts ont été réinitialisés !");
}

// Fonction pour désactiver toutes les cellules de sorts
function desactiverToutesLesCellulesDeSorts() {
  document.querySelectorAll(".cell[data-spell]").forEach((cell) => {
    cell.classList.add("disabled");
    cell.style.pointerEvents = "none"; // Empêche les clics sur les cellules
    cell.style.opacity = "0.5"; // Réduit l'opacité pour indiquer qu'elles sont désactivées
  });
}

// Fonction pour réactiver toutes les cellules de sorts
function reactiverToutesLesCellulesDeSorts() {
  document.querySelectorAll(".cell[data-spell]").forEach((cell) => {
    cell.classList.remove("disabled");
    cell.style.pointerEvents = ""; // Réactive les clics sur les cellules
    cell.style.opacity = ""; // Restaure l'opacité normale
  });
}

// Fonction pour mettre à jour les cercles des sorts
function mettreAJourCerclesSorts() {
  const personnage = obtenirNomPersonnage();
  if (!personnage || !sortsMax[personnage]) return; // Vérifie que le personnage existe dans sortsMax

  sortsUtilises = restaurerSortsUtilises(personnage); // Restaure le compteur depuis le local storage

  const sortsContainer = document.getElementById("sorts-container");
  if (!sortsContainer) {
    console.error("Le conteneur des sorts est introuvable.");
    return;
  }

  const cercles = sortsContainer.querySelectorAll(".sort-circle");
  cercles.forEach((cercle, index) => {
    if (index < sortsMax[personnage] - sortsUtilises) {
      cercle.classList.add("filled"); // Cercle plein pour les sorts disponibles
    } else {
      cercle.classList.remove("filled"); // Cercle vide pour les sorts utilisés
    }
  });

  // Met à jour l'affichage des sorts restants
  const sortsRestants = sortsMax[personnage] - sortsUtilises;
  const sortsRestantsElement = document.getElementById("sorts-restants");
  if (sortsRestantsElement) {
    sortsRestantsElement.textContent = `Sorts restants : ${sortsRestants}`;
  }

  // Désactive ou réactive les cellules de sorts en fonction des sorts restants
  if (sortsRestants === 0) {
    desactiverToutesLesCellulesDeSorts();
  } else {
    reactiverToutesLesCellulesDeSorts();
  }
}

// Initialisation des cercles des sorts au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  const personnage = obtenirNomPersonnage();
  if (personnage) {
    genererTableauxPourPersonnage(personnage);
  }
  mettreAJourCerclesSorts();
});

// Sélection de toutes les cellules cliquables
document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", () => {
    const weaponOrSpell = cell.getAttribute("data-weapon") || cell.getAttribute("data-spell"); // Récupère l'arme ou le sort
    const diceType = cell.getAttribute("data-dice"); // Récupère le type de dé (ex: D20, D12)
    const value = parseInt(cell.textContent, 10); // Récupère la valeur de la cellule

    const isActive = cell.classList.contains("active");

    // Si la cellule est déjà active, la désactiver et réinitialiser les résultats
    if (isActive) {
      cell.classList.remove("active");

      // Réinitialise les styles des cellules précédentes
      document
        .querySelectorAll(
          `.cell[data-weapon="${weaponOrSpell}"][data-dice="${diceType}"], .cell[data-spell="${weaponOrSpell}"][data-dice="${diceType}"]`
        )
        .forEach((c) => {
          c.classList.remove("previous"); // Supprime la classe CSS pour les cellules précédentes
        });

      // Réinitialise la somme des dégâts
      totalDegats = 0;

      // Réinitialise les résultats individuels
      document.getElementById(`result-${weaponOrSpell}`).textContent = "Dégâts : 0";

      // Recalcule les dégâts pour toutes les cellules actives restantes
      const activeValuesByWeaponOrSpell = {};

      document.querySelectorAll(".cell.active").forEach((activeCell) => {
        const activeWeaponOrSpell =
          activeCell.getAttribute("data-weapon") || activeCell.getAttribute("data-spell");
        const activeDiceType = activeCell.getAttribute("data-dice");
        const activeValue = parseInt(activeCell.textContent, 10);

        if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell]) {
          activeValuesByWeaponOrSpell[activeWeaponOrSpell] = {};
        }

        if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType]) {
          activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] = 0;
        }

        activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] += activeValue;
      });

      // Calcule les dégâts totaux pour chaque arme ou sort
      for (const [weaponOrSpell, diceValues] of Object.entries(activeValuesByWeaponOrSpell)) {
        const result = calculs[weaponOrSpell](diceValues);

        // Met à jour le résultat individuel
        document.getElementById(`result-${weaponOrSpell}`).textContent = `Dégâts : ${result}`;

        // Ajoute au total général
        totalDegats += result;
      }

      // Met à jour le footer avec le nouveau total
      document.getElementById("resultat").textContent = totalDegats;

      return; // Sort de la fonction pour éviter de réactiver la cellule
    }

    // Réinitialise les styles des cellules pour le même type de dé
    document
      .querySelectorAll(
        `.cell[data-weapon="${weaponOrSpell}"][data-dice="${diceType}"], .cell[data-spell="${weaponOrSpell}"][data-dice="${diceType}"]`
      )
      .forEach((c) => {
        c.classList.remove("active");
        c.classList.remove("previous"); // Supprime la classe CSS pour les cellules précédentes
      });

    // Ajoute la classe active à la cellule cliquée
    cell.classList.add("active");

    // Applique la classe CSS pour les cellules précédentes
    let previous = true;
    document
      .querySelectorAll(
        `.cell[data-weapon="${weaponOrSpell}"][data-dice="${diceType}"], .cell[data-spell="${weaponOrSpell}"][data-dice="${diceType}"]`
      )
      .forEach((c) => {
        if (previous) {
          c.classList.add("previous"); // Ajoute la classe CSS pour les cellules précédentes
        }
        if (c === cell) previous = false;
      });

    // Réinitialise la somme des dégâts
    totalDegats = 0;

    // Recalcule les dégâts pour toutes les cellules actives
    const activeValuesByWeaponOrSpell = {};

    document.querySelectorAll(".cell.active").forEach((activeCell) => {
      const activeWeaponOrSpell =
        activeCell.getAttribute("data-weapon") || activeCell.getAttribute("data-spell");
      const activeDiceType = activeCell.getAttribute("data-dice");
      const activeValue = parseInt(activeCell.textContent, 10);

      if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell]) {
        activeValuesByWeaponOrSpell[activeWeaponOrSpell] = {};
      }

      if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType]) {
        activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] = 0;
      }

      activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] += activeValue;
    });

    // Calcule les dégâts totaux pour chaque arme ou sort
    for (const [weaponOrSpell, diceValues] of Object.entries(activeValuesByWeaponOrSpell)) {
      const result = calculs[weaponOrSpell](diceValues);

      // Met à jour le résultat individuel
      document.getElementById(`result-${weaponOrSpell}`).textContent = `Dégâts : ${result}`;

      // Ajoute au total général
      totalDegats += result;
    }

    // Met à jour le footer avec le nouveau total
    document.getElementById("resultat").textContent = totalDegats;
  });
});

// Gestion du clic sur les cellules de sorts
document.addEventListener("click", (event) => {
  const cell = event.target.closest(".cell[data-spell]");
  if (!cell) return;

  const personnage = obtenirNomPersonnage();
  if (!personnage || !sortsMax[personnage]) return; // Vérifie que le personnage existe dans sortsMax

  if (!verifierLimiteSorts(personnage)) {
    alert("Limite de sorts atteinte !");
    return; // Empêche l'exécution si la limite est atteinte
  }

  sortsUtilises++; // Incrémente le compteur de sorts utilisés
  sauvegarderSortsUtilises(personnage); // Sauvegarde dans le local storage

  // Met à jour les cercles des sorts
  mettreAJourCerclesSorts();
});

// Gestion du bouton "Coup critique"
document.getElementById("critique-btn").addEventListener("click", () => {
  const critiqueBtn = document.getElementById("critique-btn");
  const isActive = critiqueBtn.classList.contains("active");

  if (isActive) {
    // Désactive l'effet du coup critique
    critiqueBtn.classList.remove("active");

    // Recalcule les dégâts normaux
    recalculerDegats();
  } else {
    // Active l'effet du coup critique
    critiqueBtn.classList.add("active");

    // Multiplie le total des dégâts par deux pour le coup critique
    recalculerDegats();
  }
});

// Gestion du bouton "Réinitialiser"
document.getElementById("reset-btn").addEventListener("click", () => {
  // Réinitialise toutes les cellules
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("active");
    cell.classList.remove("previous"); // Réinitialise les cellules précédentes
    cell.style.backgroundColor = ""; // Réinitialise le background-color
  });

  // Réinitialise les résultats individuels
  document.querySelectorAll(".result").forEach((resultElement) => {
    resultElement.textContent = "0";
  });

  // Réinitialise le total général
  document.getElementById("resultat").textContent = "0";

  // Réinitialise uniquement la variable globale des dégâts
  totalDegats = 0;

  // Désactive le bouton "Coup critique" s'il est actif
  const critiqueBtn = document.getElementById("critique-btn");
  if (critiqueBtn.classList.contains("active")) {
    critiqueBtn.classList.remove("active");
  }

  // Ne réinitialise pas le compteur de sorts ou les cercles des sorts
});

// Gestion du bouton "Restaurer tous les sorts"
document.getElementById("reset-spells")?.addEventListener("click", () => {
  reinitialiserTousLesSorts();
  mettreAJourCerclesSorts(); // Met à jour les cercles des personnages
});

// Gestion du bouton "Restaurer les sorts" pour un personnage spécifique
document.getElementById("reset-spells-perso")?.addEventListener("click", () => {
  const personnage = normaliserNomPersonnage(obtenirNomPersonnage());
  if (!personnage || !sortsMax[personnage]) return; // Vérifie que le personnage existe dans sortsMax

  sortsUtilises = 0; // Réinitialise le compteur de sorts utilisés pour ce personnage
  sauvegarderSortsUtilises(personnage); // Sauvegarde dans le local storage
  mettreAJourCerclesSorts(); // Met à jour les cercles des sorts
});

// Fonction pour activer les interactions sur les cellules des tableaux
function activerInteractions() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      const weaponOrSpell = cell.getAttribute("data-weapon") || cell.getAttribute("data-spell");
      const diceType = cell.getAttribute("data-dice");
      const value = parseInt(cell.textContent, 10);

      const isActive = cell.classList.contains("active");

      // Si la cellule est déjà active, la désactiver et réinitialiser les résultats
      if (isActive) {
        cell.classList.remove("active");

        // Réinitialise les styles des cellules précédentes
        document
          .querySelectorAll(
            `.cell[data-weapon="${weaponOrSpell}"][data-dice="${diceType}"], .cell[data-spell="${weaponOrSpell}"][data-dice="${diceType}"]`
          )
          .forEach((c) => c.classList.remove("previous"));

        // Réinitialise les dégâts de l'arme ou du sort
        document.getElementById(`result-${weaponOrSpell}`).textContent = "Dégâts : 0";

        recalculerDegats();
        return;
      }

      // Réinitialise les styles des cellules pour le même type de dé
      document
        .querySelectorAll(
          `.cell[data-weapon="${weaponOrSpell}"][data-dice="${diceType}"], .cell[data-spell="${weaponOrSpell}"][data-dice="${diceType}"]`
        )
        .forEach((c) => {
          c.classList.remove("active");
          c.classList.remove("previous");
        });

      // Ajoute la classe active à la cellule cliquée
      cell.classList.add("active");

      // Applique la classe CSS pour les cellules précédentes
      let previous = true;
      document
        .querySelectorAll(
          `.cell[data-weapon="${weaponOrSpell}"][data-dice="${diceType}"], .cell[data-spell="${weaponOrSpell}"][data-dice="${diceType}"]`
        )
        .forEach((c) => {
          if (previous) {
            c.classList.add("previous");
          }
          if (c === cell) previous = false;
        });

      recalculerDegats();
    });
  });
}

// Initialisation des tableaux et interactions au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  const personnage = obtenirNomPersonnage();
  if (personnage) {
    genererTableauxPourPersonnage(personnage);
  } else {
    console.error("Aucun personnage actif trouvé dans le HTML.");
  }
  mettreAJourCerclesSorts();
});
