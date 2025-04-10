// Vérifie si des armes sont déjà enregistrées, sinon initialise une base par défaut
const defaultWeapons = [
    { name: "Arc", formula: "x * 5 + 30" },
    { name: "Épée", formula: "x * 3 + 20" }
];

function loadWeapons() {
    return JSON.parse(localStorage.getItem("weapons")) || defaultWeapons;
}

function saveWeapons(weapons) {
    localStorage.setItem("weapons", JSON.stringify(weapons));
}

// Charger les armes au démarrage
let weapons = loadWeapons();