document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("gestion-form");

  // Ajouter une nouvelle arme
  const armesContainer = document.getElementById("armes-container");
  const sortsContainer = document.getElementById("sorts-container");

  function ajouterArme() {
    const armeDiv = document.createElement("div");
    armeDiv.classList.add("arme");
    armeDiv.innerHTML = `
      <label>Nom de l'arme :</label>
      <input type="text" name="arme-nom[]" placeholder="Ex : Arc long" />
      <label>Dégâts :</label>
      <input type="text" name="arme-degats[]" placeholder="Ex : 4D20+2D12" />
    `;
    armesContainer.appendChild(armeDiv);
  }

  function ajouterSort() {
    const sortDiv = document.createElement("div");
    sortDiv.classList.add("sort");
    sortDiv.innerHTML = `
      <label>Nom du sort :</label>
      <input type="text" name="sort-nom[]" placeholder="Ex : Boule de feu" />
      <label>Dégâts :</label>
      <input type="text" name="sort-degats[]" placeholder="Ex : 4D6+25" />
    `;
    sortsContainer.appendChild(sortDiv);
  }

  // Charger les données existantes pour un personnage
  function chargerDonnees(personnage) {
    const data = JSON.parse(localStorage.getItem(personnage)) || { armes: [], sorts: [] };

    // Réinitialiser les conteneurs
    armesContainer.innerHTML = "";
    sortsContainer.innerHTML = "";

    // Charger les armes
    data.armes.forEach((arme) => {
      const armeDiv = document.createElement("div");
      armeDiv.classList.add("arme");
      armeDiv.innerHTML = `
        <label>Nom de l'arme :</label>
        <input type="text" name="arme-nom[]" value="${arme.nom}" />
        <label>Dégâts :</label>
        <input type="text" name="arme-degats[]" value="${arme.degats}" />
      `;
      armesContainer.appendChild(armeDiv);
    });

    // Charger les sorts
    data.sorts.forEach((sort) => {
      const sortDiv = document.createElement("div");
      sortDiv.classList.add("sort");
      sortDiv.innerHTML = `
        <label>Nom du sort :</label>
        <input type="text" name="sort-nom[]" value="${sort.nom}" />
        <label>Dégâts :</label>
        <input type="text" name="sort-degats[]" value="${sort.degats}" />
      `;
      sortsContainer.appendChild(sortDiv);
    });
  }

  // Sauvegarder les données
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const personnage = document.getElementById("character").value;

    // Récupérer les armes
    const armes = Array.from(document.querySelectorAll(".arme")).map((arme) => ({
      nom: arme.querySelector('input[name="arme-nom[]"]').value,
      degats: arme.querySelector('input[name="arme-degats[]"]').value,
    }));

    // Récupérer les sorts
    const sorts = Array.from(document.querySelectorAll(".sort")).map((sort) => ({
      nom: sort.querySelector('input[name="sort-nom[]"]').value,
      degats: sort.querySelector('input[name="sort-degats[]"]').value,
    }));

    // Sauvegarder dans le localStorage
    const data = { armes, sorts };
    localStorage.setItem(personnage, JSON.stringify(data));

    alert(`Données enregistrées pour ${personnage}`);
  });

  // Charger les données lorsque le personnage change
  document.getElementById("character").addEventListener("change", (event) => {
    chargerDonnees(event.target.value);
  });

  // Charger les données pour le personnage sélectionné par défaut
  chargerDonnees(document.getElementById("character").value);
});
