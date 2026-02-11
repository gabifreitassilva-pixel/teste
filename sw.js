const CACHE_NAME = 'fiscal-audit-v16.2-integrated';

// Lista de arquivos e bibliotecas para funcionamento offline
const ASSETS = [
    './',
    './index.html',
    './sw.js',
    // Arquivos de Legislação (Devem estar na mesma pasta)
    './BENEFICIOS ISENCOES E REDUCAO.HTML',
    './CONVÊNIO ICMS N° 142, DE 14 DE DEZEMBRO DE 2018.html',
    './PIS COFINS.HTML',
    // Bibliotecas Externas (Cache First)
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Fazendo cache da Versão 16.2');
            // addAllSettled garante que o cache continue mesmo se um link falhar
            return Promise.allSettled(ASSETS.map(url => cache.add(url)))
                .then(() => console.log('[Service Worker] Ativos armazenados com sucesso.'));
        })
    );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

// Estratégia de Fetch: Cache First -> Falling back to Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Se o arquivo estiver no cache (offline), usa ele. Caso contrário, vai na internet.
            return response || fetch(event.request).then((fetchRes) => {
                return fetchRes;
            }).catch(() => {
                // Fallback para navegação: se estiver offline e tentar carregar uma página, mostra o index
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
