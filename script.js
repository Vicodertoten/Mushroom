document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('mushroom-gallery');
    let allMushrooms = [];

    fetch('champignons.json')
        .then(response => response.json())
        .then(data => {
            allMushrooms = data;
            displayMushrooms(allMushrooms);
        })
        .catch(error => {
            console.error('Erreur de chargement du fichier JSON:', error);
            gallery.innerHTML = "<p>Impossible de charger les données des champignons.</p>";
        });

    function displayMushrooms(mushrooms) {
        gallery.innerHTML = ''; 
        mushrooms.forEach(mushroom => {
            const card = document.createElement('div');
            card.className = 'mushroom-card';
            
            card.addEventListener('click', () => {
                window.location.href = `details.html?id=${mushroom.id}`;
            });

            // S'assure qu'il y a au moins une photo avant d'essayer de l'afficher
            const imagePath = mushroom.photos && mushroom.photos.length > 0 ? mushroom.photos[0] : '';

            card.innerHTML = `
                <img src="${imagePath ? `photos/${imagePath}` : ''}" alt="${mushroom.nom_francais}">
                <h2>${mushroom.nom_francais}</h2>
            `;
            gallery.appendChild(card);
        });
    }

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredMushrooms = allMushrooms.filter(mushroom => {
            return mushroom.nom_francais.toLowerCase().includes(searchTerm);
        });
        displayMushrooms(filteredMushrooms);
    });

    // --- CORRECTION AJOUTÉE ICI ---
    // Force la page à se positionner en haut après le chargement.
    window.scrollTo(0, 0);

}); // Fin du addEventListener 'DOMContentLoaded'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker enregistré avec succès ! Scope:', registration.scope);
      })
      .catch(error => {
        console.log('Échec de l\'enregistrement du Service Worker:', error);
      });
  });
}