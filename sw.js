const CACHE_NAME = 'fiscal-audit-v11-5';

// Lista de arquivos e dependências para cache
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    // Bibliotecas Externas (CDNs)
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    // Arquivos de Legislação (Certifique-se que os nomes estão corretos)
    './auto pecas.html',
    './Produtos alimenticios.html',
    './Perfumaria e higiene pessoal.html',
    './bebidas alcolicas exceto cerveja e chope.html',
    './cimentos.html',
    './pis e cofins.html'
];

// Instalação do Service Worker e Cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Cache Fiscal Audit aberto');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Ativação e limpeza de caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Interceptação de requisições (Cache First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // Retorna o arquivo do cache ou faz a requisição na rede
            return response || fetch(event.request);
        })
    );
});
