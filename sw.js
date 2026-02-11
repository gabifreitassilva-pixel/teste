const CACHE_NAME = 'fiscal-audit-suite-v16.1-integrated';

// Lista de ativos para cache (incluindo legislação e bibliotecas externas)
const ASSETS = [
    './',
    './index.html',
    './sw.js',
    // Arquivos de Legislação
    './BENEFICIOS ISENCOES E REDUCAO.HTML',
    './CONVÊNIO ICMS N° 142, DE 14 DE DEZEMBRO DE 2018.html',
    './PIS COFINS.HTML',
    // Bibliotecas Externas para funcionamento Offline
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalação: Salva os arquivos no cache
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Aplicando Cache V16...');
            // Promise.allSettled evita que falhas em um arquivo bloqueiem o sistema todo
            return Promise.allSettled(ASSETS.map(url => cache.add(url)))
                .then(() => console.log('[Service Worker] Cache concluído com sucesso.'));
        })
    );
});

// Ativação: Limpa versões antigas de cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

// Estratégia de busca: Tenta o Cache primeiro, depois a Rede
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).then((fetchRes) => {
                return fetchRes;
            }).catch(() => {
                // Se a rede falhar e for uma navegação de página, retorna o index
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});

