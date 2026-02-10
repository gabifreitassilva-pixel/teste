const CACHE_NAME = 'fiscal-audit-suite-v17-final';

// Lista exata dos arquivos que compõem a aplicação + Arquivos de Lei fornecidos
const ASSETS = [
    './',
    './index.html',
    './sw.js',
    // Arquivos de Legislação (Nomes exatos conforme seus uploads)
    './BENEFICIOS ISENCOES E REDUCAO.HTML',
    './CONVÊNIO ICMS N° 142, DE 14 DE DEZEMBRO DE 2018.html',
    './PIS COFINS.HTML',
    // Bibliotecas Externas (Essenciais para o funcionamento offline)
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

self.addEventListener('install', (event) => {
    // Força o SW a assumir o controle imediatamente
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching Assets v17...');
            // Usa Promise.allSettled para não travar se um arquivo externo falhar
            return Promise.allSettled(ASSETS.map(url => cache.add(url)))
                .then(() => console.log('[Service Worker] Assets Cached'));
        })
    );
});

self.addEventListener('activate', (event) => {
    // Limpa caches antigos (v14, v15, v16...) para liberar espaço e garantir atualização
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Estratégia: Cache First (Tenta o cache, se falhar vai para rede)
    // Isso garante que o app funcione rápido e offline
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Se estiver offline e não tiver no cache, não faz nada (ou poderia retornar uma página de erro)
                // console.log('Offline: ', event.request.url);
            });
        })
    );
});
