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

// Sélection de toutes les cellules cliquables
document.querySelectorAll(".cell").forEach((cell) => {
  cell.addEventListener("click", () => {
    const weaponOrSpell = cell.getAttribute("data-weapon") || cell.getAttribute("data-spell"); // Récupère l'arme ou le sort
    const diceType = cell.getAttribute("data-dice"); // Récupère le type de dé (ex: D20, D12)
    const value = parseInt(cell.textContent, 10); // Récupère la valeur de la cellule

    // Réinitialise les styles des cellules pour le même type de dé
    document
      .querySelectorAll(`.cell[data-weapon="${weaponOrSpell}"][data-dice="${diceType}"], .cell[data-spell="${weaponOrSpell}"][data-dice="${diceType}"]`)
      .forEach((c) => {
        c.classList.remove("active");
        c.style.backgroundColor = ""; // Réinitialise le background-color
      });

    // Ajoute la classe active à la cellule cliquée
    cell.classList.add("active");
    cell.style.backgroundColor = "#D2B681"; // Couleur spécifique pour la cellule active

    // Applique un background-color à toutes les cellules précédentes
    let previous = true;
    document
      .querySelectorAll(`.cell[data-weapon="${weaponOrSpell}"][data-dice="${diceType}"], .cell[data-spell="${weaponOrSpell}"][data-dice="${diceType}"]`)
      .forEach((c) => {
        if (previous) {
          c.style.backgroundColor = "#F4E9D3"; // Couleur pour les cellules précédentes
        }
        if (c === cell) previous = false;
      });

    // Réinitialise la somme des dégâts
    totalDegats = 0;

    // Recalcule les dégâts pour toutes les cellules actives
    const activeValuesByWeaponOrSpell = {};

    document.querySelectorAll(".cell.active").forEach((activeCell) => {
      const activeWeaponOrSpell = activeCell.getAttribute("data-weapon") || activeCell.getAttribute("data-spell");
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

// Gestion du bouton "Coup critique"
document.getElementById("critique-btn").addEventListener("click", () => {
  // Multiplie le total des dégâts par deux pour le coup critique
  const critiqueTotal = totalDegats * 2;

  // Met à jour le footer avec le total critique
  document.getElementById("resultat").textContent = critiqueTotal;
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

  // Réinitialise la variable globale
  totalDegats = 0;
});
