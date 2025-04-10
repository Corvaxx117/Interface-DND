// Définition des formules de dégâts pour chaque arme et sort
export const calculs = {
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

// Limites de sorts par personnage
export const sortsMax = {
  Aodhan: 6,
  Mival: 5,
  Pavel: 4,
  Thorek: 5,
  Zinok: 6,
};
