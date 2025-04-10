document.addEventListener("mousemove", function (e) {
  let x = (e.clientX / window.innerWidth) * 100;
  let y = (e.clientY / window.innerHeight) * 100;

  document.documentElement.style.setProperty("--mouse-x", x + "%");
  document.documentElement.style.setProperty("--mouse-y", y + "%");
});

// Définition des formules de dégâts pour chaque arme
const calculs = {
  arc: (values) => {
    const d20 = values["D20"] || 0;
    const d12 = values["D12"] || 0;
    return d20 * 4 + d12 * 2; // 4D20 + 2D12
  },
  epee: (values) => {
    const d10 = values["D10"] || 0;
    return d10 * 3 + 20; // 3D10 + 20
  },
  "boule-de-feu": (values) => {
    const d6 = values["D6"] || 0;
    return d6 * 4 + 25; // 4D6 + 25
  },
};

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

// Fonction pour récupérer le nom du personnage à partir du nav actif
function obtenirNomPersonnage() {
  const navActif = document.querySelector("nav a.visited");
  return navActif ? navActif.textContent.trim() : null;
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
  const personnage = normaliserNomPersonnage(obtenirNomPersonnage());
  if (!sortsMax[personnage]) return; // Vérifie que le personnage existe dans sortsMax

  sortsUtilises = restaurerSortsUtilises(personnage); // Restaure le compteur depuis le local storage

  const sortsContainer = document.getElementById("sorts-container");
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
  document.getElementById(
    "sorts-restants"
  ).textContent = `Sorts restants : ${sortsRestants}`;

  // Désactive ou réactive les cellules de sorts en fonction des sorts restants
  if (sortsRestants === 0) {
    desactiverToutesLesCellulesDeSorts();
  } else {
    reactiverToutesLesCellulesDeSorts();
  }
}

// Initialisation des cercles des sorts au chargement de la page
document.addEventListener("DOMContentLoaded", () => {
  mettreAJourCerclesSorts();
});

// Sélection de toutes les cellules cliquables
document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", () => {
    const weaponOrSpell =
      cell.getAttribute("data-weapon") || cell.getAttribute("data-spell"); // Récupère l'arme ou le sort
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
      document.getElementById(`result-${weaponOrSpell}`).textContent =
        "Dégâts : 0";

      // Recalcule les dégâts pour toutes les cellules actives restantes
      const activeValuesByWeaponOrSpell = {};

      document.querySelectorAll(".cell.active").forEach((activeCell) => {
        const activeWeaponOrSpell =
          activeCell.getAttribute("data-weapon") ||
          activeCell.getAttribute("data-spell");
        const activeDiceType = activeCell.getAttribute("data-dice");
        const activeValue = parseInt(activeCell.textContent, 10);

        if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell]) {
          activeValuesByWeaponOrSpell[activeWeaponOrSpell] = {};
        }

        if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType]) {
          activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] = 0;
        }

        activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] +=
          activeValue;
      });

      // Calcule les dégâts totaux pour chaque arme ou sort
      for (const [weaponOrSpell, diceValues] of Object.entries(
        activeValuesByWeaponOrSpell
      )) {
        const result = calculs[weaponOrSpell](diceValues);

        // Met à jour le résultat individuel
        document.getElementById(
          `result-${weaponOrSpell}`
        ).textContent = `Dégâts : ${result}`;

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
        activeCell.getAttribute("data-weapon") ||
        activeCell.getAttribute("data-spell");
      const activeDiceType = activeCell.getAttribute("data-dice");
      const activeValue = parseInt(activeCell.textContent, 10);

      if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell]) {
        activeValuesByWeaponOrSpell[activeWeaponOrSpell] = {};
      }

      if (!activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType]) {
        activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] = 0;
      }

      activeValuesByWeaponOrSpell[activeWeaponOrSpell][activeDiceType] +=
        activeValue;
    });

    // Calcule les dégâts totaux pour chaque arme ou sort
    for (const [weaponOrSpell, diceValues] of Object.entries(
      activeValuesByWeaponOrSpell
    )) {
      const result = calculs[weaponOrSpell](diceValues);

      // Met à jour le résultat individuel
      document.getElementById(
        `result-${weaponOrSpell}`
      ).textContent = `Dégâts : ${result}`;

      // Ajoute au total général
      totalDegats += result;
    }

    // Met à jour le footer avec le nouveau total
    document.getElementById("resultat").textContent = totalDegats;
  });
});

// Modification de l'écouteur pour les sorts
document.querySelectorAll(".cell[data-spell]").forEach((cell) => {
  cell.addEventListener("click", () => {
    const personnage = normaliserNomPersonnage(obtenirNomPersonnage());
    if (!sortsMax[personnage]) return; // Vérifie que le personnage existe dans sortsMax

    if (!verifierLimiteSorts(personnage)) return; // Empêche l'exécution si la limite est atteinte

    sortsUtilises++; // Incrémente le compteur de sorts utilisés
    sauvegarderSortsUtilises(personnage); // Sauvegarde dans le local storage

    // Met à jour les cercles des sorts
    mettreAJourCerclesSorts();
  });
});

// Gestion du bouton "Coup critique"
document.getElementById("critique-btn").addEventListener("click", () => {
  const critiqueBtn = document.getElementById("critique-btn");
  const isActive = critiqueBtn.classList.contains("active");

  if (isActive) {
    // Désactive l'effet du coup critique
    critiqueBtn.classList.remove("active");

    // Met à jour le footer avec le total normal
    document.getElementById("resultat").textContent = totalDegats;
  } else {
    // Active l'effet du coup critique
    critiqueBtn.classList.add("active");

    // Multiplie le total des dégâts par deux pour le coup critique
    const critiqueTotal = totalDegats * 2;

    // Met à jour le footer avec le total critique
    document.getElementById("resultat").textContent = critiqueTotal;
  }
});

// Gestion du bouton "Réinitialiser"
document.getElementById("reset-btn").addEventListener("click", () => {
  // Réinitialise toutes les cellules
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("active");
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
  if (!sortsMax[personnage]) return; // Vérifie que le personnage existe dans sortsMax

  sortsUtilises = 0; // Réinitialise le compteur de sorts utilisés pour ce personnage
  sauvegarderSortsUtilises(personnage); // Sauvegarde dans le local storage
  mettreAJourCerclesSorts(); // Met à jour les cercles des sorts
});
