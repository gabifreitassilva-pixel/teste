const CACHE_NAME = 'fiscal-audit-v13-6-fixed';

// Lista de ficheiros essenciais
const ASSETS = [
    './',
    './index.html',
    './auditoria.html',
    './base reduzida.html',
    './auto pecas.html',
    './pis e cofins.html'
];

// Instalação
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força o novo SW a assumir o controlo imediatamente
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Usamos map e catch para que, se um ficheiro falhar, o SW não morra
            return Promise.all(
                ASSETS.map(url => {
                    return cache.add(url).catch(err => console.warn('Falha ao cachear:', url, err));
                })
            );
        })
    );
});

// Ativação (Limpeza de caches velhos)
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

// Estratégia: Tenta rede, se falhar usa cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
