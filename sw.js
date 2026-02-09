// 1. Atualize o nome da versão toda vez que mudar o index.html
const CACHE_NAME = 'fiscal-audit-v9.1-pro';

const ASSETS = [
    './',
    './index.html',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    // Adicione aqui outros ícones ou fontes se houver
];

// Instalação: Armazena os arquivos no cache
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força o SW a se tornar ativo imediatamente
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Ativação: Limpa caches de versões anteriores (v8.5, etc)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim(); // Garante que o SW controle a página imediatamente
});

// Estratégia de Busca: Tenta rede primeiro (para dados atualizados), se falhar usa cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
