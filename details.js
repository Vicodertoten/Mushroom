document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const mushroomId = parseInt(params.get('id'));

    if (!mushroomId) {
        document.getElementById('mushroom-name').textContent = 'Champignon non trouvé';
        return;
    }

    fetch('champignons.json')
        .then(response => response.json())
        .then(allMushrooms => {
            const mushroom = allMushrooms.find(m => m.id === mushroomId);
            if (mushroom) {
                displayMushroomDetails(mushroom);
            } else {
                document.getElementById('mushroom-name').textContent = 'Champignon non trouvé';
            }
        })
        .catch(error => console.error('Erreur de chargement du fichier JSON:', error));
});

function displayMushroomDetails(mushroom) {
    document.title = mushroom.nom_francais;
    document.getElementById('mushroom-name').textContent = mushroom.nom_francais;
    document.getElementById('mushroom-scientific-name').textContent = mushroom.nom_scientifique;
    document.getElementById('mushroom-description').textContent = mushroom.description;
    document.getElementById('mushroom-habitat').textContent = mushroom.habitat;
    document.getElementById('mushroom-saison').textContent = mushroom.saison;

    const alertSection = document.getElementById('mushroom-alert');
    if (mushroom.alerte_securite) {
        alertSection.style.display = 'block';
        alertSection.innerHTML = `<h3>⚠️ Attention</h3><p>${mushroom.alerte_securite}</p>`;
    } else {
        alertSection.style.display = 'none';
    }
    
    setupCarousel(
        mushroom.photos,
        'details-carousel-track',
        'details-prev-btn',
        'details-next-btn',
        'details-photo-counter'
    );
}

function setupCarousel(photos, trackId, prevBtnId, nextBtnId, counterId) {
    const track = document.getElementById(trackId);
    const nextBtn = document.getElementById(nextBtnId);
    const prevBtn = document.getElementById(prevBtnId);
    const counter = document.getElementById(counterId);
    let currentIndex = 0;
    
    if (!track || !nextBtn || !prevBtn || !counter) {
        console.error("Un ou plusieurs éléments du carrousel sont introuvables.");
        return;
    }
    
    track.innerHTML = '';
    if (!photos || photos.length === 0) {
        track.innerHTML = '<p>Aucune photo disponible.</p>';
        [nextBtn, prevBtn, counter].forEach(el => el.style.display = 'none');
        return;
    }
    
    [nextBtn, prevBtn, counter].forEach(el => el.style.display = 'block');
    
    // --- CORRECTION CI-DESSOUS ---
    photos.forEach(path => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';

        const img = document.createElement('img');
        img.src = `photos/${path}`;
        img.alt = `Photo`;

        slide.appendChild(img);
        track.appendChild(slide);
    });
    // --- FIN DE LA CORRECTION ---
    
    const slides = Array.from(track.children);
    
    const updateCarousel = () => {
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        if (counter) counter.textContent = `${currentIndex + 1} / ${photos.length}`;
        if (prevBtn) prevBtn.style.display = currentIndex === 0 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = currentIndex === slides.length - 1 ? 'none' : 'block';
    };

    nextBtn.onclick = () => { if (currentIndex < slides.length - 1) { currentIndex++; updateCarousel(); } };
    prevBtn.onclick = () => { if (currentIndex > 0) { currentIndex--; updateCarousel(); } };

    updateCarousel();
}