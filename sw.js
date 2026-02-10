const CACHE_NAME = 'fiscal-audit-suite-v18-master';

// Lista exata dos arquivos que compõem a aplicação + Arquivos de Lei
const ASSETS = [
    './',
    './index.html',
    './sw.js',
    // Arquivos de Legislação (Nomes exatos conforme seus uploads)
    './BENEFICIOS ISENCOES E REDUCAO.HTML',
    './CONVÊNIO ICMS N° 142, DE 14 DE DEZEMBRO DE 2018.html',
    './PIS COFINS.HTML',
    // Bibliotecas Externas (Essenciais para funcionamento offline e performance)
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// INSTALAÇÃO: Cacheia os arquivos estáticos
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força o SW a ativar imediatamente
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching Assets v18...');
            // Usa Promise.allSettled para garantir que o app instale mesmo se um link externo falhar
            return Promise.allSettled(ASSETS.map(url => cache.add(url)));
        })
    );
});

// ATIVAÇÃO: Limpa caches antigos (v16, v17...) para garantir que o usuário veja a nova versão
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

// FETCH: Estratégia Cache First (Prioriza velocidade e offline)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                // Se falhar (offline e sem cache), não retorna nada (ou poderia retornar página de erro)
            });
        })
    );
});
