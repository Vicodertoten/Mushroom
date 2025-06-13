const CACHE_NAME = 'champi-guide-v1';

// Liste des fichiers de base de l'application à mettre en cache immédiatement.
const APP_SHELL_URLS = [
  '/',
  'index.html',
  'details.html',
  'quiz.html',
  'style.css',
  'script.js',
  'details.js',
  'quiz.js',
  'champignons.json',
  'icons/android-chrome-192x192.png'
];

// À l'installation du Service Worker, on met en cache l'App Shell.
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    console.log('Mise en cache des fichiers de base de l\'application');
    await cache.addAll(APP_SHELL_URLS);
  })());
});

// Stratégie "Cache First"
// Le Service Worker intercepte les requêtes.
self.addEventListener('fetch', event => {
  event.respondWith((async () => {
    // 1. On cherche dans le cache
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      // Si c'est en cache, on le sert directement
      return cachedResponse;
    }

    // 2. Si ce n'est pas en cache, on va sur le réseau
    const response = await fetch(event.request);
    
    // On met la nouvelle réponse en cache pour la prochaine fois
    // (Important pour les photos qui sont chargées au fur et à mesure)
    const cache = await caches.open(CACHE_NAME);
    cache.put(event.request, response.clone());
    
    // Et on retourne la réponse du réseau
    return response;
  })());
});