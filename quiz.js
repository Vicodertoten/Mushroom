// On attend que tout le HTML soit chargé avant d'exécuter le script
document.addEventListener('DOMContentLoaded', () => {

    // --- DÉCLARATION DE TOUTES LES VARIABLES ---
    // Logique du jeu
    let allMushrooms = [];
    let currentMushroom = null;
    let quizMode = ''; // 'easy' ou 'hard'
    let score = 0;
    let questionsAnswered = 0;

    // Éléments de l'interface
    const difficultySelector = document.getElementById('difficulty-selector');
    const quizSection = document.getElementById('quiz-section');
    const answerDetailsContainer = document.getElementById('answer-details-container');
    const scoreDisplay = document.getElementById('score-display');
    
    const easyModeBtn = document.getElementById('easy-mode-btn');
    const hardModeBtn = document.getElementById('hard-mode-btn');
    const nextButton = document.getElementById('next-question-btn');

    // Éléments des modes de jeu
    const mcqOptionsContainer = document.getElementById('mcq-options');
    const textInputForm = document.getElementById('quiz-form');
    const quizInput = document.getElementById('quiz-input');
    
    // Éléments de la fiche réponse
    const feedbackBox = document.getElementById('feedback-box');
    
    // --- DÉMARRAGE ET LOGIQUE PRINCIPALE ---

    // Charger les données une seule fois au début
    fetch('champignons.json')
        .then(response => response.json())
        .then(data => {
            allMushrooms = data;
            // Ne rien faire d'autre, on attend que l'utilisateur choisisse une difficulté
        })
        .catch(error => console.error("Erreur critique lors du chargement de champignons.json", error));

    // Listeners pour démarrer le jeu
    easyModeBtn.addEventListener('click', () => startGame('easy'));
    hardModeBtn.addEventListener('click', () => startGame('hard'));
    nextButton.addEventListener('click', loadNewQuestion);
    textInputForm.addEventListener('submit', handleTextAnswer);

    // --- TOUTES LES FONCTIONS SONT MAINTENANT DÉCLARÉES À L'INTÉRIEUR ---
    
    function startGame(mode) {
        quizMode = mode;
        score = 0;
        questionsAnswered = 0;
        updateScoreDisplay();
        difficultySelector.style.display = 'none';
        scoreDisplay.style.display = 'block';
        loadNewQuestion();
    }
    
    function loadNewQuestion() {
        answerDetailsContainer.style.display = 'none';
        quizSection.style.display = 'block';

        currentMushroom = allMushrooms[Math.floor(Math.random() * allMushrooms.length)];
        
        setupCarousel(
            currentMushroom.photos,
            'quiz-carousel-track',
            'quiz-prev-btn',
            'quiz-next-btn',
            'quiz-photo-counter'
        );

        if (quizMode === 'easy') {
            mcqOptionsContainer.innerHTML = '';
            mcqOptionsContainer.style.display = 'grid';
            textInputForm.style.display = 'none';
            setupMCQOptions();
        } else { // 'hard'
            mcqOptionsContainer.style.display = 'none';
            textInputForm.style.display = 'flex';
            quizInput.value = '';
            quizInput.disabled = false;
            textInputForm.querySelector('button').disabled = false;
            quizInput.focus();
        }
    }

    function setupMCQOptions() {
        const correctOption = currentMushroom;
        let options = [correctOption];

        while (options.length < 4) {
            const randomMushroom = allMushrooms[Math.floor(Math.random() * allMushrooms.length)];
            if (!options.some(opt => opt.id === randomMushroom.id)) {
                options.push(randomMushroom);
            }
        }
        
        options.sort(() => Math.random() - 0.5);

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option.nom_francais;
            button.dataset.id = option.id;
            button.addEventListener('click', handleMCQAnswer);
            mcqOptionsContainer.appendChild(button);
        });
    }

    function handleMCQAnswer(event) {
        const selectedId = parseInt(event.target.dataset.id);
        const isCorrect = selectedId === currentMushroom.id;

        if (isCorrect) {
            score++;
        }
        questionsAnswered++;
        updateScoreDisplay();
        
        Array.from(mcqOptionsContainer.children).forEach(btn => {
            btn.disabled = true;
            if (parseInt(btn.dataset.id) === currentMushroom.id) {
                btn.classList.add('correct');
            } else if (parseInt(btn.dataset.id) === selectedId) {
                btn.classList.add('incorrect');
            }
        });
        
        // Laisser le temps à l'utilisateur de voir la correction avant d'afficher la fiche
        setTimeout(() => displayAnswerDetails(isCorrect), 600);
    }
    
    function handleTextAnswer(event) {
        event.preventDefault();
        const userInput = quizInput.value;
        const normalizedUserInput = normalizeString(userInput);
        const correctAnswers = currentMushroom.nom_francais.split(' ou ').map(name => normalizeString(name));
        const isCorrect = correctAnswers.some(answer => levenshteinDistance(normalizedUserInput, answer) <= 2);
        
        if(isCorrect) {
            score++;
        }
        questionsAnswered++;
        updateScoreDisplay();

        quizInput.disabled = true;
        textInputForm.querySelector('button').disabled = true;
        displayAnswerDetails(isCorrect);
    }

    function updateScoreDisplay() {
        scoreDisplay.textContent = `Score : ${score} / ${questionsAnswered}`;
    }

    function displayAnswerDetails(isCorrect) {
        quizSection.style.display = 'none';
        
        if (isCorrect) {
            feedbackBox.className = 'feedback-box correct';
            feedbackBox.innerHTML = `<h3>Bravo !</h3><p>La réponse était bien <b>${currentMushroom.nom_francais}</b>.</p>`;
        } else {
            feedbackBox.className = 'feedback-box incorrect';
            feedbackBox.innerHTML = `<h3>Oups !</h3><p>La bonne réponse était <b>${currentMushroom.nom_francais}</b>.</p>`;
        }

        // Remplir la fiche détaillée
        document.getElementById('mushroom-description-quiz').textContent = currentMushroom.description;
        document.getElementById('mushroom-habitat-quiz').textContent = currentMushroom.habitat;
        document.getElementById('mushroom-saison-quiz').textContent = currentMushroom.saison;

        const alertSection = document.getElementById('mushroom-alert-quiz');
        if (currentMushroom.alerte_securite) {
            alertSection.style.display = 'block';
            alertSection.innerHTML = `<h3>⚠️ Attention</h3><p>${currentMushroom.alerte_securite}</p>`;
        } else {
            alertSection.style.display = 'none';
        }

        // Initialiser le carrousel de la fiche réponse
        setupCarousel(
            currentMushroom.photos,
            'answer-carousel-track',
            'answer-prev-btn',
            'answer-next-btn',
            'answer-photo-counter'
        );

        answerDetailsContainer.style.display = 'block';
    }

    // Fonctions utilitaires
    function normalizeString(str) { return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }
    function levenshteinDistance(a, b) { const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null)); for (let i = 0; i <= a.length; i += 1) { matrix[0][i] = i; } for (let j = 0; j <= b.length; j += 1) { matrix[j][0] = j; } for (let j = 1; j <= b.length; j += 1) { for (let i = 1; i <= a.length; i += 1) { const indicator = a[i - 1] === b[j - 1] ? 0 : 1; matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator); } } return matrix[b.length][a.length]; }
    function setupCarousel(photos, trackId, prevBtnId, nextBtnId, counterId) { const track = document.getElementById(trackId); const nextBtn = document.getElementById(nextBtnId); const prevBtn = document.getElementById(prevBtnId); const counter = document.getElementById(counterId); let currentIndex = 0; if (!track || !nextBtn || !prevBtn || !counter) { return; } track.innerHTML = ''; if (!photos || photos.length === 0) { track.innerHTML = '<p>Aucune photo disponible.</p>';[nextBtn, prevBtn, counter].forEach(el => el.style.display = 'none'); return; } [nextBtn, prevBtn, counter].forEach(el => el.style.display = 'block'); photos.forEach(path => { const slide = document.createElement('div'); slide.className = 'carousel-slide'; const img = document.createElement('img'); img.src = `photos/${path}`; img.alt = `Photo`; slide.appendChild(img); track.appendChild(slide); }); const slides = Array.from(track.children); const updateCarousel = () => { track.style.transform = `translateX(-${currentIndex * 100}%)`; if (counter) counter.textContent = `${currentIndex + 1} / ${photos.length}`; if (prevBtn) prevBtn.style.display = currentIndex === 0 ? 'none' : 'block'; if (nextBtn) nextBtn.style.display = currentIndex === slides.length - 1 ? 'none' : 'block'; }; nextBtn.onclick = () => { if (currentIndex < slides.length - 1) { currentIndex++; updateCarousel(); } }; prevBtn.onclick = () => { if (currentIndex > 0) { currentIndex--; updateCarousel(); } }; updateCarousel(); }

}); // Fin du addEventListener 'DOMContentLoaded'