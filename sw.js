const CACHE_NAME = 'fiscal-audit-v13.6-final-sync';

// Lista de ativos que o teu index.html V13.6 MASTER necessita obrigatoriamente
const ASSETS = [
    './',
    './index.html',
    './auditoria.html',
    './base reduzida.html',
    './auto pecas.html',
    './pis e cofins.html',
    // Dependências críticas para o processamento de XML, ZIP e PDF que estão no INDEX
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalação: Garante que o motor de extração (PDF/ZIP) seja guardado
self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.all(
                ASSETS.map(url => {
                    return cache.add(url).catch(err => console.warn('Aviso: Ficheiro não encontrado para cache:', url));
                })
            );
        })
    );
});

// Ativação: Elimina versões antigas que conflitam com o novo INDEX
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Estratégia de Busca: Rede primeiro para garantir a extração correta, Cache como backup
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
