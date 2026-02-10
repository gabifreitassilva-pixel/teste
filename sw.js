const CACHE_NAME = 'fiscal-audit-suite-v15.0-integrated';

// Lista exata dos arquivos que compõem a aplicação + Arquivos de Lei fornecidos
const ASSETS = [
    './',
    './index.html',
    './sw.js',
    // Arquivos de Legislação fornecidos (Nomes exatos conforme print/upload)
    './BENEFICIOS ISENCOES E REDUCAO.HTML',
    './CONVÊNIO ICMS N° 142, DE 14 DE DEZEMBRO DE 2018.html',
    './PIS COFINS.HTML',
    // Bibliotecas Externas (Cache First para performance)
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching Assets...');
            // Tenta cachear todos, mas não falha se um arquivo externo der erro (fail-safe)
            return Promise.allSettled(ASSETS.map(url => cache.add(url)))
                .then(() => console.log('[Service Worker] Assets Cached'));
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Estratégia: Cache First, falling back to Network
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Fallback opcional para offline se necessário
                // return caches.match('./offline.html');
            });
        })
    );
});
