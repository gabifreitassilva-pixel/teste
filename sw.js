const CACHE_NAME = 'fiscal-audit-v13.6-fixed';

// Lista de ficheiros e dependências para funcionamento Offline
const ASSETS = [
    './',
    './index.html',
    './auditoria.html',
    './base reduzida.html',
    './auto pecas.html',
    './pis e cofins.html',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força a nova versão a ser aplicada imediatamente
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Mapeia cada URL para garantir que, se uma falhar, as outras sejam salvas
            return Promise.all(
                ASSETS.map(url => {
                    return cache.add(url).catch(err => console.warn('Falha ao colocar no cache (Ficheiro pode estar ausente):', url));
                })
            );
        })
    );
});

// Ativação e Limpeza de Cache antigo
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

// Interceptação de Requisições (Tenta Rede primeiro, depois Cache)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
