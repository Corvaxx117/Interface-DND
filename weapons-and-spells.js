let armesForce = []; // Stocker les armes de force
let armesDexterite = []; // Stocker les armes de dextérité
let sorts = []; // Stocker les sorts

// Caractéristiques des personnages
export const caracteristiquesPersonnages = {
  Aodhan: { force: -10, dexterite: 20 },
  Mival: { force: 0, dexterite: 30 },
  Pavel: { force: 30, dexterite: 10 },
  Thorek: { force: 40, dexterite: 20 },
  Zinok: { force: -10, dexterite: 30 },
};

// Charger les armes de force depuis le fichier JSON
export async function chargerArmesForce() {
  try {
    const response = await fetch("data/armes-force.json");
    if (!response.ok) {
      console.error("Erreur lors du chargement des armes de force :", response.statusText);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des armes de force :", error);
    return [];
  }
}

// Charger les armes de dextérité depuis le fichier JSON
export async function chargerArmesDexterite() {
  try {
    const response = await fetch("data/armes-dexterite.json");
    if (!response.ok) {
      console.error("Erreur lors du chargement des armes de dextérité :", response.statusText);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des armes de dextérité :", error);
    return [];
  }
}

// Charger les sorts depuis le fichier JSON
export async function chargerSorts() {
  try {
    const response = await fetch("data/sorts.json");
    if (!response.ok) {
      console.error("Erreur lors du chargement des sorts :", response.statusText);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error("Erreur lors du chargement des sorts :", error);
    return [];
  }
}

// Fonction pour récupérer les armes et sorts d'un personnage
export function getArmesEtSortsPourPersonnage(personnage) {
  const personnagesArmesEtSorts = {
    Aodhan: {
      armes: ["rapiere-commune", "belier", "lame-de-feu", "hachette-elfe"],
      sorts: ["boule-de-feu"],
    },
    Mival: { armes: ["arc-long-de-chasse", "glaive-elfe"], sorts: ["boule-de-feu"] },
    Pavel: {
      armes: [
        "epee-longue-commune",
        "javeline-commune",
        "lanced-arcon-percemonts",
        "arbalete-lourde-commune",
      ],
      sorts: [],
    },
    Thorek: {
      armes: [
        "hache-berserker",
        "epee-longue-commune",
        "hachette-commune",
        "arc-long-commun",
        "bombe-incendiaire",
      ],
      sorts: [],
    },
    Zinok: {
      armes: ["rapiere-fine", "dague-de-cuivre", "arbalete-de-poing-elfe"],
      sorts: ["boule-de-feu"],
    },
  };

  return personnagesArmesEtSorts[personnage] || { armes: [], sorts: [] };
}

// Fonction pour mettre à jour dynamiquement les caractéristiques des personnages dans leurs fichiers HTML
export function mettreAJourCaracteristiquesHTML() {
  Object.entries(caracteristiquesPersonnages).forEach(([personnage, stats]) => {
    const forceElement = document.querySelector(`#${personnage.toLowerCase()}-force`);
    const dexteriteElement = document.querySelector(`#${personnage.toLowerCase()}-dexterite`);

    if (forceElement) {
      forceElement.textContent = `Force : ${stats.force}`;
    }
    if (dexteriteElement) {
      dexteriteElement.textContent = `Dextérité : ${stats.dexterite}`;
    }
  });
}

// Appeler la fonction après le chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  mettreAJourCaracteristiquesHTML();
});
