const CACHE_NAME = 'fiscal-audit-v16.3-integrated';

// Lista de ativos para cache
const ASSETS = [
    './',
    './index.html',
    './sw.js',
    // Arquivos de Legislação
    './BENEFICIOS ISENCOES E REDUCAO.HTML',
    './CONVÊNIO ICMS N° 142, DE 14 DE DEZEMBRO DE 2018.html',
    './PIS COFINS.HTML',
    // Bibliotecas Externas
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalação: Força a atualização imediata
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Atualizando para V16.3...');
            return Promise.allSettled(ASSETS.map(url => cache.add(url)));
        })
    );
});

// Ativação: Remove o cache antigo v16.0 e libera espaço
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

// Estratégia: Cache First, falling back to Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchRes) => {
                return fetchRes;
            }).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
